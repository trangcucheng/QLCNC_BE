import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { createOrganizationDto, updateOrganizationDto } from './dto/create-organization-dto.dto';
import { CreateDynamicFieldDto, UpdateDynamicFieldDto, UpdateOrganizationWithDynamicFieldsDto } from './dto/dynamic-field.dto';
import { ImportByCumKhuResultDto } from './dto/import-by-cum-khu.dto';
import { ImportMultiSheetResultDto } from './dto/import-multi-sheet.dto';
import { ImportOrganizationDto, ImportResultDto } from './dto/import-organization.dto';
import { getDetailOrganizationDto, listAllOrganizationDto, listAllOrganizationPcDto } from './dto/list-all-organization-dto.dto';
import { OrganizationService } from './organization.service';

@ApiTags('Tổ chức Công đoàn')
@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) { }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('create-organization')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Tạo mới tổ chức',
    description: 'API tạo mới một tổ chức/công đoàn'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo tổ chức thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  async createOrganization(@Body(ValidationPipe) payload: createOrganizationDto) {
    return await this.organizationService.createOrganization(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-all-organization')
  @ApiOperation({
    summary: 'Lấy danh sách tổ chức có phân trang',
    description: 'API lấy danh sách tổ chức với tìm kiếm và phân trang'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async listAllOrganization(@Req() req, @Query(ValidationPipe) payload: listAllOrganizationDto) {
    return this.organizationService.listAllOrganization(req.user.id, payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-all')
  async listAll() {
    // console.log(req.user);
    return this.organizationService.listAll();
  }

  // @UseGuards(FlexibleAuthGuard)
  // @ApiBearerAuth()
  // @Get('list-all-organization-pc')
  // async listAllOrganizationPhanCap(@Req() req, @Query() payload: listAllOrganizationPcDto) {
  //   return this.organizationService.listOrgPhanCap(req.user.id, payload);
  // }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-all-child-organization-by-parentid')
  async listAllChildOrganizationByParentid(@Query() payload: getDetailOrganizationDto) {
    return this.organizationService.listAllChildOrganizationByParentid(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('detail-organization')
  async getDetailOrganization(@Query() payload: getDetailOrganizationDto) {
    return this.organizationService.getDetailOrganization(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put('update-organization')
  @ApiOperation({
    summary: 'Cập nhật thông tin tổ chức',
    description: 'API cập nhật thông tin tổ chức theo ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc không tìm thấy tổ chức'
  })
  async updateOrganization(@Body(ValidationPipe) payload: updateOrganizationDto) {
    return await this.organizationService.updateOrganization(payload);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Delete('delete-organization')
  @ApiOperation({
    summary: 'Xóa tổ chức',
    description: 'API xóa một tổ chức theo ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Không tìm thấy tổ chức hoặc tổ chức có cấp con'
  })
  async deleteOrganization(@Query(ValidationPipe) payload: getDetailOrganizationDto) {
    return this.organizationService.deleteOrganization(payload);
  }

  // ==================== DYNAMIC FIELDS ENDPOINTS ====================

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('dynamic-fields')
  @ApiOperation({ summary: 'Tạo field động cho tổ chức' })
  @ApiResponse({ status: 201, description: 'Tạo field thành công' })
  @ApiResponse({ status: 400, description: 'Field key đã tồn tại' })
  @HttpCode(HttpStatus.CREATED)
  async createDynamicField(@Body(ValidationPipe) input: CreateDynamicFieldDto) {
    return await this.organizationService.createDynamicField(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('dynamic-fields')
  @ApiOperation({ summary: 'Lấy danh sách tất cả dynamic fields' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @HttpCode(HttpStatus.OK)
  async getAllDynamicFields() {
    return await this.organizationService.getAllDynamicFields();
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put('dynamic-fields')
  @ApiOperation({ summary: 'Cập nhật dynamic field' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy field' })
  @HttpCode(HttpStatus.OK)
  async updateDynamicField(@Body(ValidationPipe) input: UpdateDynamicFieldDto) {
    return await this.organizationService.updateDynamicField(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Delete('dynamic-fields/:id')
  @ApiOperation({ summary: 'Xóa dynamic field' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy field' })
  @HttpCode(HttpStatus.OK)
  async deleteDynamicField(@Param('id', ParseIntPipe) id: number) {
    return await this.organizationService.deleteDynamicField(id);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put('with-dynamic-fields')
  @ApiOperation({ summary: 'Cập nhật tổ chức với dynamic fields' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy tổ chức' })
  @HttpCode(HttpStatus.OK)
  async updateOrganizationWithDynamicFields(@Body(ValidationPipe) input: UpdateOrganizationWithDynamicFieldsDto) {
    return await this.organizationService.updateOrganizationWithDynamicFields(input);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get(':id/with-dynamic-fields')
  @ApiOperation({ summary: 'Lấy chi tiết tổ chức với dynamic fields' })
  @ApiResponse({ status: 200, description: 'Lấy thông tin thành công' })
  @ApiResponse({ status: 400, description: 'Không tìm thấy tổ chức' })
  @HttpCode(HttpStatus.OK)
  async getOrganizationWithDynamicFields(@Param('id', ParseIntPipe) id: number) {
    return await this.organizationService.getOrganizationWithDynamicFields(id);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import')
  @ApiOperation({
    summary: 'Import danh sách tổ chức từ Excel',
    description: `Import danh sách tổ chức từ dữ liệu Excel. 
    Các cột trong file Excel theo thứ tự:
    - TT: Số thứ tự
    - Tên Công đoàn cơ sở*: Tên tổ chức (bắt buộc)
    - Cụm Khu CN*: Tên cụm khu công nghiệp (tự động tạo mới nếu chưa có)
    - Ngành nghề sản xuất kinh doanh: Mô tả ngành nghề
    - Tổng số CNVCLĐ*: Tổng số công nhân viên chức lao động
    - Số CNVCLĐ* nam: Số CNVCLĐ nam
    - Số CNVCLĐ* nữ: Số CNVCLĐ nữ
    - Số ĐVCĐ* nam: Số đoàn viên công đoàn nam
    - Số ĐVCĐ* nữ: Số đoàn viên công đoàn nữ
    - Loại hình: Loại hình tổ chức
    - Loại công ty: Loại công ty
    - Năm thành lập: Năm thành lập (sẽ chuyển thành ngày 1/1/năm)
    - Quốc gia: Quốc gia (mặc định Việt Nam)
    - Thuộc xã phường: Tên xã phường (tự động tạo mới nếu chưa có)
    - Ghi chú: Ghi chú bổ sung
    - Tên chủ tịch công đoàn: Họ tên chủ tịch
    - SĐT chủ tịch: Số điện thoại chủ tịch
    - Địa chỉ: Địa chỉ tổ chức`
  })
  @ApiResponse({
    status: 200,
    description: 'Import thành công',
    type: ImportResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  @HttpCode(HttpStatus.OK)
  async importOrganizations(@Body(ValidationPipe) importData: ImportOrganizationDto): Promise<ImportResultDto> {
    return await this.organizationService.importOrganizations(importData);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import-excel')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import danh sách tổ chức từ file Excel',
    description: `Upload file Excel để import danh sách tổ chức.
    
    **Cấu trúc file Excel:**
    - Hàng 1-2: Header (sẽ bị bỏ qua)
    - Từ hàng 3: Dữ liệu tổ chức
    
    **Thứ tự cột trong Excel:**
    1. STT - Số thứ tự
    2. Tên Công đoàn cơ sở* - Tên tổ chức (bắt buộc)
    3. Cụm Khu CN* - Tên cụm khu công nghiệp
    4. Ngành nghề sản xuất kinh doanh
    5. Tổng số CNVCLĐ* - SKIP (không import vào DB)
    6. Số CNVCLĐ* nam
    7. Số CNVCLĐ* nữ
    8. Tổng số ĐVCĐ - SKIP (không import vào DB)
    9. Số ĐVCĐ* nam - Số đoàn viên công đoàn nam
    10. Số ĐVCĐ* nữ - Số đoàn viên công đoàn nữ
    11. Loại hình - Nhà nước (checkbox - có giá trị = được chọn)
    12. Loại hình - Trong nước (checkbox - có giá trị = được chọn)
    13. Loại hình - Ngoài nước (checkbox - có giá trị = được chọn)
    14. Loại công ty - Cổ phần (checkbox - có giá trị = được chọn)
    15. Loại công ty - TNHH (checkbox - có giá trị = được chọn)
    16. Năm thành lập (Date/Number/String)
    17. Quốc gia
    18. Thuộc xã phường
    19. Ghi chú
    20. Tên chủ tịch công đoàn
    21. SĐT chủ tịch
    22. Địa chỉ`
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx hoặc .xls)'
        },
        startRow: {
          type: 'number',
          description: 'Hàng bắt đầu dữ liệu (mặc định là 3)',
          default: 3
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Import thành công',
    type: ImportResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc dữ liệu lỗi'
  })
  @HttpCode(HttpStatus.OK)
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Body('startRow') startRow: number = 3
  ): Promise<ImportResultDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file Excel để upload');
    }

    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
    }

    return await this.organizationService.importFromExcelFile(file, startRow);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('list-by-permission')
  @ApiOperation({ summary: 'Lấy danh sách tổ chức theo phân quyền (phân trang)', description: 'Trả về danh sách tổ chức dựa vào organizationId, cumKhuCnId, xaPhuongId của user đang gọi API.' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  async listByPermission(@Req() req, @Query(ValidationPipe) query: listAllOrganizationDto) {
    const user = req.user;
    // 🔥 FIX: Fetch actual user record from database to get organizationId, cumKhuCnId, xaPhuongId
    const userDetail = await this.organizationService.getUserDetail(user.id);
    const userPermissions = {
      organizationId: userDetail?.organizationId || null,
      cumKhuCnId: userDetail?.cumKhuCnId || null,
      xaPhuongId: userDetail?.xaPhuongId || null
    };
    return await this.organizationService.listByPermission(query, userPermissions);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import-multi-sheet')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import danh sách công đoàn từ file Excel nhiều sheet',
    description: `Upload file Excel chứa nhiều sheet, mỗi sheet tương ứng với 1 xã phường.
    
    **Cấu trúc mỗi sheet:**
    - Cell B5: Tên xã phường (bắt buộc)
    - Từ row 6: Danh sách công đoàn
    
    **Thứ tự cột (từ row 6):**
    1. STT (A) - Số thứ tự
    2. Tên công đoàn (B) - Bắt buộc
    3. Địa chỉ (C)
    4. Loại hình (D) - Giá trị trực tiếp từ cell
    5. Tổng số CNVCLĐ (E) - Tổng số công nhân viên chức lao động
    6. Tổng số đoàn viên (F)
    7. Số đoàn viên nữ (G)
    8. Số ủy viên BCH (H) - Số ủy viên ban chấp hành
    9. Số ủy viên UBKT (I) - Số ủy viên ủy ban kiểm tra
    10. Tên chủ tịch công đoàn (J)
    11. Số điện thoại chủ tịch (K)
    
    **Lưu ý:**
    - Số đoàn viên nam = Tổng số đoàn viên - Số đoàn viên nữ (tự động tính)
    - Xã phường sẽ tự động tạo mới nếu chưa tồn tại
    - Các sheet được xử lý độc lập`
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx hoặc .xls) chứa nhiều sheet'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Import thành công',
    type: ImportMultiSheetResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc dữ liệu lỗi'
  })
  @HttpCode(HttpStatus.OK)
  async importMultiSheet(
    @UploadedFile() file: Express.Multer.File
  ): Promise<ImportMultiSheetResultDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file Excel để upload');
    }

    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
    }

    return await this.organizationService.importMultiSheetFromExcel(file);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import-by-cum-khu')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Import danh sách công đoàn theo cụm khu công nghiệp',
    description: `Upload file Excel chứa nhiều sheet, mỗi sheet tương ứng với 1 cụm khu công nghiệp.
    
    **Cấu trúc file:**
    - Tên mỗi sheet là tên của Cụm Khu Công Nghiệp
    - Tự động tạo mới Cụm KCN nếu chưa tồn tại
    - Data bắt đầu khi cột STT (cột đầu tiên) = 1
    - Data kết thúc khi cột STT không còn giá trị
    
    **Thứ tự cột:**
    1. STT - Số thứ tự (dùng để xác định data bắt đầu)
    2. Tên công đoàn - Bắt buộc
    3. Địa chỉ
    4. Tổng số CNVCLĐ - Tổng số công nhân viên chức lao động
    5. Tổng số đoàn viên
    6. Tổng số đoàn viên nam
    7. Tổng số đoàn viên nữ
    8. Số ủy viên BCH - Số ủy viên ban chấp hành
    9. Số ủy viên UBKT - Số ủy viên ủy ban kiểm tra
    10. Ghi chú
    11. Tên chủ tịch công đoàn
    12. Số điện thoại chủ tịch
    
    **Logic:**
    - Quét từ đầu sheet cho đến khi tìm thấy STT = 1 → Đó là hàng bắt đầu data
    - Đọc data từ hàng đó trở đi cho đến khi STT trống → Kết thúc
    - Xử lý tương tự cho tất cả các sheet`
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx hoặc .xls) chứa nhiều sheet theo cụm khu công nghiệp'
        }
      },
      required: ['file']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Import thành công',
    type: ImportByCumKhuResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc dữ liệu lỗi'
  })
  @HttpCode(HttpStatus.OK)
  async importByCumKhu(
    @UploadedFile() file: Express.Multer.File
  ): Promise<ImportByCumKhuResultDto> {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file Excel để upload');
    }

    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ chấp nhận file Excel (.xlsx hoặc .xls)');
    }

    return await this.organizationService.importByCumKhuFromExcel(file);
  }

  @Get('thong-ke/heatmap-tuong-quan-ld-dv')
  @ApiOperation({
    summary: 'Thống kê Heatmap tương quan Lao động ↔ Đoàn viên',
    description: 'Thống kê tổng số lao động và đoàn viên theo từng Cụm KCN để vẽ heatmap tương quan'
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê thành công',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cum_kcn: { type: 'string', example: 'KCN Đình Trám' },
          tong_ld: { type: 'number', example: 18560 },
          tong_dv: { type: 'number', example: 16220 },
          ty_le: { type: 'number', example: 87, description: 'Tỷ lệ % đoàn viên/lao động' }
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async getHeatmapTuongQuanLaoDongDoanVien() {
    return await this.organizationService.getHeatmapTuongQuanLaoDongDoanVien();
  }

  @Get('thong-ke/stacked-bar-nam-nu-theo-cum')
  @ApiOperation({
    summary: 'Thống kê Stacked Bar Nam/Nữ theo Cụm KCN',
    description: 'Thống kê số lượng công đoàn viên Nam và Nữ theo từng Cụm KCN để vẽ biểu đồ stacked bar'
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê thành công',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cum_kcn: { type: 'string', example: 'KCN Đình Trám' },
          nam: { type: 'number', example: 10230 },
          nu: { type: 'number', example: 8330 },
          tong: { type: 'number', example: 18560, description: 'Tổng số công đoàn viên' }
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async getStackedBarNamNuTheoCum() {
    return await this.organizationService.getStackedBarNamNuTheoCum();
  }

  @Get('thong-ke/so-luong-cong-doan-theo-cum')
  @ApiOperation({
    summary: 'Thống kê số lượng công đoàn theo Cụm KCN',
    description: 'Thống kê số lượng công đoàn cơ sở, tổng lao động và tổng đoàn viên theo từng Cụm KCN'
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê thành công',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cum_kcn: { type: 'string', example: 'KCN Đình Trám' },
          so_luong_cong_doan: { type: 'number', example: 45, description: 'Số lượng công đoàn cơ sở' },
          tong_lao_dong: { type: 'number', example: 18560, description: 'Tổng số lao động' },
          tong_doan_vien: { type: 'number', example: 16220, description: 'Tổng số đoàn viên' }
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async getSoLuongCongDoanTheoCum() {
    return await this.organizationService.getSoLuongCongDoanTheoCum();
  }

  @Get('thong-ke/so-luong-cong-doan-theo-xa-phuong')
  @ApiOperation({
    summary: 'Thống kê số lượng công đoàn theo Xã Phường',
    description: 'Thống kê số lượng công đoàn cơ sở, tổng lao động và tổng đoàn viên theo từng Xã Phường'
  })
  @ApiResponse({
    status: 200,
    description: 'Thống kê thành công',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          xa_phuong: { type: 'string', example: 'Phường Suối Hoa' },
          so_luong_cong_doan: { type: 'number', example: 32, description: 'Số lượng công đoàn cơ sở' },
          tong_lao_dong: { type: 'number', example: 12340, description: 'Tổng số lao động' },
          tong_doan_vien: { type: 'number', example: 10450, description: 'Tổng số đoàn viên' }
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async getSoLuongCongDoanTheoXaPhuong() {
    return await this.organizationService.getSoLuongCongDoanTheoXaPhuong();
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('export-excel')
  @ApiOperation({
    summary: 'Xuất Excel danh sách công đoàn cơ sở',
    description: 'Xuất toàn bộ danh sách công đoàn cơ sở (ID và Tên) ra file Excel'
  })
  @ApiResponse({
    status: 200,
    description: 'File Excel được tạo thành công',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @HttpCode(HttpStatus.OK)
  async exportOrganizationsToExcel(@Req() req, @Query('res') res?) {
    const buffer = await this.organizationService.exportOrganizationsToExcel();

    // Set headers for file download
    req.res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    req.res.setHeader('Content-Disposition', `attachment; filename=danh-sach-cong-doan-${Date.now()}.xlsx`);
    req.res.setHeader('Content-Length', buffer.length);

    return req.res.send(buffer);
  }
}
