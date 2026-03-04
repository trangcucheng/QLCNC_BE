import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

import { LoaiKyBaoCao } from '../../../databases/entities/ThoiGianCapNhatDoanSo.entity';

export enum NotificationTarget {
  TAT_CA = 'tat_ca',
  THEO_TO_CHUC = 'theo_to_chuc'
}

export class TaoBaoCaoDoanSoDotXuatDto {
  @ApiProperty({ description: 'Tên báo cáo đột xuất' })
  @IsNotEmpty()
  @IsString()
  ten: string;

  @ApiProperty({ description: 'Mô tả báo cáo' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({ description: 'Thời gian bắt đầu báo cáo', example: '2025-01-15T00:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  thoiGianBatDau: string;

  @ApiProperty({ description: 'Thời gian kết thúc báo cáo', example: '2025-01-25T23:59:59.000Z' })
  @IsNotEmpty()
  @IsDateString()
  thoiGianKetThuc: string;

  @ApiProperty({
    enum: NotificationTarget,
    description: 'Đối tượng gửi thông báo: tat_ca hoặc theo_to_chuc'
  })
  @IsNotEmpty()
  @IsEnum(NotificationTarget)
  notificationTarget: NotificationTarget;

  @ApiProperty({
    description: 'ID tổ chức (bắt buộc nếu notificationTarget = theo_to_chuc)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @ApiProperty({ description: 'Nội dung thông báo tùy chỉnh' })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class CauHinhBaoCaoThuongKyDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  @IsNotEmpty()
  @IsNumber()
  thoiGianCapNhatDoanSoId: number;

  @ApiProperty({ description: 'Bật/tắt báo cáo thường kỳ tự động' })
  @IsNotEmpty()
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Cron expression cho lịch báo cáo (VD: 0 8 1 * * = 8h sáng ngày 1 hàng tháng)',
    example: '0 8 1 * *'
  })
  @IsOptional()
  @IsString()
  cronExpression?: string;

  @ApiProperty({
    enum: NotificationTarget,
    description: 'Đối tượng gửi thông báo: tat_ca hoặc theo_to_chuc'
  })
  @IsOptional()
  @IsEnum(NotificationTarget)
  notificationTarget?: NotificationTarget;

  @ApiProperty({
    description: 'ID tổ chức (bắt buộc nếu notificationTarget = theo_to_chuc)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @ApiProperty({ description: 'Nội dung thông báo tùy chỉnh' })
  @IsOptional()
  @IsString()
  customMessage?: string;
}

export class GuiThongBaoBaoCaoDoanSoDto {
  @ApiProperty({ description: 'Tiêu đề thông báo' })
  @IsNotEmpty()
  @IsString()
  tieuDe: string;

  @ApiProperty({ description: 'Nội dung thông báo' })
  @IsNotEmpty()
  @IsString()
  noiDung: string;

  @ApiProperty({
    enum: NotificationTarget,
    description: 'Đối tượng gửi thông báo: tat_ca hoặc theo_to_chuc'
  })
  @IsNotEmpty()
  @IsEnum(NotificationTarget)
  target: NotificationTarget;

  @ApiProperty({
    description: 'ID tổ chức (bắt buộc nếu target = theo_to_chuc)',
    required: false
  })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @ApiProperty({
    description: 'Danh sách ID users cụ thể (tùy chọn, ưu tiên hơn organizationId)',
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  userIds?: number[];
}

export class LayDanhSachBaoCaoDoanSoDto {
  @ApiProperty({
    enum: LoaiKyBaoCao,
    description: 'Loại kỳ báo cáo',
    required: false
  })
  @IsOptional()
  @IsEnum(LoaiKyBaoCao)
  loai?: LoaiKyBaoCao;

  @ApiProperty({ description: 'ID tổ chức', required: false })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @ApiProperty({ description: 'Từ ngày', required: false })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({ description: 'Đến ngày', required: false })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}

// Response DTOs
export class BaoCaoDoanSoResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  ten: string;

  @ApiProperty()
  moTa: string;

  @ApiProperty()
  thoiGianBatDau: Date;

  @ApiProperty()
  thoiGianKetThuc: Date;

  @ApiProperty({ enum: LoaiKyBaoCao })
  loai: LoaiKyBaoCao;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  auto_notification_enabled: boolean;

  @ApiProperty()
  notification_schedules: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ThongBaoResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  totalSent?: number;

  @ApiProperty()
  successful?: string[];

  @ApiProperty()
  failed?: { userId: string; error: string; }[];
}
