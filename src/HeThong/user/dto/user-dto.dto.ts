import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createUserDto {

  @ApiProperty()
  @IsString()
  @IsOptional()
  code: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  methods: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  descriptions: string;
}

export class updateUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  passWord: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  repassWord: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  identity: string;

  @ApiProperty({ required: true })
  @IsString()
  email: string;

  @ApiProperty({ required: true })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ required: true })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  roleId: number;

  @ApiProperty({ required: true })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  staffID: number;

  @ApiProperty({ required: false, description: 'ID của cụm khu công nghiệp' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  cumKhuCnId: number;

  @ApiProperty({ required: false, description: 'ID của xã phường' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  xaPhuongId: number;

  @ApiProperty({ required: false, description: 'ID của xã phường' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  organizationId: number;

  @ApiProperty({ required: false, description: 'ID của Zalo Account để liên kết (optional)' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  zaloAccountId: number;
}


export class updateStudentDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fullName: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  identity: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  birthDate: Date;

  @ApiProperty({ required: false, description: 'ID của cụm khu công nghiệp' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  cumKhuCnId: number;

  @ApiProperty({ required: false, description: 'ID của xã phường' })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  xaPhuongId: number;
}
