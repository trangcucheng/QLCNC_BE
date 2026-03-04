import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ZaloUser } from '../../databases/entities/ZaloUser.entity';
import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import {
  ZaloAuthResponseDto,
  ZaloLoginDto
} from './dto/zalo-auth.dto';
import { ZaloService } from './zalo.service';
import { ZaloOASimpleTokenService } from './zalo-oa-simple-token.service';
// import { ZaloOATokenService } from './zalo-oa-token-db.service';
import { ZaloPushNotificationService } from './zalo-push.service';
import { ZaloUserService } from './zalo-user.service';

@ApiTags('Zalo Mini App')
@Controller('zalo')
export class ZaloController {
  constructor(
    private readonly zaloService: ZaloService,
    // private readonly zaloOATokenService: ZaloOATokenService,
    public zaloOASimpleTokenService: ZaloOASimpleTokenService,
    private readonly zaloPushService: ZaloPushNotificationService,
    private readonly zaloUserService: ZaloUserService,
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
  ) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập qua Zalo Mini App',
    description: 'API xác thực người dùng thông qua Zalo access token'
  })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công',
    type: ZaloAuthResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Token Zalo không hợp lệ'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu đầu vào không hợp lệ'
  })
  async login(@Body(ValidationPipe) loginDto: ZaloLoginDto): Promise<ZaloAuthResponseDto> {
    return await this.zaloService.authenticateZaloUser(loginDto);
  }

  @Get('debug-config')
  @ApiOperation({
    summary: 'Debug Zalo configuration',
    description: 'API kiểm tra cấu hình Zalo (chỉ dùng cho development)'
  })
  async debugConfig(): Promise<any> {
    return await this.zaloService.debugConfig();
  }

  @Get('test-login/:zaloId')
  @ApiOperation({
    summary: 'Test Zalo login response với zaloId',
    description: 'API test để xem thông tin trả về từ zalo/login (development only)'
  })
  async testLoginResponse(@Param('zaloId') zaloId: string): Promise<any> {
    try {
      // Tìm ZaloUser theo zaloId
      const zaloUser = await this.zaloService.findZaloUserByZaloId(zaloId);

      if (!zaloUser) {
        return {
          success: false,
          message: `Không tìm thấy ZaloUser với zaloId: ${zaloId}`,
          suggestion: 'Hãy đăng nhập qua Zalo Mini App trước để tạo ZaloUser'
        };
      }

      return {
        success: true,
        zaloUser: {
          id: zaloUser.id,
          zaloId: zaloUser.zaloAppUserId,
          name: zaloUser.displayName,
          phone: zaloUser.phone,
          avatar: zaloUser.avatar,
          userId: zaloUser.userId,
          hasWebUser: !!zaloUser.user
        },
        webUser: zaloUser.user ? {
          id: zaloUser.user.id,
          fullName: zaloUser.user.fullName,
          phoneNumber: zaloUser.user.phoneNumber,
          email: zaloUser.user.email,
          roleId: zaloUser.user.roleId,
          organizationId: zaloUser.user.organizationId,
          isActive: zaloUser.user.isActive
        } : null,
        linkedStatus: zaloUser.user ? 'LINKED' : 'NOT_LINKED'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }


  @Post('force-link/:zaloId')
  @ApiOperation({
    summary: 'Force create and link ZaloUser with system User',
    description: 'API để force tạo systemUser và link với ZaloUser'
  })
  async forceLinkZaloUser(@Param('zaloId') zaloId: string) {
    return await this.zaloService.forceLinkZaloUser(zaloId);
  }

  @Get('unlinked-users')
  @ApiOperation({
    summary: 'Lấy danh sách ZaloUser chưa được link',
    description: 'API cho admin xem ZaloUser nào chưa được link với User hệ thống'
  })
  async getUnlinkedZaloUsers() {
    return await this.zaloService.getUnlinkedZaloUsers();
  }

  @Post('admin-link/:zaloUserId/:systemUserId')
  @ApiOperation({
    summary: 'Admin link ZaloUser với User hệ thống',
    description: 'API cho admin manually link ZaloUser với User existing'
  })
  async adminLink(
    @Param('zaloUserId') zaloUserId: string,
    @Param('systemUserId') systemUserId: string
  ) {
    return await this.zaloService.adminLinkUsers(zaloUserId, systemUserId);
  }

  @Get('profile')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy thông tin profile người dùng Zalo',
    description: 'API lấy thông tin chi tiết của người dùng đã đăng nhập qua Zalo'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập hoặc token không hợp lệ'
  })
  async getProfile(@Request() req) {
    return {
      user: req.user,
      message: 'Lấy thông tin profile thành công'
    };
  }

  @Patch('link-user/:systemUserId')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Liên kết tài khoản Zalo với user hệ thống',
    description: 'API liên kết tài khoản Zalo hiện tại với một user trong hệ thống'
  })
  @ApiResponse({
    status: 200,
    description: 'Liên kết thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Không tìm thấy user hoặc dữ liệu không hợp lệ'
  })
  async linkWithSystemUser(
    @Request() req,
    @Param('systemUserId') systemUserId: string
  ) {
    const result = await this.zaloService.linkZaloUserWithSystemUser(
      req.user.zaloId,
      systemUserId
    );

    return {
      data: result,
      message: 'Liên kết tài khoản thành công'
    };
  }

  @Get('users')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng Zalo (Admin only)',
    description: 'API lấy danh sách tất cả người dùng đã đăng nhập qua Zalo'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getZaloUsers() {
    const users = await this.zaloService.getZaloUsers();
    return {
      data: users,
      total: users.length,
      message: 'Lấy danh sách người dùng Zalo thành công'
    };
  }

  @Get('auth-url')
  @ApiOperation({
    summary: 'Tạo Zalo authorization URL',
    description: 'API tạo URL để redirect user đến Zalo OAuth với PKCE'
  })
  @ApiResponse({
    status: 200,
    description: 'Tạo authorization URL thành công'
  })
  async getAuthUrl() {
    const result = await this.zaloService.generateAuthUrl();
    
    // Tạo full authorization URL
    const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${result.info.app_id}&redirect_uri=${encodeURIComponent(result.info.redirect_uri)}&state=${result.data.state}&code_challenge=${result.data.code_challenge}&code_challenge_method=S256`;
    
    return {
      ...result,
      authorization_url: authUrl,
      instructions: {
        step1: 'Copy authorization_url và mở trong browser',
        step2: 'Đăng nhập Zalo và cấp quyền',
        step3: 'Zalo sẽ redirect về callback URL với code và state',
        step4: 'API tự động exchange code thành access_token'
      }
    };
  }

  @Get('auth-url-simple')
  @ApiOperation({
    summary: 'Tạo Zalo authorization URL (Simple OAuth - theo tài liệu chính thức)',
    description: 'API tạo URL để redirect user đến Zalo OAuth không dùng PKCE (đơn giản hơn)'
  })
  @ApiResponse({
    status: 200,
    description: 'Tạo authorization URL thành công'
  })
  async getAuthUrlSimple() {
    const result = await this.zaloService.generateSimpleAuthUrl();
    
    return {
      success: true,
      authorization_url: result.authUrl,
      state: result.state,
      instructions: {
        step1: 'Copy authorization_url và mở trong browser hoặc redirect user đến URL này',
        step2: 'Đăng nhập Zalo và cấp quyền cho Official Account',
        step3: 'Zalo sẽ redirect về callback URL với code và state',
        step4: 'API callback sẽ tự động exchange code thành access_token'
      },
      note: 'Đây là OAuth flow đơn giản theo tài liệu Zalo OA chính thức'
    };
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Zalo OAuth callback endpoint',
    description: 'API xử lý callback từ Zalo OAuth sau khi user authorize'
  })
  @ApiResponse({
    status: 200,
    description: 'Xử lý callback thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi trong quá trình xử lý callback'
  })
  async callback(
    @Query('code') code: string, 
    @Query('state') state: string,
    @Query('oa_id') oaId?: string,
    @Query('code_challenge') codeChallenge?: string,
    @Query('code_verifier') codeVerifierParam?: string,
    @Query('app_id') appIdOverride?: string,
    @Query('secret_key') secretKeyOverride?: string
  ) {
    try {
      console.log('🔍 Zalo callback received:', { 
        code: code?.substring(0, 10) + '...', 
        state, 
        oaId,
        appIdOverride,
        codeChallenge: codeChallenge?.substring(0, 10) + '...',
        hasCodeVerifier: !!codeVerifierParam
      });
      return await this.zaloService.exchangeToken(
        code, 
        state, 
        codeVerifierParam, 
        appIdOverride, 
        secretKeyOverride
      );
    } catch (error) {
      console.error('❌ Zalo callback error:', error.message);
      return {
        success: false,
        error: error.message,
        details: 'Zalo OAuth callback failed'
      };
    }
  }

  // B3: Làm mới access token
  @Get('refresh-token')
  async refresh() {
    return await this.zaloService.refreshToken();
  }

  // 💾 Lưu token từ OAuth response
  @Post('save-token')
  @ApiOperation({
    summary: 'Lưu access token và refresh token',
    description: 'API lưu token từ OAuth response vào memory'
  })
  async saveToken(@Body() tokenData: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }) {
    await this.zaloService.saveTokenFromOAuth({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    });

    return {
      success: true,
      message: 'Token đã được lưu thành công vào memory',
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    };
  }

  // 💾 Lưu OA token vào database
  @Post('save-oa-token')
  @ApiOperation({
    summary: 'Lưu Zalo OA token vào database',
    description: 'API lưu OA access token vào database để gửi thông báo'
  })
  async saveOAToken(@Body() tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }) {
    const saved = await this.zaloOASimpleTokenService.saveToken({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope
    });

    if (saved) {
      return {
        success: true,
        message: 'Zalo OA Token đã được lưu thành công vào database',
        token: {
          expires_in: tokenData.expires_in,
          expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: 'Lỗi lưu token vào database'
      };
    }
  }

  // 📊 Xem thông tin token hiện tại
  @Get('token-info')
  @ApiOperation({
    summary: 'Xem thông tin token hiện tại',
    description: 'API kiểm tra token có hợp lệ không và thông tin hết hạn'
  })
  async getTokenInfo() {
    try {
      const tokenInfo = await this.zaloService.getTokenInfo();
      const accessToken = await this.zaloService.getCurrentAccessToken();

      return {
        success: true,
        has_token: !!accessToken,
        access_token_preview: accessToken ? accessToken.substring(0, 20) + '...' : null,
        token_details: tokenInfo,
        message: accessToken ? 'Token hợp lệ' : 'Không có token hoặc token đã hết hạn'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        has_token: false,
        message: 'Lỗi khi lấy thông tin token'
      };
    }
  }

  // 🔄 Force refresh token
  @Post('force-refresh')
  @ApiOperation({
    summary: 'Force refresh access token',
    description: 'API để force refresh access token ngay lập tức'
  })
  async forceRefreshToken() {
    return await this.zaloService.forceRefreshToken();
  }

  // B4: Gửi thông báo
  // @Post('send-message')
  // async send(@Body() body: { userId: string; text: string }) {
  //   return await this.zaloPushService.sendMessage(body.userId, body.text);
  // }

  // 📨 Webhook từ Zalo OA
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zalo OA Webhook endpoint',
    description: 'API nhận webhook từ Zalo OA khi có sự kiện (follow, unfollow, message, etc.)'
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook xử lý thành công'
  })
  async handleWebhook(@Body() payload: any, @Request() req: any) {
    try {
      console.log('📩 Webhook từ Zalo OA:', JSON.stringify(payload, null, 2));

      // Validate payload
      if (!payload || typeof payload !== 'object') {
        console.error('❌ Invalid payload:', payload);
        return { message: 'invalid payload', timestamp: new Date().toISOString() };
      }

      // Optional: Verify signature (uncomment if needed)
      // const signature = req.headers['x-zalo-signature'];
      // const rawBody = JSON.stringify(payload);
      // if (signature && !this.zaloService.verifyZaloSignature(rawBody, signature)) {
      //   console.error('❌ Invalid webhook signature');
      //   return { message: 'invalid signature', timestamp: new Date().toISOString() };
      // }

      // Lấy user_id từ các field khác nhau tùy theo event
      const getUserId = (payload: any) => {
        try {
          return payload.user_id ||
            payload.follower?.id ||
            payload.sender?.id ||
            payload.user_id_by_app;
        } catch (error) {
          console.error('❌ Error extracting user ID:', error);
          return null;
        }
      };

      const userId = getUserId(payload);
      const eventName = payload.event_name || 'unknown';

      console.log('🔍 All possible user IDs:', {
        user_id: payload.user_id,
        follower_id: payload.follower?.id,
        sender_id: payload.sender?.id,
        user_id_by_app: payload.user_id_by_app,
        selected_id: userId,
        event_name: eventName
      });

      // Xử lý các event cụ thể
      try {
        switch (eventName) {
          case 'follow':
            console.log('👤 Người dùng mới follow OA - ZALO_USER_ID:', userId);
            if (userId) {
              await this.handleFollowEvent(userId, payload);
            }
            break;

          case 'unfollow':
            console.log('👋 Người dùng unfollow OA - ZALO_USER_ID:', userId);
            if (userId) {
              await this.handleUnfollowEvent(userId);
            }
            break;

          case 'user_send_text':
            console.log('💬 Tin nhắn từ user - ZALO_USER_ID:', userId, '- Message:', payload.message?.text);
            if (userId) {
              await this.updateLastActiveTime(userId);
            }
            break;

          default:
            if (userId) {
              console.log('🔔 Event khác:', eventName, '- ZALO_USER_ID:', userId);
              await this.updateLastActiveTime(userId);
            } else {
              console.log('🔔 Event không có user ID:', eventName);
            }
        }
      } catch (eventError) {
        console.error('❌ Error processing event:', eventError);
      }

      // Luôn trả về HTTP 200 để Zalo biết đã nhận được
      return {
        message: 'ok',
        timestamp: new Date().toISOString(),
        processed: true
      };

    } catch (error) {
      console.error('❌ Webhook error:', error);

      // Vẫn trả về 200 để Zalo không retry liên tục
      return {
        message: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Post('oa/exchange-token')
  @ApiOperation({
    summary: 'Exchange OAuth authorization code for OA access token',
    description: 'Nhận authorization code và lấy access token từ Zalo OA'
  })
  async exchangeOAToken(@Body() body: {
    code: string;
    app_id: string;
    grant_type: string;
    code_verifier: string;
  }) {
    try {
      const result = await this.zaloOASimpleTokenService.exchangeAuthorizationCode(
        body.code,
        body.app_id,
        body.grant_type,
        body.code_verifier
      );

      return {
        success: true,
        message: 'Token exchanged and saved successfully',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Exchange token error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Xử lý sự kiện follow OA
   */
  private async handleFollowEvent(userId: string, payload: any): Promise<void> {
    try {
      console.log(userId, "trang")
      // Tìm hoặc tạo ZaloAccount
      let zaloAccount = await this.zaloAccountRepository.findOne({
        where: { zaloOaUserId: userId }
      });

      if (!zaloAccount) {
        // Lấy access token OA giống như gửi tin nhắn OA
        const accessToken = await this.zaloOASimpleTokenService.getAccessToken();
        // Gọi API lấy thông tin người dùng Zalo OA
        const zaloUserInfo = await this.zaloUserService.getZaloUserInfoZalo(userId, accessToken);
        console.log(zaloUserInfo, "trang follow")

        // Sử dụng thông tin từ API nếu thành công, fallback về payload
        const userInfoData = zaloUserInfo.success ? zaloUserInfo.data : null;

        zaloAccount = this.zaloAccountRepository.create({
          zaloOaUserId: userId,
          zaloAppUserId: userInfoData?.zaloAppUserId || payload.user_id_by_app,
          displayName: userInfoData?.displayName || payload.follower?.name || null,
          avatar: userInfoData?.avatar || payload.follower?.avatar || null,
          isFollowingOa: true,
          lastFollowAt: new Date(),
          lastActiveAt: new Date()
        });
      } else {
        // Cập nhật thông tin
        zaloAccount.isFollowingOa = true;
        zaloAccount.lastFollowAt = new Date();
        zaloAccount.lastActiveAt = new Date();

        // Cập nhật thông tin profile nếu có
        if (payload.follower?.name) {
          zaloAccount.displayName = payload.follower.name;
        }
        if (payload.follower?.avatar) {
          zaloAccount.avatar = payload.follower.avatar;
        }
      }

      await this.zaloAccountRepository.save(zaloAccount);
      console.log(`✅ Đã cập nhật follow status cho ZALO_USER_ID: ${userId}`);

    } catch (error) {
      console.error('❌ Error handling follow event:', error);
    }
  }

  /**
   * Xử lý sự kiện unfollow OA
   */
  private async handleUnfollowEvent(userId: string): Promise<void> {
    try {
      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: { zaloOaUserId: userId }
      });

      if (zaloAccount) {
        zaloAccount.isFollowingOa = false;
        zaloAccount.lastUnfollowAt = new Date();
        await this.zaloAccountRepository.save(zaloAccount);
        console.log(`✅ Đã cập nhật unfollow status cho ZALO_USER_ID: ${userId}`);
      } else {
        console.log(`⚠️ Không tìm thấy ZaloAccount cho ZALO_USER_ID: ${userId}`);
      }

    } catch (error) {
      console.error('❌ Error handling unfollow event:', error);
    }
  }

  /**
   * Cập nhật thời gian hoạt động cuối cùng
   */
  private async updateLastActiveTime(userId: string): Promise<void> {
    try {
      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: { zaloOaUserId: userId }
      });

      if (zaloAccount) {
        zaloAccount.lastActiveAt = new Date();
        await this.zaloAccountRepository.save(zaloAccount);
      }

    } catch (error) {
      console.error('❌ Error updating last active time:', error);
    }
  }

  /**
   * Liên kết ZaloAccount với User hệ thống thông qua zaloAppUserId
   */
  @Post('link-account-with-user')
  @ApiOperation({
    summary: 'Liên kết ZaloAccount với User hệ thống',
    description: 'API để liên kết ZaloAccount (từ OA) với User hệ thống (từ Mini App) thông qua zaloAppUserId'
  })
  async linkAccountWithUser(@Body() body: {
    zaloOaUserId: string;
    zaloAppUserId: string;
  }) {
    try {
      // 1. Tìm ZaloAccount bằng zaloOaUserId
      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: { zaloOaUserId: body.zaloOaUserId }
      });

      if (!zaloAccount) {
        return {
          success: false,
          message: 'Không tìm thấy ZaloAccount với zaloOaUserId này'
        };
      }

      // 2. Tìm User trong bảng ZaloUser bằng zaloId (zaloAppUserId)
      const zaloUser = await this.zaloAccountRepository.findOne({
        where: { zaloAppUserId: body.zaloAppUserId }
      });

      if (!zaloUser || !zaloUser.userId) {
        return {
          success: false,
          message: 'Không tìm thấy User hệ thống với zaloAppUserId này'
        };
      }

      // 3. Cập nhật ZaloAccount với thông tin liên kết
      zaloAccount.zaloAppUserId = body.zaloAppUserId;
      zaloAccount.userId = zaloUser.userId;

      await this.zaloAccountRepository.save(zaloAccount);

      return {
        success: true,
        message: 'Đã liên kết ZaloAccount với User hệ thống thành công',
        data: {
          zaloAccountId: zaloAccount.id,
          zaloOaUserId: zaloAccount.zaloOaUserId,
          zaloAppUserId: zaloAccount.zaloAppUserId,
          userId: zaloAccount.userId,
          displayName: zaloAccount.displayName,
          isFollowingOa: zaloAccount.isFollowingOa
        }
      };

    } catch (error) {
      console.error('❌ Error linking ZaloAccount with User:', error);
      return {
        success: false,
        message: 'Lỗi khi liên kết ZaloAccount với User',
        error: error.message
      };
    }
  }

  /**
   * Tự động liên kết ZaloAccount với User dựa trên zaloAppUserId có sẵn
   */
  @Post('auto-link-accounts')
  @ApiOperation({
    summary: 'Tự động liên kết tất cả ZaloAccount với User',
    description: 'API để tự động liên kết tất cả ZaloAccount chưa có userId với User hệ thống'
  })
  async autoLinkAccounts() {
    try {
      // Lấy tất cả ZaloAccount chưa có userId
      const unlinkedAccounts = await this.zaloAccountRepository.find({
        where: { userId: null }
      });

      let linkedCount = 0;
      const results = [];

      for (const account of unlinkedAccounts) {
        if (account.zaloAppUserId) {
          // Tìm User tương ứng
          const zaloUser = await this.zaloAccountRepository.findOne({
            where: { zaloAppUserId: account.zaloAppUserId }
          });

          if (zaloUser && zaloUser.userId) {
            account.userId = zaloUser.userId;
            await this.zaloAccountRepository.save(account);
            linkedCount++;

            results.push({
              zaloAccountId: account.id,
              zaloOaUserId: account.zaloOaUserId,
              zaloAppUserId: account.zaloAppUserId,
              userId: account.userId,
              displayName: account.displayName,
              linked: true
            });
          } else {
            results.push({
              zaloAccountId: account.id,
              zaloOaUserId: account.zaloOaUserId,
              zaloAppUserId: account.zaloAppUserId,
              userId: null,
              displayName: account.displayName,
              linked: false,
              reason: 'Không tìm thấy User hệ thống'
            });
          }
        } else {
          results.push({
            zaloAccountId: account.id,
            zaloOaUserId: account.zaloOaUserId,
            zaloAppUserId: null,
            userId: null,
            displayName: account.displayName,
            linked: false,
            reason: 'Chưa có zaloAppUserId'
          });
        }
      }

      return {
        success: true,
        message: `Đã tự động liên kết ${linkedCount}/${unlinkedAccounts.length} ZaloAccount`,
        linkedCount,
        totalUnlinked: unlinkedAccounts.length,
        results
      };

    } catch (error) {
      console.error('❌ Error auto-linking accounts:', error);
      return {
        success: false,
        message: 'Lỗi khi tự động liên kết accounts',
        error: error.message
      };
    }
  }

  /**
   * Xem trạng thái liên kết giữa các bảng
   */
  @Get('account-status')
  @ApiOperation({
    summary: 'Kiểm tra trạng thái liên kết giữa User và ZaloAccount',
    description: 'API để xem tổng quan về việc liên kết giữa User (Mini App) và ZaloAccount (OA)'
  })
  async getAccountLinkingStatus() {
    try {
      // Thống kê ZaloAccount
      const totalZaloAccounts = await this.zaloAccountRepository.count();
      const linkedZaloAccounts = await this.zaloAccountRepository.count({
        where: { userId: null }
      });
      const followingOA = await this.zaloAccountRepository.count({
        where: { isFollowingOa: true }
      });

      // Thống kê ZaloUser
      const totalZaloUsers = await this.zaloAccountRepository.count();
      const linkedZaloUsers = await this.zaloAccountRepository.count({
        where: { userId: null }
      });

      // Lấy danh sách ZaloAccount chưa liên kết
      const unlinkedAccounts = await this.zaloAccountRepository.find({
        where: { userId: null },
        select: ['id', 'zaloOaUserId', 'zaloAppUserId', 'displayName', 'isFollowingOa', 'lastFollowAt']
      });

      // Lấy danh sách ZaloUser chưa liên kết
      const unlinkedUsers = await this.zaloAccountRepository.find({
        where: { userId: null },
        select: ['id', 'zaloOaUserId', 'zaloAppUserId', 'displayName', 'isFollowingOa', 'lastFollowAt']
      });

      return {
        success: true,
        statistics: {
          zaloAccount: {
            total: totalZaloAccounts,
            linked: totalZaloAccounts - linkedZaloAccounts,
            unlinked: linkedZaloAccounts,
            followingOA: followingOA
          },
          zaloUser: {
            total: totalZaloUsers,
            linked: totalZaloUsers - linkedZaloUsers,
            unlinked: linkedZaloUsers
          }
        },
        unlinkedAccounts: unlinkedAccounts.slice(0, 10), // Chỉ lấy 10 đầu tiên
        unlinkedUsers: unlinkedUsers.slice(0, 10), // Chỉ lấy 10 đầu tiên
        message: 'Thống kê trạng thái liên kết thành công'
      };

    } catch (error) {
      console.error('❌ Error getting account status:', error);
      return {
        success: false,
        message: 'Lỗi khi lấy thông tin trạng thái liên kết',
        error: error.message
      };
    }
  }

  @Post('test-oa-approval')
  @ApiOperation({
    summary: 'Test gửi thông báo phê duyệt Zalo OA',
    description: 'API test gửi thông báo approval qua Zalo OA (development only)'
  })
  async testOAApproval(@Body() body: {
    zaloUserId: string;
    reportId?: number;
    reportType?: string;
    status: 'approved' | 'rejected';
    reason?: string;
  }) {
    try {
      const result = await this.zaloPushService.sendApprovalNotification(body.zaloUserId, {
        reportId: body.reportId || 123,
        reportType: body.reportType || 'Báo cáo đoàn số theo kỳ',
        status: body.status,
        reason: body.reason
      });

      return {
        success: true,
        message: 'OA notification sent',
        result,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Test OA notification error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  @Get('accounts/stats')
  @ApiOperation({
    summary: 'Thống kê ZaloAccount',
    description: 'Lấy thống kê về số lượng follow/unfollow OA'
  })
  async getZaloAccountStats() {
    try {
      const totalAccounts = await this.zaloAccountRepository.count();
      const followingAccounts = await this.zaloAccountRepository.count({
        where: { isFollowingOa: true }
      });
      const unfollowedAccounts = totalAccounts - followingAccounts;

      // Lấy 5 account hoạt động gần đây nhất
      const recentActive = await this.zaloAccountRepository.find({
        order: { lastActiveAt: 'DESC' },
        take: 5
      });

      return {
        success: true,
        data: {
          total: totalAccounts,
          following: followingAccounts,
          unfollowed: unfollowedAccounts,
          recentActive: recentActive.map(acc => ({
            id: acc.id,
            zaloOaUserId: acc.zaloOaUserId,
            displayName: acc.displayName,
            isFollowingOa: acc.isFollowingOa,
            lastActiveAt: acc.lastActiveAt,
            lastFollowAt: acc.lastFollowAt,
            lastUnfollowAt: acc.lastUnfollowAt
          }))
        }
      };
    } catch (error) {
      console.error('❌ Error getting ZaloAccount stats:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  @Post('test-webhook')
  @ApiOperation({
    summary: 'Test Webhook Event',
    description: 'API test để simulate webhook events từ Zalo OA'
  })
  async testWebhook(@Body() body: {
    event_name: 'follow' | 'unfollow' | 'user_send_text';
    user_id?: string;
    follower?: {
      id: string;
      name?: string;
      avatar?: string;
    };
    message?: {
      text: string;
    };
  }) {
    console.log('🧪 Test Webhook Event:', body);

    // Simulate webhook payload
    const simulatedPayload = {
      event_name: body.event_name,
      user_id: body.user_id || body.follower?.id,
      follower: body.follower,
      message: body.message,
      timestamp: new Date().toISOString()
    };

    // Call webhook handler
    return await this.handleWebhook(simulatedPayload, { headers: {} });
  }

  /**
   * Test gửi thông báo Zalo OA trực tiếp với log chi tiết
   */
  @Get('test-oa-notification')
  @ApiOperation({
    summary: 'Test gửi thông báo Zalo OA với log chi tiết',
    description: 'Endpoint để test gửi thông báo qua Zalo OA với log debug chi tiết'
  })
  async testOANotification(@Query('userId') zaloUserId: string) {
    if (!zaloUserId) {
      return {
        success: false,
        error: 'Missing userId parameter',
        example: '/zalo/test-oa-notification?userId=YOUR_ZALO_USER_ID'
      };
    }

    const testMessage = `🔔 Test Debug Message - ${new Date().toISOString()}\nĐây là test message với log chi tiết để debug API call`;

    console.log(`🧪 [TEST] Bắt đầu test gửi thông báo tới ${zaloUserId}`);

    try {
      const result = await this.zaloPushService.sendOAMessage(zaloUserId, testMessage);

      console.log(`🧪 [TEST] Kết quả cuối cùng:`, result);

      return {
        testInfo: {
          timestamp: new Date().toISOString(),
          targetUserId: zaloUserId,
          message: testMessage
        },
        result: result,
        note: 'Kiểm tra log server để xem chi tiết quá trình gửi'
      };
    } catch (error) {
      console.error(`🧪 [TEST] Lỗi test:`, error);
      return {
        success: false,
        error: error.message,
        note: 'Có lỗi khi test - kiểm tra log server'
      };
    }
  }

  /**
   * Lấy danh sách bài viết từ Zalo OA (Công khai)
   */
  @Get('articles')
  @ApiOperation({
    summary: 'Lấy danh sách bài viết từ Zalo OA (Công khai)',
    description: 'API công khai lấy danh sách bài viết từ Zalo Official Account với hỗ trợ phân trang server-side. Không yêu cầu đăng nhập.'
  })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Vị trí bắt đầu (mặc định: 0)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Số lượng bài viết (mặc định: 10)' })
  @ApiQuery({ name: 'type', required: false, type: String, description: 'Loại bài viết (mặc định: normal)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách bài viết thành công',
    schema: {
      example: {
        error: 0,
        message: "Success",
        data: {
          medias: [
            {
              id: "39c07ccbe78e0ed0579f",
              type: "normal",
              title: "Title",
              status: "show",
              total_view: 1,
              total_share: 0,
              create_date: 1690260497732,
              update_date: 1690260504041,
              thumb: "https://zalo-article-photo.zadn.vn/7ad578505104b85ae115#286621339",
              link_view: "url"
            }
          ],
          total: 2
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ hoặc đã hết hạn' })
  @ApiResponse({ status: 400, description: 'Lỗi từ Zalo API' })
  async getArticles(
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: string
  ) {
    try {
      return await this.zaloService.getArticleList(
        offset || 0,
        limit || 10,
        type || 'normal'
      );
    } catch (error) {
      console.error('❌ Lỗi khi lấy danh sách bài viết Zalo:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết bài viết từ Zalo OA (Công khai)
   */
  @Get('article/:id')
  @ApiOperation({
    summary: 'Lấy chi tiết bài viết từ Zalo OA (Công khai)',
    description: 'API công khai lấy chi tiết một bài viết từ Zalo Official Account theo ID. Không yêu cầu đăng nhập.'
  })
  @ApiParam({ name: 'id', description: 'ID bài viết Zalo' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết bài viết thành công',
    schema: {
      example: {
        error: 0,
        message: "Success",
        data: {
          id: "39c07ccbe78e0ed0579f",
          type: "normal",
          title: "Title",
          author: "",
          cover: {
            cover_type: "photo",
            photo_url: "https://zalo-article-photo.zadn.vn/7ad578505104b85ae115#286621339",
            status: "show"
          },
          description: "Aaaaa",
          status: "show",
          body: [
            {
              type: "text",
              content: "Content"
            }
          ],
          related_medias: [],
          comment: "show",
          cite: {
            url: "",
            label: ""
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token không hợp lệ hoặc đã hết hạn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy bài viết' })
  @ApiResponse({ status: 400, description: 'ID bài viết không được để trống' })
  async getArticleDetail(
    @Param('id') articleId: string
  ) {
    try {
      return await this.zaloService.getArticleDetail(articleId);
    } catch (error) {
      console.error('❌ Lỗi khi lấy chi tiết bài viết Zalo:', error);
      throw error;
    }
  }
}
