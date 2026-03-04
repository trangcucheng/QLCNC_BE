import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BaoCaoDoanSoTheoKy } from '../../databases/entities/BaoCaoDoanSoTheoKy.entity';
import { ThoiGianCapNhatDoanSo } from '../../databases/entities/ThoiGianCapNhatDoanSo.entity';
import { User } from '../../databases/entities/user.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
import { ElasticModule } from '../../elastic/elastic.module';
import { AuthModule } from '../auth/auth.module';
import { CumKhuCongNghiepModule } from '../cum-khu-cong-nghiep/cum-khu-cong-nghiep.module';
import { CumKhuCongNghiepService } from '../cum-khu-cong-nghiep/cum-khu-cong-nghiep.service';
import { OrganizationModule } from '../organization/organization.module';
import { OrganizationRepository } from '../organization/organization.repository';
import { RoleRepository } from '../role/role.repository';
import { ThoiGianCapNhatDoanSoModule } from '../thoi-gian-cap-nhat-doan-so/thoi-gian-cap-nhat-doan-so.module';
import { ThoiGianCapNhatDoanSoRepository } from '../thoi-gian-cap-nhat-doan-so/thoi-gian-cap-nhat-doan-so.repository';
import { ThongBaoModule } from '../thong-bao/thong-bao.module';
import { UserModule } from '../user/user.module';
import { UserRepository } from '../user/user.repository';
import { UserService } from '../user/user.service';
import { XaPhuongModule } from '../xa-phuong/xa-phuong.module';
import { XaPhuongService } from '../xa-phuong/xa-phuong.service';
import { BaoCaoDoanSoNotificationService } from './bao-cao-doan-so-notification.service';
import { BaoCaoDoanSoTheoKyController } from './bao-cao-doan-so-theo-ky.controller';
import { BaoCaoDoanSoTheoKyRepository } from './bao-cao-doan-so-theo-ky.repository';
import { BaoCaoDoanSoTheoKyService } from './bao-cao-doan-so-theo-ky.service';
import { ScheduleNotificationService } from './schedule-notification.service';
import { TestCronjobController } from './test-cronjob.controller';
import { ZaloBaoCaoDoanSoTheoKyController } from './zalo-bao-cao-doan-so-theo-ky.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BaoCaoDoanSoTheoKyRepository,
      RoleRepository,
      ThoiGianCapNhatDoanSoRepository,
      UserRepository,
      OrganizationRepository,
      ThoiGianCapNhatDoanSo,
      User,
      ZaloAccount
    ]),
    ConfigModule,
    ElasticModule,
    UserModule,
    OrganizationModule,
    ThongBaoModule,
    AuthModule,
    CumKhuCongNghiepModule,
    XaPhuongModule
  ],
  controllers: [BaoCaoDoanSoTheoKyController, ZaloBaoCaoDoanSoTheoKyController, TestCronjobController],
  providers: [BaoCaoDoanSoTheoKyService, BaoCaoDoanSoNotificationService, ScheduleNotificationService, CumKhuCongNghiepService, XaPhuongService],
  exports: [BaoCaoDoanSoTheoKyService, BaoCaoDoanSoNotificationService, ScheduleNotificationService]
})
export class BaoCaoDoanSoTheoKyModule { }
