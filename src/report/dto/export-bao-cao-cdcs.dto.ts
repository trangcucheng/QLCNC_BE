import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class ExportBaoCaoCDCSDto {
  @ApiPropertyOptional({
    description: 'ID Cụm khu công nghiệp (tùy chọn - nếu không truyền sẽ lấy tất cả)',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID Cụm khu công nghiệp phải là số' })
  cumKhuCnId?: number;

  @ApiPropertyOptional({
    description: 'ID Xã phường (tùy chọn - nếu không truyền sẽ lấy tất cả)',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID Xã phường phải là số' })
  xaPhuongId?: number;

  @ApiPropertyOptional({
    description: 'Ngày thống kê (định dạng YYYY-MM-DD)',
    example: '2025-09-15'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày thống kê phải có định dạng hợp lệ (YYYY-MM-DD)' })
  ngayThongKe?: string;
}
