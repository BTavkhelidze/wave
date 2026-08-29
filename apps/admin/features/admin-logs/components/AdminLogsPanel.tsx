import { useSearchParams } from 'react-router-dom';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { useAdminLogsQuery } from '../api/adminLogs.queries';
import {
  getAdminLogsParamsFromSearch,
  setAdminLogsSearchParam,
} from '../model/adminLogsSearchParams';
import type { AdminLogsQueryParams } from '../model/adminLogs.types';
import { AdminLogsFilters } from './AdminLogsFilters';
import { AdminLogsPagination } from './AdminLogsPagination';
import { AdminLogsTable } from './AdminLogsTable';

export function AdminLogsPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = getAdminLogsParamsFromSearch(searchParams);
  const adminLogsQuery = useAdminLogsQuery(params);

  const handleFilterChange = (
    key: keyof AdminLogsQueryParams,
    value: string | number | undefined,
  ) => {
    setSearchParams(setAdminLogsSearchParam(searchParams, key, value));
  };

  const handlePageChange = (page: number) => {
    setSearchParams(setAdminLogsSearchParam(searchParams, 'page', page, false));
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  if (
    adminLogsQuery.isError &&
    isApiRequestError(adminLogsQuery.error) &&
    adminLogsQuery.error.status === 403
  ) {
    return (
      <StateCard
        tone='warning'
        title='Access denied'
        message='Only super admins can view audit logs.'
      />
    );
  }

  if (adminLogsQuery.isLoading) {
    return (
      <div className='space-y-4'>
        <AdminLogsFilters
          params={params}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        <StateCard
          tone='neutral'
          title='Loading admin logs'
          message='Fetching the latest audit activity.'
        />
      </div>
    );
  }

  if (adminLogsQuery.isError) {
    return (
      <div className='space-y-4'>
        <AdminLogsFilters
          params={params}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
        <StateCard
          tone='error'
          title='Could not load admin logs'
          message='The audit log request failed.'
          actionLabel='Try again'
          onAction={() => void adminLogsQuery.refetch()}
        />
      </div>
    );
  }

  const response = adminLogsQuery.data;
  const logs = response?.data ?? [];

  return (
    <div className='space-y-4'>
      <AdminLogsFilters
        params={params}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {logs.length > 0 && response ? (
        <>
          <AdminLogsTable logs={logs} />
          <AdminLogsPagination
            pagination={response.pagination}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <StateCard
          tone='neutral'
          title='No admin logs found'
          message='No audit activity matches the current filters.'
        />
      )}
    </div>
  );
}

type StateCardProps = {
  title: string;
  message: string;
  tone: 'error' | 'neutral' | 'warning';
  actionLabel?: string;
  onAction?: () => void;
};

function StateCard({
  title,
  message,
  tone,
  actionLabel,
  onAction,
}: StateCardProps) {
  const classNameByTone: Record<StateCardProps['tone'], string> = {
    error: 'border-[#FCA5A5]',
    neutral: 'border-[#E5E7EB]',
    warning: 'border-[#FBBF24]',
  };

  const titleClassNameByTone: Record<StateCardProps['tone'], string> = {
    error: 'text-[#B91C1C]',
    neutral: 'text-[#111827]',
    warning: 'text-[#92400E]',
  };

  return (
    <div
      className={`rounded-lg border bg-white p-5 shadow-sm ${classNameByTone[tone]}`}
    >
      <p className={`text-sm font-semibold ${titleClassNameByTone[tone]}`}>
        {title}
      </p>
      <p className='mt-1 text-sm leading-6 text-[#6B7280]'>{message}</p>
      {actionLabel && onAction && (
        <button
          type='button'
          onClick={onAction}
          className='mt-3 rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
