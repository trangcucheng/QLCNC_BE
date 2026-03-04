import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

import { LoaiBaoCao, TrangThaiPheDuyet } from '../../../databases/entities/BaoCaoDoanSoTheoKy.entity';
import { LoaiKyBaoCao } from '../../../databases/entities/ThoiGianCapNhatDoanSo.entity';

export class CreateBaoCaoDoanSoTheoKyDto {
  @ApiProperty({ description: 'Tên báo cáo' })
  @IsNotEmpty({ message: 'Tên báo cáo không được để trống' })
  @IsString({ message: 'Tên báo cáo phải là chuỗi' })
  tenBaoCao: string;

  @ApiProperty({
    description: 'Loại kỳ báo cáo: hang_thang, hang_quy, hang_nam, dot_xuat. Hệ thống sẽ tự động tìm kỳ phù hợp',
    enum: LoaiKyBaoCao
  })
  @IsNotEmpty({ message: 'Loại kỳ báo cáo không được để trống' })
  @IsEnum(LoaiKyBaoCao, { message: 'Loại kỳ báo cáo không hợp lệ' })
  loaiKy: LoaiKyBaoCao;

  @ApiPropertyOptional({
    description: 'ID thời gian cập nhật đoàn số cụ thể (tùy chọn, nếu không cung cấp sẽ tự động tìm theo loaiKy)'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID thời gian cập nhật phải là số nguyên' })
  @IsPositive({ message: 'ID thời gian cập nhật phải lớn hơn 0' })
  thoiGianCapNhatDoanSoId?: number;

  // @ApiProperty({ description: 'ID người báo cáo' })
  // @IsNotEmpty({ message: 'Người báo cáo không được để trống' })
  // @IsString({ message: 'ID người báo cáo phải là chuỗi' })
  // nguoiBaoCaoId: string;

  // organizationId, xaPhuongId, cumKhuCnId sẽ được tự động lấy từ thông tin người tạo

  // @ApiPropertyOptional({ description: 'ID người phê duyệt (nếu có chỉ định)' })
  // @IsOptional()
  // @IsString({ message: 'ID người phê duyệt phải là chuỗi' })
  // nguoiPheDuyetId?: string;

  @ApiPropertyOptional({ description: 'Số lượng đoàn viên nam', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng đoàn viên nam phải là số nguyên' })
  @Min(0, { message: 'Số lượng đoàn viên nam không được âm' })
  soLuongDoanVienNam?: number = 0;

  @ApiPropertyOptional({ description: 'Số lượng đoàn viên nữ', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng đoàn viên nữ phải là số nguyên' })
  @Min(0, { message: 'Số lượng đoàn viên nữ không được âm' })
  soLuongDoanVienNu?: number = 0;

  @ApiPropertyOptional({ description: 'Số lượng CNVCLĐ nam', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng CNVCLĐ nam phải là số nguyên' })
  @Min(0, { message: 'Số lượng CNVCLĐ nam không được âm' })
  soLuongCNVCLDNam?: number = 0;

  @ApiPropertyOptional({ description: 'Số lượng CNVCLĐ nữ', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng CNVCLĐ nữ phải là số nguyên' })
  @Min(0, { message: 'Số lượng CNVCLĐ nữ không được âm' })
  soLuongCNVCLDNu?: number = 0;

  @ApiPropertyOptional({ description: 'Tổng số lượng công đoàn', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số công đoàn phải là số nguyên' })
  @Min(0, { message: 'Tổng số công đoàn không được âm' })
  tongSoCongDoan?: number = 0;

  @ApiPropertyOptional({ description: 'Tổng số lượng công nhân viên chức lao động', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số CNVCLĐ phải là số nguyên' })
  @Min(0, { message: 'Tổng số CNVCLĐ không được âm' })
  tongSoCnvcld?: number = 0;

  @ApiPropertyOptional({ description: 'Nội dung báo cáo' })
  @IsOptional()
  @IsString({ message: 'Nội dung phải là chuỗi' })
  noiDung?: string;

  @ApiPropertyOptional({ description: 'Trạng thái phê duyệt', enum: TrangThaiPheDuyet, default: TrangThaiPheDuyet.CHO_PHE_DUYET })
  @IsOptional()
  @IsEnum(TrangThaiPheDuyet, { message: 'Trạng thái phê duyệt không hợp lệ' })
  trangThaiPheDuyet?: TrangThaiPheDuyet = TrangThaiPheDuyet.CHO_PHE_DUYET;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;

  @ApiPropertyOptional({
    description: 'Loại báo cáo: Định kỳ hoặc Đột xuất',
    enum: LoaiBaoCao,
    default: LoaiBaoCao.DINH_KY
  })
  @IsOptional()
  @IsEnum(LoaiBaoCao, { message: 'Loại báo cáo không hợp lệ' })
  loaiBaoCao?: LoaiBaoCao = LoaiBaoCao.DINH_KY;
}

export class UpdateBaoCaoDoanSoTheoKyDto {
  @ApiPropertyOptional({ description: 'Tên báo cáo' })
  @IsOptional()
  @IsString({ message: 'Tên báo cáo phải là chuỗi' })
  tenBaoCao?: string;

  @ApiPropertyOptional({ description: 'Số lượng đoàn viên nam' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng đoàn viên nam phải là số nguyên' })
  @Min(0, { message: 'Số lượng đoàn viên nam không được âm' })
  soLuongDoanVienNam?: number;

  @ApiPropertyOptional({ description: 'Số lượng đoàn viên nữ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng đoàn viên nữ phải là số nguyên' })
  @Min(0, { message: 'Số lượng đoàn viên nữ không được âm' })
  soLuongDoanVienNu?: number;

  @ApiPropertyOptional({ description: 'Số lượng CNVCLĐ nam' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng CNVCLĐ nam phải là số nguyên' })
  @Min(0, { message: 'Số lượng CNVCLĐ nam không được âm' })
  soLuongCNVCLDNam?: number;

  @ApiPropertyOptional({ description: 'Số lượng CNVCLĐ nữ' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng CNVCLĐ nữ phải là số nguyên' })
  @Min(0, { message: 'Số lượng CNVCLĐ nữ không được âm' })
  soLuongCNVCLDNu?: number;

  @ApiPropertyOptional({ description: 'Tổng số lượng công đoàn' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số công đoàn phải là số nguyên' })
  @Min(0, { message: 'Tổng số công đoàn không được âm' })
  tongSoCongDoan?: number;

  @ApiPropertyOptional({ description: 'Tổng số lượng công nhân viên chức lao động' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tổng số CNVCLĐ phải là số nguyên' })
  @Min(0, { message: 'Tổng số CNVCLĐ không được âm' })
  tongSoCnvcld?: number;

  @ApiPropertyOptional({ description: 'Nội dung báo cáo' })
  @IsOptional()
  @IsString({ message: 'Nội dung phải là chuỗi' })
  noiDung?: string;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;

  @ApiPropertyOptional({
    description: 'Loại báo cáo: Định kỳ hoặc Đột xuất',
    enum: LoaiBaoCao
  })
  @IsOptional()
  @IsEnum(LoaiBaoCao, { message: 'Loại báo cáo không hợp lệ' })
  loaiBaoCao?: LoaiBaoCao;
}

export class ListBaoCaoDoanSoTheoKyDto {
  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng bản ghi mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng bản ghi phải là số nguyên' })
  @Min(1, { message: 'Số lượng bản ghi phải lớn hơn 0' })
  @Max(100, { message: 'Số lượng bản ghi không quá 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Tìm kiếm tổng quát (tên báo cáo, nội dung, ghi chú, tên tổ chức)' })
  @IsOptional()
  @IsString({ message: 'Từ khóa tìm kiếm phải là chuỗi' })
  search?: string;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên báo cáo' })
  @IsOptional()
  @IsString({ message: 'Tên báo cáo phải là chuỗi' })
  tenBaoCao?: string;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái phê duyệt', enum: TrangThaiPheDuyet })
  @IsOptional()
  @IsEnum(TrangThaiPheDuyet, { message: 'Trạng thái phê duyệt không hợp lệ' })
  trangThaiPheDuyet?: TrangThaiPheDuyet;

  @ApiPropertyOptional({ description: 'Lọc theo loại báo cáo', enum: LoaiBaoCao })
  @IsOptional()
  @IsEnum(LoaiBaoCao, { message: 'Loại báo cáo không hợp lệ' })
  loaiBaoCao?: LoaiBaoCao;

  @ApiPropertyOptional({ description: 'Lọc theo ID tổ chức' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID tổ chức phải là số nguyên' })
  @IsPositive({ message: 'ID tổ chức phải lớn hơn 0' })
  organizationId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo ID thời gian cập nhật đoàn số' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID thời gian cập nhật phải là số nguyên' })
  @IsPositive({ message: 'ID thời gian cập nhật phải lớn hơn 0' })
  thoiGianCapNhatDoanSoId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo tháng (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tháng phải là số nguyên' })
  @Min(1, { message: 'Tháng phải từ 1-12' })
  @Max(12, { message: 'Tháng phải từ 1-12' })
  thang?: number;

  @ApiPropertyOptional({ description: 'Lọc theo quý (1-4)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Quý phải là số nguyên' })
  @Min(1, { message: 'Quý phải từ 1-4' })
  @Max(4, { message: 'Quý phải từ 1-4' })
  quy?: number;

  @ApiPropertyOptional({ description: 'Lọc theo năm (VD: 2024, 2025)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm phải là số nguyên' })
  @Min(2020, { message: 'Năm phải từ 2020 trở đi' })
  nam?: number;
}

export class UpdateTrangThaiDto {
  @ApiProperty({ description: 'Trạng thái phê duyệt', enum: TrangThaiPheDuyet })
  @IsNotEmpty({ message: 'Trạng thái phê duyệt không được để trống' })
  @IsEnum(TrangThaiPheDuyet, { message: 'Trạng thái phê duyệt không hợp lệ' })
  trangThaiPheDuyet: TrangThaiPheDuyet;

  @ApiPropertyOptional({ description: 'Ghi chú' })
  @IsOptional()
  @IsString({ message: 'Ghi chú phải là chuỗi' })
  ghiChu?: string;

  @ApiPropertyOptional({ description: 'ID người phê duyệt/từ chối (sẽ tự động lấy từ user đang login nếu không cung cấp)' })
  @IsOptional()
  @IsString({ message: 'ID người phê duyệt phải là chuỗi' })
  nguoiPheDuyetId?: string;
}

export class BaoCaoDoanSoTheoKyDetailDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  tenBaoCao: string;

  @ApiProperty()
  thoiGianCapNhatDoanSoId: number;

  @ApiProperty()
  nguoiBaoCaoId: string;

  @ApiProperty()
  organizationId: number;

  @ApiPropertyOptional()
  xaPhuongId?: number;

  @ApiPropertyOptional()
  cumKhuCnId?: number;

  @ApiProperty()
  soLuongDoanVienNam: number;

  @ApiProperty()
  soLuongDoanVienNu: number;

  @ApiProperty()
  soLuongCNVCLDNam: number;

  @ApiProperty()
  soLuongCNVCLDNu: number;

  @ApiProperty()
  tongSoCongDoan: number;

  @ApiProperty()
  tongSoCnvcld: number;

  @ApiProperty()
  noiDung: string;

  @ApiProperty({ enum: TrangThaiPheDuyet })
  trangThaiPheDuyet: TrangThaiPheDuyet;

  @ApiProperty({ enum: LoaiBaoCao })
  loaiBaoCao: LoaiBaoCao;

  @ApiProperty()
  ghiChu: string;

  @ApiPropertyOptional()
  nguoiPheDuyetId?: string;

  @ApiPropertyOptional()
  ngayPheDuyet?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  thoiGianCapNhatDoanSo?: {
    id: number;
    ten: string;
    thoiGianBatDau: Date;
    thoiGianKetThuc: Date;
    moTa: string;
  };

  @ApiPropertyOptional()
  nguoiBaoCao?: {
    id: string;
    fullName: string;
    email: string;
  };

  @ApiPropertyOptional()
  organization?: {
    id: number;
    name: string;
  };

  @ApiPropertyOptional()
  nguoiPheDuyet?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export class ThongKeDoanSoTheoKyDto {
  @ApiProperty()
  tongDoanVienNam: number;

  @ApiProperty()
  tongDoanVienNu: number;

  @ApiProperty()
  tongCNVCLDNam: number;

  @ApiProperty()
  tongCNVCLDNu: number;

  @ApiProperty()
  tongDoanVien: number;

  @ApiProperty()
  tongCNVCLD: number;

  @ApiProperty()
  tongTatCa: number;
}

// ===================== TRACKING DTOS =====================

export enum TrangThaiBaoCao {
  DA_BAO_CAO = 'da_bao_cao',
  CHUA_BAO_CAO = 'chua_bao_cao',
  QUA_HAN = 'qua_han',
  DUNG_HAN = 'dung_han'
}

export class OrganizationBaoCaoStatusDto {
  @ApiProperty({ description: 'ID tổ chức' })
  organizationId: number;

  @ApiProperty({ description: 'Tên tổ chức' })
  organizationName: string;

  @ApiPropertyOptional({ description: 'Tên cụm khu công nghiệp' })
  cumKhuCongNghiepName?: string;

  @ApiPropertyOptional({ description: 'Tên xã phường' })
  xaPhuongName?: string;

  @ApiProperty({ description: 'Địa chỉ tổ chức' })
  diaChi?: string;

  @ApiProperty({ description: 'Trạng thái báo cáo', enum: TrangThaiBaoCao })
  trangThaiBaoCao: TrangThaiBaoCao;

  @ApiPropertyOptional({ description: 'ID báo cáo (nếu đã báo cáo)' })
  baoCaoId?: number;

  @ApiPropertyOptional({ description: 'Tên báo cáo (nếu đã báo cáo)' })
  tenBaoCao?: string;

  @ApiPropertyOptional({ description: 'Ngày nộp báo cáo' })
  ngayNop?: Date;

  @ApiPropertyOptional({ description: 'Trạng thái phê duyệt', enum: TrangThaiPheDuyet })
  trangThaiPheDuyet?: TrangThaiPheDuyet;

  @ApiPropertyOptional({ description: 'Người báo cáo' })
  nguoiBaoCao?: {
    id: string;
    fullName: string;
    email?: string;
    phoneNumber?: string;
  };

  @ApiProperty({ description: 'Số ngày còn lại / quá hạn (số âm nếu quá hạn)' })
  soNgayConLai: number;

  @ApiProperty({ description: 'Thời hạn nộp báo cáo' })
  thoiHanNop: Date;
}

export class ThongKeBaoCaoTheoKyDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  thoiGianCapNhatDoanSoId: number;

  @ApiProperty({ description: 'Tên kỳ báo cáo' })
  tenKyBaoCao: string;

  @ApiProperty({ description: 'Thời gian bắt đầu' })
  thoiGianBatDau: Date;

  @ApiProperty({ description: 'Thời gian kết thúc' })
  thoiGianKetThuc: Date;

  @ApiProperty({ description: 'Tổng số CĐCS cần báo cáo' })
  tongSoCDCS: number;

  @ApiProperty({ description: 'Số CĐCS đã báo cáo' })
  soDaBaoCao: number;

  @ApiProperty({ description: 'Số CĐCS chưa báo cáo' })
  soChuaBaoCao: number;

  @ApiProperty({ description: 'Số CĐCS báo cáo đúng hạn' })
  soDungHan: number;

  @ApiProperty({ description: 'Số CĐCS báo cáo quá hạn' })
  soQuaHan: number;

  @ApiProperty({ description: 'Tỷ lệ đã báo cáo (%)' })
  tyLeDaBaoCao: number;

  @ApiProperty({ description: 'Danh sách chi tiết', type: [OrganizationBaoCaoStatusDto] })
  danhSachChiTiet: OrganizationBaoCaoStatusDto[];

  @ApiProperty({ description: 'Tổng số bản ghi' })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại' })
  page: number;

  @ApiProperty({ description: 'Số bản ghi trên mỗi trang' })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang' })
  totalPages: number;
}

export class TrackingBaoCaoQueryDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  thoiGianCapNhatDoanSoId: number;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái báo cáo', enum: TrangThaiBaoCao })
  @IsOptional()
  @IsEnum(TrangThaiBaoCao)
  trangThaiBaoCao?: TrangThaiBaoCao;

  @ApiPropertyOptional({ description: 'Lọc theo cụm khu công nghiệp' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cumKhuCnId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo xã phường' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  xaPhuongId?: number;

  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên tổ chức' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Số trang', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số trang phải là số nguyên' })
  @Min(1, { message: 'Số trang phải lớn hơn 0' })
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng bản ghi mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số lượng bản ghi phải là số nguyên' })
  @Min(1, { message: 'Số lượng bản ghi phải lớn hơn 0' })
  @Max(100, { message: 'Số lượng bản ghi không quá 100' })
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Lọc theo tháng (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tháng phải là số nguyên' })
  @Min(1, { message: 'Tháng phải từ 1-12' })
  @Max(12, { message: 'Tháng phải từ 1-12' })
  thang?: number;

  @ApiPropertyOptional({ description: 'Lọc theo quý (1-4)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Quý phải là số nguyên' })
  @Min(1, { message: 'Quý phải từ 1-4' })
  @Max(4, { message: 'Quý phải từ 1-4' })
  quy?: number;

  @ApiPropertyOptional({ description: 'Lọc theo năm (VD: 2024, 2025)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm phải là số nguyên' })
  @Min(2020, { message: 'Năm phải từ 2020 trở đi' })
  nam?: number;
}

export class ThongKeBaoCaoQueryDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  thoiGianCapNhatDoanSoId: number;

  @ApiPropertyOptional({ description: 'Lọc theo cụm khu công nghiệp' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cumKhuCnId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo xã phường' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  xaPhuongId?: number;

  @ApiPropertyOptional({ description: 'Lọc theo tháng (1-12)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Tháng phải là số nguyên' })
  @Min(1, { message: 'Tháng phải từ 1-12' })
  @Max(12, { message: 'Tháng phải từ 1-12' })
  thang?: number;

  @ApiPropertyOptional({ description: 'Lọc theo quý (1-4)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Quý phải là số nguyên' })
  @Min(1, { message: 'Quý phải từ 1-4' })
  @Max(4, { message: 'Quý phải từ 1-4' })
  quy?: number;

  @ApiPropertyOptional({ description: 'Lọc theo năm (VD: 2024, 2025)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Năm phải là số nguyên' })
  @Min(2020, { message: 'Năm phải từ 2020 trở đi' })
  nam?: number;
}

export class ThongKeBaoCaoResponseDto {
  @ApiProperty({ description: 'ID thời gian cập nhật đoàn số' })
  thoiGianCapNhatDoanSoId: number;

  @ApiProperty({ description: 'Tên kỳ báo cáo' })
  tenKyBaoCao: string;

  @ApiProperty({ description: 'Thời gian bắt đầu' })
  thoiGianBatDau: Date;

  @ApiProperty({ description: 'Thời gian kết thúc' })
  thoiGianKetThuc: Date;

  @ApiProperty({ description: 'Thời hạn nộp báo cáo' })
  thoiHanNop: Date;

  @ApiProperty({ description: 'Tổng số CĐCS cần báo cáo' })
  tongSoCDCS: number;

  @ApiProperty({ description: 'Số CĐCS đã báo cáo' })
  soDaBaoCao: number;

  @ApiProperty({ description: 'Số CĐCS chưa báo cáo' })
  soChuaBaoCao: number;

  @ApiProperty({ description: 'Số CĐCS báo cáo đúng hạn' })
  soDungHan: number;

  @ApiProperty({ description: 'Số CĐCS báo cáo quá hạn' })
  soQuaHan: number;

  @ApiProperty({ description: 'Tỷ lệ đã báo cáo (%)' })
  tyLeDaBaoCao: number;
}
