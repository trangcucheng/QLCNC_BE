import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { XaPhuong } from '../../databases/entities/XaPhuong.entity';
import { XaPhuongController } from './xa-phuong.controller';
import { XaPhuongRepository } from './xa-phuong.repository'; // ✅ thêm dòng này
import { XaPhuongService } from './xa-phuong.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      XaPhuong,
      XaPhuongRepository, // ✅ đăng ký repository custom
    ]),
  ],
  controllers: [XaPhuongController],
  providers: [XaPhuongService],
  exports: [
    XaPhuongService,
    TypeOrmModule, // ✅ export để module khác (BaoCaoDoanSoTheoKyModule) dùng repo được
  ],
})
export class XaPhuongModule { }
