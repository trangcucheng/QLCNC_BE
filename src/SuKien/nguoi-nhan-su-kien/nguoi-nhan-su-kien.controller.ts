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
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FlexibleAuthGuard } from 'src/HeThong/auth/guards/flexible-auth.guard';

import {
  CapNhatTrangThaiXemDto,
  GuiThongBaoChoTatCaDto,
  GuiThongBaoSuKienDto,
  LayThongBaoDto
} from './dto/nguoi-nhan-su-kien.dto';
import { FileUploadHelper } from './helpers/file-upload.helper';
import { NguoiNhanSuKienService } from './nguoi-nhan-su-kien.service';

@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
@ApiTags('Người Nhận Sự Kiện')
@Controller('nguoi-nhan-su-kien')
export class NguoiNhanSuKienController {
  constructor(private readonly nguoiNhanSuKienService: NguoiNhanSuKienService) { }

  @Post('gui-thong-bao')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gửi thông báo sự kiện cho danh sách người dùng',
    description: 'API gửi thông báo sự kiện tới danh sách người dùng cụ thể'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi thông báo thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc sự kiện không tồn tại'
  })
  async guiThongBaoSuKien(@Body(ValidationPipe) guiThongBaoDto: GuiThongBaoSuKienDto) {
    return await this.nguoiNhanSuKienService.guiThongBaoSuKien(guiThongBaoDto);
  }

  @Post('gui-thong-bao-co-file')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 5)) // Tối đa 5 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Gửi thông báo sự kiện kèm file đính kèm',
    description: 'API gửi thông báo sự kiện tới danh sách người dùng kèm theo file đính kèm (tối đa 5 files, mỗi file tối đa 10MB)'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi thông báo với file đính kèm thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ, file không hợp lệ hoặc sự kiện không tồn tại'
  })
  async guiThongBaoSuKienCoFile(
    @Body(ValidationPipe) guiThongBaoDto: GuiThongBaoSuKienDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: any
  ) {
    try {
      // Xử lý upload files nếu có
      let uploadedFiles: string[] = [];
      if (files && files.length > 0) {
        const fileInfos = await FileUploadHelper.saveFiles(files);
        uploadedFiles = fileInfos.map(f => f.filename);

        // Cập nhật DTO với danh sách file đã upload
        guiThongBaoDto.fileDinhKem = uploadedFiles;
      }

      // Gửi thông báo
      const result = await this.nguoiNhanSuKienService.guiThongBaoSuKien(guiThongBaoDto);

      // Thêm download links vào response
      if (uploadedFiles.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const downloadLinks = FileUploadHelper.getDownloadUrls(uploadedFiles, baseUrl);

        return {
          ...result,
          downloadLinks,
          filesUploaded: uploadedFiles.length
        };
      }

      return result;
    } catch (error) {
      throw new BadRequestException(`Lỗi upload file: ${error.message}`);
    }
  }

  @Post('gui-thong-bao-tat-ca')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Gửi thông báo sự kiện cho tất cả người dùng',
    description: 'API gửi thông báo sự kiện tới tất cả người dùng trong hệ thống'
  })
  @ApiResponse({
    status: 201,
    description: 'Gửi thông báo thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc sự kiện không tồn tại'
  })
  async guiThongBaoChoTatCa(@Body(ValidationPipe) guiThongBaoDto: GuiThongBaoChoTatCaDto) {
    return await this.nguoiNhanSuKienService.guiThongBaoChoTatCa(guiThongBaoDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách thông báo sự kiện',
    description: 'API lấy danh sách thông báo sự kiện với phân trang và filter'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  // Không cần truyền nguoiNhanId, sẽ lấy từ JWT
  @ApiQuery({ name: 'trangThaiXem', required: false, description: 'Lọc theo trạng thái xem' })
  @ApiQuery({ name: 'loaiThongBao', required: false, description: 'Lọc theo loại thông báo' })
  @ApiQuery({ name: 'suKienId', required: false, description: 'Lọc theo ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async layDanhSachThongBao(@Query(ValidationPipe) query: LayThongBaoDto, @Req() req) {
    // Lấy nguoiNhanId từ JWT
    // const userId = req.user?.id;
    // const queryWithUser = { ...query, nguoiNhanId: userId };
    return await this.nguoiNhanSuKienService.layDanhSachThongBao(query, req.user.id);
  }

  @Get('chua-xem')
  @ApiOperation({
    summary: 'Lấy thông báo chưa xem của người dùng',
    description: 'API lấy danh sách thông báo chưa xem của một người dùng cụ thể'
  })
  // Không cần truyền nguoiNhanId, sẽ lấy từ JWT
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async layThongBaoChuaXem(@Req() req) {
    const userId = req.user?.id;
    const data = await this.nguoiNhanSuKienService.layThongBaoChuaXem(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy thông báo chưa xem thành công',
      data
    };
  }

  @Get('dem-chua-xem')
  @ApiOperation({
    summary: 'Đếm số thông báo chưa xem',
    description: 'API đếm số lượng thông báo chưa xem của một người dùng'
  })
  // Không cần truyền nguoiNhanId, sẽ lấy từ JWT
  @ApiResponse({
    status: 200,
    description: 'Đếm thành công'
  })
  async demThongBaoChuaXem(@Req() req) {
    const userId = req.user?.id;
    const soLuong = await this.nguoiNhanSuKienService.demThongBaoChuaXem(userId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Đếm thông báo chưa xem thành công',
      data: { soLuongChuaXem: soLuong }
    };
  }

  @Patch('cap-nhat-trang-thai-xem')
  @ApiOperation({
    summary: 'Cập nhật trạng thái đã xem thông báo',
    description: 'API đánh dấu thông báo đã xem hoặc chưa xem'
  })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật trạng thái thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async capNhatTrangThaiXem(@Body(ValidationPipe) capNhatDto: CapNhatTrangThaiXemDto) {
    const result = await this.nguoiNhanSuKienService.capNhatTrangThaiXem(capNhatDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Cập nhật trạng thái xem thành công',
      data: result
    };
  }

  @Delete(':nguoiNhanId/:suKienId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa thông báo sự kiện',
    description: 'API xóa một thông báo sự kiện cụ thể'
  })
  @ApiParam({ name: 'nguoiNhanId', description: 'ID người nhận' })
  @ApiParam({ name: 'suKienId', description: 'ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thông báo thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy thông báo'
  })
  async xoaThongBao(
    @Param('nguoiNhanId') nguoiNhanId: string,
    @Param('suKienId', ParseIntPipe) suKienId: number
  ) {
    return await this.nguoiNhanSuKienService.xoaThongBao(nguoiNhanId, suKienId);
  }
}
