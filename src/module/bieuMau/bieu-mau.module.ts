// BieuMau Module
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString } from 'class-validator';
import { Prisma, BieuMau } from '@prisma/client';
import { Permissions } from 'src/decorator/permissions.decorator';

// DTOs
export class CreateBieuMauDTO {
  @ApiProperty({ description: 'Tên biểu mẫu' })
  @IsNotEmpty()
  @IsString()
  ten: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({ description: 'Đường dẫn file' })
  @IsNotEmpty()
  @IsString()
  duongDan: string;

  @ApiPropertyOptional({ description: 'Phiên bản' })
  @IsOptional()
  @IsString()
  phienBan?: string;
}

export class UpdateBieuMauDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ten?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  duongDan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phienBan?: string;
}

// Service
@Injectable()
export class BieuMauService {
  constructor(private prisma: PrismaService) { }

  async getAll(params: { page?: number; pageSize?: number } = {}) {
    const { page = 1, pageSize = 10 } = params;
    const [data, total] = await Promise.all([
      this.prisma.bieuMau.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { ngayTao: 'desc' },
      }),
      this.prisma.bieuMau.count(),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.bieuMau.findUnique({ where: { id } });
  }

  async create(data: Prisma.BieuMauCreateInput) {
    return this.prisma.bieuMau.create({ data });
  }

  async update(where: Prisma.BieuMauWhereUniqueInput, data: Prisma.BieuMauUpdateInput) {
    const existing = await this.prisma.bieuMau.findUnique({ where });
    if (!existing) throw new NotFoundException('Biểu mẫu không tồn tại');
    return this.prisma.bieuMau.update({ where, data });
  }

  async delete(where: Prisma.BieuMauWhereUniqueInput) {
    const existing = await this.prisma.bieuMau.findUnique({ where });
    if (!existing) throw new NotFoundException('Biểu mẫu không tồn tại');
    return this.prisma.bieuMau.delete({ where });
  }
}

// Controller
@ApiBearerAuth('access-token')
@ApiTags('Biểu mẫu')
@Controller('bieu-mau')
export class BieuMauController {
  constructor(private service: BieuMauService) { }

  @Get('/list-all')
  @Permissions('VIEW_BIEU_MAU')
  async getAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.service.getAll({ page: Number(page) || 1, pageSize: Number(pageSize) || 10 });
  }

  @Get('/:id')
  @Permissions('VIEW_BIEU_MAU')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('CREATE_BIEU_MAU')
  async create(@Body() dto: CreateBieuMauDTO) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Permissions('UPDATE_BIEU_MAU')
  async update(@Param('id') id: string, @Body() dto: UpdateBieuMauDTO) {
    return this.service.update({ id }, dto);
  }

  @Delete('/:id')
  @Permissions('DELETE_BIEU_MAU')
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa thành công' };
  }
}

// Module
@Module({
  controllers: [BieuMauController],
  providers: [PrismaService, BieuMauService],
  exports: [BieuMauService],
})
export class BieuMauModule { }
