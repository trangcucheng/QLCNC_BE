import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery,ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { listAllOrganizationDto } from './dto/list-all-organization-dto.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Mobile API - Tổ chức')
@Controller('mobile/organization')
export class MobileOrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  @Get('test')
  @ApiOperation({
    summary: '[Mobile] Test endpoint',
    description: 'Test API không cần authentication'
  })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  async testEndpoint() {
    return {
      success: true,
      message: 'Mobile Organization Controller is working!',
      timestamp: new Date().toISOString(),
      note: 'URL đúng phải là: /api/v1/mobile/organization/test'
    };
  }

  @Get('list')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy danh sách tổ chức',
    description: 'API dành cho Zalo Mini App - Lấy danh sách tổ chức có phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'cumKhuCnId', required: false, description: 'Lọc theo cụm khu công nghiệp' })
  @ApiQuery({ name: 'xaPhuongId', required: false, description: 'Lọc theo xã phường' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  @ApiResponse({
    status: 401,
    description: 'Chưa đăng nhập qua Zalo'
  })
  async getMobileOrganizationList(
    @Req() req: any,
    @Query(ValidationPipe) query: listAllOrganizationDto
  ) {
    // Lấy userId từ Zalo authentication
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new Error('Không tìm thấy thông tin user từ Zalo authentication');
    }

    const result = await this.organizationService.listAllOrganization(userId, query);

    return {
      success: true,
      data: result.list,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total: result.count,
        totalPages: Math.ceil(result.count / (query.limit || 10))
      },
      message: 'Lấy danh sách tổ chức thành công'
    };
  }

  @Get('list-public')
  @ApiOperation({
    summary: '[Mobile] Lấy danh sách tổ chức (công khai)',
    description: 'API không cần đăng nhập - Lấy danh sách tổ chức có phân trang'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @ApiQuery({ name: 'cumKhuCnId', required: false, description: 'Lọc theo cụm khu công nghiệp' })
  @ApiQuery({ name: 'xaPhuongId', required: false, description: 'Lọc theo xã phường' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async getMobileOrganizationListPublic(
    @Query(ValidationPipe) query: listAllOrganizationDto
  ) {
    // Sử dụng userId mặc định hoặc null cho public endpoint
    const result = await this.organizationService.listAllOrganization(null, query);

    return {
      success: true,
      data: result.list,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 10,
        total: result.count,
        totalPages: Math.ceil(result.count / (query.limit || 10))
      },
      message: 'Lấy danh sách tổ chức thành công (public)'
    };
  }

  @Get('dropdown')
  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '[Mobile] Lấy danh sách tổ chức cho dropdown',
    description: 'API dành cho Zalo Mini App - Lấy tất cả tổ chức không phân trang (cho dropdown/select)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getMobileOrganizationDropdown() {
    const result = await this.organizationService.listAll();

    return {
      success: true,
      data: result.map(org => ({
        id: org.id,
        name: org.name,
        cumKhuCongNghiepName: org.cumKhuCongNghiepName,
        xaPhuongName: org.xaPhuongName
      })),
      message: 'Lấy danh sách dropdown thành công'
    };
  }
}
