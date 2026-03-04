import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber,IsOptional, IsString } from 'class-validator';
import { FieldType } from 'src/databases/entities/OrganizationFieldSchema.entity';

export class CreateDynamicFieldDto {
  @ApiProperty({
    description: 'Khóa field (unique identifier)',
    example: 'soLuongNhanVien'
  })
  @IsString()
  fieldKey: string;

  @ApiProperty({
    description: 'Tên hiển thị của field',
    example: 'Số lượng nhân viên'
  })
  @IsString()
  fieldName: string;

  @ApiProperty({
    description: 'Loại dữ liệu của field',
    enum: FieldType,
    enumName: 'FieldType',
    example: FieldType.NUMBER
  })
  @IsEnum(FieldType, {
    message: 'fieldType must be one of: text, number, date, boolean, select, textarea'
  })
  fieldType: FieldType;

  @ApiPropertyOptional({
    description: 'Field có bắt buộc hay không',
    default: false
  })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Tùy chọn cho field (dành cho select)',
    example: { options: ['Lựa chọn 1', 'Lựa chọn 2'] }
  })
  @IsOptional()
  fieldOptions?: any;

  @ApiPropertyOptional({
    description: 'Giá trị mặc định',
    example: '0'
  })
  @IsOptional()
  defaultValue?: string;

  @ApiPropertyOptional({
    description: 'Thứ tự hiển thị',
    default: 0
  })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateDynamicFieldDto extends CreateDynamicFieldDto {
  @ApiProperty({ description: 'ID của field cần cập nhật' })
  @IsNumber()
  id: number;
}

export class UpdateOrganizationWithDynamicFieldsDto {
  @ApiProperty({
    description: 'ID của tổ chức cần cập nhật',
    example: 1,
    required: true
  })
  @IsNumber()
  id: number;

  @ApiPropertyOptional({
    description: 'Tên tổ chức',
    example: 'Công đoàn ABC'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ tổ chức',
    example: '123 Đường ABC, Bắc Ninh'
  })
  @IsOptional()
  @IsString()
  diaChi?: string;

  @ApiPropertyOptional({
    description: 'ID công đoàn cấp trên',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  organizationParentId?: number;

  @ApiPropertyOptional({
    description: 'ID cụm khu công nghiệp',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  cumKhuCnId?: number;

  @ApiPropertyOptional({
    description: 'ID xã phường',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  xaPhuongId?: number;

  @ApiPropertyOptional({
    description: 'Các trường động (dynamic fields) - object với key là fieldKey và value là giá trị tương ứng',
    example: {
      soLuongNhanVien: 150,
      dienTichMatBang: '500m2',
      ngayThanhLap: '2023-01-15',
      coChiDoan: true
    },
    type: 'object'
  })
  @IsOptional()
  dynamicFields?: Record<string, any>;
}
