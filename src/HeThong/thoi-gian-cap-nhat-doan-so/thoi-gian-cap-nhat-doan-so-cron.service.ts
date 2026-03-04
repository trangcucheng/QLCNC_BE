import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ThoiGianCapNhatDoanSo } from '../../databases/entities/ThoiGianCapNhatDoanSo.entity';
import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ZaloPushNotificationService } from '../auth/zalo-push.service';

@Injectable()
export class ThoiGianCapNhatDoanSoCronService {
  private readonly logger = new Logger(ThoiGianCapNhatDoanSoCronService.name);

  constructor(
    @InjectRepository(ThoiGianCapNhatDoanSo)
    private readonly thoiGianCapNhatDoanSoRepository: Repository<ThoiGianCapNhatDoanSo>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(ZaloAccount)
    private readonly zaloAccountRepository: Repository<ZaloAccount>,

    private readonly zaloPushService: ZaloPushNotificationService,
  ) { }

  /**
   * Cron job: Chạy mỗi ngày lúc 7h sáng
   * Kiểm tra và gửi thông báo nhắc nhở trước 1 ngày bắt đầu kỳ báo cáo
   */
  @Cron('0 7 * * *', {
    name: 'send-report-period-reminder',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleReportPeriodReminder() {
    this.logger.log('🔔 [CRON] Bắt đầu kiểm tra kỳ báo cáo cần nhắc nhở...');

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const ngayMai = tomorrow.getDate();
      const thangMai = tomorrow.getMonth() + 1; // 1-12
      const namMai = tomorrow.getFullYear();

      this.logger.log(`📅 Ngày mai: ${ngayMai}/${thangMai}/${namMai}`);

      // Lấy tất cả kỳ báo cáo đang active
      const cacKyBaoCao = await this.thoiGianCapNhatDoanSoRepository.find({
        where: { isActive: true },
      });

      this.logger.log(`📊 Tìm thấy ${cacKyBaoCao.length} kỳ báo cáo đang active`);

      for (const ky of cacKyBaoCao) {
        const canGuiThongBao = await this.kiemTraCanGuiThongBao(
          ky,
          ngayMai,
          thangMai,
          namMai,
        );

        if (canGuiThongBao) {
          await this.guiThongBaoNhacNho(ky, ngayMai, thangMai, namMai);
        }
      }

      this.logger.log('✅ [CRON] Hoàn thành kiểm tra và gửi thông báo');
    } catch (error) {
      this.logger.error('❌ [CRON] Lỗi khi xử lý cron job:', error);
    }
  }

  /**
   * Kiểm tra xem ngày mai có phải là ngày bắt đầu kỳ báo cáo không
   */
  private async kiemTraCanGuiThongBao(
    ky: ThoiGianCapNhatDoanSo,
    ngayMai: number,
    thangMai: number,
    namMai: number,
  ): Promise<boolean> {
    const { loaiKy } = ky;

    // Kiểm tra năm có trong khoảng áp dụng không
    if (ky.namBatDau && namMai < ky.namBatDau) return false;
    if (ky.namKetThuc && namMai > ky.namKetThuc) return false;

    switch (loaiKy) {
      case 'hang_thang':
        // Gửi thông báo nếu ngày mai là ngày bắt đầu báo cáo hàng tháng
        return ngayMai === ky.ngayBatDauTrongThang;

      case 'hang_quy':
        // Gửi thông báo nếu ngày mai là ngày bắt đầu báo cáo quý
        if (
          ky.cacThangApDung &&
          Array.isArray(ky.cacThangApDung) &&
          ky.cacThangApDung.includes(thangMai)
        ) {
          return ngayMai === ky.ngayBatDauTrongThang;
        }
        return false;

      case 'hang_nam':
        // Gửi thông báo nếu ngày mai là ngày bắt đầu báo cáo năm
        return (
          thangMai === ky.thangBatDau &&
          ngayMai === ky.ngayBatDauTrongThang
        );

      case 'dot_xuat':
        // Gửi thông báo nếu ngày mai là ngày bắt đầu báo cáo đột xuất
        if (ky.thoiGianBatDau) {
          const ngayBatDau = new Date(ky.thoiGianBatDau);
          ngayBatDau.setHours(0, 0, 0, 0);

          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);

          return ngayBatDau.getTime() === tomorrow.getTime();
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Gửi thông báo nhắc nhở cho tất cả users
   */
  private async guiThongBaoNhacNho(
    ky: ThoiGianCapNhatDoanSo,
    ngayBatDau: number,
    thangBatDau: number,
    namBatDau: number,
  ) {
    try {
      this.logger.log(
        `📢 [CRON] Gửi thông báo cho kỳ: ${ky.ten} (ID: ${ky.id})`,
      );

      // Tạo nội dung thông báo
      const tieuDe = `🔔 NHẮC NHỞ: Kỳ báo cáo đoàn số bắt đầu ngày mai`;

      let noiDung = `Kỳ báo cáo: "${ky.ten}"\n📋 Mô tả: ${ky.moTa || 'Không có mô tả'}\n\n`;

      if (ky.loaiKy === 'hang_thang') {
        noiDung += `📅 Loại: Báo cáo hàng tháng\n📆 Thời gian: Từ ngày ${ngayBatDau}/${thangBatDau}/${namBatDau} đến ${ky.ngayKetThucTrongThang}/${thangBatDau}/${namBatDau}\n⏰ Bắt đầu: ${ngayBatDau}/${thangBatDau}/${namBatDau}\n🚨 Hạn nộp: ${ky.ngayKetThucTrongThang}/${thangBatDau}/${namBatDau}`;
      } else if (ky.loaiKy === 'hang_quy') {
        const quyIndex = ky.cacThangApDung.indexOf(thangBatDau);
        noiDung += `📅 Loại: Báo cáo hàng quý (Quý ${quyIndex + 1})\n📆 Thời gian: Từ ngày ${ngayBatDau}/${thangBatDau}/${namBatDau} đến ${ky.ngayKetThucTrongThang}/${thangBatDau}/${namBatDau}\n⏰ Bắt đầu: ${ngayBatDau}/${thangBatDau}/${namBatDau}\n🚨 Hạn nộp: ${ky.ngayKetThucTrongThang}/${thangBatDau}/${namBatDau}`;
      } else if (ky.loaiKy === 'hang_nam') {
        noiDung += `📅 Loại: Báo cáo hàng năm\n📆 Thời gian: Từ ngày ${ngayBatDau}/${thangBatDau}/${namBatDau} đến ${ky.ngayKetThucTrongThang}/${thangBatDau}/${namBatDau}\n⏰ Bắt đầu: ${ngayBatDau}/${thangBatDau}/${namBatDau}\n🚨 Hạn nộp: ${ky.ngayKetThucTrongThang}/${thangBatDau}/${namBatDau}`;
      } else if (ky.loaiKy === 'dot_xuat') {
        const startDate = new Date(ky.thoiGianBatDau);
        const endDate = new Date(ky.thoiGianKetThuc);
        noiDung += `📅 Loại: Báo cáo đột xuất\n📆 Thời gian: ${startDate.toLocaleDateString('vi-VN')} - ${endDate.toLocaleDateString('vi-VN')}\n⏰ Bắt đầu: ${startDate.toLocaleDateString('vi-VN')}\n🚨 Hạn nộp: ${endDate.toLocaleDateString('vi-VN')}`;
      }

      noiDung += '\n\n💡 Vui lòng chuẩn bị và nộp báo cáo đúng thời hạn!';

      // Lấy danh sách users active
      const allUsers = await this.userRepository.find({
        where: { isActive: true },
        select: ['id', 'fullName'],
      });

      this.logger.log(
        `👥 [CRON] Tìm thấy ${allUsers.length} users active`,
      );

      // Lấy Zalo accounts
      const userIds = allUsers.map((u) => u.id);

      const zaloAccounts =
        userIds.length > 0
          ? await this.zaloAccountRepository.find({
            where: {
              userId: In(userIds),
              isActive: true,
            },
            select: [
              'userId',
              'zaloOaUserId',
              'zaloAppUserId',
              'zaloMiniAppId',
            ],
          })
          : [];

      this.logger.log(
        `📱 [CRON] Tìm thấy ${zaloAccounts.length} Zalo accounts`,
      );

      // Collect unique Zalo user IDs
      const zaloUserIdsSet = new Set<string>();
      zaloAccounts.forEach((account) => {
        if (account.zaloOaUserId) {
          zaloUserIdsSet.add(account.zaloOaUserId);
        } else if (account.zaloAppUserId) {
          zaloUserIdsSet.add(account.zaloAppUserId);
        } else if (account.zaloMiniAppId) {
          zaloUserIdsSet.add(account.zaloMiniAppId);
        }
      });
      const zaloUserIds = Array.from(zaloUserIdsSet);

      this.logger.log(
        `📊 [CRON] Sẽ gửi cho ${zaloUserIds.length} Zalo users`,
      );

      if (zaloUserIds.length === 0) {
        this.logger.warn(
          `⚠️ [CRON] Không có Zalo accounts để gửi thông báo cho kỳ: ${ky.ten}`,
        );
        return;
      }

      // Gửi bulk notification
      const fullMessage = `${tieuDe}\n\n${noiDung}`;
      const result = await this.zaloPushService.sendBulkPushNotifications(
        zaloUserIds,
        {
          title: tieuDe,
          message: fullMessage,
          data: {
            messageType: 'bao_cao_nhac_nho',
            relatedId: ky.id,
            type: 'reminder',
            loaiKy: ky.loaiKy,
            ngayBatDau: `${ngayBatDau}/${thangBatDau}/${namBatDau}`,
          },
        },
      );

      this.logger.log(
        `✅ [CRON] Kết quả gửi: ${result.successful.length}/${result.totalSent} thành công cho kỳ "${ky.ten}"`,
      );
    } catch (error) {
      this.logger.error(
        `❌ [CRON] Lỗi khi gửi thông báo cho kỳ ${ky.ten}:`,
        error,
      );
    }
  }

  /**
   * Test API - Có thể gọi thủ công để test
   */
  async testSendReminder() {
    this.logger.log('🧪 [TEST] Testing cron job manually...');
    await this.handleReportPeriodReminder();
    return {
      success: true,
      message: 'Test cron job completed. Check logs for details.',
    };
  }
}
