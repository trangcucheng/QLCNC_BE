import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate,IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class createOrganizationDto {
  @ApiProperty({
    description: 'Tên tổ chức',
    required: true,
    example: 'Công ty TNHH ABC'
  })
  @IsNotEmpty({ message: 'Tên tổ chức không được để trống' })
  @IsString({ message: 'Tên tổ chức phải là chuỗi ký tự' })
  name: string;

  @ApiProperty({
    description: 'ID cụm khu công nghiệp',
    required: false,
    example: 1
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: 'ID cụm khu công nghiệp phải là số' })
  cumKhuCnId?: number;

  @ApiProperty({
    description: 'Ngành nghề sản xuất kinh doanh',
    required: false,
    example: 'Sản xuất may mặc'
  })
  @IsOptional()
  @IsString({ message: 'Ngành nghề sản xuất kinh doanh phải là chuỗi ký tự' })
  nganhNgheSxKinhDoanh?: string;

  @ApiProperty({
    description: 'Số lượng công nhân viên chức lao động nam',
    required: false,
    default: 0,
    example: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongNhanVienChucLdNam?: number;

  @ApiProperty({
    description: 'Số lượng công nhân viên chức lao động nữ',
    required: false,
    default: 0,
    example: 30
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongNhanVienChucLdNu?: number;

  @ApiProperty({
    description: 'Số lượng công đoàn nam',
    required: false,
    default: 0,
    example: 45
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongDoanNam?: number;

  @ApiProperty({
    description: 'Số lượng công đoàn nữ',
    required: false,
    default: 0,
    example: 25
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongDoanNu?: number;

  @ApiProperty({
    description: 'Loại hình',
    required: false,
    example: 'Công ty tư nhân'
  })
  @IsOptional()
  @IsString({ message: 'Loại hình phải là chuỗi ký tự' })
  loaiHinh?: string;

  @ApiProperty({
    description: 'Loại công ty',
    required: false,
    example: 'TNHH'
  })
  @IsOptional()
  @IsString({ message: 'Loại công ty phải là chuỗi ký tự' })
  loaiCongTy?: string;

  @ApiProperty({
    description: 'Ngày thành lập',
    required: false,
    example: '2020-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày thành lập phải là định dạng ngày hợp lệ' })
  namThanhLap?: Date;

  @ApiProperty({
    description: 'Quốc gia',
    required: false,
    example: 'Việt Nam'
  })
  @IsOptional()
  @IsString({ message: 'Quốc gia phải là chuỗi ký tự' })
  quocGia?: string;

  @ApiProperty({
    description: 'ID xã phường',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID xã phường phải là số' })
  xaPhuongId?: number;

  @ApiProperty({
    description: 'Ghi chú',
    required: false,
    example: 'Ghi chú về tổ chức'
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  ghiChu?: string;

  @ApiProperty({
    description: 'Tên chủ tịch công đoàn',
    required: false,
    example: 'Nguyễn Văn A'
  })
  @IsOptional()
  @IsString({ message: 'Tên chủ tịch công đoàn phải là chuỗi ký tự' })
  tenChuTichCongDoan?: string;

  @ApiProperty({
    description: 'Số điện thoại chủ tịch',
    required: false,
    example: '0123456789'
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  sdtChuTich?: string;

  @ApiProperty({
    description: 'Địa chỉ',
    required: false,
    example: '123 Đường ABC, Quận XYZ, TP HCM'
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  diaChi?: string;

  @ApiProperty({
    description: 'ID công đoàn cấp trên',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID công đoàn cấp trên phải là số' })
  organizationParentId?: number;

  @ApiProperty({
    description: 'Cấp độ tổ chức',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Cấp độ tổ chức phải là số' })
  @Min(1, { message: 'Cấp độ tổ chức không được nhỏ hơn 1' })
  organizationLevel?: number;

  @ApiProperty({
    description: 'Số Ủy viên Ban Chấp hành',
    required: false,
    default: 0,
    example: 7
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số Ủy viên BCH phải là số' })
  @Min(0, { message: 'Số Ủy viên BCH không được âm' })
  @Max(50, { message: 'Số Ủy viên BCH không được quá 50' })
  soUyVienBch?: number;

  @ApiProperty({
    description: 'Số Ủy viên Ủy ban Kiểm tra',
    required: false,
    default: 0,
    example: 3
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số Ủy viên UBKT phải là số' })
  @Min(0, { message: 'Số Ủy viên UBKT không được âm' })
  @Max(20, { message: 'Số Ủy viên UBKT không được quá 20' })
  soUyVienUbkt?: number;

  @ApiProperty({
    description: 'Tổng số lượng công đoàn',
    required: false,
    default: 0,
    example: 70
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số công đoàn phải là số' })
  @Min(0, { message: 'Tổng số công đoàn không được âm' })
  tongSoCongDoan?: number;

  @ApiProperty({
    description: 'Tổng số lượng công nhân viên chức lao động',
    required: false,
    default: 0,
    example: 80
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số CNVCLĐ phải là số' })
  @Min(0, { message: 'Tổng số CNVCLĐ không được âm' })
  tongSoCnvcld?: number;
}

export class updateOrganizationDto {
  @ApiProperty({
    description: 'ID tổ chức cần cập nhật',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID tổ chức không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID tổ chức phải là số' })
  id: number;

  @ApiProperty({
    description: 'Tên tổ chức',
    required: false,
    example: 'Công ty TNHH ABC'
  })
  @IsOptional()
  @IsString({ message: 'Tên tổ chức phải là chuỗi ký tự' })
  name?: string;

  @ApiProperty({
    description: 'ID cụm khu công nghiệp',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID cụm khu công nghiệp phải là số' })
  cumKhuCnId?: number;

  @ApiProperty({
    description: 'Ngành nghề sản xuất kinh doanh',
    required: false,
    example: 'Sản xuất may mặc'
  })
  @IsOptional()
  @IsString({ message: 'Ngành nghề sản xuất kinh doanh phải là chuỗi ký tự' })
  nganhNgheSxKinhDoanh?: string;

  @ApiProperty({
    description: 'Số lượng công nhân viên chức lao động nam',
    required: false,
    example: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongNhanVienChucLdNam?: number;

  @ApiProperty({
    description: 'Số lượng công nhân viên chức lao động nữ',
    required: false,
    example: 30
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongNhanVienChucLdNu?: number;

  @ApiProperty({
    description: 'Số lượng công đoàn nam',
    required: false,
    example: 45
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongDoanNam?: number;

  @ApiProperty({
    description: 'Số lượng công đoàn nữ',
    required: false,
    example: 25
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng phải là số' })
  @Min(0, { message: 'Số lượng không được âm' })
  slCongDoanNu?: number;

  @ApiProperty({
    description: 'Loại hình',
    required: false,
    example: 'Công ty tư nhân'
  })
  @IsOptional()
  @IsString({ message: 'Loại hình phải là chuỗi ký tự' })
  loaiHinh?: string;

  @ApiProperty({
    description: 'Loại công ty',
    required: false,
    example: 'TNHH'
  })
  @IsOptional()
  @IsString({ message: 'Loại công ty phải là chuỗi ký tự' })
  loaiCongTy?: string;

  @ApiProperty({
    description: 'Ngày thành lập',
    required: false,
    example: '2020-01-15T00:00:00.000Z',
    type: 'string',
    format: 'date-time'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Ngày thành lập phải là định dạng ngày hợp lệ' })
  namThanhLap?: Date;

  @ApiProperty({
    description: 'Quốc gia',
    required: false,
    example: 'Việt Nam'
  })
  @IsOptional()
  @IsString({ message: 'Quốc gia phải là chuỗi ký tự' })
  quocGia?: string;

  @ApiProperty({
    description: 'ID xã phường',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID xã phường phải là số' })
  xaPhuongId?: number;

  @ApiProperty({
    description: 'Ghi chú',
    required: false,
    example: 'Ghi chú về tổ chức'
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  ghiChu?: string;

  @ApiProperty({
    description: 'Tên chủ tịch công đoàn',
    required: false,
    example: 'Nguyễn Văn A'
  })
  @IsOptional()
  @IsString({ message: 'Tên chủ tịch công đoàn phải là chuỗi ký tự' })
  tenChuTichCongDoan?: string;

  @ApiProperty({
    description: 'Số điện thoại chủ tịch',
    required: false,
    example: '0123456789'
  })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  sdtChuTich?: string;

  @ApiProperty({
    description: 'Địa chỉ',
    required: false,
    example: '123 Đường ABC, Quận XYZ, TP HCM'
  })
  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
  diaChi?: string;

  @ApiProperty({
    description: 'ID công đoàn cấp trên',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID công đoàn cấp trên phải là số' })
  organizationParentId?: number;

  @ApiProperty({
    description: 'Số Ủy viên Ban Chấp hành',
    required: false,
    default: 0,
    example: 7
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số Ủy viên BCH phải là số' })
  @Min(0, { message: 'Số Ủy viên BCH không được âm' })
  @Max(50, { message: 'Số Ủy viên BCH không được quá 50' })
  soUyVienBch?: number;

  @ApiProperty({
    description: 'Số Ủy viên Ủy ban Kiểm tra',
    required: false,
    default: 0,
    example: 3
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số Ủy viên UBKT phải là số' })
  @Min(0, { message: 'Số Ủy viên UBKT không được âm' })
  @Max(20, { message: 'Số Ủy viên UBKT không được quá 20' })
  soUyVienUbkt?: number;

  @ApiProperty({
    description: 'Tổng số lượng công đoàn',
    required: false,
    default: 0,
    example: 70
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số công đoàn phải là số' })
  @Min(0, { message: 'Tổng số công đoàn không được âm' })
  tongSoCongDoan?: number;

  @ApiProperty({
    description: 'Tổng số lượng công nhân viên chức lao động',
    required: false,
    default: 0,
    example: 80
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Tổng số CNVCLĐ phải là số' })
  @Min(0, { message: 'Tổng số CNVCLĐ không được âm' })
  tongSoCnvcld?: number;
}

export class MergeOrganizationDto {
  @ApiProperty({
    description: 'ID tổ chức cha (sẽ nhận)',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID tổ chức cha không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID tổ chức cha phải là số' })
  organizationParentId?: number;

  @ApiProperty({
    description: 'Cấp độ tổ chức',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Cấp độ tổ chức phải là số' })
  @Min(1, { message: 'Cấp độ tổ chức không được nhỏ hơn 1' })
  organizationLevel?: number;
}
