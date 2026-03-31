import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTaiLieuDoiTuongDTO, CreateTaiLieuVuViecDTO } from './dto/create-tai-lieu.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TaiLieuService {
  constructor(private prisma: PrismaService) {}

  // ===== TÀI LIỆU ĐỐI TƯỢNG =====

  // Tạo tài liệu cho đối tượng
  async createTaiLieuDoiTuong(createDto: CreateTaiLieuDoiTuongDTO) {
    try {
      // Kiểm tra đối tượng tồn tại
      const doiTuong = await this.prisma.hoSoDoiTuong.findUnique({
        where: { id: createDto.doiTuongId }
      });
      if (!doiTuong) {
        throw new NotFoundException('Không tìm thấy đối tượng');
      }

      const taiLieu = await this.prisma.taiLieuDoiTuong.create({
        data: createDto,
        include: {
          doiTuong: {
            select: {
              id: true,
              hoTen: true,
              soCMND_CCCD: true,
            }
          }
        }
      });

      return {
        statusCode: 201,
        message: 'Tạo tài liệu đối tượng thành công',
        data: taiLieu,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi tạo tài liệu: ' + error.message);
    }
  }

  // Lấy danh sách tài liệu của đối tượng
  async findTaiLieuByDoiTuong(doiTuongId: string) {
    const taiLieu = await this.prisma.taiLieuDoiTuong.findMany({
      where: { doiTuongId },
      orderBy: { ngayTao: 'desc' }
    });

    return {
      statusCode: 200,
      message: 'Lấy danh sách tài liệu đối tượng thành công',
      data: taiLieu,
    };
  }

  // Xóa tài liệu đối tượng
  async removeTaiLieuDoiTuong(id: string) {
    try {
      const taiLieu = await this.prisma.taiLieuDoiTuong.findUnique({
        where: { id }
      });

      if (!taiLieu) {
        throw new NotFoundException('Không tìm thấy tài liệu');
      }

      // Xóa file vật lý nếu tồn tại
      try {
        const filePath = path.join(process.cwd(), taiLieu.duongDan);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Lỗi khi xóa file:', error);
      }

      await this.prisma.taiLieuDoiTuong.delete({
        where: { id }
      });

      return {
        statusCode: 200,
        message: 'Xóa tài liệu thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi xóa tài liệu: ' + error.message);
    }
  }

  // ===== TÀI LIỆU VỤ VIỆC =====

  // Tạo tài liệu cho vụ việc
  async createTaiLieuVuViec(createDto: CreateTaiLieuVuViecDTO) {
    try {
      // Kiểm tra vụ việc tồn tại
      const vuViec = await this.prisma.hoSoVuViec.findUnique({
        where: { id: createDto.vuViecId }
      });
      if (!vuViec) {
        throw new NotFoundException('Không tìm thấy vụ việc');
      }

      const taiLieu = await this.prisma.taiLieuVuViec.create({
        data: createDto,
        include: {
          vuViec: {
            select: {
              id: true,
              soHoSo: true,
              tenVuViec: true,
            }
          }
        }
      });

      return {
        statusCode: 201,
        message: 'Tạo tài liệu vụ việc thành công',
        data: taiLieu,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi tạo tài liệu: ' + error.message);
    }
  }

  // Lấy danh sách tài liệu của vụ việc
  async findTaiLieuByVuViec(vuViecId: string) {
    const taiLieu = await this.prisma.taiLieuVuViec.findMany({
      where: { vuViecId },
      orderBy: { ngayTao: 'desc' }
    });

    return {
      statusCode: 200,
      message: 'Lấy danh sách tài liệu vụ việc thành công',
      data: taiLieu,
    };
  }

  // Xóa tài liệu vụ việc
  async removeTaiLieuVuViec(id: string) {
    try {
      const taiLieu = await this.prisma.taiLieuVuViec.findUnique({
        where: { id }
      });

      if (!taiLieu) {
        throw new NotFoundException('Không tìm thấy tài liệu');
      }

      // Xóa file vật lý nếu tồn tại
      try {
        const filePath = path.join(process.cwd(), taiLieu.duongDan);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error('Lỗi khi xóa file:', error);
      }

      await this.prisma.taiLieuVuViec.delete({
        where: { id }
      });

      return {
        statusCode: 200,
        message: 'Xóa tài liệu thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi xóa tài liệu: ' + error.message);
    }
  }

  // Thống kê tài liệu
  async thongKe() {
    const [doiTuongCount, vuViecCount] = await Promise.all([
      this.prisma.taiLieuDoiTuong.count(),
      this.prisma.taiLieuVuViec.count(),
    ]);

    const doiTuongByType = await this.prisma.taiLieuDoiTuong.groupBy({
      by: ['loaiTaiLieu'],
      _count: true,
    });

    const vuViecByType = await this.prisma.taiLieuVuViec.groupBy({
      by: ['loaiTaiLieu'],
      _count: true,
    });

    return {
      statusCode: 200,
      message: 'Thống kê tài liệu',
      data: {
        tongTaiLieuDoiTuong: doiTuongCount,
        tongTaiLieuVuViec: vuViecCount,
        taiLieuDoiTuongTheoLoai: doiTuongByType,
        taiLieuVuViecTheoLoai: vuViecByType,
      }
    };
  }
}
