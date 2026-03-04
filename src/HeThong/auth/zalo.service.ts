import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
// ...existing code...
import { ZaloAccountInfoDto, ZaloAuthResponseDto, ZaloLoginDto } from './dto/zalo-auth.dto';
import { ZaloAccountService } from './zalo-account.service';
import { ZaloOASimpleTokenService } from './zalo-oa-simple-token.service';
import { ZaloTokenService } from './zalo-token.service';

@Injectable()
export class ZaloService {
  private readonly zaloAppId: string;
  private readonly zaloAppSecret: string;
  private readonly zaloOAuthUrl: string;
  private readonly zaloGraphApiUrl: string;
  // OAuth credentials - dùng ZALO_APP_ID cho OAuth flow
  private readonly appId = process.env.ZALO_APP_ID;
  private readonly appSecret = process.env.ZALO_APP_SECRET;
  private readonly redirectUri = process.env.ZALO_REDIRECT_URI;
  constructor(
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly http: HttpService,
    private readonly tokenService: ZaloTokenService,
    private readonly zaloAccountService: ZaloAccountService,
    private readonly zaloOASimpleTokenService: ZaloOASimpleTokenService,
  ) {
    this.zaloAppId = (configService.get<string>('ZALO_APP_ID') || process.env.ZALO_APP_ID || '').trim();
    this.zaloAppSecret = (configService.get<string>('ZALO_APP_SECRET') || process.env.ZALO_APP_SECRET || '').trim();
    this.zaloOAuthUrl = configService.get<string>('ZALO_API_URL') || process.env.ZALO_API_URL || 'https://oauth.zaloapp.com/v4';
    this.zaloGraphApiUrl = configService.get<string>('ZALO_GRAPH_API_URL') || process.env.ZALO_GRAPH_API_URL || 'https://graph.zalo.me/v2.0';

    console.log('Zalo Config:', {
      appId: this.zaloAppId ? this.zaloAppId.substring(0, 5) + '...' : 'NOT_SET',
      appSecret: this.zaloAppSecret ? this.zaloAppSecret.substring(0, 5) + '...' : 'NOT_SET',
      oauthUrl: this.zaloOAuthUrl,
      graphApiUrl: this.zaloGraphApiUrl,
      appIdLength: this.zaloAppId?.length,
      appSecretLength: this.zaloAppSecret?.length,
      // Debug: kiểm tra source của config
      configSource: {
        fromConfigService: configService.get<string>('ZALO_APP_SECRET') ? 'YES' : 'NO',
        fromProcessEnv: process.env.ZALO_APP_SECRET ? 'YES' : 'NO',
        secretLastChars: this.zaloAppSecret ? '...' + this.zaloAppSecret.slice(-4) : 'NOT_SET'
      }
    });

    // Validate config
    if (!this.zaloAppId || !this.zaloAppSecret) {
      console.error('❌ ZALO_APP_ID hoặc ZALO_APP_SECRET không được cấu hình!');
    }
  }

  /**
   * Xác thực người dùng qua Zalo Mini App
   */
  async authenticateZaloUser(loginDto: ZaloLoginDto): Promise<ZaloAuthResponseDto> {
    try {
      // 1) Lấy access token: ưu tiên exchange code, fallback accessToken (giữ nguyên)
      let zaloAccessToken: string | null = null;

      if (loginDto.code) {
        try {
          zaloAccessToken = await this.exchangeCodeForAccessToken(loginDto.code);
        } catch (codeError: any) {
          console.log('Đổi code thất bại, thử dùng accessToken:', codeError?.message);
        }
      }
      if (!zaloAccessToken && loginDto.accessToken) {
        zaloAccessToken = loginDto.accessToken;
      }
      if (!zaloAccessToken) {
        throw new BadRequestException('Cần có access token hoặc authorization code hợp lệ');
      }

      // 2) Verify token & lấy user info (giữ nguyên)
      const zaloUserInfo = await this.getZaloUserInfo(zaloAccessToken);
      const appUserId = zaloUserInfo?.zalo_app_user_id;

      // 3) Tìm ZaloAccount với OR fallback (gộp 2 truy vấn thành 1; logic y hệt)
      const FALLBACK_APP_USER_ID = "6017443080486385501";
      const accountWhere = appUserId
        ? [{ zaloAppUserId: appUserId }, { zaloAppUserId: FALLBACK_APP_USER_ID }]
        : [{ zaloAppUserId: FALLBACK_APP_USER_ID }];

      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: [{ zaloAppUserId: appUserId }], // TypeORM 0.3 chấp nhận mảng OR
        // where: accountWhere
      });


      // 4) Tìm "zaloUser" (vẫn từ cùng repository & cùng fallback như bạn đang làm)
      const zaloUser = await this.zaloAccountRepository.findOne({
        where: [{ zaloAppUserId: appUserId }],
        // where: accountWhere,
        relations: ['user'],
      });

      // ❌ COMMENT: Tự động liên kết theo số điện thoại (tạm thời tắt)
      // const user = await this.userRepository.findOne({ where: { phoneNumber: zaloUser?.phone } });
      // if (user && !zaloAccount.userId) {
      //   zaloAccount.userId = user.id;
      // }

