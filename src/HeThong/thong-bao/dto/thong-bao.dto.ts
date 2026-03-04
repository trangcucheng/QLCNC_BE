import { IsNotEmpty, IsOptional, IsString, IsInt, Min, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { TrangThaiThongBao } from '../../../databases/entities/UserThongBao.entity';

// DTO for creating ThongBao
export class CreateThongBaoDto {
  @IsNotEmpty({ message: 'Nội dung thông báo không được để trống' })
  @IsString({ message: 'Nội dung thông báo phải là chuỗi' })
  noiDungThongBao: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;
}

// DTO for creating custom message notification (like business messages)
export class CreateCustomMessageDto {
  @IsNotEmpty({ message: 'Tiêu đề thông báo không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  tieuDe: string;

  @IsNotEmpty({ message: 'Nội dung chính không được để trống' })
  @IsString({ message: 'Nội dung chính phải là chuỗi' })
  noiDungChinh: string;

  @IsOptional()
  @IsString({ message: 'Trạng thái phải là chuỗi' })
  trangThai?: string;

  @IsOptional()
  @IsString({ message: 'Thông tin bổ sung phải là chuỗi' })
  thongTinBoSung?: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;

  @IsOptional()
  @IsArray({ message: 'Danh sách người nhận phải là array' })
  @IsString({ each: true, message: 'ID người nhận phải là chuỗi' })
  nguoiNhanIds?: string[]; // Nếu có thì chỉ gửi cho những người này, không có thì gửi tất cả
}

// DTO for sending notification to specific users
export class SendNotificationDto {
  @IsNotEmpty({ message: 'ID thông báo không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'ID thông báo phải là số nguyên' })
  thongBaoId: number;

  @IsNotEmpty({ message: 'Danh sách người nhận không được để trống' })
  @IsArray({ message: 'Danh sách người nhận phải là array' })
  @ArrayNotEmpty({ message: 'Danh sách người nhận không được rỗng' })
  @IsString({ each: true, message: 'ID người nhận phải là chuỗi' })
  nguoiNhanIds: string[];
}

// DTO for updating ThongBao
export class UpdateThongBaoDto {
  @IsOptional()
  @IsString({ message: 'Nội dung thông báo phải là chuỗi' })
  noiDungThongBao?: string;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;
}

// DTO for listing ThongBao with pagination
export class ListThongBaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang phải lớn hơn 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit phải lớn hơn 0' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'Tìm kiếm phải là chuỗi' })
  search?: string;

  @IsOptional()
  @IsString({ message: 'Người gửi phải là chuỗi' })
  nguoiGui?: string;
}

// DTO for ThongBao detail response
export class ThongBaoDetailDto {
  id: number;
  noiDungThongBao: string;
  nguoiGui: string;
  ghiChu?: string;
  createdAt: Date;
  updatedAt: Date;
  nguoiGuiUser?: {
    id: string;
    fullName: string;
    email: string;
  };
}

// DTO for updating UserThongBao status
export class UpdateUserThongBaoDto {
  @IsEnum(TrangThaiThongBao, { message: 'Trạng thái không hợp lệ' })
  trangThai: TrangThaiThongBao;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;
}

// DTO for UserThongBao detail
export class UserThongBaoDetailDto {
  id: number;
  userId: string;
  thongBaoId: number;
  trangThai: TrangThaiThongBao;
  ghiChu?: string;
  createdAt: Date;
  updatedAt: Date;
  thongBao: {
    id: number;
    noiDungThongBao: string;
    nguoiGui: string;
    createdAt: Date;
  };
}

// DTO for listing user notifications
export class ListUserThongBaoDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Trang phải là số nguyên' })
  @Min(1, { message: 'Trang phải lớn hơn 0' })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit phải là số nguyên' })
  @Min(1, { message: 'Limit phải lớn hơn 0' })
  limit?: number = 10;

  @IsOptional()
  @IsEnum(TrangThaiThongBao, { message: 'Trạng thái không hợp lệ' })
  trangThai?: TrangThaiThongBao;
}

