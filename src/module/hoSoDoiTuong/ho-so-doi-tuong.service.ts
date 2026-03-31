import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHoSoDoiTuongDTO } from './dto/create-ho-so-doi-tuong.dto';
import { UpdateHoSoDoiTuongDTO } from './dto/update-ho-so-doi-tuong.dto';
import { SearchHoSoDoiTuongDTO } from './dto/search-ho-so-doi-tuong.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HoSoDoiTuongService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới hồ sơ đối tượng
  async create(createDto: CreateHoSoDoiTuongDTO, nguoiTaoId: string) {
    try {
      // Kiểm tra trùng CMND/CCCD nếu có
      if (createDto.soCMND_CCCD) {
        const existing = await this.prisma.hoSoDoiTuong.findUnique({
          where: { soCMND_CCCD: createDto.soCMND_CCCD }
        });
        if (existing) {
          throw new ConflictException('Số CMND/CCCD đã tồn tại trong hệ thống');
        }
      }

      const hoSo = await this.prisma.hoSoDoiTuong.create({
        data: {
          ...createDto,
          ngaySinh: new Date(createDto.ngaySinh),
          ngayCapCMND: createDto.ngayCapCMND ? new Date(createDto.ngayCapCMND) : null,
          ngayCapHoChieu: createDto.ngayCapHoChieu ? new Date(createDto.ngayCapHoChieu) : null,
          nguoiTaoId,
        },
        include: {
          nguoiTao: {
            select: {
              id: true,
              hoTen: true,
              email: true,
            }
          },
          queQuan: true,
          noiThuongTru: true,
          noiOHienTai: true,
        }
      });

      return {
        statusCode: 201,
        message: 'Tạo hồ sơ đối tượng thành công',
        data: hoSo,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi tạo hồ sơ đối tượng: ' + error.message);
    }
  }

  // Lấy danh sách với phân trang và tìm kiếm
  async findAll(searchDto: SearchHoSoDoiTuongDTO) {
    const { page = 1, limit = 10, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const where: Prisma.HoSoDoiTuongWhereInput = {};

    if (filters.hoTen) {
      where.hoTen = {
        contains: filters.hoTen,
      };
    }

    if (filters.soCMND_CCCD) {
      where.soCMND_CCCD = {
        contains: filters.soCMND_CCCD,
      };
    }

    if (filters.gioiTinh) {
      where.gioiTinh = filters.gioiTinh;
    }

    if (filters.trangThai) {
      where.trangThai = filters.trangThai;
    }

    if (filters.queQuanId) {
      where.queQuanId = filters.queQuanId;
    }

    if (filters.noiThuongTruId) {
      where.noiThuongTruId = filters.noiThuongTruId;
    }

    if (filters.noiOHienTaiId) {
      where.noiOHienTaiId = filters.noiOHienTaiId;
    }

    if (filters.ngheNghiep) {
      where.ngheNghiep = {
        contains: filters.ngheNghiep,
      };
    }

    if (filters.tuNgay || filters.denNgay) {
      where.ngaySinh = {};
      if (filters.tuNgay) {
        where.ngaySinh.gte = new Date(filters.tuNgay);
      }
      if (filters.denNgay) {
        where.ngaySinh.lte = new Date(filters.denNgay);
      }
    }

    // Lấy dữ liệu
    const [data, total] = await Promise.all([
      this.prisma.hoSoDoiTuong.findMany({
        where,
        skip,
        take: limit,
        orderBy: { ngayTao: 'desc' },
        include: {
          nguoiTao: {
            select: {
              id: true,
              hoTen: true,
              email: true,
            }
          },
          queQuan: {
            select: {
              id: true,
              ten: true,
              cap: true,
            }
          },
          noiThuongTru: {
            select: {
              id: true,
              ten: true,
              cap: true,
            }
          },
          noiOHienTai: {
            select: {
              id: true,
              ten: true,
              cap: true,
            }
          },
          _count: {
            select: {
              vuViecDoiTuong: true,
              taiLieuDoiTuong: true,
            }
          }
        }
      }),
      this.prisma.hoSoDoiTuong.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: 'Lấy danh sách hồ sơ đối tượng thành công',
      data: {
        items: data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }
      }
    };
  }

  // Lấy chi tiết hồ sơ theo ID
  async findOne(id: string) {
    const hoSo = await this.prisma.hoSoDoiTuong.findUnique({
      where: { id },
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            email: true,
          }
        },
        queQuan: true,
        noiThuongTru: true,
        noiOHienTai: true,
        vuViecDoiTuong: {
          include: {
            vuViec: {
              select: {
                id: true,
                soHoSo: true,
                tenVuViec: true,
                mucDoViPham: true,
                trangThai: true,
                ngayXayRa: true,
              }
            }
          }
        },
        taiLieuDoiTuong: {
          orderBy: { ngayTao: 'desc' }
        },
        quanHeDoiTuong: {
          include: {
            quanHe: true,
          }
        }
      }
    });

    if (!hoSo) {
      throw new NotFoundException('Không tìm thấy hồ sơ đối tượng');
    }

    return {
      statusCode: 200,
      message: 'Lấy thông tin hồ sơ đối tượng thành công',
      data: hoSo,
    };
  }

  // Cập nhật hồ sơ
  async update(id: string, updateDto: UpdateHoSoDoiTuongDTO) {
    try {
      // Kiểm tra tồn tại
      const existing = await this.prisma.hoSoDoiTuong.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy hồ sơ đối tượng');
      }

      // Kiểm tra trùng CMND/CCCD nếu cập nhật
      if (updateDto.soCMND_CCCD && updateDto.soCMND_CCCD !== existing.soCMND_CCCD) {
        const duplicate = await this.prisma.hoSoDoiTuong.findUnique({
          where: { soCMND_CCCD: updateDto.soCMND_CCCD }
        });
        if (duplicate) {
          throw new ConflictException('Số CMND/CCCD đã tồn tại trong hệ thống');
        }
      }

      const hoSo = await this.prisma.hoSoDoiTuong.update({
        where: { id },
        data: {
          ...updateDto,
          ngaySinh: updateDto.ngaySinh ? new Date(updateDto.ngaySinh) : undefined,
          ngayCapCMND: updateDto.ngayCapCMND ? new Date(updateDto.ngayCapCMND) : undefined,
          ngayCapHoChieu: updateDto.ngayCapHoChieu ? new Date(updateDto.ngayCapHoChieu) : undefined,
        },
        include: {
          nguoiTao: {
            select: {
              id: true,
              hoTen: true,
              email: true,
            }
          },
          queQuan: true,
          noiThuongTru: true,
          noiOHienTai: true,
        }
      });

      return {
        statusCode: 200,
        message: 'Cập nhật hồ sơ đối tượng thành công',
        data: hoSo,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi cập nhật hồ sơ: ' + error.message);
    }
  }

  // Xóa hồ sơ (soft delete hoặc hard delete)
  async remove(id: string) {
    try {
      const existing = await this.prisma.hoSoDoiTuong.findUnique({
        where: { id },
        include: {
          vuViecDoiTuong: true,
        }
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy hồ sơ đối tượng');
      }

      // Kiểm tra có liên quan đến vụ việc nào không
      if (existing.vuViecDoiTuong.length > 0) {
        throw new BadRequestException('Không thể xóa hồ sơ đối tượng đang liên quan đến vụ việc');
      }

      await this.prisma.hoSoDoiTuong.delete({
        where: { id }
      });

      return {
        statusCode: 200,
        message: 'Xóa hồ sơ đối tượng thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi xóa hồ sơ: ' + error.message);
    }
  }

  // Thống kê đối tượng theo địa bàn
  async thongKeTheoKhuVuc() {
    const thongKe = await this.prisma.hoSoDoiTuong.groupBy({
      by: ['noiOHienTaiId'],
      _count: true,
    });

    const results = await Promise.all(
      thongKe.map(async (item) => {
        if (!item.noiOHienTaiId) {
          return {
            khuVuc: 'Chưa xác định',
            soLuong: item._count,
          };
        }
        const donVi = await this.prisma.donViHanhChinh.findUnique({
          where: { id: item.noiOHienTaiId },
        });
        return {
          khuVuc: donVi?.ten || 'Không xác định',
          soLuong: item._count,
        };
      })
    );

    return {
      statusCode: 200,
      message: 'Thống kê đối tượng theo khu vực',
      data: results,
    };
  }

  // Thống kê theo trạng thái
  async thongKeTheoTrangThai() {
    const thongKe = await this.prisma.hoSoDoiTuong.groupBy({
      by: ['trangThai'],
      _count: true,
    });

    return {
      statusCode: 200,
      message: 'Thống kê đối tượng theo trạng thái',
      data: thongKe.map(item => ({
        trangThai: item.trangThai,
        soLuong: item._count,
      })),
    };
  }
}
