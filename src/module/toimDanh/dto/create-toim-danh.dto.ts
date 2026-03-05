import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateToimDanhDTO {
  @ApiProperty({
    description: 'Mã tội danh',
    example: 'TD001',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  ma: string;

  @ApiProperty({
    description: 'Tên tội danh',
    example: 'Trộm cắp tài sản',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  ten: string;

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
