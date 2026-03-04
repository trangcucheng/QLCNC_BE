import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import axios from 'axios';

import { AuthService } from './auth.service';
import {
  BaseApiErrorResponse,
  BaseApiResponse,
  SwaggerBaseApiResponse
} from './decorators';
import { ReqContext } from './decorators/req-context.decorator';
import { RequestContext } from './decorators/request-context.dto';
import {
  AuthTokenOutput,
  RefreshTokenInput
} from './dto/auth-token-output.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { forgetPassDto, reSendCodeDto, ResetPasswordByUserNameDto, SendUnlockCodeDto, SigninDto, UnlockAccountDto } from './dto/sign-in.dto';
import { approveIdentityDto, confirmationInput, rejectIdentityDto, resetPassword, SignupAdminDto, SignupDto } from './dto/sign-up.dto';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { ZaloOASimpleTokenService } from './zalo-oa-simple-token.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly zaloOASimpleTokenService: ZaloOASimpleTokenService,
  ) { }

  /**
   * Zalo OAuth Callback - Handle authorization code
   */
  @Get('/zalo/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Zalo OAuth callback endpoint',
    description: 'Xử lý callback từ Zalo OAuth và exchange code thành access token'
  })
  @ApiResponse({ status: 200, description: 'Callback processed successfully' })
  async zaloCallback(
    @Query('code') code: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
    @Query('error_description') errorDescription?: string
  ) {
    try {
      // 1. Kiểm tra lỗi từ Zalo
      if (error) {
        this.logger.error('Zalo OAuth error:', { error, errorDescription });
        return {
          success: false,
          error: errorDescription || error,
          redirectUrl: '/login?error=zalo_auth_failed'
        };
      }

      // 2. Kiểm tra có code không
      if (!code) {
        return {
          success: false,
          error: 'Missing authorization code',
          redirectUrl: '/login?error=missing_code'
        };
      }

      this.logger.log('Zalo callback received:', { code: code.substring(0, 10) + '...', state });

      // 3. Exchange code thành access token
      const tokenResult = await this.exchangeZaloCode(code);

      if (!tokenResult.success) {
        return {
          success: false,
          error: tokenResult.error,
          redirectUrl: '/login?error=token_exchange_failed'
        };
      }

      // 4. Lấy user profile từ Zalo
      const profileResult = await this.getZaloUserProfile(tokenResult.accessToken);

      if (!profileResult.success) {
        return {
          success: false,
          error: profileResult.error,
          redirectUrl: '/login?error=profile_fetch_failed'
        };
      }

      // 5. TODO: Tạo hoặc cập nhật user trong hệ thống
      // const userResult = await this.authService.handleZaloUser(profileResult.profile, tokenResult);

      // 6. TODO: Tạo JWT token cho user  
      // const jwtToken = await this.authService.generateJwtToken(userResult.user);

      // 7. Redirect về frontend với thông tin user
      const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
      const redirectUrl = `${frontendUrl}/auth/success?zalo_user=${encodeURIComponent(JSON.stringify(profileResult.profile))}`;

      return {
        success: true,
        message: 'Zalo authentication successful',
        redirectUrl,
        zaloProfile: profileResult.profile,
        accessToken: tokenResult.accessToken,
        // token: jwtToken
      };

    } catch (error) {
      this.logger.error('Zalo callback error:', error);
      return {
        success: false,
        error: 'Internal server error',
        redirectUrl: '/login?error=server_error'
      };
    }
  }

  /**
   * Exchange authorization code thành access token
   */
  private async exchangeZaloCode(code: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }> {
    try {
      const appId = this.configService.get('ZALO_APP_ID');
      const appSecret = this.configService.get('ZALO_APP_SECRET');

      // Theo tài liệu Zalo - dùng form-urlencoded cho user authorization
      const formData = new URLSearchParams();
      formData.append('code', code);
      formData.append('app_id', appId);
      formData.append('grant_type', 'authorization_code');

      // const response = await axios.post('https://oauth.zaloapp.com/v4/access_token', formData, {
      //   headers: {
      //     'Content-Type': 'application/x-www-form-urlencoded',
      //     'secret_key': appSecret
      //   }
      // });
      formData.append('app_secret', appSecret);

      const response = await axios.post('https://oauth.zaloapp.com/v4/access_token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });


      if (response.data.error && response.data.error !== 0) {
        return {
          success: false,
          error: response.data.error_description || response.data.message
        };
      }

      return {
        success: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      };

    } catch (error) {
      this.logger.error('Exchange code error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  /**
   * Lấy user profile từ Zalo
   */
  private async getZaloUserProfile(accessToken: string): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    try {
      const response = await axios.get('https://graph.zalo.me/v2.0/me', {
        params: {
          access_token: accessToken,
          fields: 'id,name,picture,birthday,gender'
        }
      });

      if (response.data.error && response.data.error.code !== 0) {
        return {
          success: false,
          error: response.data.error.message
        };
      }

      return {
        success: true,
        profile: response.data
      };

    } catch (error) {
      this.logger.error('Get profile error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Debug Zalo App Configuration
   */
  @Get('debug-zalo-config')
  @ApiOperation({ summary: 'Debug Zalo App configuration' })
  async debugZaloConfig() {
    const appId = this.configService.get('ZALO_APP_ID');
    const appSecret = this.configService.get('ZALO_APP_SECRET');

    return {
      appId: appId ? `${appId.substring(0, 8)}...` : 'NOT_SET',
      appSecret: appSecret ? `${appSecret.substring(0, 5)}...` : 'NOT_SET',
      appIdLength: appId?.length || 0,
      appSecretLength: appSecret?.length || 0,
      appIdFull: appId, // Tạm thời để debug
      checks: {
        appIdExists: !!appId,
        appSecretExists: !!appSecret,
        appIdIsNumber: !isNaN(Number(appId)),
        appIdFormat: /^\d+$/.test(appId || '')
      }
    };
  }

  /**
   * Test OA Access Token với debug chi tiết
   */
  @Get('test-oa-token-debug')
  @ApiOperation({ summary: 'Test OA token with detailed debug' })
  async testOATokenDebug() {
    try {
      const appId = this.configService.get('ZALO_APP_ID');
      const appSecret = this.configService.get('ZALO_APP_SECRET');

      this.logger.log('🔍 Testing OA Token with credentials:');
      this.logger.log(`App ID: ${appId}`);
      this.logger.log(`App Secret: ${appSecret ? appSecret.substring(0, 5) + '...' : 'NOT_SET'}`);

      // Test 1: Dùng JSON format
      let jsonResult;
      try {
        this.logger.log('📝 Test 1: JSON Format');
        const jsonResponse = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', {
          app_id: appId,
          app_secret: appSecret,
          grant_type: 'client_credentials'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        jsonResult = { success: true, data: jsonResponse.data };
      } catch (error) {
        jsonResult = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        };
      }

      // Test 2: Dùng Form + Secret Header
      let formResult;
      try {
        this.logger.log('📝 Test 2: Form + Secret Header');
        const formData = new URLSearchParams();
        formData.append('app_id', appId);
        formData.append('grant_type', 'client_credentials');

        const formResponse = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': appSecret
          }
        });
        formResult = { success: true, data: formResponse.data };
      } catch (error) {
        formResult = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        };
      }

      // Test 3: Thử endpoint Mini App
      let miniAppResult;
      try {
        this.logger.log('📝 Test 3: Mini App Endpoint');
        const miniResponse = await axios.post('https://oauth.zaloapp.com/v4/access_token', {
          app_id: appId,
          app_secret: appSecret,
          grant_type: 'client_credentials'
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        miniAppResult = { success: true, data: miniResponse.data };
      } catch (error) {
        miniAppResult = {
          success: false,
          error: error.response?.data || error.message,
          status: error.response?.status
        };
      }

      return {
        credentials: {
          appId,
          appSecret: appSecret ? appSecret.substring(0, 5) + '...' : 'NOT_SET'
        },
        tests: {
          jsonFormat: jsonResult,
          formWithSecretHeader: formResult,
          miniAppEndpoint: miniAppResult
        },
        recommendations: this.getTokenRecommendations(jsonResult, formResult, miniAppResult)
      };

    } catch (error) {
      this.logger.error('Debug test error:', error);
      return {
        error: 'Debug test failed',
        message: error.message
      };
    }
  }

  private getTokenRecommendations(jsonResult: any, formResult: any, miniAppResult: any): string[] {
    const recommendations = [];

    if (jsonResult.success) {
      recommendations.push('✅ JSON format works - use OA endpoint with JSON');
    } else if (jsonResult.error?.error === -14002) {
      recommendations.push('❌ Invalid App ID detected in JSON test');
    }

    if (formResult.success) {
      recommendations.push('✅ Form + Secret header works - recommended format');
    } else if (formResult.error?.error === -14002) {
      recommendations.push('❌ Invalid App ID detected in Form test');
    }

    if (miniAppResult.success) {
      recommendations.push('✅ Mini App endpoint works - alternative option');
    } else if (miniAppResult.error?.error === -14002) {
      recommendations.push('❌ Invalid App ID detected in Mini App test');
    }

    if (!jsonResult.success && !formResult.success && !miniAppResult.success) {
      recommendations.push('🚨 All methods failed - check App ID and Secret in Zalo Developer Console');
      recommendations.push('🔍 Verify App ID format (should be numeric)');
      recommendations.push('🔍 Verify App Secret is correct');
      recommendations.push('🔍 Check if app is active and approved');
    }

    return recommendations;
  }

  //fucntion register user
  @Post('/register')
  async registerUser(@Body() input: SignupDto): Promise<any> {

    // input.passWord = await this.authService.hashPassword(input.passWord);
    return this.authService.createUser(input);
  }


  @Post('/login')
  async loginAdmin(@Body() input: SigninDto): Promise<AuthTokenOutput> {
    return this.authService.loginAdmin(input);
  }

  @Post('re-send-code')
  async reSendCode(@Body() input: reSendCodeDto) {
    return this.authService.reSendCode(input);
  }


  @Post('refresh-token')
  @ApiOperation({
    summary: 'Refresh access token API'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(AuthTokenOutput)
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse
  })
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async refreshToken(
    @ReqContext() ctx: RequestContext,
    @Body() credential: RefreshTokenInput
  ): Promise<BaseApiResponse<AuthTokenOutput>> {
    const authToken = await this.authService.refreshToken(ctx);
    return { data: authToken, meta: {} };
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('logout')
  logout(@Req() req) {
    return this.authService.logout(req);
  }

  @Post('forget-password')
  async forgetPassword(@Body() input: forgetPassDto) {
    return this.authService.forgetPassword(input);
  }

  @Post('confirm-forget-password')
  async confirmForgetPassword(@Body() input: confirmationInput) {
    return this.authService.confirmationForgetPassword(input);
  }

  @Post('reset-password')
  async resetPassword(@Body() input: resetPassword) {
    return this.authService.resetPassword(input);
  }

  @Post('request-unlock')
  @ApiOperation({
    summary: 'Gửi mã xác nhận để mở khóa tài khoản',
    description: 'Gửi mã xác nhận qua email để mở khóa tài khoản bị khóa do đăng nhập sai quá nhiều lần'
  })
  async requestUnlockAccount(@Body() input: SendUnlockCodeDto) {
    return this.authService.requestUnlockAccount(input);
  }

  @Post('verify-unlock')
  @ApiOperation({
    summary: 'Xác nhận mã để mở khóa tài khoản',
    description: 'Xác thực mã được gửi qua email để mở khóa tài khoản'
  })
  async verifyUnlockCode(@Body() input: UnlockAccountDto) {
    return this.authService.verifyUnlockCode(input);
  }

  @Post('reset-password-by-username')
  @ApiOperation({
    summary: 'Reset mật khẩu về Abc@123 bằng userName',
    description: 'Reset mật khẩu của tài khoản về mật khẩu mặc định Abc@123 và mở khóa tài khoản'
  })
  @ApiResponse({
    status: 200,
    description: 'Reset mật khẩu thành công'
  })
  async resetPasswordByUserName(@Body() input: ResetPasswordByUserNameDto) {
    return this.authService.resetPasswordByUserName(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('approve-identity')
  async approveIdentity(@Body() input: approveIdentityDto) {
    return this.authService.approveIdentity(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('reject')
  async rejectIdentity(@Body() payload: rejectIdentityDto) {
    return await this.authService.rejectIdentity(payload);
  }


  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('change-password')
  async changePassword(@Body() input: ChangePasswordDto) {
    return this.authService.changePassword(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('create-admin')
  async createAdmin(@Body() input: SignupAdminDto): Promise<any> {
    return this.authService.createAdmin(input);
  }

  @Get('debug/oa-config')
  @ApiOperation({ summary: 'Debug OA Configuration (Dev only)' })
  async debugOAConfig() {
    // Import ở đây để tránh circular dependency
    const { ZaloTokenService } = await import('./zalo-token.service');
    const { ConfigService } = await import('@nestjs/config');

    const configService = new ConfigService();
    const tokenService = new ZaloTokenService(configService);

    return await tokenService.testOAConfiguration();
  }

  @Get('debug/get-oa-token')
  @ApiOperation({ summary: 'Lấy OA Access Token tự động (Dev only)' })
  async getOATokenDebug() {
    return await this.zaloOASimpleTokenService.getAccessToken();
  }

  @Get('debug/zalo-credentials')
  @ApiOperation({ summary: 'Debug Zalo Credentials (Dev only)' })
  async debugZaloCredentials() {
    // Debug credentials from the simple token service
    return {
      success: true,
      message: 'Using ZaloOASimpleTokenService',
      hasToken: !!(await this.zaloOASimpleTokenService.getAccessToken()),
      timestamp: new Date().toISOString()
    };
  }
  à
  @Get('debug/verify-app')
  @ApiOperation({ summary: 'Verify App ID exists (Dev only)' })
  async verifyZaloApp() {
    // Verify using simple token service
    try {
      const token = await this.zaloOASimpleTokenService.getAccessToken();
      return {
        success: !!token,
        message: token ? 'App verified - has access token' : 'App not verified - no access token',
        hasToken: !!token,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: 'App verification failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Debug OA Token Info
   */
  @Get('debug/oa-token-info')
  @ApiOperation({ summary: 'Debug OA Token Information' })
  async debugOATokenInfo() {
    try {
      const currentToken = await this.zaloOASimpleTokenService.getCurrentToken();
      const history = await this.zaloOASimpleTokenService.getTokenHistory(5);
      const needsNew = await this.zaloOASimpleTokenService.needsNewToken();

      return {
        success: true,
        currentToken,
        tokenHistory: history,
        needsNewToken: needsNew,
        oaId: process.env.ZALO_OA_ID,
        hasOASecret: !!process.env.ZALO_OA_SECRET,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Manual save OA token (for testing)
   */
  @Post('debug/save-oa-token')
  @ApiOperation({ summary: 'Manually save OA token for testing' })
  async saveOATokenManual(@Body() tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  }) {
    try {
      const saved = await this.zaloOASimpleTokenService.saveToken({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in || 90000, // Default 25 hours
        scope: tokenData.scope
      });

      return {
        success: saved,
        message: saved ? 'Token saved successfully' : 'Failed to save token',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test OA Token Service
   */
  @Get('test-oa-service')
  @ApiOperation({ summary: 'Test OA Token Service' })
  async testOAService() {
    try {
      const result = await this.zaloOASimpleTokenService.getAccessToken();
      return {
        success: !!result,
        hasToken: !!result,
        tokenPreview: result ? result.substring(0, 20) + '...' : null,
        message: result ? 'Token available' : 'No token found - need OAuth flow'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get OA Token (simplified)
   */
  @Get('get-oa-token')
  @ApiOperation({ summary: 'Get OA Access Token' })
  async getOAToken() {
    return await this.zaloOASimpleTokenService.getAccessToken();
  }

  /**
   * Test gửi thông báo Zalo OA trực tiếp
   */
  @Post('test-zalo-oa-message')
  @ApiOperation({ summary: 'Test gửi thông báo Zalo OA' })
  async testZaloOAMessage(@Body() body: { zaloUserId: string; message?: string }) {
    try {
      // Import ZaloPushService để test
      const { ZaloPushNotificationService } = await import('./zalo-push.service');

      // Tạo instance (cần inject dependencies)
      // Tạm thời return thông tin để debug
      return {
        success: false,
        message: 'Endpoint này cần cải thiện - hãy dùng endpoint khác để test',
        suggestedEndpoint: 'GET /zalo/test-notification?userId=YOUR_ZALO_USER_ID'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }


}
