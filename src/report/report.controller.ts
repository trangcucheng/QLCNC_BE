import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FlexibleAuthGuard } from 'src/HeThong/auth/guards/flexible-auth.guard';

import { ExportBaoCaoCDCSDto } from './dto/export-bao-cao-cdcs.dto';
import { studentsInforDto, taichinhDto, taichinhXTSDto } from './dto/taichinh.dto';
import { ThongKeChiTietDto, ThongKeRequestDto, ThongKeResponseDto } from './dto/thong-ke.dto';
import { ReportService } from './report.service';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private readonly ReportService: ReportService) { }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('demo')
  async generateDemo(@Res() res: Response, @Query() payload: taichinhDto) {
    const templateFile = '/template.xlsx'; // đường dẫn tới file template

    await this.ReportService.generateReportFromTemplate(templateFile, res, payload);
  }

  // ==================== THỐNG KÊ APIs ====================

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-tong-quan')
  @ApiOperation({
    summary: 'Thống kê tổng quan dashboard',
    description: 'API lấy thống kê tổng quan: tổng số công đoàn, đoàn viên, sự kiện trong tháng, báo cáo chờ phê duyệt và tỷ lệ tăng trưởng'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công',
    type: ThongKeResponseDto
  })
  @HttpCode(HttpStatus.OK)
  async getThongKeTongQuan(@Req() req: any, @Query(ValidationPipe) queryDto: ThongKeRequestDto): Promise<ThongKeResponseDto> {
    return await this.ReportService.getThongKeTongQuan(req.user.id, queryDto);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-chi-tiet')
  @ApiOperation({
    summary: 'Thống kê chi tiết',
    description: 'API lấy thống kê chi tiết theo tổ chức, thời gian và trạng thái báo cáo'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê chi tiết thành công',
    type: ThongKeChiTietDto
  })
  @HttpCode(HttpStatus.OK)
  async getThongKeChiTiet(@Query(ValidationPipe) queryDto: ThongKeRequestDto): Promise<ThongKeChiTietDto> {
    return await this.ReportService.getThongKeChiTiet(queryDto);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-doan-vien')
  @ApiOperation({
    summary: 'Thống kê số lượng đoàn viên nam/nữ',
    description: 'API thống kê số lượng đoàn viên nam và nữ theo cụm khu công nghiệp, xã phường và tổ chức của user hiện tại'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê đoàn viên thành công',
    schema: {
      example: {
        success: true,
        message: 'Lấy thống kê đoàn viên thành công',
        data: {
          userInfo: {
            userId: 'user123',
            organizationId: 1,
            cumKhuCongNghiepId: 2,
            xaPhuongId: 3,
            organizationName: 'Công đoàn ABC'
          },
          statistics: {
            soLuongDoanVienNam: 150,
            soLuongDoanVienNu: 120,
            tongSoLuongDoanVien: 270
          },
          filterInfo: {
            cumKhuCongNghiep: 'Cụm KCN Đông Nam',
            xaPhuong: 'Xã Tân Phú',
            organization: 'Công đoàn ABC'
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Không tìm thấy thông tin user hoặc tổ chức'
  })
  @HttpCode(HttpStatus.OK)
  async getThongKeDoanVien(@Req() req: any) {
    return await this.ReportService.getThongKeDoanVien(req.user.id);
  }

  // ==================== XUẤT BÁO CÁO EXCEL ====================

  @Get('download-template')
  @ApiOperation({
    summary: 'Tải xuống file template import Excel',
    description: 'API tải xuống file template_import.xlsx để làm mẫu import dữ liệu công đoàn cơ sở'
  })
  @ApiResponse({
    status: 200,
    description: 'Tải template thành công',
    schema: {
      type: 'string',
      format: 'binary',
      description: 'File template Excel'
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy file template'
  })
  async downloadTemplate(@Res() res: Response): Promise<void> {
    return await this.ReportService.downloadTemplate(res);
  }

  @Get('download-template-import-user')
  @ApiOperation({
    summary: 'Tải xuống file template import user Excel',
    description: 'API tải xuống file importuser.xlsx để làm mẫu import danh sách người dùng'
  })
  @ApiResponse({
    status: 200,
    description: 'Tải template import user thành công',
    schema: {
      type: 'string',
      format: 'binary',
      description: 'File importuser.xlsx'
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy file template'
  })
  async downloadTemplateImportUser(@Res() res: Response): Promise<void> {
    return await this.ReportService.downloadTemplateImportUser(res);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('export-bao-cao-cdcs')
  @ApiOperation({
    summary: 'Xuất báo cáo Excel công đoàn cơ sở',
    description: 'API xuất báo cáo Excel danh sách công đoàn cơ sở. Có thể lọc theo cụm khu công nghiệp hoặc xã phường. Nếu không truyền tham số lọc sẽ xuất tất cả dữ liệu.'
  })
  @ApiResponse({
    status: 200,
    description: 'Xuất báo cáo thành công',
    schema: {
      type: 'string',
      format: 'binary',
      description: 'File Excel được tải xuống'
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Lỗi tham số đầu vào hoặc không tìm thấy dữ liệu'
  })
  async exportBaoCaoCDCS(
    @Query(ValidationPipe) queryDto: ExportBaoCaoCDCSDto,
    @Res() res: Response
  ): Promise<void> {
    return await this.ReportService.exportBaoCaoCDCS(
      queryDto.cumKhuCnId,
      queryDto.ngayThongKe,
      queryDto.xaPhuongId,
      res
    );
  }



}
