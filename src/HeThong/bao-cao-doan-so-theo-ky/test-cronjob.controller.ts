import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthenticationGuard } from '../auth/guards/auth.guard';
import { ScheduleNotificationService } from './schedule-notification.service';

@ApiTags('Test Cronjob')
@Controller('bao-cao-doan-so-theo-ky/test')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth()
export class TestCronjobController {
  constructor(
    private readonly scheduleNotificationService: ScheduleNotificationService,
  ) { }

  @Post('daily-notification')
  @ApiOperation({
    summary: 'Trigger daily notification cronjob manually',
    description: 'Test daily notification cronjob (normally runs at 8 AM)'
  })
  @ApiResponse({
    status: 200,
    description: 'Daily notification job executed successfully'
  })
  async triggerDailyNotification(): Promise<any> {
    console.log('🚀 Manual trigger: Daily notification cronjob');
    await this.scheduleNotificationService.checkAndSendScheduledNotifications();
    return {
      success: true,
      message: 'Daily notification job executed manually',
      timestamp: new Date()
    };
  }

  @Post('weekly-notification')
  @ApiOperation({
    summary: 'Trigger weekly notification cronjob manually',
    description: 'Test weekly notification cronjob (normally runs at 9 AM on Monday)'
  })
  @ApiResponse({
    status: 200,
    description: 'Weekly notification job executed successfully'
  })
  async triggerWeeklyNotification(): Promise<any> {
    console.log('🚀 Manual trigger: Weekly notification cronjob');
    await this.scheduleNotificationService.sendWeeklyReminders();
    return {
      success: true,
      message: 'Weekly notification job executed manually',
      timestamp: new Date()
    };
  }

  @Get('cronjob-status')
  @ApiOperation({
    summary: 'Check cronjob service status',
    description: 'Get information about scheduled notification service status'
  })
  @ApiResponse({
    status: 200,
    description: 'Service status retrieved successfully'
  })
  async getCronjobStatus(): Promise<any> {
    return {
      success: true,
      service: 'ScheduleNotificationService',
      cronjobs: [
        {
          name: 'Daily Notification Check',
          schedule: '0 8 * * *',
          description: 'Runs at 8 AM daily',
          method: 'handleDailyNotificationCheck'
        },
        {
          name: 'Weekly Notification Check',
          schedule: '0 9 * * 1',
          description: 'Runs at 9 AM every Monday',
          method: 'handleWeeklyNotificationCheck'
        }
      ],
      timestamp: new Date(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  @Get('next-schedule')
  @ApiOperation({
    summary: 'Get next scheduled execution times',
    description: 'Calculate when the next cronjobs will run'
  })
  @ApiResponse({
    status: 200,
    description: 'Next execution times calculated'
  })
  async getNextSchedule(): Promise<any> {
    const now = new Date();

    // Calculate next 8 AM today or tomorrow
    const nextDaily = new Date(now);
    nextDaily.setHours(8, 0, 0, 0);
    if (nextDaily <= now) {
      nextDaily.setDate(nextDaily.getDate() + 1);
    }

    // Calculate next Monday 9 AM
    const nextWeekly = new Date(now);
    const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
    nextWeekly.setDate(now.getDate() + daysUntilMonday);
    nextWeekly.setHours(9, 0, 0, 0);
    if (nextWeekly <= now && now.getDay() === 1) {
      nextWeekly.setDate(nextWeekly.getDate() + 7);
    }

    return {
      success: true,
      currentTime: now,
      nextExecution: {
        daily: nextDaily,
        weekly: nextWeekly
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  }

  @Get('debug-periods')
  @ApiOperation({
    summary: 'Debug notification periods',
    description: 'Check what notification periods exist and their schedules'
  })
  @ApiResponse({
    status: 200,
    description: 'Debug information retrieved'
  })
  async debugNotificationPeriods(): Promise<any> {
    try {
      // Tạm thời comment out method chưa có
      return {
        success: true,
        message: 'Debug method đang được phát triển',
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  @Post('enable-notification/:periodId')
  @ApiOperation({
    summary: 'Enable notification for a period',
    description: 'Enable auto notification for existing period'
  })
  @ApiResponse({
    status: 200,
    description: 'Notification enabled successfully'
  })
  async enableNotificationForPeriod(
    @Param('periodId', ParseIntPipe) periodId: number,
    @Body() config?: any
  ): Promise<any> {
    try {
      const result = await this.scheduleNotificationService.updateNotificationSchedule(
        periodId,
        config || {
          reminder_notifications: [{
            type: 'reminder',
            days_before_start: 3,
            message_template: 'Báo cáo {{ten}} sẽ bắt đầu trong 3 ngày',
            target_roles: ['admin', 'user']
          }],
          deadline_notifications: [{
            type: 'deadline_warning',
            days_before_end: 1,
            message_template: 'Báo cáo {{ten}} sẽ kết thúc vào ngày mai',
            target_roles: ['admin', 'user']
          }, {
            type: 'overdue',
            days_after_end: 1,
            message_template: 'Báo cáo {{ten}} đã quá hạn 1 ngày',
            target_roles: ['admin', 'user']
          }]
        }
      );

      return {
        success: true,
        message: 'Đã bật thông báo tự động cho kỳ báo cáo',
        result,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }
}
