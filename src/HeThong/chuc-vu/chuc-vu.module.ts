import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChucVu } from '../../databases/entities/ChucVu.entity';
import { ChucVuController } from './chuc-vu.controller';
import { ChucVuRepository } from './chuc-vu.repository';
import { ChucVuService } from './chuc-vu.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChucVu,
      ChucVuRepository,
    ]),
  ],
  controllers: [ChucVuController],
  providers: [ChucVuService],
  exports: [
    ChucVuService,
    TypeOrmModule,
  ],
})
export class ChucVuModule { }
