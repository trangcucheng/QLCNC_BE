import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateToimDanhDTO {
  @ApiProperty({
    description: 'Mã tội danh',
    example: 'TD001',
    required: false,
  })
  @IsOptional()
  @IsString()
  ma?: string;

  @ApiProperty({
    description: 'Tên tội danh',
    example: 'Trộm cắp tài sản',
    required: false,
  })
  @IsOptional()
  @IsString()
  ten?: string;

  @ApiProperty({
    description: 'Mô tả',
    example: 'Hành vi chiếm đoạt tài sản của người khác',
    required: false,
  })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({
    description: 'Khung hình phạt',
    example: 'Phạt tù từ 6 tháng đến 3 năm',
    required: false,
  })
  @IsOptional()
  @IsString()
  khungHinhPhat?: string;
}
