import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TaiLieuService } from './tai-lieu.service';
import { CreateTaiLieuDoiTuongDTO, CreateTaiLieuVuViecDTO } from './dto/create-tai-lieu.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from 'src/guard/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';

@Controller('tai-lieu')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TaiLieuController {
  constructor(private readonly taiLieuService: TaiLieuService) {}

  // ===== TÀI LIỆU ĐỐI TƯỢNG =====

  @Post('doi-tuong')
  @Permissions('tai-lieu:create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/tai-lieu/doi-tuong',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    }
  }))
  async uploadTaiLieuDoiTuong(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để tải lên');
    }

    const createDto: CreateTaiLieuDoiTuongDTO = {
      doiTuongId: body.doiTuongId,
      tenTaiLieu: body.tenTaiLieu || file.originalname,
      loaiTaiLieu: body.loaiTaiLieu,
      duongDan: file.path,
      kichThuoc: file.size,
      moTa: body.moTa,
    };

    return this.taiLieuService.createTaiLieuDoiTuong(createDto);
  }

  @Get('doi-tuong/:doiTuongId')
  @Permissions('tai-lieu:read')
  getTaiLieuDoiTuong(@Param('doiTuongId') doiTuongId: string) {
    return this.taiLieuService.findTaiLieuByDoiTuong(doiTuongId);
  }

  @Delete('doi-tuong/:id')
  @Permissions('tai-lieu:delete')
  @HttpCode(HttpStatus.OK)
  removeTaiLieuDoiTuong(@Param('id') id: string) {
    return this.taiLieuService.removeTaiLieuDoiTuong(id);
  }

  // ===== TÀI LIỆU VỤ VIỆC =====

  @Post('vu-viec')
  @Permissions('tai-lieu:create')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/tai-lieu/vu-viec',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      }
    }),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB
    }
  }))
  async uploadTaiLieuVuViec(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file để tải lên');
    }

    const createDto: CreateTaiLieuVuViecDTO = {
      vuViecId: body.vuViecId,
      tenTaiLieu: body.tenTaiLieu || file.originalname,
      loaiTaiLieu: body.loaiTaiLieu,
      duongDan: file.path,
      kichThuoc: file.size,
      moTa: body.moTa,
    };

    return this.taiLieuService.createTaiLieuVuViec(createDto);
  }

  @Get('vu-viec/:vuViecId')
  @Permissions('tai-lieu:read')
  getTaiLieuVuViec(@Param('vuViecId') vuViecId: string) {
    return this.taiLieuService.findTaiLieuByVuViec(vuViecId);
  }

  @Delete('vu-viec/:id')
  @Permissions('tai-lieu:delete')
  @HttpCode(HttpStatus.OK)
  removeTaiLieuVuViec(@Param('id') id: string) {
    return this.taiLieuService.removeTaiLieuVuViec(id);
  }

  // ===== THỐNG KÊ =====

  @Get('thong-ke')
  @Permissions('tai-lieu:read')
  thongKe() {
    return this.taiLieuService.thongKe();
  }
}
