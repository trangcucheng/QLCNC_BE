import { Module } from '@nestjs/common';
import { QuanHeXaHoiService } from './quan-he-xa-hoi.service';
import { QuanHeXaHoiController } from './quan-he-xa-hoi.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [QuanHeXaHoiController],
  providers: [PrismaService, QuanHeXaHoiService],
  exports: [QuanHeXaHoiService],
})
export class QuanHeXaHoiModule { }
