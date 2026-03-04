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
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { TrangThaiPheDuyet } from '../../databases/entities/BaoCaoDoanSoTheoKy.entity';
import { ElasticSearchDto } from '../../elastic/dto/elastic.dto';
import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { ZaloAuthGuard } from '../auth/guards/zalo-auth.guard';
import { BaoCaoDoanSoNotificationService } from './bao-cao-doan-so-notification.service';
import { BaoCaoDoanSoTheoKyService } from './bao-cao-doan-so-theo-ky.service';
import {
  BaoCaoDoanSoResponseDto,
  CauHinhBaoCaoThuongKyDto,
  GuiThongBaoBaoCaoDoanSoDto,
  LayDanhSachBaoCaoDoanSoDto,
  TaoBaoCaoDoanSoDotXuatDto,
  ThongBaoResponseDto
} from './dto/bao-cao-doan-so-notification.dto';
import {
  BaoCaoDoanSoTheoKyDetailDto,
  CreateBaoCaoDoanSoTheoKyDto,
  ListBaoCaoDoanSoTheoKyDto,
  ThongKeBaoCaoQueryDto,
  ThongKeBaoCaoResponseDto,
  ThongKeBaoCaoTheoKyDto,
  ThongKeDoanSoTheoKyDto,
  TrackingBaoCaoQueryDto,
  UpdateBaoCaoDoanSoTheoKyDto,
  UpdateTrangThaiDto,
} from './dto/bao-cao-doan-so-theo-ky.dto';
import { ScheduleNotificationService } from './schedule-notification.service';

