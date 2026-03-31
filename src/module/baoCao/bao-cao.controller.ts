import { 
  Controller, 
  Get, 
  Query,
  UseGuards,
} from '@nestjs/common';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoQueryDTO } from './dto/bao-cao-query.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from 'src/guard/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';

@Controller('bao-cao')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BaoCaoController {
  constructor(private readonly baoCaoService: BaoCaoService) {}

  @Get('dashboard')
  @Permissions('bao-cao:read')
  getDashboard(@Query() query: BaoCaoQueryDTO) {
    return this.baoCaoService.getDashboard(query);
  }

  @Get('khu-vuc')
  @Permissions('bao-cao:read')
  baoCaoKhuVuc(@Query() query: BaoCaoQueryDTO) {
    return this.baoCaoService.baoCaoTheoKhuVuc(query);
  }

  @Get('toim-danh')
  @Permissions('bao-cao:read')
  baoCaoToimDanh(@Query() query: BaoCaoQueryDTO) {
    return this.baoCaoService.baoCaoTheoToimDanh(query);
  }

  @Get('xu-huong')
  @Permissions('bao-cao:read')
  baoCaoXuHuong(@Query() query: BaoCaoQueryDTO) {
    return this.baoCaoService.baoCaoXuHuong(query);
  }

  @Get('tien-do')
  @Permissions('bao-cao:read')
  baoCaoTienDo(@Query() query: BaoCaoQueryDTO) {
    return this.baoCaoService.baoCaoTienDo(query);
  }

  @Get('tong-hop')
  @Permissions('bao-cao:read')
  xuatBaoCaoTongHop(@Query() query: BaoCaoQueryDTO) {
    return this.baoCaoService.xuatBaoCaoTongHop(query);
  }
}
