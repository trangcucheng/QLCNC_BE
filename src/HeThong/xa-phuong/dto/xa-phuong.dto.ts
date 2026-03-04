import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateXaPhuongDto {
  @ApiProperty({
    description: 'Tên xã phường',
    required: true,
    example: 'Phường Tân Thuận Đông'
  })
  @IsNotEmpty({ message: 'Tên xã phường không được để trống' })
  @IsString({ message: 'Tên xã phường phải là chuỗi ký tự' })
  ten: string;

  @ApiProperty({
    description: 'Mô tả về xã phường',
    required: false,
    example: 'Phường thuộc Quận 7, TP. Hồ Chí Minh'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;
}

export class UpdateXaPhuongDto {
  @ApiProperty({
    description: 'ID xã phường cần cập nhật',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID xã phường không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;

  @ApiProperty({
    description: 'Tên xã phường',
    required: false,
    example: 'Phường Tân Thuận Đông'
  })
  @IsOptional()
  @IsString({ message: 'Tên xã phường phải là chuỗi ký tự' })
  ten?: string;

  @ApiProperty({
    description: 'Mô tả về xã phường',
    required: false,
    example: 'Phường thuộc Quận 7, TP. Hồ Chí Minh'
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  moTa?: string;
}

export class ListXaPhuongDto {
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

export class GetDetailXaPhuongDto {
  @ApiProperty({
    description: 'ID xã phường',
    required: true,
    example: 1
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;
}
