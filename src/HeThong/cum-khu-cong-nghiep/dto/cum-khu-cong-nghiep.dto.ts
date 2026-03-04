import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCumKhuCongNghiepDto {
  @ApiProperty({
    description: 'Tên cụm khu công nghiệp',
    required: true,
    example: 'Cụm CN Tân Thuận'
  })
  @IsNotEmpty({ message: 'Tên cụm khu công nghiệp không được để trống' })
  @IsString({ message: 'Tên cụm khu công nghiệp phải là chuỗi ký tự' })
  ten: string;

  @ApiProperty({
    description: 'Mô tả về cụm khu công nghiệp',
    required: false,
    example: 'Cụm khu công nghiệp hiện đại với đầy đủ tiện ích'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;

  @ApiProperty({
    description: 'Địa chỉ cụm khu công nghiệp',
    required: false,
    example: 'Quận 7, TP. Hồ Chí Minh'
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  diaChi?: string;
}

export class UpdateCumKhuCongNghiepDto {
  @ApiProperty({
    description: 'ID cụm khu công nghiệp cần cập nhật',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID cụm khu công nghiệp không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;

  @ApiProperty({
    description: 'Tên cụm khu công nghiệp',
    required: false,
    example: 'Cụm CN Tân Thuận'
  })
  @IsOptional()
  @IsString({ message: 'Tên cụm khu công nghiệp phải là chuỗi ký tự' })
  ten?: string;

  @ApiProperty({
    description: 'Mô tả về cụm khu công nghiệp',
    required: false,
    example: 'Cụm khu công nghiệp hiện đại với đầy đủ tiện ích'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;

  @ApiProperty({
    description: 'Địa chỉ cụm khu công nghiệp',
    required: false,
    example: 'Quận 7, TP. Hồ Chí Minh'
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  diaChi?: string;
}

export class ListCumKhuCongNghiepDto {
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
    example: 'Tân Thuận'
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi ký tự' })
  search?: string;
}

export class GetDetailCumKhuCongNghiepDto {
  @ApiProperty({
    description: 'ID cụm khu công nghiệp',
    required: true,
    example: 1
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;
}
