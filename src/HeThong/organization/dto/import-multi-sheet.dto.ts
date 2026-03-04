import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * DTO cho 1 dòng dữ liệu công đoàn trong sheet
 */
export class ImportOrganizationRowDto {
  @ApiProperty({ description: 'Số thứ tự', example: 1 })
  @IsOptional()
  stt?: number;

  @ApiProperty({ description: 'Tên công đoàn cơ sở', example: 'CDCS Công ty ABC' })
  @IsNotEmpty({ message: 'Tên công đoàn không được để trống' })
  @IsString()
  tenCongDoan: string;

  @ApiProperty({ description: 'Địa chỉ', example: 'Lô CN-C11, Cụm Công nghiệp Châu Phong' })
  @IsOptional()
  @IsString()
  diaChi?: string;

  @ApiProperty({ description: 'Loại hình', example: 'Trong nước' })
  @IsOptional()
  @IsString()
  loaiHinh?: string;

  @ApiProperty({ description: 'Tổng số công nhân viên chức lao động', example: 234 })
  @IsOptional()
  @IsNumber()
  tongSoCnvcld?: number;

  @ApiProperty({ description: 'Tổng số đoàn viên', example: 157 })
  @IsOptional()
  @IsNumber()
  tongSoDoanVien?: number;

  @ApiProperty({ description: 'Số đoàn viên nữ', example: 80 })
  @IsOptional()
  @IsNumber()
  soDoanVienNu?: number;

  @ApiProperty({ description: 'Số ủy viên ban chấp hành', example: 5 })
  @IsOptional()
  @IsNumber()
  soUyVienBch?: number;

  @ApiProperty({ description: 'Số ủy viên ủy ban kiểm tra', example: 3 })
  @IsOptional()
  @IsNumber()
  soUyVienUbkt?: number;

  @ApiProperty({ description: 'Tên chủ tịch công đoàn', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  tenChuTichCongDoan?: string;

  @ApiProperty({ description: 'Số điện thoại chủ tịch', example: '0123456789' })
  @IsOptional()
  @IsString()
  sdtChuTich?: string;
}

/**
 * DTO cho 1 sheet (1 xã phường)
 */
export class ImportSheetDto {
  @ApiProperty({ description: 'Tên xã phường (từ cell B5)', example: 'Xã Phú Lãng' })
  @IsNotEmpty()
  @IsString()
  tenXaPhuong: string;

  @ApiProperty({ description: 'Danh sách công đoàn trong xã phường', type: [ImportOrganizationRowDto] })
  organizations: ImportOrganizationRowDto[];
}

/**
 * DTO kết quả import
 */
export class ImportMultiSheetResultDto {
  @ApiProperty({ description: 'Số sheet đã import', example: 5 })
  totalSheets: number;

  @ApiProperty({ description: 'Số công đoàn import thành công', example: 25 })
  successCount: number;

  @ApiProperty({ description: 'Số công đoàn bị lỗi', example: 2 })
  errorCount: number;

  @ApiProperty({ description: 'Chi tiết lỗi theo sheet và dòng', example: { 'Sheet1_row3': ['Tên công đoàn không được để trống'] } })
  errors: Record<string, string[]>;

  @ApiProperty({ description: 'Danh sách ID các xã phường đã tạo mới', example: [1, 2, 3] })
  createdXaPhuongIds: number[];

  @ApiProperty({ description: 'Danh sách ID các công đoàn đã tạo', example: [10, 11, 12] })
  createdOrganizationIds: number[];
}
