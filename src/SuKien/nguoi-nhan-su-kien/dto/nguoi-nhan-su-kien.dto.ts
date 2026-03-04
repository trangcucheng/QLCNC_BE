import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

export class CreateNguoiNhanSuKienDto {
  @ApiProperty({ description: 'ID sự kiện' })
  @IsNumber()
  @Type(() => Number)
  suKienId: number;

  @ApiPropertyOptional({ description: 'ID user (web)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({ description: 'ID zalo user (mobile)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  zaloUserId?: number;

  @ApiPropertyOptional({ description: 'Trạng thái phản hồi' })
  @IsOptional()
  @IsString()
  trangThai?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString()
  ghiChu?: string;
}

// RESPONSE DTOs cho API gửi thông báo sự kiện
export interface GuiThongBaoSuKienResponseDto {
  message: string;
  soLuongGui: number;
  daGuiCho: string[];
  loi?: string[];
  downloadLinks?: string[];
}

export interface GuiThongBaoChoTatCaResponseDto {
  message: string;
  soLuongGui: number;
  daGuiCho: string[];
  downloadLinks?: string[];
}

// RESPONSE DTOs cho API gửi thông báo sự kiện
export interface GuiThongBaoSuKienResponseDto {
  message: string;
  soLuongGui: number;
  daGuiCho: string[];
  loi?: string[];
  downloadLinks?: string[];
}

export interface GuiThongBaoChoTatCaResponseDto {
  message: string;
  soLuongGui: number;
  daGuiCho: string[];
  downloadLinks?: string[];
}

export class UpdateNguoiNhanSuKienDto extends CreateNguoiNhanSuKienDto { }

export class ListNguoiNhanSuKienDto {
  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng bản ghi', default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'ID sự kiện' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  suKienId?: number;

  @ApiPropertyOptional({ description: 'Trạng thái' })
  @IsOptional()
  @IsString()
  trangThai?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'ID tổ chức (for filtering)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  organizationId?: number;
}

export class GuiThongBaoSuKienDto {
  // ...existing code...
  @ApiProperty({
    description: 'ID sự kiện cần gửi thông báo',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID sự kiện không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID sự kiện phải là số' })
  suKienId: number;

  @ApiProperty({
    description: 'Danh sách ID người nhận thông báo (nếu muốn gửi cho người dùng cụ thể)',
    required: false,
    example: ['user1', 'user2', 'user3'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách người nhận phải là mảng' })
  @IsString({ each: true, message: 'Mỗi ID người nhận phải là chuỗi ký tự' })
  nguoiNhanIds?: string[];

  @ApiProperty({
    description: 'Danh sách ID role để gửi thông báo cho tất cả người dùng thuộc các role này',
    required: false,
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách role ID phải là mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi role ID phải là số' })
  @Type(() => Number)
  roleIds?: number[];

  @ApiProperty({
    description: 'Loại thông báo',
    required: false,
    example: 'Thông báo sự kiện',
    enum: ['Thông báo sự kiện', 'Nhắc nhở', 'Hủy sự kiện', 'Thay đổi lịch']
  })
  @IsOptional()
  @IsString({ message: 'Loại thông báo phải là chuỗi ký tự' })
  @IsIn(['Thông báo sự kiện', 'Nhắc nhở', 'Hủy sự kiện', 'Thay đổi lịch'], {
    message: 'Loại thông báo không hợp lệ'
  })
  loaiThongBao?: string;

  @ApiProperty({
    description: 'Ghi chú thêm cho thông báo',
    required: false,
    example: 'Vui lòng chuẩn bị tài liệu trước khi tham gia'
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  ghiChu?: string;

  @ApiProperty({
    description: 'Danh sách file đính kèm (tên file)',
    required: false,
    example: ['document.pdf', 'image.jpg'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách file phải là mảng' })
  @IsString({ each: true, message: 'Tên file phải là chuỗi ký tự' })
  fileDinhKem?: string[];
}

export class CapNhatTrangThaiXemDto {
  @ApiProperty({
    description: 'ID người nhận',
    required: true,
    example: 'user123'
  })
  @IsNotEmpty({ message: 'ID người nhận không được để trống' })
  @IsString({ message: 'ID người nhận phải là chuỗi ký tự' })
  nguoiNhanId: string;

  @ApiProperty({
    description: 'ID sự kiện',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID sự kiện không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID sự kiện phải là số' })
  suKienId: number;

  @ApiProperty({
    description: 'Trạng thái xem',
    required: false,
    example: 'Đã xem',
    enum: ['Đã xem', 'Chưa xem']
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái xem phải là chuỗi ký tự' })
  @IsIn(['Đã xem', 'Chưa xem'], { message: 'Trạng thái xem không hợp lệ' })
  trangThaiXem?: string;
}

export class LayThongBaoDto {
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

  // @ApiProperty({
  //   description: 'ID người nhận (để lọc theo người dùng)',
  //   required: false,
  //   example: 'user123'
  // })
  // @IsOptional()
  // @IsString({ message: 'ID người nhận phải là chuỗi ký tự' })
  // nguoiNhanId?: string;

  @ApiProperty({
    description: 'Lọc theo trạng thái xem',
    required: false,
    example: 'Chưa xem'
  })
  @IsOptional()
  @IsString({ message: 'Trạng thái xem phải là chuỗi ký tự' })
  @IsIn(['Đã xem', 'Chưa xem'], { message: 'Trạng thái xem không hợp lệ' })
  trangThaiXem?: string;

  @ApiProperty({
    description: 'Lọc theo loại thông báo',
    required: false,
    example: 'Thông báo sự kiện'
  })
  @IsOptional()
  @IsString({ message: 'Loại thông báo phải là chuỗi ký tự' })
  loaiThongBao?: string;

  @ApiProperty({
    description: 'Lọc theo ID sự kiện',
    required: false,
    example: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID sự kiện phải là số' })
  suKienId?: number;
}

export class GuiThongBaoChoTatCaDto {
  @ApiProperty({
    description: 'ID sự kiện cần gửi thông báo',
    required: true,
    example: 1
  })
  @IsNotEmpty({ message: 'ID sự kiện không được để trống' })
  @Type(() => Number)
  @IsNumber({}, { message: 'ID sự kiện phải là số' })
  suKienId: number;

  @ApiProperty({
    description: 'Danh sách ID role để gửi thông báo (nếu không cung cấp sẽ gửi cho tất cả)',
    required: false,
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách role ID phải là mảng' })
  @IsNumber({}, { each: true, message: 'Mỗi role ID phải là số' })
  @Type(() => Number)
  roleIds?: number[];

  @ApiProperty({
    description: 'Loại thông báo',
    required: false,
    example: 'Thông báo sự kiện',
    enum: ['Thông báo sự kiện', 'Nhắc nhở', 'Hủy sự kiện', 'Thay đổi lịch']
  })
  @IsOptional()
  @IsString({ message: 'Loại thông báo phải là chuỗi ký tự' })
  @IsIn(['Thông báo sự kiện', 'Nhắc nhở', 'Hủy sự kiện', 'Thay đổi lịch'], {
    message: 'Loại thông báo không hợp lệ'
  })
  loaiThongBao?: string;

  @ApiProperty({
    description: 'Ghi chú thêm cho thông báo',
    required: false,
    example: 'Thông báo gửi tới toàn bộ thành viên'
  })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
  ghiChu?: string;

  @ApiProperty({
    description: 'Danh sách file đính kèm (tên file)',
    required: false,
    example: ['document.pdf', 'image.jpg'],
    type: [String]
  })
  @IsOptional()
  @IsArray({ message: 'Danh sách file phải là mảng' })
  @IsString({ each: true, message: 'Tên file phải là chuỗi ký tự' })
  fileDinhKem?: string[];
}
