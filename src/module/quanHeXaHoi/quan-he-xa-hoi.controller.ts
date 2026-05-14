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
  @Permissions('quan-he-xa-hoi:read')
  async getAll(@Query() query: GetAllQuanHeXaHoiDTO) {
    return this.service.getAll({
      page: Number(query.page) || 1,
      pageSize: Number(query.pageSize) || 10,
      orderBy: query.orderBy ? { ngayTao: query.orderBy === 'desc' ? 'desc' : 'asc' } : undefined,
    });
  }

  @Get('/:id')
  @Permissions('quan-he-xa-hoi:read')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('quan-he-xa-hoi:create')
  async create(@Body() dto: CreateQuanHeXaHoiDTO) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Permissions('quan-he-xa-hoi:update')
  async update(@Param('id') id: string, @Body() dto: UpdateQuanHeXaHoiDTO) {
    return this.service.update({ id }, dto);
  }

  @Delete('/:id')
  @Permissions('quan-he-xa-hoi:delete')
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa thành công' };
  }
}
