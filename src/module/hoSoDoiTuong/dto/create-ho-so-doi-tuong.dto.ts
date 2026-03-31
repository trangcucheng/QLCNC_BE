import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';
import { GioiTinh, TrangThaiDoiTuong } from '@prisma/client';

export class CreateHoSoDoiTuongDTO {
  // Thông tin cơ bản
  @IsNotEmpty()
  @IsString()
  hoTen: string;

  @IsOptional()
  @IsString()
  tenGoiKhac?: string;

  @IsNotEmpty()
  @IsEnum(GioiTinh)
  gioiTinh: GioiTinh;

  @IsNotEmpty()
  @IsDateString()
  ngaySinh: string;

  @IsOptional()
  @IsString()
  noiSinh?: string;

  @IsOptional()
  @IsString()
  quocTich?: string;

  @IsOptional()
  @IsString()
  danToc?: string;

  @IsOptional()
  @IsString()
  tonGiao?: string;

  // Giấy tờ tùy thân
  @IsOptional()
  @IsString()
  soCMND_CCCD?: string;

  @IsOptional()
  @IsDateString()
  ngayCapCMND?: string;

  @IsOptional()
  @IsString()
  noiCapCMND?: string;

  @IsOptional()
  @IsString()
  soHoChieu?: string;

  @IsOptional()
  @IsDateString()
  ngayCapHoChieu?: string;

  @IsOptional()
  @IsString()
  noiCapHoChieu?: string;

  // Thông tin học vấn/nghề nghiệp
  @IsOptional()
  @IsString()
  trinhDoHocVan?: string;

  @IsOptional()
  @IsString()
  ngheNghiep?: string;

  @IsOptional()
  @IsString()
  noiLamViec?: string;

  @IsOptional()
  @IsString()
  capBac?: string;

  @IsOptional()
  @IsString()
  chucVu?: string;

  @IsOptional()
  @IsString()
  donVi?: string;

  // Địa chỉ
  @IsOptional()
  @IsUUID()
  queQuanId?: string;

  @IsOptional()
  @IsString()
  diaChiQueQuan?: string;

  @IsOptional()
  @IsUUID()
  noiThuongTruId?: string;

  @IsOptional()
  @IsString()
  diaChiThuongTru?: string;

  @IsOptional()
  @IsUUID()
  noiOHienTaiId?: string;

  @IsOptional()
  @IsString()
  diaChiHienTai?: string;

  // Tiền án tiền sự
  @IsOptional()
  @IsString()
  tienAn?: string;

  @IsOptional()
  @IsString()
  tienSu?: string;

  // Trạng thái
  @IsOptional()
  @IsEnum(TrangThaiDoiTuong)
  trangThai?: TrangThaiDoiTuong;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsOptional()
  @IsString()
  anhDaiDien?: string;
}
