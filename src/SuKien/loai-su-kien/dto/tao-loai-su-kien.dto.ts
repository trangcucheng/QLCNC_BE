import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsBoolean } from 'class-validator';

export class CreateLoaiSuKienDto {
  @ApiProperty({
    description: 'Tên loại sự kiện',
    required: true,
    example: 'Họp Ban Chấp hành'
  })
  @IsNotEmpty({ message: 'Tên loại sự kiện không được để trống' })
  @IsString({ message: 'Tên loại sự kiện phải là chuỗi ký tự' })
  ten: string;

  @ApiProperty({
    description: 'Mô tả loại sự kiện',
    required: false,
    example: 'Cuộc họp định kỳ của Ban Chấp hành Công đoàn'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    required: false,
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  trangThai?: boolean;
}

export class UpdateLoaiSuKienDto {
  @ApiProperty({
    description: 'ID loại sự kiện cần cập nhật',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID loại sự kiện không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;

  @ApiProperty({
    description: 'Tên loại sự kiện',
    required: false,
    example: 'Họp Ban Chấp hành'
  })
  @IsOptional()
  @IsString({ message: 'Tên loại sự kiện phải là chuỗi ký tự' })
  ten?: string;

  @ApiProperty({
    description: 'Mô tả loại sự kiện',
    required: false,
    example: 'Cuộc họp định kỳ của Ban Chấp hành Công đoàn'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    required: false,
    example: true
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái phải là boolean' })
  trangThai?: boolean;
}

export class ListLoaiSuKienDto {
  @ApiProperty({
    description: 'Số trang',
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số trang phải là số' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng bản ghi mỗi trang',
    default: 10,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit phải là số' })
  @Min(1, { message: 'Limit phải lớn hơn 0' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm theo tên loại sự kiện',
    required: false,
    example: 'họp'
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi ký tự' })
  search?: string;
}

export class GetDetailLoaiSuKienDto {
  @ApiProperty({
    description: 'ID loại sự kiện',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID loại sự kiện không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;
}
