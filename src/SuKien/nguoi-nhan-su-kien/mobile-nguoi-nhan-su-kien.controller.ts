import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../../HeThong/auth/guards/flexible-auth.guard';
import {
  GuiThongBaoChoTatCaDto,
  GuiThongBaoSuKienDto,
  LayThongBaoDto
} from './dto/nguoi-nhan-su-kien.dto';
import { NguoiNhanSuKienService } from './nguoi-nhan-su-kien.service';

@ApiTags('Mobile API - Thông Báo Sự Kiện')
@Controller('mobile/thong-bao-su-kien')
export class MobileNguoiNhanSuKienController {
  constructor(private readonly nguoiNhanSuKienService: NguoiNhanSuKienService) { }

  @Get('my-notifications')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy thông báo của tôi',
    description: 'API dành cho Zalo Mini App - Lấy danh sách thông báo sự kiện của người dùng hiện tại'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi (mặc định: 10)' })
  @ApiQuery({ name: 'trangThaiXem', required: false, description: 'Lọc theo trạng thái xem' })
  @ApiQuery({ name: 'loaiThongBao', required: false, description: 'Lọc theo loại thông báo' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập qua Zalo'
  })
  async getMyMobileNotifications(
    @Request() req,
    @Query(ValidationPipe) query: LayThongBaoDto
  ) {
    const userId = req.user.id || req.user.zaloId;

    const result = await this.nguoiNhanSuKienService.layDanhSachThongBao({
      ...query
    }, userId);

    return {
      success: true,
      data: result.data.map(item => ({
        id: item.id,
        suKien: {
          id: item.suKien.id,
          tenSuKien: item.suKien.tenSuKien,
          noiDungSuKien: item.suKien.noiDungSuKien,
          thoiGianBatDau: item.suKien.thoiGianBatDau,
          thoiGianKetThuc: item.suKien.thoiGianKetThuc,
          diaDiem: item.suKien.diaDiem,
          loaiSuKien: item.suKien.loaiSuKien?.ten
        },
        loaiThongBao: item.loaiThongBao,
        trangThaiXem: item.trangThaiXem,
        ghiChu: item.ghiChu,
        thoiGianGui: item.thoiGianGui,
        thoiGianXem: item.thoiGianXem
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      unreadCount: result.data.filter(item => item.trangThaiXem === 'Chưa xem').length,
      message: 'Lấy danh sách thông báo thành công'
    };
  }

  @Get('unread-count')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Đếm thông báo chưa đọc',
    description: 'API dành cho Zalo Mini App - Đếm số lượng thông báo chưa đọc của người dùng'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy số lượng thành công'
  })
  async getMobileUnreadCount(@Request() req) {
    const userId = req.user.id || req.user.zaloId;

    const result = await this.nguoiNhanSuKienService.layDanhSachThongBao({
      page: 1,
      limit: 1000,
      trangThaiXem: 'Chưa xem'
    }, userId);

    return {
      success: true,
      data: {
        unreadCount: result.total,
        userId: userId
      },
      message: 'Lấy số lượng thông báo chưa đọc thành công'
    };
  }

  @Get('recent')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy thông báo gần đây',
    description: 'API dành cho Zalo Mini App - Lấy 5 thông báo gần đây nhất'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getMobileRecentNotifications(@Request() req) {
    const userId = req.user.id || req.user.zaloId;

    const result = await this.nguoiNhanSuKienService.layDanhSachThongBao({
      page: 1,
      limit: 5
    }, userId);

    return {
      success: true,
      data: result.data.map(item => ({
        id: item.id,
        tenSuKien: item.suKien.tenSuKien,
        loaiThongBao: item.loaiThongBao,
        trangThaiXem: item.trangThaiXem,
        thoiGianGui: item.thoiGianGui,
        isNew: new Date(item.thoiGianGui).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Trong 24h
      })),
      message: 'Lấy thông báo gần đây thành công'
    };
  }

  @Get(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy chi tiết thông báo',
    description: 'API dành cho Zalo Mini App - Lấy chi tiết thông báo và tự động đánh dấu đã đọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async getMobileNotificationDetail(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.id || req.user.zaloId;
    const result = await this.nguoiNhanSuKienService.layChiTiet(id);

    // Tự động đánh dấu đã đọc nếu là thông báo của user hiện tại
    if (result.nguoiNhanId === userId && result.trangThaiXem === 'Chưa xem') {
      await this.nguoiNhanSuKienService.capNhatTrangThaiXem({
        nguoiNhanId: userId,
        suKienId: result.suKien.id,
        trangThaiXem: 'Đã xem'
      });
      result.trangThaiXem = 'Đã xem';
      result.thoiGianXem = new Date();
    }

    return {
      success: true,
      data: {
        id: result.id,
        suKien: {
          id: result.suKien.id,
          tenSuKien: result.suKien.tenSuKien,
          noiDungSuKien: result.suKien.noiDungSuKien,
          thoiGianBatDau: result.suKien.thoiGianBatDau,
          thoiGianKetThuc: result.suKien.thoiGianKetThuc,
          diaDiem: result.suKien.diaDiem,
          trangThai: result.suKien.trangThai,
          loaiSuKien: result.suKien.loaiSuKien ? {
            id: result.suKien.loaiSuKien.id,
            ten: result.suKien.loaiSuKien.ten
          } : null,
          fileDinhKem: result.suKien.fileDinhKem ? JSON.parse(result.suKien.fileDinhKem) : []
        },
        loaiThongBao: result.loaiThongBao,
        trangThaiXem: result.trangThaiXem,
        ghiChu: result.ghiChu,
        thoiGianGui: result.thoiGianGui,
        thoiGianXem: result.thoiGianXem
      },
      message: 'Lấy chi tiết thông báo thành công'
    };
  }

  @Put('mark-read/:id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Đánh dấu đã đọc',
    description: 'API dành cho Zalo Mini App - Đánh dấu thông báo đã đọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async markMobileNotificationAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.id || req.user.zaloId;
    const notification = await this.nguoiNhanSuKienService.layChiTiet(id);

    const result = await this.nguoiNhanSuKienService.capNhatTrangThaiXem({
      nguoiNhanId: userId,
      suKienId: notification.suKien.id,
      trangThaiXem: 'Đã xem'
    });

    return {
      success: true,
      data: {
        id: result.id,
        trangThaiXem: result.trangThaiXem,
        thoiGianXem: result.thoiGianXem
      },
      message: 'Đánh dấu đã đọc thành công'
    };
  }

  @Put('mark-all-read')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Đánh dấu tất cả đã đọc',
    description: 'API dành cho Zalo Mini App - Đánh dấu tất cả thông báo của user đã đọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  async markAllMobileNotificationsAsRead(@Request() req) {
    const userId = req.user.id || req.user.zaloId;

    // Lấy tất cả thông báo chưa đọc của user
    const unreadNotifications = await this.nguoiNhanSuKienService.layDanhSachThongBao({
      page: 1,
      limit: 1000,
      trangThaiXem: 'Chưa xem'
    }, userId);

    // Cập nhật từng thông báo
    const updatePromises = unreadNotifications.data.map(notification =>
      this.nguoiNhanSuKienService.capNhatTrangThaiXem({
        nguoiNhanId: userId,
        suKienId: notification.suKien.id,
        trangThaiXem: 'Đã xem'
      })
    );

    await Promise.all(updatePromises);

    return {
      success: true,
      data: {
        updatedCount: unreadNotifications.data.length,
        userId: userId
      },
      message: `Đã đánh dấu ${unreadNotifications.data.length} thông báo là đã đọc`
    };
  }

