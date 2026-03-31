import { Module } from '@nestjs/common';
import { HoSoDoiTuongService } from './ho-so-doi-tuong.service';
import { HoSoDoiTuongController } from './ho-so-doi-tuong.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [HoSoDoiTuongController],
  providers: [HoSoDoiTuongService, PrismaService],
  exports: [HoSoDoiTuongService],
})
export class HoSoDoiTuongModule {}
