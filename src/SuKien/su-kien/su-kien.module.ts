import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoaiSuKien } from '../../databases/entities/LoaiSuKien.entity';
import { SuKien } from '../../databases/entities/SuKien.entity';
import { User } from '../../databases/entities/user.entity';
import { FileService } from './file.service';
import { MobileSuKienController } from './mobile-su-kien.controller';
import { SuKienController } from './su-kien.controller';
import { SuKienService } from './su-kien.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SuKien, LoaiSuKien, User]),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 10, // Tối đa 10 files
      },
    }),
  ],
  controllers: [SuKienController, MobileSuKienController],
  providers: [SuKienService, FileService],
  exports: [SuKienService, FileService],
})
export class SuKienModule { }
