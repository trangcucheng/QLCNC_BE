// eslint-disable-next-line simple-import-sort/imports
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './HeThong/auth/auth.module';
import { UnifiedAuthModule } from './HeThong/auth/unified-auth.module';
import mail from './config/mail.config';
import { OrmModule } from './orm';
import { RoleModule } from './HeThong/role/role.module';
import { UserModule } from './HeThong/user/user.module';
import { UserTokenModule } from './HeThong/user-token/user-token.module';
import { getBackupConfig } from './config/backup.config';
import { OrganizationModule } from './HeThong/organization/organization.module';
import { StaffModule } from './HeThong/staff/staff.module';
import { XaPhuongModule } from './HeThong/xa-phuong/xa-phuong.module';
import { ChucVuModule } from './HeThong/chuc-vu/chuc-vu.module';
import { CumKhuCongNghiepModule } from './HeThong/cum-khu-cong-nghiep/cum-khu-cong-nghiep.module';
import { LoaiSuKienModule } from './SuKien/loai-su-kien/loai-su-kien.module';
import { NguoiNhanSuKienModule } from './SuKien/nguoi-nhan-su-kien/nguoi-nhan-su-kien.module';
import { SuKienModule } from './SuKien/su-kien/su-kien.module';
import { ThoiGianCapNhatDoanSoModule } from './HeThong/thoi-gian-cap-nhat-doan-so/thoi-gian-cap-nhat-doan-so.module';
import { BaoCaoDoanSoTheoKyModule } from './HeThong/bao-cao-doan-so-theo-ky/bao-cao-doan-so-theo-ky.module';
import { report } from 'process';
import { ReportModule } from './report/report.module';
import { ThongBaoModule } from './HeThong/thong-bao/thong-bao.module';
import { MailModule } from './HeThong/mail/mail.module';
import { CongTyChuaCoCDModule } from './HeThong/cong-ty-chua-co-cd/cong-ty-chua-co-cd.module';
import { ElasticModule } from './elastic/elastic.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [mail, getBackupConfig],
      cache: true,
    }),
    ScheduleModule.forRoot(),
    OrmModule,
    ElasticModule,
    MailModule,
    UserModule,
    UserTokenModule,
    RoleModule,
    AuthModule,
    UnifiedAuthModule,
    OrganizationModule,
    StaffModule,
    XaPhuongModule,
    ChucVuModule,
    CumKhuCongNghiepModule,
    CongTyChuaCoCDModule,
    LoaiSuKienModule,
    NguoiNhanSuKienModule,
    SuKienModule,
    ThoiGianCapNhatDoanSoModule,
    BaoCaoDoanSoTheoKyModule,
    ReportModule,
    ThongBaoModule
  ],
  controllers: [AppController],
  providers: [AppService,]
})
export class AppModule {

}
