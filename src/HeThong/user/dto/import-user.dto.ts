import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ImportUserRowDto {
  @ApiProperty({ description: 'Số thứ tự' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'STT phải là số' })
  stt?: number;

  @ApiProperty({ description: 'Họ và tên' })
  @IsString({ message: 'Họ và tên phải là chuỗi' })
  hoVaTen: string;

  @ApiProperty({ description: 'Tên tài khoản (userName)' })
  @IsString({ message: 'Tên tài khoản phải là chuỗi' })
  tenTaiKhoan: string;

  @ApiProperty({ description: 'Email' })
  @IsString({ message: 'Email phải là chuỗi' })
  email: string;

  @ApiProperty({ description: 'Số điện thoại' })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  sdt?: string;

  @ApiProperty({ description: 'Số CMND/CCCD' })
  @IsOptional()
  @IsString({ message: 'Số CMND/CCCD phải là chuỗi' })
  cmndCccd?: string;

  @ApiProperty({ description: 'Mật khẩu' })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  matKhau: string;

  @ApiProperty({ description: 'Vai trò (description của role)' })
  @IsString({ message: 'Vai trò phải là chuỗi' })
  vaiTro: string;

  @ApiProperty({ description: 'Công đoàn cơ sở (tên organization)' })
  @IsOptional()
  @IsString({ message: 'Công đoàn cơ sở phải là chuỗi' })
  congDoanCoSo?: string;

  @ApiProperty({ description: 'ID CĐCS (ID của organization)' })
  @IsOptional()
  idCdcs?: string | number;

  @ApiProperty({ description: 'Cụm khu CN (tên cụm khu)' })
  @IsOptional()
  @IsString({ message: 'Cụm khu CN phải là chuỗi' })
  cumKhuCn?: string;

  @ApiProperty({ description: 'ID Cụm KCN' })
  @IsOptional()
  idCumKcn?: string | number;

  @ApiProperty({ description: 'Xã phường (tên xã phường)' })
  @IsOptional()
  @IsString({ message: 'Xã phường phải là chuỗi' })
  xaPhuong?: string;

  @ApiProperty({ description: 'ID xã phường' })
  @IsOptional()
  idXaPhuong?: string | number;

  @ApiProperty({ description: 'Tên tài khoản Zalo (optional, chỉ dùng để tham khảo)' })
  @IsOptional()
  @IsString({ message: 'Tên tài khoản Zalo phải là chuỗi' })
  tenTaiKhoanZalo?: string;
}

export class ImportUserDto {
  @ApiProperty({
    description: 'Dữ liệu import từ Excel',
    type: [ImportUserRowDto]
  })
  @IsArray({ message: 'Dữ liệu phải là mảng' })
  @Type(() => ImportUserRowDto)
  data: ImportUserRowDto[];
}

export class ImportUserResultDto {
  @ApiProperty({ description: 'Số lượng bản ghi thành công' })
  successCount: number;

  @ApiProperty({ description: 'Số lượng bản ghi lỗi' })
  errorCount: number;

  @ApiProperty({ description: 'Chi tiết lỗi theo dòng', type: Object })
  errors: { [rowIndex: number]: string[] };

  @ApiProperty({ description: 'Danh sách ID đã tạo', type: [String] })
  createdIds: string[];

  @ApiProperty({ description: 'Số lượng tài khoản Zalo đã liên kết', required: false })
  zaloLinkedCount?: number;

  @ApiProperty({ description: 'Số lượng không tìm thấy tài khoản Zalo', required: false })
  zaloNotFoundCount?: number;

  @ApiProperty({ description: 'File Excel có lỗi (nếu có)', required: false })
  errorFile?: Buffer;
}
