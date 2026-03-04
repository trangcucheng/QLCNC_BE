import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ThoiGianCapNhatDoanSo } from '../../databases/entities/ThoiGianCapNhatDoanSo.entity';
import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ZaloPushNotificationService } from '../auth/zalo-push.service';
import {
  CauHinhBaoCaoThuongKyDto,
  GuiThongBaoBaoCaoDoanSoDto,
  NotificationTarget,
  TaoBaoCaoDoanSoDotXuatDto
} from './dto/bao-cao-doan-so-notification.dto';

@Injectable()
export class BaoCaoDoanSoNotificationService {
  private readonly logger = new Logger(BaoCaoDoanSoNotificationService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,

    @InjectRepository(ThoiGianCapNhatDoanSo)
    private readonly thoiGianRepository: Repository<ThoiGianCapNhatDoanSo>,

    private readonly zaloPushService: ZaloPushNotificationService
  ) { }

  /**
   * Tạo lịch thông báo tự động
   */
  async taoLichThongBao(dto: CauHinhBaoCaoThuongKyDto): Promise<ThoiGianCapNhatDoanSo> {
    try {
      this.logger.log(`🔔 Tạo lịch thông báo: ${dto.customMessage || 'Báo cáo thường kỳ'}`);

      const notificationSchedules = {
        enabled: dto.enabled || false,
        cron_expression: dto.cronExpression || '0 8 * * *', // 8h mỗi ngày
        reminder_before_days: 3,
        title_template: 'Thông báo báo cáo đoàn số',
        content_template: dto.customMessage || 'Vui lòng nộp báo cáo đoàn số',
        target_type: dto.notificationTarget || NotificationTarget.TAT_CA,
        organization_id: dto.organizationId,
        user_ids: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const entity = this.thoiGianRepository.create({
        ten: `Báo cáo đoàn số ${new Date().toISOString()}`,
        thoiGianBatDau: new Date(),
        thoiGianKetThuc: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        moTa: dto.customMessage || 'Báo cáo đoàn số thường kỳ',
        auto_notification_enabled: dto.enabled || false,
        notification_schedules: JSON.stringify(notificationSchedules),
        next_notification_time: dto.enabled ? this.calculateNextNotificationTime(dto.cronExpression) : null,
        last_notification_time: null
      });

      const saved = await this.thoiGianRepository.save(entity);
      this.logger.log(`✅ Đã tạo lịch thông báo ID: ${saved.id}`);

      return saved;

    } catch (error) {
      this.logger.error('❌ Lỗi tạo lịch thông báo:', error);
      throw new BadRequestException(`Lỗi tạo lịch thông báo: ${error.message}`);
    }
  }

  /**
   * Cập nhật lịch thông báo
   */
  async capNhatLichThongBao(id: string, dto: CauHinhBaoCaoThuongKyDto): Promise<ThoiGianCapNhatDoanSo> {
    try {
      const existing = await this.thoiGianRepository.findOne({ where: { id } });
      if (!existing) {
        throw new BadRequestException('Không tìm thấy lịch thông báo');
      }

      // Parse existing notification schedules
      let currentSchedules = {};
      try {
        currentSchedules = JSON.parse(existing.notification_schedules || '{}');
      } catch (e) {
        this.logger.warn('Could not parse existing notification schedules');
      }

      // Update notification schedules
      const updatedSchedules = {
        ...currentSchedules,
        enabled: dto.enabled !== undefined ? dto.enabled : currentSchedules['enabled'],
        cron_expression: dto.cronExpression || currentSchedules['cron_expression'],
        reminder_before_days: currentSchedules['reminder_before_days'] || 3,
        title_template: 'Thông báo báo cáo đoàn số',
        content_template: dto.customMessage || currentSchedules['content_template'],
        target_type: dto.notificationTarget || currentSchedules['target_type'],
        organization_id: dto.organizationId !== undefined ? dto.organizationId : currentSchedules['organization_id'],
        user_ids: currentSchedules['user_ids'] || [],
        updated_at: new Date().toISOString()
      };

      // Update entity
      existing.auto_notification_enabled = dto.enabled !== undefined ? dto.enabled : existing.auto_notification_enabled;
      existing.notification_schedules = JSON.stringify(updatedSchedules);
      existing.next_notification_time = dto.enabled ? this.calculateNextNotificationTime(dto.cronExpression) : null;

      if (dto.customMessage !== undefined) existing.moTa = dto.customMessage;

      const updated = await this.thoiGianRepository.save(existing);
      this.logger.log(`✅ Đã cập nhật lịch thông báo ID: ${id}`);

      return updated;

    } catch (error) {
      this.logger.error('❌ Lỗi cập nhật lịch thông báo:', error);
      throw new BadRequestException(`Lỗi cập nhật lịch thông báo: ${error.message}`);
    }
  }

  /**
   * Gửi thông báo báo cáo đoàn số
   */
  async guiThongBaoBaoCaoDoanSo(dto: GuiThongBaoBaoCaoDoanSoDto): Promise<{
    success: boolean;
    message: string;
    totalSent: number;
    successful: string[];
    failed: { userId: string; error: string; }[];
  }> {
    try {
      this.logger.log(`📤 Gửi thông báo báo cáo đoàn số - Target: ${dto.target}`);

      let targetUserUUIDs: string[] = [];
      let zaloAccounts = [];

      // Xác định danh sách users cần gửi
      if (dto.userIds && dto.userIds.length > 0) {
        // Option 1: Danh sách users cụ thể - convert to strings
        targetUserUUIDs = dto.userIds.map(id => id.toString());
        this.logger.log(`📋 Gửi cho ${dto.userIds.length} users được chỉ định`);

      } else if (dto.target === NotificationTarget.THEO_TO_CHUC && dto.organizationId) {
        // Option 2: Theo tổ chức
        const usersInOrg = await this.userRepository.find({
          where: {
            organizationId: dto.organizationId,
            isActive: true
          }
        });

        targetUserUUIDs = usersInOrg.map(u => u.id.toString()).filter(id => id && id.trim() !== '');
        this.logger.log(`🏢 Tìm thấy ${targetUserUUIDs.length} users hợp lệ trong tổ chức ID: ${dto.organizationId}`);

      } else if (dto.target === NotificationTarget.TAT_CA) {
        // Option 3: Tất cả users
        const allUsers = await this.userRepository.find({
          where: { isActive: true }
        });

        targetUserUUIDs = allUsers.map(u => u.id.toString()).filter(id => id && id.trim() !== '');
        this.logger.log(`👥 Tìm thấy ${targetUserUUIDs.length} users active trong hệ thống`);
      }

      // Tìm zalo accounts cho tất cả các trường hợp
      if (targetUserUUIDs.length > 0) {
        this.logger.debug(`🎯 Target user UUIDs (first 3):`, targetUserUUIDs.slice(0, 3));

        try {
          // Tìm zalo accounts có userId khớp
          const allZaloAccounts = await this.zaloAccountRepository.find();
          this.logger.debug(`🔍 Total zalo accounts in DB: ${allZaloAccounts.length}`);

          // Filter zalo accounts where userId matches target UUIDs
          zaloAccounts = allZaloAccounts
            .filter(za => {
              const zaUserIdStr = za.userId.toString();
              const isMatch = targetUserUUIDs.includes(zaUserIdStr);
              if (isMatch) {
                this.logger.debug(`✅ Match found: zalo account ${za.id} with userId ${za.userId}`);
              }
              return isMatch;
            })
            .map(za => ({
              id: za.id,
              user_id: za.userId,
              zalo_oa_user_id: za.zaloOaUserId,
              zalo_app_user_id: za.zaloAppUserId,
              display_name: za.displayName,
              avatar: za.avatar,
              user_full_name: `User ${za.userId}`
            }));

        } catch (error) {
          this.logger.error(`❌ Lỗi lấy dữ liệu Zalo accounts:`, error);
          zaloAccounts = [];
        }
      } else {
        this.logger.log(`⚠️ Không có target users`);
        zaloAccounts = [];
      }

      if (zaloAccounts.length === 0) {
        return {
          success: false,
          message: 'Không tìm thấy users để gửi thông báo',
          totalSent: 0,
          successful: [],
          failed: []
        };
      }

      this.logger.log(`📱 Tìm thấy ${zaloAccounts.length} Zalo accounts để gửi thông báo`);

      const successful: string[] = [];
      const failed: { userId: string; error: string; }[] = [];

      // Gửi thông báo từng user
      for (const zaloAccount of zaloAccounts) {
        try {
          const fullMessage = `${dto.tieuDe}\n\n${dto.noiDung}`;

          const result = await this.zaloPushService.sendOAMessage(
            zaloAccount.zalo_oa_user_id || zaloAccount.zalo_app_user_id,
            fullMessage
          );

          if (result.success) {
            successful.push(zaloAccount.user_id.toString());
            this.logger.log(`✅ Gửi thành công cho user ${zaloAccount.user_id} (${zaloAccount.user_full_name})`);
          } else {
            failed.push({
              userId: zaloAccount.user_id.toString(),
              error: result.error || 'Unknown error'
            });
            this.logger.warn(`❌ Gửi thất bại cho user ${zaloAccount.user_id}: ${result.error}`);
          }

        } catch (error) {
          failed.push({
            userId: zaloAccount.user_id.toString(),
            error: error.message
          });
          this.logger.error(`❌ Exception gửi cho user ${zaloAccount.user_id}:`, error);
        }
      }

      const totalSent = successful.length;
      this.logger.log(`📊 Kết quả gửi thông báo: ${totalSent} thành công, ${failed.length} thất bại`);

      return {
        success: totalSent > 0,
        message: `Đã gửi thông báo: ${totalSent} thành công, ${failed.length} thất bại`,
        totalSent,
        successful,
        failed
      };

    } catch (error) {
      this.logger.error('❌ Lỗi gửi thông báo báo cáo đoàn số:', error);
      throw new BadRequestException(`Lỗi gửi thông báo: ${error.message}`);
    }
  }

  /**
   * Lấy danh sách báo cáo đoàn số
   */
  async layDanhSachBaoCaoDoanSo(filters?: {
    loai?: string;
    organizationId?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<ThoiGianCapNhatDoanSo[]> {
    try {
      const queryBuilder = this.thoiGianRepository.createQueryBuilder('tg');

      // Lọc theo loại (có thể dựa vào notification_schedules.type)
      if (filters?.loai) {
        queryBuilder.andWhere(
          "JSON_EXTRACT(tg.notification_schedules, '$.type') = :loai",
          { loai: filters.loai }
        );
      }

      // Lọc theo tổ chức
      if (filters?.organizationId) {
        queryBuilder.andWhere(
          "JSON_EXTRACT(tg.notification_schedules, '$.organization_id') = :orgId",
          { orgId: filters.organizationId }
        );
      }

      // Lọc theo thời gian
      if (filters?.fromDate) {
        queryBuilder.andWhere('tg.thoiGianBatDau >= :fromDate', {
          fromDate: new Date(filters.fromDate)
        });
      }

      if (filters?.toDate) {
        queryBuilder.andWhere('tg.thoiGianKetThuc <= :toDate', {
          toDate: new Date(filters.toDate)
        });
      }

      queryBuilder.orderBy('tg.createdAt', 'DESC');

      const results = await queryBuilder.getMany();
      this.logger.log(`📋 Tìm thấy ${results.length} báo cáo đoàn số`);

      return results;

    } catch (error) {
      this.logger.error('❌ Lỗi lấy danh sách báo cáo đoàn số:', error);
      throw new BadRequestException(`Lỗi lấy danh sách: ${error.message}`);
    }
  }

  /**
   * Test gửi thông báo cho 1 user cụ thể
   */
  async testGuiThongBao(userId: number, message: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const zaloAccount = await this.zaloAccountRepository.findOne({
        where: { userId }
      });

      if (!zaloAccount) {
        return {
          success: false,
          message: `User ${userId} chưa liên kết tài khoản Zalo`
        };
      }

      const result = await this.zaloPushService.sendOAMessage(
        zaloAccount.zaloOaUserId || zaloAccount.zaloAppUserId,
        `🧪 Test thông báo\n\n${message}`
      );

      return {
        success: result.success,
        message: result.success ?
          'Gửi test thông báo thành công' :
          `Gửi thất bại: ${result.error}`
      };

    } catch (error) {
      this.logger.error('❌ Lỗi test thông báo:', error);
      return {
        success: false,
        message: `Lỗi: ${error.message}`
      };
    }
  }

  /**
   * Tính thời gian thông báo tiếp theo dựa trên cron expression
   */
  private calculateNextNotificationTime(cronExpression?: string): Date | null {
    if (!cronExpression) return null;

    // Simplified: thêm 1 ngày từ hiện tại
    // Trong thực tế, bạn có thể dùng thư viện như 'cron-parser' 
    const nextTime = new Date();
    nextTime.setDate(nextTime.getDate() + 1);
    return nextTime;
  }
}
