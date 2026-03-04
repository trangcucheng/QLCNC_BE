import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import {
  CreateThoiGianCapNhatDoanSoDto,
  GetCurrentKyBaoCaoDto,
  GetDetailThoiGianCapNhatDoanSoDto,
  GetKyBaoCaoQueryDto,
  ListThoiGianCapNhatDoanSoDto,
  UpdateThoiGianCapNhatDoanSoDto
} from './dto/thoi-gian-cap-nhat-doan-so.dto';
import { ThoiGianCapNhatDoanSoService } from './thoi-gian-cap-nhat-doan-so.service';
import { ThoiGianCapNhatDoanSoCronService } from './thoi-gian-cap-nhat-doan-so-cron.service';

@ApiTags('Thời gian cập nhật đoàn số')
@Controller('thoi-gian-cap-nhat-doan-so')
export class ThoiGianCapNhatDoanSoController {
  constructor(
    private readonly thoiGianCapNhatDoanSoService: ThoiGianCapNhatDoanSoService,
    private readonly cronService: ThoiGianCapNhatDoanSoCronService,
  ) { }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('create')
  @ApiOperation({ summary: 'Tạo mới thời gian cập nhật đoàn số' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) input: CreateThoiGianCapNhatDoanSoDto) {
    return await this.thoiGianCapNhatDoanSoService.create(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put('update')
  @ApiOperation({ summary: 'Cập nhật thời gian cập nhật đoàn số' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy hoặc dữ liệu không hợp lệ' })
  @HttpCode(HttpStatus.OK)
  async update(@Body(ValidationPipe) input: UpdateThoiGianCapNhatDoanSoDto) {
    return await this.thoiGianCapNhatDoanSoService.update(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Delete('delete')
  @ApiOperation({ summary: 'Xóa thời gian cập nhật đoàn số' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  @HttpCode(HttpStatus.OK)
  async delete(@Query(ValidationPipe) input: GetDetailThoiGianCapNhatDoanSoDto) {
    return await this.thoiGianCapNhatDoanSoService.delete(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('detail')
  @ApiOperation({ summary: 'Lấy chi tiết thời gian cập nhật đoàn số' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy' })
  @HttpCode(HttpStatus.OK)
  async getDetail(@Query(ValidationPipe) input: GetDetailThoiGianCapNhatDoanSoDto) {
    return await this.thoiGianCapNhatDoanSoService.getDetail(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list')
  @ApiOperation({ summary: 'Lấy danh sách thời gian cập nhật đoàn số có phân trang' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @HttpCode(HttpStatus.OK)
  async getList(@Query(ValidationPipe) input: ListThoiGianCapNhatDoanSoDto) {
    return await this.thoiGianCapNhatDoanSoService.getList(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({ summary: 'Lấy tất cả thời gian cập nhật đoàn số (không phân trang)' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @HttpCode(HttpStatus.OK)
  async getAll() {
    return await this.thoiGianCapNhatDoanSoService.getAll();
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('check-update-period')
  @ApiOperation({ summary: 'Kiểm tra có đang trong thời gian cập nhật đoàn số không' })
  @ApiResponse({ status: 200, description: 'Kiểm tra thành công' })
  @HttpCode(HttpStatus.OK)
  async checkUpdatePeriod() {
    return await this.thoiGianCapNhatDoanSoService.isInUpdatePeriod();
  }

  @Get('debug-notification/:id')
  @ApiOperation({ summary: 'Debug thông báo cho kỳ báo cáo cụ thể' })
  @ApiResponse({ status: 200, description: 'Debug thành công' })
  @HttpCode(HttpStatus.OK)
  async debugNotification(@Param('id', ParseIntPipe) id: number) {
    return await this.thoiGianCapNhatDoanSoService.debugNotificationForPeriod(id);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('dot-xuat')
  @ApiOperation({ summary: 'Tạo thời gian cập nhật đoàn số đột xuất và gửi thông báo ngay' })
  @ApiResponse({ status: 201, description: 'Tạo đột xuất thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @HttpCode(HttpStatus.CREATED)
  async createDotXuat(@Body(ValidationPipe) input: CreateThoiGianCapNhatDoanSoDto) {
    return await this.thoiGianCapNhatDoanSoService.createDotXuat(input);
  }

  // ===== ENDPOINTS CHO KỲ BÁO CÁO ĐỊNH KỲ =====

  @Get('ky-bao-cao/hien-tai/:id')
  @ApiOperation({
    summary: 'Lấy kỳ báo cáo hiện tại',
    description: 'Lấy thông tin kỳ báo cáo đang diễn ra hoặc sắp tới dựa trên cấu hình định kỳ'
  })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  @HttpCode(HttpStatus.OK)
  async getCurrentKyBaoCao(@Param('id', ParseIntPipe) id: number) {
    return await this.thoiGianCapNhatDoanSoService.getCurrentKyBaoCao(id);
  }

  @Get('ky-bao-cao/theo-nam')
  @ApiOperation({
    summary: 'Lấy tất cả kỳ báo cáo trong một năm',
    description: 'Lấy danh sách các kỳ báo cáo trong năm dựa trên cấu hình định kỳ'
  })
  @ApiQuery({ name: 'thoiGianCapNhatDoanSoId', required: true, description: 'ID cấu hình kỳ báo cáo' })
  @ApiQuery({ name: 'nam', required: false, description: 'Năm cần lấy (mặc định: năm hiện tại)' })
  @ApiResponse({ status: 200, description: 'Lấy thành công' })
  @HttpCode(HttpStatus.OK)
  async getKyBaoCaoTheoNam(@Query(ValidationPipe) query: GetKyBaoCaoQueryDto) {
    return await this.thoiGianCapNhatDoanSoService.getKyBaoCaoTheoNam(
      query.thoiGianCapNhatDoanSoId,
      query.nam
    );
  }

  // ===== TEST CRON JOB =====

  @Get('cron/test-reminder')
  @ApiOperation({
    summary: '🧪 Test cron job gửi thông báo nhắc nhở',
    description: 'Chạy thử cron job để kiểm tra logic gửi thông báo trước 1 ngày'
  })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  @HttpCode(HttpStatus.OK)
  async testCronReminder() {
    return await this.cronService.testSendReminder();
  }
}

