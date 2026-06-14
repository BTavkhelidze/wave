import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';

// import LoginPage from '../features/auth/Login';
import DashboardPage from '../features/dashboard/Dashboard';
import AdminShell from '../features/AdminShell/page/AdminShell';
import AsidePanel from '../Widgets/AsidePanel/AsidePanel';

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

const sectionPages: Record<string, SectionPageConfig> = {
  services: {
    title: 'Services',
    description:
      'Manage service catalog entries, categories, pricing, availability, featured ordering, and publishing state.',
    metrics: [
      { label: 'Published', value: '24', detail: 'Live services' },
      { label: 'Drafts', value: '8', detail: 'Awaiting review' },
      { label: 'Featured', value: '6', detail: 'Homepage placements' },
      { label: 'Needs SEO', value: '3', detail: 'Missing metadata' },
    ],
    actions: [
      'Create service',
      'Review drafts',
      'Update featured order',
      'Audit pricing',
    ],
  },
  blogs: {
    title: 'Blogs',
    description:
      'Plan, write, schedule, and optimize editorial content with a clean workflow for drafts and published posts.',
    metrics: [
      { label: 'Published', value: '42', detail: 'Live articles' },
      { label: 'Drafts', value: '11', detail: 'In progress' },
      { label: 'Scheduled', value: '5', detail: 'Queued posts' },
      { label: 'Avg. SEO score', value: '87', detail: 'Healthy content' },
    ],
    actions: [
      'Create post',
      'Review scheduled posts',
      'Check SEO issues',
      'Open calendar',
    ],
  },
  users: {
    title: 'Users',
    description:
      'Review customer accounts, lifecycle states, support flags, session activity, and operational notes.',
    metrics: [
      { label: 'Active users', value: '1,284', detail: 'Last 30 days' },
      { label: 'New signups', value: '148', detail: 'This week' },
      { label: 'Flagged', value: '7', detail: 'Needs review' },
      { label: 'Retention', value: '92%', detail: 'Monthly cohort' },
    ],
    actions: [
      'Export users',
      'Review flagged accounts',
      'Segment customers',
      'Open sessions',
    ],
  },
  admins: {
    title: 'Admins',
    description:
      'Manage internal operators, invitations, access levels, MFA coverage, and permission changes.',
    metrics: [
      { label: 'Active admins', value: '12', detail: 'Current team' },
      { label: 'Pending invites', value: '3', detail: 'Awaiting signup' },
      { label: 'MFA enabled', value: '100%', detail: 'Policy met' },
      { label: 'Critical roles', value: '4', detail: 'Protected access' },
    ],
    actions: [
      'Invite admin',
      'Review roles',
      'Audit sessions',
      'Update permissions',
    ],
  },
  settings: {
    title: 'Settings',
    description:
      'Configure branding, notifications, integrations, security controls, localization, and platform defaults.',
    metrics: [
      { label: 'Integrations', value: '9', detail: 'Connected tools' },
      { label: 'Alerts', value: '6', detail: 'Active rules' },
      { label: 'Backups', value: 'Daily', detail: 'Recovery policy' },
      { label: 'Locale', value: 'EN', detail: 'Primary language' },
    ],
    actions: [
      'Edit branding',
      'Configure alerts',
      'Manage API keys',
      'Review backups',
    ],
  },
  analytics: {
    title: 'Analytics',
    description:
      'Track acquisition, conversions, popular services, blog performance, and operational trends.',
    metrics: [
      { label: 'Sessions', value: '18.2k', detail: 'Last 30 days' },
      { label: 'Conversion', value: '4.8%', detail: 'Goal completion' },
      { label: 'Service leads', value: '76', detail: 'This month' },
      { label: 'Blog clicks', value: '2.1k', detail: 'Top content' },
    ],
    actions: [
      'View traffic',
      'Review funnel',
      'Compare campaigns',
      'Export report',
    ],
  },
  activity: {
    title: 'Activity',
    description:
      'Monitor publishing, moderation, user, admin, and system events in a transparent operational timeline.',
    metrics: [
      { label: 'Events today', value: '14', detail: 'Tracked actions' },
      { label: 'Approvals', value: '5', detail: 'Pending review' },
      { label: 'Content updates', value: '9', detail: 'Recent edits' },
      { label: 'Alerts', value: '2', detail: 'Open items' },
    ],
    actions: ['Review queue', 'Audit changes', 'Export log', 'Resolve alerts'],
  },
  media: {
    title: 'Media Library',
    description:
      'Organize images, files, brand assets, reusable collections, and optimization workflows.',
    metrics: [
      { label: 'Assets', value: '1,042', detail: 'Total files' },
      { label: 'Unused', value: '138', detail: 'Cleanup candidates' },
      { label: 'Uploads', value: '26', detail: 'Today' },
      { label: 'Optimized', value: '94%', detail: 'Ready assets' },
    ],
    actions: [
      'Upload media',
      'Review unused assets',
      'Create collection',
      'Optimize images',
    ],
  },
  roles: {
    title: 'Roles',
    description:
      'Define permission templates and approval rules for editors, moderators, admins, and system operators.',
    metrics: [
      { label: 'Templates', value: '7', detail: 'Reusable roles' },
      { label: 'Permissions', value: '24', detail: 'Scoped rules' },
      { label: 'Protected actions', value: '9', detail: 'Need approval' },
      { label: 'Overrides', value: '2', detail: 'Manual exceptions' },
    ],
    actions: [
      'Create role',
      'Review scopes',
      'Audit overrides',
      'Duplicate role',
    ],
  },
  integrations: {
    title: 'Integrations',
    description:
      'Connect external services, inspect sync jobs, monitor webhooks, and manage automation settings.',
    metrics: [
      { label: 'Connected apps', value: '9', detail: 'Active providers' },
      { label: 'Webhooks', value: '16', detail: 'Enabled events' },
      { label: 'Failed jobs', value: '1', detail: 'Needs inspection' },
      { label: 'Last sync', value: '3m', detail: 'Recent update' },
    ],
    actions: [
      'Add integration',
      'Inspect failures',
      'Review webhooks',
      'Reconnect provider',
    ],
  },
  audit: {
    title: 'Audit Log',
    description:
      'Review sensitive changes, login events, permission updates, exports, and compliance history.',
    metrics: [
      { label: 'Events', value: '5.8k', detail: 'Stored records' },
      { label: 'Sensitive', value: '41', detail: 'High-impact changes' },
      { label: 'Exports', value: '12', detail: 'This month' },
      { label: 'Retention', value: '365d', detail: 'Policy window' },
    ],
    actions: [
      'Filter events',
      'Export history',
      'Review changes',
      'Inspect logins',
    ],
  },
};

