import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCongTyChuaCoCDDto {
  @ApiProperty({ required: true, description: 'Tên công ty' })
  @IsNotEmpty()
  @IsString()
  ten: string;

  @ApiProperty({ required: false, description: 'ID cụm khu công nghiệp' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cumKCNId: number;
}
