import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray,IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @ApiPropertyOptional({ description: 'Tên tổ chức' })
  @IsString()
  tenToChuc: string;

  @ApiPropertyOptional({ description: 'Mã tổ chức' })
  @IsOptional()
  @IsString()
  maToChuc?: string;

  @ApiPropertyOptional({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString()
  diaChi?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Người đại diện' })
  @IsOptional()
  @IsString()
  nguoiDaiDien?: string;

  @ApiPropertyOptional({ description: 'Chức vụ người đại diện' })
  @IsOptional()
  @IsString()
  chucVuNguoiDaiDien?: string;

  @ApiPropertyOptional({ description: 'Ngày thành lập' })
  @IsOptional()
  @IsString()
  ngayThanhLap?: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional({ description: 'ID tổ chức cha' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateOrganizationDto extends CreateOrganizationDto {}

export class ListOrganizationDto {
  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng bản ghi', default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'ID tổ chức cha' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
