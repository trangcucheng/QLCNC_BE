import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum KhoangThoiGian {
  NGAY = 'NGAY',
  TUAN = 'TUAN',
  THANG = 'THANG',
  QUY = 'QUY',
  NAM = 'NAM',
}

export class BaoCaoQueryDTO {
  @IsOptional()
  @IsString()
  tuNgay?: string;

  @IsOptional()
  @IsString()
  denNgay?: string;

  @IsOptional()
  @IsEnum(KhoangThoiGian)
  khoangThoiGian?: KhoangThoiGian;

  @IsOptional()
  @IsString()
  donViHanhChinhId?: string;
}
