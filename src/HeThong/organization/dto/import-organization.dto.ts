import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsDate, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class ImportOrganizationRowDto {
  @ApiProperty({ description: 'Số thứ tự' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'TT phải là số' })
  tt?: number;

  @ApiProperty({ description: 'Tên Công đoàn cơ sở' })
  @IsString({ message: 'Tên công đoàn cơ sở phải là chuỗi' })
  tenCongDoanCoSo: string;

  @ApiProperty({ description: 'Cụm Khu CN' })
  @IsOptional()
  @IsString({ message: 'Cụm Khu CN phải là chuỗi' })
  cumKhuCn?: string;

  @ApiProperty({ description: 'Ngành nghề sản xuất kinh doanh' })
  @IsOptional()
  @IsString({ message: 'Ngành nghề phải là chuỗi' })
  nganhNgheSxKinhDoanh?: string;

  @ApiProperty({ description: 'Tổng số CNVCLĐ' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số CNVCLĐ phải là số' })
  tongSoCnvcld?: number;

  @ApiProperty({ description: 'Số CNVCLĐ nam' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số CNVCLĐ nam phải là số' })
  soCnvcldNam?: number;

  @ApiProperty({ description: 'Số CNVCLĐ nữ' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số CNVCLĐ nữ phải là số' })
  soCnvcldNu?: number;

  @ApiProperty({ description: 'Tổng số ĐVCĐ' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số ĐVCĐ phải là số' })
  tongSoDvcd?: number;

  @ApiProperty({ description: 'Số ĐVCĐ nam' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số ĐVCĐ nam phải là số' })
  soDvcdNam?: number;

  @ApiProperty({ description: 'Số ĐVCĐ nữ' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số ĐVCĐ nữ phải là số' })
  soDvcdNu?: number;

  @ApiProperty({ description: 'Loại hình - Nhà nước (có giá trị = được chọn)' })
  @IsOptional()
  loaiHinhNhaNuoc?: any;

  @ApiProperty({ description: 'Loại hình - Trong nước (có giá trị = được chọn)' })
  @IsOptional()
  loaiHinhTrongNuoc?: any;

  @ApiProperty({ description: 'Loại hình - Ngoài nước (có giá trị = được chọn)' })
  @IsOptional()
  loaiHinhNgoaiNuoc?: any;

  @ApiProperty({ description: 'Loại công ty - Cổ phần (có giá trị = được chọn)' })
  @IsOptional()
  loaiCongTyCoPhan?: any;

  @ApiProperty({ description: 'Loại công ty - TNHH (có giá trị = được chọn)' })
  @IsOptional()
  loaiCongTyTnhh?: any;

  @ApiProperty({
    description: 'Ngày thành lập (có thể là Date từ Excel, số năm, hoặc chuỗi ngày)',
    example: '2020-01-01'
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return null;

    // Nếu là số (năm)
    if (typeof value === 'number' && value > 1800 && value <= new Date().getFullYear()) {
      return value;
    }

    // Nếu là string hoặc Date từ Excel
    if (typeof value === 'string' || value instanceof Date) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    return value;
  })
  namThanhLap?: Date | number | string;

  @ApiProperty({ description: 'Quốc gia' })
  @IsOptional()
  @IsString({ message: 'Quốc gia phải là chuỗi' })
  quocGia?: string;

  @ApiProperty({ description: 'Thuộc xã phường' })
  @IsOptional()
  @IsString({ message: 'Xã phường phải là chuỗi' })
  thuocXaPhuong?: string;

  @ApiProperty({ description: 'Ghi chú' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;

  @ApiProperty({ description: 'Tên chủ tịch công đoàn' })
  @IsOptional()
  @IsString({ message: 'Tên chủ tịch phải là chuỗi' })
  tenChuTichCongDoan?: string;

  @ApiProperty({ description: 'SĐT chủ tịch' })
  @IsOptional()
  @IsString({ message: 'SĐT phải là chuỗi' })
  sdtChuTich?: string;

  @ApiProperty({ description: 'Địa chỉ' })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  diaChi?: string;
}

export class ImportOrganizationDto {
  @ApiProperty({
    description: 'Dữ liệu import từ Excel',
    type: [ImportOrganizationRowDto]
  })
  @IsArray({ message: 'Dữ liệu phải là mảng' })
  @Type(() => ImportOrganizationRowDto)
  data: ImportOrganizationRowDto[];
}

export class ImportResultDto {
  @ApiProperty({ description: 'Số lượng bản ghi thành công' })
  successCount: number;

  @ApiProperty({ description: 'Số lượng bản ghi lỗi' })
  errorCount: number;

  @ApiProperty({ description: 'Chi tiết lỗi', type: [String] })
  errors: string[];

  @ApiProperty({ description: 'Danh sách ID đã tạo', type: [Number] })
  createdIds: number[];
}
