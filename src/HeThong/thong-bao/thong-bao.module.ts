import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ThongBao } from '../../databases/entities/ThongBao.entity';
import { User } from '../../databases/entities/user.entity';
import { UserThongBao } from '../../databases/entities/UserThongBao.entity';
import { ThongBaoController } from './thong-bao.controller';
import { ThongBaoService } from './thong-bao.service';
import { ZaloThongBaoController } from './zalo-thong-bao.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThongBao, UserThongBao, User])
  ],
  controllers: [ThongBaoController, ZaloThongBaoController],
  providers: [ThongBaoService],
  exports: [ThongBaoService],
})
export class ThongBaoModule { }
