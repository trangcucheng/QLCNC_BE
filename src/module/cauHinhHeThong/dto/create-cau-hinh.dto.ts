import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCauHinhDTO {
  @ApiProperty({ description: 'Khóa cấu hình', example: 'APP_NAME' })
  @IsNotEmpty({ message: 'Khóa cấu hình không được để trống' })
  @IsString()
  khoa: string;

  @ApiProperty({ description: 'Giá trị', example: 'QLCNC System' })
  @IsNotEmpty({ message: 'Giá trị không được để trống' })
  @IsString()
  giaTri: string;

  @ApiPropertyOptional({ description: 'Mô tả' })
  @IsOptional()
  @IsString()
  moTa?: string;
}
