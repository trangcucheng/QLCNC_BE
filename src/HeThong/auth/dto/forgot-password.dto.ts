import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNotEmpty()
  newPassword: string;
}

export class ForgotPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNotEmpty()
  username: string;
}

export class NewPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNotEmpty()
  password: string;
}
