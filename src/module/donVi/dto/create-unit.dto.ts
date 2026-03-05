import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateUnitDTO {
  @ApiProperty({
    description: 'Mã đơn vị',
    example: 'DV001',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  ma: string;

  @ApiProperty({
    description: 'Tên đơn vị',
    example: 'Phòng Kinh doanh',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  ten: string;

  @ApiProperty({
    description: 'Mô tả',
    example: 'Phụ trách bán hàng và chăm sóc khách hàng',
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
  trangThai?: boolean;

  @ApiProperty({
    description: 'ID đơn vị cha',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsString()
  donViChaId?: string;
}
