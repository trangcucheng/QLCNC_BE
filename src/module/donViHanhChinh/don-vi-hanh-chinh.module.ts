import { Module } from '@nestjs/common';
import { DonViHanhChinhService } from './don-vi-hanh-chinh.service';
import { DonViHanhChinhController } from './don-vi-hanh-chinh.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [DonViHanhChinhController],
  providers: [PrismaService, DonViHanhChinhService],
  exports: [DonViHanhChinhService], // Export service để sử dụng ở module khác
})
export class DonViHanhChinhModule {}
