import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Họ và tên' })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ description: 'Email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Avatar' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'ID tổ chức' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  organizationId?: number;

  @ApiPropertyOptional({ description: 'ID role' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roleId?: number;

  @ApiPropertyOptional({ description: 'Trạng thái hoạt động' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({ description: 'Mật khẩu cũ' })
  @IsString()
  oldPassword: string;

  @ApiPropertyOptional({ description: 'Mật khẩu mới' })
  @IsString()
  newPassword: string;

  @ApiPropertyOptional({ description: 'Xác nhận mật khẩu mới' })
  @IsString()
  confirmPassword: string;
}

export class ListUserDto {
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

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên hoặc email' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo role' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roleId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Lọc theo tổ chức' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  organizationId?: number;
}
