import { Module } from '@nestjs/common';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoExportService } from './bao-cao-export.service';
import { BaoCaoController } from './bao-cao.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BaoCaoController],
  providers: [BaoCaoService, BaoCaoExportService, PrismaService],
  exports: [BaoCaoService, BaoCaoExportService],
})
export class BaoCaoModule { }
