import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { FEE_STATUS, NOTIFICATION, NOTIFICATION_SUBJECT, REGISTER_STATUS } from 'src/constants';
import { Role } from 'src/databases/entities/role.entity';
import { User } from 'src/databases/entities/user.entity';
import { UserToken } from 'src/databases/entities/userToken.entity';
import { ZaloAccount } from 'src/databases/entities/ZaloAccount.entity';
// import { forgotPasswordInput, newUserInput, sendAccountVerificationInput, sendNotifyUserApprovalInput, sendNotifyUserRejectionInput } from 'src/mail-bulk/mail_bulk.input';
// import { MailBulkService } from 'src/mail-bulk/mail-bulk.service';
import { MESSAGE } from 'src/messageError';
import { Repository } from 'typeorm';

import { MailService } from '../mail/mail.service';
import { AuthPayload } from './auth-payload.interface';
import { listAccount } from './constants/listAccount';
import { RequestContext } from './decorators/request-context.dto';
import { AuthTokenOutput, saveTokenCodeDto, UserAccessTokenClaims } from './dto/auth-token-output.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SaveTokenDto } from './dto/save-token.dto';
import { forgetPassDto, reSendCodeDto, SigninDto, SigninUserDto } from './dto/sign-in.dto';
import { approveIdentityDto, confirmationInput, rejectIdentityDto, resetPassword, SignupAdminDto, SignupDto } from './dto/sign-up.dto';
import { ZaloService } from './zalo.service';

