import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateChucVuDto {
  @ApiProperty({
    description: 'Tên chức vụ',
    required: true,
    example: 'Chủ tịch'
  })
  @IsNotEmpty({ message: 'Tên chức vụ không được để trống' })
  @IsString({ message: 'Tên chức vụ phải là chuỗi ký tự' })
  tenChucVu: string;

  @ApiProperty({
    description: 'Mô tả về chức vụ',
    required: false,
    example: 'Chủ tịch công đoàn cơ sở'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;
}

export class UpdateChucVuDto {
  @ApiProperty({
    description: 'ID chức vụ cần cập nhật',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID chức vụ không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;

  @ApiProperty({
    description: 'Tên chức vụ',
    required: false,
    example: 'Chủ tịch'
  })
  @IsOptional()
  @IsString({ message: 'Tên chức vụ phải là chuỗi ký tự' })
  tenChucVu?: string;

  @ApiProperty({
    description: 'Mô tả về chức vụ',
    required: false,
    example: 'Chủ tịch công đoàn cơ sở'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;
}

export class ListChucVuDto {
  @ApiProperty({
    description: 'Số trang',
    default: 1,
    required: false
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Số trang phải là số' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page?: number;

  @ApiProperty({
    description: 'Số lượng bản ghi mỗi trang',
    default: 10,
    required: false
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(1, { message: 'Số lượng phải lớn hơn 0' })
  limit?: number;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    required: false,
    example: 'Chủ tịch'
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi ký tự' })
  search?: string;
}

export class GetDetailChucVuDto {
  @ApiProperty({
    description: 'ID chức vụ',
    required: true,
    example: 1
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;
}
