import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Organization } from '../../databases/entities/Organization.entity';
import { Role } from '../../databases/entities/role.entity';
import { User } from '../../databases/entities/user.entity';
import { StaffController } from './staff.controller';
import { StaffRepository } from './staff.repository';
import { StaffService } from './staff.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    StaffRepository,
    User,
    Role,
    Organization
  ])],
  controllers: [StaffController],
  providers: [StaffService]
})
export class StaffModule { }
