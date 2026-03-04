import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../databases/entities/user.entity';
import { ZaloUser } from '../../../databases/entities/ZaloUser.entity';

export interface UnifiedUser {
  id: string | number;
  userType: 'WEB' | 'ZALO';
  role: string;
  permissions: string[];
  originalUser: User | ZaloUser;
  systemUser?: User; // For Zalo users who are linked to system users
}

@Injectable()
export class UnifiedAuthService {
  private readonly logger = new Logger(UnifiedAuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(ZaloUser)
    private readonly zaloUserRepo: Repository<ZaloUser>
  ) { }

  async verifyToken(token: string): Promise<UnifiedUser> {
    // Try JWT_SECRET_KEY first (system users)
    try {
      const jwtSecret = this.configService.get<string>('JWT_SECRET_KEY');
      const payload = this.jwtService.verify(token, { secret: jwtSecret });

      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['roles', 'roles.permissions']
      });

      if (user) {
        return this.createUnifiedUser(user, 'WEB');
      }
    } catch (error) {
      this.logger.debug('JWT_SECRET_KEY verification failed, trying ZALO_JWT_SECRET');
    }

    // Try ZALO_JWT_SECRET (Zalo users)
    try {
      const zaloJwtSecret = this.configService.get<string>('ZALO_JWT_SECRET');
      const payload = this.jwtService.verify(token, { secret: zaloJwtSecret });

      const zaloUser = await this.zaloUserRepo.findOne({
        where: { zaloUserId: payload.sub },
        relations: ['user', 'user.roles', 'user.roles.permissions']
      });

      if (zaloUser) {
        return this.createUnifiedUser(zaloUser, 'ZALO');
      }
    } catch (error) {
      this.logger.debug('ZALO_JWT_SECRET verification failed');
    }

    throw new UnauthorizedException('Invalid authentication token');
  }

  private createUnifiedUser(user: User | ZaloUser, userType: 'WEB' | 'ZALO'): UnifiedUser {
    if (userType === 'WEB') {
      const webUser = user as User;
      return {
        id: webUser.id,
        userType: 'WEB',
        role: webUser.roleId === 1 ? 'admin' : 'user', // Basic role based on roleId
        permissions: webUser.roleId === 1 ? ['ADMIN', 'MANAGE_ALL'] : ['USER'], // Basic permissions
        originalUser: webUser,
      };
    } else {
      const zaloUser = user as ZaloUser;
      const linkedUser = zaloUser.user;

      return {
        id: zaloUser.zaloId, // Use zaloId instead of zaloUserId
        userType: 'ZALO',
        role: linkedUser?.roleId === 1 ? 'admin' : 'user', // Basic role from linked user
        permissions: linkedUser?.roleId === 1 ? ['ADMIN', 'MANAGE_ALL'] : ['USER'], // Basic permissions
        originalUser: zaloUser,
        systemUser: linkedUser,
      };
    }
  }
}
