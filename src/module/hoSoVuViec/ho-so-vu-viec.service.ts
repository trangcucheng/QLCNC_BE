import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateHoSoVuViecDTO } from './dto/create-ho-so-vu-viec.dto';
import { UpdateHoSoVuViecDTO } from './dto/update-ho-so-vu-viec.dto';
import { SearchHoSoVuViecDTO } from './dto/search-ho-so-vu-viec.dto';
import { CapNhatTrangThaiDTO } from './dto/cap-nhat-trang-thai.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class HoSoVuViecService {
  constructor(private prisma: PrismaService) {}

  // Tạo mới hồ sơ vụ việc
  async create(createDto: CreateHoSoVuViecDTO, nguoiTaoId: string) {
    try {
      // Kiểm tra trùng số hồ sơ
      const existing = await this.prisma.hoSoVuViec.findUnique({
        where: { soHoSo: createDto.soHoSo }
      });
      if (existing) {
        throw new ConflictException('Số hồ sơ đã tồn tại trong hệ thống');
      }

      // Tách các trường không thuộc model chính
      const { doiTuongIds, toimDanhIds, ...vuViecData } = createDto;

      const hoSo = await this.prisma.hoSoVuViec.create({
        data: {
          ...vuViecData,
          ngayXayRa: new Date(createDto.ngayXayRa),
          ngayBatDauXuLy: createDto.ngayBatDauXuLy ? new Date(createDto.ngayBatDauXuLy) : null,
          nguoiTaoId,
          // Tạo quan hệ với đối tượng
          ...(doiTuongIds && doiTuongIds.length > 0 && {
            vuViecDoiTuong: {
              create: doiTuongIds.map(doiTuongId => ({
                doiTuongId,
              }))
            }
          }),
          // Tạo quan hệ với tội danh
          ...(toimDanhIds && toimDanhIds.length > 0 && {
            vuViecToimDanh: {
              create: toimDanhIds.map(toimDanhId => ({
                toimDanhId,
              }))
            }
          }),
        },
        include: {
          nguoiTao: {
            select: {
              id: true,
              hoTen: true,
              email: true,
            }
          },
          donViHanhChinh: true,
          vuViecDoiTuong: {
            include: {
              doiTuong: {
                select: {
                  id: true,
                  hoTen: true,
                  soCMND_CCCD: true,
                  gioiTinh: true,
                  ngaySinh: true,
                }
              }
            }
          },
          vuViecToimDanh: {
            include: {
              toimDanh: true,
            }
          },
        }
      });

      return {
        statusCode: 201,
        message: 'Tạo hồ sơ vụ việc thành công',
        data: hoSo,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi tạo hồ sơ vụ việc: ' + error.message);
    }
  }

  // Lấy danh sách với phân trang và tìm kiếm
  async findAll(searchDto: SearchHoSoVuViecDTO) {
    const { page = 1, limit = 10, ...filters } = searchDto;
    const skip = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const where: Prisma.HoSoVuViecWhereInput = {};

    if (filters.soHoSo) {
      where.soHoSo = {
        contains: filters.soHoSo,
      };
    }

    if (filters.tenVuViec) {
      where.tenVuViec = {
        contains: filters.tenVuViec,
      };
    }

    if (filters.trangThai) {
      where.trangThai = filters.trangThai;
    }

    if (filters.mucDoViPham) {
      where.mucDoViPham = filters.mucDoViPham;
    }

    if (filters.donViHanhChinhId) {
      where.donViHanhChinhId = filters.donViHanhChinhId;
    }

    if (filters.donViXuLy) {
      where.donViXuLy = {
        contains: filters.donViXuLy,
      };
    }

    if (filters.canBoXuLy) {
      where.canBoXuLy = {
        contains: filters.canBoXuLy,
      };
    }

    // Tìm theo đối tượng
    if (filters.doiTuongId) {
      where.vuViecDoiTuong = {
        some: {
          doiTuongId: filters.doiTuongId,
        }
      };
    }

    // Tìm theo tội danh
    if (filters.toimDanhId) {
      where.vuViecToimDanh = {
        some: {
          toimDanhId: filters.toimDanhId,
        }
      };
    }

    if (filters.tuNgay || filters.denNgay) {
      where.ngayXayRa = {};
      if (filters.tuNgay) {
        where.ngayXayRa.gte = new Date(filters.tuNgay);
      }
      if (filters.denNgay) {
        where.ngayXayRa.lte = new Date(filters.denNgay);
      }
    }

    // Lấy dữ liệu
    const [data, total] = await Promise.all([
      this.prisma.hoSoVuViec.findMany({
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
          donViHanhChinh: {
            select: {
              id: true,
              ten: true,
              cap: true,
            }
          },
          _count: {
            select: {
              vuViecDoiTuong: true,
              vuViecToimDanh: true,
              taiLieuVuViec: true,
            }
          }
        }
      }),
      this.prisma.hoSoVuViec.count({ where }),
    ]);

    return {
      statusCode: 200,
      message: 'Lấy danh sách hồ sơ vụ việc thành công',
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
    const hoSo = await this.prisma.hoSoVuViec.findUnique({
      where: { id },
      include: {
        nguoiTao: {
          select: {
            id: true,
            hoTen: true,
            email: true,
          }
        },
        donViHanhChinh: true,
        vuViecDoiTuong: {
          include: {
            doiTuong: {
              select: {
                id: true,
                hoTen: true,
                tenGoiKhac: true,
                soCMND_CCCD: true,
                gioiTinh: true,
                ngaySinh: true,
                anhDaiDien: true,
                trangThai: true,
              }
            }
          }
        },
        vuViecToimDanh: {
          include: {
            toimDanh: true,
          }
        },
        taiLieuVuViec: {
          orderBy: { ngayTao: 'desc' }
        },
        lichSuXuLy: {
          orderBy: { ngayThucHien: 'desc' }
        }
      }
    });

    if (!hoSo) {
      throw new NotFoundException('Không tìm thấy hồ sơ vụ việc');
    }

    return {
      statusCode: 200,
      message: 'Lấy thông tin hồ sơ vụ việc thành công',
      data: hoSo,
    };
  }

  // Cập nhật hồ sơ
  async update(id: string, updateDto: UpdateHoSoVuViecDTO) {
    try {
      const existing = await this.prisma.hoSoVuViec.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy hồ sơ vụ việc');
      }

      // Kiểm tra trùng số hồ sơ nếu cập nhật
      if (updateDto.soHoSo && updateDto.soHoSo !== existing.soHoSo) {
        const duplicate = await this.prisma.hoSoVuViec.findUnique({
          where: { soHoSo: updateDto.soHoSo }
        });
        if (duplicate) {
          throw new ConflictException('Số hồ sơ đã tồn tại trong hệ thống');
        }
      }

      // Tách các trường không thuộc model chính
      const { doiTuongIds, toimDanhIds, ...vuViecData } = updateDto;

      const hoSo = await this.prisma.hoSoVuViec.update({
        where: { id },
        data: {
          ...vuViecData,
          ngayXayRa: updateDto.ngayXayRa ? new Date(updateDto.ngayXayRa) : undefined,
          ngayBatDauXuLy: updateDto.ngayBatDauXuLy ? new Date(updateDto.ngayBatDauXuLy) : undefined,
        },
        include: {
          nguoiTao: {
            select: {
              id: true,
              hoTen: true,
              email: true,
            }
          },
          donViHanhChinh: true,
          vuViecDoiTuong: {
            include: {
              doiTuong: true,
            }
          },
          vuViecToimDanh: {
            include: {
              toimDanh: true,
            }
          },
        }
      });

      return {
        statusCode: 200,
        message: 'Cập nhật hồ sơ vụ việc thành công',
        data: hoSo,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi cập nhật hồ sơ: ' + error.message);
    }
  }

  // Cập nhật trạng thái và lưu lịch sử
  async capNhatTrangThai(id: string, capNhatDto: CapNhatTrangThaiDTO, nguoiThucHien: string) {
    try {
      const existing = await this.prisma.hoSoVuViec.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy hồ sơ vụ việc');
      }

      // Cập nhật và tạo lịch sử trong một transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái
        const updated = await tx.hoSoVuViec.update({
          where: { id },
          data: {
            trangThai: capNhatDto.trangThaiMoi,
            ghiChu: capNhatDto.ghiChu || existing.ghiChu,
            ...(capNhatDto.trangThaiMoi === 'HOAN_THANH' && {
              ngayKetThuc: new Date(),
            })
          }
        });

        // Tạo lịch sử xử lý
        await tx.lichSuXuLyVuViec.create({
          data: {
            vuViecId: id,
            trangThaiCu: existing.trangThai,
            trangThaiMoi: capNhatDto.trangThaiMoi,
            lyDo: capNhatDto.lyDo,
            nguoiThucHien,
          }
        });

        return updated;
      });

      return {
        statusCode: 200,
        message: 'Cập nhật trạng thái vụ việc thành công',
        data: result,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi cập nhật trạng thái: ' + error.message);
    }
  }

  // Xóa hồ sơ
  async remove(id: string) {
    try {
      const existing = await this.prisma.hoSoVuViec.findUnique({
        where: { id }
      });

      if (!existing) {
        throw new NotFoundException('Không tìm thấy hồ sơ vụ việc');
      }

      await this.prisma.hoSoVuViec.delete({
        where: { id }
      });

      return {
        statusCode: 200,
        message: 'Xóa hồ sơ vụ việc thành công',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Có lỗi khi xóa hồ sơ: ' + error.message);
    }
  }

  // Thống kê vụ việc theo mức độ
  async thongKeTheoMucDo() {
    const thongKe = await this.prisma.hoSoVuViec.groupBy({
      by: ['mucDoViPham'],
      _count: true,
    });

    return {
      statusCode: 200,
      message: 'Thống kê vụ việc theo mức độ vi phạm',
      data: thongKe.map(item => ({
        mucDo: item.mucDoViPham,
        soLuong: item._count,
      })),
    };
  }

  // Thống kê theo trạng thái
  async thongKeTheoTrangThai() {
    const thongKe = await this.prisma.hoSoVuViec.groupBy({
      by: ['trangThai'],
      _count: true,
    });

    return {
      statusCode: 200,
      message: 'Thống kê vụ việc theo trạng thái',
      data: thongKe.map(item => ({
        trangThai: item.trangThai,
        soLuong: item._count,
      })),
    };
  }

  // Thống kê theo địa bàn
  async thongKeTheoKhuVuc() {
    const thongKe = await this.prisma.hoSoVuViec.groupBy({
      by: ['donViHanhChinhId'],
      _count: true,
    });

    const results = await Promise.all(
      thongKe.map(async (item) => {
        if (!item.donViHanhChinhId) {
          return {
            khuVuc: 'Chưa xác định',
            soLuong: item._count,
          };
        }
        const donVi = await this.prisma.donViHanhChinh.findUnique({
          where: { id: item.donViHanhChinhId },
        });
        return {
          khuVuc: donVi?.ten || 'Không xác định',
          soLuong: item._count,
        };
      })
    );

    return {
      statusCode: 200,
      message: 'Thống kê vụ việc theo khu vực',
      data: results,
    };
  }

  // Thống kê theo tội danh
  async thongKeTheoToimDanh() {
    const thongKe = await this.prisma.vuViecToimDanh.groupBy({
      by: ['toimDanhId'],
      _count: true,
    });

    const results = await Promise.all(
      thongKe.map(async (item) => {
        const toimDanh = await this.prisma.toimDanh.findUnique({
          where: { id: item.toimDanhId },
        });
        return {
          toimDanh: toimDanh?.ten || 'Không xác định',
          ma: toimDanh?.ma,
          soLuong: item._count,
        };
      })
    );

    return {
      statusCode: 200,
      message: 'Thống kê vụ việc theo tội danh',
      data: results.sort((a, b) => b.soLuong - a.soLuong),
    };
  }
}
