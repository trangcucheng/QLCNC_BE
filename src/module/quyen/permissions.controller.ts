import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Quyen, Prisma } from '@prisma/client';
import { PermissionsService } from './permissions.service';
import { GetAllPermissionsDTO } from './dto/pagination.dto';
import { Public } from 'src/decorator/public.decorator';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionService: PermissionsService) { }

  @Public()
  @Get('/list-all-permission')
  async getAllPermissions(
    @Query() query: GetAllPermissionsDTO,
  ): Promise<Quyen[]> {
    const { page = '1', pageSize = '10', orderBy } = query;

    // Xử lý orderBy string (vd: 'ngayTao:desc')
    let orderByObj: Prisma.QuyenOrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        ngayTao: orderBy === 'ngayTao:desc' ? 'desc' : 'asc',
      };
    }

    return this.permissionService.getAllPermissions({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
    });
  }
}
