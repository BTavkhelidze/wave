import {
  ALL_ADMIN_ROLES,
  CONTENT_MANAGER_ROLES,
  SUPER_ADMIN_ONLY,
  type RoleAccessRule,
} from '../../../features/auth/lib/authorization';
import { ADMIN_ROUTE_PATHS } from './routes.constants';

export const ADMIN_ROUTE_ACCESS: Record<
  Exclude<
    (typeof ADMIN_ROUTE_PATHS)[keyof typeof ADMIN_ROUTE_PATHS],
    typeof ADMIN_ROUTE_PATHS.changeInitialPassword
  >,
  RoleAccessRule
> = {
  [ADMIN_ROUTE_PATHS.dashboard]: ALL_ADMIN_ROLES,
  [ADMIN_ROUTE_PATHS.analytics]: CONTENT_MANAGER_ROLES,
  [ADMIN_ROUTE_PATHS.users]: CONTENT_MANAGER_ROLES,
  [ADMIN_ROUTE_PATHS.createUser]: SUPER_ADMIN_ONLY,
  [ADMIN_ROUTE_PATHS.adminLogs]: SUPER_ADMIN_ONLY,
  [ADMIN_ROUTE_PATHS.services]: ALL_ADMIN_ROLES,
  [ADMIN_ROUTE_PATHS.blogs]: CONTENT_MANAGER_ROLES,
};
