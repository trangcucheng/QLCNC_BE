import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Quyen, Prisma } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}
  async getAllPermissions(
    params: {
      page?: number;
      pageSize?: number;
      where?: Prisma.QuyenWhereInput;
      orderBy?: Prisma.QuyenOrderByWithRelationInput;
    } = {},
  ): Promise<Quyen[]> {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    // findMany không hỗ trợ phân trang trực tiếp, nên ta sẽ sử dụng skip và take (tức là không dùng được page và pageSize)
    return await this.prisma.quyen.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        vaiTroQuyen: {
          include: {
            vaiTro: true,
          },
        },
      },
    });
  }
}
