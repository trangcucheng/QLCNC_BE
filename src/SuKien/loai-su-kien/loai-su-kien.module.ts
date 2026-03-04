import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoaiSuKien } from '../../databases/entities/LoaiSuKien.entity';
import { LoaiSuKienController } from './loai-su-kien.controller';
import { LoaiSuKienService } from './loai-su-kien.service';
import { MobileLoaiSuKienController } from './mobile-loai-su-kien.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LoaiSuKien])],
  controllers: [LoaiSuKienController, MobileLoaiSuKienController],
  providers: [LoaiSuKienService],
  exports: [LoaiSuKienService],
})
export class LoaiSuKienModule { }
