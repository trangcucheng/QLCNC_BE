import { Module } from '@nestjs/common';
import { HoSoVuViecService } from './ho-so-vu-viec.service';
import { HoSoVuViecController } from './ho-so-vu-viec.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [HoSoVuViecController],
  providers: [HoSoVuViecService, PrismaService],
  exports: [HoSoVuViecService],
})
export class HoSoVuViecModule {}
