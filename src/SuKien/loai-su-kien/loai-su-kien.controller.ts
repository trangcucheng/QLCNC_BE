import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { LoaiSuKienService } from './loai-su-kien.service';
import {
  CreateLoaiSuKienDto,
  UpdateLoaiSuKienDto,
  ListLoaiSuKienDto,
  GetDetailLoaiSuKienDto
} from './dto/tao-loai-su-kien.dto';

@ApiTags('Loại Sự Kiện')
@Controller('loai-su-kien')
export class LoaiSuKienController {
  constructor(private readonly loaiSuKienService: LoaiSuKienService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới loại sự kiện',
    description: 'API tạo mới một loại sự kiện'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo loại sự kiện thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc tên đã tồn tại'
  })
  async create(@Body(ValidationPipe) createDto: CreateLoaiSuKienDto) {
    return await this.loaiSuKienService.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách loại sự kiện có phân trang',
    description: 'API lấy danh sách loại sự kiện với tìm kiếm và phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tên' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async findAll(@Query(ValidationPipe) query: ListLoaiSuKienDto) {
    return await this.loaiSuKienService.findAll(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Lấy tất cả loại sự kiện',
    description: 'API lấy tất cả loại sự kiện không phân trang (dùng cho dropdown)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getAll() {
    return await this.loaiSuKienService.getAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết loại sự kiện',
    description: 'API lấy thông tin chi tiết một loại sự kiện theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID loại sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại sự kiện'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.loaiSuKienService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật thông tin loại sự kiện',
    description: 'API cập nhật thông tin loại sự kiện theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID loại sự kiện' })
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
    description: 'Không tìm thấy loại sự kiện'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateLoaiSuKienDto
  ) {
    return await this.loaiSuKienService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa loại sự kiện',
    description: 'API xóa một loại sự kiện theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID loại sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy loại sự kiện'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.loaiSuKienService.remove(id);
  }
}
