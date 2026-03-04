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
  Res,
  ValidationPipe} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { CumKhuCongNghiepService } from './cum-khu-cong-nghiep.service';
import {
  CreateCumKhuCongNghiepDto,
  GetDetailCumKhuCongNghiepDto,
  ListCumKhuCongNghiepDto,
  UpdateCumKhuCongNghiepDto} from './dto/cum-khu-cong-nghiep.dto';

@ApiTags('Cụm Khu Công Nghiệp')
@Controller('cum-khu-cong-nghiep')
export class CumKhuCongNghiepController {
  constructor(private readonly cumKhuCongNghiepService: CumKhuCongNghiepService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới cụm khu công nghiệp',
    description: 'API tạo mới một cụm khu công nghiệp'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo cụm khu công nghiệp thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên đã tồn tại'
  })
  async create(@Body(ValidationPipe) createDto: CreateCumKhuCongNghiepDto) {
    return await this.cumKhuCongNghiepService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách cụm khu công nghiệp có phân trang',
    description: 'API lấy danh sách cụm khu công nghiệp với tìm kiếm và phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async findAll(@Query(ValidationPipe) query: ListCumKhuCongNghiepDto) {
    return await this.cumKhuCongNghiepService.findAll(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Lấy tất cả cụm khu công nghiệp',
    description: 'API lấy tất cả cụm khu công nghiệp không phân trang (dùng cho dropdown)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getAll() {
    return await this.cumKhuCongNghiepService.getAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết cụm khu công nghiệp',
    description: 'API lấy thông tin chi tiết một cụm khu công nghiệp theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID cụm khu công nghiệp' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cụm khu công nghiệp'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.cumKhuCongNghiepService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin cụm khu công nghiệp',
    description: 'API cập nhật thông tin cụm khu công nghiệp theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID cụm khu công nghiệp' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên đã tồn tại'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cụm khu công nghiệp'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateCumKhuCongNghiepDto
  ) {
    return await this.cumKhuCongNghiepService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa cụm khu công nghiệp',
    description: 'API xóa một cụm khu công nghiệp theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID cụm khu công nghiệp' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy cụm khu công nghiệp'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.cumKhuCongNghiepService.remove(id);
  }

  @Get('export/excel')
  @ApiOperation({
    summary: 'Xuất Excel danh sách cụm khu công nghiệp',
    description: 'Xuất toàn bộ danh sách cụm khu công nghiệp (ID và Tên) ra file Excel'
  })
  @ApiResponse({
    status: 200,
    description: 'File Excel được tạo thành công',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async exportToExcel(@Res() res: Response) {
    const buffer = await this.cumKhuCongNghiepService.exportToExcel();

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=danh-sach-cum-khu-cn-${Date.now()}.xlsx`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  }
}
