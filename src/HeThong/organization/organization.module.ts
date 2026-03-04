import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { OrganizationFieldSchema } from 'src/databases/entities/OrganizationFieldSchema.entity';
import { Role } from 'src/databases/entities/role.entity';
import { User } from 'src/databases/entities/user.entity';
import { XaPhuong } from 'src/databases/entities/XaPhuong.entity';

import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
import { MobileOrganizationController } from './mobile-organization.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      OrganizationFieldSchema,
      CumKhuCongNghiep,
      XaPhuong,
      User,
      Role
    ]),
    UserModule,
    RoleModule
  ],
  controllers: [OrganizationController, MobileOrganizationController],
  providers: [OrganizationService],
  exports: [OrganizationService]
})
export class OrganizationModule { }
