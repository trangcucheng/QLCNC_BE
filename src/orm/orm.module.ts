import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaoCaoDoanSoTheoKy } from 'src/databases/entities/BaoCaoDoanSoTheoKy.entity';
import { ChucVu } from 'src/databases/entities/ChucVu.entity';
import { LoaiSuKien } from 'src/databases/entities/LoaiSuKien.entity';
import { NguoiNhanSuKien } from 'src/databases/entities/NguoiNhanSuKien.entity';
import { OrganizationFieldSchema } from 'src/databases/entities/OrganizationFieldSchema.entity';
import { SuKien } from 'src/databases/entities/SuKien.entity';
import { ThoiGianCapNhatDoanSo } from 'src/databases/entities/ThoiGianCapNhatDoanSo.entity';
import { ThongBao } from 'src/databases/entities/ThongBao.entity';
import { UserThongBao } from 'src/databases/entities/UserThongBao.entity';

import { CongTyChuaCoCD } from '../databases/entities/CongTyChuaCoCD.entity';
import { CumKhuCongNghiep } from '../databases/entities/CumKhuCongNghiep.entity';
import { OaFollowEvent } from '../databases/entities/OaFollowEvent.entity';
import { Organization } from '../databases/entities/Organization.entity';
import { Role } from '../databases/entities/role.entity';
import { Staff } from '../databases/entities/Staff.entity';
import { User } from '../databases/entities/user.entity';
import { UserToken } from '../databases/entities/userToken.entity';
import { XaPhuong } from '../databases/entities/XaPhuong.entity';
import { ZaloAccount } from '../databases/entities/ZaloAccount.entity';
import { ZaloSession } from '../databases/entities/ZaloSession.entity';
import { ZaloUser } from '../databases/entities/ZaloUser.entity';
require('dotenv').config();

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME,
      entities: [User, UserToken, Role, Staff, Organization, CumKhuCongNghiep, CongTyChuaCoCD, XaPhuong, ZaloUser, ZaloAccount, ZaloSession, OaFollowEvent, LoaiSuKien, SuKien, NguoiNhanSuKien,
        ThoiGianCapNhatDoanSo, OrganizationFieldSchema, BaoCaoDoanSoTheoKy,
        ThongBao, UserThongBao, ChucVu
      ],
      synchronize: false,
      logging: true,
      timezone: 'Z',
      extra: {
        authPlugin: 'mysql_native_password',
      }
    })
  ],
  exports: [TypeOrmModule]
})
export class OrmModule { }
