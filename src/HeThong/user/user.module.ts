import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { Role } from 'src/databases/entities/role.entity';
import { User } from 'src/databases/entities/user.entity';
import { XaPhuong } from 'src/databases/entities/XaPhuong.entity';
import { ZaloAccount } from 'src/databases/entities/ZaloAccount.entity';
import { ZaloUser } from 'src/databases/entities/ZaloUser.entity';

import { AuthModule } from '../auth/auth.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      ZaloUser,
      ZaloAccount,
      Organization,
      CumKhuCongNghiep,
      XaPhuong
    ]),
    AuthModule
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule { }
