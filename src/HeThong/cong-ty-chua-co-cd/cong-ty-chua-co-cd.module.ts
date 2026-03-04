import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CongTyChuaCoCD } from 'src/databases/entities/CongTyChuaCoCD.entity';
import { CumKhuCongNghiep } from 'src/databases/entities/CumKhuCongNghiep.entity';
import { Organization } from 'src/databases/entities/Organization.entity';
import { User } from 'src/databases/entities/user.entity';
import { ZaloUser } from 'src/databases/entities/ZaloUser.entity';

import { RolesGuard } from '../auth/guards/roles.guard';
import { UnifiedAuthGuard } from '../auth/guards/unified-auth.guard';
import { CongTyChuaCoCDController } from './cong-ty-chua-co-cd.controller';
import { CongTyChuaCoCDRepository } from './cong-ty-chua-co-cd.repository';
import { CongTyChuaCoCDService } from './cong-ty-chua-co-cd.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CongTyChuaCoCD,
      CumKhuCongNghiep,
      Organization,
      User,
      ZaloUser,
      CongTyChuaCoCDRepository,
    ]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [CongTyChuaCoCDController],
  providers: [
    CongTyChuaCoCDService,
    UnifiedAuthGuard,
    RolesGuard,
  ],
  exports: [
    CongTyChuaCoCDService,
    TypeOrmModule,
  ],
})
export class CongTyChuaCoCDModule { }
