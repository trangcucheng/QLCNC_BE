import { Controller, Get, HttpStatus, Logger, Query, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ZaloOASimpleTokenService } from './zalo-oa-simple-token.service';

@Controller('zalo-oauth')
export class ZaloOAuthController {
  private readonly logger = new Logger(ZaloOAuthController.name);

  constructor(
    private readonly zaloTokenService: ZaloOASimpleTokenService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Step 1: Redirect to Zalo OAuth
   * GET /zalo-oauth/authorize
   */
  @Get('authorize')
  @Redirect()
  authorize() {
    const appId = this.configService.get<string>('ZALO_APP_ID');
    const redirectUri = encodeURIComponent('http://localhost:3000/zalo-oauth/callback');
    const state = Math.random().toString(36).substring(7);

    const authUrl = `https://oauth.zaloapp.com/v4/oa/permission?app_id=${appId}&redirect_uri=${redirectUri}&state=${state}`;

    this.logger.log('🔗 Redirecting to Zalo OAuth:', authUrl);

    return {
      url: authUrl,
      statusCode: HttpStatus.FOUND,
    };
  }

  /**
   * Step 2: Handle OAuth callback
   * GET /zalo-oauth/callback?code=xxx&state=xxx
   */
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error?: string,
  ) {
    if (error) {
      this.logger.error('❌ OAuth error:', error);
      return { success: false, error };
    }

    if (!code) {
      this.logger.error('❌ No authorization code received');
      return { success: false, error: 'No authorization code' };
    }

    this.logger.log('📥 Received OAuth callback:', { code: code.substring(0, 20) + '...', state });

    try {
      // Exchange code for access token
      const result = await this.zaloTokenService.exchangeAuthorizationCode(
        code,
        this.configService.get<string>('ZALO_APP_ID'),
        'authorization_code',
        '' // code_verifier không cần cho OA flow
      );

      this.logger.log('✅ Token exchange successful');

      return {
        success: true,
        message: 'Zalo OA token đã được lưu thành công!',
        data: {
          expires_in: result.expires_in,
          scope: result.scope
        }
      };
    } catch (error) {
      this.logger.error('❌ Token exchange failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current token status
   * GET /zalo-oauth/status
   */
  @Get('status')
  async getStatus() {
    try {
      const currentToken = await this.zaloTokenService.getCurrentToken();
      const needsRefresh = await this.zaloTokenService.needsNewToken();

      return {
        hasToken: !!currentToken,
        tokenInfo: currentToken ? {
          id: currentToken.id,
          expires_at: currentToken.expires_at,
          is_active: currentToken.is_active,
          created_at: currentToken.created_at
        } : null,
        needsRefresh,
        oauthUrl: 'http://localhost:3000/zalo-oauth/authorize'
      };
    } catch (error) {
      this.logger.error('❌ Error getting token status:', error);
      return { error: error.message };
    }
  }
}
