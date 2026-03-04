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
  ValidationPipe} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';

import { ChucVuService } from './chuc-vu.service';
import {
  CreateChucVuDto,
  GetDetailChucVuDto,
  ListChucVuDto,
  UpdateChucVuDto} from './dto/chuc-vu.dto';

@ApiTags('Chức vụ')
@Controller('chuc-vu')
export class ChucVuController {
  constructor(private readonly chucVuService: ChucVuService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới chức vụ',
    description: 'API tạo mới một chức vụ'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo chức vụ thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên đã tồn tại'
  })
  async create(@Body(ValidationPipe) createDto: CreateChucVuDto) {
    return await this.chucVuService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách chức vụ có phân trang',
    description: 'API lấy danh sách chức vụ với tìm kiếm và phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async findAll(@Query(ValidationPipe) query: ListChucVuDto) {
    return await this.chucVuService.findAll(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Lấy tất cả chức vụ',
    description: 'API lấy tất cả chức vụ không phân trang (dùng cho dropdown)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getAll() {
    return await this.chucVuService.getAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết chức vụ',
    description: 'API lấy thông tin chi tiết một chức vụ theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID chức vụ' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy chức vụ'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.chucVuService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin chức vụ',
    description: 'API cập nhật thông tin chức vụ theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID chức vụ' })
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
    description: 'Không tìm thấy chức vụ'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateChucVuDto
  ) {
    return await this.chucVuService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa chức vụ',
    description: 'API xóa một chức vụ theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID chức vụ' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy chức vụ'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.chucVuService.remove(id);
  }
}
