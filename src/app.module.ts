import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CustomAuthGuard } from './guard/custom-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { PermissionsGuard } from './guard/permissions.guard';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './module/nguoiDung/users.module';
import { UnitsModule } from './module/donVi/units.module';
import { RolesModule } from './module/vaiTro/roles.module';
import { PermissionsModule } from './module/quyen/permissions.module';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { LoginHistoryModule } from './module/lichSuDangNhap/login-histories.module';
import { BlacklistModule } from './log/blacklist/blacklist.module';
import { CronCleanBlacklistService } from './log/blacklist/cron-clean-blacklist.service';
import { BackupModule } from './backup/backup.module';
import { ExportsModule } from './module/exports_/exports.module';
import { SignsModule } from './module/kyHieu/signs.module';
import { DonViHanhChinhModule } from './module/donViHanhChinh/don-vi-hanh-chinh.module';
import { ToimDanhModule } from './module/toimDanh/toim-danh.module';
import { QuanHeXaHoiModule } from './module/quanHeXaHoi/quan-he-xa-hoi.module';
import { BieuMauModule } from './module/bieuMau/bieu-mau.module';
import { ThongBaoModule } from './module/thongBao/thong-bao.module';
import { CauHinhHeThongModule } from './module/cauHinhHeThong/cau-hinh-he-thong.module';
import { HoSoDoiTuongModule } from './module/hoSoDoiTuong/ho-so-doi-tuong.module';
import { HoSoVuViecModule } from './module/hoSoVuViec/ho-so-vu-viec.module';
import { TaiLieuModule } from './module/taiLieu/tai-lieu.module';
import { BaoCaoModule } from './module/baoCao/bao-cao.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    UnitsModule,
    RolesModule,
    PermissionsModule,
    BlacklistModule,
    LoginHistoryModule,
    BackupModule,
    ExportsModule,
    SignsModule,
    DonViHanhChinhModule,
    ToimDanhModule,
    QuanHeXaHoiModule,
    BieuMauModule,
    ThongBaoModule,
    CauHinhHeThongModule,
    HoSoDoiTuongModule,
    HoSoVuViecModule,
    TaiLieuModule,
    BaoCaoModule,
  ],
  controllers: [AppController],
  providers: [
    CronCleanBlacklistService,
    AppService,
    PrismaService,
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomAuthGuard, // Global AuthGuard to run first
    // },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // Global RolesGuard to run after AuthGuard
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerModule, // Global ThrottlerGuard to limit requests
    },
  ],
})
export class AppModule { }
