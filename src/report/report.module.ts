import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaoCaoDoanSoTheoKy } from 'src/databases/entities/BaoCaoDoanSoTheoKy.entity';
import { CongTyChuaCoCD } from 'src/databases/entities/CongTyChuaCoCD.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { SuKien } from 'src/databases/entities/SuKien.entity';
import { CumKhuCongNghiepRepository } from 'src/HeThong/cum-khu-cong-nghiep/cum-khu-cong-nghiep.repository';
import { OrganizationRepository } from 'src/HeThong/organization/organization.repository';
import { RoleRepository } from 'src/HeThong/role/role.repository';
import { UserRepository } from 'src/HeThong/user/user.repository';
import { XaPhuongRepository } from 'src/HeThong/xa-phuong/xa-phuong.repository';

import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { ZaloReportController } from './zalo-report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    UserRepository,
    OrganizationRepository,
    RoleRepository,
    Organization,
    BaoCaoDoanSoTheoKy,
    SuKien,
    CongTyChuaCoCD,
    CumKhuCongNghiepRepository,
    XaPhuongRepository
  ])],
  controllers: [ReportController, ZaloReportController],
  providers: [ReportService]
})
export class ReportModule { }
