import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CauHinhHeThongController } from './cau-hinh-he-thong.controller';
import { CauHinhHeThongService } from './cau-hinh-he-thong.service';

@Module({
  controllers: [CauHinhHeThongController],
  providers: [PrismaService, CauHinhHeThongService],
  exports: [CauHinhHeThongService],
})
export class CauHinhHeThongModule { }

