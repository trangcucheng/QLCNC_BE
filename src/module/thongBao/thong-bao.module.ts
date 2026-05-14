// ThongBao Module
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Prisma, ThongBao } from '@prisma/client';
import { Permissions } from 'src/decorator/permissions.decorator';

// DTOs
export class CreateThongBaoDTO {
  @ApiProperty({ description: 'Tiêu đề' })
  @IsNotEmpty()
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'Nội dung' })
  @IsNotEmpty()
  @IsString()
  noiDung: string;

  @ApiProperty({ description: 'Loại thông báo' })
  @IsNotEmpty()
  @IsString()
  loaiThongBao: string;

  @ApiPropertyOptional({ description: 'Ưu tiên (1-3)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  uu_tien?: number;

  @ApiPropertyOptional({ description: 'Trạng thái', default: true })
  @IsOptional()
  @IsBoolean()
  trangThai?: boolean;
}

export class UpdateThongBaoDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tieuDe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  noiDung?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loaiThongBao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  uu_tien?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trangThai?: boolean;
}

// Service
@Injectable()
export class ThongBaoService {
  constructor(private prisma: PrismaService) { }

  async getAll(params: { page?: number; pageSize?: number; trangThai?: boolean } = {}) {
    const { page = 1, pageSize = 10, trangThai } = params;
    const where = trangThai !== undefined ? { trangThai } : {};
    const [data, total] = await Promise.all([
      this.prisma.thongBao.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: [{ uu_tien: 'desc' }, { ngayTao: 'desc' }],
      }),
      this.prisma.thongBao.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.thongBao.findUnique({ where: { id } });
  }

  async create(data: Prisma.ThongBaoCreateInput) {
    return this.prisma.thongBao.create({ data });
  }

  async update(where: Prisma.ThongBaoWhereUniqueInput, data: Prisma.ThongBaoUpdateInput) {
    const existing = await this.prisma.thongBao.findUnique({ where });
    if (!existing) throw new NotFoundException('Thông báo không tồn tại');
    return this.prisma.thongBao.update({ where, data });
  }

  async delete(where: Prisma.ThongBaoWhereUniqueInput) {
    const existing = await this.prisma.thongBao.findUnique({ where });
    if (!existing) throw new NotFoundException('Thông báo không tồn tại');
    return this.prisma.thongBao.delete({ where });
  }

  async toggleStatus(id: string) {
    const existing = await this.prisma.thongBao.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Thông báo không tồn tại');
    return this.prisma.thongBao.update({
      where: { id },
      data: { trangThai: !existing.trangThai },
    });
  }

  // User notification methods
  async getNotificationsForUser(userId: string, params: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 20 } = params;

    // Lấy danh sách thông báo đang active
    const notifications = await this.prisma.thongBao.findMany({
      where: { trangThai: true },
      orderBy: [{ uu_tien: 'desc' }, { ngayTao: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Lấy trạng thái đã đọc của user
    const notificationIds = notifications.map(n => n.id);
    const userNotifications = await this.prisma.nguoiDungThongBao.findMany({
      where: {
        nguoiDungId: userId,
        thongBaoId: { in: notificationIds },
      },
    });

    const readMap = new Map(userNotifications.map(un => [un.thongBaoId, un]));

    // Combine data
    const result = notifications.map(notification => ({
      ...notification,
      daDoc: readMap.get(notification.id)?.daDoc || false,
      ngayDoc: readMap.get(notification.id)?.ngayDoc || null,
    }));

    const total = await this.prisma.thongBao.count({ where: { trangThai: true } });

    return { data: result, total };
  }

  async getUnreadCount(userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User ID is required');
    }

    try {
      // Đếm tổng số thông báo active
      const totalActive = await this.prisma.thongBao.count({ where: { trangThai: true } });

      // Đếm số thông báo đã đọc
      const readCount = await this.prisma.nguoiDungThongBao.count({
        where: {
          nguoiDungId: userId,
          daDoc: true,
          thongBao: {
            trangThai: true,
          },
        },
      });

      return { unreadCount: totalActive - readCount, totalCount: totalActive };
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      throw new Error('Failed to get unread count: ' + error.message);
    }
  }

  async markAsRead(userId: string, notificationId: string) {
    // Kiểm tra thông báo tồn tại
    const notification = await this.prisma.thongBao.findUnique({
      where: { id: notificationId },
    });

    if (!notification) throw new NotFoundException('Thông báo không tồn tại');

    // Upsert user notification
    return this.prisma.nguoiDungThongBao.upsert({
      where: {
        nguoiDungId_thongBaoId: {
          nguoiDungId: userId,
          thongBaoId: notificationId,
        },
      },
      create: {
        nguoiDungId: userId,
        thongBaoId: notificationId,
        daDoc: true,
        ngayDoc: new Date(),
      },
      update: {
        daDoc: true,
        ngayDoc: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    // Lấy tất cả thông báo active
    const activeNotifications = await this.prisma.thongBao.findMany({
      where: { trangThai: true },
      select: { id: true },
    });

    // Tạo hoặc cập nhật tất cả
    const operations = activeNotifications.map(notification =>
      this.prisma.nguoiDungThongBao.upsert({
        where: {
          nguoiDungId_thongBaoId: {
            nguoiDungId: userId,
            thongBaoId: notification.id,
          },
        },
        create: {
          nguoiDungId: userId,
          thongBaoId: notification.id,
          daDoc: true,
          ngayDoc: new Date(),
        },
        update: {
          daDoc: true,
          ngayDoc: new Date(),
        },
      })
    );

    await this.prisma.$transaction(operations);
    return { status: 'success', message: 'Đã đánh dấu tất cả thông báo là đã đọc' };
  }
}

// Controller
@ApiBearerAuth('access-token')
@ApiTags('Thông báo')
@Controller('thong-bao')
export class ThongBaoController {
  constructor(private service: ThongBaoService) { }

  @Get('/list-all')
  @Permissions('VIEW_THONG_BAO')
  async getAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('trangThai') trangThai?: string,
  ) {
    return this.service.getAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      trangThai: trangThai === 'true' ? true : trangThai === 'false' ? false : undefined,
    });
  }

  @Get('/:id')
  @Permissions('VIEW_THONG_BAO')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('CREATE_THONG_BAO')
  async create(@Body() dto: CreateThongBaoDTO) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Permissions('UPDATE_THONG_BAO')
  async update(@Param('id') id: string, @Body() dto: UpdateThongBaoDTO) {
    return this.service.update({ id }, dto);
  }

  @Patch('/:id/toggle-status')
  @Permissions('UPDATE_THONG_BAO')
  async toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete('/:id')
  @Permissions('DELETE_THONG_BAO')
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa thành công' };
  }
}

// User Notification Controller
@ApiBearerAuth('access-token')
@ApiTags('Thông báo người dùng')
@Controller('user-notifications')
export class UserNotificationController {
  constructor(private service: ThongBaoService) { }

  @Get('/my-notifications')
  async getMyNotifications(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.service.getNotificationsForUser(userId, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
    });
  }

  @Get('/unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.service.getUnreadCount(userId);
  }

  @Patch('/:id/mark-as-read')
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    await this.service.markAsRead(userId, id);
    return { status: 'success', message: 'Đã đánh dấu là đã đọc' };
  }

  @Patch('/mark-all-as-read')
  async markAllAsRead(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.service.markAllAsRead(userId);
  }
}

// Module
@Module({
  controllers: [ThongBaoController, UserNotificationController],
  providers: [PrismaService, ThongBaoService],
  exports: [ThongBaoService],
})
export class ThongBaoModule { }
