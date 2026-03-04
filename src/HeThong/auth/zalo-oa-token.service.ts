import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class ZaloOATokenService {
  private readonly logger = new Logger(ZaloOATokenService.name);

  constructor(private readonly configService: ConfigService) { }

  /**
   * Lấy OA Access Token theo tài liệu chính thức Zalo OA
   * https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new
   */
  async getOAAccessToken(): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    error?: string;
  }> {
    try {
      const appId = this.configService.get<string>('ZALO_APP_ID');
      const appSecret = this.configService.get<string>('ZALO_APP_SECRET');

      if (!appId || !appSecret) {
        return {
          success: false,
          error: 'ZALO_APP_ID hoặc ZALO_APP_SECRET không được cấu hình'
        };
      }

      this.logger.log(`🔍 Getting OA Access Token for App ID: ${appId.substring(0, 10)}...`);

      // Theo tài liệu Zalo OA - sử dụng form-urlencoded
      const formData = new URLSearchParams();
      formData.append('app_id', appId);
      formData.append('grant_type', 'client_credentials');

      // Method 1: Official Account endpoint theo tài liệu chính thức
      let response;
      let endpointUsed = 'Unknown';

      try {
        this.logger.log('🔄 Trying Official OA endpoint (recommended)...');
        response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', formData, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': appSecret
          }
        });
        endpointUsed = 'OA (Official)';
        this.logger.log('✅ OA Official endpoint SUCCESS');

      } catch (oaError) {
        this.logger.log('❌ OA Official endpoint failed:', oaError.response?.data);

        // Fallback: Thử JSON format (backup method)
        try {
          this.logger.log('🔄 Trying fallback JSON endpoint...');
          response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', {
            app_id: appId,
            app_secret: appSecret,
            grant_type: 'client_credentials'
          }, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          endpointUsed = 'OA (JSON Fallback)';
          this.logger.log('✅ Fallback JSON endpoint SUCCESS');

        } catch (jsonError) {
          this.logger.error('❌ Both OA methods failed!');
          this.logger.error('Form-urlencoded error:', oaError.response?.data);
          this.logger.error('JSON fallback error:', jsonError.response?.data);

          return {
            success: false,
            error: `Both OA methods failed. Form: ${oaError.response?.data?.error_description || oaError.message}, JSON: ${jsonError.response?.data?.error_description || jsonError.message}`
          };
        }
      } this.logger.log(`✅ ${endpointUsed} Token Response:`, JSON.stringify(response.data, null, 2));

      if (response.data.error && response.data.error !== 0) {
        return {
          success: false,
          error: `${response.data.error}: ${response.data.error_description || response.data.message}`
        };
      }

      // Check for required fields
      if (!response.data.access_token) {
        return {
          success: false,
          error: 'No access_token in response'
        };
      }

      return {
        success: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      };

    } catch (error) {
      this.logger.error('❌ Lỗi lấy OA Access Token:', error.response?.data || error.message);

      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  /**
   * Test current token validity
   */
  async testCurrentToken(): Promise<{
    success: boolean;
    profile?: any;
    error?: string;
  }> {
    try {
      const currentToken = this.configService.get<string>('ZALO_OA_ACCESS_TOKEN');

      if (!currentToken || currentToken === 'your_zalo_oa_access_token_here') {
        return {
          success: false,
          error: 'Chưa có access token hoặc token là placeholder'
        };
      }

      const response = await axios.get('https://openapi.zalo.me/v2.0/oa/getprofile', {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });

      if (response.data.error !== 0) {
        return {
          success: false,
          error: response.data.message || 'Token không hợp lệ'
        };
      }

      return {
        success: true,
        profile: response.data.data
      };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Refresh OA Access Token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    error?: string;
  }> {
    try {
      const appId = this.configService.get<string>('ZALO_APP_ID');
      const appSecret = this.configService.get<string>('ZALO_APP_SECRET');

      this.logger.log('🔄 Refreshing OA Access Token...');

      const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', {
        app_id: appId,
        app_secret: appSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('✅ Token Refresh Response:', JSON.stringify(response.data, null, 2));

      if (response.data.error && response.data.error !== 0) {
        return {
          success: false,
          error: `${response.data.error}: ${response.data.error_description || response.data.message}`
        };
      }

      return {
        success: true,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        expiresIn: response.data.expires_in
      };

    } catch (error) {
      this.logger.error('❌ Lỗi refresh OA Access Token:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error_description || error.message
      };
    }
  }

  /**
   * Get valid access token với auto-refresh
   */
  async getValidAccessToken(): Promise<{
    success: boolean;
    accessToken?: string;
    error?: string;
  }> {
    try {
      // 1. Kiểm tra token hiện tại
      const testResult = await this.testCurrentToken();

      if (testResult.success) {
        const currentToken = this.configService.get<string>('ZALO_OA_ACCESS_TOKEN');
        return {
          success: true,
          accessToken: currentToken
        };
      }

      this.logger.log('🔄 Token hết hạn, thử refresh...');

      // 2. Thử refresh token nếu có
      const refreshToken = this.configService.get<string>('ZALO_OA_REFRESH_TOKEN');

      if (refreshToken && refreshToken !== 'your_zalo_oa_refresh_token_here') {
        const refreshResult = await this.refreshAccessToken(refreshToken);

        if (refreshResult.success) {
          this.logger.log('✅ Token refreshed successfully');
          return {
            success: true,
            accessToken: refreshResult.accessToken
          };
        }

        this.logger.log('❌ Refresh failed, generating new token...');
      }

      // 3. Nếu refresh thất bại, tạo token mới
      const newTokenResult = await this.getOAAccessToken();

      if (newTokenResult.success) {
        return {
          success: true,
          accessToken: newTokenResult.accessToken
        };
      }

      return {
        success: false,
        error: 'Không thể lấy valid access token'
      };

    } catch (error) {
      this.logger.error('❌ Lỗi get valid access token:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate và test token trong một lần
   */
  async generateAndTest(): Promise<{
    success: boolean;
    tokenResult?: any;
    testResult?: any;
    instructions?: string[];
    error?: string;
  }> {
    // 1. Thử lấy token mới
    const tokenResult = await this.getOAAccessToken();

    if (!tokenResult.success) {
      return {
        success: false,
        tokenResult,
        error: 'Không thể lấy token tự động',
        instructions: [
          '1. Vào https://oa.zalo.me/manage',
          '2. Chọn OA "Công đoàn Bắc Giang"',
          '3. Menu "Cài đặt" → "API & Webhook"',
          '4. Tạo "Access Token" mới',
          '5. Copy token và cập nhật vào .env'
        ]
      };
    }

    // 2. Test token vừa lấy được
    // Temporarily set token để test (chỉ trong memory)
    process.env.TEMP_ZALO_TOKEN = tokenResult.accessToken;

    const testResponse = await axios.get('https://openapi.zalo.me/v2.0/oa/getprofile', {
      headers: {
        'Authorization': `Bearer ${tokenResult.accessToken}`
      }
    });

    const testResult = {
      success: testResponse.data.error === 0,
      profile: testResponse.data.data,
      error: testResponse.data.message
    };

    delete process.env.TEMP_ZALO_TOKEN;

    return {
      success: tokenResult.success && testResult.success,
      tokenResult,
      testResult,
      instructions: [
        'Token lấy thành công! Cập nhật vào .env:',
        `ZALO_OA_ACCESS_TOKEN=${tokenResult.accessToken}`,
        `ZALO_OA_REFRESH_TOKEN=${tokenResult.refreshToken || 'N/A'}`,
        'Sau đó restart server để load config mới'
      ]
    };
  }

  /**
   * Kiểm tra App có tồn tại trong Developer Console không
   */
  async verifyAppExists(): Promise<any> {
    const appId = this.configService.get<string>('ZALO_APP_ID');

    const checks = {
      appId: appId,
      appIdType: 'Unknown',
      suggestions: [],
      nextSteps: []
    };

    // Phân tích App ID format
    if (appId) {
      if (appId.length === 19) {
        checks.appIdType = 'Có thể là OA ID (19 digits)';
        checks.suggestions.push('🔴 App ID này giống OA ID format, không phải Mini App ID');
      } else if (appId.length < 15) {
        checks.appIdType = 'Có thể là Mini App ID (short format)';
        checks.suggestions.push('✅ Format có vẻ đúng cho Mini App');
      } else {
        checks.appIdType = 'Format không rõ';
        checks.suggestions.push('⚠️ App ID format lạ, cần kiểm tra lại');
      }
    }

    // Next steps
    checks.nextSteps = [
      '1. Vào https://developers.zalo.me/apps',
      '2. Kiểm tra danh sách apps hiện có',
      '3. Nếu chưa có Mini App → Tạo "New App" → chọn "Mini Program"',
      '4. Copy App ID và App Secret từ app vừa tạo',
      '5. Cập nhật vào .env file'
    ];

    return checks;
  }

  /**
   * Debug credentials và endpoints
   */
  async debugCredentials(): Promise<any> {
    const appId = this.configService.get<string>('ZALO_APP_ID');
    const appSecret = this.configService.get<string>('ZALO_APP_SECRET');

    const debugInfo = {
      credentials: {
        appId: appId ? `${appId.substring(0, 10)}...` : 'NOT_SET',
        appSecret: appSecret ? `${appSecret.substring(0, 5)}...` : 'NOT_SET',
        appIdLength: appId?.length,
        appSecretLength: appSecret?.length
      },
      endpoints: {
        miniApp: 'https://oauth.zaloapp.com/v4/access_token',
        oa: 'https://oauth.zaloapp.com/v4/oa/access_token'
      },
      suggestions: []
    };

    // Check App ID format
    if (appId && appId.length > 15) {
      debugInfo.suggestions.push('⚠️ App ID quá dài, có thể là OA ID thay vì Mini App ID');
    }

    if (appId && appId.length < 10) {
      debugInfo.suggestions.push('⚠️ App ID quá ngắn, kiểm tra lại');
    }

    // Test endpoints
    const tests = [];

    if (appId && appSecret) {
      // Test Mini App endpoint
      try {
        await axios.post('https://oauth.zaloapp.com/v4/access_token', {
          app_id: appId,
          app_secret: appSecret,
          grant_type: 'client_credentials'
        });
        tests.push({ endpoint: 'Mini App', status: 'SUCCESS' });
      } catch (error) {
        tests.push({
          endpoint: 'Mini App',
          status: 'FAILED',
          error: error.response?.data?.error_description || error.message
        });
      }

      // Test OA endpoint  
      try {
        await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', {
          app_id: appId,
          app_secret: appSecret,
          grant_type: 'client_credentials'
        });
        tests.push({ endpoint: 'OA', status: 'SUCCESS' });
      } catch (error) {
        tests.push({
          endpoint: 'OA',
          status: 'FAILED',
          error: error.response?.data?.error_description || error.message
        });
      }
    }

    debugInfo['endpointTests'] = tests;

    if (tests.every(t => t.status === 'FAILED')) {
      debugInfo.suggestions.push('🔴 Cả 2 endpoint đều fail - App ID/Secret không đúng');
      debugInfo.suggestions.push('📝 Cần vào https://developers.zalo.me để lấy credentials đúng');
    }

    return debugInfo;
  }
}
