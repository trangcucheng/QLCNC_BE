import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ZaloPushNotificationService } from './auth/zalo-push.service';

@ApiTags('Test Zalo Push')
@Controller('test/zalo-push')
export class TestZaloPushController {
  constructor(
    private readonly zaloPushService: ZaloPushNotificationService
  ) { }

  @Post('send/:zaloId')
  @ApiOperation({ summary: 'Test gửi push notification' })
  async testSendPush(@Param('zaloId') zaloId: string) {
    try {
      const result = await this.zaloPushService.testNotification(zaloId);

      return {
        success: result.success,
        message: result.success ? 'Gửi thành công' : 'Gửi thất bại',
        error: result.error,
        zaloId,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        message: 'Lỗi khi gửi test notification',
        error: error.message,
        zaloId,
        timestamp: new Date()
      };
    }
  }

  @Get('check-user/:userId')
  @ApiOperation({ summary: 'Kiểm tra user có liên kết Zalo không' })
  async checkZaloUser(@Param('userId') userId: string) {
    // Implement logic check zalo user
    return {
      userId,
      hasZaloAccount: false, // TODO: implement
      zaloId: null,
      message: 'Cần implement logic check'
    };
  }
}
