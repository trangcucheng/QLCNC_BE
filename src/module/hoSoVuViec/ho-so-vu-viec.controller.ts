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
  HttpStatus
} from '@nestjs/common';
import { HoSoVuViecService } from './ho-so-vu-viec.service';
import { CreateHoSoVuViecDTO } from './dto/create-ho-so-vu-viec.dto';
import { UpdateHoSoVuViecDTO } from './dto/update-ho-so-vu-viec.dto';
import { SearchHoSoVuViecDTO } from './dto/search-ho-so-vu-viec.dto';
import { CapNhatTrangThaiDTO } from './dto/cap-nhat-trang-thai.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from 'src/guard/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';

@Controller('ho-so-vu-viec')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HoSoVuViecController {
  constructor(private readonly hoSoVuViecService: HoSoVuViecService) {}

  @Post()
  @Permissions('ho-so-vu-viec:create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHoSoVuViecDTO, @Request() req) {
    return this.hoSoVuViecService.create(createDto, req.user.sub);
  }

  @Get()
  @Permissions('ho-so-vu-viec:read')
  findAll(@Query() searchDto: SearchHoSoVuViecDTO) {
    return this.hoSoVuViecService.findAll(searchDto);
  }

  @Get('thong-ke/muc-do')
  @Permissions('ho-so-vu-viec:read')
  thongKeMucDo() {
    return this.hoSoVuViecService.thongKeTheoMucDo();
  }

  @Get('thong-ke/trang-thai')
  @Permissions('ho-so-vu-viec:read')
  thongKeTrangThai() {
    return this.hoSoVuViecService.thongKeTheoTrangThai();
  }

  @Get('thong-ke/khu-vuc')
  @Permissions('ho-so-vu-viec:read')
  thongKeKhuVuc() {
    return this.hoSoVuViecService.thongKeTheoKhuVuc();
  }

  @Get('thong-ke/toim-danh')
  @Permissions('ho-so-vu-viec:read')
  thongKeToimDanh() {
    return this.hoSoVuViecService.thongKeTheoToimDanh();
  }

  @Get(':id')
  @Permissions('ho-so-vu-viec:read')
  findOne(@Param('id') id: string) {
    return this.hoSoVuViecService.findOne(id);
  }

  @Patch(':id')
  @Permissions('ho-so-vu-viec:update')
  update(@Param('id') id: string, @Body() updateDto: UpdateHoSoVuViecDTO) {
    return this.hoSoVuViecService.update(id, updateDto);
  }

  @Patch(':id/trang-thai')
  @Permissions('ho-so-vu-viec:update')
  capNhatTrangThai(
    @Param('id') id: string, 
    @Body() capNhatDto: CapNhatTrangThaiDTO,
    @Request() req
  ) {
    return this.hoSoVuViecService.capNhatTrangThai(id, capNhatDto, req.user.hoTen || req.user.email);
  }

  @Delete(':id')
  @Permissions('ho-so-vu-viec:delete')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.hoSoVuViecService.remove(id);
  }
}
