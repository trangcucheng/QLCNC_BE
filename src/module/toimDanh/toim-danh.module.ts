import { Module } from '@nestjs/common';
import { ToimDanhService } from './toim-danh.service';
import { ToimDanhController } from './toim-danh.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ToimDanhController],
  providers: [PrismaService, ToimDanhService],
  exports: [ToimDanhService],
})
export class ToimDanhModule {}
