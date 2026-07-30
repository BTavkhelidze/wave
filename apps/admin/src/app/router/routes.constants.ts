export const ADMIN_ROUTE_PATHS = {
  dashboard: '/dashboard',
  analytics: '/analytics',
  users: '/users',
  createUser: '/users/create',
  adminLogs: '/admin-logs',
  services: '/services',
  blogs: '/blogs',
  changeInitialPassword: '/change-initial-password',
} as const;

export const ADMIN_DEFAULT_ROUTE = ADMIN_ROUTE_PATHS.dashboard;
