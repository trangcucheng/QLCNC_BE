import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class GetAllDonViHanhChinhDTO {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @ApiPropertyOptional({ type: String, enum: ['asc', 'desc'] })
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ 
    type: Number, 
    description: 'Lọc theo cấp: 1 - Tỉnh/Thành phố, 2 - Xã/Phường',
  })
  @IsOptional()
  @IsNumberString()
  cap?: string;

  @ApiPropertyOptional({ 
    type: String, 
    description: 'ID Tỉnh/Thành phố để lọc Xã/Phường thuộc',
  })
  @IsOptional()
  @IsString()
  tinhThanhPhoId?: string;
}
