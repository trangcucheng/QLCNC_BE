import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoaiNguoiDung } from '@prisma/client';

export class UpdateUserDTO {
  @ApiProperty({
    description: 'Họ tên đầy đủ của người dùng',
    example: 'Nguyễn Việt Đức',
    required: false,
  })
  @IsOptional()
  @IsString()
  hoTen?: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'vietducqb113@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  matKhau?: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @ApiProperty({
    description: 'Loại người dùng',
    example: 'NGUOI_DUNG',
    enum: LoaiNguoiDung,
    required: false,
  })
  @IsOptional()
  @IsEnum(LoaiNguoiDung)
  loaiNguoiDung?: LoaiNguoiDung;

  @ApiProperty({
    description: 'Trạng thái hoạt động của người dùng',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  trangThaiHoatDong?: boolean;
}
