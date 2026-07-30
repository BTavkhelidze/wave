export type SidebarIconName =
  | 'analytics'
  | 'blogs'
  | 'dashboard'
  | 'logs'
  | 'services'
  | 'userPlus'
  | 'users';

export type SidebarNavigationItem = {
  label: string;
  path: string;
  icon: SidebarIconName;
  allowedRoles: readonly import('../../../features/auth/model/user.types').UserRole[];
};

export type SidebarNavigationGroup = {
  title: string;
  items: SidebarNavigationItem[];
};
