import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateSuKienDto {
  @ApiProperty({
    description: 'Tên sự kiện',
    required: true,
    example: 'Họp Ban Chấp hành tháng 10/2025'
  })
  @IsNotEmpty({ message: 'Tên sự kiện không được để trống' })
  @IsString({ message: 'Tên sự kiện phải là chuỗi ký tự' })
  tenSuKien: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu',
    required: true,
    example: '2025-10-15T08:00:00.000Z'
  })
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsDateString({}, { message: 'Thời gian bắt đầu phải là định dạng ngày hợp lệ' })
  thoiGianBatDau: string;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    required: false,
    example: '2025-10-15T11:00:00.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian kết thúc phải là định dạng ngày hợp lệ' })
  thoiGianKetThuc?: string;

  @ApiProperty({
    description: 'Người tạo sự kiện (tự động lấy từ JWT, không cần gửi)',
    required: false,
    example: 'user123'
  })
  @IsOptional()
  @IsString({ message: 'ID người tạo phải là chuỗi ký tự' })
  nguoiTao?: string;

  @ApiProperty({
    description: 'Nội dung chi tiết sự kiện',
    required: false,
    example: 'Họp định kỳ tháng 10, báo cáo tình hình hoạt động và kế hoạch tháng tiếp theo'
  })
  @IsOptional()
  @IsString({ message: 'Nội dung sự kiện phải là chuỗi ký tự' })
  noiDungSuKien?: string;

  @ApiProperty({
    description: 'Địa điểm tổ chức',
    required: false,
    example: 'Phòng họp tầng 2'
  })
  @IsOptional()
  @IsString({ message: 'Địa điểm phải là chuỗi ký tự' })
  diaDiem?: string;

  @ApiProperty({
    description: 'Trạng thái sự kiện',
    required: false,
    example: 'Đang chuẩn bị',
    enum: ['Đang chuẩn bị', 'Đang diễn ra', 'Đã kết thúc', 'Đã hủy']
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  trangThai?: string;

  @ApiProperty({
    description: 'Đối tượng tham gia',
    required: false,
    example: 'Ban Chấp hành Công đoàn'
  })
  @IsOptional()
  @IsString({ message: 'Đối tượng tham gia phải là chuỗi ký tự' })
  doiTuong?: string;

  @ApiProperty({
    description: 'ID loại sự kiện',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID loại sự kiện phải là số' })
  loaiSuKienId?: number;

  @ApiProperty({
    description: 'Số lượng dự kiến tham gia',
    required: false,
    example: 15
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng tham gia phải là số' })
  soLuongThamGiaDuKien?: number;

  @ApiProperty({
    description: 'Ghi chú thêm',
    required: false,
    example: 'Cần chuẩn bị tài liệu báo cáo'
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  ghiChu?: string;
}

export class UpdateSuKienDto {
  @ApiProperty({
    description: 'ID sự kiện cần cập nhật',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID sự kiện không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID phải là số' })
  id: number;

  @ApiProperty({
    description: 'Tên sự kiện',
    required: false,
    example: 'Họp Ban Chấp hành tháng 10/2025'
  })
  @IsOptional()
  @IsString({ message: 'Tên sự kiện phải là chuỗi ký tự' })
  tenSuKien?: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu',
    required: false,
    example: '2025-10-15T08:00:00.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian bắt đầu phải là định dạng ngày hợp lệ' })
  thoiGianBatDau?: string;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    required: false,
    example: '2025-10-15T11:00:00.000Z'
  })
  @IsOptional()
  @IsDateString({}, { message: 'Thời gian kết thúc phải là định dạng ngày hợp lệ' })
  thoiGianKetThuc?: string;

  @ApiProperty({
    description: 'Nội dung chi tiết sự kiện',
    required: false,
    example: 'Họp định kỳ tháng 10, báo cáo tình hình hoạt động'
  })
  @IsOptional()
  @IsString({ message: 'Nội dung sự kiện phải là chuỗi ký tự' })
  noiDungSuKien?: string;

  @ApiProperty({
    description: 'Địa điểm tổ chức',
    required: false,
    example: 'Phòng họp tầng 2'
  })
  @IsOptional()
  @IsString({ message: 'Địa điểm phải là chuỗi ký tự' })
  diaDiem?: string;

  @ApiProperty({
    description: 'Trạng thái sự kiện',
    required: false,
    example: 'Đang diễn ra'
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  trangThai?: string;

  @ApiProperty({
    description: 'Đối tượng tham gia',
    required: false,
    example: 'Ban Chấp hành Công đoàn'
  })
  @IsOptional()
  @IsString({ message: 'Đối tượng tham gia phải là chuỗi ký tự' })
  doiTuong?: string;

  @ApiProperty({
    description: 'ID loại sự kiện',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID loại sự kiện phải là số' })
  loaiSuKienId?: number;

  @ApiProperty({
    description: 'Số lượng dự kiến tham gia',
    required: false,
    example: 20
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số lượng tham gia phải là số' })
  soLuongThamGiaDuKien?: number;

  @ApiProperty({
    description: 'Ghi chú thêm',
    required: false,
    example: 'Đã cập nhật tài liệu'
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  ghiChu?: string;
}

export class ListSuKienDto {
  @ApiProperty({
    description: 'Số trang',
    default: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Số trang phải là số' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page?: number = 1;

  @ApiProperty({
    description: 'Số lượng bản ghi mỗi trang',
    default: 10,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Limit phải là số' })
  @Min(1, { message: 'Limit phải lớn hơn 0' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Từ khóa tìm kiếm theo tên sự kiện',
    required: false,
    example: 'họp'
  })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi ký tự' })
  search?: string;

  @ApiProperty({
    description: 'Lọc theo trạng thái',
    required: false,
    example: 'Đang chuẩn bị'
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi ký tự' })
  trangThai?: string;

  @ApiProperty({
    description: 'Lọc theo loại sự kiện',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID loại sự kiện phải là số' })
  loaiSuKienId?: number;
}

export class UploadFileDto {
  @ApiProperty({
    description: 'Files đính kèm',
    type: 'array',
    items: { type: 'string', format: 'binary' }
  })
  files: Express.Multer.File[];
}
