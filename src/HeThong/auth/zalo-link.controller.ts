import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { ZaloService } from './zalo.service';

export class SearchUserDto {
  @ApiProperty({
    description: 'Số điện thoại để tìm kiếm',
    example: '0909123456',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Email để tìm kiếm',
    example: 'user@company.com',
    required: false
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Mã nhân viên hoặc identity',
    example: 'NV001',
    required: false
  })
  @IsOptional()
  @IsString()
  identity?: string;
}

export class LinkAccountDto {
  @ApiProperty({
    description: 'User ID hệ thống để liên kết',
    example: 'uuid-user-id',
    required: true
  })
  @IsNotEmpty()
  @IsString()
  systemUserId: string;
}

@ApiTags('Zalo Account Linking')
@Controller('zalo/link')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class ZaloLinkController {
  constructor(private readonly zaloService: ZaloService) { }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Kiểm tra trạng thái liên kết tài khoản',
    description: 'API kiểm tra xem tài khoản Zalo đã được liên kết với user hệ thống chưa'
  })
  @ApiResponse({
    status: 200,
    description: 'Thông tin trạng thái liên kết',
    schema: {
      type: 'object',
      properties: {
        isLinked: { type: 'boolean', example: true },
        linkMethod: { type: 'string', example: 'phone_matched' },
        linkedUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            phoneNumber: { type: 'string' },
            email: { type: 'string' }
          }
        },
        canAutoLink: { type: 'boolean', example: false },
        suggestedUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              phoneNumber: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getLinkStatus(@Request() req: any) {
    const zaloId = req.user.zaloId;
    return await this.zaloService.checkZaloUserLinkStatus(zaloId);
  }

  @Post('search-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tìm kiếm user hệ thống để liên kết',
    description: 'API tìm kiếm user trong hệ thống theo số điện thoại, email hoặc mã nhân viên'
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách user phù hợp',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              fullName: { type: 'string' },
              phoneNumber: { type: 'string' },
              email: { type: 'string' },
              identity: { type: 'string' }
            }
          }
        },
        total: { type: 'number', example: 2 }
      }
    }
  })
  async searchUsers(@Body() searchDto: SearchUserDto) {
    const users = await this.zaloService.findSystemUserForLinking(searchDto);

    return {
      users,
      total: users.length,
      message: users.length > 0
        ? `Tìm thấy ${users.length} user phù hợp`
        : 'Không tìm thấy user nào phù hợp'
    };
  }

  @Post('manual-link')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Liên kết thủ công với user hệ thống',
    description: 'API liên kết tài khoản Zalo với user hệ thống đã có'
  })
  @ApiResponse({
    status: 200,
    description: 'Liên kết thành công',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Liên kết tài khoản thành công' },
        linkedUser: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            fullName: { type: 'string' },
            phoneNumber: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi liên kết (user không tồn tại hoặc đã được liên kết)'
  })
  async manualLink(
    @Request() req: any,
    @Body() linkDto: LinkAccountDto
  ) {
    const zaloId = req.user.zaloId;

    try {
      const updatedZaloUser = await this.zaloService.linkZaloUserWithSystemUser(
        zaloId,
        linkDto.systemUserId
      );

      return {
        success: true,
        message: 'Liên kết tài khoản thành công',
        linkedUser: {
          id: updatedZaloUser.user?.id,
          fullName: updatedZaloUser.user?.fullName,
          phoneNumber: updatedZaloUser.user?.phoneNumber,
          email: updatedZaloUser.user?.email
        },
        linkMethod: 'manual_linked',
        linkedAt: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: 'LINK_FAILED'
      };
    }
  }

  @Post('unlink')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Hủy liên kết tài khoản',
    description: 'API hủy liên kết giữa tài khoản Zalo và user hệ thống'
  })
  @ApiResponse({
    status: 200,
    description: 'Hủy liên kết thành công'
  })
  async unlinkAccount(@Request() req: any) {
    const zaloId = req.user.zaloId;
    return await this.zaloService.unlinkZaloUser(zaloId);
  }
}
