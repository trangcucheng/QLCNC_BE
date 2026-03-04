import {
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
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FlexibleAuthGuard } from 'src/HeThong/auth/guards/flexible-auth.guard';

import { Public } from '../../HeThong/auth/decorators/public.decorator';
import { AuthenticationGuard } from '../../HeThong/auth/guards/auth.guard';
import {
  CreateSuKienDto,
  ListSuKienDto,
  UpdateSuKienDto,
  UploadFileDto
} from './dto/su-kien.dto';
import { SuKienService } from './su-kien.service';

@ApiTags('Sự Kiện')
@Controller('su-kien')
@UseGuards(FlexibleAuthGuard)
@ApiBearerAuth()
export class SuKienController {
  constructor(private readonly suKienService: SuKienService) { }


  // ====== ROUTE TĨNH ĐƯỢC ƯU TIÊN ======
  @Public()
  @Get('download-file')
  @ApiOperation({
    summary: 'Tải file đính kèm theo path',
    description: 'API tải file bằng cách truyền đường dẫn file qua query parameter'
  })
  @ApiQuery({
    name: 'path',
    required: true,
    description: 'Đường dẫn file cần tải',
    example: '/uploads/su-kien/2025/09/uuid-123.pdf'
  })
  @ApiResponse({
    status: 200,
    description: 'Tải file thành công',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy file'
  })
  @ApiResponse({
    status: 400,
    description: 'Đường dẫn file không hợp lệ'
  })
  async downloadFileByPath(@Query('path') filePath: string, @Res() res: Response) {
    if (!filePath) {
      return res.status(400).json({
        statusCode: 400,
        message: 'Thiếu tham số path'
      });
    }
    return await this.suKienService.downloadFile(filePath, res);
  }

  @Get('download/*')
  @ApiOperation({
    summary: 'Tải file đính kèm theo URL path',
    description: 'API tải file bằng cách truyền đường dẫn file trong URL'
  })
  @ApiResponse({
    status: 200,
    description: 'Tải file thành công',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy file'
  })
  async downloadFile(@Param('*') filePath: string, @Res() res: Response) {
    return await this.suKienService.downloadFile(filePath, res);
  }

  // ====== ROUTE ĐỘNG BÊN DƯỚI ======
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('files', 10)) // Tối đa 10 files
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Tạo mới sự kiện',
    description: 'API tạo mới một sự kiện với khả năng upload file đính kèm'
  })
  @ApiResponse({
    status: 201,
    description: 'Tạo sự kiện thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ hoặc file không được hỗ trợ'
  })
  async create(
    @Body(ValidationPipe) createDto: CreateSuKienDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.suKienService.create(createDto, files);
  }
  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách sự kiện có phân trang',
    description: 'API lấy danh sách sự kiện với tìm kiếm và lọc'
  })
  @ApiQuery({ name: 'page', required: false, description: 'Số trang (mặc định: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng bản ghi mỗi trang (mặc định: 10)' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm theo tên sự kiện' })
  @ApiQuery({ name: 'trangThai', required: false, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'loaiSuKienId', required: false, description: 'Lọc theo loại sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async findAll(@Query(ValidationPipe) query: ListSuKienDto) {
    return await this.suKienService.findAll(query);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Lấy tất cả sự kiện',
    description: 'API lấy tất cả sự kiện không phân trang'
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách thành công'
  })
  async getAll() {
    return await this.suKienService.getAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy thông tin chi tiết sự kiện',
    description: 'API lấy thông tin chi tiết một sự kiện theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Lấy thông tin thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.suKienService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Cập nhật thông tin sự kiện',
    description: 'API cập nhật thông tin sự kiện theo ID và thêm file đính kèm'
  })
  @ApiParam({ name: 'id', description: 'ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Cập nhật thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'Dữ liệu không hợp lệ'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateSuKienDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.suKienService.update(id, updateDto, files);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa sự kiện',
    description: 'API xóa một sự kiện theo ID'
  })
  @ApiParam({ name: 'id', description: 'ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Xóa thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.suKienService.remove(id);
  }

  @Post(':id/upload-files')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Upload thêm file cho sự kiện',
    description: 'API upload thêm file đính kèm cho sự kiện đã tồn tại'
  })
  @ApiParam({ name: 'id', description: 'ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Upload file thành công'
  })
  @ApiResponse({
    status: 400,
    description: 'File không hợp lệ hoặc quá lớn'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async uploadFiles(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.suKienService.uploadFiles(id, files);
  }

  @Delete(':id/files/:fileName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xóa file đính kèm',
    description: 'API xóa một file đính kèm của sự kiện'
  })
  @ApiParam({ name: 'id', description: 'ID sự kiện' })
  @ApiParam({ name: 'fileName', description: 'Tên file cần xóa' })
  @ApiResponse({
    status: 200,
    description: 'Xóa file thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện hoặc file'
  })
  async removeFile(
    @Param('id', ParseIntPipe) id: number,
    @Param('fileName') fileName: string
  ) {
    return await this.suKienService.removeFile(id, fileName);
  }
  @Get(':id/files')
  @ApiOperation({
    summary: 'Lấy danh sách file của sự kiện',
    description: 'API lấy danh sách file đính kèm của một sự kiện'
  })
  @ApiParam({ name: 'id', description: 'ID sự kiện' })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách file thành công'
  })
  @ApiResponse({
    status: 404,
    description: 'Không tìm thấy sự kiện'
  })
  async getFileList(@Param('id', ParseIntPipe) id: number) {
    const files = await this.suKienService.getFileList(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Lấy danh sách file thành công',
      data: files
    };
  }
}
