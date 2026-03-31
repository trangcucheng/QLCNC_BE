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
  constructor(private readonly hoSoDoiTuongService: HoSoDoiTuongService) {}

  @Post()
  @Permissions('ho-so-doi-tuong:create')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateHoSoDoiTuongDTO, @Request() req) {
    return this.hoSoDoiTuongService.create(createDto, req.user.sub);
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
}
