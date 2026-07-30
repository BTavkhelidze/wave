import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { ADMIN_ROUTE_ACCESS } from '../../../src/app/router/routes.permissions';
import type { SidebarNavigationGroup } from './sidebar.types';

export const SIDEBAR_NAVIGATION_GROUPS: readonly SidebarNavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        path: ADMIN_ROUTE_PATHS.dashboard,
        icon: 'dashboard',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.dashboard],
      },
      {
        label: 'Analytics',
        path: ADMIN_ROUTE_PATHS.analytics,
        icon: 'analytics',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.analytics],
      },
    ],
  },
  {
    title: 'User Management',
    items: [
      {
        label: 'Users',
        path: ADMIN_ROUTE_PATHS.users,
        icon: 'users',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.users],
      },
      {
        label: 'Create User',
        path: ADMIN_ROUTE_PATHS.createUser,
        icon: 'userPlus',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.createUser],
      },
      {
        label: 'Admin Logs',
        path: ADMIN_ROUTE_PATHS.adminLogs,
        icon: 'logs',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.adminLogs],
      },
    ],
  },
  {
    title: 'Content Management',
    items: [
      {
        label: 'Services',
        path: ADMIN_ROUTE_PATHS.services,
        icon: 'services',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.services],
      },
      {
        label: 'Blogs',
        path: ADMIN_ROUTE_PATHS.blogs,
        icon: 'blogs',
        allowedRoles: ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.blogs],
      },
    ],
  },
];
