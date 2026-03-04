import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Connection } from 'typeorm';

interface ZaloOATokenData {
  id?: number;
  oa_id: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  expires_at: Date;
  token_type?: string;
  scope?: string;
  is_active?: number;
}

@Injectable()
export class ZaloOASimpleTokenService {
  private readonly logger = new Logger(ZaloOASimpleTokenService.name);
  private readonly oaId: string;
  private readonly oaSecret: string;
  private readonly appId: string;
  private readonly appSecret: string;

  constructor(
    private readonly connection: Connection,
    private readonly configService: ConfigService,
  ) {
    this.oaId = configService.get<string>('ZALO_OA_ID');
    this.oaSecret = configService.get<string>('ZALO_OA_SECRET');
    this.appId = configService.get<string>('ZALO_APP_ID');
    this.appSecret = configService.get<string>('ZALO_APP_SECRET');

    console.log('Zalo OA Simple Token Service initialized:', {
      oaId: this.oaId ? this.oaId.substring(0, 8) + '...' : 'NOT_SET',
      hasSecret: !!this.oaSecret
    });

    // Tự động tạo bảng nếu chưa có
    this.createTableIfNotExists();
  }

  /**
   * Tự động tạo bảng zalo_oa_tokens nếu chưa có
   */
  private async createTableIfNotExists(): Promise<void> {
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS zalo_oa_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          oa_id VARCHAR(255) NOT NULL COMMENT 'Zalo OA ID',
          access_token TEXT NOT NULL COMMENT 'Access token',
          refresh_token TEXT COMMENT 'Refresh token',
          expires_in INT NOT NULL COMMENT 'Thời gian hết hạn (seconds)',
          expires_at DATETIME NOT NULL COMMENT 'Thời điểm hết hạn',
          token_type VARCHAR(50) DEFAULT 'Bearer' COMMENT 'Loại token',
          scope TEXT COMMENT 'Phạm vi quyền',
          is_active TINYINT DEFAULT 1 COMMENT '1: Active, 0: Inactive',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_oa_id (oa_id),
          INDEX idx_active (is_active),
          INDEX idx_expires_at (expires_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;

      await this.connection.query(createTableSQL);
      this.logger.log('✅ Zalo OA tokens table ready');
    } catch (error) {
      this.logger.error('❌ Error creating zalo_oa_tokens table:', error);
    }
  }

