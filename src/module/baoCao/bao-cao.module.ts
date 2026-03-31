import { Module } from '@nestjs/common';
import { BaoCaoService } from './bao-cao.service';
import { BaoCaoController } from './bao-cao.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BaoCaoController],
  providers: [BaoCaoService, PrismaService],
  exports: [BaoCaoService],
})
export class BaoCaoModule {}
