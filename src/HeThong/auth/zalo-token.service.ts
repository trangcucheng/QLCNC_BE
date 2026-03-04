import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ZaloTokenService {
  private readonly logger = new Logger(ZaloTokenService.name);
  private tokenData: any = null;
  private readonly appId: string;
  private readonly appSecret: string;
  private readonly oauthUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appId = configService.get<string>('ZALO_OA_ID') || process.env.ZALO_OA_ID;
    this.appSecret = configService.get<string>('ZALO_OA_SECRET') || process.env.ZALO_OA_SECRET;
    this.oauthUrl = configService.get<string>('ZALO_API_URL') || process.env.ZALO_API_URL || 'https://oauth.zaloapp.com/v4';
  }

  /**
   * Lưu token vào memory
   */
  async saveToken(data: any): Promise<void> {
    const expiresAt = Date.now() + (data.expires_in ?? 90000) * 1000;
    this.tokenData = {
      ...data,
      expires_at: expiresAt
    };

    this.logger.log('✅ Token saved:', {
      expires_at: new Date(expiresAt).toISOString(),
      expires_in: data.expires_in
    });
  }

  /**
   * Lấy token hiện tại
   */
  async getToken(): Promise<any> {
    return this.tokenData;
  }

  /**
   * Lấy access token (tự động refresh nếu hết hạn)
   */
  async getAccessToken(): Promise<string | null> {
    if (!this.tokenData) {
      this.logger.warn('⚠️ No token available');
      return null;
    }

    // Kiểm tra token sắp hết hạn (còn < 5 phút)
    const fiveMinutes = 5 * 60 * 1000;
    const willExpireSoon = (this.tokenData.expires_at - Date.now()) < fiveMinutes;

    if (willExpireSoon) {
      this.logger.log('🔄 Token sắp hết hạn, đang refresh...');
      const refreshed = await this.refreshAccessToken();

      if (!refreshed) {
        this.logger.error('❌ Refresh token thất bại');
        return null;
      }
    }

    return this.tokenData.access_token;
  }

  /**
   * 🔄 Refresh access token tự động
   */
  private async refreshAccessToken(): Promise<boolean> {
    try {
      if (!this.tokenData?.refresh_token) {
        this.logger.error('❌ Không có refresh_token');
        return false;
      }

      this.logger.log('🔄 Đang refresh access token...');

      const params = new URLSearchParams({
        app_id: this.appId,
        app_secret: this.appSecret,
        grant_type: 'refresh_token',
        refresh_token: this.tokenData.refresh_token,
      });

      const response = await axios.post(`${this.oauthUrl}/oa/access_token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.error) {
        this.logger.error('❌ Refresh token API error:', response.data);
        return false;
      }

      // Lưu token mới
      await this.saveToken(response.data);
      this.logger.log('✅ Access token đã được refresh thành công');
      return true;

    } catch (error) {
      this.logger.error('❌ Lỗi khi refresh token:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Kiểm tra token có hợp lệ không
   */
  isTokenValid(): boolean {
    return this.tokenData && this.tokenData.expires_at > Date.now();
  }

  /**
   * 🔄 Force set token expired (for testing)
   */
  forceExpireToken(): { success: boolean; old_expires_at: string | null } {
    if (!this.tokenData) {
      return { success: false, old_expires_at: null };
    }

    const oldExpiresAt = this.tokenData.expires_at;
    this.tokenData.expires_at = 0;

    return {
      success: true,
      old_expires_at: new Date(oldExpiresAt).toISOString()
    };
  }

  /**
   * 🔍 Check if has refresh token
   */
  hasRefreshToken(): boolean {
    return !!(this.tokenData?.refresh_token);
  }

  /**
   * Get token info với thông tin chi tiết
   */
  getTokenInfo(): any {
    if (!this.tokenData) {
      return {
        status: 'no_token',
        message: 'Chưa có token nào được lưu. Vui lòng thực hiện OAuth flow hoặc save token.'
      };
    }

    const now = Date.now();
    const isExpired = this.tokenData.expires_at < now;
    const remainingTime = Math.max(0, this.tokenData.expires_at - now);
    const fiveMinutes = 5 * 60 * 1000;
    const willExpireSoon = remainingTime < fiveMinutes;

    let status = 'valid';
    let message = 'Token hợp lệ';

    if (isExpired) {
      status = 'expired';
      message = 'Token đã hết hạn. Sẽ tự động refresh khi cần thiết.';
    } else if (willExpireSoon) {
      status = 'expiring_soon';
      message = `Token sắp hết hạn trong ${Math.floor(remainingTime / 60000)} phút. Sẽ tự động refresh.`;
    }

    return {
      status,
      message,
      expires_at: new Date(this.tokenData.expires_at).toISOString(),
      remaining_seconds: Math.floor(remainingTime / 1000),
      remaining_minutes: Math.floor(remainingTime / 60000),
      remaining_hours: Math.floor(remainingTime / 3600000),
      will_expire_soon: willExpireSoon,
      has_refresh_token: !!this.tokenData.refresh_token,
      access_token_preview: this.tokenData.access_token?.substring(0, 20) + '...',
      refresh_token_preview: this.tokenData.refresh_token?.substring(0, 20) + '...',
      auto_refresh_enabled: true
    };
  }

  /**
   * Test OA Configuration - Debug thông tin cấu hình OA
   */
  async testOAConfiguration(): Promise<any> {
    const debugInfo = {
      credentials: {
        appId: this.appId ? `${this.appId.substring(0, 10)}...` : 'NOT_SET',
        appSecret: this.appSecret ? `${this.appSecret.substring(0, 5)}...` : 'NOT_SET',
        appIdLength: this.appId?.length,
        appSecretLength: this.appSecret?.length,
        oauthUrl: this.oauthUrl
      },
      validation: {
        hasAppId: !!this.appId,
        hasAppSecret: !!this.appSecret,
        configComplete: !!(this.appId && this.appSecret)
      },
      suggestions: []
    };

    // Validate App ID format
    if (!this.appId) {
      debugInfo.suggestions.push('🔴 ZALO_OA_ID chưa được cấu hình trong .env');
    } else if (this.appId.length !== 19) {
      debugInfo.suggestions.push('⚠️ OA ID thường có 19 chữ số, kiểm tra lại format');
    } else {
      debugInfo.suggestions.push('✅ OA ID có format hợp lệ');
    }

    // Validate App Secret
    if (!this.appSecret) {
      debugInfo.suggestions.push('🔴 ZALO_OA_SECRET chưa được cấu hình trong .env');
    } else if (this.appSecret.length < 20) {
      debugInfo.suggestions.push('⚠️ OA Secret có vẻ quá ngắn, kiểm tra lại');
    } else {
      debugInfo.suggestions.push('✅ OA Secret có format hợp lệ');
    }

    // Test connection if credentials are available
    if (this.appId && this.appSecret) {
      try {
        const testResult = await this.testOAConnection();
        debugInfo['connectionTest'] = testResult;
      } catch (error) {
        debugInfo['connectionTest'] = {
          success: false,
          error: error.message
        };
      }
    }

    // Add setup instructions
    debugInfo['setupInstructions'] = [
      '1. Vào https://oa.zalo.me/manage',
      '2. Chọn Official Account của bạn',
      '3. Menu "Cài đặt" → "API & Webhook"',
      '4. Copy "OA ID" và "OA Secret Key"',
      '5. Cập nhật vào .env: ZALO_OA_ID và ZALO_OA_SECRET'
    ];

    return debugInfo;
  }

  /**
   * Test kết nối với Zalo OA API
   */
  private async testOAConnection(): Promise<any> {
    try {
      const response = await axios.post(`${this.oauthUrl}/oa/access_token`, {
        app_id: this.appId,
        app_secret: this.appSecret,
        grant_type: 'client_credentials'
      });

      return {
        success: true,
        message: 'Kết nối OA thành công',
        tokenReceived: !!response.data.access_token
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error_description || error.message,
        errorCode: error.response?.data?.error || 'unknown',
        httpStatus: error.response?.status
      };
    }
  }
}
