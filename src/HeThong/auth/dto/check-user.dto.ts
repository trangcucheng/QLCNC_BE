import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class CheckUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsNumberString()
  phoneNumber: string;
}
