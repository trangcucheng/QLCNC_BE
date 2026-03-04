import { ApiProperty } from '@nestjs/swagger';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength
} from 'class-validator';

export class SigninDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  userName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  passWord: string;
}

export class SigninUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  identity: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  passWord: string;
}

export class forgetPassDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class reSendCodeDto {

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class SendUnlockCodeDto {
  @ApiProperty({ required: true, description: 'Email của tài khoản bị khóa' })
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class UnlockAccountDto {
  @ApiProperty({ required: true, description: 'Email của tài khoản bị khóa' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ required: true, description: 'Mã xác nhận được gửi về email' })
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class ResetPasswordByUserNameDto {
  @ApiProperty({ required: true, description: 'Tên đăng nhập của tài khoản cần reset mật khẩu' })
  @IsNotEmpty()
  @IsString()
  userName: string;
}
