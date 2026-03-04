import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from '../../databases/entities/role.entity';
import { User } from '../../databases/entities/user.entity';
import { UserToken } from '../../databases/entities/userToken.entity';
import { ZaloAccount } from '../../databases/entities/ZaloAccount.entity';
// import { ZaloOAToken } from '../../databases/entities/ZaloOAToken.entity';
import { ZaloUser } from '../../databases/entities/ZaloUser.entity';
import { MailModule } from '../mail/mail.module';
import { ThongBaoModule } from '../thong-bao/thong-bao.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FlexibleAuthGuard } from './guards/flexible-auth.guard';
import { RolesGuard } from './guards/roles.guard';
// Import unified guards
import { UnifiedAuthGuard } from './guards/unified-auth.guard';
import { JsonWebTokenStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ZaloJwtStrategy } from './strategies/zalo-jwt.strategy';
import { ZaloController } from './zalo.controller';
import { ZaloService } from './zalo.service';
import { ZaloAccountService } from './zalo-account.service';
import { ZaloAccountsController } from './zalo-accounts.controller';
import { ZaloLinkController } from './zalo-link.controller';
import { ZaloOASimpleTokenService } from './zalo-oa-simple-token.service';
import { ZaloOAuthController } from './zalo-oauth.controller';
// import { ZaloOATokenService } from './zalo-oa-token.service';
// import { ZaloOATokenService as ZaloOATokenDBService } from './zalo-oa-token-db.service';
import { ZaloPushNotificationService } from './zalo-push.service';
import { ZaloTokenService } from './zalo-token.service';
import { ZaloUserService } from './zalo-user.service';


require('dotenv').config();
@Global()
@Module({
  imports: [
    MailModule,
    TypeOrmModule.forFeature([
      User,
      ZaloUser,
      ZaloAccount,
      // ZaloOAToken, // Comment tạm thời
      Role,
      UserToken,
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRED_TOKEN_AFTER }
    }),
    ConfigModule,
    HttpModule,
    ThongBaoModule,
  ],
  providers: [
    {
      provide: AuthService,
      useClass: AuthService
    },
    ZaloService,
    ZaloAccountService,
    // ZaloOATokenService, // Comment tạm thời
    // ZaloOATokenDBService, // Comment tạm thời  
    ZaloOASimpleTokenService,
    ZaloTokenService,
    ZaloPushNotificationService,
    ZaloUserService,
    LocalStrategy,
    JsonWebTokenStrategy,
    JwtRefreshStrategy,
    ZaloJwtStrategy,
    // Add unified guards
    UnifiedAuthGuard,
    FlexibleAuthGuard,  // New flexible guard
    RolesGuard,
  ],
  controllers: [AuthController, ZaloController, ZaloLinkController, ZaloOAuthController, ZaloAccountsController],
  exports: [AuthService, ZaloTokenService, ZaloAccountService, /* ZaloOATokenService, ZaloOATokenDBService, */ ZaloOASimpleTokenService, ZaloPushNotificationService, ZaloUserService, UnifiedAuthGuard, FlexibleAuthGuard, RolesGuard]
})
export class AuthModule { }
