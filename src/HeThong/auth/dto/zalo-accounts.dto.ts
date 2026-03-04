import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetZaloAccountsQueryDto {
  @ApiProperty({ required: false, description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Số lượng items per page', default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ required: false, description: 'Tìm kiếm theo tên hoặc phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, description: 'Lọc theo trạng thái liên kết với web user' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isLinked?: boolean;

  @ApiProperty({ required: false, description: 'Lọc theo trạng thái follow OA' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isFollowingOa?: boolean;

  @ApiProperty({ required: false, description: 'Lọc theo trạng thái active' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @ApiProperty({ required: false, description: 'Sắp xếp theo field (createdAt, displayName, lastActiveAt)' })
  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'displayName' | 'lastActiveAt' = 'createdAt';

  @ApiProperty({ required: false, description: 'Thứ tự sắp xếp (ASC, DESC)', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ZaloAccountResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  zaloOaUserId: string;

  @ApiProperty()
  zaloAppUserId: string;

  @ApiProperty()
  zaloMiniAppId: string;

  @ApiProperty()
  displayName: string;

  @ApiProperty()
  avatar: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  isFollowingOa: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastFollowAt: Date;

  @ApiProperty()
  lastUnfollowAt: Date;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  lastLoginAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Web User Info (if linked)
  @ApiProperty({ required: false })
  webUser?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatar: string;
    roleId: number;
    organizationId: number;
    isActive: boolean;
  };

  @ApiProperty()
  isLinkedToWeb: boolean;
}

export class ZaloAccountsListResponseDto {
  @ApiProperty({ type: [ZaloAccountResponseDto] })
  data: ZaloAccountResponseDto[];

  @ApiProperty()
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiProperty()
  summary: {
    total: number;
    linked: number;
    unlinked: number;
    followingOa: number;
    activeAccounts: number;
  };
}

export class LinkZaloAccountDto {
  @ApiProperty({ description: 'ID của Zalo Account' })
  @IsNumber()
  @Type(() => Number)
  zaloAccountId: number;

  @ApiProperty({ description: 'ID của Web User để liên kết' })
  @IsString()
  userId: string;
}

export class CreateUserFromZaloDto {
  @ApiProperty({ description: 'ID của Zalo Account' })
  @IsNumber()
  @Type(() => Number)
  zaloAccountId: number;

  @ApiProperty({ description: 'Tên đầy đủ cho tài khoản web' })
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'Email cho tài khoản web' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Tên đăng nhập cho tài khoản web' })
  @IsString()
  userName: string;

  @ApiProperty({ description: 'Mật khẩu cho tài khoản web' })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Số điện thoại cho tài khoản web' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ required: false, description: 'Role ID', default: 2 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roleId?: number = 2;

  @ApiProperty({ required: false, description: 'Organization ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  organizationId?: number;

  @ApiProperty({ required: false, description: 'Cụm khu công nghiệp ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cumKhuCnId?: number;

  @ApiProperty({ required: false, description: 'Xã phường ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  xaPhuongId?: number;
}
