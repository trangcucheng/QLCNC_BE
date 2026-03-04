import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTokenRepository } from './user-token.repository';

import { UserTokenController } from './user-token.controller';
import { UserTokenService } from './user-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserTokenRepository])],
  providers: [UserTokenService, UserTokenRepository],
  controllers: [UserTokenController],
  exports: [UserTokenService, UserTokenRepository]
})
export class UserTokenModule { }
