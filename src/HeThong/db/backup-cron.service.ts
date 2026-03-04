import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { BackupRestoreService } from './backup-restore.service';

@Injectable()
export class BackupCronService {
  private readonly logger = new Logger(BackupCronService.name);

  constructor(private readonly backupService: BackupRestoreService) { }

  /**
   * Backup hàng ngày lúc 2h sáng
   */
  @Cron('0 2 * * *', {
    name: 'daily-backup',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleDailyBackup() {
    this.logger.log('🔄 [DAILY BACKUP] Bắt đầu backup database hàng ngày...');

    try {
      const result = await this.backupService.backupDatabase('daily');
      this.logger.log(`✅ [DAILY BACKUP] Hoàn thành: ${result}`);

      // Cleanup old backups theo retention policy
      await this.backupService.cleanupOldBackups('daily');
    } catch (error) {
      this.logger.error(`❌ [DAILY BACKUP] Lỗi: ${error.message}`, error.stack);
    }
  }

  /**
   * Backup hàng tuần vào Chủ nhật lúc 3h sáng
   */
  @Cron('0 3 * * 0', {
    name: 'weekly-backup',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleWeeklyBackup() {
    this.logger.log('🔄 [WEEKLY BACKUP] Bắt đầu backup database hàng tuần...');

    try {
      const result = await this.backupService.backupDatabase('weekly');
      this.logger.log(`✅ [WEEKLY BACKUP] Hoàn thành: ${result}`);

      await this.backupService.cleanupOldBackups('weekly');
    } catch (error) {
      this.logger.error(`❌ [WEEKLY BACKUP] Lỗi: ${error.message}`, error.stack);
    }
  }

  /**
   * Backup hàng tháng vào ngày 1 lúc 4h sáng
   */
  @Cron('0 4 1 * *', {
    name: 'monthly-backup',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async handleMonthlyBackup() {
    this.logger.log('🔄 [MONTHLY BACKUP] Bắt đầu backup database hàng tháng...');

    try {
      const result = await this.backupService.backupDatabase('monthly');
      this.logger.log(`✅ [MONTHLY BACKUP] Hoàn thành: ${result}`);

      await this.backupService.cleanupOldBackups('monthly');
    } catch (error) {
      this.logger.error(`❌ [MONTHLY BACKUP] Lỗi: ${error.message}`, error.stack);
    }
  }

  /**
   * Test backup ngay lập tức (dùng cho testing)
   */
  async testBackup() {
    this.logger.log('🧪 [TEST BACKUP] Chạy thử backup...');

    try {
      const result = await this.backupService.backupDatabase('manual');
      this.logger.log(`✅ [TEST BACKUP] Hoàn thành: ${result}`);
      return { success: true, message: result };
    } catch (error) {
      this.logger.error(`❌ [TEST BACKUP] Lỗi: ${error.message}`, error.stack);
      throw error;
    }
  }
}
