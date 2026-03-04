import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

import { LoaiKyBaoCao } from '../../../databases/entities/ThoiGianCapNhatDoanSo.entity';

// ✅ DTO cho cấu hình thông báo
export class NotificationSchedulesDto {
  @ApiProperty({ description: 'Danh sách ngày nhắc nhở trước hạn', example: [7, 3, 1] })
  @IsArray()
  @IsNumber({}, { each: true })
  reminderDaysBefore: number[];

  @ApiProperty({ description: 'Số ngày cảnh báo hạn chót', example: 1 })
  @IsNumber()
  deadlineWarningDays: number;

  @ApiProperty({ description: 'Số ngày thông báo quá hạn', example: 1 })
  @IsNumber()
  overdueNotificationDays: number;

  @ApiProperty({ description: 'Bật nhắc nhở hàng tuần', example: true })
  @IsBoolean()
  weeklyReminder: boolean;
}

export class CreateThoiGianCapNhatDoanSoDto {
  @ApiProperty({ description: 'Tên đợt cập nhật', example: 'Báo cáo đoàn số hàng tháng' })
  @IsString()
  ten: string;

  @ApiProperty({
    description: 'Loại kỳ báo cáo',
    enum: LoaiKyBaoCao,
    example: LoaiKyBaoCao.HANG_THANG
  })
  @IsEnum(LoaiKyBaoCao, { message: 'Loại kỳ không hợp lệ' })
  loaiKy: LoaiKyBaoCao;

  // ===== TRƯỜNG CHO BÁO CÁO ĐỊNH KỲ =====

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu trong tháng (1-31). Dùng cho định kỳ',
    example: 1,
    minimum: 1,
    maximum: 31
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy !== LoaiKyBaoCao.DOT_XUAT)
  @IsInt()
  @Min(1, { message: 'Ngày bắt đầu phải từ 1-31' })
  @Max(31, { message: 'Ngày bắt đầu phải từ 1-31' })
  ngayBatDauTrongThang?: number;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc trong tháng (1-31). Dùng cho định kỳ',
    example: 5,
    minimum: 1,
    maximum: 31
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy !== LoaiKyBaoCao.DOT_XUAT)
  @IsInt()
  @Min(1, { message: 'Ngày kết thúc phải từ 1-31' })
  @Max(31, { message: 'Ngày kết thúc phải từ 1-31' })
  ngayKetThucTrongThang?: number;

  @ApiPropertyOptional({
    description: 'Tháng bắt đầu (1-12). Dùng cho báo cáo hàng năm',
    example: 12,
    minimum: 1,
    maximum: 12
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy === LoaiKyBaoCao.HANG_NAM)
  @IsInt()
  @Min(1, { message: 'Tháng phải từ 1-12' })
  @Max(12, { message: 'Tháng phải từ 1-12' })
  thangBatDau?: number;

  @ApiPropertyOptional({
    description: 'Năm bắt đầu áp dụng. Dùng cho định kỳ',
    example: 2024
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy !== LoaiKyBaoCao.DOT_XUAT)
  @IsInt()
  @Min(2020, { message: 'Năm bắt đầu phải từ 2020 trở đi' })
  namBatDau?: number;

  @ApiPropertyOptional({
    description: 'Năm kết thúc áp dụng (null = vô thời hạn)',
    example: null
  })
  @IsOptional()
  @IsInt()
  @Min(2020, { message: 'Năm kết thúc phải từ 2020 trở đi' })
  namKetThuc?: number;

  @ApiPropertyOptional({
    description: 'Các tháng áp dụng (dùng cho hàng quý). VD: [1,4,7,10] hoặc [3,6,9,12]',
    example: [1, 4, 7, 10],
    type: [Number]
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy === LoaiKyBaoCao.HANG_QUY)
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  cacThangApDung?: number[];

  // ===== TRƯỜNG CHO BÁO CÁO ĐỘT XUẤT =====

  @ApiPropertyOptional({
    description: 'Thời gian bắt đầu cụ thể (dùng cho đột xuất)',
    example: '2025-03-01T00:00:00.000Z'
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy === LoaiKyBaoCao.DOT_XUAT)
  @IsDateString()
  thoiGianBatDau?: string;

  @ApiPropertyOptional({
    description: 'Thời gian kết thúc cụ thể (dùng cho đột xuất)',
    example: '2025-03-31T23:59:59.000Z'
  })
  @IsOptional()
  @ValidateIf(o => o.loaiKy === LoaiKyBaoCao.DOT_XUAT)
  @IsDateString()
  thoiGianKetThuc?: string;

  @ApiPropertyOptional({ description: 'Mô tả chi tiết' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Danh sách ID organization để gửi thông báo (nếu không cung cấp sẽ gửi cho tất cả)',
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách organization ID phải là mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi organization ID phải là số' })
  @Type(() => Number)
  organizationId?: number[];
}

export class UpdateThoiGianCapNhatDoanSoDto extends CreateThoiGianCapNhatDoanSoDto {
  @ApiProperty({ description: 'ID của đợt cập nhật' })
  @IsNumber()
  @Type(() => Number)
  id: number;
}

export class ListThoiGianCapNhatDoanSoDto {
  @ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Số trang', default: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ description: 'Số lượng bản ghi mỗi trang', default: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}

export class GetDetailThoiGianCapNhatDoanSoDto {
  @ApiProperty({ description: 'ID của đợt cập nhật' })
  @IsNumber()
  @Type(() => Number)
  id: number;
}

// ===== DTO CHO KỲ BÁO CÁO ĐỊNH KỲ =====

export class KyBaoCaoDto {
  @ApiProperty({ description: 'ID kỳ báo cáo', example: 1 })
  id: number;

  @ApiProperty({ description: 'Tên kỳ báo cáo', example: 'Tháng 1/2024' })
  tenKy: string;

  @ApiProperty({ description: 'Thời gian bắt đầu', example: '2024-01-01T00:00:00.000Z' })
  thoiGianBatDau: Date;

  @ApiProperty({ description: 'Thời gian kết thúc', example: '2024-01-05T23:59:59.000Z' })
  thoiGianKetThuc: Date;

  @ApiProperty({ description: 'Tháng', example: 1 })
  thang: number;

  @ApiProperty({ description: 'Năm', example: 2024 })
  nam: number;

  @ApiProperty({ description: 'Đang trong kỳ báo cáo', example: false })
  dangDienRa: boolean;

  @ApiProperty({ description: 'Đã quá hạn', example: true })
  daQuaHan: boolean;
}

export class GetKyBaoCaoQueryDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  @IsNumber()
  @Type(() => Number)
  thoiGianCapNhatDoanSoId: number;

  @ApiPropertyOptional({ description: 'Năm cần lấy (mặc định: năm hiện tại)', example: 2024 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  nam?: number;
}

export class GetCurrentKyBaoCaoDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  @IsNumber()
  @Type(() => Number)
  thoiGianCapNhatDoanSoId: number;
}
