import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, QuanHeXaHoi } from '@prisma/client';

@Injectable()
export class QuanHeXaHoiService {
  constructor(private prisma: PrismaService) { }

  async getAll(params: { page?: number; pageSize?: number; orderBy?: Prisma.QuanHeXaHoiOrderByWithRelationInput } = {}) {
    const { page = 1, pageSize = 10, orderBy } = params;
    const [data, total] = await Promise.all([
      this.prisma.quanHeXaHoi.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderBy || { ngayTao: 'desc' },
      }),
      this.prisma.quanHeXaHoi.count(),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return this.prisma.quanHeXaHoi.findUnique({ where: { id } });
  }

  async create(data: Prisma.QuanHeXaHoiCreateInput) {
    const existing = await this.prisma.quanHeXaHoi.findUnique({ where: { tenQuanHe: data.tenQuanHe } });
    if (existing) throw new BadRequestException(`Quan hệ "${data.tenQuanHe}" đã tồn tại`);
    return this.prisma.quanHeXaHoi.create({ data });
  }

  async update(where: Prisma.QuanHeXaHoiWhereUniqueInput, data: Prisma.QuanHeXaHoiUpdateInput) {
    const existing = await this.prisma.quanHeXaHoi.findUnique({ where });
    if (!existing) throw new NotFoundException('Quan hệ không tồn tại');
    return this.prisma.quanHeXaHoi.update({ where, data });
  }

  async delete(where: Prisma.QuanHeXaHoiWhereUniqueInput) {
    const existing = await this.prisma.quanHeXaHoi.findUnique({ where, include: { quanHeDoiTuong: true } });
    if (!existing) throw new NotFoundException('Quan hệ không tồn tại');
    if (existing.quanHeDoiTuong.length > 0) {
      throw new BadRequestException('Không thể xóa quan hệ đang được sử dụng');
    }
    return this.prisma.quanHeXaHoi.delete({ where });
  }
}
