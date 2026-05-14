import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDTO {
  @ApiProperty({
    description: 'Họ tên đầy đủ của người dùng',
    example: 'Nguyễn Văn A',
    required: false,
  })
  @IsOptional()
  @IsString()
  hoTen?: string;

  @ApiProperty({
    description: 'Email của người dùng',
    example: 'nguyenvana@gmail.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Số điện thoại của người dùng',
    example: '0123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  soDienThoai?: string;

  @ApiProperty({
    description: 'Mật khẩu hiện tại (bắt buộc nếu muốn đổi email/mật khẩu)',
    example: '123456',
    required: false,
  })
  @IsOptional()
  @IsString()
  currentPassword?: string;

  @ApiProperty({
    description: 'Mật khẩu mới (nếu muốn đổi mật khẩu)',
    example: 'newPassword123',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  newPassword?: string;
}
