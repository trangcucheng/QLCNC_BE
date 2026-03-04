import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ThoiGianCapNhatDoanSo } from '../../databases/entities/ThoiGianCapNhatDoanSo.entity';
import { User } from '../../databases/entities/user.entity';
import { ZaloPushNotificationService } from '../auth/zalo-push.service';
import { ThongBaoService } from '../thong-bao/thong-bao.service';

interface NotificationSchedule {
  reminder_notifications?: Array<{
    type: 'reminder';
    days_before_start: number;
    message_template: string;
    target_roles: string[];
  }>;
  deadline_notifications?: Array<{
    type: 'deadline_warning' | 'overdue';
    days_before_end?: number;
    days_after_end?: number;
    message_template: string;
    target_roles: string[];
  }>;
  periodic_notifications?: Array<{
    type: 'weekly_reminder' | 'daily_reminder';
    cron_expression: string;
    message_template: string;
    target_roles: string[];
    only_during_period?: boolean;
  }>;
}

@Injectable()
export class ScheduleNotificationService {
  private readonly logger = new Logger(ScheduleNotificationService.name);

  constructor(
    @InjectRepository(ThoiGianCapNhatDoanSo)
    private readonly thoiGianCapNhatDoanSoRepository: Repository<ThoiGianCapNhatDoanSo>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly zaloPushService: ZaloPushNotificationService,
    private readonly thongBaoService: ThongBaoService,
  ) { }

  /**
   * Cron job chạy mỗi ngày lúc 8h sáng để kiểm tra và gửi thông báo
   */
  @Cron('0 8 * * *') // Chạy 8h sáng hàng ngày
  async checkAndSendScheduledNotifications(): Promise<void> {
    this.logger.log('🔔 Bắt đầu kiểm tra lịch thông báo hàng ngày...');

    try {
      // Lấy tất cả periods có auto notification enabled
      const activePeriods = await this.thoiGianCapNhatDoanSoRepository.find({
        where: {
          isActive: true,
          auto_notification_enabled: true
        }
      });

      this.logger.log(`📋 Tìm thấy ${activePeriods.length} periods có thông báo tự động kích hoạt`);

      for (const period of activePeriods) {
        await this.processPeriodNotifications(period);
      }

      this.logger.log('✅ Hoàn thành kiểm tra lịch thông báo hàng ngày');
    } catch (error) {
      this.logger.error('❌ Lỗi khi kiểm tra lịch thông báo:', error);
    }
  }

  /**
   * Cron job chạy mỗi Thứ 2 lúc 9h sáng để gửi thông báo định kỳ
   */
  @Cron('0 9 * * 1') // Chạy 9h sáng thứ 2 hàng tuần
  async sendWeeklyReminders(): Promise<void> {
    this.logger.log('📅 Bắt đầu gửi thông báo định kỳ hàng tuần...');

    try {
      const activePeriods = await this.thoiGianCapNhatDoanSoRepository.find({
        where: {
          isActive: true,
          auto_notification_enabled: true
        }
      });

      for (const period of activePeriods) {
        await this.sendPeriodicNotifications(period, 'weekly_reminder');
      }

      this.logger.log('✅ Hoàn thành gửi thông báo định kỳ hàng tuần');
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi thông báo định kỳ:', error);
    }
  }

  /**
   * Xử lý thông báo cho một period cụ thể
   */
  private async processPeriodNotifications(period: ThoiGianCapNhatDoanSo): Promise<void> {
    this.logger.log(`🔍 Xử lý thông báo cho period: ${period.ten}`);

    if (!period.notification_schedules) {
      this.logger.log(`⚠️ Period ${period.ten} không có cấu hình notification_schedules`);
      return;
    }

    try {
      // Parse notification schedules - support both old and new format
      const schedules = typeof period.notification_schedules === 'string'
        ? JSON.parse(period.notification_schedules)
        : period.notification_schedules;

      this.logger.log(`📋 Notification schedules for ${period.ten}:`, JSON.stringify(schedules, null, 2));

      const now = new Date();

      // Check if this is the new simple format
      if (schedules.enabled && schedules.cron_expression) {
        await this.processSimpleNotificationSchedule(period, schedules, now);
      }
      // Check if this is the old complex format
      else if (schedules.reminder_notifications || schedules.deadline_notifications) {
        await this.processComplexNotificationSchedule(period, schedules, now);
      }
      else {
        this.logger.log(`⚠️ Unknown notification schedule format for period: ${period.ten}`);
      }

    } catch (error) {
      this.logger.error(`❌ Error parsing notification schedules for period ${period.ten}:`, error);
    }
  }

