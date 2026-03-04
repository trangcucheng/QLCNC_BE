import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsMobilePhone, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';
export class SignupDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  passWord: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  identity: string;

  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  userName: string;

  @ApiProperty({ required: true })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ default: 2 })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  roleId: number;

  @ApiProperty({ required: false, description: 'ID của cụm khu công nghiệp' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  cumKhuCnId: number;

  @ApiProperty({ required: false, description: 'ID của xã phường' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  xaPhuongId: number;


  @ApiProperty({ required: false, description: 'ID của xã phường' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  organizationId: number;

  @ApiProperty({ required: false, description: 'ID của Zalo Account để liên kết (optional)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  zaloAccountId: number;
}

export class confirmationInput {
  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @ApiProperty()
  code: string;
}

export class resetPassword {
  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  passWord: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  repassWord: string;
}

export class approveIdentityDto {
  @ApiProperty({ required: true })
  @IsString()
  email: string;
}

export class rejectIdentityDto {
  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description: string;
}
export class SignupAdminDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  passWord: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  identity: string;

  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  roleId: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  staffID: number;

  @ApiProperty({ required: false, description: 'ID của cụm khu công nghiệp' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  cumKhuCnId: number;

  @ApiProperty({ required: false, description: 'ID của xã phường' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  xaPhuongId: number;
}
