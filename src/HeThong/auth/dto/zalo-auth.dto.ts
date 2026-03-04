import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class ZaloLoginDto {
  @ApiProperty({
    description: 'Zalo access token từ mini app',
    required: false,
    example: 'zalo_access_token_here'
  })
  @IsOptional()
  @IsString({ message: 'Access token phải là chuỗi' })
  accessToken?: string;

  @ApiProperty({
    description: 'Code từ Zalo OAuth',
    required: false,
    example: 'authorization_code_here'
  })
  @IsOptional()
  @IsString({ message: 'Authorization code phải là chuỗi' })
  code?: string;
}

export class ZaloAccountInfoDto {
  @ApiProperty({ description: 'ID bản ghi Zalo Account', example: 1 })
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiProperty({ description: 'ID người dùng trong hệ thống', example: 123 })
  @IsOptional()
  @IsNumber()
  user_id?: number;

  @ApiProperty({ description: 'Zalo OA User ID (ID người dùng khi tương tác với OA)', example: '1234567890123456789' })
  @IsOptional()
  @IsString()
  zalo_oa_user_id?: string;

  @ApiProperty({ description: 'Zalo App User ID (ID người dùng của app)', example: '6695250617158045749' })
  @IsOptional()
  @IsString()
  zalo_app_user_id?: string;

  @ApiProperty({ description: 'Tên hiển thị của người dùng Zalo', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  display_name?: string;

  @ApiProperty({ description: 'Ảnh đại diện người dùng Zalo', example: 'https://s120-ava-talk.zadn.vn/abc123.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Trạng thái theo dõi OA', example: true })
  @IsOptional()
  @IsBoolean()
  is_following_oa?: boolean;

  @ApiProperty({ description: 'Thời gian bắt đầu theo dõi OA', example: '2025-10-01T08:00:00Z' })
  @IsOptional()
  @IsDateString()
  last_follow_at?: string;

  @ApiProperty({ description: 'Thời gian bỏ theo dõi OA', example: '2025-10-10T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  last_unfollow_at?: string;

  @ApiProperty({ description: 'Thời gian hoạt động gần nhất của tài khoản', example: '2025-10-11T14:20:00Z' })
  @IsOptional()
  @IsDateString()
  last_active_at?: string;

  @ApiProperty({ description: 'Thời gian tạo bản ghi', example: '2025-10-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  created_at?: string;

  @ApiProperty({ description: 'Thời gian cập nhật bản ghi', example: '2025-10-11T15:00:00Z' })
  @IsOptional()
  @IsDateString()
  updated_at?: string;

  @ApiProperty({ description: 'ID Mini App (nếu có)', example: '2615059320225385531' })
  @IsOptional()
  @IsString()
  zalo_mini_app_id?: string;

  @ApiProperty({ description: 'Số điện thoại người dùng', example: '0987654321' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Thông tin bổ sung của người dùng (JSON)', example: '{"gender":"male","region":"Hanoi"}' })
  @IsOptional()
  @IsString()
  additional_info?: string;

  @ApiProperty({ description: 'Thời gian đăng nhập gần nhất', example: '2025-10-12T03:40:00Z' })
  @IsOptional()
  @IsDateString()
  last_login_at?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động của tài khoản', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class ZaloAuthResponseDto {
  @ApiProperty({
    description: 'JWT token để sử dụng trong app',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;

  @ApiProperty({
    description: 'Thông tin người dùng Zalo',
  })

  @ApiProperty({
    description: 'Thời gian hết hạn token (seconds)',
    example: 3600
  })
  expiresIn: number;
}
