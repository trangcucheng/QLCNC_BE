import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsInt } from 'class-validator';
import { LoaiTaiLieu } from '@prisma/client';

export class CreateTaiLieuDoiTuongDTO {
  @IsNotEmpty()
  @IsUUID()
  doiTuongId: string;

  @IsNotEmpty()
  @IsString()
  tenTaiLieu: string;

  @IsNotEmpty()
  @IsEnum(LoaiTaiLieu)
  loaiTaiLieu: LoaiTaiLieu;

  @IsNotEmpty()
  @IsString()
  duongDan: string;

  @IsOptional()
  @IsInt()
  kichThuoc?: number;

  @IsOptional()
  @IsString()
  moTa?: string;
}

export class CreateTaiLieuVuViecDTO {
  @IsNotEmpty()
  @IsUUID()
  vuViecId: string;

  @IsNotEmpty()
  @IsString()
  tenTaiLieu: string;

  @IsNotEmpty()
  @IsEnum(LoaiTaiLieu)
  loaiTaiLieu: LoaiTaiLieu;

  @IsNotEmpty()
  @IsString()
  duongDan: string;

  @IsOptional()
  @IsInt()
  kichThuoc?: number;

  @IsOptional()
  @IsString()
  moTa?: string;
}
