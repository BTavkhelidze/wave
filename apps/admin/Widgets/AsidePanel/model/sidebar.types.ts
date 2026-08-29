export type SidebarIconName =
  | 'analytics'
  | 'blogs'
  | 'dashboard'
  | 'logs'
  | 'messages'
  | 'services'
  | 'userPlus'
  | 'users';

export type SidebarNavigationItem = {
  label: string;
  path: string;
  icon: SidebarIconName;
  badge?: 'unreadMessages';
  allowedRoles: readonly import('../../../features/auth/model/user.types').UserRole[];
};

export type SidebarNavigationGroup = {
  title: string;
  items: SidebarNavigationItem[];
};
