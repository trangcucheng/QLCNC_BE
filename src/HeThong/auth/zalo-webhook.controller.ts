import { Body, Controller, Post, Headers, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@ApiTags('Zalo Webhook')
@Controller('webhook')
export class ZaloWebhookController {
  private readonly logger = new Logger(ZaloWebhookController.name);

  constructor(private readonly configService: ConfigService) { }

  @Post('zalo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Zalo OA Webhook endpoint' })
  async handleZaloWebhook(
    @Body() body: any,
    @Headers('X-ZEvent-Signature') signature: string
  ) {
    try {
      // 1. Verify webhook signature
      const webhookSecret = this.configService.get('ZALO_WEBHOOK_SECRET');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        this.logger.warn('Invalid webhook signature');
        return { error: 'Invalid signature' };
      }

      // 2. Process webhook events
      this.logger.log('Zalo webhook received:', JSON.stringify(body));

      const { event_name, data } = body;

      switch (event_name) {
        case 'user_send_text':
          await this.handleUserMessage(data);
          break;

        case 'user_follow':
          await this.handleUserFollow(data);
          break;

        case 'user_unfollow':
          await this.handleUserUnfollow(data);
          break;

        default:
          this.logger.log(`Unhandled event: ${event_name}`);
      }

      return { status: 'success' };

    } catch (error) {
      this.logger.error('Webhook error:', error);
      return { error: 'Internal error' };
    }
  }

  private async handleUserMessage(data: any) {
    // Xử lý tin nhắn từ user
    this.logger.log(`User ${data.sender.id} sent: ${data.message.text}`);

    // TODO: Implement auto-reply logic here
    // Ví dụ: trả lời tự động khi user hỏi về báo cáo
  }

  private async handleUserFollow(data: any) {
    // Xử lý khi user follow OA
    this.logger.log(`User ${data.follower.id} followed OA`);

    // TODO: Send welcome message
    // TODO: Save user to database
  }

  private async handleUserUnfollow(data: any) {
    // Xử lý khi user unfollow OA
    this.logger.log(`User ${data.follower.id} unfollowed OA`);

    // TODO: Update user status in database
  }
}
