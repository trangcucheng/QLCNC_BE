import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsObject,IsOptional, IsString } from 'class-validator';

export class ElasticSearchDto {
  @ApiProperty({ required: false, description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Số trang', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số bản ghi mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Bộ lọc theo các trường' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiProperty({ required: false, description: 'Sắp xếp theo trường' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({ required: false, description: 'Thứ tự sắp xếp (asc/desc)', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}

export class ExportDto {
  @ApiProperty({ required: false, description: 'Từ khóa tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Bộ lọc theo các trường' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiProperty({ required: false, description: 'Sắp xếp theo trường' })
  @IsOptional()
  @IsString()
  sortField?: string;

  @ApiProperty({ required: false, description: 'Thứ tự sắp xếp (asc/desc)', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}
