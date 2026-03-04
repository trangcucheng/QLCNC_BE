import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { FlexibleAuthGuard } from '../auth/guards/flexible-auth.guard';
import { CongTyChuaCoCDService } from './cong-ty-chua-co-cd.service';
import { CreateCongTyChuaCoCDDto } from './dto/create-cong-ty-chua-co-cd.dto';
import { ListCongTyChuaCoCDDto } from './dto/list-cong-ty-chua-co-cd.dto';
import { UpdateCongTyChuaCoCDDto } from './dto/update-cong-ty-chua-co-cd.dto';

@ApiTags('cong-ty-chua-co-cd')
@Controller('cong-ty-chua-co-cd')
export class CongTyChuaCoCDController {
  constructor(private readonly congTyChuaCoCDService: CongTyChuaCoCDService) { }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Tạo mới công ty chưa có công đoàn' })
  async create(@Body() createDto: CreateCongTyChuaCoCDDto) {
    return this.congTyChuaCoCDService.create(createDto);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công ty chưa có công đoàn' })
  async findAll(@Query() query: ListCongTyChuaCoCDDto) {
    return this.congTyChuaCoCDService.findAll(query);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('all')
  @ApiOperation({ summary: 'Lấy tất cả công ty (không phân trang)' })
  async getAll() {
    return this.congTyChuaCoCDService.getAll();
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-theo-cum-khu')
  @ApiOperation({ summary: 'Thống kê số lượng công ty theo cụm khu công nghiệp' })
  async thongKeSoLuongTheoCumKhu() {
    return this.congTyChuaCoCDService.thongKeSoLuongTheoCumKhu();
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get('thong-ke-cong-ty-va-organization')
  @ApiOperation({
    summary: 'Thống kê số lượng công ty và organization theo cụm khu công nghiệp',
    description: 'Trả về danh sách cụm khu với số lượng công ty chưa có CD và số lượng organization'
  })
  async thongKeCongTyVaOrganization() {
    return this.congTyChuaCoCDService.thongKeCongTyVaOrganization();
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết công ty chưa có công đoàn' })
  async findOne(@Param('id') id: string) {
    return this.congTyChuaCoCDService.findOne(+id);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật công ty chưa có công đoàn' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateCongTyChuaCoCDDto) {
    return this.congTyChuaCoCDService.update(+id, updateDto);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Xóa công ty chưa có công đoàn' })
  async remove(@Param('id') id: string) {
    return this.congTyChuaCoCDService.remove(+id);
  }

  @UseGuards(FlexibleAuthGuard)
  @ApiBearerAuth()
  @Post('import')
  @ApiOperation({
    summary: 'Import danh sách công ty từ Excel',
    description: 'File Excel gồm nhiều sheet, mỗi sheet tên là tên cụm khu CN. Mỗi sheet có 2 cột: STT và Tên công ty. Data bắt đầu từ row có STT=1'
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File Excel (.xlsx hoặc .xls)'
        }
      }
    }
  })
  @UseInterceptors(FileInterceptor('file'))
  async importFromExcel(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response
  ) {
    if (!file) {
      return res.status(400).json({
        message: 'Vui lòng upload file Excel'
      });
    }

    // Kiểm tra định dạng file
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        message: 'File không đúng định dạng. Vui lòng upload file Excel (.xlsx hoặc .xls)'
      });
    }

    const result = await this.congTyChuaCoCDService.importFromExcel(file);

    return res.json({
      message: result.errorCount === 0 ? 'Import thành công' : 'Import hoàn tất với một số lỗi',
      data: result
    });
  }
}
