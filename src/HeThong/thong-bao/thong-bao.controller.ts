import {
  Body,
  Controller,
  Delete,
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
  CreateThongBaoDto,
  ListThongBaoDto,
  SendNotificationDto,
  UpdateThongBaoDto} from './dto/thong-bao.dto';
import { ThongBaoService } from './thong-bao.service';

@ApiTags('Thông Báo')
@Controller('thong-bao')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class ThongBaoController {
  constructor(private readonly thongBaoService: ThongBaoService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới thông báo',
    description: 'API tạo mới một thông báo'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo thông báo thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  async create(@Request() req, @Body(ValidationPipe) createDto: CreateThongBaoDto) {
    return await this.thongBaoService.create(req.user.id, createDto);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gửi thông báo cho danh sách người nhận',
    description: 'API gửi thông báo đã tạo đến danh sách người nhận cụ thể'
  })
  @ApiResponse({
    status: 200,
    description: 'Gửi thông báo thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  @ApiResponse({
    status: 400,
    description: 'Danh sách người nhận không hợp lệ'
  })
  async sendNotification(@Body(ValidationPipe) sendDto: SendNotificationDto) {
    return await this.thongBaoService.sendNotification(sendDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thông báo có phân trang',
    description: 'API lấy danh sách thông báo với tìm kiếm và phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)', type: 'number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)', type: 'number' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo nội dung thông báo, ghi chú hoặc tên người gửi', type: 'string' })
  @ApiQuery({ name: 'nguoiGui', required: false, description: 'Lọc theo ID người gửi', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thông báo thành công'
  })
  async findAll(@Query() query: ListThongBaoDto) {
    return await this.thongBaoService.findAll(query);
  }

  @Get('user/my-notifications')
  @ApiOperation({
    summary: 'Lấy thông báo của user hiện tại',
    description: 'API lấy danh sách thông báo của user đang đăng nhập'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)' })
  async getMyNotifications(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return await this.thongBaoService.getMyNotifications(req.user.id, page, limit);
  }

  @Get('user/unread-count')
  @ApiOperation({
    summary: 'Lấy số lượng thông báo chưa đọc',
    description: 'API lấy số lượng thông báo chưa đọc của user hiện tại'
  })
  async getUnreadCount(@Request() req) {
    return {
      unreadCount: await this.thongBaoService.getUnreadCount(req.user.id)
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết thông báo theo ID',
    description: 'API lấy thông tin chi tiết của một thông báo'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo' })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết thông báo thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.thongBaoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông báo',
    description: 'API cập nhật thông tin thông báo'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo cần cập nhật' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thông báo thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateThongBaoDto
  ) {
    return await this.thongBaoService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xóa thông báo',
    description: 'API xóa một thông báo'
  })
  @ApiParam({ name: 'id', description: 'ID của thông báo cần xóa' })
  @ApiResponse({
    status: 204,
    description: 'Xóa thông báo thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.thongBaoService.remove(id);
  }

  @Post('user/:thongBaoId/mark-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đánh dấu thông báo đã đọc',
    description: 'API đánh dấu một thông báo là đã đọc cho user hiện tại'
  })
  @ApiParam({ name: 'thongBaoId', description: 'ID của thông báo' })
  async markAsRead(@Request() req, @Param('thongBaoId', ParseIntPipe) thongBaoId: number) {
    await this.thongBaoService.markAsRead(req.user.id, thongBaoId);
    return { message: 'Đã đánh dấu thông báo là đã đọc' };
  }

  @Post('user/:thongBaoId/mark-unread')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đánh dấu thông báo chưa đọc',
    description: 'API đánh dấu một thông báo là chưa đọc cho user hiện tại'
  })
  @ApiParam({ name: 'thongBaoId', description: 'ID của thông báo' })
  async markAsUnread(@Request() req, @Param('thongBaoId', ParseIntPipe) thongBaoId: number) {
    await this.thongBaoService.markAsUnread(req.user.id, thongBaoId);
    return { message: 'Đã đánh dấu thông báo là chưa đọc' };
  }
}
