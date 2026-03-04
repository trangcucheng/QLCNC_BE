import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { SignupDto } from './dto/sign-up.dto';
import {
  CreateUserFromZaloDto,
  GetZaloAccountsQueryDto,
  LinkZaloAccountDto,
  ZaloAccountResponseDto,
  ZaloAccountsListResponseDto
} from './dto/zalo-accounts.dto';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';
import { ZaloAccountService } from './zalo-account.service';

@ApiTags('Zalo Accounts Management')
@Controller('zalo-accounts')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class ZaloAccountsController {
  constructor(
    private readonly zaloAccountService: ZaloAccountService,
    private readonly authService: AuthService
  ) { }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách Zalo Accounts với phân trang và tìm kiếm',
    description: 'API để quản lý danh sách tài khoản Zalo, hỗ trợ phân trang, tìm kiếm và lọc'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: ZaloAccountsListResponseDto
  })
  async getZaloAccounts(
    @Query(ValidationPipe) query: GetZaloAccountsQueryDto
  ): Promise<ZaloAccountsListResponseDto> {
    return await this.zaloAccountService.getZaloAccountsPaginated(query);
  }

  @Get('unlinked')
  @ApiOperation({
    summary: 'Lấy danh sách Zalo Accounts chưa liên kết với web user',
    description: 'API để lấy danh sách tài khoản Zalo chưa được liên kết với tài khoản web'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công',
    type: [ZaloAccountResponseDto]
  })
  async getUnlinkedZaloAccounts(): Promise<ZaloAccountResponseDto[]> {
    const accounts = await this.zaloAccountService.getUnlinkedZaloAccounts();
    return accounts.map(account => this.mapToResponseDto(account));
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Lấy thống kê tổng quan về Zalo Accounts',
    description: 'API để lấy thống kê về số lượng tài khoản Zalo theo từng loại'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thống kê thành công'
  })
  async getZaloAccountsOverview() {
    return await this.zaloAccountService.getZaloAccountsOverview();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết Zalo Account theo ID',
    description: 'API để lấy thông tin chi tiết của một tài khoản Zalo'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công',
    type: ZaloAccountResponseDto
  })
  async getZaloAccountById(@Param('id') id: string): Promise<ZaloAccountResponseDto> {
    const account = await this.zaloAccountService.findById(parseInt(id));
    if (!account) {
      throw new Error('Zalo Account not found');
    }
    return this.mapToResponseDto(account);
  }

  @Post('link')
  @ApiOperation({
    summary: 'Liên kết Zalo Account với Web User',
    description: 'API để liên kết tài khoản Zalo với tài khoản web hiện có'
  })
  @ApiResponse({
    status: 200,
    description: 'Liên kết thành công'
  })
  async linkZaloAccountWithUser(
    @Body(ValidationPipe) dto: LinkZaloAccountDto
  ) {
    const linkedAccount = await this.zaloAccountService.linkUserWithZaloAccount(
      dto.userId,
      dto.zaloAccountId
    );

    return {
      success: true,
      message: 'Đã liên kết thành công',
      data: this.mapToResponseDto(linkedAccount)
    };
  }

  @Delete(':id/unlink')
  @ApiOperation({
    summary: 'Hủy liên kết Zalo Account với Web User',
    description: 'API để hủy liên kết tài khoản Zalo với tài khoản web'
  })
  @ApiResponse({
    status: 200,
    description: 'Hủy liên kết thành công'
  })
  async unlinkZaloAccount(@Param('id') id: string) {
    await this.zaloAccountService.unlinkUserFromZaloAccount(parseInt(id));

    return {
      success: true,
      message: 'Đã hủy liên kết thành công'
    };
  }

  @Post('create-user')
  @ApiOperation({
    summary: 'Tạo Web User từ Zalo Account',
    description: 'API để tạo tài khoản web mới từ thông tin Zalo Account'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo tài khoản thành công'
  })
  async createUserFromZaloAccount(
    @Body(ValidationPipe) dto: CreateUserFromZaloDto
  ) {
    // Get Zalo Account info
    const zaloAccount = await this.zaloAccountService.findById(dto.zaloAccountId);
    if (!zaloAccount) {
      throw new Error('Zalo Account not found');
    }

    if (zaloAccount.userId) {
      throw new Error('Zalo Account đã được liên kết với tài khoản web khác');
    }

    // Create SignupDto from Zalo info and form data
    const signupDto: SignupDto = {
      fullName: dto.fullName,
      email: dto.email,
      userName: dto.userName,
      passWord: dto.password,
      identity: dto.phoneNumber || zaloAccount.phone || `zalo_${zaloAccount.id}_${Date.now()}`, // Generate unique identity
      phoneNumber: dto.phoneNumber,
      roleId: dto.roleId || 2,
      organizationId: dto.organizationId,
      cumKhuCnId: dto.cumKhuCnId,
      xaPhuongId: dto.xaPhuongId,
      zaloAccountId: dto.zaloAccountId // Link automatically during creation
    };

    // Create user (this will automatically link with Zalo Account)
    const newUser = await this.authService.createUser(signupDto);

    return {
      success: true,
      message: 'Đã tạo tài khoản web thành công và liên kết với Zalo',
      data: {
        user: newUser,
        zaloAccount: this.mapToResponseDto(zaloAccount)
      }
    };
  }

  @Put(':id/sync')
  @ApiOperation({
    summary: 'Đồng bộ thông tin Zalo Account',
    description: 'API để đồng bộ lại thông tin từ Zalo API'
  })
  @ApiResponse({
    status: 200,
    description: 'Đồng bộ thành công'
  })
  async syncZaloAccount(@Param('id') id: string) {
    // TODO: Implement sync with Zalo API
    return {
      success: true,
      message: 'Chức năng đồng bộ sẽ được triển khai sau'
    };
  }

  /**
   * Helper method to map ZaloAccount entity to response DTO
   */
  private mapToResponseDto(account: any): ZaloAccountResponseDto {
    return {
      id: account.id,
      userId: account.userId,
      zaloOaUserId: account.zaloOaUserId,
      zaloAppUserId: account.zaloAppUserId,
      zaloMiniAppId: account.zaloMiniAppId,
      displayName: account.displayName,
      avatar: account.avatar,
      phone: account.phone,
      isFollowingOa: account.isFollowingOa,
      isActive: account.isActive,
      lastFollowAt: account.lastFollowAt,
      lastUnfollowAt: account.lastUnfollowAt,
      lastActiveAt: account.lastActiveAt,
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      webUser: account.user ? {
        id: account.user.id,
        fullName: account.user.fullName,
        email: account.user.email,
        phoneNumber: account.user.phoneNumber,
        avatar: account.user.avatar,
        roleId: account.user.roleId,
        organizationId: account.user.organizationId,
        isActive: account.user.isActive === 1
      } : null,
      isLinkedToWeb: !!account.userId
    };
  }
}