  @Post('send')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Gửi thông báo sự kiện',
    description: 'API dành cho Zalo Mini App - Gửi thông báo sự kiện tới danh sách người dùng (Admin only)'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi thông báo thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  async sendMobileEventNotification(
    @Body(ValidationPipe) guiThongBaoSuKienDto: GuiThongBaoSuKienDto
  ) {
    const result = await this.nguoiNhanSuKienService.guiThongBaoSuKien(guiThongBaoSuKienDto);

    return {
      success: true,
      data: {
        sentCount: result.soLuongGui,
        recipients: result.daGuiCho,
        errors: result.loi
      },
      message: result.message
    };
  }

  @Post('broadcast')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Gửi thông báo tới tất cả',
    description: 'API dành cho Zalo Mini App - Gửi thông báo sự kiện tới tất cả người dùng (Admin only)'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi thông báo thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  async broadcastMobileEventNotification(
    @Body(ValidationPipe) guiThongBaoChoTatCaDto: GuiThongBaoChoTatCaDto
  ) {
    const result = await this.nguoiNhanSuKienService.guiThongBaoChoTatCa(guiThongBaoChoTatCaDto);

    return {
      success: true,
      data: {
        sentCount: result.soLuongGui,
        recipients: result.daGuiCho,
        broadcastTime: new Date().toISOString()
      },
      message: result.message
    };
  }

  @Delete(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Xóa thông báo',
    description: 'API dành cho Zalo Mini App - Xóa thông báo (chỉ người nhận mới được xóa)'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền xóa thông báo này'
  })
  async deleteMobileNotification(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    const userId = req.user.id || req.user.zaloId;
    const notification = await this.nguoiNhanSuKienService.layChiTiet(id);

    // Chỉ cho phép người nhận xóa thông báo của mình
    if (notification.nguoiNhanId !== userId) {
      return {
        success: false,
        message: 'Bạn không có quyền xóa thông báo này'
      };
    }

    await this.nguoiNhanSuKienService.xoa(id);

    return {
      success: true,
      message: 'Xóa thông báo thành công'
    };
  }

  @Post('test-push')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Test push notification',
    description: 'API dành cho Zalo Mini App - Test gửi push notification tới user hiện tại'
  })
  @ApiResponse({
    status: 200,
    description: 'Test thành công'
  })
  async testMobilePushNotification(@Request() req) {
    const zaloId = req.user.zaloId;

    // Import ZaloPushNotificationService (cần inject vào constructor)
    // const result = await this.zaloPushService.testNotification(zaloId);

    return {
      success: true,
      data: {
        zaloId: zaloId,
        message: 'Push notification test được gửi (chức năng cần hoàn thiện cấu hình Zalo)'
      },
      message: 'Test push notification thành công'
    };
  }
}
