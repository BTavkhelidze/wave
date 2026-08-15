import { Link } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../src/app/router/routes.constants';
import { useUnreadContactMessagesCountQuery } from '../messages/api/messages.queries';
import { useServicesAnalyticsQuery } from '../services/api/services.queries';

type Metric = {
  label: string;
  value: string;
  detail: string;
  tone: 'service' | 'blog' | 'neutral' | 'error';
};

const numberFormatter = new Intl.NumberFormat('en-US');

function DashboardPage() {
  const overviewQuery = useServicesAnalyticsQuery();
  const unreadMessagesQuery = useUnreadContactMessagesCountQuery();
  const metrics = getOverviewMetrics({
    totalServices: overviewQuery.data?.services.total ?? 0,
    totalServiceViews: overviewQuery.data?.services.totalViews ?? 0,
    totalBlogs: overviewQuery.data?.blogs.total ?? 0,
    totalBlogViews: overviewQuery.data?.blogs.totalViews ?? 0,
    isLoading: overviewQuery.isLoading,
    isError: overviewQuery.isError,
  });

  return (
    <div className='space-y-8'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Overview
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Monitor service and blog totals from the database.
        </p>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <UnreadMessagesNotification
        count={unreadMessagesQuery.data?.count ?? 0}
        isLoading={unreadMessagesQuery.isLoading}
        isError={unreadMessagesQuery.isError}
      />
    </div>
  );
}

type UnreadMessagesNotificationProps = {
  count: number;
  isLoading: boolean;
  isError: boolean;
};

function UnreadMessagesNotification({
  count,
  isLoading,
  isError,
}: UnreadMessagesNotificationProps) {
  if (isLoading) {
    return (
      <section className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
        <div className='h-5 w-56 animate-pulse rounded bg-[#E5E7EB]' />
        <div className='mt-3 h-4 w-72 animate-pulse rounded bg-[#F3F4F6]' />
      </section>
    );
  }

  if (isError) {
    return (
      <section className='rounded-lg border border-[#FCA5A5] bg-white p-5 shadow-sm'>
        <p className='text-sm font-semibold text-[#B91C1C]'>
          Could not load unread messages
        </p>
        <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
          The rest of the overview is still available.
        </p>
      </section>
    );
  }

  if (count <= 0) {
    return null;
  }

  return (
    <section className='rounded-lg border border-[#DDD6FE] bg-white p-5 shadow-sm'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <p className='text-sm font-semibold text-[#111827]'>
            You have {count} unread message{count === 1 ? '' : 's'}.
          </p>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            Public contact form submissions are waiting for review.
          </p>
        </div>
        <Link
          to={ADMIN_ROUTE_PATHS.messages}
          className='rounded-md bg-[#7C3AED] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          View messages
        </Link>
      </div>
    </section>
  );
}

type OverviewMetricsInput = {
  totalServices: number;
  totalServiceViews: number;
  totalBlogs: number;
  totalBlogViews: number;
  isLoading: boolean;
  isError: boolean;
};

function getOverviewMetrics({
  totalServices,
  totalServiceViews,
  totalBlogs,
  totalBlogViews,
  isLoading,
  isError,
}: OverviewMetricsInput): Metric[] {
  if (isLoading) {
    return [
      buildMetric('Total Services', 'Loading...', 'Fetching service count.', 'neutral'),
      buildMetric(
        'Total Service Views',
        'Loading...',
        'Fetching service view totals.',
        'neutral',
      ),
      buildMetric('Total Blogs', 'Loading...', 'Fetching blog count.', 'neutral'),
      buildMetric(
        'Total Blog Views',
        'Loading...',
        'Fetching blog view totals.',
        'neutral',
      ),
    ];
  }

  if (isError) {
    return [
      buildMetric('Total Services', '0', 'Could not load overview statistics.', 'error'),
      buildMetric(
        'Total Service Views',
        '0',
        'Could not load overview statistics.',
        'error',
      ),
      buildMetric('Total Blogs', '0', 'Could not load overview statistics.', 'error'),
      buildMetric(
        'Total Blog Views',
        '0',
        'Could not load overview statistics.',
        'error',
      ),
    ];
  }

  return [
    buildMetric(
      'Total Services',
      numberFormatter.format(totalServices),
      'Services in the catalog.',
      'service',
    ),
    buildMetric(
      'Total Service Views',
      numberFormatter.format(totalServiceViews),
      'Sum of stored service views.',
      'service',
    ),
    buildMetric(
      'Total Blogs',
      numberFormatter.format(totalBlogs),
      'Blogs in the admin catalog.',
      'blog',
    ),
    buildMetric(
      'Total Blog Views',
      numberFormatter.format(totalBlogViews),
      'Sum of stored blog views.',
      'blog',
    ),
  ];
}

function buildMetric(
  label: string,
  value: string,
  detail: string,
  tone: Metric['tone'],
): Metric {
  return {
    label,
    value,
    detail,
    tone,
  };
}

function MetricCard({ metric }: { metric: Metric }) {
  const accentClassName =
    metric.tone === 'error'
      ? 'bg-[#FEF2F2] text-[#B91C1C]'
      : metric.tone === 'blog'
        ? 'bg-[#ECFDF5] text-[#047857]'
        : metric.tone === 'service'
          ? 'bg-[#F3EEFF] text-[#7C3AED]'
          : 'bg-[#F8FAFC] text-[#6B7280]';

  return (
    <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-medium text-[#6B7280]'>{metric.label}</p>
          <p className='mt-2 text-2xl font-semibold text-[#111827]'>
            {metric.value}
          </p>
        </div>
        <span className={`rounded-md px-2 py-1 text-xs font-semibold ${accentClassName}`}>
          Live
        </span>
      </div>
      <p className='mt-2 text-sm text-[#6B7280]'>{metric.detail}</p>
    </div>
  );
}

export default DashboardPage;