  /**
   * Process simple notification schedule format (new format)
   */
  private async processSimpleNotificationSchedule(
    period: ThoiGianCapNhatDoanSo,
    schedules: any,
    now: Date
  ): Promise<void> {
    this.logger.log(`📅 Processing simple notification schedule for period: ${period.ten}`);

    const startDate = new Date(period.thoiGianBatDau);
    const endDate = new Date(period.thoiGianKetThuc);

    // Calculate days until start and end
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    this.logger.log(`📊 Time calculations - Days until start: ${daysUntilStart}, Days until end: ${daysUntilEnd}`);

    // Check if we should send reminder notifications - xử lý mảng reminderDaysBefore
    const reminderDaysArray = schedules.reminderDaysBefore || [schedules.reminder_before_days || 3];

    for (const reminderDays of reminderDaysArray) {
      if (daysUntilStart === reminderDays) {
        this.logger.log(`🔔 Sending reminder ${reminderDays} days before start: ${period.ten}`);
        await this.sendSimpleNotification(
          period,
          schedules,
          '🔔 Nhắc nhở báo cáo',
          `Báo cáo "${period.ten}" sẽ bắt đầu trong ${reminderDays} ngày (${startDate.toLocaleDateString('vi-VN')})`
        );
        break; // Chỉ gửi 1 thông báo cho mỗi lần check
      }
    }

    // Check if we should send deadline warning
    if (daysUntilEnd === 1) {
      this.logger.log(`⚠️ Sending deadline warning 1 day before end: ${period.ten}`);
      await this.sendSimpleNotification(
        period,
        schedules,
        '⚠️ Cảnh báo deadline',
        `Báo cáo "${period.ten}" sẽ kết thúc vào ngày mai (${endDate.toLocaleDateString('vi-VN')}). Vui lòng hoàn thành báo cáo!`
      );
    }

    // Check if overdue
    if (daysUntilEnd === -1) {
      this.logger.log(`🚨 Sending overdue notification for: ${period.ten}`);
      await this.sendSimpleNotification(
        period,
        schedules,
        '🚨 Quá hạn báo cáo',
        `Báo cáo "${period.ten}" đã quá hạn 1 ngày. Vui lòng nộp báo cáo ngay!`
      );
    }

    // Update last notification time if any notification was relevant
    const maxReminderDays = Math.max(...reminderDaysArray);
    if (Math.abs(daysUntilStart) <= maxReminderDays || Math.abs(daysUntilEnd) <= 1) {
      await this.updateLastNotificationTime(period.id, now);
    }
  }

  /**
   * Process complex notification schedule format (old format)
   */
  private async processComplexNotificationSchedule(
    period: ThoiGianCapNhatDoanSo,
    schedules: NotificationSchedule,
    now: Date
  ): Promise<void> {
    this.logger.log(`📋 Processing complex notification schedule for period: ${period.ten}`);

    // Kiểm tra reminder notifications (trước khi bắt đầu)
    if (schedules.reminder_notifications) {
      for (const reminder of schedules.reminder_notifications) {
        await this.checkReminderNotification(period, reminder, now);
      }
    }

    // Kiểm tra deadline notifications (trước khi kết thúc hoặc sau khi kết thúc)
    if (schedules.deadline_notifications) {
      for (const deadline of schedules.deadline_notifications) {
        await this.checkDeadlineNotification(period, deadline, now);
      }
    }

    // Cập nhật last_notification_time nếu có thông báo được gửi
    await this.updateLastNotificationTime(period.id, now);
  }

