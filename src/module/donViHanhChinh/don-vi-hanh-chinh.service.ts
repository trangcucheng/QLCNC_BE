import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, DonViHanhChinh } from '@prisma/client';

@Injectable()
export class DonViHanhChinhService {
  constructor(private prisma: PrismaService) { }

  // Lấy tất cả đơn vị hành chính với phân trang và bộ lọc
  async getAllDonViHanhChinh(
    params: {
      page?: number;
      pageSize?: number;
      cap?: number;
      tinhThanhPhoId?: string;
      where?: Prisma.DonViHanhChinhWhereInput;
      orderBy?: Prisma.DonViHanhChinhOrderByWithRelationInput;
    } = {},
  ): Promise<{ data: DonViHanhChinh[]; total: number }> {
    const {
      page = 1,
      pageSize = 10,
      cap,
      tinhThanhPhoId,
      where,
      orderBy
    } = params;

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // Xây dựng điều kiện where
    const whereCondition: Prisma.DonViHanhChinhWhereInput = {
      ...where,
      ...(cap && { cap }),
      ...(tinhThanhPhoId && { tinhThanhPhoId }),
    };

    const [data, total] = await Promise.all([
      this.prisma.donViHanhChinh.findMany({
        skip,
        take,
        where: whereCondition,
        orderBy: orderBy || { ngayTao: 'desc' },
        include: {
          tinhThanhPho: true, // Nếu là Xã/Phường, include Tỉnh/TP cha
        },
      }),
      this.prisma.donViHanhChinh.count({
        where: whereCondition,
      }),
    ]);

    return { data, total };
  }

  // Lấy cây phân cấp đơn vị hành chính (Tỉnh/TP -> Xã/Phường)
  async getTreeDonViHanhChinh(params: {
    page?: number;
    pageSize?: number;
    orderBy?: Prisma.DonViHanhChinhOrderByWithRelationInput;
  }): Promise<any[]> {
    const { page = 1, pageSize = 10, orderBy } = params;
    const skip = (page - 1) * pageSize;

    // Lấy các Tỉnh/Thành phố (cấp 1)
    const tinhThanhPho = await this.prisma.donViHanhChinh.findMany({
      where: { cap: 1 },
      skip,
      take: pageSize,
      orderBy: orderBy || { ngayTao: 'desc' },
    });

    // Lấy Xã/Phường cho mỗi Tỉnh/TP
    const tree = await Promise.all(
      tinhThanhPho.map(async (tinh) => {
        const xaPhuong = await this.prisma.donViHanhChinh.findMany({
          where: {
            cap: 2,
            tinhThanhPhoId: tinh.id,
          },
          orderBy: orderBy || { ngayTao: 'desc' },
        });

        return {
          ...tinh,
          xaPhuong,
        };
      }),
    );

    return tree;
  }

