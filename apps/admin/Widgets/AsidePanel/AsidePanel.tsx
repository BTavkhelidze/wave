import React from 'react';
import { NavLink } from 'react-router-dom';

type NavItem = {
  label: string;
  path: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navigationGroups: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/' },
      { label: 'Analytics', path: '/analytics' },
      { label: 'Activity', path: '/activity' },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Services', path: '/services' },
      { label: 'Blogs', path: '/blogs' },
      { label: 'Media Library', path: '/media' },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Users', path: '/users' },
      { label: 'Admins', path: '/admins' },
      { label: 'Roles', path: '/roles' },
    ],
  },
  {
    title: 'Platform',
    items: [
      { label: 'Settings', path: '/settings' },
      { label: 'Integrations', path: '/integrations' },
      { label: 'Audit Log', path: '/audit' },
    ],
  },
];

function AsidePanel() {
  return (
    <aside className=' w-72  border-r border-[#E5E7EB] bg-slate-200 px-5 py-6 lg:flex lg:flex-col'>
      <div className='flex items-center gap-3 px-2'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED] text-sm font-semibold text-white'>
          W
        </div>
        <div>
          <p className='text-sm font-semibold text-[#111827]'>Wave Admin</p>
          <p className='text-xs text-[#6B7280]'>Operations console</p>
        </div>
      </div>

      <div className='mt-8 space-y-7 overflow-y-auto'>
        {navigationGroups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className='mb-2 px-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
              {group.title}
            </p>
            <div className='space-y-1'>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    [
                      'flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-[#F3EEFF] text-[#7C3AED]'
                        : 'text-[#6B7280] hover:bg-[#F8FAFC] hover:text-[#111827]',
                    ].join(' ')
                  }
                >
                  <span>{item.label}</span>
                  <span className='text-xs opacity-60'>/</span>
                </NavLink>
              ))}
            </div>
          </nav>
        ))}
        <button className=' w-full '>Log Out</button>
      </div>

      <div className='mt-auto rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4'>
        <p className='text-sm font-medium text-[#111827]'>Workspace health</p>
        <p className='mt-1 text-sm text-[#6B7280]'>
          All systems operational. 2 items need admin review.
        </p>
      </div>
    </aside>
  );
}

export default AsidePanel;
