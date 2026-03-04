import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe} from '@nestjs/common';
import { ApiBearerAuth,ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import {
  CreateCustomMessageDto,
  CreateThongBaoDto,
  ListThongBaoDto,
  SendNotificationDto,
  UpdateThongBaoDto} from './dto/thong-bao.dto';
import { ThongBaoService } from './thong-bao.service';

@ApiTags('Zalo Mini App - Thông Báo')
@Controller('zalo/thong-bao')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class ZaloThongBaoController {
  constructor(private readonly thongBaoService: ThongBaoService) { }

  // API tạo và gửi thông báo mới (Admin/Manager qua Zalo Mini App)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Zalo] Tạo và gửi thông báo mới',
    description: 'API tạo mới một thông báo và tự động gửi đến tất cả thành viên'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo và gửi thông báo thành công',
    schema: {
      example: {
        success: true,
        message: 'Thông báo đã được tạo và gửi thành công',
        data: {
          id: 1,
          noiDungThongBao: "Thông báo họp đại hội công đoàn",
          ghiChu: "Thời gian: 8h00 ngày 15/01/2024",
          nguoiGui: "admin",
          createdAt: "2024-01-01T00:00:00.000Z"
        },
        sentToUsers: 150
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền gửi thông báo'
  })
  async createAndSendNotification(@Request() req, @Body(ValidationPipe) createDto: CreateThongBaoDto) {
    // Tạo thông báo mới
    const newNotification = await this.thongBaoService.create(req.user.id, createDto);

    // Đếm số người nhận
    const totalUsers = await this.thongBaoService.getTotalUsers();

    return {
      success: true,
      message: 'Thông báo đã được tạo và gửi thành công',
      data: newNotification,
      sentToUsers: totalUsers
    };
  }

  // API tạo thông báo tùy chỉnh (như tin nhắn doanh nghiệp)
  @Post('create-custom-message')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Zalo] Tạo thông báo tùy chỉnh',
    description: 'API tạo thông báo dạng tin nhắn doanh nghiệp với template có sẵn'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo thông báo tùy chỉnh thành công',
    schema: {
      example: {
        success: true,
        message: 'Thông báo tùy chỉnh đã được tạo và gửi thành công',
        data: {
          id: 1,
          noiDungThongBao: "Xin chào Anh/Chị\n\nCảm ơn bạn đã sử dụng dịch vụ...",
          createdAt: "2024-01-01T00:00:00.000Z"
        },
        sentToUsers: 1
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  async createCustomMessage(@Request() req, @Body(ValidationPipe) customDto: CreateCustomMessageDto) {
    const result = await this.thongBaoService.createCustomMessage(req.user.id, customDto);
    return result;
  }

  // API gửi thông báo đến danh sách người nhận cụ thể
  @Post('send-to-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Zalo] Gửi thông báo đến người dùng cụ thể',
    description: 'API gửi một thông báo đã có đến danh sách người nhận được chỉ định'
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi thông báo thành công',
    schema: {
      example: {
        success: true,
        message: 'Thông báo đã được gửi thành công',
        thongBaoId: 1,
        sentCount: 25,
        failedCount: 0,
        totalRequested: 25
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  @ApiResponse({
    status: 400,
    description: 'Danh sách người nhận không hợp lệ'
  })
  async sendNotificationToUsers(@Request() req, @Body(ValidationPipe) sendDto: SendNotificationDto) {
    const result = await this.thongBaoService.sendNotification(sendDto);
    return result;
  }

  // API gửi lại thông báo (resend)
  @Post(':id/resend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Zalo] Gửi lại thông báo',
    description: 'API gửi lại một thông báo đã có đến tất cả thành viên hoặc những người chưa nhận'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo cần gửi lại', example: 1 })
  @ApiQuery({ name: 'onlyUndelivered', required: false, description: 'Chỉ gửi cho những người chưa nhận (true/false)', example: false })
  @ApiResponse({
    status: 200,
    description: 'Gửi lại thông báo thành công',
    schema: {
      example: {
        success: true,
        message: 'Thông báo đã được gửi lại thành công',
        thongBaoId: 1,
        sentCount: 45,
        alreadySentCount: 105,
        totalUsers: 150
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async resendNotification(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Query('onlyUndelivered') onlyUndelivered: string = 'false'
  ) {
    const result = await this.thongBaoService.resendNotification(
      id,
      req.user.id,
      onlyUndelivered === 'true'
    );
    return result;
  }

  // API lấy danh sách thông báo đã tạo (cho Admin/Manager)
  @Get('created-by-me')
  @ApiOperation({
    summary: '[Zalo] Lấy danh sách thông báo đã tạo',
    description: 'API lấy danh sách thông báo do người dùng hiện tại tạo ra'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)', example: 10 })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo nội dung', example: 'họp đại hội' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thông báo đã tạo thành công',
    schema: {
      example: {
        data: [
          {
            id: 1,
            noiDungThongBao: "Thông báo họp đại hội",
            ghiChu: "Họp vào 8h sáng thứ 2",
            createdAt: "2024-01-01T00:00:00.000Z",
            totalRecipients: 150,
            readCount: 95,
            unreadCount: 55
          }
        ],
        total: 10,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  async getCreatedNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string
  ) {
    const queryDto = { page, limit, search, nguoiGui: req.user.id };
    return await this.thongBaoService.findAll(queryDto);
  }

  // API lấy danh sách thông báo cho user hiện tại (Zalo Mini App)
  @Get('my-notifications')
  @ApiOperation({
    summary: '[Zalo] Lấy danh sách thông báo của tôi',
    description: 'API lấy danh sách thông báo của user đang đăng nhập qua Zalo Mini App'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)', example: 10 })
  @ApiQuery({ name: 'trangThai', required: false, description: 'Lọc theo trạng thái (chua_doc, da_doc)', enum: ['chua_doc', 'da_doc'] })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thông báo thành công',
    schema: {
      example: {
        data: [
          {
            id: 1,
            noiDungThongBao: "Thông báo họp đại hội",
            ghiChu: "Họp vào 8h sáng thứ 2",
            nguoiGui: "user123",
            trangThaiDoc: "chua_doc",
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z"
          }
        ],
        total: 50,
        page: 1,
        limit: 10,
        totalPages: 5,
        unreadCount: 15
      }
    }
  })
  async getMyNotifications(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('trangThai') trangThai?: string
  ) {
    return await this.thongBaoService.getMyNotifications(req.user.id, page, limit, trangThai);
  }

  // API lấy số lượng thông báo chưa đọc
  @Get('unread-count')
  @ApiOperation({
    summary: '[Zalo] Lấy số thông báo chưa đọc',
    description: 'API lấy số lượng thông báo chưa đọc của user hiện tại'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy số thông báo chưa đọc thành công',
    schema: {
      example: {
        unreadCount: 5,
        totalNotifications: 20
      }
    }
  })
  async getUnreadCount(@Request() req) {
    const unreadCount = await this.thongBaoService.getUnreadCount(req.user.id);
    const totalNotifications = await this.thongBaoService.getTotalNotifications(req.user.id);

    return {
      unreadCount,
      totalNotifications
    };
  }

  // API lấy chi tiết một thông báo
  @Get(':id')
  @ApiOperation({
    summary: '[Zalo] Lấy chi tiết thông báo',
    description: 'API lấy chi tiết một thông báo và tự động đánh dấu đã đọc'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết thông báo thành công',
    schema: {
      example: {
        id: 1,
        noiDungThongBao: "Thông báo họp đại hội công đoàn",
        ghiChu: "Thời gian: 8h00 ngày 15/01/2024. Địa điểm: Hội trường A",
        nguoiGui: "admin",
        nguoiGuiUser: {
          id: "admin",
          fullName: "Quản trị viên",
          email: "admin@example.com"
        },
        trangThaiDoc: "da_doc",
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z"
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    // Tự động đánh dấu đã đọc khi xem chi tiết
    await this.thongBaoService.markAsRead(req.user.id, id);

    const thongBao = await this.thongBaoService.findOne(id);
    const userThongBao = await this.thongBaoService.getUserNotificationStatus(req.user.id, id);

    return {
      ...thongBao,
      trangThaiDoc: userThongBao?.trangThai || 'da_doc'
    };
  }

  // API đánh dấu thông báo đã đọc
  @Post(':id/mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Zalo] Đánh dấu đã đọc',
    description: 'API đánh dấu một thông báo là đã đọc'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu đã đọc thành công',
    schema: {
      example: {
        success: true,
        message: 'Đã đánh dấu thông báo là đã đọc'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async markAsRead(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.thongBaoService.markAsRead(req.user.id, id);
    return {
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc'
    };
  }

  // API đánh dấu thông báo chưa đọc
  @Post(':id/mark-unread')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Zalo] Đánh dấu chưa đọc',
    description: 'API đánh dấu một thông báo là chưa đọc'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu chưa đọc thành công',
    schema: {
      example: {
        success: true,
        message: 'Đã đánh dấu thông báo là chưa đọc'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async markAsUnread(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.thongBaoService.markAsUnread(req.user.id, id);
    return {
      success: true,
      message: 'Đã đánh dấu thông báo là chưa đọc'
    };
  }

  // API đánh dấu tất cả thông báo là đã đọc
  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Zalo] Đánh dấu tất cả đã đọc',
    description: 'API đánh dấu tất cả thông báo của user là đã đọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Đánh dấu tất cả đã đọc thành công',
    schema: {
      example: {
        success: true,
        message: 'Đã đánh dấu tất cả thông báo là đã đọc',
        updatedCount: 15
      }
    }
  })
  async markAllAsRead(@Request() req) {
    const updatedCount = await this.thongBaoService.markAllAsRead(req.user.id);
    return {
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
      updatedCount
    };
  }

  // API lấy thống kê thông báo
  @Get('stats/summary')
  @ApiOperation({
    summary: '[Zalo] Thống kê thông báo',
    description: 'API lấy thống kê tổng quan về thông báo của user'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    schema: {
      example: {
        total: 50,
        unread: 15,
        read: 35,
        today: 5,
        thisWeek: 12,
        thisMonth: 28
      }
    }
  })
  async getNotificationStats(@Request() req) {
    return await this.thongBaoService.getNotificationStats(req.user.id);
  }

  // API tìm kiếm thông báo
  @Get('search/advanced')
  @ApiOperation({
    summary: '[Zalo] Tìm kiếm thông báo nâng cao',
    description: 'API tìm kiếm thông báo với nhiều tiêu chí'
  })
  @ApiQuery({ name: 'keyword', required: false, description: 'Từ khóa tìm kiếm', example: 'họp đại hội' })
  @ApiQuery({ name: 'trangThai', required: false, description: 'Trạng thái đọc', enum: ['chua_doc', 'da_doc'] })
  @ApiQuery({ name: 'fromDate', required: false, description: 'Từ ngày (YYYY-MM-DD)', example: '2024-01-01' })
  @ApiQuery({ name: 'toDate', required: false, description: 'Đến ngày (YYYY-MM-DD)', example: '2024-01-31' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang', example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Tìm kiếm thành công',
    schema: {
      example: {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
        searchInfo: {
          keyword: "họp đại hội",
          trangThai: "chua_doc",
          fromDate: "2024-01-01",
          toDate: "2024-01-31"
        }
      }
    }
  })
  async searchNotifications(
    @Request() req,
    @Query('keyword') keyword?: string,
    @Query('trangThai') trangThai?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const searchParams = {
      keyword,
      trangThai,
      fromDate,
      toDate,
      page,
      limit
    };

    const result = await this.thongBaoService.searchUserNotifications(req.user.id, searchParams);

    return {
      ...result,
      searchInfo: {
        keyword,
        trangThai,
        fromDate,
        toDate
      }
    };
  }
}
