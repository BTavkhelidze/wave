import { NavLink } from 'react-router-dom';

import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { canAccessRole } from '../../../features/auth/lib/authorization';
import { useAuth } from '../../../features/context/AuthContext';
import { useUnreadContactMessagesCountQuery } from '../../../features/messages/api/messages.queries';
import { SIDEBAR_NAVIGATION_GROUPS } from '../model/sidebar.constants';
import { SidebarIcon } from './SidebarIcon';

export function SidebarNavigation() {
  const { user } = useAuth();
  const unreadCountQuery = useUnreadContactMessagesCountQuery();
  const unreadCount = unreadCountQuery.data?.count ?? 0;
  const visibleGroups = SIDEBAR_NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      canAccessRole(user?.role, item.allowedRoles),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-7">
      {visibleGroups.map((group) => (
        <nav key={group.title} aria-label={group.title}>
          <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
            {group.title}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path !== ADMIN_ROUTE_PATHS.services &&
                  item.path !== ADMIN_ROUTE_PATHS.emails
                }
                className={({ isActive }) =>
                  [
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-[#F3EEFF] text-[#7C3AED]'
                      : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]',
                  ].join(' ')
                }
              >
                <span className="flex min-w-0 items-center gap-3">
                  <SidebarIcon name={item.icon} className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.badge === 'unreadMessages' && unreadCount > 0 ? (
                  <span
                    className="ml-2 rounded-full bg-[#7C3AED] px-2 py-0.5 text-xs font-semibold text-white"
                    aria-label={`${unreadCount} unread messages`}
                  >
                    {unreadCount}
                  </span>
                ) : (
                  <span className="text-xs opacity-60">/</span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      ))}
    </div>
  );
}
