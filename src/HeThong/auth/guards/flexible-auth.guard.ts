import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from '../auth.service';

@Injectable()
export class FlexibleAuthGuard implements CanActivate {
  private readonly logger = new Logger(FlexibleAuthGuard.name);

  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Authentication token required');
    }

    // Try Web authentication first
    try {
      const webPayload = await this.authService.decodeToken(token);
      if (webPayload) {
        this.logger.debug(`Token payload structure:`, webPayload);

        // Check if this is a Zalo token (has type: "zalo" and userId field)
        if (webPayload.type === 'zalo' && webPayload.userId) {
          // This is a Zalo token with system user mapping, use userId directly
          request.user = {
            id: webPayload.userId, // Use system user ID for data filtering
            userType: 'ZALO',
            authSource: 'zalo',
            zaloUserId: webPayload.sub || webPayload.userId,
            zaloId: webPayload.zaloId,
            identity: webPayload.identity,
            fullName: webPayload.name,
            organizationId: webPayload.organizationId,
            cumKhuCnId: webPayload.cumKhuCnId,
            xaPhuongId: webPayload.xaPhuongId,
            roleId: webPayload.roleId,
            ...webPayload
          };
          this.logger.debug(`Detected Zalo token with system user mapping: ${webPayload.userId}`);
          return true;
        } else {
          // This is a regular Web token or Zalo token without mapping
          request.user = {
            id: webPayload.sub || webPayload.userId,
            ...webPayload,
            userType: webPayload.type === 'zalo' ? 'ZALO' : 'WEB',
            authSource: webPayload.type === 'zalo' ? 'zalo' : 'web'
          };
          this.logger.debug(`Authenticated as ${webPayload.type || 'Web'} user: ${webPayload.sub}, setting id: ${request.user.id}`);
          return true;
        }
      }
    } catch (error) {
      this.logger.debug('Web authentication failed, trying Zalo...');
    }

    // Try Zalo authentication
    try {
      const zaloJwtSecret = this.configService.get<string>('ZALO_JWT_SECRET');
      const zaloPayload = this.jwtService.verify(token, { secret: zaloJwtSecret });

      if (zaloPayload) {
        console.log(zaloPayload, "zaloPayload")
        const zaloId = zaloPayload.sub || zaloPayload.userId || zaloPayload.zaloId;
        this.logger.debug(`Zalo token verified for zaloId: ${zaloId}`);

        // Lookup system user from Zalo ID
        try {
          const systemUser = await this.authService.getSystemUserFromZaloId(zaloId);
          if (systemUser) {
            // Set full system user information for proper data filtering
            request.user = {
              id: systemUser.id, // Use system user ID for data filtering
              userType: 'ZALO',
              authSource: 'zalo',
              zaloUserId: zaloId,
              zaloId: zaloId,
              identity: systemUser.identity,
              fullName: systemUser.fullName,
              organizationId: systemUser.organizationId,
              cumKhuCnId: systemUser.cumKhuCnId,
              xaPhuongId: systemUser.xaPhuongId,
              roleId: systemUser.roleId,
              ...zaloPayload
            };
            this.logger.debug(`Mapped Zalo user ${zaloId} to system user ${systemUser.id}`);
            return true;
          } else {
            this.logger.warn(`No system user found for zaloId: ${zaloId}`);
            throw new UnauthorizedException('Zalo account not linked to system user');
          }
        } catch (lookupError) {
          this.logger.error(`Failed to lookup system user for zaloId ${zaloId}:`, lookupError);
          throw new UnauthorizedException('Failed to verify user permissions');
        }
      }
    } catch (error) {
      this.logger.debug('Zalo authentication also failed', error);
    }

    throw new UnauthorizedException('Invalid authentication token');
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
