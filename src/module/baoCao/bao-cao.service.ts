import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { BaoCaoQueryDTO } from './dto/bao-cao-query.dto';

@Injectable()
export class BaoCaoService {
  constructor(private prisma: PrismaService) {}

  // Dashboard tổng quan
  async getDashboard(query: BaoCaoQueryDTO) {
    const whereCondition: any = {};
    
    if (query.tuNgay || query.denNgay) {
      whereCondition.ngayTao = {};
      if (query.tuNgay) whereCondition.ngayTao.gte = new Date(query.tuNgay);
      if (query.denNgay) whereCondition.ngayTao.lte = new Date(query.denNgay);
    }

    // Thống kê tổng quan
    const [
      tongDoiTuong,
      tongVuViec,
      vuViecDangXuLy,
      vuViecHoanThanh,
      doiTuongDangTheoDoi,
      doiTuongTamGiam,
    ] = await Promise.all([
      this.prisma.hoSoDoiTuong.count({ where: whereCondition }),
      this.prisma.hoSoVuViec.count({ where: whereCondition }),
      this.prisma.hoSoVuViec.count({ 
        where: { ...whereCondition, trangThai: 'DANG_XU_LY' } 
      }),
      this.prisma.hoSoVuViec.count({ 
        where: { ...whereCondition, trangThai: 'HOAN_THANH' } 
      }),
      this.prisma.hoSoDoiTuong.count({ 
        where: { ...whereCondition, trangThai: 'DANG_THEO_DOI' } 
      }),
      this.prisma.hoSoDoiTuong.count({ 
        where: { ...whereCondition, trangThai: 'TAM_GIAM' } 
      }),
    ]);

    // Vụ việc theo mức độ
    const vuViecTheoMucDo = await this.prisma.hoSoVuViec.groupBy({
      by: ['mucDoViPham'],
      where: whereCondition,
      _count: true,
    });

    // Vụ việc theo trạng thái
    const vuViecTheoTrangThai = await this.prisma.hoSoVuViec.groupBy({
      by: ['trangThai'],
      where: whereCondition,
      _count: true,
    });

    return {
      statusCode: 200,
      message: 'Lấy dữ liệu dashboard thành công',
      data: {
        tongQuan: {
          tongDoiTuong,
          tongVuViec,
          vuViecDangXuLy,
          vuViecHoanThanh,
          doiTuongDangTheoDoi,
          doiTuongTamGiam,
        },
        vuViecTheoMucDo: vuViecTheoMucDo.map(item => ({
          mucDo: item.mucDoViPham,
          soLuong: item._count,
        })),
        vuViecTheoTrangThai: vuViecTheoTrangThai.map(item => ({
          trangThai: item.trangThai,
          soLuong: item._count,
        })),
      }
    };
  }

  // Báo cáo theo địa bàn
  async baoCaoTheoKhuVuc(query: BaoCaoQueryDTO) {
    const whereCondition: any = {};
    
    if (query.tuNgay || query.denNgay) {
      whereCondition.ngayXayRa = {};
      if (query.tuNgay) whereCondition.ngayXayRa.gte = new Date(query.tuNgay);
      if (query.denNgay) whereCondition.ngayXayRa.lte = new Date(query.denNgay);
    }

    if (query.donViHanhChinhId) {
      whereCondition.donViHanhChinhId = query.donViHanhChinhId;
    }

    const vuViecTheoKhuVuc = await this.prisma.hoSoVuViec.groupBy({
      by: ['donViHanhChinhId'],
      where: whereCondition,
      _count: true,
    });

    const results = await Promise.all(
      vuViecTheoKhuVuc.map(async (item) => {
        if (!item.donViHanhChinhId) {
          return {
            khuVuc: 'Chưa xác định',
            soLuongVuViec: item._count,
          };
        }

        const donVi = await this.prisma.donViHanhChinh.findUnique({
          where: { id: item.donViHanhChinhId },
        });

        // Đếm đối tượng trong khu vực
        const soDoiTuong = await this.prisma.hoSoDoiTuong.count({
          where: { noiOHienTaiId: item.donViHanhChinhId }
        });

        return {
          khuVucId: item.donViHanhChinhId,
          tenKhuVuc: donVi?.ten || 'Không xác định',
          cap: donVi?.cap,
          soLuongVuViec: item._count,
          soLuongDoiTuong: soDoiTuong,
        };
      })
    );

    return {
      statusCode: 200,
      message: 'Báo cáo theo khu vực',
      data: results.sort((a, b) => b.soLuongVuViec - a.soLuongVuViec),
    };
  }

  // Báo cáo theo tội danh
  async baoCaoTheoToimDanh(query: BaoCaoQueryDTO) {
    const whereCondition: any = {};
    
    if (query.tuNgay || query.denNgay) {
      whereCondition.vuViec = {
        ngayXayRa: {}
      };
      if (query.tuNgay) whereCondition.vuViec.ngayXayRa.gte = new Date(query.tuNgay);
      if (query.denNgay) whereCondition.vuViec.ngayXayRa.lte = new Date(query.denNgay);
    }

    const vuViecToimDanh = await this.prisma.vuViecToimDanh.groupBy({
      by: ['toimDanhId'],
      where: whereCondition,
      _count: true,
    });

    const results = await Promise.all(
      vuViecToimDanh.map(async (item) => {
        const toimDanh = await this.prisma.toimDanh.findUnique({
          where: { id: item.toimDanhId },
        });

        return {
          toimDanhId: item.toimDanhId,
          maToimDanh: toimDanh?.ma || '',
          tenToimDanh: toimDanh?.ten || 'Không xác định',
          soLuongVuViec: item._count,
          khungHinhPhat: toimDanh?.khungHinhPhat,
        };
      })
    );

    return {
      statusCode: 200,
      message: 'Báo cáo theo tội danh',
      data: results.sort((a, b) => b.soLuongVuViec - a.soLuongVuViec),
    };
  }

