import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

// Available permissions in the system
export enum Permission {
  // Basic permissions
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',

  // Self-related permissions
  UPDATE_OWN = 'UPDATE_OWN',
  VIEW_OWN = 'VIEW_OWN',

  // Advanced permissions
  EXPORT = 'EXPORT',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ORGANIZATIONS = 'MANAGE_ORGANIZATIONS',
  APPROVE_REPORTS = 'APPROVE_REPORTS',
  MANAGE_EVENTS = 'MANAGE_EVENTS',
  SEND_NOTIFICATIONS = 'SEND_NOTIFICATIONS',
  VIEW_NOTIFICATIONS = 'VIEW_NOTIFICATIONS',
  CREATE_REPORTS = 'CREATE_REPORTS'
}

// Helper decorators for common permission patterns
export const CanRead = () => RequirePermissions(Permission.READ);
export const CanCreate = () => RequirePermissions(Permission.CREATE);
export const CanUpdate = () => RequirePermissions(Permission.UPDATE);
export const CanDelete = () => RequirePermissions(Permission.DELETE);
export const CanManage = () => RequirePermissions(Permission.CREATE, Permission.UPDATE, Permission.DELETE);
export const AdminOnly = () => RequirePermissions(Permission.MANAGE_USERS, Permission.MANAGE_ORGANIZATIONS);
