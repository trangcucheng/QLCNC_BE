import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  Delete,
  Put,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Prisma, DonViHanhChinh } from '@prisma/client';
import { DonViHanhChinhService } from './don-vi-hanh-chinh.service';
import { GetAllDonViHanhChinhDTO } from './dto/pagination.dto';
import { CreateDonViHanhChinhDTO } from './dto/create-don-vi-hanh-chinh.dto';
import { UpdateDonViHanhChinhDTO } from './dto/update-don-vi-hanh-chinh.dto';
import { Permissions } from 'src/decorator/permissions.decorator';

@ApiBearerAuth('access-token')
@ApiTags('Đơn vị hành chính')
@Controller('don-vi-hanh-chinh')
export class DonViHanhChinhController {
  constructor(private donViHanhChinhService: DonViHanhChinhService) {}

  @Get('/list-all')
  @Permissions('VIEW_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Lấy danh sách tất cả đơn vị hành chính' })
  async getAllDonViHanhChinh(
    @Query() query: GetAllDonViHanhChinhDTO,
  ): Promise<{ data: DonViHanhChinh[]; total: number }> {
    const { 
      page = '1', 
      pageSize = '10', 
      orderBy,
      cap,
      tinhThanhPhoId,
    } = query;

    let orderByObj: Prisma.DonViHanhChinhOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        ngayTao: orderBy === 'desc' ? 'desc' : 'asc',
      };
    }

    return this.donViHanhChinhService.getAllDonViHanhChinh({
      page: Number(page),
      pageSize: Number(pageSize),
      cap: cap ? Number(cap) : undefined,
      tinhThanhPhoId,
      orderBy: orderByObj,
    });
  }

  @Get('/tree')
  @Permissions('VIEW_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Lấy cây phân cấp đơn vị hành chính (Tỉnh/TP -> Xã/Phường)' })
  async getTreeDonViHanhChinh(
    @Query() query: GetAllDonViHanhChinhDTO,
  ): Promise<any[]> {
    const { page = '1', pageSize = '10', orderBy } = query;

    let orderByObj: Prisma.DonViHanhChinhOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        ngayTao: orderBy === 'desc' ? 'desc' : 'asc',
      };
    }

    return this.donViHanhChinhService.getTreeDonViHanhChinh({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
    });
  }

  @Get('/tinh-thanh-pho')
  @Permissions('VIEW_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Lấy danh sách Tỉnh/Thành phố (cấp 1)' })
  async getTinhThanhPho(
    @Query() query: GetAllDonViHanhChinhDTO,
  ): Promise<{ data: DonViHanhChinh[]; total: number }> {
    const { page = '1', pageSize = '100', orderBy } = query;

    let orderByObj: Prisma.DonViHanhChinhOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        ten: orderBy === 'desc' ? 'desc' : 'asc',
      };
    }

    return this.donViHanhChinhService.getTinhThanhPho({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
    });
  }

  @Get('/xa-phuong/:tinhThanhPhoId')
  @Permissions('VIEW_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Lấy danh sách Xã/Phường theo Tỉnh/Thành phố' })
  async getXaPhuongByTinhThanhPho(
    @Param('tinhThanhPhoId') tinhThanhPhoId: string,
    @Query() query: GetAllDonViHanhChinhDTO,
  ): Promise<{ data: DonViHanhChinh[]; total: number }> {
    const { page = '1', pageSize = '100', orderBy } = query;

    let orderByObj: Prisma.DonViHanhChinhOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        ten: orderBy === 'desc' ? 'desc' : 'asc',
      };
    }

    return this.donViHanhChinhService.getXaPhuongByTinhThanhPho(
      tinhThanhPhoId,
      {
        page: Number(page),
        pageSize: Number(pageSize),
        orderBy: orderByObj,
      },
    );
  }

  @Get('/:id')
  @Permissions('VIEW_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Lấy chi tiết một đơn vị hành chính' })
  async getDonViHanhChinhById(
    @Param('id') id: string,
  ): Promise<DonViHanhChinh> {
    const donVi = await this.donViHanhChinhService.getDonViHanhChinhById(id);
    if (!donVi) {
      throw new NotFoundException('Đơn vị hành chính không tồn tại');
    }
    return donVi;
  }

  @Post('/create')
  @Permissions('CREATE_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Tạo mới đơn vị hành chính' })
  async createDonViHanhChinh(
    @Body() createDTO: CreateDonViHanhChinhDTO,
  ): Promise<DonViHanhChinh> {
    const data: Prisma.DonViHanhChinhCreateInput = {
      ma: createDTO.ma,
      ten: createDTO.ten,
      cap: createDTO.cap,
      loai: createDTO.loai,
      moTa: createDTO.moTa,
      trangThai: createDTO.trangThai ?? true,
      ...(createDTO.tinhThanhPhoId && {
        tinhThanhPho: {
          connect: { id: createDTO.tinhThanhPhoId },
        },
      }),
    };

    return this.donViHanhChinhService.createDonViHanhChinh(data);
  }

  @Put('/:id')
  @Permissions('UPDATE_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Cập nhật đơn vị hành chính' })
  async updateDonViHanhChinh(
    @Param('id') id: string,
    @Body() updateDTO: UpdateDonViHanhChinhDTO,
  ): Promise<DonViHanhChinh> {
    if (!id) {
      throw new BadRequestException('ID đơn vị hành chính là bắt buộc');
    }

    const data: Prisma.DonViHanhChinhUpdateInput = {
      ...(updateDTO.ma && { ma: updateDTO.ma }),
      ...(updateDTO.ten && { ten: updateDTO.ten }),
      ...(updateDTO.cap && { cap: updateDTO.cap }),
      ...(updateDTO.loai && { loai: updateDTO.loai }),
      ...(updateDTO.moTa !== undefined && { moTa: updateDTO.moTa }),
      ...(updateDTO.trangThai !== undefined && { trangThai: updateDTO.trangThai }),
      ...(updateDTO.tinhThanhPhoId && {
        tinhThanhPho: {
          connect: { id: updateDTO.tinhThanhPhoId },
        },
      }),
    };

    return this.donViHanhChinhService.updateDonViHanhChinh({
      where: { id },
      data,
    });
  }

  @Delete('/:id')
  @Permissions('DELETE_DON_VI_HANH_CHINH')
  @ApiOperation({ summary: 'Xóa đơn vị hành chính' })
  async deleteDonViHanhChinh(
    @Param('id') id: string,
  ): Promise<{ status: string; statusCode: number; message: string }> {
    if (!id) {
      throw new BadRequestException('ID đơn vị hành chính là bắt buộc');
    }

    await this.donViHanhChinhService.deleteDonViHanhChinh({ id });

    return {
      status: 'success',
      statusCode: 200,
      message: 'Xóa đơn vị hành chính thành công',
    };
  }
}
