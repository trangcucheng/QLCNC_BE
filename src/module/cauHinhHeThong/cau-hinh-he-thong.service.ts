import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, CauHinhHeThong } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateMultipleCauHinhDTO } from './dto/update-multiple-cau-hinh.dto';

@Injectable()
export class CauHinhHeThongService {
  constructor(private prisma: PrismaService) { }

  async getAll() {
    return this.prisma.cauHinhHeThong.findMany({
      orderBy: { khoa: 'asc' },
    });
  }

  async getAllAsObject() {
    const configs = await this.getAll();
    const result: Record<string, any> = {};

    configs.forEach((config) => {
      // Parse giá trị nếu là boolean hoặc number
      let value: any = config.giaTri;

      if (config.giaTri === 'true') value = true;
      else if (config.giaTri === 'false') value = false;
      else if (!isNaN(Number(config.giaTri))) value = Number(config.giaTri);

      result[config.khoa] = value;
    });

    return result;
  }

  async getByKey(khoa: string) {
    const config = await this.prisma.cauHinhHeThong.findUnique({ where: { khoa } });
    if (!config) {
      throw new NotFoundException(`Không tìm thấy cấu hình với khóa "${khoa}"`);
    }
    return config;
  }

  async getById(id: string) {
    const config = await this.prisma.cauHinhHeThong.findUnique({ where: { id } });
    if (!config) {
      throw new NotFoundException('Không tìm thấy cấu hình');
    }
    return config;
  }

  async create(data: Prisma.CauHinhHeThongCreateInput) {
    const existing = await this.prisma.cauHinhHeThong.findUnique({
      where: { khoa: data.khoa },
    });

    if (existing) {
      throw new BadRequestException(`Khóa cấu hình "${data.khoa}" đã tồn tại`);
    }

    return this.prisma.cauHinhHeThong.create({ data });
  }

  async update(
    where: Prisma.CauHinhHeThongWhereUniqueInput,
    data: Prisma.CauHinhHeThongUpdateInput,
  ) {
    const existing = await this.prisma.cauHinhHeThong.findUnique({ where });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy cấu hình');
    }

    return this.prisma.cauHinhHeThong.update({ where, data });
  }

  async updateMultiple(dto: UpdateMultipleCauHinhDTO) {
    const updates: Promise<CauHinhHeThong>[] = [];

    // Convert DTO to key-value pairs
    Object.entries(dto).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        const stringValue = String(value);

        updates.push(
          this.prisma.cauHinhHeThong.upsert({
            where: { khoa: key },
            update: { giaTri: stringValue },
            create: {
              khoa: key,
              giaTri: stringValue,
              moTa: `Cấu hình ${key}`,
            },
          }),
        );
      }
    });

    await Promise.all(updates);
    return this.getAllAsObject();
  }

  async delete(where: Prisma.CauHinhHeThongWhereUniqueInput) {
    const existing = await this.prisma.cauHinhHeThong.findUnique({ where });
    if (!existing) {
      throw new NotFoundException('Không tìm thấy cấu hình');
    }

    return this.prisma.cauHinhHeThong.delete({ where });
  }

  async initializeDefaults() {
    const defaults = [
      { khoa: 'tenHeThong', giaTri: 'Hệ Thống Quản Lý Công Nghiệp Cơ Sở Việt Nam', moTa: 'Tên hiển thị của hệ thống' },
      { khoa: 'moTa', giaTri: 'Hệ thống quản lý hồ sơ đối tượng và vụ việc vi phạm pháp luật', moTa: 'Mô tả hệ thống' },
      { khoa: 'email', giaTri: 'contact@qlcnc.gov.vn', moTa: 'Email liên hệ' },
      { khoa: 'soDienThoai', giaTri: '0123456789', moTa: 'Số điện thoại liên hệ' },
      { khoa: 'diaChi', giaTri: 'Hà Nội, Việt Nam', moTa: 'Địa chỉ trụ sở' },
      { khoa: 'thoiGianSessionPhut', giaTri: '60', moTa: 'Thời gian session (phút)' },
      { khoa: 'soLanDangNhapToiDa', giaTri: '5', moTa: 'Số lần đăng nhập sai tối đa' },
      { khoa: 'batBuocXacThuc2Buoc', giaTri: 'false', moTa: 'Bật/tắt xác thực 2 bước' },
      { khoa: 'batBuocDoiMatKhauDinhKy', giaTri: 'true', moTa: 'Bắt buộc đổi mật khẩu định kỳ' },
      { khoa: 'soNgayDoiMatKhau', giaTri: '90', moTa: 'Số ngày đổi mật khẩu' },
      { khoa: 'kichHoatBackupTuDong', giaTri: 'true', moTa: 'Kích hoạt backup tự động' },
      { khoa: 'tanSuatBackupGio', giaTri: '24', moTa: 'Tần suất backup (giờ)' },
    ];

    for (const config of defaults) {
      await this.prisma.cauHinhHeThong.upsert({
        where: { khoa: config.khoa },
        update: {},
        create: config,
      });
    }

    return this.getAllAsObject();
  }
}
