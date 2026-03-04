import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';

import { ZaloOAToken } from '../../databases/entities/ZaloOAToken.entity';

@Injectable()
export class ZaloOATokenService {
  private readonly logger = new Logger(ZaloOATokenService.name);
  private readonly oaId: string;
  private readonly oaSecret: string;
  private readonly oaApiUrl = 'https://oauth.zaloapp.com/v4/oa/access_token';

  constructor(
    @InjectRepository(ZaloOAToken)
    private readonly zaloOATokenRepository: Repository<ZaloOAToken>,
    private readonly configService: ConfigService,
  ) {
    this.oaId = configService.get<string>('ZALO_OA_ID');
    this.oaSecret = configService.get<string>('ZALO_OA_SECRET');

    console.log('Zalo OA Token Service initialized:', {
      oaId: this.oaId ? this.oaId.substring(0, 8) + '...' : 'NOT_SET',
      hasSecret: !!this.oaSecret
    });
  }

  /**
   * Lưu token mới vào database
   */
  async saveToken(tokenData: {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }): Promise<ZaloOAToken> {
    try {
      // Tính thời gian hết hạn
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);

      // Vô hiệu hóa các token cũ
      await this.zaloOATokenRepository.update(
        { oaId: this.oaId, isActive: 1 },
        { isActive: 0 }
      );

      // Tạo token mới
      const newToken = this.zaloOATokenRepository.create({
        oaId: this.oaId,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
        expiresAt,
        scope: tokenData.scope,
        isActive: 1,
      });

      const savedToken = await this.zaloOATokenRepository.save(newToken);

      this.logger.log('✅ Token saved to database:', {
        id: savedToken.id,
        expiresAt: expiresAt.toISOString(),
        expiresIn: tokenData.expires_in
      });

      return savedToken;
    } catch (error) {
      this.logger.error('❌ Error saving token to database:', error);
      throw error;
    }
  }

  /**
   * Lấy access token hiện tại từ database (tự động refresh nếu cần)
   */
  async getAccessToken(): Promise<string | null> {
    try {
      // Lấy token active mới nhất
      const currentToken = await this.zaloOATokenRepository.findOne({
        where: { oaId: this.oaId, isActive: 1 },
        order: { createdAt: 'DESC' }
      });

      if (!currentToken) {
        this.logger.warn('⚠️ No active token found in database');
        return null;
      }

      // Kiểm tra token sắp hết hạn (còn < 5 phút)
      const fiveMinutes = 5 * 60 * 1000;
      const now = new Date();
      const willExpireSoon = (currentToken.expiresAt.getTime() - now.getTime()) < fiveMinutes;

      if (willExpireSoon) {
        this.logger.log('🔄 Token sắp hết hạn, đang refresh...');
        const refreshedToken = await this.refreshAccessToken(currentToken);

        if (refreshedToken) {
          return refreshedToken.accessToken;
        } else {
          this.logger.error('❌ Refresh token thất bại');
          return null;
        }
      }

      return currentToken.accessToken;
    } catch (error) {
      this.logger.error('❌ Error getting access token:', error);
      return null;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(currentToken: ZaloOAToken): Promise<ZaloOAToken | null> {
    try {
      if (!currentToken.refreshToken) {
        this.logger.error('❌ No refresh token available');
        return null;
      }

      const params = new URLSearchParams({
        app_id: this.oaId,
        app_secret: this.oaSecret,
        grant_type: 'refresh_token',
        refresh_token: currentToken.refreshToken,
      });

      const response = await axios.post(this.oaApiUrl, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (response.data.error) {
        this.logger.error('❌ Refresh token API error:', response.data);
        return null;
      }

      // Lưu token mới
      const newToken = await this.saveToken(response.data);
      this.logger.log('✅ Access token refreshed successfully');
      return newToken;

    } catch (error) {
      this.logger.error('❌ Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Lấy tất cả token (để debug)
   */
  async getAllTokens(): Promise<ZaloOAToken[]> {
    return await this.zaloOATokenRepository.find({
      order: { createdAt: 'DESC' },
      take: 10
    });
  }

  /**
   * Xóa các token hết hạn
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    const result = await this.zaloOATokenRepository.delete({
      expiresAt: { $lt: now } as any,
      isActive: 0
    });

    this.logger.log(`🧹 Cleaned up ${result.affected || 0} expired tokens`);
  }
}
