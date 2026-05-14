import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum KhoangThoiGian {
  NGAY = 'NGAY',
  TUAN = 'TUAN',
  THANG = 'THANG',
  QUY = 'QUY',
  NAM = 'NAM',
}

export enum LoaiBaoCao {
  TONG_HOP = 'tong-hop',
  KHU_VUC = 'khu-vuc',
  TOI_DANH = 'toi-danh',
  XU_HUONG = 'xu-huong',
  TIEN_DO = 'tien-do',
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

  @IsOptional()
  @IsString()
  loaiBaoCao?: string; // 'tong-hop' | 'khu-vuc' | 'toi-danh' | 'xu-huong' | 'tien-do'
}