      if (!zaloAccount.userId || zaloAccount.userId === null) {
        throw new UnauthorizedException('Zalo Account chưa được liên kết với tài khoản web');
      }
      console.log('zaloUser from DB:', zaloUser);

      // 5) Sync userId (giữ nguyên điều kiện & hành vi; vẫn lưu qua cùng repo)
      if (zaloAccount && zaloUser && zaloAccount.userId && zaloUser.userId !== zaloAccount.userId) {
        zaloUser.userId = zaloAccount.userId;
        zaloUser.user = zaloAccount.user;
        await this.zaloAccountRepository.save(zaloUser);
        console.log(`🔗 Synced userId ${zaloAccount.userId} from ZaloAccount to ZaloUser`);
      }

      // 6) Tạo JWT (giữ nguyên payload như bạn viết)
      if (!zaloUser) {
        // trước đây đoạn dưới sẽ crash và bị catch -> Unauthorized;
        // explicit throw để kết quả vẫn tương đương
        throw new Error('zaloUser not found');
      }

      const payload = {
        sub: zaloUser.userId,                         // (giữ nguyên comment & field)
        zaloId: zaloUser.zaloAppUserId,
        userId: zaloUser.user?.id || zaloUser.userId,
        name: zaloUser.displayName,
        phone: zaloUser.phone,
        type: 'zalo',
      };
      console.log(payload, 'payload token');