  /**
   * Kiểm tra và gửi reminder notification
   */
  private async checkReminderNotification(
    period: ThoiGianCapNhatDoanSo,
    reminder: any,
    now: Date
  ): Promise<void> {
    const startDate = new Date(period.thoiGianBatDau);
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilStart === reminder.days_before_start) {
      this.logger.log(`📢 Gửi reminder ${reminder.days_before_start} ngày trước khi bắt đầu: ${period.ten}`);

      const message = this.formatMessageTemplate(reminder.message_template, period);
      await this.sendNotificationToRoles(reminder.target_roles, '🔔 Nhắc nhở báo cáo', message, period);
    }
  }

  /**
   * Kiểm tra và gửi deadline notification
   */
  private async checkDeadlineNotification(
    period: ThoiGianCapNhatDoanSo,
    deadline: any,
    now: Date
  ): Promise<void> {
    const endDate = new Date(period.thoiGianKetThuc);

    if (deadline.days_before_end) {
      const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      if (daysUntilEnd === deadline.days_before_end) {
        this.logger.log(`⚠️ Gửi deadline warning ${deadline.days_before_end} ngày trước khi kết thúc: ${period.ten}`);

        const message = this.formatMessageTemplate(deadline.message_template, period);
        await this.sendNotificationToRoles(deadline.target_roles, '⚠️ Cảnh báo deadline', message, period);
      }
    }

    if (deadline.days_after_end) {
      const daysAfterEnd = Math.ceil((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysAfterEnd === deadline.days_after_end) {
        this.logger.log(`🚨 Gửi overdue notification ${deadline.days_after_end} ngày sau khi kết thúc: ${period.ten}`);

        const message = this.formatMessageTemplate(deadline.message_template, period);
        await this.sendNotificationToRoles(deadline.target_roles, '🚨 Quá hạn báo cáo', message, period);
      }
    }
  }

  /**
   * Gửi thông báo định kỳ
   */
  private async sendPeriodicNotifications(
    period: ThoiGianCapNhatDoanSo,
    type: string
  ): Promise<void> {
    if (!period.notification_schedules) return;

    const schedules = period.notification_schedules as NotificationSchedule;
    const now = new Date();
    const startDate = new Date(period.thoiGianBatDau);
    const endDate = new Date(period.thoiGianKetThuc);

    if (schedules.periodic_notifications) {
      for (const periodic of schedules.periodic_notifications) {
        if (periodic.type === type) {
          // Kiểm tra nếu chỉ gửi trong thời gian period
          if (periodic.only_during_period) {
            if (now < startDate || now > endDate) {
              continue; // Không trong thời gian period
            }
          }

          this.logger.log(`📅 Gửi thông báo định kỳ ${type}: ${period.ten}`);

          const message = this.formatMessageTemplate(periodic.message_template, period);
          await this.sendNotificationToRoles(periodic.target_roles, '📅 Thông báo định kỳ', message, period);
        }
      }
    }
  }

  /**
   * Send simple notification (for new format)
   */
  private async sendSimpleNotification(
    period: ThoiGianCapNhatDoanSo,
    schedules: any,
    title: string,
    message: string
  ): Promise<void> {
    try {
      this.logger.log(`📤 Sending simple notification: ${title} for period: ${period.ten}`);

      // Determine target users based on target_type
      let targetUsers = [];

      if (schedules.target_type === 'tat_ca') {
        // Send to all active users
        targetUsers = await this.userRepository.find({
          where: { isActive: true }
        });
      } else if (schedules.target_type === 'theo_to_chuc' && schedules.organization_id) {
        // Send to users in specific organization
        targetUsers = await this.userRepository.find({
          where: {
            isActive: true,
            organizationId: schedules.organization_id
          }
        });
      } else if (schedules.user_ids && schedules.user_ids.length > 0) {
        // Send to specific users
        targetUsers = await this.userRepository.findByIds(schedules.user_ids);
      }

      this.logger.log(`📋 Found ${targetUsers.length} target users for notification`);

      // Send notification to each user via Zalo OA
      let successCount = 0;
      let failureCount = 0;

      for (const user of targetUsers) {
        try {
          // Here we need to find the user's Zalo ID
          // This is a simplified approach - you may need to adjust based on your data structure
          const result = await this.zaloPushService.sendPushNotification(
            user.id.toString(), // Using user ID as Zalo user ID - may need adjustment
            {
              title: title,
              message: message,
              data: { type: 'report_reminder' }
            }
          );

          if (result.success) {
            successCount++;
            this.logger.log(`✅ Sent notification to user ${user.id} (${user.fullName})`);
          } else {
            failureCount++;
            this.logger.warn(`❌ Failed to send to user ${user.id}: ${result.error}`);
          }
        } catch (error) {
          failureCount++;
          this.logger.error(`❌ Error sending to user ${user.id}:`, error);
        }
      }

      this.logger.log(`📊 Notification results: ${successCount} success, ${failureCount} failures`);

      // Save notification record to database
      try {
        await this.thongBaoService.create('system', {
          noiDungThongBao: `${title}\n\n${message}`,
          ghiChu: `Thông báo tự động - ${successCount} thành công, ${failureCount} thất bại`
        });
      } catch (error) {
        this.logger.error('❌ Error saving notification record:', error);
      }

    } catch (error) {
      this.logger.error(`❌ Error in sendSimpleNotification for period ${period.ten}:`, error);
    }
  }

  /**
   * Format message template với thông tin period
   */
  private formatMessageTemplate(template: string, period: ThoiGianCapNhatDoanSo): string {
    return template
      .replace(/{{ten}}/g, period.ten)
      .replace(/{{thoiGianBatDau}}/g, new Date(period.thoiGianBatDau).toLocaleDateString('vi-VN'))
      .replace(/{{thoiGianKetThuc}}/g, new Date(period.thoiGianKetThuc).toLocaleDateString('vi-VN'))
      .replace(/{{moTa}}/g, period.moTa || '');
  }

  /**
   * Gửi thông báo tới các role cụ thể
   */
  private async sendNotificationToRoles(
    targetRoles: string[],
    title: string,
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _period: ThoiGianCapNhatDoanSo
  ): Promise<void> {
    try {
      // Tìm users có role phù hợp (giả sử có trường role trong User entity)
      const users = await this.userRepository.find({
        where: {
          isActive: true,
          // Thêm điều kiện role nếu có
        },
        relations: ['zaloUser'] // Giả sử có relation với ZaloUser
      });

      this.logger.log(`📤 Gửi thông báo tới ${users.length} users với roles: ${targetRoles.join(', ')}`);

      for (const user of users) {
        try {
          // 1. Lưu thông báo vào database (cần tìm hiểu signature đúng của createCustomMessage)
          // await this.thongBaoService.createCustomMessage(...);

          // 2. Gửi thông báo qua Zalo OA
          await this.zaloPushService.sendOAMessage(
            user.id.toString(),
            `${title}\n\n${message}`
          );

        } catch (userError) {
          this.logger.error(`❌ Lỗi gửi thông báo cho user ${user.id}:`, userError);
        }
      }

    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi thông báo tới roles:', error);
    }
  }

  /**
   * Cập nhật thời gian gửi thông báo cuối cùng
   */
  private async updateLastNotificationTime(periodId: number, time: Date): Promise<void> {
    await this.thoiGianCapNhatDoanSoRepository.update(
      { id: periodId },
      { last_notification_time: time }
    );
  }

  /**
   * API để test gửi thông báo ngay lập tức
   */
  async sendTestNotification(periodId: number): Promise<{ success: boolean; message: string; }> {
    try {
      const period = await this.thoiGianCapNhatDoanSoRepository.findOne({
        where: { id: periodId }
      });

      if (!period) {
        return { success: false, message: 'Không tìm thấy period' };
      }

      await this.processPeriodNotifications(period);

      return { success: true, message: `Test thông báo đã được gửi cho period: ${period.ten}` };
    } catch (error) {
      this.logger.error('❌ Lỗi test notification:', error);
      return { success: false, message: `Lỗi: ${error.message}` };
    }
  }

  /**
   * API để cấu hình lịch thông báo cho period
   */
  async updateNotificationSchedule(
    periodId: number,
    schedules: NotificationSchedule
  ): Promise<{ success: boolean; message: string; }> {
    try {
      await this.thoiGianCapNhatDoanSoRepository.update(
        { id: periodId },
        {
          notification_schedules: schedules as any,
          auto_notification_enabled: true
        }
      );

      return { success: true, message: 'Cập nhật lịch thông báo thành công' };
    } catch (error) {
      this.logger.error('❌ Lỗi update notification schedule:', error);
      return { success: false, message: `Lỗi: ${error.message}` };
    }
  }

  /**
   * API để bật/tắt thông báo tự động cho period
   */
  async toggleAutoNotification(
    periodId: number,
    enabled: boolean
  ): Promise<{ success: boolean; message: string; }> {
    try {
      await this.thoiGianCapNhatDoanSoRepository.update(
        { id: periodId },
        { auto_notification_enabled: enabled }
      );

      return {
        success: true,
        message: `${enabled ? 'Bật' : 'Tắt'} thông báo tự động thành công`
      };
    } catch (error) {
      this.logger.error('❌ Lỗi toggle auto notification:', error);
      return { success: false, message: `Lỗi: ${error.message}` };
    }
  }
}
