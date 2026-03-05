import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, DonVi, NguoiDung } from '@prisma/client';
import * as XLSX from 'xlsx';

export interface ImportResult {
  row: any;
  status: 'success' | 'failed';
  unitId?: string;
  reason?: string;
}

@Injectable()
export class UnitsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async getAllUnits(
    params: {
      page?: number;
      pageSize?: number;
      where?: Prisma.DonViWhereInput;
      orderBy?: Prisma.DonViOrderByWithRelationInput;
    } = {},
  ): Promise<DonVi[]> {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    // findMany không hỗ trợ phân trang trực tiếp, nên ta sẽ sử dụng skip và take (tức là không dùng được page và pageSize)
    return await this.prisma.donVi.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }

  // Hàm đệ quy để lấy tất cả các đơn vị con
  async getUnitWithChildrenRecursive(
    unitId: string,
    orderBy?: Prisma.DonViOrderByWithRelationInput,
  ): Promise<any> {
    const unit = await this.prisma.donVi.findUnique({
      where: { id: unitId },
    });

    if (!unit) return null;

    const children = await this.prisma.donVi.findMany({
      where: { donViChaId: unitId },
      orderBy,
    });

    const childrenWithSub = await Promise.all(
      children.map(
        async (child) =>
          await this.getUnitWithChildrenRecursive(child.id, orderBy),
      ),
    );

    return { ...unit, children: childrenWithSub };
  }

  async getTreeUnits(params: {
    page?: number;
    pageSize?: number;
    orderBy?: Prisma.DonViOrderByWithRelationInput;
  }): Promise<any[]> {
    const { page = 1, pageSize = 10, orderBy } = params;
    const skip = (page - 1) * pageSize;

    // Lấy các unit root
    const rootUnits = await this.prisma.donVi.findMany({
      where: { donViChaId: null },
      skip,
      take: pageSize,
      orderBy,
    });

    // Lấy children recursive
    const tree = await Promise.all(
      rootUnits.map(
        async (unit) =>
          await this.getUnitWithChildrenRecursive(unit.id, orderBy),
      ),
    );

    return tree;
  }

  async createUnit(data: Prisma.DonViCreateInput): Promise<DonVi> {
    return this.prisma.donVi.create({
      data,
    });
  }

  async updateUnit(params: {
    where: Prisma.DonViWhereUniqueInput;
    data: Prisma.DonViUpdateInput;
  }): Promise<DonVi> {
    const { where, data } = params;
    return this.prisma.donVi.update({
      data,
      where,
    });
  }

  async deleteUnit(where: Prisma.DonViWhereUniqueInput): Promise<DonVi> {
    return this.prisma.donVi.delete({
      where,
    });
  }

  async deleteAllUnitsAndResetId(): Promise<{ status: string }> {
    try {
      // Dùng DELETE để xóa sạch (TRUNCATE không dùng được với UUID)
      await this.prisma.donVi.deleteMany({});

      return { status: 'success' };
    } catch (error) {
      console.error('Error deleting all units and resetting ID:', error);
      throw error;
    }
  }

  async getUnitById(id: string): Promise<DonVi | null> {
    return this.prisma.donVi.findUnique({
      where: { id },
    });
  }

  async importFromExcel(buffer: Buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results: ImportResult[] = [];

    // Insert all units without ParentCode first
    for (const row of data) {
      if (!row.ten || !row.ma) {
        results.push({ row, status: 'failed', reason: 'Missing ten or ma' });
        continue;
      }

      if (!row.MaDonViCha) {
        try {
          const unit = await this.prisma.donVi.create({
            data: {
              ten: row.ten || '',
              ma: row.ma || '',
              moTa: row.moTa || null,
              trangThai: row.trangThai !== false,
              donViChaId: null,
            },
          });
          results.push({ row, status: 'success', unitId: unit.id });
        } catch (err) {
          results.push({ row, status: 'failed', reason: err.message });
        }
      }
    }

    // Insert units with ParentCode
    for (const row of data) {
      if (!row.MaDonViCha) continue;

      const parent = await this.prisma.donVi.findUnique({
        where: { ma: row.MaDonViCha },
      });

      if (!parent) {
        results.push({
          row,
          status: 'failed',
          reason: `Parent with ma ${row.MaDonViCha} not found`,
        });
        continue;
      }

      try {
        const unit = await this.prisma.donVi.create({
          data: {
            ten: row.ten,
            ma: row.ma,
            moTa: row.moTa || null,
            trangThai: row.trangThai !== false,
            donViChaId: parent.id,
          },
        });
        results.push({ row, status: 'success', unitId: unit.id });
      } catch (err) {
        results.push({ row, status: 'failed', reason: err.message });
      }
    }

    return results;
  }
}
