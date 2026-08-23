export const ADMIN_ROUTE_PATHS = {
  login: '/login',
  dashboard: '/dashboard',
  analytics: '/analytics',
  users: '/users',
  createUser: '/users/create',
  adminLogs: '/admin-logs',
  messages: '/messages',
  emails: '/emails',
  composeEmail: '/emails/compose',
  emailDetail: '/emails/:emailId',
  services: '/services',
  createService: '/services/create',
  serviceDetail: '/services/:serviceId',
  serviceTranslationDetail: '/services/:serviceId/:language',
  blogs: '/blogs',
  createBlog: '/blogs/create',
  blogDetail: '/blogs/:blogId',
  changeInitialPassword: '/change-initial-password',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
} as const;

export const ADMIN_DEFAULT_ROUTE = ADMIN_ROUTE_PATHS.dashboard;

export const PUBLIC_ROUTE_PATHS = {
  blogs: '/public/blogs',
  blogDetail: '/public/blogs/:slug',
} as const;
