import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CauHinhHeThongService } from './cau-hinh-he-thong.service';
import { CreateCauHinhDTO } from './dto/create-cau-hinh.dto';
import { UpdateCauHinhDTO } from './dto/update-cau-hinh.dto';
import { UpdateMultipleCauHinhDTO } from './dto/update-multiple-cau-hinh.dto';
import { Permissions } from 'src/decorator/permissions.decorator';

@ApiBearerAuth('access-token')
@ApiTags('Cấu hình hệ thống')
@Controller('cau-hinh')
export class CauHinhHeThongController {
  constructor(private service: CauHinhHeThongService) { }

  @Get('/list-all')
  @Permissions('VIEW_CAU_HINH')
  @ApiOperation({ summary: 'Lấy danh sách tất cả cấu hình' })
  async getAll() {
    const data = await this.service.getAll();
    return { data, total: data.length };
  }

  @Get('/as-object')
  @Permissions('VIEW_CAU_HINH')
  @ApiOperation({ summary: 'Lấy cấu hình dạng object (key-value)' })
  async getAllAsObject() {
    return this.service.getAllAsObject();
  }

  @Get('/by-key/:khoa')
  @Permissions('VIEW_CAU_HINH')
  @ApiOperation({ summary: 'Lấy cấu hình theo khóa' })
  async getByKey(@Param('khoa') khoa: string) {
    return this.service.getByKey(khoa);
  }

  @Get('/:id')
  @Permissions('VIEW_CAU_HINH')
  @ApiOperation({ summary: 'Lấy cấu hình theo ID' })
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('CREATE_CAU_HINH')
  @ApiOperation({ summary: 'Tạo cấu hình mới' })
  async create(@Body() dto: CreateCauHinhDTO) {
    return this.service.create(dto);
  }

  @Post('/initialize')
  @Permissions('CREATE_CAU_HINH')
  @ApiOperation({ summary: 'Khởi tạo cấu hình mặc định' })
  async initializeDefaults() {
    return this.service.initializeDefaults();
  }

  @Put('/update-multiple')
  @Permissions('UPDATE_CAU_HINH')
  @ApiOperation({ summary: 'Cập nhật nhiều cấu hình cùng lúc' })
  async updateMultiple(@Body() dto: UpdateMultipleCauHinhDTO) {
    return this.service.updateMultiple(dto);
  }

  @Put('/:id')
  @Permissions('UPDATE_CAU_HINH')
  @ApiOperation({ summary: 'Cập nhật cấu hình theo ID' })
  async update(@Param('id') id: string, @Body() dto: UpdateCauHinhDTO) {
    return this.service.update({ id }, dto);
  }

  @Delete('/:id')
  @Permissions('DELETE_CAU_HINH')
  @ApiOperation({ summary: 'Xóa cấu hình' })
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa cấu hình thành công' };
  }
}
