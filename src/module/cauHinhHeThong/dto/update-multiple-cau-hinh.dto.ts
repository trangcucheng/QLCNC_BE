import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, Min, Max } from 'class-validator';

export class UpdateMultipleCauHinhDTO {
  // Thông tin chung
  @ApiPropertyOptional({ description: 'Tên hệ thống' })
  @IsOptional()
  @IsString()
  tenHeThong?: string;

  @ApiPropertyOptional({ description: 'Mô tả hệ thống' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional({ description: 'Email liên hệ' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  diaChi?: string;

  @ApiPropertyOptional({ description: 'Logo path' })
  @IsOptional()
  @IsString()
  logoPath?: string;

  // Bảo mật
  @ApiPropertyOptional({ description: 'Thời gian session (phút)', minimum: 5, maximum: 240 })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(240)
  thoiGianSessionPhut?: number;

  @ApiPropertyOptional({ description: 'Số lần đăng nhập tối đa', minimum: 3, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(3)
  @Max(10)
  soLanDangNhapToiDa?: number;

  @ApiPropertyOptional({ description: 'Bắt buộc xác thực 2 bước' })
  @IsOptional()
  @IsBoolean()
  batBuocXacThuc2Buoc?: boolean;

  @ApiPropertyOptional({ description: 'Bắt buộc đổi mật khẩu định kỳ' })
  @IsOptional()
  @IsBoolean()
  batBuocDoiMatKhauDinhKy?: boolean;

  @ApiPropertyOptional({ description: 'Số ngày đổi mật khẩu', minimum: 30, maximum: 365 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(365)
  soNgayDoiMatKhau?: number;

  // Sao lưu
  @ApiPropertyOptional({ description: 'Kích hoạt backup tự động' })
  @IsOptional()
  @IsBoolean()
  kichHoatBackupTuDong?: boolean;

  @ApiPropertyOptional({ description: 'Tần suất backup (giờ)', enum: [6, 12, 24, 168] })
  @IsOptional()
  @IsNumber()
  tanSuatBackupGio?: number;
}
