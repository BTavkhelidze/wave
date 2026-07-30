import type { AdminAction, AdminEntity } from './adminLogs.types';

export const ADMIN_LOG_ACTIONS: readonly AdminAction[] = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'PASSWORD_CHANGE',
  'LOGIN',
  'LOGOUT',
  'PUBLISH',
  'UNPUBLISH',
  'ARCHIVE',
];

export const ADMIN_LOG_ENTITIES: readonly AdminEntity[] = [
  'USER',
  'SERVICE',
  'BLOG',
  'CONTACT_MESSAGE',
];

export const DEFAULT_ADMIN_LOGS_PAGE = 1;
export const DEFAULT_ADMIN_LOGS_LIMIT = 10;
export const DEFAULT_ADMIN_LOGS_SORT_ORDER = 'desc';

export function getAdminLogActionLabel(action: AdminAction): string {
  return action
    .split('_')
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(' ');
}

export function getAdminLogEntityLabel(entity: AdminEntity): string {
  return entity
    .split('_')
    .map((part) => part[0] + part.slice(1).toLowerCase())
    .join(' ');
}
