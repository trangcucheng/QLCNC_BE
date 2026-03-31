import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TrangThaiHoSo } from '@prisma/client';

export class CapNhatTrangThaiDTO {
  @IsNotEmpty()
  @IsEnum(TrangThaiHoSo)
  trangThaiMoi: TrangThaiHoSo;

  @IsNotEmpty()
  @IsString()
  lyDo: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}