      const accessToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('ZALO_JWT_SECRET') || 'zalo-secret-key',
        expiresIn: '24h',
      });

      return { accessToken, expiresIn: 86400 };
    } catch (error: any) {
      throw new UnauthorizedException('Xác thực Zalo thất bại: ' + (error?.message ?? error));
    }
  }


  /**
   * Đổi authorization code lấy access token
   */
  private async exchangeCodeForAccessToken(code: string): Promise<string> {
    try {
      console.log('Đổi code thành token:', {
        app_id: this.zaloAppId,
        app_secret: this.zaloAppSecret ? this.zaloAppSecret.substring(0, 5) + '...' : 'NOT_SET',
        code: code.substring(0, 10) + '...',
        grant_type: 'authorization_code',
        url: `${this.zaloOAuthUrl}/access_token`
      });

      console.log('Secret debug:', {
        length: this.zaloAppSecret.length,
        firstChar: this.zaloAppSecret.charAt(0),
        lastChar: this.zaloAppSecret.charAt(this.zaloAppSecret.length - 1),
        hasSpaces: this.zaloAppSecret.includes(' ')
      });

      let response;

      // Method 1: Thử GET request
      try {
        const getUrl = `${this.zaloOAuthUrl}/access_token?app_id=${encodeURIComponent(this.zaloAppId)}&app_secret=${encodeURIComponent(this.zaloAppSecret)}&code=${encodeURIComponent(code)}&grant_type=authorization_code`;
        console.log('Trying GET method...');

        response = await axios.get(getUrl);
        console.log('GET method success!');
      } catch (getError) {
        console.log('GET method failed, trying POST URLEncoded...');

        // Method 2: POST với URLSearchParams
        try {
          const params = new URLSearchParams();
          params.append('app_id', this.zaloAppId);
          params.append('app_secret', this.zaloAppSecret);
          params.append('code', code);
          params.append('grant_type', 'authorization_code');

          console.log('Request params:', params.toString());

          response = await axios.post(`${this.zaloOAuthUrl}/access_token`, params, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          console.log('POST URLEncoded success!');
        } catch (urlEncodedError) {
          console.log('URLEncoded failed, trying JSON format...');

          // Method 3: POST với JSON
          const jsonData = {
            app_id: this.zaloAppId,
            app_secret: this.zaloAppSecret,
            code: code,
            grant_type: 'authorization_code'
          };

          response = await axios.post(`${this.zaloOAuthUrl}/access_token`, jsonData, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          console.log('POST JSON success!');
        }
      }

      console.log('Zalo OAuth Response:', JSON.stringify(response.data, null, 2));

      if (response.data.error) {
        throw new UnauthorizedException(`Zalo OAuth error: ${response.data.error} - ${response.data.error_description}`);
      }

      if (!response.data.access_token) {
        throw new UnauthorizedException('Không nhận được access token từ Zalo');
      }

      return response.data.access_token;
    } catch (error) {
      console.error('Exchange code error:', error.response?.data || error.message);

      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.error_description || error.response?.data?.message || 'Lỗi kết nối Zalo OAuth';
        throw new UnauthorizedException(`Không thể đổi authorization code: ${errorMsg}`);
      }
      throw new UnauthorizedException(`Không thể đổi authorization code: ${error.message}`);
    }
  }

  /**
   * Lấy thông tin user từ Zalo API
   */
  private async getZaloUserInfo(accessToken: string): Promise<ZaloAccountInfoDto> {
    try {
      console.log('Gọi Zalo API với token:', accessToken.substring(0, 10) + '...');

      const response = await axios.get(`${this.zaloGraphApiUrl}/me`, {
        headers: {
          'access_token': accessToken
        }
      });

      console.log('Zalo API Response:', JSON.stringify(response.data, null, 2));

      if (response.data.error) {
        throw new BadRequestException(`Token Zalo không hợp lệ: ${response.data.error} - ${response.data.message || response.data.error_description}`);
      }

      // Zalo API trả về direct object, không có nested data field
      const userData = response.data;

      if (!userData || !userData.id) {
        throw new BadRequestException('Không lấy được thông tin user từ Zalo API');
      }

      return {
        zalo_app_user_id: userData.id,
        display_name: userData.name || 'Người dùng Zalo',
        phone: userData.phone || null, // Zalo thường không trả phone
        avatar: userData.picture?.data?.url || userData.avatar || null
      };

    } catch (error) {
      console.error('Zalo API Error:', error.response?.data || error.message);

      if (axios.isAxiosError(error)) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error_description || 'Không thể kết nối đến Zalo API';
        throw new BadRequestException(`Zalo API Error: ${errorMsg}`);
      }
      throw error;
    }
  }

  /**
   * Liên kết ZaloUser với User hệ thống (Manual Linking)
   */
  async linkZaloUserWithSystemUser(zaloId: string, systemUserId: string): Promise<ZaloAccount> {
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { zaloId }
    });

    if (!zaloUser) {
      throw new BadRequestException('Không tìm thấy người dùng Zalo');
    }

    const systemUser = await this.userRepository.findOne({
      where: { id: systemUserId }
    });

    if (!systemUser) {
      throw new BadRequestException('Không tìm thấy người dùng hệ thống');
    }

    // Kiểm tra xem systemUser đã link với ZaloUser khác chưa
    const existingLink = await this.zaloAccountRepository.findOne({
      where: { userId: systemUserId }
    });

    if (existingLink && existingLink.zaloAppUserId !== zaloId) {
      throw new BadRequestException(`User ${systemUserId} đã được liên kết với Zalo user khác: ${existingLink.zaloAppUserId}`);
    }

    zaloUser.userId = systemUserId;
    zaloUser.additionalInfo = {
      ...zaloUser.additionalInfo,
      linkMethod: 'manual_linked',
      linkedAt: new Date().toISOString(),
      linkedUserId: systemUserId
    };

    const savedZaloUser = await this.zaloAccountRepository.save(zaloUser);
    console.log(`🔗 Manual link successful: Zalo ${zaloId} → User ${systemUserId}`);

    return savedZaloUser;
  }

  /**
   * Tìm User hệ thống theo phone/email/identity để manual linking
   */
  async findSystemUserForLinking(criteria: {
    phone?: string;
    email?: string;
    identity?: string;
  }): Promise<User[]> {
    const whereConditions = [];

    if (criteria.phone) {
      whereConditions.push({ phoneNumber: criteria.phone });
    }
    if (criteria.email) {
      whereConditions.push({ email: criteria.email });
    }
    if (criteria.identity) {
      whereConditions.push({ identity: criteria.identity });
    }

    if (whereConditions.length === 0) {
      throw new BadRequestException('Cần ít nhất một tiêu chí tìm kiếm (phone/email/identity)');
    }

    const users = await this.userRepository.find({
      where: whereConditions,
      select: ['id', 'fullName', 'phoneNumber', 'email', 'identity', 'isActive']
    });

    return users.filter(user => user.isActive === 1);
  }

  /**
   * Kiểm tra trạng thái liên kết của ZaloUser
   */
  async checkZaloUserLinkStatus(zaloId: string): Promise<{
    isLinked: boolean;
    linkMethod?: string;
    linkedUser?: Partial<User>;
    canAutoLink?: boolean;
    suggestedUsers?: Partial<User>[];
  }> {
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { zaloAppUserId: zaloId },
      relations: ['user']
    });

    if (!zaloUser) {
      throw new NotFoundException('Không tìm thấy ZaloUser');
    }

    const result = {
      isLinked: !!zaloUser.userId,
      linkMethod: zaloUser.additionalInfo?.linkMethod,
      linkedUser: zaloUser.user ? {
        id: zaloUser.user.id,
        fullName: zaloUser.user.fullName,
        phoneNumber: zaloUser.user.phoneNumber,
        email: zaloUser.user.email
      } : undefined,
      canAutoLink: false,
      suggestedUsers: []
    };

    // Nếu chưa link và có phone, tìm suggested users
    if (!result.isLinked && zaloUser.phone) {
      const suggestedUsers = await this.findSystemUserForLinking({
        phone: zaloUser.phone
      });

      result.suggestedUsers = suggestedUsers.map(user => ({
        id: user.id,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        email: user.email
      }));

      result.canAutoLink = suggestedUsers.length === 1;
    }

    return result;
  }

  /**
   * Hủy liên kết ZaloUser với User hệ thống
   */
  async unlinkZaloUser(zaloId: string): Promise<{
    success: boolean;
    message: string;
    unlinkedAt?: string;
  }> {
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { zaloAppUserId: zaloId },
      relations: ['user']
    });

    if (!zaloUser) {
      throw new NotFoundException('Không tìm thấy ZaloUser');
    }

    if (!zaloUser.userId) {
      return {
        success: false,
        message: 'Tài khoản chưa được liên kết với user hệ thống'
      };
    }

    const previousUserId = zaloUser.userId;
    zaloUser.userId = null;
    zaloUser.additionalInfo = {
      ...zaloUser.additionalInfo,
      unlinkedAt: new Date().toISOString(),
      unlinkedMethod: 'manual',
      previousUserId
    };

    await this.zaloAccountRepository.save(zaloUser);

    console.log(`🔗❌ Unlinked ZaloUser ${zaloId} from User ${previousUserId}`);

    return {
      success: true,
      message: 'Hủy liên kết tài khoản thành công',
      unlinkedAt: new Date().toISOString()
    };
  }

  /**
   * Lấy danh sách ZaloUser
   */
  async getZaloUsers(): Promise<ZaloAccount[]> {
    return await this.zaloAccountRepository.find({
      relations: ['user'],
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * Verify Zalo signature (cho webhook)
   */
  verifyZaloSignature(body: string, signature: string): boolean {
    const expectedSignature = CryptoJS.HmacSHA256(body, this.zaloAppSecret).toString();
    return expectedSignature === signature;
  }

  /**
   * Debug Zalo configuration
   */
  async debugConfig(): Promise<any> {
    return {
      appId: {
        value: this.zaloAppId,
        length: this.zaloAppId?.length,
        fromEnv: process.env.ZALO_APP_ID,
        fromConfig: this.configService.get<string>('ZALO_APP_ID')
      },
      appSecret: {
        value: this.zaloAppSecret ? this.zaloAppSecret.substring(0, 8) + '...' : 'NOT_SET',
        length: this.zaloAppSecret?.length,
        fromEnv: process.env.ZALO_APP_SECRET ? process.env.ZALO_APP_SECRET.substring(0, 8) + '...' : 'NOT_SET',
        fromConfig: this.configService.get<string>('ZALO_APP_SECRET') ? this.configService.get<string>('ZALO_APP_SECRET').substring(0, 8) + '...' : 'NOT_SET'
      },
      urls: {
        oauth: this.zaloOAuthUrl,
        graphApi: this.zaloGraphApiUrl
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Tìm ZaloUser theo zaloId với thông tin user web
   */
  async findZaloUserByZaloId(zaloId: string): Promise<ZaloAccount | null> {
    try {
      return await this.zaloAccountRepository.findOne({
        where: { zaloAppUserId: zaloId },
        relations: ['user']
      });
    } catch (error) {
      console.error('Error finding ZaloUser by zaloId:', error);
      return null;
    }
  }

  async forceLinkZaloUser(zaloId: string) {
    console.log('🔧 Force link ZaloUser:', zaloId);

    // Tìm ZaloUser
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { zaloAppUserId: zaloId }
    });

    if (!zaloUser) {
      throw new NotFoundException('ZaloUser không tồn tại');
    }

    console.log('✅ Tìm thấy ZaloUser:', zaloUser);

    // Nếu đã có userId rồi thì không cần tạo nữa
    if (zaloUser.userId) {
      return {
        success: true,
        message: 'ZaloUser đã được link với User hệ thống',
        zaloUser,
        userId: zaloUser.userId
      };
    }

    // Tạo User hệ thống mới
    const systemUser = this.userRepository.create({
      fullName: zaloUser.displayName || `User-${zaloId}`,
      phoneNumber: zaloUser.phone,
      isActive: 1,
      passWord: 'zalo_generated',
      roleId: 1
    });

    const savedUser = await this.userRepository.save(systemUser);
    console.log('✅ Đã tạo User hệ thống:', savedUser);

    // Update ZaloUser với userId mới
    zaloUser.userId = savedUser.id;
    await this.zaloAccountRepository.save(zaloUser);

    console.log('✅ Đã link ZaloUser với User hệ thống:', {
      zaloUserId: zaloUser.id,
      systemUserId: savedUser.id
    });

    return {
      success: true,
      message: 'Đã tạo và link thành công',
      zaloUser,
      systemUser: savedUser
    };
  }

  async getUnlinkedZaloUsers() {
    const unlinkedUsers = await this.zaloAccountRepository.find({
      where: { userId: null },
      order: { createdAt: 'DESC' }
    });

    return {
      success: true,
      data: unlinkedUsers,
      total: unlinkedUsers.length,
      message: `Có ${unlinkedUsers.length} ZaloUser chưa được link`
    };
  }

  async adminLinkUsers(zaloUserId: string, systemUserId: string) {
    // Tìm ZaloUser
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { id: parseInt(zaloUserId) }
    });

    if (!zaloUser) {
      throw new NotFoundException('ZaloUser không tồn tại');
    }

    // Tìm User hệ thống
    const systemUser = await this.userRepository.findOne({
      where: { id: systemUserId }
    });

    if (!systemUser) {
      throw new NotFoundException('User hệ thống không tồn tại');
    }

    // Link
    zaloUser.userId = systemUserId;
    await this.zaloAccountRepository.save(zaloUser);

    return {
      success: true,
      message: 'Link thành công',
      data: {
        zaloUser: {
          id: zaloUser.id,
          zaloAppUserId: zaloUser.zaloAppUserId,
          name: zaloUser.displayName
        },
        systemUser: {
          id: systemUser.id,
          fullName: systemUser.fullName,
          phoneNumber: systemUser.phoneNumber
        }
      }
    };
  }

  /**
   * Tự động match ZaloUser với User existing dựa trên tên tương tự
   */
  async autoMatchByName(zaloUserId: string) {
    const zaloUser = await this.zaloAccountRepository.findOne({
      where: { id: parseInt(zaloUserId) }
    });

    if (!zaloUser || zaloUser.userId) {
      return { success: false, message: 'ZaloUser không tồn tại hoặc đã được link' };
    }

    // Tìm Users có tên tương tự
    const similarUsers = await this.userRepository.createQueryBuilder('user')
      .where('user.fullName LIKE :name', { name: `%${zaloUser.displayName}%` })
      .orWhere(':zaloName LIKE CONCAT("%", user.fullName, "%")', { zaloName: zaloUser.displayName })
      .getMany();

    return {
      success: true,
      zaloUser,
      suggestedUsers: similarUsers.map(u => ({
        id: u.id,
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        organizationId: u.organizationId
      })),
      message: `Tìm thấy ${similarUsers.length} User có tên tương tự`
    };
  }

  // ==================== AUTO LINK METHODS ====================

  /**
   * Tự động liên kết tài khoản Zalo với User hệ thống dựa trên SĐT
   */
  async autoLinkAccount(zaloId: string, linkDto: { phone?: string; email?: string; identity?: string }) {
    try {
      // 1. Tìm ZaloUser
      const zaloUser = await this.zaloAccountRepository.findOne({
        where: { zaloAppUserId: zaloId },
        relations: ['user']
      });

      if (!zaloUser) {
        throw new BadRequestException('Không tìm thấy người dùng Zalo');
      }

      // 2. Nếu đã liên kết rồi thì return
      if (zaloUser.userId) {
        return {
          linked: true,
          user: zaloUser.user,
          message: 'Tài khoản đã được liên kết từ trước'
        };
      }

      let systemUser = null;

      // 3. Tìm User hệ thống theo SĐT (ưu tiên)
      if (linkDto.phone) {
        systemUser = await this.userRepository.findOne({
          where: { phoneNumber: linkDto.phone }
        });

        if (systemUser) {
          console.log(`✅ Tìm thấy User theo SĐT: ${linkDto.phone} → ${systemUser.id}`);
        }
      }

      // 4. Nếu không tìm thấy theo SĐT, thử tìm theo email
      if (!systemUser && linkDto.email) {
        systemUser = await this.userRepository.findOne({
          where: { email: linkDto.email }
        });

        if (systemUser) {
          console.log(`✅ Tìm thấy User theo email: ${linkDto.email} → ${systemUser.id}`);
        }
      }

      // 5. Nếu không tìm thấy theo email, thử tìm theo identity (CCCD/mã NV)
      if (!systemUser && linkDto.identity) {
        systemUser = await this.userRepository.findOne({
          where: { identity: linkDto.identity }
        });

        if (systemUser) {
          console.log(`✅ Tìm thấy User theo identity: ${linkDto.identity} → ${systemUser.id}`);
        }
      }

      // 6. Nếu tìm thấy User, thực hiện liên kết
      if (systemUser) {
        // Kiểm tra User này đã liên kết với Zalo khác chưa
        const existingLink = await this.zaloAccountRepository.findOne({
          where: { userId: systemUser.id }
        });

        if (existingLink && existingLink.zaloAppUserId !== zaloId) {
          return {
            linked: false,
            user: null,
            message: 'Tài khoản hệ thống này đã được liên kết với một tài khoản Zalo khác'
          };
        }

        // Thực hiện liên kết
        zaloUser.userId = systemUser.id;
        await this.zaloAccountRepository.save(zaloUser);

        console.log(`🔗 Đã liên kết thành công: ZaloID ${zaloId} ↔ UserID ${systemUser.id}`);

        return {
          linked: true,
          user: {
            id: systemUser.id,
            fullName: systemUser.fullName,
            phoneNumber: systemUser.phoneNumber,
            email: systemUser.email,
            organizationId: systemUser.organizationId
          },
          message: 'Tự động liên kết tài khoản thành công'
        };
      }

      // 7. Không tìm thấy User nào phù hợp
      return {
        linked: false,
        user: null,
        message: 'Không tìm thấy tài khoản hệ thống phù hợp với thông tin đã cung cấp'
      };

    } catch (error) {
      console.error('❌ Lỗi auto link account:', error);
      throw new BadRequestException(`Lỗi liên kết tự động: ${error.message}`);
    }
  }

  /**
   * Kiểm tra trạng thái liên kết của tài khoản Zalo
   */
  async checkLinkStatus(zaloId: string) {
    try {
      const zaloUser = await this.zaloAccountRepository.findOne({
        where: { zaloId },
        relations: ['user']
      });

      if (!zaloUser) {
        throw new BadRequestException('Không tìm thấy người dùng Zalo');
      }

      const isLinked = !!zaloUser.userId;

      return {
        isLinked,
        linkedUser: isLinked ? {
          id: zaloUser.user?.id,
          fullName: zaloUser.user?.fullName,
          phoneNumber: zaloUser.user?.phoneNumber,
          email: zaloUser.user?.email,
          organizationId: zaloUser.user?.organizationId
        } : null,
        zaloInfo: {
          zaloAppUserId: zaloUser.zaloAppUserId,
          name: zaloUser.displayName,
          phone: zaloUser.phone,
          avatar: zaloUser.avatar
        },
        linkDate: isLinked ? zaloUser.updatedAt : null
      };

    } catch (error) {
      console.error('❌ Lỗi check link status:', error);
      throw new BadRequestException(`Lỗi kiểm tra trạng thái liên kết: ${error.message}`);
    }
  }

  /**
   * Tự động thử liên kết bằng SĐT từ Zalo profile
   */
  async autoLinkByZaloPhone(zaloId: string) {
    try {
      const zaloUser = await this.zaloAccountRepository.findOne({
        where: { zaloAppUserId: zaloId },
        relations: ['user']
      });

      if (!zaloUser || zaloUser.userId) {
        return { linked: !!zaloUser?.userId, message: 'Đã liên kết hoặc không tìm thấy ZaloUser' };
      }

      if (!zaloUser.phone) {
        return { linked: false, message: 'Zalo user không có số điện thoại' };
      }

      // Tự động liên kết bằng SĐT từ Zalo
      return await this.autoLinkAccount(zaloId, { phone: zaloUser.phone });

    } catch (error) {
      console.error('❌ Lỗi auto link by Zalo phone:', error);
      return { linked: false, message: `Lỗi: ${error.message}` };
    }
  }

  // Sinh chuỗi ngẫu nhiên
  private randomString(len = 64) {
    return crypto.randomBytes(len).toString('base64url').substring(0, len);
  }

  // Sinh code_challenge từ code_verifier
  private generateChallenge(verifier: string) {
    return crypto.createHash('sha256').update(verifier).digest('base64url');
  }

  // 🔹 B1: Tạo URL xác thực OA (Simple OAuth - theo tài liệu Zalo)
  async generateSimpleAuthUrl() {
    const state = this.randomString(32);

    console.log('===== SIMPLE OAUTH FLOW (theo tài liệu Zalo OA) =====');
    console.log('STATE:', state);
    console.log('REDIRECT_URI:', this.redirectUri);
    console.log('APP_ID:', this.appId);
    console.log('======================================================');

    // Tạo authorization URL theo format của Zalo
    const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${this.appId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&state=${state}`;

    return {
      authUrl,
      state,
      redirectUri: this.redirectUri,
      appId: this.appId
    };
  }

  // 🔹 B1: Tạo URL xác thực OA (PKCE Flow - bảo mật cao hơn)
  async generateAuthUrl() {
    const state = this.randomString(32);
    const codeVerifier = this.randomString(64);
    const codeChallenge = this.generateChallenge(codeVerifier);

    // 📋 In ra cho admin copy vào Zalo Developer
    console.log('� ===== COPY THESE VALUES TO ZALO DEVELOPER =====');
    console.log('STATE:', state);
    console.log('CODE_CHALLENGE:', codeChallenge);
    console.log('CODE_VERIFIER:', codeVerifier); // 🔍 Debug: xem code_verifier
    console.log('CODE_CHALLENGE_METHOD: S256');
    console.log('REDIRECT_URI:', this.redirectUri);
    console.log('APP_ID:', this.appId);
    console.log('==================================================');

    // 📋 Trả về luôn để admin copy dễ dàng
    return {
      success: true,
      message: 'Copy 2 giá trị này vào Zalo Developer',
      data: {
        state,
        code_challenge: codeChallenge,
        code_verifier: codeVerifier // 🔧 Thêm để test thủ công
      },
      // Thông tin bổ sung (optional)
      info: {
        code_challenge_method: 'S256',
        redirect_uri: this.redirectUri,
        app_id: this.appId,
        instruction: 'Paste STATE và CODE_CHALLENGE vào form Zalo Developer'
      }
    };
  }

  // 🔹 B2: Đổi code lấy access_token
  async exchangeToken(
    code: string, 
    state: string, 
    codeVerifierOverride?: string,
    appIdOverride?: string,
    secretKeyOverride?: string
  ) {
    const appId = appIdOverride || this.appId;
    const appSecret = secretKeyOverride || this.appSecret;

    console.log('🔍 Debug exchangeToken:', { 
      code: code?.substring(0, 20) + '...', 
      state, 
      appId: appId?.substring(0, 10) + '...',
      hasAppIdOverride: !!appIdOverride,
      hasCodeVerifierOverride: !!codeVerifierOverride 
    });

    // ✅ Lấy code_verifier từ override param
    const codeVerifier = codeVerifierOverride;
    
    if (!codeVerifier) {
      console.error('❌ Missing code_verifier parameter');
      throw new Error('code_verifier is required for token exchange');
    }
    console.log('✅ Using code_verifier from param');

    const body = new URLSearchParams({
      app_id: appId,
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
    });

    console.log('📤 Calling Zalo API with:', {
      url: 'https://oauth.zaloapp.com/v4/oa/access_token',
      app_id: appId,
      has_secret_key: !!appSecret,
      code_verifier_length: codeVerifier.length
    });

    const response = await firstValueFrom(
      this.http.post('https://oauth.zaloapp.com/v4/oa/access_token', body.toString(), {
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': appSecret
        },
      }),
    );
    const data = (response as any).data;

    console.log('🔍 Zalo API Response:', JSON.stringify(data, null, 2));

    // Kiểm tra lỗi từ Zalo
    if (data.error && data.error !== 0) {
      throw new Error(`Zalo API Error ${data.error}: ${data.error_description || data.error_name}`);
    }

    await this.tokenService.saveToken(data);
    return { message: 'Lấy access_token thành công', data };
  }

  // 🔹 B3: Làm mới token
  async refreshToken() {
    const token = await this.tokenService.getToken();
    if (!token?.refresh_token) throw new Error('Chưa có refresh_token');

    const body = new URLSearchParams({
      app_id: this.appId,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
      app_secret: this.appSecret,
    });

    const response = await firstValueFrom(
      this.http.post('https://oauth.zaloapp.com/v4/oa/access_token', body.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );
    const data = (response as any).data;

    await this.tokenService.saveToken(data);
    return { message: 'Refresh thành công', data };
  }

  /**
   * 💾 Lưu token từ OAuth response (temporary method)
   */
  async saveTokenFromOAuth(tokenData: { access_token: string; refresh_token: string; expires_in: number }) {
    // Sử dụng ZaloTokenService để lưu token
    await this.tokenService.saveToken(tokenData);

    console.log('✅ Token đã được lưu:', {
      access_token: tokenData.access_token.substring(0, 20) + '...',
      refresh_token: tokenData.refresh_token.substring(0, 20) + '...',
      expires_in: tokenData.expires_in,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    });
  }

  /**
   * 🔑 Lấy access token hợp lệ (tự động refresh nếu cần)
   */
  async getCurrentAccessToken(): Promise<string | null> {
    // Dùng ZaloOASimpleTokenService để lấy token từ database
    return await this.zaloOASimpleTokenService.getAccessToken();
  }

  /**
   * 📤 Gửi tin nhắn OA (wrapper method)
   */
  async sendOAMessage(userId: string, message: string) {
    const accessToken = await this.getCurrentAccessToken();

    if (!accessToken) {
      return {
        success: false,
        error: 'Không có access token hợp lệ. Vui lòng thực hiện OAuth flow trước.'
      };
    }

    // Sẽ implement sau khi có ZaloTokenService hoàn chỉnh
    return {
      success: false,
      error: 'Chức năng gửi tin nhắn OA sẽ được implement sau'
    };
  }

  /**
   * 📊 Lấy thông tin token (safe wrapper)
   */
  async getTokenInfo(): Promise<any> {
    try {
      if (!this.tokenService) {
        return {
          status: 'service_not_available',
          message: 'Token service không khả dụng'
        };
      }

      return this.tokenService.getTokenInfo();
    } catch (error) {
      return {
        status: 'error',
        message: 'Lỗi khi lấy thông tin token',
        error: error.message
      };
    }
  }

  /**
   * 🔄 Force refresh token (safe wrapper)
   */
  async forceRefreshToken(): Promise<any> {
    try {
      if (!this.tokenService?.hasRefreshToken()) {
        return {
          success: false,
          error: 'Không có refresh token để thực hiện refresh'
        };
      }

      // Force expire current token
      const forceResult = this.tokenService.forceExpireToken();

      // Try to get access token (will trigger refresh)
      const newAccessToken = await this.getCurrentAccessToken();
      const newTokenInfo = this.tokenService.getTokenInfo();

      return {
        success: !!newAccessToken,
        message: newAccessToken ? 'Refresh token thành công' : 'Refresh token thất bại',
        old_expires_at: forceResult.old_expires_at,
        new_expires_at: newTokenInfo?.expires_at || null,
        new_token_preview: newAccessToken ? newAccessToken.substring(0, 20) + '...' : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tự động cập nhật zaloAppUserId vào ZaloAccount khi user login Mini App
   * Điều này giúp liên kết ZaloAccount (từ OA webhook) với ZaloUser (từ Mini App)
   */
  private async updateZaloAccountWithAppUserId(zaloAppUserId: string, systemUserId: string): Promise<void> {
    try {
      // Sử dụng connection từ repository manager
      const connection = this.zaloAccountRepository.manager.connection;

      // Tìm ZaloAccount đã có systemUserId này nhưng chưa có zaloAppUserId
      const existingAccount = await connection.query(`
        SELECT * FROM zalo_accounts 
        WHERE user_id = ? AND (zalo_app_user_id IS NULL OR zalo_app_user_id = '')
        LIMIT 1
      `, [systemUserId]);

      if (existingAccount && existingAccount.length > 0) {
        // Cập nhật zaloAppUserId cho account đã có
        await connection.query(`
          UPDATE zalo_accounts 
          SET zalo_app_user_id = ?, updated_at = NOW()
          WHERE id = ?
        `, [zaloAppUserId, existingAccount[0].id]);

        console.log(`✅ Đã cập nhật zaloAppUserId cho ZaloAccount ID: ${existingAccount[0].id}`);
      } else {
        // Tìm ZaloAccount theo zaloAppUserId để cập nhật userId
        const accountByAppId = await connection.query(`
          SELECT * FROM zalo_accounts 
          WHERE zalo_app_user_id = ?
          LIMIT 1
        `, [zaloAppUserId]);

        if (accountByAppId && accountByAppId.length > 0 && !accountByAppId[0].user_id) {
          // Cập nhật userId cho account đã có zaloAppUserId
          await connection.query(`
            UPDATE zalo_accounts 
            SET user_id = ?, updated_at = NOW()
            WHERE id = ?
          `, [systemUserId, accountByAppId[0].id]);

          console.log(`✅ Đã liên kết ZaloAccount ID: ${accountByAppId[0].id} với User ID: ${systemUserId}`);
        }
      }

      // Kiểm tra và tạo mới nếu cần thiết (trong trường hợp đặc biệt)
      const linkedAccount = await connection.query(`
        SELECT * FROM zalo_accounts 
        WHERE user_id = ? AND zalo_app_user_id = ?
        LIMIT 1
      `, [systemUserId, zaloAppUserId]);

      if (!linkedAccount || linkedAccount.length === 0) {
        console.log(`ℹ️ Chưa có ZaloAccount hoàn chỉnh cho User ${systemUserId} và ZaloAppId ${zaloAppUserId}`);
        // Có thể tạo mới nếu cần, nhưng thông thường webhook sẽ tạo trước
      }

    } catch (error) {
      console.error('❌ Lỗi cập nhật ZaloAccount với zaloAppUserId:', error);
      // Không throw error để không ảnh hưởng đến quá trình login
    }
  }

  /**
   * Lấy danh sách bài viết từ Zalo OA với phân trang
   * @param offset - Vị trí bắt đầu (default: 0)
   * @param limit - Số lượng bài viết trên 1 trang (default: 10, max: 50)
   * @param type - Loại bài viết (normal, draft, etc.) (default: 'normal')
   * @returns Danh sách bài viết và thông tin phân trang
   */
  async getArticleList(offset = 0, limit = 10, type = 'normal') {
    try {
      // Validate parameters
      if (offset < 0) offset = 0;
      if (limit < 1 || limit > 50) limit = 10;

      // Lấy access token từ database
      const accessToken = await this.getCurrentAccessToken();
      if (!accessToken) {
        throw new UnauthorizedException('Không có access token hợp lệ');
      }

      // Gọi API Zalo OA
      const response = await axios.get('https://openapi.zalo.me/v2.0/article/getslice', {
        params: {
          offset,
          limit,
          type
        },
        headers: {
          'access_token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error !== 0) {
        throw new BadRequestException(`Lỗi từ Zalo API: ${response.data.message}`);
      }

      // Trả về response giống như API Zalo gốc
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách bài viết từ Zalo OA:', error);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }
      throw new BadRequestException(error.message || 'Không thể lấy danh sách bài viết');
    }
  }

  /**
   * Lấy chi tiết một bài viết từ Zalo OA
   * @param articleId - ID của bài viết
   * @returns Chi tiết bài viết
   */
  async getArticleDetail(articleId: string) {
    try {
      if (!articleId || articleId.trim().length === 0) {
        throw new BadRequestException('ID bài viết không được để trống');
      }

      // Lấy access token từ database
      const accessToken = await this.getCurrentAccessToken();
      if (!accessToken) {
        throw new UnauthorizedException('Không có access token hợp lệ');
      }

      // Gọi API Zalo OA
      const response = await axios.get('https://openapi.zalo.me/v2.0/article/getdetail', {
        params: {
          id: articleId.trim()
        },
        headers: {
          'access_token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.error !== 0) {
        throw new BadRequestException(`Lỗi từ Zalo API: ${response.data.message}`);
      }

      // Trả về response giống như API Zalo gốc  
      return response.data;
    } catch (error) {
      console.error('❌ Lỗi khi lấy chi tiết bài viết từ Zalo OA:', error);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn');
      }
      if (error.response?.status === 404) {
        throw new NotFoundException('Không tìm thấy bài viết');
      }
      throw new BadRequestException(error.message || 'Không thể lấy chi tiết bài viết');
    }
  }
}
