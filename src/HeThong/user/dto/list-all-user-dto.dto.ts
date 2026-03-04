import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class listAllUserDto {
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
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  roleId: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  isActive: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  cumKhuCnId: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  xaPhuongId: number;
}

export class getDetailUserDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class getDetailUserByRegistrationFormIdDto {
  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  RegistrationFormId: number;
}

export class getTTCN {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class listUserAdminDto {
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

}
