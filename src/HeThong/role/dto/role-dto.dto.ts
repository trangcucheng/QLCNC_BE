import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class createRoleDto {

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  permissions: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}

export class updateRoleDto {
  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  roleId: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  permissions: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}
