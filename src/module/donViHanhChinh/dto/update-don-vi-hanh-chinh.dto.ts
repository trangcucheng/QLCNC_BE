import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export class UpdateDonViHanhChinhDTO {
  @ApiProperty({
    description: 'Mã đơn vị hành chính',
    example: 'DN',
    required: false,
  })
  @IsOptional()
  @IsString()
  ma?: string;

  @ApiProperty({
    description: 'Tên đơn vị hành chính',
    example: 'Thành phố Đà Nẵng',
    required: false,
  })
  @IsOptional()
  @IsString()
  ten?: string;

  @ApiProperty({
    description: 'Cấp hành chính: 1 - Tỉnh/Thành phố, 2 - Xã/Phường',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2)
  cap?: number;

  @ApiProperty({
    description: 'Loại đơn vị hành chính',
    example: 'Thành phố',
    required: false,
  })
  @IsOptional()
  @IsEnum(['Tỉnh', 'Thành phố', 'Xã', 'Phường'], {
    message: 'Loại phải là: Tỉnh, Thành phố, Xã, hoặc Phường',
  })
  loai?: string;

  @ApiProperty({
    description: 'Mô tả',
    example: 'Thành phố trực thuộc Trung ương',
    required: false,
  })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  trangThai?: boolean;

  @ApiProperty({
    description: 'ID Tỉnh/Thành phố (chỉ áp dụng cho cấp 2 - Xã/Phường)',
    example: 'uuid-tinh-thanh-pho',
    required: false,
  })
  @IsOptional()
  @IsString()
  tinhThanhPhoId?: string;
}
