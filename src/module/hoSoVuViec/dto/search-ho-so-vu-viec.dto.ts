import { IsOptional, IsString, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TrangThaiHoSo, MucDoViPham } from '@prisma/client';

export class SearchHoSoVuViecDTO {
  @IsOptional()
  @IsString()
  soHoSo?: string;

  @IsOptional()
  @IsString()
  tenVuViec?: string;

  @IsOptional()
  @IsEnum(TrangThaiHoSo)
  trangThai?: TrangThaiHoSo;

  @IsOptional()
  @IsEnum(MucDoViPham)
  mucDoViPham?: MucDoViPham;

  @IsOptional()
  @IsUUID()
  donViHanhChinhId?: string;

  @IsOptional()
  @IsString()
  donViXuLy?: string;

  @IsOptional()
  @IsString()
  canBoXuLy?: string;

  @IsOptional()
  @IsUUID()
  doiTuongId?: string; // Tìm vụ việc có đối tượng này

  @IsOptional()
  @IsUUID()
  toimDanhId?: string; // Tìm vụ việc có tội danh này

  @IsOptional()
  @IsString()
  tuNgay?: string; // Ngày xảy ra từ

  @IsOptional()
  @IsString()
  denNgay?: string; // Ngày xảy ra đến

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
