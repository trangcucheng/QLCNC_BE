// ThongBao Module
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Prisma, ThongBao } from '@prisma/client';
import { Permissions } from 'src/decorator/permissions.decorator';

// DTOs
export class CreateThongBaoDTO {
  @ApiProperty({ description: 'Tiêu đề' })
  @IsNotEmpty()
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'Nội dung' })
  @IsNotEmpty()
  @IsString()
  noiDung: string;

  @ApiProperty({ description: 'Loại thông báo' })
  @IsNotEmpty()
  @IsString()
  loaiThongBao: string;

  @ApiPropertyOptional({ description: 'Ưu tiên (1-3)', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  uu_tien?: number;

  @ApiPropertyOptional({ description: 'Trạng thái', default: true })
  @IsOptional()
  @IsBoolean()
  trangThai?: boolean;
}

export class UpdateThongBaoDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tieuDe?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  noiDung?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  loaiThongBao?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  uu_tien?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  trangThai?: boolean;
}

// Service
@Injectable()
export class ThongBaoService {
  constructor(private prisma: PrismaService) {}

  async getAll(params: { page?: number; pageSize?: number; trangThai?: boolean } = {}) {
    const { page = 1, pageSize = 10, trangThai } = params;
    const where = trangThai !== undefined ? { trangThai } : {};
    const [data, total] = await Promise.all([
      this.prisma.thongBao.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: [{ uu_tien: 'desc' }, { ngayTao: 'desc' }],
      }),
      this.prisma.thongBao.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.thongBao.findUnique({ where: { id } });
  }

  async create(data: Prisma.ThongBaoCreateInput) {
    return this.prisma.thongBao.create({ data });
  }

  async update(where: Prisma.ThongBaoWhereUniqueInput, data: Prisma.ThongBaoUpdateInput) {
    const existing = await this.prisma.thongBao.findUnique({ where });
    if (!existing) throw new NotFoundException('Thông báo không tồn tại');
    return this.prisma.thongBao.update({ where, data });
  }

  async delete(where: Prisma.ThongBaoWhereUniqueInput) {
    const existing = await this.prisma.thongBao.findUnique({ where });
    if (!existing) throw new NotFoundException('Thông báo không tồn tại');
    return this.prisma.thongBao.delete({ where });
  }

  async toggleStatus(id: string) {
    const existing = await this.prisma.thongBao.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Thông báo không tồn tại');
    return this.prisma.thongBao.update({
      where: { id },
      data: { trangThai: !existing.trangThai },
    });
  }
}

// Controller
@ApiBearerAuth('access-token')
@ApiTags('Thông báo')
@Controller('thong-bao')
export class ThongBaoController {
  constructor(private service: ThongBaoService) {}

  @Get('/list-all')
  @Permissions('VIEW_THONG_BAO')
  async getAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('trangThai') trangThai?: string,
  ) {
    return this.service.getAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      trangThai: trangThai === 'true' ? true : trangThai === 'false' ? false : undefined,
    });
  }

  @Get('/:id')
  @Permissions('VIEW_THONG_BAO')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('CREATE_THONG_BAO')
  async create(@Body() dto: CreateThongBaoDTO) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Permissions('UPDATE_THONG_BAO')
  async update(@Param('id') id: string, @Body() dto: UpdateThongBaoDTO) {
    return this.service.update({ id }, dto);
  }

  @Patch('/:id/toggle-status')
  @Permissions('UPDATE_THONG_BAO')
  async toggleStatus(@Param('id') id: string) {
    return this.service.toggleStatus(id);
  }

  @Delete('/:id')
  @Permissions('DELETE_THONG_BAO')
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa thành công' };
  }
}

// Module
@Module({
  controllers: [ThongBaoController],
  providers: [PrismaService, ThongBaoService],
  exports: [ThongBaoService],
})
export class ThongBaoModule {}
