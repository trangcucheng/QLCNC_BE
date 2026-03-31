import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, ToimDanh } from '@prisma/client';

@Injectable()
export class ToimDanhService {
  constructor(private prisma: PrismaService) { }

  async getAllToimDanh(
    params: {
      page?: number;
      pageSize?: number;
      where?: Prisma.ToimDanhWhereInput;
      orderBy?: Prisma.ToimDanhOrderByWithRelationInput;
    } = {},
  ): Promise<{ data: ToimDanh[]; total: number }> {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [data, total] = await Promise.all([
      this.prisma.toimDanh.findMany({
        skip,
        take,
        where,
        orderBy: orderBy || { ngayTao: 'desc' },
      }),
      this.prisma.toimDanh.count({ where }),
    ]);

    return { data, total };
  }

  async getToimDanhById(id: string): Promise<ToimDanh | null> {
    return this.prisma.toimDanh.findUnique({
      where: { id },
      include: {
        vuViecToimDanh: true,
      },
    });
  }

  async createToimDanh(
    data: Prisma.ToimDanhCreateInput,
  ): Promise<ToimDanh> {
    const existing = await this.prisma.toimDanh.findUnique({
      where: { ma: data.ma },
    });

    if (existing) {
      throw new BadRequestException(`Mã tội danh "${data.ma}" đã tồn tại`);
    }

    return this.prisma.toimDanh.create({ data });
  }

  async updateToimDanh(params: {
    where: Prisma.ToimDanhWhereUniqueInput;
    data: Prisma.ToimDanhUpdateInput;
  }): Promise<ToimDanh> {
    const { where, data } = params;

    const existing = await this.prisma.toimDanh.findUnique({ where });
    if (!existing) {
      throw new NotFoundException('Tội danh không tồn tại');
    }

    if (data.ma && data.ma !== existing.ma) {
      const duplicate = await this.prisma.toimDanh.findUnique({
        where: { ma: data.ma as string },
      });
      if (duplicate) {
        throw new BadRequestException(`Mã tội danh "${data.ma}" đã tồn tại`);
      }
    }

    return this.prisma.toimDanh.update({ where, data });
  }

  async deleteToimDanh(
    where: Prisma.ToimDanhWhereUniqueInput,
  ): Promise<ToimDanh> {
    const existing = await this.prisma.toimDanh.findUnique({
      where,
      include: { vuViecToimDanh: true },
    });

    if (!existing) {
      throw new NotFoundException('Tội danh không tồn tại');
    }

    if (existing.vuViecToimDanh.length > 0) {
      throw new BadRequestException(
        'Không thể xóa tội danh đang được sử dụng trong vụ việc',
      );
    }

    return this.prisma.toimDanh.delete({ where });
  }
}
