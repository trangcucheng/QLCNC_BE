import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SaveTokenDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  expired: string;
}
