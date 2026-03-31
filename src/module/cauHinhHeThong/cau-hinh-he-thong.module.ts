// CauHinhHeThong Module
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Prisma, CauHinhHeThong } from '@prisma/client';
import { Permissions } from 'src/decorator/permissions.decorator';

// DTOs
export class CreateCauHinhDTO {
  @ApiProperty({ description: 'Khóa cấu hình', example: 'APP_NAME' })
  @IsNotEmpty()
  @IsString()
  khoa: string;

  @ApiProperty({ description: 'Giá trị', example: 'QLCNC System' })
  @IsNotEmpty()
  @IsString()
  giaTri: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;
}

export class UpdateCauHinhDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  giaTri?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;
}

// Service
@Injectable()
export class CauHinhHeThongService {
  constructor(private prisma: PrismaService) { }

  async getAll() {
    return this.prisma.cauHinhHeThong.findMany({
      orderBy: { khoa: 'asc' },
    });
  }

  async getByKey(khoa: string) {
    return this.prisma.cauHinhHeThong.findUnique({ where: { khoa } });
  }

  async getById(id: string) {
    return this.prisma.cauHinhHeThong.findUnique({ where: { id } });
  }

  async create(data: Prisma.CauHinhHeThongCreateInput) {
    const existing = await this.prisma.cauHinhHeThong.findUnique({
      where: { khoa: data.khoa },
    });
    if (existing) {
      throw new BadRequestException(`Khóa cấu hình "${data.khoa}" đã tồn tại`);
    }
    return this.prisma.cauHinhHeThong.create({ data });
  }

  async update(
    where: Prisma.CauHinhHeThongWhereUniqueInput,
    data: Prisma.CauHinhHeThongUpdateInput,
  ) {
    const existing = await this.prisma.cauHinhHeThong.findUnique({ where });
    if (!existing) throw new NotFoundException('Cấu hình không tồn tại');
    return this.prisma.cauHinhHeThong.update({ where, data });
  }

  async delete(where: Prisma.CauHinhHeThongWhereUniqueInput) {
    const existing = await this.prisma.cauHinhHeThong.findUnique({ where });
    if (!existing) throw new NotFoundException('Cấu hình không tồn tại');
    return this.prisma.cauHinhHeThong.delete({ where });
  }
}

// Controller
@ApiBearerAuth('access-token')
@ApiTags('Cấu hình hệ thống')
@Controller('cau-hinh')
export class CauHinhHeThongController {
  constructor(private service: CauHinhHeThongService) { }

  @Get('/list-all')
  @Permissions('VIEW_CAU_HINH')
  async getAll() {
    const data = await this.service.getAll();
    return { data, total: data.length };
  }

  @Get('/by-key/:khoa')
  @Permissions('VIEW_CAU_HINH')
  async getByKey(@Param('khoa') khoa: string) {
    return this.service.getByKey(khoa);
  }

  @Get('/:id')
  @Permissions('VIEW_CAU_HINH')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Post('/create')
  @Permissions('CREATE_CAU_HINH')
  async create(@Body() dto: CreateCauHinhDTO) {
    return this.service.create(dto);
  }

  @Put('/:id')
  @Permissions('UPDATE_CAU_HINH')
  async update(@Param('id') id: string, @Body() dto: UpdateCauHinhDTO) {
    return this.service.update({ id }, dto);
  }

  @Delete('/:id')
  @Permissions('DELETE_CAU_HINH')
  async delete(@Param('id') id: string) {
    await this.service.delete({ id });
    return { status: 'success', message: 'Xóa thành công' };
  }
}

// Module
@Module({
  controllers: [CauHinhHeThongController],
  providers: [PrismaService, CauHinhHeThongService],
  exports: [CauHinhHeThongService],
})
export class CauHinhHeThongModule { }
