import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCauHinhDTO {
  @ApiPropertyOptional({ description: 'Giá trị' })
  @IsOptional()
  @IsString()
  giaTri?: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;
}
