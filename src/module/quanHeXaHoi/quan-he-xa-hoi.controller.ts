import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuanHeXaHoiService } from './quan-he-xa-hoi.service';
import { CreateQuanHeXaHoiDTO, UpdateQuanHeXaHoiDTO, GetAllQuanHeXaHoiDTO } from './dto';
import { Permissions } from 'src/decorator/permissions.decorator';

@ApiBearerAuth('access-token')
@ApiTags('Quan hệ xã hội')
@Controller('quan-he-xa-hoi')
export class QuanHeXaHoiController {
  constructor(private service: QuanHeXaHoiService) { }

  @Get('/list-all')
  @Permissions('VIEW_QUAN_HE_XA_HOI')
  async getAll(@Query() query: GetAllQuanHeXaHoiDTO) {
    return this.service.getAll({
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 10,
      orderBy: query.orderBy ? { ngayTao: query.orderBy === 'desc' ? 'desc' : 'asc' } : undefined,
    });
  }

  @Get('/:id')
  @Permissions('VIEW_QUAN_HE_XA_HOI')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('CREATE_QUAN_HE_XA_HOI')
  async create(@Body() dto: CreateQuanHeXaHoiDTO) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Permissions('UPDATE_QUAN_HE_XA_HOI')
  async update(@Param('id') id: string, @Body() dto: UpdateQuanHeXaHoiDTO) {
    return this.service.update({ id }, dto);
  }

  @Delete('/:id')
  @Permissions('DELETE_QUAN_HE_XA_HOI')
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa thành công' };
  }
}
