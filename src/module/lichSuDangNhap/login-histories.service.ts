import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class LoginHistoryService {
  constructor(private prisma: PrismaService) { }

  async getLoginHistoryByUser(nguoiDungId: string) {
    return this.prisma.lichSuDangNhap.findMany({
      where: { nguoiDungId },
      orderBy: { ngayTao: 'desc' },
    });
  }

  async getAllLoginHistories(
    page: number = 1,
    pageSize: number = 10,
    nguoiDungId?: string,
    thietBi?: string,
    dateRange?: { start: Date; end: Date },
  ) {
    const where: any = {};

    if (nguoiDungId) where.nguoiDungId = nguoiDungId;
    if (thietBi) where.thietBi = thietBi;
    if (dateRange)
      where.ngayTao = {
        gte: dateRange.start,
        lte: dateRange.end,
      };

    const [data, total] = await Promise.all([
      this.prisma.lichSuDangNhap.findMany({
        where,
        include: { nguoiDung: true },
        orderBy: { ngayTao: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.lichSuDangNhap.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async exportLoginHistory(res: Response) {
    const histories = await this.prisma.lichSuDangNhap.findMany({
      include: { nguoiDung: true },
      orderBy: { ngayTao: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Login History');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'User Email', key: 'email', width: 30 },
      { header: 'IP Address', key: 'diaChiIP', width: 20 },
      { header: 'Device', key: 'thietBi', width: 15 },
      { header: 'Location', key: 'viTri', width: 25 },
      { header: 'Login Time', key: 'ngayTao', width: 25 },
    ];

    histories.forEach((h) => {
      worksheet.addRow({
        id: h.id,
        email: h.nguoiDung.email,
        diaChiIP: h.diaChiIP,
        thietBi: h.thietBi,
        viTri: h.viTri,
        ngayTao: h.ngayTao.toISOString(),
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=login-history.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
