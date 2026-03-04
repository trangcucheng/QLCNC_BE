import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPhoneNumber, IsPositive, IsString } from "class-validator";

export class createStaffDto {
  @ApiProperty({ description: 'Tên cán bộ', example: 'Nguyễn Văn A' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  name: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0123456789' })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone?: string;

  @ApiPropertyOptional({ description: 'ID tổ chức', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID tổ chức phải là số nguyên' })
  @IsPositive({ message: 'ID tổ chức phải lớn hơn 0' })
  organizationId?: number;

  @ApiPropertyOptional({ description: 'ID chức vụ', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID chức vụ phải là số nguyên' })
  @IsPositive({ message: 'ID chức vụ phải lớn hơn 0' })
  chucVuId?: number;
}

export class updateStaffDto {
  @ApiProperty({ description: 'ID cán bộ cần cập nhật', example: 1 })
  @IsNotEmpty({ message: 'ID không được để trống' })
  @Type(() => Number)
  @IsInt({ message: 'ID phải là số nguyên' })
  @IsPositive({ message: 'ID phải lớn hơn 0' })
  id: number;

  @ApiPropertyOptional({ description: 'Tên cán bộ', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi ký tự' })
  name?: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0123456789' })
  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự' })
  phone?: string;

  @ApiPropertyOptional({ description: 'ID tổ chức', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID tổ chức phải là số nguyên' })
  @IsPositive({ message: 'ID tổ chức phải lớn hơn 0' })
  organizationId?: number;

  @ApiPropertyOptional({ description: 'ID chức vụ', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID chức vụ phải là số nguyên' })
  @IsPositive({ message: 'ID chức vụ phải lớn hơn 0' })
  chucVuId?: number;
}
