import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Keep old ROLES_KEY for backward compatibility
import { ROLES_KEY } from '../decorators/role.decorator';
import { UnifiedUser } from './unified-auth.guard';

// New permissions key for unified system
export const PERMISSIONS_KEY = 'permissions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    // Try new permissions system first
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredPermissions) {
      return this.checkPermissions(context, requiredPermissions);
    }

    // Fallback to old roles system for backward compatibility
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (requiredRoles.some((role) => user.role?.id === role)) {
      return true;
    }

    throw new ForbiddenException('Insufficient role permissions');
  }

  private checkPermissions(context: ExecutionContext, requiredPermissions: string[]): boolean {
    const { user }: { user: UnifiedUser } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasPermission = requiredPermissions.some(permission =>
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.join(', ')}, ` +
        `Available: ${user.permissions.join(', ')}`
      );
    }

    return true;
  }
}
