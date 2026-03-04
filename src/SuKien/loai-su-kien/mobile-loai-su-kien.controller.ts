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
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../../HeThong/auth/guards/flexible-auth.guard';
import { CreateLoaiSuKienDto, ListLoaiSuKienDto, UpdateLoaiSuKienDto } from './dto/tao-loai-su-kien.dto';
import { LoaiSuKienService } from './loai-su-kien.service';

@ApiTags('Mobile API - Loại Sự Kiện')
@Controller('mobile/loai-su-kien')
export class MobileLoaiSuKienController {
  constructor(private readonly loaiSuKienService: LoaiSuKienService) { }

  @Get('list')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy danh sách loại sự kiện',
    description: 'API dành cho Zalo Mini App - Lấy danh sách loại sự kiện có phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập qua Zalo'
  })
  async getMobileLoaiSuKienList(
    @Query(ValidationPipe) query: ListLoaiSuKienDto
  ) {
    const result = await this.loaiSuKienService.findAll(query);

    return {
      success: true,
      data: result.data.map(item => ({
        id: item.id,
        ten: item.ten,
        moTa: item.moTa,
        trangThai: item.trangThai,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages
      },
      message: 'Lấy danh sách loại sự kiện thành công'
    };
  }

  @Get('dropdown')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy danh sách loại sự kiện cho dropdown',
    description: 'API dành cho Zalo Mini App - Lấy tất cả loại sự kiện hoạt động (cho dropdown/select)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getMobileLoaiSuKienDropdown() {
    const result = await this.loaiSuKienService.getAll();

    return {
      success: true,
      data: result.map(item => ({
        value: item.id,
        label: item.ten,
        description: item.moTa
      })),
      message: 'Lấy danh sách thành công'
    };
  }

  @Get(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy chi tiết loại sự kiện',
    description: 'API dành cho Zalo Mini App - Lấy thông tin chi tiết một loại sự kiện'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại sự kiện'
  })
  async getMobileLoaiSuKienDetail(@Param('id', ParseIntPipe) id: number) {
    const result = await this.loaiSuKienService.findOne(id);

    return {
      success: true,
      data: {
        id: result.id,
        ten: result.ten,
        moTa: result.moTa,
        trangThai: result.trangThai,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      },
      message: 'Lấy thông tin chi tiết thành công'
    };
  }

  @Post()
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Tạo loại sự kiện mới',
    description: 'API dành cho Zalo Mini App - Tạo loại sự kiện mới'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại sự kiện thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  async createMobileLoaiSuKien(
    @Body(ValidationPipe) createLoaiSuKienDto: CreateLoaiSuKienDto
  ) {
    const result = await this.loaiSuKienService.create(createLoaiSuKienDto);

    return {
      success: true,
      data: {
        id: result.id,
        ten: result.ten,
        moTa: result.moTa,
        trangThai: result.trangThai,
        createdAt: result.createdAt
      },
      message: 'Tạo loại sự kiện thành công'
    };
  }

  @Put(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Cập nhật loại sự kiện',
    description: 'API dành cho Zalo Mini App - Cập nhật thông tin loại sự kiện'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại sự kiện'
  })
  async updateMobileLoaiSuKien(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateLoaiSuKienDto: UpdateLoaiSuKienDto
  ) {
    const result = await this.loaiSuKienService.update(id, updateLoaiSuKienDto);

    return {
      success: true,
      data: {
        id: result.id,
        ten: result.ten,
        moTa: result.moTa,
        trangThai: result.trangThai,
        updatedAt: result.updatedAt
      },
      message: 'Cập nhật loại sự kiện thành công'
    };
  }

  @Delete(':id')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Xóa loại sự kiện',
    description: 'API dành cho Zalo Mini App - Xóa loại sự kiện'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại sự kiện'
  })
  async deleteMobileLoaiSuKien(@Param('id', ParseIntPipe) id: number) {
    await this.loaiSuKienService.remove(id);

    return {
      success: true,
      message: 'Xóa loại sự kiện thành công'
    };
  }
}