  // Lấy chỉ Tỉnh/Thành phố (cấp 1)
  async getTinhThanhPho(params: {
    page?: number;
    pageSize?: number;
    orderBy?: Prisma.DonViHanhChinhOrderByWithRelationInput;
  }): Promise<{ data: DonViHanhChinh[]; total: number }> {
    const { page = 1, pageSize = 100, orderBy } = params;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.donViHanhChinh.findMany({
        where: { cap: 1 },
        skip,
        take: pageSize,
        orderBy: orderBy || { ten: 'asc' },
      }),
      this.prisma.donViHanhChinh.count({
        where: { cap: 1 },
      }),
    ]);

    return { data, total };
  }

  // Lấy Xã/Phường theo Tỉnh/Thành phố
  async getXaPhuongByTinhThanhPho(
    tinhThanhPhoId: string,
    params: {
      page?: number;
      pageSize?: number;
      orderBy?: Prisma.DonViHanhChinhOrderByWithRelationInput;
    } = {},
  ): Promise<{ data: DonViHanhChinh[]; total: number }> {
    const { page = 1, pageSize = 100, orderBy } = params;
    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.donViHanhChinh.findMany({
        where: {
          cap: 2,
          tinhThanhPhoId,
        },
        skip,
        take: pageSize,
        orderBy: orderBy || { ten: 'asc' },
      }),
      this.prisma.donViHanhChinh.count({
        where: {
          cap: 2,
          tinhThanhPhoId,
        },
      }),
    ]);

    return { data, total };
  }

  // Tạo mới đơn vị hành chính
  async createDonViHanhChinh(
    data: Prisma.DonViHanhChinhCreateInput,
  ): Promise<DonViHanhChinh> {
    // Kiểm tra mã đã tồn tại chưa
    const existing = await this.prisma.donViHanhChinh.findUnique({
      where: { ma: data.ma },
    });

    if (existing) {
      throw new BadRequestException(`Mã đơn vị hành chính "${data.ma}" đã tồn tại`);
    }

    // Kiểm tra logic theo cấp
    if (data.cap === 1 && data.tinhThanhPho) {
      throw new BadRequestException(
        'Tỉnh/Thành phố (cấp 1) không được có Tỉnh/Thành phố cha',
      );
    }

    if (data.cap === 2 && !data.tinhThanhPho) {
      throw new BadRequestException(
        'Xã/Phường (cấp 2) phải thuộc một Tỉnh/Thành phố',
      );
    }

    // Nếu là Xã/Phường, kiểm tra Tỉnh/TP có tồn tại không
    if (data.cap === 2 && data.tinhThanhPho) {
      const connectId = (data.tinhThanhPho as any).connect?.id;
      if (connectId) {
        const tinhThanhPho = await this.prisma.donViHanhChinh.findUnique({
          where: { id: connectId },
        });

        if (!tinhThanhPho) {
          throw new NotFoundException('Tỉnh/Thành phố không tồn tại');
        }

        if (tinhThanhPho.cap !== 1) {
          throw new BadRequestException('Tỉnh/Thành phố phải là cấp 1');
        }
      }
    }

    return this.prisma.donViHanhChinh.create({
      data,
      include: {
        tinhThanhPho: true,
      },
    });
  }

  // Cập nhật đơn vị hành chính
  async updateDonViHanhChinh(params: {
    where: Prisma.DonViHanhChinhWhereUniqueInput;
    data: Prisma.DonViHanhChinhUpdateInput;
  }): Promise<DonViHanhChinh> {
    const { where, data } = params;

    // Kiểm tra tồn tại
    const existing = await this.prisma.donViHanhChinh.findUnique({
      where,
    });

    if (!existing) {
      throw new NotFoundException('Đơn vị hành chính không tồn tại');
    }

    // Kiểm tra mã trùng nếu cập nhật mã
    if (data.ma && data.ma !== existing.ma) {
      const duplicate = await this.prisma.donViHanhChinh.findUnique({
        where: { ma: data.ma as string },
      });

      if (duplicate) {
        throw new BadRequestException(`Mã đơn vị hành chính "${data.ma}" đã tồn tại`);
      }
    }

    return this.prisma.donViHanhChinh.update({
      where,
      data,
      include: {
        tinhThanhPho: true,
      },
    });
  }

  // Xóa đơn vị hành chính
  async deleteDonViHanhChinh(
    where: Prisma.DonViHanhChinhWhereUniqueInput,
  ): Promise<DonViHanhChinh> {
    // Kiểm tra tồn tại
    const existing = await this.prisma.donViHanhChinh.findUnique({
      where,
      include: {
        xaPhuong: true, // Kiểm tra có Xã/Phường con không
      },
    });

    if (!existing) {
      throw new NotFoundException('Đơn vị hành chính không tồn tại');
    }

    // Kiểm tra nếu là Tỉnh/TP và còn Xã/Phường con
    if (existing.cap === 1 && existing.xaPhuong.length > 0) {
      throw new BadRequestException(
        'Không thể xóa Tỉnh/Thành phố còn Xã/Phường con',
      );
    }

    return this.prisma.donViHanhChinh.delete({
      where,
    });
  }

  // Lấy chi tiết một đơn vị hành chính
  async getDonViHanhChinhById(id: string): Promise<DonViHanhChinh | null> {
    return this.prisma.donViHanhChinh.findUnique({
      where: { id },
      include: {
        tinhThanhPho: true,
        xaPhuong: true,
      },
    });
  }
}
