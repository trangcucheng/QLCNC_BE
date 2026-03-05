import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LoaiNguoiDung } from '@prisma/client';

export class CreateUserDTO {
  @ApiProperty({
    description: 'Họ tên đầy đủ của người dùng',
    example: 'Nguyễn Việt Đức',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  hoTen: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'vietducqb113@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Mật khẩu của người dùng',
    example: '123456',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  matKhau: string;

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
    required: true,
  })
  @IsEnum(LoaiNguoiDung)
  @IsNotEmpty()
  loaiNguoiDung: LoaiNguoiDung;

  @ApiProperty({
    description: 'Trạng thái hoạt động của người dùng',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  trangThaiHoatDong?: boolean;
}
