import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';

import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ThongBaoService } from '../thong-bao/thong-bao.service';
import { ZaloOASimpleTokenService } from './zalo-oa-simple-token.service';

// Interface cho Zalo OA API response
export interface ZaloOAMessageResponse {
  error: number;
  message: string;
  data?: any;
}

@Injectable()
export class ZaloPushNotificationService {
  private readonly logger = new Logger(ZaloPushNotificationService.name);
  private readonly zaloOAApiUrl = 'https://openapi.zalo.me/v2.0/oa/message';

  constructor(
    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,
    private readonly configService: ConfigService,
    private readonly thongBaoService: ThongBaoService,
    private readonly zaloOATokenService: ZaloOASimpleTokenService,
  ) {
    console.log('Zalo OA Push Service initialized:', {
      apiUrl: this.zaloOAApiUrl
    });
  }

  /**
   * Gửi tin nhắn qua Zalo OA API trực tiếp
   */
  async sendOAMessage(
    zaloUserId: string,
    message: string
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.logger.log(`🚀 [DEBUG] Bắt đầu gửi OA message tới ${zaloUserId}`);

      // Lấy access token từ ZaloOATokenService
      const accessToken = await this.zaloOATokenService.getAccessToken();
      this.logger.log(`🔑 [DEBUG] Access token: ${accessToken ? 'Available (' + accessToken.substring(0, 20) + '...)' : 'NULL'}`);

      if (!accessToken) {
        this.logger.error(`❌ [DEBUG] Không có access token - Zalo OA token expired or not configured`);
        this.logger.error(`❌ [DEBUG] Please re-authenticate Zalo OA: http://localhost:3000/zalo-oauth/authorize`);
        return {
          success: false,
          error: 'Zalo OA access token not available. Please re-authenticate Zalo OA at: http://localhost:3000/zalo-oauth/authorize'
        };
      }

      const payload = {
        recipient: { user_id: zaloUserId },
        message: { text: message }
      };

      this.logger.log(`📦 [DEBUG] API URL: ${this.zaloOAApiUrl}`);
      this.logger.log(`📦 [DEBUG] Payload: ${JSON.stringify(payload, null, 2)}`);
      this.logger.log(`📦 [DEBUG] Headers: Content-Type=application/json, access_token=${accessToken.substring(0, 20)}...`);

      const response = await axios.post(this.zaloOAApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken
        }
      });

      this.logger.log(`📥 [DEBUG] Response status: ${response.status}`);
      this.logger.log(`📥 [DEBUG] Response data: ${JSON.stringify(response.data, null, 2)}`);

      // Zalo API trả về error: 0 khi thành công
      const isSuccess = response.data.error === 0;

      this.logger.log(`🔍 [DEBUG] Checking for token expiry - error code: ${response.data.error}`);
      this.logger.log(`🔍 [DEBUG] Error === -216? ${response.data.error === -216}`);

      // Kiểm tra lỗi token hết hạn
      if (response.data.error === -216) {
        this.logger.warn('⚠️ Access token expired, attempting to refresh...');

        // Thử refresh token và gửi lại 1 lần
        const newAccessToken = await this.zaloOATokenService.getAccessToken();
        if (newAccessToken && newAccessToken !== accessToken) {
          this.logger.log('🔄 Token refreshed, retrying message send...');

          // Gửi lại với token mới
          const retryResponse = await axios.post(this.zaloOAApiUrl, payload, {
            headers: {
              'Content-Type': 'application/json',
              'access_token': newAccessToken
            }
          });

          this.logger.log(`📥 [DEBUG] Retry response: ${JSON.stringify(retryResponse.data, null, 2)}`);

          const retrySuccess = retryResponse.data.error === 0;
          return {
            success: retrySuccess,
            data: retryResponse.data,
            error: retrySuccess ? undefined : (retryResponse.data.message || `Zalo API error: ${retryResponse.data.error}`)
          };
        } else {
          this.logger.error('❌ Failed to refresh token, cannot retry');
        }
      }

      this.logger.log(`${isSuccess ? '✅' : '❌'} [DEBUG] Final result - Success: ${isSuccess}`);

      return {
        success: isSuccess,
        data: response.data,
        error: isSuccess ? undefined : (response.data.message || `Zalo API error: ${response.data.error}`)
      };

    } catch (error) {
      this.logger.error(`❌ [DEBUG] Exception occurred when sending OA message to ${zaloUserId}`);
      this.logger.error(`❌ [DEBUG] Error status: ${error.response?.status}`);
      this.logger.error(`❌ [DEBUG] Error headers: ${JSON.stringify(error.response?.headers)}`);
      this.logger.error(`❌ [DEBUG] Error data: ${JSON.stringify(error.response?.data)}`);
      this.logger.error(`❌ [DEBUG] Error message: ${error.message}`);
      this.logger.error(`❌ [DEBUG] Full error:`, error);

      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  private getNotificationTypeVietnamese(type: string): string {
    const typeMap = {
      'approved': 'Phê duyệt',
      'rejected': 'Từ chối',
      'reminder': 'Nhắc nhở',
      'system': 'Hệ thống'
    };
    return typeMap[type] || 'Hệ thống';
  }

  /**
   * Gửi thông báo push tới một người dùng Zalo qua OA
   */
  async sendPushNotification(zaloUserId: string, notification: {
    title: string;
    message: string;
    data?: any;
  }): Promise<{ success: boolean; error?: string }> {
    const fullMessage = `${notification.title}\n${notification.message}`;
    return await this.sendOAMessage(zaloUserId, fullMessage);
  }

  /**
   * Gửi thông báo tới nhiều người dùng Zalo qua OA
   */
  async sendBulkPushNotifications(userIds: string[], notification: {
    title: string;
    message: string;
    data?: any;
  }): Promise<{
    totalSent: number;
    successful: string[];
    failed: { userId: string; error: string; }[];
  }> {
    const successful: string[] = [];
    const failed: { userId: string; error: string; }[] = [];
    const fullMessage = `${notification.title}\n${notification.message}`;

    // Xử lý từng user để gửi OA message
    for (const userId of userIds) {
      try {
        const result = await this.sendOAMessage(userId, fullMessage);

        if (result.success) {
          successful.push(userId);
        } else {
          failed.push({ userId, error: result.error || 'Unknown error' });
        }
      } catch (error) {
        failed.push({ userId, error: error.message });
      }
    }

    this.logger.log(`Bulk OA messages sent: ${successful.length} successful, ${failed.length} failed`);

    return {
      totalSent: successful.length,
      successful,
      failed
    };
  }

  /**
   * Gửi thông báo sự kiện qua ZMP
   */
  async sendEventNotification(userIds: string[], suKien: {
    id: number;
    tenSuKien: string;
    thoiGianBatDau: Date;
    diaDiem?: string;
  }, loaiThongBao = 'Thông báo sự kiện'): Promise<{
    totalSent: number;
    successful: string[];
    failed: { userId: string; error: string; }[];
  }> {
    const notification = {
      title: `📅 ${loaiThongBao}`,
      message: `${suKien.tenSuKien}\n🕐 ${suKien.thoiGianBatDau.toLocaleDateString('vi-VN')}\n📍 ${suKien.diaDiem || 'Chưa xác định'}`,
      data: {
        type: 'event_notification',
        eventId: suKien.id,
        action: 'view_detail'
      }
    };

    return await this.sendBulkPushNotifications(userIds, notification);
  }

  /**
   * Gửi thông báo phê duyệt báo cáo qua Zalo OA
   */
  async sendApprovalNotification(zaloUserId: string, approval: {
    reportId: number;
    reportType: string;
    status: 'approved' | 'rejected';
    reason?: string;
  }): Promise<{ success: boolean; error?: string }> {
    let message = '';

    if (approval.status === 'approved') {
      message = `📋 Báo cáo ${approval.reportType} của bạn đã được phê duyệt ✅`;
    } else {
      message = `📋 Báo cáo ${approval.reportType} của bạn bị từ chối ❌`;
      if (approval.reason) {
        message += `\nLý do: ${approval.reason}`;
      }
    }

    return await this.sendOAMessage(zaloUserId, message);
  }

  /**
   * Gửi tin nhắn với file đính kèm qua Zalo OA API
   */
  async sendOAMessageWithAttachment(
    zaloUserId: string,
    message: string,
    attachments?: Array<{
      type: 'image' | 'file';
      payload: {
        url?: string;
        attachment_id?: string;
        description?: string;
      };
    }>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      this.logger.log(`🚀 [DEBUG] Bắt đầu gửi OA message với attachments tới ${zaloUserId}`);

      const accessToken = await this.zaloOATokenService.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Zalo OA access token not available'
        };
      }

      let payload: any = {
        recipient: { user_id: zaloUserId },
        message: { text: message }
      };

      // Nếu có file đính kèm, thêm vào payload
      if (attachments && attachments.length > 0) {
        payload.message.attachment = attachments[0]; // Zalo OA chỉ hỗ trợ 1 attachment per message
      }

      this.logger.log(`📦 [DEBUG] Payload with attachment: ${JSON.stringify(payload, null, 2)}`);

      const response = await axios.post(this.zaloOAApiUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'access_token': accessToken
        }
      });

      this.logger.log(`📥 [DEBUG] Response: ${JSON.stringify(response.data, null, 2)}`);

      const isSuccess = response.data.error === 0;
      return {
        success: isSuccess,
        data: response.data,
        error: isSuccess ? undefined : response.data.message
      };

    } catch (error) {
      this.logger.error(`❌ Error sending OA message with attachment: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload file lên Zalo OA để lấy attachment_id
   */
  async uploadFileToZalo(
    filePath: string,
    fileType: 'image' | 'file'
  ): Promise<{ success: boolean; attachment_id?: string; error?: string }> {
    try {
      const accessToken = await this.zaloOATokenService.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          error: 'Zalo OA access token not available'
        };
      }

      const uploadUrl = 'https://openapi.zalo.me/v2.0/oa/upload/' + fileType;

      // Tạo FormData để upload file
      const FormData = require('form-data');
      const fs = require('fs');
      const formData = new FormData();

      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          ...formData.getHeaders(),
          'access_token': accessToken
        }
      });

      if (response.data.error === 0) {
        return {
          success: true,
          attachment_id: response.data.data.attachment_id
        };
      } else {
        return {
          success: false,
          error: response.data.message
        };
      }

    } catch (error) {
      this.logger.error(`❌ Error uploading file to Zalo: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gửi thông báo sự kiện với file đính kèm
   */
  async sendEventNotificationWithFiles(
    userIds: string[],
    suKien: {
      id: number;
      tenSuKien: string;
      thoiGianBatDau: Date;
      diaDiem?: string;
    },
    loaiThongBao = 'Thông báo sự kiện',
    filePaths?: string[]
  ): Promise<{
    totalSent: number;
    successful: string[];
    failed: { userId: string; error: string; }[];
  }> {
    const successful: string[] = [];
    const failed: { userId: string; error: string; }[] = [];

    let attachments: Array<{ type: 'image' | 'file'; payload: { attachment_id: string; } }> = [];

    // Upload files nếu có
    if (filePaths && filePaths.length > 0) {
      for (const filePath of filePaths) {
        const fileExt = filePath.toLowerCase().split('.').pop();
        const fileType = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExt) ? 'image' : 'file';

        const uploadResult = await this.uploadFileToZalo(filePath, fileType);
        if (uploadResult.success && uploadResult.attachment_id) {
          attachments.push({
            type: fileType,
            payload: { attachment_id: uploadResult.attachment_id }
          });
        } else {
          this.logger.warn(`Failed to upload file ${filePath}: ${uploadResult.error}`);
        }
      }
    }

    // Tạo nội dung thông báo
    let message = `📅 ${loaiThongBao}\n${suKien.tenSuKien}\n🕐 ${suKien.thoiGianBatDau.toLocaleDateString('vi-VN')}`;
    if (suKien.diaDiem) {
      message += `\n📍 ${suKien.diaDiem}`;
    }

    // Gửi thông báo cho từng user
    for (const userId of userIds) {
      try {
        let result;
        if (attachments.length > 0) {
          result = await this.sendOAMessageWithAttachment(userId, message, attachments);
        } else {
          result = await this.sendOAMessage(userId, message);
        }

        if (result.success) {
          successful.push(userId);
        } else {
          failed.push({ userId, error: result.error || 'Unknown error' });
        }
      } catch (error) {
        failed.push({ userId, error: error.message });
      }
    }

    return {
      totalSent: successful.length,
      successful,
      failed
    };
  }

  /**
   * Test gửi thông báo Zalo OA
   */
  async testNotification(zaloUserId: string): Promise<any> {
    const testMessage = '🔔 Test Zalo OA Notification\nĐây là thông báo test từ hệ thống Công đoàn cơ sở qua Zalo OA';
    return await this.sendOAMessage(zaloUserId, testMessage);
  }

  /**
   * Lấy thông tin Zalo user từ database (Updated to use ZaloAccount)
   */
  async getZaloUserInfo(zaloUserId: string): Promise<{
    success: boolean;
    user?: any;
    error?: string;
  }> {
    try {
      // Tìm ZaloAccount theo các loại Zalo ID
      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: [
          { zaloOaUserId: zaloUserId },
          { zaloAppUserId: zaloUserId },
          { zaloMiniAppId: zaloUserId }
        ],
        relations: ['user']
      });

      if (!zaloAccount || !zaloAccount.user) {
        return { success: false, error: 'Zalo account not found or not linked to web user' };
      }

      return {
        success: true,
        user: {
          id: zaloAccount.user.id,
          fullName: zaloAccount.user.fullName,
          zaloOaUserId: zaloAccount.zaloOaUserId,
          zaloAppUserId: zaloAccount.zaloAppUserId,
          zaloMiniAppId: zaloAccount.zaloMiniAppId,
          displayName: zaloAccount.displayName,
          isFollowingOa: zaloAccount.isFollowingOa
        }
      };

    } catch (error) {
      this.logger.error(`Error getting Zalo account info: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
