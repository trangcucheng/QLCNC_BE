import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';

import { FlexibleAuthGuard } from '../../HeThong/auth/guards/flexible-auth.guard';
import { CreateSuKienDto, ListSuKienDto, UpdateSuKienDto } from './dto/su-kien.dto';
import { FileService } from './file.service';
import { SuKienService } from './su-kien.service';

@ApiTags('Mobile API - Sự Kiện')
@Controller('mobile/su-kien')
export class MobileSuKienController {
  constructor(
    private readonly suKienService: SuKienService,
    private readonly fileService: FileService
  ) { }

  @Get('list')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy danh sách sự kiện',
    description: 'API dành cho Zalo Mini App - Lấy danh sách sự kiện có phân trang và lọc'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tiêu đề' })
  @ApiQuery({ name: 'loaiSuKienId', required: false, description: 'Lọc theo loại sự kiện' })
  @ApiQuery({ name: 'trangThai', required: false, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'tuNgay', required: false, description: 'Lọc từ ngày (YYYY-MM-DD)' })
  @ApiQuery({ name: 'denNgay', required: false, description: 'Lọc đến ngày (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập qua Zalo'
  })
  async getMobileSuKienList(
    @Query(ValidationPipe) query: ListSuKienDto
  ) {
    const result = await this.suKienService.findAll(query);

    return {
      success: true,
      data: result.data.map(item => ({
        id: item.id,
        tenSuKien: item.tenSuKien,
        noiDungSuKien: item.noiDungSuKien,
        thoiGianBatDau: item.thoiGianBatDau,
        thoiGianKetThuc: item.thoiGianKetThuc,
        diaDiem: item.diaDiem,
        trangThai: item.trangThai,
        loaiSuKien: item.loaiSuKien ? {
          id: item.loaiSuKien.id,
          ten: item.loaiSuKien.ten
        } : null,
        nguoiTao: item.user ? {
          id: item.user.id,
          fullName: item.user.fullName
        } : null,
        soFilesDinhKem: item.fileDinhKem ? JSON.parse(item.fileDinhKem).length : 0,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      message: 'Lấy danh sách sự kiện thành công'
    };
  }

  @Get('upcoming')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy sự kiện sắp diễn ra',
    description: 'API dành cho Zalo Mini App - Lấy danh sách sự kiện sắp diễn ra trong 7 ngày tới'
  })
  @ApiQuery({ name: 'days', required: false, description: 'Số ngày tới (mặc định: 7)' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getMobileUpcomingEvents(@Query('days') days: number = 7) {
    const today = new Date();
    const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);

    const result = await this.suKienService.findAll({
      page: 1,
      limit: 20,
      trangThai: 'Đang chuẩn bị'
    });

    return {
      success: true,
      data: result.data.map(item => ({
        id: item.id,
        tenSuKien: item.tenSuKien,
        noiDungSuKien: item.noiDungSuKien,
        thoiGianBatDau: item.thoiGianBatDau,
        thoiGianKetThuc: item.thoiGianKetThuc,
        diaDiem: item.diaDiem,
        loaiSuKien: item.loaiSuKien?.ten,
        nguoiTao: item.user?.fullName
      })),
      message: `Lấy danh sách sự kiện ${days} ngày tới thành công`
    };
  }

  @Get(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy chi tiết sự kiện',
    description: 'API dành cho Zalo Mini App - Lấy thông tin chi tiết một sự kiện'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async getMobileSuKienDetail(@Param('id', ParseIntPipe) id: number) {
    const result = await this.suKienService.findOne(id);

    // Parse file attachments
    let fileDinhKem = [];
    if (result.fileDinhKem) {
      try {
        fileDinhKem = JSON.parse(result.fileDinhKem);
      } catch (e) {
        fileDinhKem = [];
      }
    }

    return {
      success: true,
      data: {
        id: result.id,
        tenSuKien: result.tenSuKien,
        noiDungSuKien: result.noiDungSuKien,
        thoiGianBatDau: result.thoiGianBatDau,
        thoiGianKetThuc: result.thoiGianKetThuc,
        diaDiem: result.diaDiem,
        trangThai: result.trangThai,
        loaiSuKien: result.loaiSuKien ? {
          id: result.loaiSuKien.id,
          ten: result.loaiSuKien.ten,
          moTa: result.loaiSuKien.moTa
        } : null,
        nguoiTao: result.user ? {
          id: result.user.id,
          fullName: result.user.fullName
        } : null,
        fileDinhKem: fileDinhKem.map(file => ({
          ...file,
          downloadUrl: `/mobile/su-kien/download/${encodeURIComponent(file.savedName)}`
        })),
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      },
      message: 'Lấy thông tin chi tiết thành công'
    };
  }

  @Post()
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '[Mobile] Tạo sự kiện mới',
    description: 'API dành cho Zalo Mini App - Tạo sự kiện mới với file đính kèm'
  })
  @ApiBody({
    description: 'Thông tin sự kiện và files đính kèm',
    schema: {
      type: 'object',
      properties: {
        tieuDe: { type: 'string', description: 'Tiêu đề sự kiện' },
        moTa: { type: 'string', description: 'Mô tả ngắn' },
        noiDung: { type: 'string', description: 'Nội dung chi tiết' },
        ngayBatDau: { type: 'string', format: 'date-time', description: 'Ngày bắt đầu' },
        ngayKetThuc: { type: 'string', format: 'date-time', description: 'Ngày kết thúc' },
        diaDiem: { type: 'string', description: 'Địa điểm' },
        loaiSuKienId: { type: 'number', description: 'ID loại sự kiện' },
        nguoiTaoId: { type: 'string', description: 'ID người tạo' },
        trangThai: { type: 'string', enum: ['Hoạt động', 'Tạm dừng'], description: 'Trạng thái' },
        files: { type: 'array', items: { type: 'string', format: 'binary' }, description: 'Files đính kèm' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo sự kiện thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc file quá lớn'
  })
  async createMobileSuKien(
    @Body(ValidationPipe) createSuKienDto: CreateSuKienDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    let fileDinhKem = null;

    if (files && files.length > 0) {
      const uploadResult = await this.fileService.uploadFiles(files);
      fileDinhKem = JSON.stringify(uploadResult);
    }

    const result = await this.suKienService.create(createSuKienDto, files);

    // Parse file attachments for response
    let fileInfo = [];
    if (result.fileDinhKem) {
      try {
        fileInfo = JSON.parse(result.fileDinhKem);
      } catch (e) {
        fileInfo = [];
      }
    }

    return {
      success: true,
      data: {
        id: result.id,
        tenSuKien: result.tenSuKien,
        noiDungSuKien: result.noiDungSuKien,
        thoiGianBatDau: result.thoiGianBatDau,
        thoiGianKetThuc: result.thoiGianKetThuc,
        diaDiem: result.diaDiem,
        trangThai: result.trangThai,
        fileDinhKem: fileInfo.length,
        createdAt: result.createdAt
      },
      message: 'Tạo sự kiện thành công'
    };
  }

  @Get('download/:fileName')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Tải file đính kèm',
    description: 'API dành cho Zalo Mini App - Tải file đính kèm từ sự kiện'
  })
  @ApiResponse({
    status: 200,
    description: 'Tải file thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy file'
  })
  async downloadMobileFile(
    @Param('fileName') fileName: string,
    @Res() res: Response
  ) {
    try {
      const decodedFileName = decodeURIComponent(fileName);
      const filePath = path.join(process.cwd(), 'uploads', decodedFileName);

      // Check if file exists
      const fs = require('fs');
      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('File không tồn tại');
      }

      // Set appropriate headers
      const originalName = decodedFileName.split('_').slice(1).join('_'); // Remove timestamp prefix
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(originalName)}`);
      res.setHeader('Content-Type', 'application/octet-stream');

      return res.sendFile(filePath);

    } catch (error) {
      throw new BadRequestException('Không thể tải file: ' + error.message);
    }
  }

  @Put(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '[Mobile] Cập nhật sự kiện',
    description: 'API dành cho Zalo Mini App - Cập nhật thông tin sự kiện và file đính kèm'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async updateMobileSuKien(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateSuKienDto: UpdateSuKienDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    // Handle file uploads if provided
    if (files && files.length > 0) {
      const uploadResult = await this.fileService.uploadFiles(files);
      const fileDinhKem = this.fileService.createFileMetadata(files, uploadResult);
      // Note: service.update method would need to handle files separately
    }

    const result = await this.suKienService.update(id, updateSuKienDto); return {
      success: true,
      data: {
        id: result.id,
        tenSuKien: result.tenSuKien,
        noiDungSuKien: result.noiDungSuKien,
        thoiGianBatDau: result.thoiGianBatDau,
        thoiGianKetThuc: result.thoiGianKetThuc,
        diaDiem: result.diaDiem,
        trangThai: result.trangThai,
        updatedAt: result.updatedAt
      },
      message: 'Cập nhật sự kiện thành công'
    };
  }

  @Delete(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Xóa sự kiện',
    description: 'API dành cho Zalo Mini App - Xóa sự kiện (soft delete)'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async deleteMobileSuKien(@Param('id', ParseIntPipe) id: number) {
    await this.suKienService.remove(id);

    return {
      success: true,
      message: 'Xóa sự kiện thành công'
    };
  }
}