  // Báo cáo xu hướng theo thời gian
  async baoCaoXuHuong(query: BaoCaoQueryDTO) {
    const whereCondition: any = {};
    
    if (query.tuNgay || query.denNgay) {
      whereCondition.ngayXayRa = {};
      if (query.tuNgay) whereCondition.ngayXayRa.gte = new Date(query.tuNgay);
      if (query.denNgay) whereCondition.ngayXayRa.lte = new Date(query.denNgay);
    }

    // Lấy tất cả vụ việc trong khoảng thời gian
    const vuViec = await this.prisma.hoSoVuViec.findMany({
      where: whereCondition,
      select: {
        ngayXayRa: true,
        mucDoViPham: true,
      },
      orderBy: {
        ngayXayRa: 'asc',
      }
    });

    // Nhóm theo tháng/năm
    const groupedByMonth = vuViec.reduce((acc, item) => {
      const date = new Date(item.ngayXayRa);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[key]) {
        acc[key] = {
          thang: key,
          tongSo: 0,
          nong: 0,
          ratNong: 0,
          dacBietNong: 0,
        };
      }
      
      acc[key].tongSo++;
      
      if (item.mucDoViPham === 'NONG') acc[key].nong++;
      else if (item.mucDoViPham === 'RAT_NONG') acc[key].ratNong++;
      else if (item.mucDoViPham === 'DAC_BIET_NONG') acc[key].dacBietNong++;
      
      return acc;
    }, {} as Record<string, any>);

    const xuHuong = Object.values(groupedByMonth);

    return {
      statusCode: 200,
      message: 'Báo cáo xu hướng theo thời gian',
      data: xuHuong,
    };
  }

  // Báo cáo tiến độ xử lý
  async baoCaoTienDo(query: BaoCaoQueryDTO) {
    const whereCondition: any = {};
    
    if (query.tuNgay || query.denNgay) {
      whereCondition.ngayBatDauXuLy = {};
      if (query.tuNgay) whereCondition.ngayBatDauXuLy.gte = new Date(query.tuNgay);
      if (query.denNgay) whereCondition.ngayBatDauXuLy.lte = new Date(query.denNgay);
    }

    // Vụ việc đang xử lý quá hạn (ví dụ: > 30 ngày)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const vuViecQuaHan = await this.prisma.hoSoVuViec.findMany({
      where: {
        trangThai: 'DANG_XU_LY',
        ngayBatDauXuLy: {
          lte: thirtyDaysAgo,
        }
      },
      select: {
        id: true,
        soHoSo: true,
        tenVuViec: true,
        mucDoViPham: true,
        ngayBatDauXuLy: true,
        canBoXuLy: true,
        donViXuLy: true,
      },
      orderBy: {
        ngayBatDauXuLy: 'asc',
      }
    });

    // Thống kê theo đơn vị xử lý
    const theoCanBo = await this.prisma.hoSoVuViec.groupBy({
      by: ['canBoXuLy', 'trangThai'],
      where: {
        canBoXuLy: {
          not: null,
        }
      },
      _count: true,
    });

    return {
      statusCode: 200,
      message: 'Báo cáo tiến độ xử lý',
      data: {
        vuViecQuaHan: vuViecQuaHan.map(item => ({
          ...item,
          soNgayXuLy: item.ngayBatDauXuLy 
            ? Math.floor((now.getTime() - item.ngayBatDauXuLy.getTime()) / (1000 * 60 * 60 * 24))
            : 0,
        })),
        thongKeTheoCanBo: theoCanBo,
      }
    };
  }

  // Xuất báo cáo tổng hợp
  async xuatBaoCaoTongHop(query: BaoCaoQueryDTO) {
    const [
      dashboard,
      khuVuc,
      toimDanh,
      xuHuong,
      tienDo,
    ] = await Promise.all([
      this.getDashboard(query),
      this.baoCaoTheoKhuVuc(query),
      this.baoCaoTheoToimDanh(query),
      this.baoCaoXuHuong(query),
      this.baoCaoTienDo(query),
    ]);

    return {
      statusCode: 200,
      message: 'Xuất báo cáo tổng hợp thành công',
      data: {
        thoiGian: {
          tuNgay: query.tuNgay || 'Không giới hạn',
          denNgay: query.denNgay || 'Không giới hạn',
          ngayXuat: new Date().toISOString(),
        },
        tongQuan: dashboard.data,
        theoKhuVuc: khuVuc.data,
        theoToimDanh: toimDanh.data,
        xuHuong: xuHuong.data,
        tienDo: tienDo.data,
      }
    };
  }
}
