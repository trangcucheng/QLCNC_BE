import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class taichinhDto {

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  feeStatus: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  startDate: Date

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  endDate: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  majorId: number;

  @ApiProperty({ required: false })
  @IsArray()
  @IsOptional()
  testSessionName: number[];
}

export class studentsInforDto {

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  majorId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  testSession: string;
}

export class taichinhXTSDto {

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  startDate: Date

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  endDate: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  majorId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  methodId: number;
}
