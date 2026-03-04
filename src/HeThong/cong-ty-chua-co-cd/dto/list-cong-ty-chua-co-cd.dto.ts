import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ListCongTyChuaCoCDDto {
  @ApiProperty({ default: 1, required: true, description: 'Trang hiện tại' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 10, required: true, description: 'Số lượng bản ghi mỗi trang' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({ required: false, description: 'Tìm kiếm theo tên công ty hoặc cụm khu CN' })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ required: false, description: 'Lọc theo ID cụm khu công nghiệp' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  cumKCNId: number;
}

export class GetCongTyChuaCoCDDto {
  @ApiProperty({ required: true, description: 'ID công ty' })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  id: number;
}
