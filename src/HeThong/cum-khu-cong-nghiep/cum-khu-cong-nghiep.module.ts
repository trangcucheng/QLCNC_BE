import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CumKhuCongNghiep } from '../../databases/entities/CumKhuCongNghiep.entity';
import { User } from '../../databases/entities/user.entity';
import { ZaloUser } from '../../databases/entities/ZaloUser.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UnifiedAuthGuard } from '../auth/guards/unified-auth.guard';
import { CumKhuCongNghiepController } from './cum-khu-cong-nghiep.controller';
import { CumKhuCongNghiepRepository } from './cum-khu-cong-nghiep.repository';
import { CumKhuCongNghiepService } from './cum-khu-cong-nghiep.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CumKhuCongNghiep,
      User,
      ZaloUser,
      CumKhuCongNghiepRepository, // ✅ thêm vào đây
    ]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [CumKhuCongNghiepController],
  providers: [
    CumKhuCongNghiepService,
    UnifiedAuthGuard,
    RolesGuard,
  ],
  exports: [
    CumKhuCongNghiepService,
    TypeOrmModule, // ✅ export để module khác inject được repository
  ],
})
export class CumKhuCongNghiepModule { }
