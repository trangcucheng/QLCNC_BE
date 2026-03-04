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

import {
  CreateXaPhuongDto,
  GetDetailXaPhuongDto,
  ListXaPhuongDto,
  UpdateXaPhuongDto} from './dto/xa-phuong.dto';
import { XaPhuongService } from './xa-phuong.service';

@ApiTags('Xã Phường')
@Controller('xa-phuong')
export class XaPhuongController {
  constructor(private readonly xaPhuongService: XaPhuongService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới xã phường',
    description: 'API tạo mới một xã phường'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo xã phường thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên đã tồn tại'
  })
  async create(@Body(ValidationPipe) createDto: CreateXaPhuongDto) {
    return await this.xaPhuongService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách xã phường có phân trang',
    description: 'API lấy danh sách xã phường với tìm kiếm và phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async findAll(@Query(ValidationPipe) query: ListXaPhuongDto) {
    return await this.xaPhuongService.findAll(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Lấy tất cả xã phường',
    description: 'API lấy tất cả xã phường không phân trang (dùng cho dropdown)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getAll() {
    return await this.xaPhuongService.getAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết xã phường',
    description: 'API lấy thông tin chi tiết một xã phường theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID xã phường' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy xã phường'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.xaPhuongService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin xã phường',
    description: 'API cập nhật thông tin xã phường theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID xã phường' })
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
    description: 'Không tìm thấy xã phường'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateXaPhuongDto
  ) {
    return await this.xaPhuongService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa xã phường',
    description: 'API xóa một xã phường theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID xã phường' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy xã phường'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.xaPhuongService.remove(id);
  }

  @Get('export/excel')
  @ApiOperation({
    summary: 'Xuất Excel danh sách xã phường',
    description: 'Xuất toàn bộ danh sách xã phường (ID và Tên) ra file Excel'
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
    const buffer = await this.xaPhuongService.exportToExcel();

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=danh-sach-xa-phuong-${Date.now()}.xlsx`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  }
}
