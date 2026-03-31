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
import { Prisma, ToimDanh } from '@prisma/client';
import { ToimDanhService } from './toim-danh.service';
import { GetAllToimDanhDTO } from './dto/pagination.dto';
import { CreateToimDanhDTO } from './dto/create-toim-danh.dto';
import { UpdateToimDanhDTO } from './dto/update-toim-danh.dto';
import { Permissions } from 'src/decorator/permissions.decorator';

@ApiBearerAuth('access-token')
@ApiTags('Tội danh')
@Controller('toim-danh')
export class ToimDanhController {
  constructor(private toimDanhService: ToimDanhService) { }

  @Get('/list-all')
  @Permissions('VIEW_TOIM_DANH')
  @ApiOperation({ summary: 'Lấy danh sách tội danh' })
  async getAllToimDanh(
    @Query() query: GetAllToimDanhDTO,
  ): Promise<{ data: ToimDanh[]; total: number }> {
    const { page = '1', pageSize = '10', orderBy } = query;

    let orderByObj: Prisma.ToimDanhOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        ngayTao: orderBy === 'desc' ? 'desc' : 'asc',
      };
    }

    return this.toimDanhService.getAllToimDanh({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
    });
  }

  @Get('/:id')
  @Permissions('VIEW_TOIM_DANH')
  @ApiOperation({ summary: 'Lấy chi tiết tội danh' })
  async getToimDanhById(@Param('id') id: string): Promise<ToimDanh> {
    const toimDanh = await this.toimDanhService.getToimDanhById(id);
    if (!toimDanh) {
      throw new NotFoundException('Tội danh không tồn tại');
    }
    return toimDanh;
  }

  @Post('/create')
  @Permissions('CREATE_TOIM_DANH')
  @ApiOperation({ summary: 'Tạo mới tội danh' })
  async createToimDanh(
    @Body() createDTO: CreateToimDanhDTO,
  ): Promise<ToimDanh> {
    return this.toimDanhService.createToimDanh(createDTO);
  }

  @Put('/:id')
  @Permissions('UPDATE_TOIM_DANH')
  @ApiOperation({ summary: 'Cập nhật tội danh' })
  async updateToimDanh(
    @Param('id') id: string,
    @Body() updateDTO: UpdateToimDanhDTO,
  ): Promise<ToimDanh> {
    if (!id) {
      throw new BadRequestException('ID tội danh là bắt buộc');
    }
    return this.toimDanhService.updateToimDanh({
      where: { id },
      data: updateDTO,
    });
  }

  @Delete('/:id')
  @Permissions('DELETE_TOIM_DANH')
  @ApiOperation({ summary: 'Xóa tội danh' })
  async deleteToimDanh(
    @Param('id') id: string,
  ): Promise<{ status: string; statusCode: number; message: string }> {
    if (!id) {
      throw new BadRequestException('ID tội danh là bắt buộc');
    }
    await this.toimDanhService.deleteToimDanh({ id });
    return {
      status: 'success',
      statusCode: 200,
      message: 'Xóa tội danh thành công',
    };
  }
}
