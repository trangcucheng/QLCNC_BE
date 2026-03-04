import { Body, Controller, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { ZaloService } from './zalo.service';

export class AutoLinkDto {
  @ApiProperty({
    description: 'Số điện thoại để tìm tài khoản hệ thống',
    example: '0987654321',
    required: false
  })
  phone?: string;

  @ApiProperty({
    description: 'Email để tìm tài khoản hệ thống',
    example: 'user@example.com',
    required: false
  })
  email?: string;

  @ApiProperty({
    description: 'CCCD/CMND hoặc mã nhân viên để tìm tài khoản hệ thống',
    example: '123456789',
    required: false
  })
  identity?: string;
}

@ApiTags('Zalo Auto Link')
@Controller('auth/zalo')
export class ZaloAutoLinkController {
  constructor(private readonly zaloService: ZaloService) { }

  @Post('auto-link')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tự động liên kết tài khoản',
    description: 'API tự động tìm và liên kết tài khoản hệ thống dựa trên phone/email/identity'
  })
  @ApiResponse({ status: 200, description: 'Liên kết thành công hoặc không tìm thấy' })
  @HttpCode(HttpStatus.OK)
  async autoLink(@Request() req, @Body() linkDto: AutoLinkDto) {
    const result = await this.zaloService.autoLinkAccount(req.user.zaloId, linkDto);

    return {
      success: true,
      linked: result.linked,
      message: result.linked ?
        'Tài khoản đã được liên kết thành công' :
        'Không tìm thấy tài khoản phù hợp',
      data: result.user
    };
  }

  @Post('check-link-status')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái liên kết',
    description: 'Kiểm tra xem tài khoản Zalo đã được liên kết chưa'
  })
  @ApiResponse({
    status: 200,
    description: 'Kiểm tra thành công',
    schema: {
      example: {
        success: true,
        isLinked: true,
        linkedUser: {
          id: 'user123',
          fullName: 'Nguyễn Văn A',
          phoneNumber: '0987654321',
          organizationId: 1
        },
        canReceiveNotifications: true,
        nextAction: 'ready_to_use'
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async checkLinkStatus(@Request() req) {
    const status = await this.zaloService.checkLinkStatus(req.user.zaloId);

    return {
      success: true,
      isLinked: status.isLinked,
      linkedUser: status.linkedUser,
      zaloInfo: status.zaloInfo,
      canReceiveNotifications: status.isLinked,
      nextAction: status.isLinked ?
        'ready_to_use' :
        'need_to_link_account',
      linkDate: status.linkDate
    };
  }

  @Post('auto-link-by-phone')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Tự động liên kết bằng SĐT Zalo',
    description: 'Tự động thử liên kết tài khoản bằng số điện thoại từ profile Zalo'
  })
  @ApiResponse({
    status: 200,
    description: 'Thử liên kết thành công',
    schema: {
      example: {
        success: true,
        linked: true,
        message: 'Tự động liên kết thành công bằng số điện thoại',
        user: {
          id: 'user123',
          fullName: 'Nguyễn Văn A',
          phoneNumber: '0987654321'
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async autoLinkByPhone(@Request() req) {
    const result = await this.zaloService.autoLinkByZaloPhone(req.user.zaloId);

    return {
      success: true,
      linked: result.linked,
      message: result.message || 'Hoàn tất kiểm tra liên kết tự động',
      user: 'user' in result ? result.user : null
    };
  }
}