function App() {
  return (
    <div className='flex '>
      <AsidePanel />
      <div className='flex-1 '>
        <Routes>
          <Route element={<AdminShell />}>
            <Route index element={<DashboardPage />} />
            <Route
              path='services'
              element={<SectionPage config={sectionPages.services} />}
            />
            <Route
              path='blogs'
              element={<SectionPage config={sectionPages.blogs} />}
            />
            <Route
              path='users'
              element={<SectionPage config={sectionPages.users} />}
            />
            <Route
              path='admins'
              element={<SectionPage config={sectionPages.admins} />}
            />
            <Route
              path='settings'
              element={<SectionPage config={sectionPages.settings} />}
            />
            <Route
              path='analytics'
              element={<SectionPage config={sectionPages.analytics} />}
            />
            <Route
              path='activity'
              element={<SectionPage config={sectionPages.activity} />}
            />
            <Route
              path='media'
              element={<SectionPage config={sectionPages.media} />}
            />
            <Route
              path='roles'
              element={<SectionPage config={sectionPages.roles} />}
            />
            <Route
              path='integrations'
              element={<SectionPage config={sectionPages.integrations} />}
            />
            <Route
              path='audit'
              element={<SectionPage config={sectionPages.audit} />}
            />
            <Route path='*' element={<Navigate to='/' replace />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}

function SectionPage({ config }: { config: SectionPageConfig }) {
  return (
    <section className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
            {config.title}
          </h2>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-[#6B7280]'>
            {config.description}
          </p>
        </div>
        <button className='rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6D28D9]'>
          Create {config.title.slice(0, -1)}
        </button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {config.metrics.map((metric) => (
          <div
            key={metric.label}
            className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'
          >
            <p className='text-sm font-medium text-[#6B7280]'>{metric.label}</p>
            <p className='mt-2 text-2xl font-semibold text-[#111827]'>
              {metric.value}
            </p>
            <p className='mt-1 text-sm text-[#6B7280]'>{metric.detail}</p>
          </div>
        ))}
      </div>

      <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
        <h3 className='text-base font-semibold text-[#111827]'>
          Quick actions
        </h3>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {config.actions.map((action) => (
            <button
              key={action}
              className='rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-left text-sm font-medium text-[#111827] transition hover:border-[#7C3AED] hover:text-[#7C3AED]'
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default App;
