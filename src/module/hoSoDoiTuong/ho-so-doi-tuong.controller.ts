import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
  BadRequestException
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { HoSoDoiTuongService } from './ho-so-doi-tuong.service';
import { CreateHoSoDoiTuongDTO } from './dto/create-ho-so-doi-tuong.dto';
import { UpdateHoSoDoiTuongDTO } from './dto/update-ho-so-doi-tuong.dto';
import { SearchHoSoDoiTuongDTO } from './dto/search-ho-so-doi-tuong.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from 'src/guard/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';

@Controller('ho-so-doi-tuong')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HoSoDoiTuongController {
  constructor(private readonly hoSoDoiTuongService: HoSoDoiTuongService) { }

  @Post()
  @Permissions('ho-so-doi-tuong:create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHoSoDoiTuongDTO, @Request() req) {
    return this.hoSoDoiTuongService.create(createDto, req.user.id);
  }

  @Get()
  @Permissions('ho-so-doi-tuong:read')
  findAll(@Query() searchDto: SearchHoSoDoiTuongDTO) {
    return this.hoSoDoiTuongService.findAll(searchDto);
  }

  @Get('thong-ke/khu-vuc')
  @Permissions('ho-so-doi-tuong:read')
  thongKeKhuVuc() {
    return this.hoSoDoiTuongService.thongKeTheoKhuVuc();
  }

  @Get('thong-ke/trang-thai')
  @Permissions('ho-so-doi-tuong:read')
  thongKeTrangThai() {
    return this.hoSoDoiTuongService.thongKeTheoTrangThai();
  }

  @Get(':id')
  @Permissions('ho-so-doi-tuong:read')
  findOne(@Param('id') id: string) {
    return this.hoSoDoiTuongService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ho-so-doi-tuong:update')
  update(@Param('id') id: string, @Body() updateDto: UpdateHoSoDoiTuongDTO) {
    return this.hoSoDoiTuongService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('ho-so-doi-tuong:delete')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.hoSoDoiTuongService.remove(id);
  }

  @Post(':id/upload-anh')
  @Permissions('ho-so-doi-tuong:update')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/doi-tuong',
        filename: (req, file, cb) => {
          if (!file || !file.originalname) {
            cb(new BadRequestException('No file uploaded'), '');
            return;
          }
          const ext = path.extname(file.originalname);
          const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
    }),
  )
  async uploadAnh(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }
    const fileUrls = files.map(file => `/uploads/doi-tuong/${file.filename}`);
    return this.hoSoDoiTuongService.uploadAnh(id, fileUrls);
  }
}