@ApiTags('Báo cáo đoàn số theo kỳ')
@Controller('bao-cao-doan-so-theo-ky')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class BaoCaoDoanSoTheoKyController {
  constructor(
    private readonly baoCaoDoanSoTheoKyService: BaoCaoDoanSoTheoKyService,
    private readonly notificationService: BaoCaoDoanSoNotificationService,
    private readonly scheduleNotificationService: ScheduleNotificationService
  ) { }

  @Post()
  @ApiOperation({ summary: 'Tạo báo cáo đoàn số theo kỳ mới' })
  @ApiResponse({ status: 201, description: 'Tạo báo cáo thành công', type: BaoCaoDoanSoTheoKyDetailDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thời gian cập nhật/người báo cáo/tổ chức' })
  @ApiResponse({ status: 409, description: 'Tổ chức đã có báo cáo trong kỳ này' })
  async create(@Req() req, @Body() createBaoCaoDoanSoTheoKyDto: CreateBaoCaoDoanSoTheoKyDto) {
    return await this.baoCaoDoanSoTheoKyService.create(req.user.id, createBaoCaoDoanSoTheoKyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách báo cáo đoàn số theo kỳ có phân trang để phê duyệt' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm tổng quát' })
  @ApiQuery({ name: 'tenBaoCao', required: false, description: 'Tìm kiếm theo tên báo cáo' })
  @ApiQuery({ name: 'trangThaiPheDuyet', required: false, enum: TrangThaiPheDuyet, description: 'Lọc theo trạng thái phê duyệt' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Lọc theo ID tổ chức' })
  @ApiQuery({ name: 'thoiGianCapNhatDoanSoId', required: false, description: 'Lọc theo ID thời gian cập nhật đoàn số' })
  @ApiQuery({ name: 'thang', required: false, description: 'Lọc theo tháng (1-12)' })
  @ApiQuery({ name: 'quy', required: false, description: 'Lọc theo quý (1-4)' })
  @ApiQuery({ name: 'nam', required: false, description: 'Lọc theo năm (VD: 2024, 2025)' })
  async findAll(@Req() req, @Query() query: ListBaoCaoDoanSoTheoKyDto) {
    return await this.baoCaoDoanSoTheoKyService.findAllDePheDuyet(req.user.id, query);
  }

  @Get('chi-tiet/:id')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo đoàn số theo kỳ' })
  @ApiResponse({ status: 200, description: 'Lấy chi tiết thành công', type: BaoCaoDoanSoTheoKyDetailDto })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.baoCaoDoanSoTheoKyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật báo cáo đoàn số theo kỳ' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công', type: BaoCaoDoanSoTheoKyDetailDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ hoặc báo cáo đã được phê duyệt' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBaoCaoDoanSoTheoKyDto: UpdateBaoCaoDoanSoTheoKyDto,
  ) {
    return await this.baoCaoDoanSoTheoKyService.update(id, updateBaoCaoDoanSoTheoKyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa báo cáo đoàn số theo kỳ' })
  @ApiResponse({ status: 204, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'Không thể xóa báo cáo đã được phê duyệt' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.baoCaoDoanSoTheoKyService.remove(id);
  }

  @Patch(':id/trang-thai')
  @ApiOperation({ summary: 'Cập nhật trạng thái phê duyệt báo cáo đoàn số theo kỳ' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công', type: BaoCaoDoanSoTheoKyDetailDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy báo cáo' })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async updateTrangThai(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrangThaiDto: UpdateTrangThaiDto,
    @Req() req: any,
  ) {
    console.log('req.user', req.user);
    return await this.baoCaoDoanSoTheoKyService.updateTrangThai(id, updateTrangThaiDto, req.user.id);
  }

  // @Get('theo-to-chuc/:organizationId')
  // @ApiOperation({ summary: 'Lấy danh sách báo cáo đoàn số theo tổ chức' })
  // @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [BaoCaoDoanSoTheoKyDetailDto] })
  // @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  // @ApiParam({ name: 'organizationId', description: 'ID của tổ chức' })
  // async findByOrganization(@Param('organizationId', ParseIntPipe) organizationId: number) {
  //   return await this.baoCaoDoanSoTheoKyService.findByOrganization(organizationId);
  // }

  // @Get('theo-thoi-gian/:thoiGianCapNhatDoanSoId')
  // @ApiOperation({ summary: 'Lấy danh sách báo cáo đoàn số theo thời gian cập nhật' })
  // @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [BaoCaoDoanSoTheoKyDetailDto] })
  // @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  // @ApiParam({ name: 'thoiGianCapNhatDoanSoId', description: 'ID của thời gian cập nhật đoàn số' })
  // async findByThoiGianCapNhat(@Param('thoiGianCapNhatDoanSoId', ParseIntPipe) thoiGianCapNhatDoanSoId: number) {
  //   return await this.baoCaoDoanSoTheoKyService.findByThoiGianCapNhat(thoiGianCapNhatDoanSoId);
  // }

  // @Get('theo-trang-thai/:trangThaiPheDuyet')
  // @ApiOperation({ summary: 'Lấy danh sách báo cáo đoàn số theo trạng thái phê duyệt' })
  // @ApiResponse({ status: 200, description: 'Lấy danh sách thành công', type: [BaoCaoDoanSoTheoKyDetailDto] })
  // @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  // @ApiParam({ name: 'trangThaiPheDuyet', enum: TrangThaiPheDuyet, description: 'Trạng thái phê duyệt' })
  // async findByTrangThai(@Param('trangThaiPheDuyet') trangThaiPheDuyet: TrangThaiPheDuyet) {
  //   return await this.baoCaoDoanSoTheoKyService.findByTrangThai(trangThaiPheDuyet);
  // }

  // @Get('thong-ke-theo-ky/:thoiGianCapNhatDoanSoId')
  // @ApiOperation({ summary: 'Lấy thống kê đoàn số theo kỳ cập nhật' })
  // @ApiResponse({ status: 200, description: 'Lấy thống kê thành công', type: ThongKeDoanSoTheoKyDto })
  // @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  // @ApiParam({ name: 'thoiGianCapNhatDoanSoId', description: 'ID của thời gian cập nhật đoàn số' })
  // async getThongKeTheoKy(@Param('thoiGianCapNhatDoanSoId', ParseIntPipe) thoiGianCapNhatDoanSoId: number) {
  //   return await this.baoCaoDoanSoTheoKyService.getThongKeTheoKy(thoiGianCapNhatDoanSoId);
  // }

  // ===================== NOTIFICATION SCHEDULE ENDPOINTS =====================

  @Get('notification-schedule/:periodId')
  @ApiOperation({ summary: 'Lấy cấu hình lịch thông báo của period' })
  @ApiResponse({ status: 200, description: 'Lấy cấu hình thành công' })
  @ApiParam({ name: 'periodId', description: 'ID của thời gian cập nhật đoàn số' })
  async getNotificationSchedule(@Param('periodId', ParseIntPipe) periodId: number) {
    // TODO: Implement get notification schedule
    return {
      success: true,
      message: 'Lấy cấu hình lịch thông báo thành công',
      data: {
        periodId,
        notification_schedules: null,
        auto_notification_enabled: false
      }
    };
  }

  @Post('notification-schedule/:periodId')
  @ApiOperation({ summary: 'Cấu hình lịch thông báo cho period' })
  @ApiResponse({ status: 200, description: 'Cấu hình thành công' })
  @ApiParam({ name: 'periodId', description: 'ID của thời gian cập nhật đoàn số' })
  async updateNotificationSchedule(
    @Param('periodId', ParseIntPipe) periodId: number,
    @Body() schedules: any
  ) {
    // TODO: Implement update notification schedule  
    return {
      success: true,
      message: 'Cập nhật lịch thông báo thành công',
      data: { periodId, schedules }
    };
  }

  @Post('notification-schedule/:periodId/toggle')
  @ApiOperation({ summary: 'Bật/tắt thông báo tự động cho period' })
  @ApiResponse({ status: 200, description: 'Cập nhật trạng thái thành công' })
  @ApiParam({ name: 'periodId', description: 'ID của thời gian cập nhật đoàn số' })
  async toggleAutoNotification(
    @Param('periodId', ParseIntPipe) periodId: number,
    @Body() body: { enabled: boolean }
  ) {
    // TODO: Implement toggle auto notification
    return {
      success: true,
      message: `${body.enabled ? 'Bật' : 'Tắt'} thông báo tự động thành công`,
      data: { periodId, enabled: body.enabled }
    };
  }

  @Post('notification-schedule/:periodId/test')
  @ApiOperation({ summary: 'Test gửi thông báo ngay lập tức' })
  @ApiResponse({ status: 200, description: 'Test thông báo thành công' })
  @ApiParam({ name: 'periodId', description: 'ID của thời gian cập nhật đoàn số' })
  async testNotification(@Param('periodId', ParseIntPipe) periodId: number) {
    // TODO: Implement test notification
    return {
      success: true,
      message: `Test thông báo đã được gửi cho period ${periodId}`,
      data: { periodId, sentAt: new Date() }
    };
  }

  // =================== NEW NOTIFICATION ENDPOINTS ===================

  @Post('dot-xuat')
  @ApiOperation({ summary: 'Tạo báo cáo đoàn số đột xuất và gửi thông báo ngay' })
  @ApiResponse({ status: 201, description: 'Tạo báo cáo đột xuất thành công', type: ThongBaoResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async taoBaoCaoDotXuat(@Body() dto: TaoBaoCaoDoanSoDotXuatDto) {
    // Tạo báo cáo đột xuất - chuyển đổi DTO
    const scheduleDto: CauHinhBaoCaoThuongKyDto = {
      thoiGianCapNhatDoanSoId: 0, // Temporary ID
      enabled: true,
      cronExpression: '0 8 * * *', // Default daily 8AM
      notificationTarget: dto.notificationTarget,
      organizationId: dto.organizationId,
      customMessage: dto.customMessage || `${dto.ten}: ${dto.moTa}`
    };
    return await this.notificationService.taoLichThongBao(scheduleDto);
  }

  @Post('thuong-ky/cau-hinh')
  @ApiOperation({ summary: 'Cấu hình báo cáo thường kỳ với cron job' })
  @ApiResponse({ status: 200, description: 'Cấu hình thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy thời gian cập nhật đoàn số' })
  async cauHinhBaoCaoThuongKy(@Body() dto: CauHinhBaoCaoThuongKyDto) {
    return await this.notificationService.taoLichThongBao(dto);
  }

  @Post('thong-bao/gui')
  @ApiOperation({ summary: 'Gửi thông báo báo cáo đoàn số qua Zalo OA' })
  @ApiResponse({ status: 200, description: 'Gửi thông báo thành công', type: ThongBaoResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async guiThongBao(@Body() dto: GuiThongBaoBaoCaoDoanSoDto) {
    return await this.notificationService.guiThongBaoBaoCaoDoanSo(dto);
  }

  @Get('danh-sach')
  @ApiOperation({ summary: 'Lấy danh sách báo cáo đoàn số với bộ lọc' })
  @ApiResponse({ status: 200, description: 'Danh sách báo cáo', type: [BaoCaoDoanSoResponseDto] })
  @ApiQuery({ name: 'loai', required: false, enum: ['dot_xuat', 'thuong_ky'] })
  @ApiQuery({ name: 'organizationId', required: false, type: Number })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async layDanhSach(@Query() filters: LayDanhSachBaoCaoDoanSoDto) {
    const results = await this.notificationService.layDanhSachBaoCaoDoanSo(filters);
    return {
      success: true,
      message: `Tìm thấy ${results.length} báo cáo`,
      data: results
    };
  }

  @Post('thong-bao/test/:userId')
  @ApiOperation({ summary: 'Test gửi thông báo cho 1 user cụ thể' })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  @ApiParam({ name: 'userId', description: 'ID của user' })
  async testGuiThongBaoUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() body: { message: string }
  ) {
    return await this.notificationService.testGuiThongBao(userId, body.message);
  }

  @Post('schedule/test-cron')
  @ApiOperation({ summary: 'Test chạy cron job kiểm tra thông báo ngay lập tức' })
  @ApiResponse({ status: 200, description: 'Test cron job thành công' })
  async testCronJob() {
    try {
      // Trigger cron job manually for testing
      console.log('🧪 Manually triggering scheduled notification check...');

      // Call the actual cron job method
      await this.scheduleNotificationService.checkAndSendScheduledNotifications();

      return {
        success: true,
        message: 'Cron job test completed successfully. Check server logs for details.',
        note: 'This manually triggered the scheduled notification system.'
      };
    } catch (error) {
      console.error('❌ Error testing cron job:', error);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  // ===================== TRACKING ENDPOINTS =====================

  @Get('tracking/thong-ke')
  @ApiOperation({
    summary: 'Thống kê tổng quan báo cáo theo kỳ',
    description: 'Lấy số liệu thống kê tổng quan: tổng số CĐCS, đã báo cáo, chưa báo cáo, đúng hạn, quá hạn, tỷ lệ %'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    type: ThongKeBaoCaoResponseDto
  })
  @ApiQuery({ name: 'thoiGianCapNhatDoanSoId', required: true, description: 'ID kỳ báo cáo' })
  @ApiQuery({ name: 'cumKhuCnId', required: false, description: 'Lọc theo cụm khu công nghiệp' })
  @ApiQuery({ name: 'xaPhuongId', required: false, description: 'Lọc theo xã phường' })
  @ApiQuery({ name: 'thang', required: false, description: 'Lọc theo tháng (1-12)' })
  @ApiQuery({ name: 'quy', required: false, description: 'Lọc theo quý (1-4)' })
  @ApiQuery({ name: 'nam', required: false, description: 'Lọc theo năm (VD: 2024, 2025)' })
  async thongKeBaoCaoTheoKy(
    @Req() req: any,
    @Query() query: ThongKeBaoCaoQueryDto
  ) {
    return await this.baoCaoDoanSoTheoKyService.getThongKeBaoCaoTheoKy(
      req.user.id,
      query.thoiGianCapNhatDoanSoId,
      query.cumKhuCnId,
      query.xaPhuongId,
      query.thang,
      query.quy,
      query.nam
    );
  }

  @Get('tracking/trang-thai')
  @ApiOperation({
    summary: 'Theo dõi trạng thái báo cáo của các CĐCS trong một kỳ',
    description: 'Lấy danh sách tất cả CĐCS với trạng thái: đã báo cáo, chưa báo cáo, quá hạn, đúng hạn'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: ThongKeBaoCaoTheoKyDto
  })
  @ApiQuery({ name: 'thoiGianCapNhatDoanSoId', required: true, description: 'ID kỳ báo cáo' })
  @ApiQuery({ name: 'trangThaiBaoCao', required: false, description: 'Lọc theo trạng thái: da_bao_cao, chua_bao_cao, qua_han, dung_han' })
  @ApiQuery({ name: 'cumKhuCnId', required: false, description: 'Lọc theo cụm khu công nghiệp' })
  @ApiQuery({ name: 'xaPhuongId', required: false, description: 'Lọc theo xã phường' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm kiếm theo tên CĐCS' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10, tối đa: 100)', type: Number })
  @ApiQuery({ name: 'thang', required: false, description: 'Lọc theo tháng (1-12)' })
  @ApiQuery({ name: 'quy', required: false, description: 'Lọc theo quý (1-4)' })
  @ApiQuery({ name: 'nam', required: false, description: 'Lọc theo năm (VD: 2024, 2025)' })
  async trackingTrangThaiBaoCao(
    @Req() req: any,
    @Query() query: TrackingBaoCaoQueryDto
  ) {
    return await this.baoCaoDoanSoTheoKyService.getOrganizationBaoCaoStatus(req.user.id, query);
  }

  // ===================== ELASTICSEARCH ENDPOINTS =====================

  @Post('syncBaoCao')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đồng bộ tất cả báo cáo vào Elasticsearch' })
  @ApiResponse({ status: 200, description: 'Đồng bộ thành công' })
  async syncBaoCao() {
    return this.baoCaoDoanSoTheoKyService.syncBaoCao();
  }

  @Post('indicesBaoCao')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa và tạo lại Elasticsearch index cho báo cáo' })
  @ApiResponse({ status: 200, description: 'Xóa index thành công' })
  async indicesBaoCao() {
    return this.baoCaoDoanSoTheoKyService.indicesBaoCao();
  }

  @Post('setMaxBaoCao')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đặt max_result_window cho Elasticsearch' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  async setMaxBaoCao() {
    return this.baoCaoDoanSoTheoKyService.setMaxBaoCao();
  }

  @Get('search-bao-cao')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Tìm kiếm báo cáo qua Elasticsearch' })
  @ApiResponse({ status: 200, description: 'Tìm kiếm thành công' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)' })
  async searchBaoCao(@Query() payload: ElasticSearchDto) {
    return this.baoCaoDoanSoTheoKyService.searchBaoCao(payload);
  }

}
