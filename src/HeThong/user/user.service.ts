import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { Role } from 'src/databases/entities/role.entity';
import { User } from 'src/databases/entities/user.entity';
import { XaPhuong } from 'src/databases/entities/XaPhuong.entity';
import { ZaloAccount } from 'src/databases/entities/ZaloAccount.entity';
import { MESSAGE } from 'src/messageError';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';

import { AuthService } from '../auth/auth.service';
import { ZaloAccountService } from '../auth/zalo-account.service';
import { ImportUserDto, ImportUserResultDto } from './dto/import-user.dto';
import { getDetailUserByRegistrationFormIdDto, getTTCN, listAllUserDto, listUserAdminDto } from './dto/list-all-user-dto.dto';
import { updateStudentDto, updateUserDto } from './dto/user-dto.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(CumKhuCongNghiep)
    private readonly cumKhuCongNghiepRepository: Repository<CumKhuCongNghiep>,
    @InjectRepository(XaPhuong)
    private readonly xaPhuongRepository: Repository<XaPhuong>,
    private readonly authService: AuthService,
    private readonly zaloAccountService: ZaloAccountService,
  ) { }

  async checkPhoneNumber(phoneNumber: string) {
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (vnf_regex.test(phoneNumber) == false) { return false }
    else return true;
  }

  /**
   * Loại bỏ dấu tiếng Việt
   */
  private removeVietnameseTones(str: string): string {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    str = str.replace(/đ/g, 'd');
    str = str.replace(/\s+/g, ''); // Loại bỏ khoảng trắng
    return str;
  }

  /**
   * Tạo username theo vai trò
   * - CV/LD: _ + họ tên viết tắt (ví dụ: Nguyễn Đức Trường => _truongnd)
   * - CDCS: cdcs_ + id công đoàn cơ sở
   * - CKCN/XP: pt_ + tên viết tắt cụm/xã phường
   */
  private generateUsernameByRole(fullName: string, roleDescription: string, organizationId?: number, entityName?: string): string {
    const roleUpper = roleDescription.toUpperCase();

    // Case 1: CV hoặc LD => _
    if (roleUpper.includes('CV') || roleUpper.includes('LD') || roleUpper.includes('CÁN BỘ') || roleUpper.includes('LÃNH ĐẠO')) {
      const nameParts = fullName.trim().split(' ');
      const lastName = nameParts[nameParts.length - 1]; // Tên
      const firstLetters = nameParts.slice(0, -1).map(p => p[0]).join(''); // Chữ cái đầu của họ và tên đệm
      const nameAbbr = this.removeVietnameseTones(lastName.toLowerCase() + firstLetters.toLowerCase());
      return `_${nameAbbr}`;
    }

    // Case 2: CDCS => cdcs_ + id
    if (roleUpper.includes('CDCS') || roleUpper.includes('CÔNG ĐOÀN CƠ SỞ')) {
      if (organizationId) {
        return `cdcs_${organizationId}`;
      }
      // Fallback nếu chưa có organizationId
      return `cdcs_temp_${Date.now()}`;
    }

    // Case 3: CKCN hoặc XP => pt_ + tên viết tắt
    if (roleUpper.includes('CKCN') || roleUpper.includes('CỤM KHU') || roleUpper.includes('XP') || roleUpper.includes('XÃ PHƯỜNG') || roleUpper.includes('PHƯỜNG THÀNH')) {
      if (entityName) {
        const cleanName = this.removeVietnameseTones(entityName.toLowerCase());
        return `pt_${cleanName}`;
      }
      // Fallback
      return `pt_temp_${Date.now()}`;
    }

    // Fallback mặc định
    const nameParts = fullName.trim().split(' ');
    const lastName = nameParts[nameParts.length - 1];
    const firstLetters = nameParts.slice(0, -1).map(p => p[0]).join('');
    const nameAbbr = this.removeVietnameseTones(lastName.toLowerCase() + firstLetters.toLowerCase());
    return `user_${nameAbbr}`;
  }

  /**
   * Tạo username từ họ tên và vai trò
   * Ví dụ: "Nguyễn Thị Mơ" + "Đoàn viên" => "mont.dv"
   */
  private generateUsername(fullName: string, roleName: string): string {
    // Loại bỏ dấu tiếng Việt
    const removeVietnameseTones = (str: string) => {
      str = str.toLowerCase();
      str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
      str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
      str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
      str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
      str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
      str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
      str = str.replace(/đ/g, 'd');
      return str;
    };

    // Lấy viết tắt tên
    const nameParts = fullName.trim().split(' ');
    const lastName = nameParts[nameParts.length - 1]; // Tên
    const firstLetters = nameParts.slice(0, -1).map(p => p[0]).join(''); // Chữ cái đầu của họ và tên đệm

    const nameAbbr = removeVietnameseTones(firstLetters + lastName);

    // Lấy viết tắt vai trò (2 chữ cái đầu)
    const roleAbbr = removeVietnameseTones(roleName.substring(0, 2).toLowerCase());

    return `${nameAbbr}.${roleAbbr}`;
  }

  /**
   * Tạo username duy nhất bằng cách thêm số nếu trùng
   */
  private async generateUniqueUsername(fullName: string, roleName: string): Promise<string> {
    let username = this.generateUsername(fullName, roleName);
    let counter = 1;

    // Kiểm tra username đã tồn tại chưa
    while (await this.userRepository.findOne({ where: { userName: username } })) {
      username = `${this.generateUsername(fullName, roleName)}${counter}`;
      counter++;
    }

    return username;
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, 12);
  }

  async checkEmail(email: string) {
    const filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (filter.test(email) == false) { return false }
    else return true;
  }

  //function compare password param with user password in database
  async comparePassword(password: string, storePasswordHash: string): Promise<boolean> {
    return await compare(password, storePasswordHash);
  }

  async updateUser(input: updateUserDto) {

    const findUserById = await this.userRepository.findOne({ where: { id: input.id } });
    if (!findUserById) {
      throw new BadRequestException("User_is_not_exist");
    }
    const findUserByIdentity = await this.userRepository.findOne({
      where: { identity: input.identity }
      //isActive: 1
    });
    const findUserByEmail = await this.userRepository.findOne({
      where: { email: input.email }
      //isActive: 1
    });

    const findUserByUserName = await this.userRepository.findOne({
      where: { userName: input.userName }
      //isActive: 1
    });
    const findUserByPhoneNumber = await this.userRepository.findOne({
      where: { phoneNumber: input.phoneNumber }
      //isActive: 1
    });
    if (findUserByIdentity && findUserByIdentity.id != findUserById.id)
      throw new BadRequestException(MESSAGE.identity_already_exist);
    if (findUserByEmail && findUserByEmail.id != findUserById.id)
      throw new BadRequestException(MESSAGE.email_already_exist);
    if (findUserByPhoneNumber && findUserByPhoneNumber.id != findUserById.id)
      throw new BadRequestException(MESSAGE.phonenumber_already_exist);
    if (await this.checkPhoneNumber(input.phoneNumber) === false) {
      throw new BadRequestException(MESSAGE.phoneNumber_is_not_format);
    }

    if (findUserByUserName && findUserByUserName.id != findUserById.id)
      throw new BadRequestException('userName_already_exist');

    if (await this.checkEmail(input.email) === false) {
      throw new BadRequestException(MESSAGE.email_is_not_format);
    }

    //const comparePassword = await this.comparePassword(oldPassword, findUserById.passWord);

    // if (!comparePassword) {
    //   return { status: false, message: 'Mật khẩu cũ không đúng!' };
    // }
    const updatedItem = { ...findUserById, ...input };
    if (input.passWord && input.repassWord) {
      if (input.passWord !== input.repassWord) {
        return { status: false, message: 'repass_not_true' };
      }
      const hashedPassword = await this.hashPassword(input.passWord);


      updatedItem.passWord = hashedPassword;
    }

    const saveUser = await this.userRepository.save(updatedItem);

    // Handle Zalo account linking if provided
    if (input.zaloAccountId) {
      try {
        await this.authService.linkUserWithZaloAccount(saveUser.id, input.zaloAccountId);
      } catch (error) {
        console.error('Error linking Zalo account during user update:', error);
        // Note: We don't throw error here to avoid breaking user update if Zalo linking fails
      }
    }

    const role = await this.roleRepository.findOne({ id: saveUser.roleId })
    const roleName = role.name;
    return { saveUser, roleName }
  }

  async listAllUser(payload: listAllUserDto) {
    const { search, limit, page, roleId, isActive, cumKhuCnId, xaPhuongId } = payload;
    const listRole = this.userRepository
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.userName',
        'b.identity',
        'b.forgetPassCode',
        'b.passWord',
        'b.roleId',
        'b.fullName',
        'b.phoneNumber',
        'b.email',
        'b.isActive',
        'b.isDelete',
        'b.avatar',
        'b.description',
        'b.organizationId',
        'b.cumKhuCnId',
        'b.xaPhuongId',
        'b.failedLoginAttempts',
        'b.lastFailedLoginAt',
        'b.createdAt',
        'b.updatedAt',
        'r.name as roleName',
        'o.name as organizationName',
        'c.ten as cumKhuCongNghiepName',
        'x.ten as xaPhuongName'
      ])
      .leftJoin('Role', 'r', 'b.roleId = r.id')
      .leftJoin('organization', 'o', 'b.organizationId = o.id')
      .leftJoin('cum_khu_cong_nghiep', 'c', 'b.cumKhuCnId = c.id')
      .leftJoin('xa_phuong', 'x', 'b.xaPhuongId = x.id')
      .where('b.isDelete = :isDelete', { isDelete: 0 })
      .orderBy('b.createdAt', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1));
    if (search) {
      //viết hết tất car các trường cần tìm kiếm
      listRole.andWhere(
        '( r.name LIKE :search OR b.email LIKE :search OR b.fullName LIKE :search OR b.identity LIKE :search OR b.phoneNumber LIKE :search OR o.name LIKE :search OR c.ten LIKE :search OR x.ten LIKE :search)',
        { search: `%${search}%` }
      );
    }
    if (isActive != null) {
      listRole.andWhere(
        'b.isActive = :isActive',
        { isActive: isActive }
      );
    }

    if (roleId) {
      listRole.andWhere(
        'b.roleId = :roleId',
        { roleId: roleId }
      );
    }
    if (cumKhuCnId) {
      listRole.andWhere(
        'b.cumKhuCnId = :cumKhuCnId',
        { cumKhuCnId: cumKhuCnId }
      );
    }

    if (xaPhuongId) {
      listRole.andWhere(
        'b.xaPhuongId = :xaPhuongId',
        { xaPhuongId: xaPhuongId }
      );
    }

    try {
      const rawList = await listRole.getRawMany();
      const count = await listRole.getCount();

      // Map kết quả để loại bỏ prefix b_
      const list = rawList.map(item => ({
        id: item.b_id,
        userName: item.b_userName,
        identity: item.b_identity,
        forgetPassCode: item.b_forgetPassCode,
        passWord: item.b_passWord,
        roleId: item.b_roleId,
        fullName: item.b_fullName,
        phoneNumber: item.b_phoneNumber,
        email: item.b_email,
        isActive: item.b_isActive,
        isDelete: item.b_isDelete,
        avatar: item.b_avatar,
        description: item.b_description,
        organizationId: item.b_organizationId,
        cumKhuCnId: item.b_cumKhuCnId,
        xaPhuongId: item.b_xaPhuongId,
        failedLoginAttempts: item.b_failedLoginAttempts,
        lastFailedLoginAt: item.b_lastFailedLoginAt,
        createdAt: item.b_createdAt,
        updatedAt: item.b_updatedAt,
        roleName: item.roleName,
        organizationName: item.organizationName,
        cumKhuCongNghiepName: item.cumKhuCongNghiepName,
        xaPhuongName: item.xaPhuongName
      }));

      return { list, count };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra!')
    }

  }



  async deleteUser(payload: getTTCN) {
    const { userId } = payload;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Người dùng không tồn tại");
    }
    await this.userRepository.remove(user);
    return { status: 200, message: 'Xóa thành công!' };
  }

  async deleteUserTemp(payload: getTTCN) {
    const { userId } = payload;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Người dùng không tồn tại");
    }
    user.isDelete = 1;
    await user.save();
    return { status: 200, message: 'Xóa thành công!' };
  }

  async updateStudent(input: updateStudentDto) {

    const findUserById = await this.userRepository.findOne({ where: { id: input.id } });
    if (!findUserById) {
      throw new BadRequestException("User_is_not_exist");
    }
    const findUserByIdentity = await this.userRepository.findOne({
      where: { identity: input.identity }
      //isActive: 1
    });
    const findUserByEmail = await this.userRepository.findOne({
      where: { email: input.email }
      //isActive: 1
    });
    const findUserByPhoneNumber = await this.userRepository.findOne({
      where: { phoneNumber: input.phoneNumber }
      //isActive: 1
    });
    if (findUserByIdentity && findUserByIdentity.id != findUserById.id)
      throw new BadRequestException(MESSAGE.identity_already_exist);
    if (findUserByEmail && findUserByEmail.id != findUserById.id)
      throw new BadRequestException(MESSAGE.email_already_exist);
    if (findUserByPhoneNumber && findUserByPhoneNumber.id != findUserById.id)
      throw new BadRequestException(MESSAGE.phonenumber_already_exist);
    if (await this.checkPhoneNumber(input.phoneNumber) === false) {
      throw new BadRequestException(MESSAGE.phoneNumber_is_not_format);
    }

    if (await this.checkEmail(input.email) === false) {
      throw new BadRequestException(MESSAGE.email_is_not_format);
    }


    const updatedItem = { ...findUserById, ...input };
    const saveUser = await this.userRepository.save(updatedItem);
    return { saveUser }
  }

  async listUserAdmin(payload: listUserAdminDto) {
    const { search, limit, page } = payload;
    const listRole = this.userRepository
      .createQueryBuilder('b')
      .select(['b.*',
        'r.name as roleName',
        's.name as staffName'
      ])
      .leftJoin('Role', 'r', 'b.roleId = r.id')
      .leftJoin('Staff', 's', 'b.staffID = s.id')
      .where('b.isDelete = :isDelete', { isDelete: 0 })
      // .andWhere('b.roleId NOT IN (:...roleIds)', { roleIds: [1, 2] })
      .orderBy('b.createdAt', 'DESC')
      .limit(limit)
      .offset(limit * (page - 1));
    if (search) {
      //viết hết tất car các trường cần tìm kiếm
      listRole.andWhere(
        '( s.name LIKE :search OR r.name LIKE :search OR b.email LIKE :search OR b.fullName LIKE :search OR b.identity LIKE :search OR b.phoneNumber LIKE :search)',
        { search: `%${search}%` }
      );
    }

    try {
      const [list, count] = await Promise.all([
        listRole.getRawMany(),
        listRole.getCount()
      ]);

      return { list, count };
    } catch (error) {
      throw new BadRequestException('Có lỗi xảy ra!')
    }

  }

  async getUser(userId: string) {
    const user = await this.userRepository.findOne({ id: userId });
    const role = await this.roleRepository.findOne({ id: user.roleId });
    const zaloAccount = await this.zaloAccountRepository.findOne({ userId: user.id });

    const organization = await this.organizationRepository.findOne({ id: user.organizationId });

    return { user, role, organization, zaloAccount };
  }

  async getDetailUser(userId: string) {
    //const { userId } = payload;
    const User = await this.userRepository.findOne({ where: { id: userId } });
    const role = await this.roleRepository.findOne({ id: User.roleId })

    return { User, role };
  }

  /**
   * Import danh sách người dùng từ Excel
   */
  async importUsers(importData: ImportUserDto): Promise<ImportUserResultDto> {
    const result: ImportUserResultDto = {
      successCount: 0,
      errorCount: 0,
      errors: {},
      createdIds: []
    };

    // Cache để tránh query nhiều lần
    const roleCache = new Map<string, Role>();
    const organizationCache = new Map<string, Organization>();
    const cumKhuCache = new Map<string, CumKhuCongNghiep>();
    const xaPhuongCache = new Map<string, XaPhuong>();

    for (let i = 0; i < importData.data.length; i++) {
      const row = importData.data[i];
      const rowIndex = i + 1; // Dòng thực tế trong Excel (bắt đầu từ 1, có thể là 2 nếu có header)
      const errors: string[] = [];

      try {
        // Skip các dòng trống hoặc header
        if (!row.hoVaTen || !row.email || !row.tenTaiKhoan) {
          console.log(`Bỏ qua dòng ${rowIndex}: thiếu thông tin cơ bản`);
          continue;
        }

        // Validate email format
        if (!await this.checkEmail(row.email)) {
          errors.push('Email không đúng định dạng');
        }

        // Validate phone number format
        if (row.sdt && !await this.checkPhoneNumber(row.sdt)) {
          errors.push('Số điện thoại không đúng định dạng');
        }

        // Kiểm tra trùng lặp userName
        const existingUserByUserName = await this.userRepository.findOne({
          where: { userName: row.tenTaiKhoan }
        });
        if (existingUserByUserName) {
          errors.push(`Tên tài khoản đã tồn tại trong hệ thống`);
        }

        // Kiểm tra trùng lặp email
        const existingUserByEmail = await this.userRepository.findOne({
          where: { email: row.email }
        });
        if (existingUserByEmail) {
          errors.push(`Email đã tồn tại trong hệ thống`);
        }

        // Kiểm tra trùng lặp số điện thoại
        if (row.sdt) {
          const existingUserByPhone = await this.userRepository.findOne({
            where: { phoneNumber: row.sdt }
          });
          if (existingUserByPhone) {
            errors.push(`Số điện thoại đã tồn tại trong hệ thống`);
          }
        }

        // Kiểm tra trùng lặp CMND/CCCD
        const existingUserByIdentity = await this.userRepository.findOne({
          where: { identity: row.cmndCccd }
        });
        if (existingUserByIdentity) {
          errors.push(`Số CMND/CCCD đã tồn tại trong hệ thống`);
        }

        // Tìm roleId từ description
        let roleId: number | null = null;
        if (row.vaiTro) {
          const vaiTroTrimmed = row.vaiTro.toString().trim();

          // Kiểm tra cache trước
          if (roleCache.has(vaiTroTrimmed)) {
            roleId = roleCache.get(vaiTroTrimmed).id;
          } else {
            // Query database
            const role = await this.roleRepository.findOne({
              where: { description: vaiTroTrimmed }
            });

            if (role) {
              roleId = role.id;
              roleCache.set(vaiTroTrimmed, role);
            } else {
              errors.push(`Không tìm thấy vai trò: "${vaiTroTrimmed}"`);
            }
          }
        } else {
          errors.push('Vai trò không được để trống');
        }

        // Tìm organizationId từ tên
        let organizationId: number | null = null;
        if (row.congDoanCoSo && row.congDoanCoSo.toString().trim() !== '') {
          const orgName = row.congDoanCoSo.toString().trim();

          // Kiểm tra cache trước
          if (organizationCache.has(orgName)) {
            organizationId = organizationCache.get(orgName).id;
          } else {
            // Query database
            const organization = await this.organizationRepository.findOne({
              where: { name: orgName }
            });

            if (organization) {
              organizationId = organization.id;
              organizationCache.set(orgName, organization);
            } else {
              errors.push(`Không tìm thấy công đoàn cơ sở: "${orgName}"`);
            }
          }
        }

        // Tìm cumKhuCnId từ tên
        let cumKhuCnId: number | null = null;
        if (row.cumKhuCn && row.cumKhuCn.toString().trim() !== '') {
          const cumKhuName = row.cumKhuCn.toString().trim();

          // Kiểm tra cache trước
          if (cumKhuCache.has(cumKhuName)) {
            cumKhuCnId = cumKhuCache.get(cumKhuName).id;
          } else {
            // Query database
            const cumKhu = await this.cumKhuCongNghiepRepository.findOne({
              where: { ten: cumKhuName }
            });

            if (cumKhu) {
              cumKhuCnId = cumKhu.id;
              cumKhuCache.set(cumKhuName, cumKhu);
            } else {
              errors.push(`Không tìm thấy cụm khu CN: "${cumKhuName}"`);
            }
          }
        }

        // Tìm xaPhuongId từ tên
        let xaPhuongId: number | null = null;
        if (row.xaPhuong && row.xaPhuong.toString().trim() !== '') {
          const xaPhuongName = row.xaPhuong.toString().trim();

          // Kiểm tra cache trước
          if (xaPhuongCache.has(xaPhuongName)) {
            xaPhuongId = xaPhuongCache.get(xaPhuongName).id;
          } else {
            // Query database
            const xaPhuong = await this.xaPhuongRepository.findOne({
              where: { ten: xaPhuongName }
            });

            if (xaPhuong) {
              xaPhuongId = xaPhuong.id;
              xaPhuongCache.set(xaPhuongName, xaPhuong);
            } else {
              errors.push(`Không tìm thấy xã phường: "${xaPhuongName}"`);
            }
          }
        }

        // Nếu có lỗi, lưu lại và bỏ qua dòng này
        if (errors.length > 0) {
          result.errorCount++;
          result.errors[rowIndex] = errors;
          continue;
        }

        // Tạo user object
        const userData: Partial<User> = {
          userName: row.tenTaiKhoan.toString().trim(),
          fullName: row.hoVaTen.toString().trim(),
          email: row.email.toString().trim(),
          phoneNumber: row.sdt?.toString().trim() || null,
          identity: row.cmndCccd.toString().trim(),
          passWord: await this.hashPassword(row.matKhau.toString()),
          roleId,
          organizationId,
          cumKhuCnId,
          xaPhuongId,
          isActive: 1,
        };

        // Tạo và lưu user
        const newUser = this.userRepository.create(userData);
        await this.userRepository.save(newUser);

        result.successCount++;
        result.createdIds.push(newUser.id);

      } catch (error) {
        result.errorCount++;
        const errorMessage = `Lỗi không xác định: ${error.message || 'Unknown error'}`;
        result.errors[rowIndex] = result.errors[rowIndex] || [];
        result.errors[rowIndex].push(errorMessage);
      }
    }

    return result;
  }

  /**
   * Import users từ file Excel và trả về file Excel có highlight lỗi
   */
  async importFromExcelFile(file: Express.Multer.File): Promise<{ result: ImportUserResultDto; errorFile?: Buffer }> {
    try {
      console.log(`Bắt đầu đọc file Excel: ${file.originalname}`);
      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Chuyển đổi thành JSON
      // Bỏ qua 2 dòng đầu: row 1 (tiêu đề) và row 2 (header)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          'stt',
          'hoVaTen',
          'tenTaiKhoan',
          'email',
          'sdt',
          'cmndCccd',
          'matKhau',
          'vaiTro',
          'congDoanCoSo',
          'cumKhuCn',
          'xaPhuong'
        ],
        range: 2 // Bỏ qua 2 dòng đầu (row 0: tiêu đề chính, row 1: header cột), bắt đầu từ row 2
      });

      console.log(`Đọc được ${jsonData.length} dòng từ Excel`);

      // Thực hiện import
      const importResult = await this.importUsers({
        data: jsonData as any[]
      });

      // Nếu có lỗi, tạo file Excel highlight lỗi
      let errorFile: Buffer | undefined;
      if (importResult.errorCount > 0) {
        errorFile = this.createErrorExcelFile(worksheet, importResult.errors, jsonData);
      }

      return {
        result: importResult,
        errorFile
      };

    } catch (error) {
      console.error('Lỗi khi đọc file Excel:', error);
      throw new BadRequestException(`Không thể đọc file Excel: ${error.message}`);
    }
  }

  /**
   * Tạo file Excel với highlight lỗi
   */
  private createErrorExcelFile(
    originalWorksheet: XLSX.WorkSheet,
    errors: { [rowIndex: number]: string[] },
    data: any[]
  ): Buffer {
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();

    // Copy worksheet gốc
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Row 0: Tiêu đề chính (merge cells)
    const titleRow = ['Nhập dữ liệu tài khoản người dùng'];
    XLSX.utils.sheet_add_aoa(worksheet, [titleRow], { origin: 0 });

    // Row 1: Header các cột
    const headers = ['STT', 'Họ và tên', 'Tên tài khoản', 'Email', 'SĐT', 'CMND/CCCD', 'Mật khẩu', 'Vai trò', 'Công đoàn cơ sở', 'Cụm khu CN', 'Xã phường', 'Lỗi'];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 1 });

    // Row 2+: Thêm dữ liệu với cột lỗi
    data.forEach((row, index) => {
      const rowIndex = index + 1; // index trong data array (bắt đầu từ 0)
      const excelRowIndex = index + 3; // Dòng thực tế trong Excel (row 0: title, row 1: header, row 2+: data)
      const errorMessages = errors[rowIndex] || [];
      const rowData = [
        row.stt || index + 1,
        row.hoVaTen,
        row.tenTaiKhoan,
        row.email,
        row.sdt,
        row.cmndCccd,
        row.matKhau,
        row.vaiTro,
        row.congDoanCoSo,
        row.cumKhuCn,
        row.xaPhuong,
        errorMessages.join('; ')
      ];

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: index + 2 }); // +2 vì có title và header
    });

    // Merge title cells (A1:L1)
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } }];

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // STT
      { wch: 25 }, // Họ và tên
      { wch: 20 }, // Tên tài khoản
      { wch: 30 }, // Email
      { wch: 15 }, // SĐT
      { wch: 15 }, // CMND
      { wch: 15 }, // Mật khẩu
      { wch: 20 }, // Vai trò
      { wch: 30 }, // Công đoàn
      { wch: 20 }, // Cụm khu
      { wch: 20 }, // Xã phường
      { wch: 50 }  // Lỗi
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Result');

    // Convert to buffer
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }

  /**
   * Import users với auto-link Zalo account từ file Excel
   * Format: STT | Họ và tên | Email | SĐT Đăng ký Zalo | CMND/CCCD | Vai trò | Công đoàn cơ sở | Cụm khu CN | Xã phường | Tên tài khoản Zalo
   */
  async importUsersWithZaloLinkFromExcelFile(file: Express.Multer.File): Promise<{ result: ImportUserResultDto; errorFile?: Buffer }> {
    try {
      console.log(`Bắt đầu đọc file Excel với auto-link Zalo: ${file.originalname}`);

      // Đọc file Excel
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Chuyển đổi thành JSON với header mới (13 cột)
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          'stt',
          'hoVaTen',
          'email',
          'sdt',
          'cmndCccd',
          'vaiTro',
          'congDoanCoSo',
          'idCdcs',
          'cumKhuCn',
          'idCumKcn',
          'xaPhuong',
          'idXaPhuong',
          'tenTaiKhoanZalo'
        ],
        range: 2 // Bỏ qua 2 dòng đầu
      });

      console.log(`Đọc được ${jsonData.length} dòng từ Excel`);

      // Thực hiện import với auto-link Zalo
      const importResult = await this.importUsersWithZaloLink({
        data: jsonData as any[]
      });

      // Nếu có lỗi, tạo file Excel highlight lỗi
      let errorFile: Buffer | undefined;
      if (importResult.errorCount > 0) {
        errorFile = this.createZaloLinkErrorExcelFile(worksheet, importResult.errors, jsonData);
      }

      return {
        result: importResult,
        errorFile
      };

    } catch (error) {
      console.error('Lỗi khi đọc file Excel:', error);
      throw new BadRequestException(`Không thể đọc file Excel: ${error.message}`);
    }
  }

  /**
   * Import users và tự động liên kết với Zalo account qua SĐT
   * Logic mới:
   * - Vai trò dựa vào description của bảng role
   * - Organization: check ID CĐCS, nếu trống và có tên => tạo mới, nếu có ID => check tồn tại
   * - Username theo vai trò: CV/LD => _, CDCS => cdcs_, CKCN/XP => pt_
   * - Nếu user tồn tại thì không tạo mới, chỉ liên kết Zalo (1 user nhiều Zalo)
   * - Tạo user xong rồi mới liên kết Zalo
   */
  async importUsersWithZaloLink(importData: ImportUserDto): Promise<ImportUserResultDto> {
    const result: ImportUserResultDto = {
      successCount: 0,
      errorCount: 0,
      errors: {},
      createdIds: [],
      zaloLinkedCount: 0,
      zaloNotFoundCount: 0
    };

    // Cache để tránh query nhiều lần
    const roleCache = new Map<string, Role>();
    const organizationCache = new Map<number, Organization>(); // Key là ID
    const cumKhuCache = new Map<number, CumKhuCongNghiep>();
    const xaPhuongCache = new Map<number, XaPhuong>();

    const DEFAULT_PASSWORD = 'Aabc@123';

    for (let i = 0; i < importData.data.length; i++) {
      const row = importData.data[i];
      const rowIndex = i + 1;
      const errors: string[] = [];
      const warnings: string[] = [];

      try {
        // Skip các dòng trống
        if (!row.hoVaTen || !row.email) {
          console.log(`Bỏ qua dòng ${rowIndex}: thiếu thông tin cơ bản`);
          continue;
        }

        // Validate email format
        if (!await this.checkEmail(row.email)) {
          errors.push('Email không đúng định dạng');
        }

        // Validate phone number format
        if (row.sdt && !await this.checkPhoneNumber(row.sdt)) {
          errors.push('Số điện thoại không đúng định dạng');
        }

        // ============= XỬ LÝ VAI TRÒ (Role) =============
        let roleId: number | null = null;
        let role: Role | null = null;
        if (row.vaiTro) {
          const vaiTroTrimmed = row.vaiTro.toString().trim();

          if (roleCache.has(vaiTroTrimmed)) {
            role = roleCache.get(vaiTroTrimmed);
            roleId = role.id;
          } else {
            role = await this.roleRepository.findOne({
              where: { description: vaiTroTrimmed }
            });

            if (role) {
              roleId = role.id;
              roleCache.set(vaiTroTrimmed, role);
            } else {
              errors.push(`Không tìm thấy vai trò: "${vaiTroTrimmed}"`);
            }
          }
        } else {
          errors.push('Vai trò không được để trống');
        }

        // ============= XỬ LÝ CÔNG ĐOÀN CƠ SỞ (Organization) =============
        let organizationId: number | null = null;
        const idCdcs = row.idCdcs ? parseInt(row.idCdcs.toString().trim()) : null;
        const tenCdcs = row.congDoanCoSo?.toString().trim();

        if (idCdcs) {
          // Trường hợp có ID CĐCS
          if (organizationCache.has(idCdcs)) {
            organizationId = idCdcs;
          } else {
            const existingOrg = await this.organizationRepository.findOne({ where: { id: idCdcs } });
            if (existingOrg) {
              organizationId = idCdcs;
              organizationCache.set(idCdcs, existingOrg);
            } else if (tenCdcs) {
              // ID không tồn tại => tạo mới với tên từ file
              const newOrg = this.organizationRepository.create({
                name: tenCdcs,
                slCongNhanVienChucLdNam: 0,
                slCongNhanVienChucLdNu: 0,
                slCongDoanNam: 0,
                slCongDoanNu: 0
              });
              const savedOrg = await this.organizationRepository.save(newOrg);
              organizationId = savedOrg.id;
              organizationCache.set(savedOrg.id, savedOrg);
              warnings.push(`Đã tạo mới công đoàn cơ sở: "${tenCdcs}" với ID ${savedOrg.id}`);
            } else {
              errors.push(`ID CĐCS ${idCdcs} không tồn tại và không có tên để tạo mới`);
            }
          }
        } else if (tenCdcs) {
          // Trường hợp không có ID nhưng có tên => tạo mới
          const newOrg = this.organizationRepository.create({
            name: tenCdcs,
            slCongNhanVienChucLdNam: 0,
            slCongNhanVienChucLdNu: 0,
            slCongDoanNam: 0,
            slCongDoanNu: 0
          });
          const savedOrg = await this.organizationRepository.save(newOrg);
          organizationId = savedOrg.id;
          organizationCache.set(savedOrg.id, savedOrg);
          warnings.push(`Đã tạo mới công đoàn cơ sở: "${tenCdcs}" với ID ${savedOrg.id}`);
        }

        // ============= XỬ LÝ CỤM KHU CÔNG NGHIỆP =============
        let cumKhuCnId: number | null = null;
        const idCumKcn = row.idCumKcn ? parseInt(row.idCumKcn.toString().trim()) : null;
        const tenCumKcn = row.cumKhuCn?.toString().trim();

        if (idCumKcn) {
          if (cumKhuCache.has(idCumKcn)) {
            cumKhuCnId = idCumKcn;
          } else {
            const existingCum = await this.cumKhuCongNghiepRepository.findOne({ where: { id: idCumKcn } });
            if (existingCum) {
              cumKhuCnId = idCumKcn;
              cumKhuCache.set(idCumKcn, existingCum);
            } else if (tenCumKcn) {
              const newCum = this.cumKhuCongNghiepRepository.create({ ten: tenCumKcn });
              const savedCum = await this.cumKhuCongNghiepRepository.save(newCum);
              cumKhuCnId = savedCum.id;
              cumKhuCache.set(savedCum.id, savedCum);
              warnings.push(`Đã tạo mới cụm KCN: "${tenCumKcn}" với ID ${savedCum.id}`);
            } else {
              errors.push(`ID Cụm KCN ${idCumKcn} không tồn tại và không có tên để tạo mới`);
            }
          }
        } else if (tenCumKcn) {
          const newCum = this.cumKhuCongNghiepRepository.create({ ten: tenCumKcn });
          const savedCum = await this.cumKhuCongNghiepRepository.save(newCum);
          cumKhuCnId = savedCum.id;
          cumKhuCache.set(savedCum.id, savedCum);
          warnings.push(`Đã tạo mới cụm KCN: "${tenCumKcn}" với ID ${savedCum.id}`);
        }

        // ============= XỬ LÝ XÃ PHƯỜNG =============
        let xaPhuongId: number | null = null;
        const idXaPhuong = row.idXaPhuong ? parseInt(row.idXaPhuong.toString().trim()) : null;
        const tenXaPhuong = row.xaPhuong?.toString().trim();

        if (idXaPhuong) {
          if (xaPhuongCache.has(idXaPhuong)) {
            xaPhuongId = idXaPhuong;
          } else {
            const existingXa = await this.xaPhuongRepository.findOne({ where: { id: idXaPhuong } });
            if (existingXa) {
              xaPhuongId = idXaPhuong;
              xaPhuongCache.set(idXaPhuong, existingXa);
            } else if (tenXaPhuong) {
              const newXa = this.xaPhuongRepository.create({ ten: tenXaPhuong });
              const savedXa = await this.xaPhuongRepository.save(newXa);
              xaPhuongId = savedXa.id;
              xaPhuongCache.set(savedXa.id, savedXa);
              warnings.push(`Đã tạo mới xã phường: "${tenXaPhuong}" với ID ${savedXa.id}`);
            } else {
              errors.push(`ID Xã phường ${idXaPhuong} không tồn tại và không có tên để tạo mới`);
            }
          }
        } else if (tenXaPhuong) {
          const newXa = this.xaPhuongRepository.create({ ten: tenXaPhuong });
          const savedXa = await this.xaPhuongRepository.save(newXa);
          xaPhuongId = savedXa.id;
          xaPhuongCache.set(savedXa.id, savedXa);
          warnings.push(`Đã tạo mới xã phường: "${tenXaPhuong}" với ID ${savedXa.id}`);
        }

        // Nếu có lỗi validation, bỏ qua dòng này
        if (errors.length > 0) {
          result.errorCount++;
          result.errors[rowIndex] = errors;
          continue;
        }

        // ============= TẠO USERNAME THEO VAI TRÒ =============
        let entityNameForUsername = '';
        if (role.description.toUpperCase().includes('CDCS') || role.description.toUpperCase().includes('CÔNG ĐOÀN CƠ SỞ')) {
          // Vai trò CDCS cần organization ID
          if (!organizationId) {
            errors.push('Vai trò CDCS yêu cầu có Công đoàn cơ sở');
            result.errorCount++;
            result.errors[rowIndex] = errors;
            continue;
          }
        } else if (role.description.toUpperCase().includes('CKCN') || role.description.toUpperCase().includes('CỤM KHU')) {
          entityNameForUsername = tenCumKcn || '';
        } else if (role.description.toUpperCase().includes('XP') || role.description.toUpperCase().includes('XÃ PHƯỜNG') || role.description.toUpperCase().includes('PHƯỜNG THÀNH')) {
          entityNameForUsername = tenXaPhuong || '';
        }

        const userName = this.generateUsernameByRole(
          row.hoVaTen.toString().trim(),
          role.description,
          organizationId,
          entityNameForUsername
        );

        // ============= KIỂM TRA USER TỒN TẠI =============
        let user = await this.userRepository.findOne({ where: { userName } });
        let isNewUser = false;

        if (user) {
          // User đã tồn tại => chỉ liên kết Zalo, không tạo mới
          warnings.push(`User đã tồn tại với username "${userName}". Chỉ liên kết Zalo.`);
        } else {
          // ============= TẠO USER MỚI =============
          // Kiểm tra trùng email/sdt/cmnd trước khi tạo
          const existingUserByEmail = await this.userRepository.findOne({ where: { email: row.email.toString().trim() } });
          if (existingUserByEmail) {
            errors.push(`Email "${row.email}" đã tồn tại trong hệ thống`);
          }

          if (row.sdt) {
            const existingUserByPhone = await this.userRepository.findOne({ where: { phoneNumber: row.sdt.toString().trim() } });
            if (existingUserByPhone) {
              errors.push(`Số điện thoại "${row.sdt}" đã tồn tại trong hệ thống`);
            }
          }

          if (row.cmndCccd) {
            const existingUserByIdentity = await this.userRepository.findOne({ where: { identity: row.cmndCccd.toString().trim() } });
            if (existingUserByIdentity) {
              errors.push(`CMND/CCCD "${row.cmndCccd}" đã tồn tại trong hệ thống`);
            }
          }

          if (errors.length > 0) {
            result.errorCount++;
            result.errors[rowIndex] = errors;
            continue;
          }

          const userData: Partial<User> = {
            userName,
            fullName: row.hoVaTen.toString().trim(),
            email: row.email.toString().trim(),
            phoneNumber: row.sdt?.toString().trim() || null,
            identity: row.cmndCccd?.toString().trim() || `auto_${Date.now()}_${i}`,
            passWord: await this.hashPassword(DEFAULT_PASSWORD),
            roleId,
            organizationId,
            cumKhuCnId,
            xaPhuongId,
            isActive: 1,
          };

          user = this.userRepository.create(userData);
          await this.userRepository.save(user);
          isNewUser = true;

          result.successCount++;
          result.createdIds.push(user.id);
          warnings.push(`✅ Đã tạo user mới với username: ${userName}`);
        }

        // ============= LIÊN KẾT ZALO =============
        if (row.sdt) {
          try {
            const linkedZaloAccount = await this.zaloAccountService.autoLinkByPhoneNumber(
              user.id,
              row.sdt.toString().trim()
            );

            if (linkedZaloAccount) {
              result.zaloLinkedCount = (result.zaloLinkedCount || 0) + 1;
              warnings.push(`✅ Đã liên kết với tài khoản Zalo: ${linkedZaloAccount.displayName || linkedZaloAccount.phone}`);
            } else {
              result.zaloNotFoundCount = (result.zaloNotFoundCount || 0) + 1;
              warnings.push(`⚠️ Không tìm thấy tài khoản Zalo chưa liên kết với SĐT ${row.sdt}`);
            }
          } catch (error) {
            console.error(`Lỗi khi liên kết Zalo cho user ${user.id}:`, error);
            warnings.push(`⚠️ Lỗi khi liên kết Zalo: ${error.message}`);
            result.zaloNotFoundCount = (result.zaloNotFoundCount || 0) + 1;
          }
        } else {
          warnings.push(`⚠️ Không có SĐT để liên kết Zalo`);
        }

        // Lưu warnings nếu có
        if (warnings.length > 0) {
          result.errors[rowIndex] = warnings;
        }

        // Chỉ tăng successCount nếu tạo user mới
        if (!isNewUser && warnings.length === 0) {
          // Nếu không tạo user mới và không có warning gì => chỉ link Zalo thành công
          result.successCount++;
        }

      } catch (error) {
        result.errorCount++;
        const errorMessage = `Lỗi không xác định: ${error.message || 'Unknown error'}`;
        result.errors[rowIndex] = result.errors[rowIndex] || [];
        result.errors[rowIndex].push(errorMessage);
      }
    }

    return result;
  }

  /**
   * Tạo file Excel với highlight lỗi cho import với Zalo link
   */
  private createZaloLinkErrorExcelFile(
    originalWorksheet: XLSX.WorkSheet,
    errors: { [rowIndex: number]: string[] },
    data: any[]
  ): Buffer {
    // Tạo workbook mới
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([]);

    // Row 0: Tiêu đề chính
    const titleRow = ['Nhập dữ liệu tài khoản người dùng và liên kết Zalo'];
    XLSX.utils.sheet_add_aoa(worksheet, [titleRow], { origin: 0 });

    // Row 1: Header các cột (13 cột)
    const headers = [
      'STT',
      'Họ và tên',
      'Email',
      'SĐT Đăng ký Zalo',
      'CMND/CCCD',
      'Vai trò',
      'Công đoàn cơ sở',
      'ID CĐCS',
      'Cụm khu CN',
      'ID Cụm KCN',
      'Xã phường',
      'ID xã phường',
      'Tên tài khoản Zalo',
      'Kết quả'
    ];
    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 1 });

    // Row 2+: Thêm dữ liệu với cột kết quả
    data.forEach((row, index) => {
      const rowIndex = index + 1;
      const messages = errors[rowIndex] || [];
      const rowData = [
        row.stt || index + 1,
        row.hoVaTen,
        row.email,
        row.sdt,
        row.cmndCccd,
        row.vaiTro,
        row.congDoanCoSo,
        row.idCdcs,
        row.cumKhuCn,
        row.idCumKcn,
        row.xaPhuong,
        row.idXaPhuong,
        row.tenTaiKhoanZalo,
        messages.join('; ')
      ];

      XLSX.utils.sheet_add_aoa(worksheet, [rowData], { origin: index + 2 });
    });

    // Merge title cells (13 cột + 1 cột kết quả = 14 cột)
    worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }];

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },  // STT
      { wch: 25 }, // Họ và tên
      { wch: 30 }, // Email
      { wch: 15 }, // SĐT Zalo
      { wch: 15 }, // CMND
      { wch: 20 }, // Vai trò
      { wch: 30 }, // Công đoàn
      { wch: 10 }, // ID CĐCS
      { wch: 20 }, // Cụm khu
      { wch: 10 }, // ID Cụm KCN
      { wch: 20 }, // Xã phường
      { wch: 10 }, // ID xã phường
      { wch: 25 }, // Tên TK Zalo
      { wch: 60 }  // Kết quả
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Import Result');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
  }
}

