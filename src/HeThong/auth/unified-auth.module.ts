import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/databases/entities/user.entity';
import { ZaloUser } from 'src/databases/entities/ZaloUser.entity';

import { RolesGuard } from './guards/roles.guard';
import { UnifiedAuthGuard } from './guards/unified-auth.guard';
import { UnifiedAuthService } from './services/unified-auth.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, ZaloUser]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [
    UnifiedAuthService,
    UnifiedAuthGuard,
    RolesGuard,
  ],
  exports: [
    UnifiedAuthService,
    UnifiedAuthGuard,
    RolesGuard,
    JwtModule,
  ],
})
export class UnifiedAuthModule { }
