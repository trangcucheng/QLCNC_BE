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
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { TrangThaiPheDuyet } from '../../databases/entities/BaoCaoDoanSoTheoKy.entity';
import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { BaoCaoDoanSoTheoKyService } from './bao-cao-doan-so-theo-ky.service';
import {
  BaoCaoDoanSoTheoKyDetailDto,
  CreateBaoCaoDoanSoTheoKyDto,
  ListBaoCaoDoanSoTheoKyDto,
  UpdateBaoCaoDoanSoTheoKyDto,
  UpdateTrangThaiDto
} from './dto/bao-cao-doan-so-theo-ky.dto';

@ApiTags('Zalo Mini App - Báo Cáo Đoàn Số Theo Kỳ')
@Controller('zalo/bao-cao-doan-so-theo-ky')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class ZaloBaoCaoDoanSoTheoKyController {
  constructor(private readonly baoCaoDoanSoTheoKyService: BaoCaoDoanSoTheoKyService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '[Zalo] Tạo mới báo cáo đoàn số theo kỳ',
    description: 'API tạo mới báo cáo đoàn số theo kỳ từ Zalo Mini App'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo báo cáo thành công',
    type: BaoCaoDoanSoTheoKyDetailDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc báo cáo đã tồn tại'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  async create(
    @Request() req,
    @Body(ValidationPipe) createDto: CreateBaoCaoDoanSoTheoKyDto,
  ) {
    return await this.baoCaoDoanSoTheoKyService.create(req.user.id, createDto);
  }

  @Get()
  @ApiOperation({
    summary: '[Zalo] Lấy danh sách báo cáo đoàn số theo kỳ có phân trang',
    description: 'API lấy danh sách báo cáo đoàn số theo kỳ với phân trang và bộ lọc cho Zalo Mini App'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'tenBaoCao', required: false, description: 'Tên báo cáo' })
  @ApiQuery({ name: 'trangThaiPheDuyet', required: false, enum: TrangThaiPheDuyet, description: 'Lọc theo trạng thái phê duyệt' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'ID tổ chức (tự động lấy từ user nếu không truyền)' })
  @ApiQuery({ name: 'thoiGianCapNhatDoanSoId', required: false, description: 'ID thời gian cập nhật đoàn số' })
  async findAll(@Request() req, @Query() query: ListBaoCaoDoanSoTheoKyDto) {
    // Tự động filter theo organization của user nếu không có quyền admin
    if (!query.organizationId && req.user.organizationId) {
      query.organizationId = req.user.organizationId;
    }

    return await this.baoCaoDoanSoTheoKyService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: '[Zalo] Lấy chi tiết báo cáo đoàn số theo kỳ theo ID',
    description: 'API lấy thông tin chi tiết của một báo cáo đoàn số theo kỳ'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy chi tiết thành công',
    type: BaoCaoDoanSoTheoKyDetailDto
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy báo cáo'
  })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.baoCaoDoanSoTheoKyService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: '[Zalo] Cập nhật báo cáo đoàn số theo kỳ',
    description: 'API cập nhật thông tin báo cáo đoàn số theo kỳ từ Zalo Mini App'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công',
    type: BaoCaoDoanSoTheoKyDetailDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc báo cáo đã được phê duyệt'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy báo cáo'
  })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateBaoCaoDoanSoTheoKyDto,
  ) {
    return await this.baoCaoDoanSoTheoKyService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: '[Zalo] Xóa báo cáo đoàn số theo kỳ',
    description: 'API xóa báo cáo đoàn số theo kỳ từ Zalo Mini App'
  })
  @ApiResponse({
    status: 204,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Không thể xóa báo cáo đã được phê duyệt'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy báo cáo'
  })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.baoCaoDoanSoTheoKyService.remove(id);
  }

  @Patch(':id/trang-thai')
  @ApiOperation({
    summary: '[Zalo] Cập nhật trạng thái phê duyệt báo cáo đoàn số theo kỳ',
    description: 'API cập nhật trạng thái phê duyệt (chỉ dành cho admin/manager)'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái thành công',
    type: BaoCaoDoanSoTheoKyDetailDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa xác thực Zalo'
  })
  @ApiResponse({
    status: 403,
    description: 'Không có quyền phê duyệt'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy báo cáo'
  })
  @ApiParam({ name: 'id', description: 'ID của báo cáo đoàn số theo kỳ' })
  async updateTrangThai(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrangThaiDto: UpdateTrangThaiDto,
    @Request() req,
  ) {
    return await this.baoCaoDoanSoTheoKyService.updateTrangThai(
      id,
      updateTrangThaiDto,
      req.user.id
    );
  }

  // API bổ sung cho Zalo Mini App

  @Get('my-organization/reports')
  @ApiOperation({
    summary: '[Zalo] Lấy báo cáo của tổ chức tôi',
    description: 'API lấy danh sách báo cáo của tổ chức mà user đang thuộc về'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'trangThaiPheDuyet', required: false, enum: TrangThaiPheDuyet })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách báo cáo thành công',
    schema: {
      example: {
        data: [
          {
            id: 1,
            tenBaoCao: "Báo cáo Q1/2024",
            trangThaiPheDuyet: "da_phe_duyet",
            soLuongDoanVienNam: 50,
            soLuongDoanVienNu: 30,
            organization: {
              id: 1,
              ten: "Công đoàn ABC"
            },
            createdAt: "2024-01-01T00:00:00.000Z"
          }
        ],
        total: 5,
        page: 1,
        limit: 10,
        totalPages: 1
      }
    }
  })
  async getMyOrganizationReports(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('trangThaiPheDuyet') trangThaiPheDuyet?: TrangThaiPheDuyet
  ) {
    const query: ListBaoCaoDoanSoTheoKyDto = {
      page,
      limit,
      organizationId: req.user.organizationId,
      trangThaiPheDuyet
    };

    return await this.baoCaoDoanSoTheoKyService.findAll(query);
  }

  @Get('stats/dashboard')
  @ApiOperation({
    summary: '[Zalo] Thống kê dashboard báo cáo',
    description: 'API lấy thống kê tổng quan cho dashboard Zalo Mini App'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    schema: {
      example: {
        organizationInfo: {
          id: 1,
          ten: "Công đoàn ABC",
          soLuongDoanVien: 80
        },
        reportStats: {
          total: 12,
          pending: 2,
          approved: 8,
          rejected: 2
        },
        currentPeriod: {
          id: 1,
          kyBaoCao: "Q4/2024",
          hasReport: true,
          reportStatus: "cho_phe_duyet"
        },
        recentActivities: [
          {
            action: "Tạo báo cáo",
            reportName: "Báo cáo Q4/2024",
            timestamp: "2024-10-01T00:00:00.000Z"
          }
        ]
      }
    }
  })
  async getDashboardStats(@Request() req) {
    // TODO: Implement dashboard statistics
    return {
      organizationInfo: {
        id: req.user.organizationId,
        ten: "Tổ chức của bạn",
        soLuongDoanVien: 0
      },
      reportStats: {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
      },
      currentPeriod: {
        id: null,
        kyBaoCao: "Q4/2024",
        hasReport: false,
        reportStatus: null
      },
      recentActivities: []
    };
  }

  @Get('periods/current')
  @ApiOperation({
    summary: '[Zalo] Lấy kỳ báo cáo hiện tại',
    description: 'API lấy thông tin kỳ báo cáo hiện tại có thể tạo'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin kỳ báo cáo hiện tại thành công',
    schema: {
      example: {
        id: 1,
        kyBaoCao: "Q4/2024",
        batDau: "2024-10-01T00:00:00.000Z",
        ketThuc: "2024-12-31T23:59:59.000Z",
        hanNop: "2025-01-15T23:59:59.000Z",
        canCreateReport: true,
        hasExistingReport: false,
        existingReportId: null
      }
    }
  })
  async getCurrentPeriod(@Request() req) {
    // TODO: Implement logic to get current period
    return {
      id: 1,
      kyBaoCao: "Q4/2024",
      batDau: "2024-10-01T00:00:00.000Z",
      ketThuc: "2024-12-31T23:59:59.000Z",
      hanNop: "2025-01-15T23:59:59.000Z",
      canCreateReport: true,
      hasExistingReport: false,
      existingReportId: null
    };
  }

  @Get(':id/approval-history')
  @ApiOperation({
    summary: '[Zalo] Lấy lịch sử phê duyệt báo cáo',
    description: 'API lấy lịch sử thay đổi trạng thái phê duyệt của báo cáo'
  })
  @ApiParam({ name: 'id', description: 'ID của báo cáo' })
  @ApiResponse({
    status: 200,
    description: 'Lấy lịch sử phê duyệt thành công',
    schema: {
      example: {
        reportId: 1,
        reportName: "Báo cáo Q1/2024",
        currentStatus: "da_phe_duyet",
        history: [
          {
            status: "cho_phe_duyet",
            statusText: "Chờ phê duyệt",
            timestamp: "2024-01-01T00:00:00.000Z",
            note: "Báo cáo được tạo",
            actor: "Nguyễn Văn A"
          },
          {
            status: "da_phe_duyet",
            statusText: "Đã phê duyệt",
            timestamp: "2024-01-02T08:30:00.000Z",
            note: "Báo cáo chính xác, số liệu hợp lý",
            actor: "Admin System"
          }
        ]
      }
    }
  })
  async getApprovalHistory(@Param('id', ParseIntPipe) id: number) {
    const report = await this.baoCaoDoanSoTheoKyService.findOne(id);

    const statusTextMap = {
      [TrangThaiPheDuyet.CHO_PHE_DUYET]: "Chờ phê duyệt",
      [TrangThaiPheDuyet.DA_PHE_DUYET]: "Đã phê duyệt",
      [TrangThaiPheDuyet.TU_CHOI]: "Bị từ chối"
    };

    return {
      reportId: id,
      reportName: report.tenBaoCao,
      currentStatus: report.trangThaiPheDuyet,
      history: [
        {
          status: TrangThaiPheDuyet.CHO_PHE_DUYET,
          statusText: statusTextMap[TrangThaiPheDuyet.CHO_PHE_DUYET],
          timestamp: report.createdAt,
          note: "Báo cáo được tạo",
          actor: "Người tạo báo cáo"
        },
        // Add approval/rejection history if status changed
        ...(report.trangThaiPheDuyet !== TrangThaiPheDuyet.CHO_PHE_DUYET ? [{
          status: report.trangThaiPheDuyet,
          statusText: statusTextMap[report.trangThaiPheDuyet],
          timestamp: report.updatedAt,
          note: report.ghiChu || "Cập nhật trạng thái",
          actor: "Hệ thống phê duyệt"
        }] : [])
      ]
    };
  }

  @Post(':id/submit-for-approval')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Zalo] Nộp báo cáo để phê duyệt',
    description: 'API nộp báo cáo để chờ phê duyệt (đặt lại trạng thái chờ phê duyệt)'
  })
  @ApiParam({ name: 'id', description: 'ID của báo cáo' })
  @ApiResponse({
    status: 200,
    description: 'Nộp báo cáo thành công',
    schema: {
      example: {
        success: true,
        message: "Báo cáo đã được nộp để chờ phê duyệt",
        reportId: 1,
        newStatus: "cho_phe_duyet",
        timestamp: "2024-01-01T00:00:00.000Z"
      }
    }
  })
  async submitForApproval(@Request() req, @Param('id', ParseIntPipe) id: number) {
    await this.baoCaoDoanSoTheoKyService.updateTrangThai(
      id,
      {
        trangThaiPheDuyet: TrangThaiPheDuyet.CHO_PHE_DUYET,
        ghiChu: 'Báo cáo được nộp lại để chờ phê duyệt'
      },
      req.user.id
    );

    return {
      success: true,
      message: "Báo cáo đã được nộp để chờ phê duyệt",
      reportId: id,
      newStatus: TrangThaiPheDuyet.CHO_PHE_DUYET,
      timestamp: new Date().toISOString()
    };
  }
}
