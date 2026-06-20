import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';

type Metric = {
  label: string;
  value: string;
  detail: string;
  change: string;
};

type BlogPost = {
  title: string;
  author: string;
  status: 'Published' | 'Draft' | 'Scheduled';
  date: string;
  views: string;
};

type ActionItem = {
  title: string;
  detail: string;
};

type DashboardSnapshot = {
  metrics: Metric[];
  blogs: BlogPost[];
  actions: ActionItem[];
};

function DashboardPage() {
  const { data, isLoading, isError } = useQuery<DashboardSnapshot>({
    queryKey: ['admin-dashboard-summary'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      return {
        metrics: [
          {
            label: 'Total revenue',
            value: '$128.4k',
            detail: 'Last 30 days',
            change: '+12.4%',
          },
          {
            label: 'Active users',
            value: '1,284',
            detail: 'Monthly active users',
            change: '+8.1%',
          },
          {
            label: 'Services',
            value: '24',
            detail: 'Published catalog items',
            change: '+3',
          },
          {
            label: 'Blog posts',
            value: '42',
            detail: 'Published articles',
            change: '+5',
          },
        ],
        blogs: [
          {
            title: 'How to prepare your service catalog for launch',
            author: 'Mariam G.',
            status: 'Published',
            date: 'Jun 14, 2026',
            views: '2,420',
          },
          {
            title: 'A practical guide to better customer onboarding',
            author: 'Nika A.',
            status: 'Scheduled',
            date: 'Jun 18, 2026',
            views: 'Preview',
          },
          {
            title: 'What to measure before updating your pricing page',
            author: 'Ana K.',
            status: 'Draft',
            date: 'No date',
            views: 'Draft',
          },
          {
            title: 'Reducing support load with clearer service pages',
            author: 'Mariam G.',
            status: 'Published',
            date: 'Jun 9, 2026',
            views: '1,806',
          },
        ],
        actions: [
          {
            title: 'Create service',
            detail:
              'Add pricing, images, category, SEO, and publishing status.',
          },
          {
            title: 'Write blog post',
            detail: 'Start a draft, assign author, and prepare metadata.',
          },
          {
            title: 'Invite admin',
            detail: 'Send an invite with role-based permissions.',
          },
          {
            title: 'Review analytics',
            detail: 'Open content and conversion performance reports.',
          },
        ],
      };
    },
  });

  const snapshot = data ?? {
    metrics: [],
    blogs: [],
    actions: [],
  };

  return (
    <div className='space-y-8'>
      <section className='flex flex-wrap items-start justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
            Overview
          </h2>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
            Monitor content, services, users, and performance from a focused
            admin workspace designed for fast daily operations.
          </p>
        </div>

        <div className='flex gap-3'>
          <button className='rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-medium text-[#111827] shadow-sm transition hover:bg-[#F8FAFC]'>
            Export report
          </button>
          <button className='rounded-lg bg-[#7C3AED] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6D28D9]'>
            Create content
          </button>
        </div>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {snapshot.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className='grid gap-6 xl:grid-cols-[1fr_360px]'>
        <Panel
          title='Recent blogs'
          action={
            <button className='text-sm font-medium text-[#7C3AED]'>
              View all
            </button>
          }
        >
          {isLoading ? (
            <PanelState message='Loading recent blogs...' />
          ) : isError ? (
            <PanelState message='Could not load recent blogs.' tone='error' />
          ) : (
            <RecentBlogsTable blogs={snapshot.blogs} />
          )}
        </Panel>

        <Panel title='Quick actions'>
          <div className='space-y-3'>
            {snapshot.actions.map((action) => (
              <ActionCard key={action.title} action={action} />
            ))}
          </div>
        </Panel>
      </section>

      <section className='grid gap-6 lg:grid-cols-3'>
        <InfoPanel
          title='Content workflow'
          metric='16 pending'
          detail='Services and blog posts waiting for review, SEO cleanup, or scheduled publishing.'
        />
        <InfoPanel
          title='User management'
          metric='7 alerts'
          detail='Flagged users, pending admin invites, and accounts needing lifecycle review.'
        />
        <InfoPanel
          title='System health'
          metric='99.98%'
          detail='Platform uptime with one integration job queued for retry.'
        />
      </section>
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[#6B7280]'>{metric.label}</p>
          <p className='mt-2 text-2xl font-semibold text-[#111827]'>
            {metric.value}
          </p>
        </div>
        <span className='rounded-md bg-[#F3EEFF] px-2 py-1 text-xs font-semibold text-[#7C3AED]'>
          {metric.change}
        </span>
      </div>
      <p className='mt-2 text-sm text-[#6B7280]'>{metric.detail}</p>
    </div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className='rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
      <div className='flex items-center justify-between border-b border-[#E5E7EB] px-5 py-4'>
        <h3 className='text-base font-semibold text-[#111827]'>{title}</h3>
        {action}
      </div>
      <div className='p-5'>{children}</div>
    </section>
  );
}

function RecentBlogsTable({ blogs }: { blogs: BlogPost[] }) {
  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full text-left text-sm'>
        <thead>
          <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
            <th className='pb-3 pr-4'>Title</th>
            <th className='pb-3 pr-4'>Author</th>
            <th className='pb-3 pr-4'>Status</th>
            <th className='pb-3 pr-4'>Date</th>
            <th className='pb-3 text-right'>Views</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-[#E5E7EB]'>
          {blogs.map((blog) => (
            <tr key={blog.title}>
              <td className='py-4 pr-4 font-medium text-[#111827]'>
                {blog.title}
              </td>
              <td className='py-4 pr-4 text-[#6B7280]'>{blog.author}</td>
              <td className='py-4 pr-4'>
                <StatusBadge status={blog.status} />
              </td>
              <td className='py-4 pr-4 text-[#6B7280]'>{blog.date}</td>
              <td className='py-4 text-right text-[#6B7280]'>{blog.views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: BlogPost['status'] }) {
  const className =
    status === 'Published'
      ? 'bg-[#ECFDF5] text-[#047857]'
      : status === 'Scheduled'
        ? 'bg-[#F3EEFF] text-[#7C3AED]'
        : 'bg-[#F8FAFC] text-[#6B7280]';

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {status}
    </span>
  );
}

function ActionCard({ action }: { action: ActionItem }) {
  return (
    <button className='w-full rounded-lg border border-[#E5E7EB] bg-white p-4 text-left transition hover:border-[#7C3AED] hover:shadow-sm'>
      <p className='text-sm font-semibold text-[#111827]'>{action.title}</p>
      <p className='mt-1 text-sm leading-6 text-[#6B7280]'>{action.detail}</p>
    </button>
  );
}

function InfoPanel({
  title,
  metric,
  detail,
}: {
  title: string;
  metric: string;
  detail: string;
}) {
  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <p className='text-sm font-medium text-[#6B7280]'>{title}</p>
      <p className='mt-2 text-xl font-semibold text-[#111827]'>{metric}</p>
      <p className='mt-2 text-sm leading-6 text-[#6B7280]'>{detail}</p>
    </div>
  );
}

function PanelState({
  message,
  tone = 'default',
}: {
  message: string;
  tone?: 'default' | 'error';
}) {
  return (
    <p
      className={
        tone === 'error' ? 'text-sm text-red-600' : 'text-sm text-[#6B7280]'
      }
    >
      {message}
    </p>
  );
}

export default DashboardPage;
