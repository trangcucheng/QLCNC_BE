import { IsOptional, IsString, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { TrangThaiDoiTuong, GioiTinh } from '@prisma/client';

export class SearchHoSoDoiTuongDTO {
  @IsOptional()
  @IsString()
  hoTen?: string;

  @IsOptional()
  @IsString()
  soCMND_CCCD?: string;

  @IsOptional()
  @IsEnum(GioiTinh)
  gioiTinh?: GioiTinh;

  @IsOptional()
  @IsEnum(TrangThaiDoiTuong)
  trangThai?: TrangThaiDoiTuong;

  @IsOptional()
  @IsUUID()
  queQuanId?: string;

  @IsOptional()
  @IsUUID()
  noiThuongTruId?: string;

  @IsOptional()
  @IsUUID()
  noiOHienTaiId?: string;

  @IsOptional()
  @IsString()
  ngheNghiep?: string;

  @IsOptional()
  @IsString()
  tuNgay?: string; // Ngày sinh từ

  @IsOptional()
  @IsString()
  denNgay?: string; // Ngày sinh đến

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
