import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: number[]): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);
