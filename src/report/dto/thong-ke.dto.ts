import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString,IsNumber, IsOptional } from 'class-validator';

export class ThongKeRequestDto {
  @ApiPropertyOptional({
    description: 'ID tổ chức để thống kê (nếu không có sẽ thống kê toàn bộ)',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID tổ chức phải là số' })
  organizationId?: number;

  @ApiPropertyOptional({
    description: 'Từ ngày (để so sánh tăng trưởng)',
    example: '2024-01-01T00:00:00.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Từ ngày phải có định dạng ngày hợp lệ' })
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Đến ngày (để so sánh tăng trưởng)',
    example: '2024-12-31T23:59:59.999Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Đến ngày phải có định dạng ngày hợp lệ' })
  toDate?: string;

  @ApiPropertyOptional({
    description: 'ID thời gian cập nhật đoàn số để thống kê',
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID thời gian cập nhật phải là số' })
  thoiGianCapNhatDoanSoId?: number;
}

export class ThongKeResponseDto {
  @ApiProperty({
    description: 'Tổng số công đoàn',
    example: 45
  })
  tongSoCongDoan: number;

  @ApiProperty({
    description: 'Tỷ lệ tăng trưởng công đoàn (%)',
    example: '+12%'
  })
  tangTruongCongDoan: string;

  @ApiProperty({
    description: 'Tổng số đoàn viên',
    example: 12500
  })
  tongSoDoanVien: number;

  @ApiProperty({
    description: 'Tỷ lệ tăng trưởng đoàn viên (%)',
    example: '+8%'
  })
  tangTruongDoanVien: string;

  @ApiProperty({
    description: 'Số sự kiện trong tháng',
    example: 32
  })
  suKienTrongThang: number;

  @ApiProperty({
    description: 'Tỷ lệ tăng trưởng sự kiện (%)',
    example: '+15%'
  })
  tangTruongSuKien: string;

  @ApiProperty({
    description: 'Số báo cáo chờ phê duyệt',
    example: 8
  })
  choPheduyet: number;

  @ApiProperty({
    description: 'Tỷ lệ thay đổi báo cáo chờ phê duyệt (%)',
    example: '-5%'
  })
  thayDoiChoPheduyet: string;

  @ApiProperty({
    description: 'Tổng số công ty chưa có công đoàn',
    example: 120
  })
  tongSoCongTyChuaCoCD: number;
}

export class ThongKeChiTietDto {
  @ApiProperty({
    description: 'Thống kê theo từng tổ chức'
  })
  theoToChuc: {
    organizationId: number;
    organizationName: string;
    soCongDoan: number;
    soDoanVien: number;
    soSuKien: number;
    soBaoCao: number;
  }[];

  @ApiProperty({
    description: 'Thống kê theo thời gian'
  })
  theoThoiGian: {
    thang: string;
    soCongDoan: number;
    soDoanVien: number;
    soSuKien: number;
    soBaoCao: number;
  }[];

  @ApiProperty({
    description: 'Thống kê trạng thái báo cáo'
  })
  trangThaiBaoCao: {
    choPheduyet: number;
    daPheduyet: number;
    tuChoi: number;
  };
}
