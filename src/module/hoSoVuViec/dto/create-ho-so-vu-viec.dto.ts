import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, IsUUID, IsArray } from 'class-validator';
import { MucDoViPham, TrangThaiHoSo } from '@prisma/client';

export class CreateHoSoVuViecDTO {
  @IsNotEmpty()
  @IsString()
  soHoSo: string;

  @IsNotEmpty()
  @IsString()
  tenVuViec: string;

  @IsNotEmpty()
  @IsString()
  moTaVuViec: string;

  @IsNotEmpty()
  @IsDateString()
  ngayXayRa: string;

  @IsNotEmpty()
  @IsString()
  diaChiXayRa: string;

  @IsOptional()
  @IsUUID()
  donViHanhChinhId?: string;

  @IsNotEmpty()
  @IsEnum(MucDoViPham)
  mucDoViPham: MucDoViPham;

  @IsOptional()
  @IsEnum(TrangThaiHoSo)
  trangThai?: TrangThaiHoSo;

  @IsOptional()
  @IsString()
  donViXuLy?: string;

  @IsOptional()
  @IsString()
  canBoXuLy?: string;

  @IsOptional()
  @IsDateString()
  ngayBatDauXuLy?: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  // Danh sách đối tượng liên quan
  @IsOptional()
  @IsArray()
  doiTuongIds?: string[];

  // Danh sách tội danh
  @IsOptional()
  @IsArray()
  toimDanhIds?: string[];
}