  /**
   * Lấy token từ OAuth authorization code
   */
  async getTokenFromCode(code: string, codeVerifier: string): Promise<boolean> {
    try {
      const response = await axios.post('https://oauth.zaloapp.com/v4/oa/access_token', {
        code,
        app_id: this.configService.get<string>('ZALO_APP_ID'),
        grant_type: 'authorization_code',
        code_verifier: codeVerifier
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': this.appSecret
        }
      });

      if (response.data.access_token) {
        // Lưu token vào database
        return await this.saveToken({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in || 90000,
          scope: response.data.scope
        });
      }

      this.logger.error('❌ No access token in response:', response.data);
      return false;
    } catch (error) {
      this.logger.error('❌ Error getting token from code:', error.response?.data || error.message);
      return false;
    }
  }

  /**
   * Lưu token mới
   */
  async saveToken(tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }): Promise<boolean> {
    try {
      // Tính thời gian hết hạn
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      // Vô hiệu hóa token cũ
      await this.connection.query(
        'UPDATE zalo_oa_tokens SET is_active = 0 WHERE oa_id = ? AND is_active = 1',
        [this.oaId]
      );

      // Thêm token mới
      await this.connection.query(
        `INSERT INTO zalo_oa_tokens 
         (oa_id, access_token, refresh_token, expires_in, expires_at, scope, is_active) 
         VALUES (?, ?, ?, ?, ?, ?, 1)`,
        [
          this.oaId,
          tokenData.access_token,
          tokenData.refresh_token,
          tokenData.expires_in,
          expiresAt,
          tokenData.scope
        ]
      );

      this.logger.log('✅ Token saved successfully:', {
        expiresAt: expiresAt.toISOString(),
        expiresIn: tokenData.expires_in
      });

      return true;
    } catch (error) {
      this.logger.error('❌ Error saving token:', error);
      return false;
    }
  }

  /**
   * Lấy access token hiện tại (tự động refresh nếu cần)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Lấy token active mới nhất
      const [currentToken] = await this.connection.query(
        'SELECT * FROM zalo_oa_tokens WHERE oa_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
        [this.oaId]
      );

      this.logger.log(`🔍 [DEBUG] Current token check for OA ID: ${this.oaId}`);

      if (!currentToken) {
        this.logger.warn('⚠️ No active token found - need to get token from OAuth flow');
        return null;
      }

      // Debug log thông tin token
      const now = new Date();
      const createdAt = new Date(currentToken.created_at);
      const expiresInMs = currentToken.expires_in * 1000; // expires_in tính bằng giây
      const calculatedExpiresAt = new Date(createdAt.getTime() + expiresInMs);
      const timeLeft = calculatedExpiresAt.getTime() - now.getTime();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));

      this.logger.log(`🔍 [DEBUG] Token info:`);
      this.logger.log(`  - Created at: ${createdAt.toISOString()}`);
      this.logger.log(`  - Expires in: ${currentToken.expires_in} seconds`);
      this.logger.log(`  - Calculated expires at: ${calculatedExpiresAt.toISOString()}`);
      this.logger.log(`  - Current time: ${now.toISOString()}`);
      this.logger.log(`  - Minutes left: ${minutesLeft}`);
      this.logger.log(`  - Has refresh token: ${!!currentToken.refresh_token}`);

      // Kiểm tra token đã hết hạn hoàn toàn hoặc sắp hết hạn (còn < 10 phút)
      const tenMinutes = 10 * 60 * 1000;
      const isExpired = timeLeft <= 0;
      const willExpireSoon = timeLeft < tenMinutes;

      if (isExpired || willExpireSoon) {
        this.logger.log(`⚠️ Token ${isExpired ? 'đã hết hạn' : 'sắp hết hạn'} (${minutesLeft} minutes left)`);

        if (currentToken.refresh_token) {
          this.logger.log('🔄 Đang refresh token...');
          const refreshed = await this.refreshAccessToken(currentToken.refresh_token);

          if (refreshed) {
            // Lấy token mới sau khi refresh
            const [newToken] = await this.connection.query(
              'SELECT * FROM zalo_oa_tokens WHERE oa_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
              [this.oaId]
            );
            this.logger.log('✅ Token refreshed successfully');
            return newToken?.access_token || null;
          } else {
            this.logger.error('❌ Failed to refresh token - marking current token as inactive');

            // Deactivate the expired token
            await this.connection.query(
              'UPDATE zalo_oa_tokens SET is_active = 0 WHERE id = ?',
              [currentToken.id]
            );

            return null;
          }
        } else {
          this.logger.warn('⚠️ Token expired but no refresh token available - need re-authentication');
          return null;
        }
      }

      this.logger.log('✅ Current token is still valid');
      return currentToken.access_token;
    } catch (error) {
      this.logger.error('❌ Error getting access token:', error);
      return null;
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeAuthorizationCode(
    code: string,
    appId: string,
    grantType = 'authorization_code',
    codeVerifier?: string
  ): Promise<any> {
    try {
      const oauthUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';

      // Cho OA flow, không cần code_verifier
      const payload = new URLSearchParams({
        code,
        app_id: appId,
        grant_type: grantType
      });

      // Chỉ thêm code_verifier nếu có (cho PKCE flow)
      if (codeVerifier) {
        payload.append('code_verifier', codeVerifier);
      }

      this.logger.log('🔄 Exchanging authorization code...', {
        appId,
        hasCodeVerifier: !!codeVerifier
      });

      const response = await axios.post(oauthUrl, payload, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'secret_key': this.appSecret
        }
      });

      if (response.data.access_token) {
        // Lưu token vào database
        const tokenData: ZaloOATokenData = {
          oa_id: this.oaId,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          expires_in: response.data.expires_in,
          expires_at: new Date(Date.now() + (response.data.expires_in * 1000)),
          token_type: response.data.token_type || 'Bearer',
          scope: response.data.scope
        };

        await this.saveToken(tokenData);
        this.logger.log('✅ OAuth token exchanged and saved successfully');
        return response.data;
      } else {
        throw new Error('No access token in response');
      }
    } catch (error) {
      this.logger.error('❌ Error exchanging authorization code:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  private async refreshAccessToken(refreshToken: string): Promise<boolean> {
    try {
      this.logger.log('🔄 [DEBUG] Starting token refresh...');
      this.logger.log(`🔄 [DEBUG] Using refresh token: ${refreshToken.substring(0, 20)}...`);
      this.logger.log(`🔄 [DEBUG] App ID (ZALO_APP_ID): ${this.appId}`);
      this.logger.log(`🔄 [DEBUG] Has app secret: ${!!this.appSecret}`);

      const params = new URLSearchParams({
        refresh_token: refreshToken,
        app_id: this.appId,
        grant_type: 'refresh_token'
      });

      this.logger.log('🔄 [DEBUG] Request URL: https://oauth.zaloapp.com/v4/oa/access_token');
      this.logger.log('🔄 [DEBUG] Request params:', params.toString());

      const response = await axios.post(
        'https://oauth.zaloapp.com/v4/oa/access_token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'secret_key': this.appSecret
          },
        }
      );

      this.logger.log('🔄 [DEBUG] Refresh response status:', response.status);
      this.logger.log('🔄 [DEBUG] Refresh response data:', JSON.stringify(response.data, null, 2));

      if (response.data.error) {
        this.logger.error('❌ Refresh token API error:', response.data);
        return false;
      }

      // Lưu token mới
      const saved = await this.saveToken({
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        scope: response.data.scope
      });

      if (saved) {
        this.logger.log('✅ Access token refreshed successfully');
      }
      return saved;

    } catch (error) {
      this.logger.error('❌ Error refreshing token:', error.response?.data || error.message);
      this.logger.error('❌ Full error:', error);
      return false;
    }
  }

  /**
   * Kiểm tra token hiện tại
   */
  async getCurrentToken(): Promise<any> {
    try {
      const [currentToken] = await this.connection.query(
        'SELECT id, oa_id, expires_at, token_type, scope, is_active, created_at FROM zalo_oa_tokens WHERE oa_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
        [this.oaId]
      );

      return currentToken || null;
    } catch (error) {
      this.logger.error('❌ Error getting current token:', error);
      return null;
    }
  }

  /**
   * Kiểm tra xem có cần lấy token mới không
   */
  async needsNewToken(): Promise<boolean> {
    try {
      const [currentToken] = await this.connection.query(
        'SELECT * FROM zalo_oa_tokens WHERE oa_id = ? AND is_active = 1 ORDER BY created_at DESC LIMIT 1',
        [this.oaId]
      );

      if (!currentToken) {
        return true; // Chưa có token
      }

      // Kiểm tra token sắp hết hạn (còn < 10 phút)
      const tenMinutes = 10 * 60 * 1000;
      const now = new Date();
      const expiresAt = new Date(currentToken.expires_at);

      return (expiresAt.getTime() - now.getTime()) < tenMinutes;
    } catch (error) {
      this.logger.error('❌ Error checking token status:', error);
      return true; // Có lỗi thì coi như cần token mới
    }
  }

  /**
   * Lấy danh sách token (để debug)
   */
  async getTokenHistory(limit = 10): Promise<any[]> {
    try {
      const tokens = await this.connection.query(
        'SELECT id, oa_id, expires_at, token_type, is_active, created_at FROM zalo_oa_tokens WHERE oa_id = ? ORDER BY created_at DESC LIMIT ?',
        [this.oaId, limit]
      );

      return tokens;
    } catch (error) {
      this.logger.error('❌ Error getting token history:', error);
      return [];
    }
  }
}