const moment = require('moment');
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserToken)
    private userTokenRepository: Repository<UserToken>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(ZaloAccount)
    private zaloAccountRepository: Repository<ZaloAccount>,
    private mailService: MailService,
    public zaloService: ZaloService,
  ) { }

  // private readonly _server: OAuth2Server;

  // get server(): OAuth2Server {
  //   return this._server;
  // }
  //function hash password
  async hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
  }

  async saveTokenDevice(data: SaveTokenDto) {
    const { userId, token, expired } = data;

    const listUserTokenOld = await this.userTokenRepository.find({ userId: userId });
    // for (const element of listUserTokenOld.list) {
    //   element.isActive = 0;
    //   await element.save();
    // }
    const newUserToken = await this.userTokenRepository.create({
      userId,
      token,
      expired,
      isActive: 1
    });
    await newUserToken.save();
  }

  async checkPhoneNumber(phoneNumber: string) {
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (vnf_regex.test(phoneNumber) == false) { return false }
    else return true;
  }

  async checkEmail(email: string) {
    const filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(email) == false) { return false }
    else return true;
  }
  async verificationCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return code;
  }

  //create user
  async createUser(input: SignupDto) {

    const findUserByIdentity = await this.userRepository.findOne({
      identity: input.identity,
      //isActive: 1
    });
    const findUserByEmail = await this.userRepository.findOne({
      email: input.email,
      //isActive: 1
    });
    const findUserByPhoneNumber = await this.userRepository.findOne({
      phoneNumber: input.phoneNumber,
      //isActive: 1
    });
    const findUserByUserName = await this.userRepository.findOne({
      userName: input.userName,
      //isActive: 1
    });
    if (findUserByIdentity)
      throw new BadRequestException(MESSAGE.identity_already_exist);
    if (findUserByEmail)
      throw new BadRequestException(MESSAGE.email_already_exist)
    if (findUserByPhoneNumber)
      throw new BadRequestException(MESSAGE.phonenumber_already_exist);
    if (await this.checkPhoneNumber(input.phoneNumber) === false) {
      throw new BadRequestException(MESSAGE.phoneNumber_is_not_format);
    }
    if (findUserByUserName) {
      throw new BadRequestException("Username đã tồn tại!");
    }

    if (await this.checkEmail(input.email) === false) {
      throw new BadRequestException(MESSAGE.email_is_not_format);
    }
    //try {
    const newUser = await this.userRepository.create(input);
    newUser.passWord = await this.hashPassword(input.passWord);
    newUser.isActive = 1;
    // newUser.id = randomUUID(); // Để TypeORM tự động tạo UUID

    // Thêm các field mới
    if (input.cumKhuCnId) {
      newUser.cumKhuCnId = input.cumKhuCnId;
    }
    if (input.xaPhuongId) {
      newUser.xaPhuongId = input.xaPhuongId;
    }
    if (input.organizationId) {
      newUser.organizationId = input.organizationId;
    }

    try {
      const savedUser = await newUser.save();

      // 🆕 NEW: Xử lý liên kết với Zalo Account nếu có
      if (input.zaloAccountId) {
        try {
          await this.linkUserWithZaloAccount(savedUser.id, input.zaloAccountId);
        } catch (zaloError) {
          // Log error nhưng không fail toàn bộ registration
          console.error(`❌ Lỗi liên kết Zalo Account ${input.zaloAccountId} với User ${savedUser.id}:`, zaloError.message);
        }
      }

      return savedUser;
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra khi tạo user');
    }
  }


  async getActiveUserToken(id: string, role?): Promise<UserToken> | null {
    const activeUser = await this.userTokenRepository.findOne({
      userId: id,
      isActive: 1
    });
    // query.where('ut.userId = :id', { id });

    // query.andWhere('ut.isActive = 1');
    return activeUser;
  }

  //function compare password param with user password in database
  async comparePassword(password: string, storePasswordHash: string): Promise<boolean> {
    return await compare(password, storePasswordHash);
  }
  async login(input: SigninUserDto) {
    const { identity, passWord } = input;
    const checkLogin = 0;
    const role = await this.roleRepository.findOne({ name: 'STUDENT' });
    const user = await this.userRepository.findOne({
      identity: input.identity,
      roleId: role.id
    });

    if (!user) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }

    // ⭐ Kiểm tra tài khoản đã bị khóa chưa
    if (user.isActive == 0) {
      throw new BadRequestException('Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. Vui lòng liên hệ quản trị viên.');
    }

    const comparePassword = await this.comparePassword(passWord, user.passWord);
    if (!comparePassword) {
      // ⭐ Tăng số lần đăng nhập sai
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLoginAt = new Date();

      // ⭐ Nếu đăng nhập sai >= 5 lần → khóa tài khoản
      if (user.failedLoginAttempts >= 5) {
        user.isActive = 0;
        await user.save();
        throw new BadRequestException('Tài khoản đã bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng liên hệ quản trị viên để mở khóa.');
      }

      await user.save();
      throw new BadRequestException(`Mật khẩu không đúng. Bạn còn ${5 - user.failedLoginAttempts} lần thử.`);
    }

    // ⭐ Đăng nhập thành công → Reset số lần đăng nhập sai
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lastFailedLoginAt = null;
      await user.save();
    }

    const roleString = role.name;
    const payload: AuthPayload = {
      id: user.id,
      userName: user.userName,
      identity: identity,
      role: roleString
    };
    const subject = { sub: user.id };

    //delete user.passWord;

    const authToken = {

      refreshToken: this.jwtService.sign(subject, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRED_TOKEN_AFTER
      }),
      accessToken: this.jwtService.sign(
        {
          ...payload,
          ...subject
        },
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRED_TOKEN_AFTER
        }
      ),
      user: { ...user, check: checkLogin }
    };
    const dataToken = {
      userId: user.id,
      token: authToken.accessToken,
      expired: moment(new Date()).add(process.env.JWT_EXPIRED_TOKEN_AFTER, 'milliseconds').format('x'),
      isActive: 1
    };
    //await this.saveTokenDevice(dataToken);

    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true
    });
  }

  async reSendCode(input: reSendCodeDto) {


    const findUserByEmail = await this.userRepository.findOne({
      email: input.email
    })

    if (!findUserByEmail) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }
    await findUserByEmail.save();
    return { status: 200, message: "success" }
  }

  async loginAdmin(input: SigninDto) {
    const { userName, passWord } = input;
    console.log(input);

    const user = await this.userRepository.findOne({
      userName: input.userName
    });

    if (!user) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }

    // ⭐ Kiểm tra tài khoản đã bị khóa chưa
    if (user.isActive == 0) {
      throw new BadRequestException('Tài khoản đã bị khóa do nhập sai mật khẩu quá nhiều lần. Vui lòng liên hệ quản trị viên.');
    }

    const comparePassword = await this.comparePassword(passWord, user.passWord);
    if (!comparePassword) {
      // ⭐ Tăng số lần đăng nhập sai
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      user.lastFailedLoginAt = new Date();

      // ⭐ Nếu đăng nhập sai >= 5 lần → khóa tài khoản
      if (user.failedLoginAttempts >= 5) {
        user.isActive = 0;
        await user.save();
        throw new BadRequestException('Tài khoản đã bị khóa do nhập sai mật khẩu quá 5 lần. Vui lòng liên hệ quản trị viên để mở khóa.');
      }

      await user.save();
      throw new BadRequestException(`Mật khẩu không đúng. Bạn còn ${5 - user.failedLoginAttempts} lần thử.`);
    }

    // ⭐ Đăng nhập thành công → Reset số lần đăng nhập sai
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lastFailedLoginAt = null;
      await user.save();
    }

    //const role = await this.roleRepository.findOne(user.roleId);
    const role = await this.roleRepository.findOne({ id: user.roleId });
    const roleString = role.name;
    // permissions được encode trong JWT payload, web client sẽ decode để sử dụng
    const payload: AuthPayload = {
      id: user.id,
      userName: userName,
      identity: user.identity,
      role: roleString,
      // permissions: role.permissions // ✅ Đưa vào JWT thay vì response
    };
    const subject = { sub: user.id };
    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        secret: process.env.JWT_SECRET_KEY,
        expiresIn: process.env.JWT_EXPIRED_TOKEN_AFTER
      }),
      accessToken: this.jwtService.sign(
        {
          ...payload,
          ...subject
        },
        {
          expiresIn: process.env.JWT_REFRESH_EXPIRED_TOKEN_AFTER
        }
      )
      // ✅ Bỏ user info - web client sẽ decode JWT để lấy thông tin cần thiết
    };
    const dataToken = {
      userId: user.id,
      token: authToken.accessToken,
      expired: moment(new Date()).add(process.env.JWT_EXPIRED_TOKEN_AFTER, 'milliseconds').format('x'),
      isActive: 1
    };
    //await this.saveTokenDevice(dataToken);

    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true
    });
  }

  async decodeToken(token: string) {
    try {
      // Kiểm tra token có tồn tại không
      if (!token || token.trim() === '') {
        return null;
      }

      const decoded = this.jwtService.decode(token);

      // Kiểm tra decoded payload có hợp lệ không
      if (!decoded || typeof decoded !== 'object') {
        return null;
      }

      return decoded;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  async refreshToken(ctx: RequestContext): Promise<AuthTokenOutput> {
    let user;
    if (ctx.user.id) {
      user = await this.userRepository.findOne(ctx.user.id);
    }
    if (!user) {
      throw new BadRequestException(MESSAGE.invalid_user_id);
    }
    return this.getAuthToken(ctx, user);
  }

  async getAuthToken(ctx: RequestContext, user: UserAccessTokenClaims): Promise<AuthTokenOutput> {
    const subject = { sub: user.id };
    const payload = {
      username: user.username,
      sub: user.id
    };
    const authToken = {
      refreshToken: this.jwtService.sign(subject, {
        secret: process.env.JWT_REFRESH_SECRET_KEY,
        expiresIn: process.env.JWT_REFRESH_EXPIRED_TOKEN_AFTER
      }),
      accessToken: this.jwtService.sign(
        {
          ...payload,
          ...subject
        },
        {
          expiresIn: process.env.JWT_EXPIRED_TOKEN_AFTER
        }
      ),
      user: { ...user }
    };
    const dataToken = {
      userId: user.id,
      token: authToken.accessToken,
      expired: moment(new Date()).add(process.env.JWT_EXPIRED_TOKEN_AFTER, 'milliseconds').format('x'),
      isActive: 1
    };
    await this.saveTokenDevice(dataToken);
    return plainToClass(AuthTokenOutput, authToken, {
      excludeExtraneousValues: true
    });
  }

  async findTokenByUserId(id) {
    return await this.userTokenRepository.findOne({ userId: id });
  }

  async tokenByUser(token: string) {
    const findUserToken = await this.userTokenRepository.findOne({
      token: token
    });
    return findUserToken;
  }
  async logout(req: Request) {
    // const authToken = await this.userTokenRepository.findOne({
    //   token: req.headers.authorization.split('Bearer ')[1]
    // });
    // if (!authToken) {
    //   throw new BadRequestException();
    // }
    // const userToken = await this.userTokenRepository.findOne({
    //   token: authToken.token
    // });
    // await this.userTokenRepository.update(userToken.id, { isActive: 0 });
    return {
      status: 200,
      message: 'Success'
    };
  }

  async authenticate(input: SigninDto) {
    const { userName, passWord } = input;
    const user = await this.userRepository.findOne({
      userName: input.userName
    });
    if (!user) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }

    const comparePassword = await this.comparePassword(passWord, user.passWord);
    if (!comparePassword) {
      throw new BadRequestException(MESSAGE.invalid_password);
    }
    return user;
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const { oldPassword, newPassword, userId, reNewPassword } = changePasswordDto;
    const user = await this.userRepository.findOne({ id: userId });
    const comparePassword = await this.comparePassword(oldPassword, user.passWord);

    if (!comparePassword) {
      return { status: false, message: 'Mật khẩu cũ không đúng!' };
    }
    if (newPassword !== reNewPassword) {
      return { status: false, message: 'Mật khẩu mới không đúng!' };
    }
    user.passWord = await this.hashPassword(newPassword);

    await user.save();
    return { status: true, message: 'Đổi mật khẩu thành công!' };
  }

  async forgetPassword(input: forgetPassDto) {
    const findUserByEmail = await this.userRepository.findOne({
      email: input.email
    });
    if (!findUserByEmail) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }
    try {

      findUserByEmail.forgetPassCode = await this.verificationCode();
      await findUserByEmail.save();

      return { status: 200, message: 'Đã gửi mã đặt lại mật khẩu về email' };
    } catch (err) {
      throw new InternalServerErrorException({
        result: false,
        message: 'Forget Password error',
        data: null,
        statusCode: 500,
      });
    }
  }

  async confirmationForgetPassword(input: confirmationInput) {
    const findUser = await this.userRepository.findOne({
      email: input.email,

    });
    if (!findUser) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }
    if (findUser.forgetPassCode === input.code) {
      return {
        status: 200,
        message: 'Success'
      };
    }
    else {
      return {
        status: 500,
        message: 'Fail'
      };
    }
  }

  async resetPassword(input: resetPassword) {

    const findUser = await this.userRepository.findOne({
      email: input.email
    });
    if (!findUser) {
      throw new BadRequestException(MESSAGE.user_not_found);
    }
    if (input.passWord != input.repassWord) {
      throw new BadRequestException(MESSAGE.re_password_fail);
    }
    findUser.passWord = await this.hashPassword(input.passWord);

    return await findUser.save();

  }

  async requestUnlockAccount(input: { email: string }) {
    const user = await this.userRepository.findOne({
      email: input.email
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này');
    }

    if (user.isActive === 1) {
      throw new BadRequestException('Tài khoản không bị khóa');
    }

    // Tạo mã xác nhận 6 ký tự
    const unlockCode = await this.verificationCode();
    user.forgetPassCode = unlockCode;
    await user.save();

    // ✅ Gửi email với mã xác nhận
    try {
      await this.mailService.sendUnlockCode({
        emailTo: user.email,
        subject: 'Mã xác nhận mở khóa tài khoản',
        name: user.fullName || 'Người dùng',
        code: unlockCode,
      });

      return {
        message: `Mã xác nhận đã được gửi đến email ${user.email}. Vui lòng kiểm tra email để lấy mã.`
      };
    } catch (error) {
      console.error('Error sending unlock email:', error);
      throw new BadRequestException('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
    }
  }

  async verifyUnlockCode(input: { email: string; code: string }) {
    const user = await this.userRepository.findOne({
      email: input.email
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này');
    }

    if (user.forgetPassCode !== input.code) {
      throw new BadRequestException('Mã xác nhận không chính xác');
    }

    // Mở khóa tài khoản và reset các field liên quan
    user.isActive = 1;
    user.failedLoginAttempts = 0;
    user.lastFailedLoginAt = null;
    user.forgetPassCode = null;
    await user.save();

    return {
      message: 'Tài khoản đã được mở khóa thành công. Bạn có thể đăng nhập lại.'
    };
  }

  async approveIdentity(input: approveIdentityDto) {

    const findUserByEmail = await this.userRepository.findOne({
      email: input.email,
      //isActive: 1
    });
    if (!findUserByEmail) {
      throw new BadRequestException("Không tìm thấy tài khoản!")

    }
    if (findUserByEmail.isActive === 0) {
      throw new BadRequestException("Thí sinh chưa kích hoạt tài khoản!")
    }
    findUserByEmail.isActive = 2;
    await findUserByEmail.save();
    try {
    } catch (error) {

    }

    return { status: 200, message: "Phê duyệt tài khoản thành công!" };
  }


  async rejectIdentity(input: rejectIdentityDto) {

    const findUserByEmail = await this.userRepository.findOne({
      email: input.email,
      //isActive: 1
    });
    if (!findUserByEmail) {
      throw new BadRequestException("Không tìm thấy tài khoản!")

    }
    if (findUserByEmail.isActive === 0) {
      throw new BadRequestException("Thí sinh chưa kích hoạt tài khoản!")
    }
    findUserByEmail.description = input.description;
    findUserByEmail.isActive = -1;
    await findUserByEmail.save();

    return { status: 200, message: "Đã từ chối căn cước công dân!" };
  }

  async createAdmin(input: SignupAdminDto) {
    const role = await this.roleRepository.findOne({ name: 'STUDENT' });
    const findUserByIdentity = await this.userRepository.findOne({
      identity: input.identity,
      //isActive: 1
    });
    const findUserByEmail = await this.userRepository.findOne({
      email: input.email,
      //isActive: 1
    });
    if (input.phoneNumber) {
      const findUserByPhoneNumber = await this.userRepository.findOne({
        phoneNumber: input.phoneNumber,
        //isActive: 1
      });
      if (findUserByPhoneNumber) {
        if (findUserByPhoneNumber.roleId != role.id) {
          throw new BadRequestException(MESSAGE.phonenumber_already_exist);

        }
      }

      if (await this.checkPhoneNumber(input.phoneNumber) === false) {
        throw new BadRequestException(MESSAGE.phoneNumber_is_not_format);
      }
    }

    if (findUserByIdentity) {
      if (findUserByIdentity.roleId != role.id) {
        throw new BadRequestException(MESSAGE.identity_already_exist);
      }
    }
    if (findUserByEmail) {
      if (findUserByIdentity.roleId != role.id)
        throw new BadRequestException(MESSAGE.email_already_exist);

    }


    if (await this.checkEmail(input.email) === false) {
      throw new BadRequestException(MESSAGE.email_is_not_format);
    }
    //try {
    const newUser = await this.userRepository.create(input);
    newUser.passWord = await this.hashPassword(input.passWord);
    newUser.isActive = 1;
    // newUser.id = randomUUID(); // Để TypeORM tự động tạo UUID

    // Thêm các field mới
    if (input.cumKhuCnId) {
      newUser.cumKhuCnId = input.cumKhuCnId;
    }
    if (input.xaPhuongId) {
      newUser.xaPhuongId = input.xaPhuongId;
    }

    return await newUser.save();
  }

  /**
   * Liên kết User với Zalo Account
   */
  async linkUserWithZaloAccount(userId: string, zaloAccountId: number): Promise<void> {
    // Validate user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Validate zalo account exists
    const zaloAccount = await this.zaloAccountRepository.findOne({ where: { id: zaloAccountId } });
    if (!zaloAccount) {
      throw new Error(`ZaloAccount with ID ${zaloAccountId} not found`);
    }

    // Link them
    zaloAccount.userId = userId;
    await this.zaloAccountRepository.save(zaloAccount);

    console.log(`✅ Linked User ${userId} with ZaloAccount ${zaloAccountId}`);
  }

  /**
   * Lấy system user từ Zalo ID - Sử dụng ZaloAccount entity đã được migrate
   */
  async getSystemUserFromZaloId(zaloId: string): Promise<User | null> {
    try {
      // Tìm ZaloAccount theo các loại zaloId (OA, App, MiniApp)
      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: [
          { zaloOaUserId: zaloId },
          { zaloAppUserId: zaloId },
          { zaloMiniAppId: zaloId }
        ]
      });

      if (!zaloAccount || !zaloAccount.userId) {
        return null;
      }

      // Lấy User từ userId
      const user = await this.userRepository.findOne({
        where: { id: zaloAccount.userId },
        relations: ['role']
      });

      return user;
    } catch (error) {
      console.error('Error getting system user from Zalo ID:', error);
      return null;
    }
  }

  /**
   * 🔓 Gửi mã unlock tài khoản về email
   */
  async sendUnlockCode(email: string): Promise<{ status: number; message: string; email?: string }> {
    // Tìm user theo email
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này!');
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.isActive !== 0) {
      throw new BadRequestException('Tài khoản chưa bị khóa!');
    }

    try {
      // Tạo mã code 6 ký tự
      const unlockCode = await this.verificationCode();

      // Lưu mã vào field forgetPassCode
      user.forgetPassCode = unlockCode;
      await user.save();

      // TODO: Gửi email (tích hợp mail service)
      // await this.mailService.sendUnlockCode(email, unlockCode);
      this.mailService.sendNewPassword({
        emailTo: user.email,
        subject: 'Kích hoạt lại tài khoản',
        name: user.fullName,
        code: user.forgetPassCode,
        sdt: user.phoneNumber,
      })

      console.log(`🔓 Unlock code for ${email}: ${unlockCode}`);

      return {
        status: 200,
        message: 'Đã gửi mã mở khóa tài khoản về email của bạn. Vui lòng kiểm tra hộp thư!',
        email: email
      };
    } catch (error) {
      console.error('Error sending unlock code:', error);
      throw new InternalServerErrorException('Có lỗi xảy ra khi gửi mã mở khóa. Vui lòng thử lại!');
    }
  }

  /**
   * 🔓 Xác nhận mã unlock và mở khóa tài khoản
   */
  async unlockAccount(email: string, code: string): Promise<{ status: number; message: string }> {
    // Tìm user theo email
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với email này!');
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.isActive !== 0) {
      throw new BadRequestException('Tài khoản chưa bị khóa!');
    }

    // Kiểm tra mã code có khớp không
    if (!user.forgetPassCode || user.forgetPassCode !== code) {
      throw new BadRequestException('Mã xác nhận không đúng!');
    }

    try {
      // Mở khóa tài khoản và reset các trường liên quan
      user.isActive = 1;
      user.failedLoginAttempts = 0;
      user.lastFailedLoginAt = null;
      user.forgetPassCode = null; // Xóa mã code sau khi sử dụng
      await user.save();

      return {
        status: 200,
        message: 'Mở khóa tài khoản thành công! Bạn có thể đăng nhập lại.'
      };
    } catch (error) {
      console.error('Error unlocking account:', error);
      throw new InternalServerErrorException('Có lỗi xảy ra khi mở khóa tài khoản. Vui lòng thử lại!');
    }
  }

  async resetPasswordByUserName(input: { userName: string }) {
    const user = await this.userRepository.findOne({
      where: { userName: input.userName }
    });

    if (!user) {
      throw new BadRequestException('Không tìm thấy tài khoản với userName này');
    }

    // Reset password về Abc@123
    const defaultPassword = 'Abc@123';
    user.passWord = await this.hashPassword(defaultPassword);

    // Reset failed login attempts nếu tài khoản bị khóa
    user.failedLoginAttempts = 0;
    user.lastFailedLoginAt = null;
    user.isActive = 1;

    await user.save();

    return {
      status: 200,
      message: `Reset mật khẩu thành công cho tài khoản ${user.userName}. Mật khẩu mới là: Abc@123`,
      data: {
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        newPassword: defaultPassword
      }
    };
  }
}

