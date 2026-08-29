import type { UserRole } from '../model/user.types';

export type RoleAccessRule = readonly [UserRole, ...UserRole[]];

export function canAccessRole(
  role: UserRole | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  return Boolean(role && allowedRoles.includes(role));
}

export const ALL_ADMIN_ROLES: RoleAccessRule = [
  'SUPER_ADMIN',
  'ADMIN',
  'EMPLOYEE',
];

export const CONTENT_MANAGER_ROLES: RoleAccessRule = [
  'SUPER_ADMIN',
  'ADMIN',
];

export const SUPER_ADMIN_ONLY: RoleAccessRule = ['SUPER_ADMIN'];
