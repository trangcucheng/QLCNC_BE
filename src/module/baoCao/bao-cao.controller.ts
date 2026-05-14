import {
  Controller,
  Get,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoExportService } from './bao-cao-export.service';
import { BaoCaoQueryDTO } from './dto/bao-cao-query.dto';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';
import { PermissionsGuard } from 'src/guard/permissions.guard';
import { Permissions } from 'src/decorator/permissions.decorator';

@Controller('bao-cao')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BaoCaoController {
  constructor(
    private readonly baoCaoService: BaoCaoService,
    private readonly exportService: BaoCaoExportService,
  ) { }

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

  @Get('export/excel')
  @Permissions('bao-cao:export')
  async exportExcel(@Query() query: BaoCaoQueryDTO, @Res() res: Response) {
    try {
      const filePath = await this.exportService.exportToExcel(query);
      return res.download(filePath, 'bao-cao.xlsx', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Clean up file after download
        const fs = require('fs');
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Export Excel error:', error);
      return res.status(500).json({ message: 'Lỗi khi xuất file Excel' });
    }
  }

  @Get('export/pdf')
  @Permissions('bao-cao:export')
  async exportPDF(@Query() query: BaoCaoQueryDTO, @Res() res: Response) {
    try {
      const filePath = await this.exportService.exportToPDF(query);
      return res.download(filePath, 'bao-cao.pdf', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        const fs = require('fs');
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Export PDF error:', error);
      return res.status(500).json({ message: 'Lỗi khi xuất file PDF' });
    }
  }

  @Get('export/word')
  @Permissions('bao-cao:export')
  async exportWord(@Query() query: BaoCaoQueryDTO, @Res() res: Response) {
    try {
      const filePath = await this.exportService.exportToWord(query);
      return res.download(filePath, 'bao-cao.docx', (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        const fs = require('fs');
        setTimeout(() => {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Export Word error:', error);
      return res.status(500).json({ message: 'Lỗi khi xuất file Word' });
    }
  }
}
