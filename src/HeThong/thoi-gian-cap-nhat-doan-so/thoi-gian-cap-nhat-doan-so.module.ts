import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThoiGianCapNhatDoanSo } from 'src/databases/entities/ThoiGianCapNhatDoanSo.entity';

import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { AuthModule } from '../auth/auth.module';
import { ThoiGianCapNhatDoanSoController } from './thoi-gian-cap-nhat-doan-so.controller';
import { ThoiGianCapNhatDoanSoRepository } from './thoi-gian-cap-nhat-doan-so.repository';
import { ThoiGianCapNhatDoanSoService } from './thoi-gian-cap-nhat-doan-so.service';
import { ThoiGianCapNhatDoanSoCronService } from './thoi-gian-cap-nhat-doan-so-cron.service';
// import { ZaloThoiGianCapNhatDoanSoController } from './zalo-thoi-gian-cap-nhat-doan-so.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ThoiGianCapNhatDoanSoRepository,
      ThoiGianCapNhatDoanSo,
      User,
      ZaloAccount
    ]),
    AuthModule
  ],
  controllers: [ThoiGianCapNhatDoanSoController],
  providers: [
    ThoiGianCapNhatDoanSoService,
    ThoiGianCapNhatDoanSoCronService
  ],
  exports: [ThoiGianCapNhatDoanSoService, ThoiGianCapNhatDoanSoCronService]
})
export class ThoiGianCapNhatDoanSoModule { }
