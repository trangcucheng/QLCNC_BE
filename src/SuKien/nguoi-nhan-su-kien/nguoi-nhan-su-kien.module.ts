import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NguoiNhanSuKien } from '../../databases/entities/NguoiNhanSuKien.entity';
import { SuKien } from '../../databases/entities/SuKien.entity';
import { ThongBao } from '../../databases/entities/ThongBao.entity';
import { User } from '../../databases/entities/user.entity';
import { UserThongBao } from '../../databases/entities/UserThongBao.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ZaloUser } from '../../databases/entities/ZaloUser.entity';
import { AuthModule } from '../../HeThong/auth/auth.module';
import { FileDownloadController } from './file-download.controller';
import { MobileNguoiNhanSuKienController } from './mobile-nguoi-nhan-su-kien.controller';
import { NguoiNhanSuKienController } from './nguoi-nhan-su-kien.controller';
import { NguoiNhanSuKienService } from './nguoi-nhan-su-kien.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NguoiNhanSuKien, SuKien, ThongBao, UserThongBao, User, ZaloUser, ZaloAccount]),
    ConfigModule,
    AuthModule
  ],
  controllers: [NguoiNhanSuKienController, MobileNguoiNhanSuKienController, FileDownloadController],
  providers: [NguoiNhanSuKienService],
  exports: [NguoiNhanSuKienService],
})
export class NguoiNhanSuKienModule { }
