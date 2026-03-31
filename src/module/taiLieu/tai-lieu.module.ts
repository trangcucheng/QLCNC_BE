import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TaiLieuService } from './tai-lieu.service';
import { TaiLieuController } from './tai-lieu.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [TaiLieuController],
  providers: [TaiLieuService, PrismaService],
  exports: [TaiLieuService],
})
export class TaiLieuModule {}
