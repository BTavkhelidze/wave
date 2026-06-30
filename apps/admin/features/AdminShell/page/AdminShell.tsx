import { NavLink, Outlet } from 'react-router-dom';
import AsidePanel from '../../../Widgets/AsidePanel/AsidePanel';

type NavItem = {
  label: string;
  path: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type SectionPageConfig = {
  title: string;
  description: string;
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  actions: string[];
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

export default function AdminShell() {
  return (
    <div className='min-h-screen bg-[#F8FAFC] text-[#111827]'>
      <div className='mx-auto flex min-h-screen max-w-[1440px]'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <main className='flex-1 px-4 py-6 lg:px-8'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
