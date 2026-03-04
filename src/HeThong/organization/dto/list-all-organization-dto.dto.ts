import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class listAllOrganizationDto {
  @ApiProperty({ default: 1, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 10, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({
    description: 'Lọc theo ID xã phường (có thể là số đơn lẻ hoặc mảng số)',
    required: false,
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) return value.map(v => Number(v));
    return [Number(value)]; // Convert single value to array
  })
  @IsArray()
  @Type(() => Number)
  xaPhuongId: number[];

  @ApiProperty({
    description: 'Lọc theo ID cụm khu công nghiệp (có thể là số đơn lẻ hoặc mảng số)',
    required: false,
    example: [1, 2, 3],
    type: [Number]
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    if (Array.isArray(value)) return value.map(v => Number(v));
    return [Number(value)]; // Convert single value to array
  })
  @IsArray()
  @Type(() => Number)
  cumKhuCnId: number[];

  @ApiProperty({
    description: 'Lọc theo ID công đoàn cấp trên',
    required: false,
    example: 1
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  organizationParentId: number;

  @ApiProperty({
    description: 'Lọc theo ID tổ chức cụ thể',
    required: false,
    example: 1
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  organizationId: number;
}

export class listPeriodFilterDto {
  @ApiProperty({ default: 1, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 10, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  listOrganizationID: number[];
}

export class getDetailOrganizationDto {
  @ApiProperty({ default: 1, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  organizationID: number;
}

export class listAllOrganizationPcDto {
  @ApiProperty({ default: 1, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty({ default: 10, required: true })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  search: string;

  @ApiProperty({ required: false })
  @IsOptional()
  typeID: number[];

  @ApiProperty({
    description: 'Lọc theo ID xã phường',
    required: false,
    example: 1
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  xaPhuongId: number;

  @ApiProperty({
    description: 'Lọc theo ID cụm khu công nghiệp',
    required: false,
    example: 1
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  cumKhuCnId: number;

  @ApiProperty({
    description: 'Lọc theo ID công đoàn cấp trên',
    required: false,
    example: 1
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  organizationParentId: number;
}

export class listAllOrganizationPcStaffLecturerDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  role: string;
}
