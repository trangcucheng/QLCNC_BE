// QuanHeXaHoi DTOs
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumberString } from 'class-validator';

export class CreateQuanHeXaHoiDTO {
  @ApiProperty({ description: 'Tên quan hệ', example: 'Cha' })
  @IsNotEmpty()
  @IsString()
  tenQuanHe: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;
}

export class UpdateQuanHeXaHoiDTO {
  @ApiPropertyOptional({ description: 'Tên quan hệ' })
  @IsOptional()
  @IsString()
  tenQuanHe?: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;
}

export class GetAllQuanHeXaHoiDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  orderBy?: string;
}
