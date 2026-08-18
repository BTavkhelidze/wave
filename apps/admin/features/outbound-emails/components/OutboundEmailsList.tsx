import { useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ADMIN_ROUTE_PATHS } from '../../../src/app/router/routes.constants';
import { isApiRequestError } from '../../../src/shared/api/httpClient';
import { useOutboundEmailsQuery } from '../api/outboundEmails.queries';
import {
  getOutboundEmailsParamsFromSearch,
  setOutboundEmailsSearchParam,
} from '../model/outboundEmailsSearchParams';
import type { OutboundEmailsQueryParams } from '../model/outboundEmail.types';
import { OutboundEmailsFilters } from './OutboundEmailsFilters';
import { OutboundEmailsLoadingSkeleton } from './OutboundEmailsLoadingSkeleton';
import { OutboundEmailsPagination } from './OutboundEmailsPagination';
import { OutboundEmailsStateCard } from './OutboundEmailsStateCard';
import { OutboundEmailsTable } from './OutboundEmailsTable';

type LocationState = {
  successMessage?: string;
};

export function OutboundEmailsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;
  const [searchParams, setSearchParams] = useSearchParams();
  const params = useMemo(
    () => getOutboundEmailsParamsFromSearch(searchParams),
    [searchParams],
  );
  const emailsQuery = useOutboundEmailsQuery(params);

  const handleFilterChange = (
    key: keyof OutboundEmailsQueryParams,
    value: string | number | undefined,
  ) => {
    setSearchParams(
      setOutboundEmailsSearchParam(
        searchParams,
        key,
        value === undefined ? '' : String(value),
      ),
    );
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const filters = (
    <OutboundEmailsFilters
      params={params}
      totalEmails={emailsQuery.data?.meta.total}
      onFilterChange={handleFilterChange}
      onResetFilters={handleResetFilters}
    />
  );

  if (
    emailsQuery.isError &&
    isApiRequestError(emailsQuery.error) &&
    emailsQuery.error.status === 403
  ) {
    return (
      <OutboundEmailsStateCard
        tone="warning"
        title="Access denied"
        message="You do not have permission to view outbound emails."
      />
    );
  }

  if (emailsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {filters}
        <OutboundEmailsLoadingSkeleton />
      </div>
    );
  }

  if (emailsQuery.isError) {
    return (
      <div className="space-y-4">
        {filters}
        <OutboundEmailsStateCard
          tone="error"
          title="Could not load emails"
          message="The outbound email history request failed."
          actionLabel="Try again"
          onAction={() => void emailsQuery.refetch()}
        />
      </div>
    );
  }

  const emails = emailsQuery.data?.data ?? [];
  const meta = emailsQuery.data?.meta;
  const hasActiveFilters = Boolean(params.search || params.status);

  return (
    <div className="space-y-4">
      {locationState?.successMessage && (
        <OutboundEmailsStateCard
          tone="success"
          title="Email sent"
          message={locationState.successMessage}
        />
      )}

      {filters}

      {emails.length > 0 ? (
        <OutboundEmailsTable emails={emails} />
      ) : (
        <OutboundEmailsStateCard
          tone="neutral"
          title={hasActiveFilters ? 'No matching emails' : 'No emails yet'}
          message={
            hasActiveFilters
              ? 'Try another status or search term.'
              : 'Sent business emails will appear here.'
          }
          actionLabel={hasActiveFilters ? undefined : 'Compose Email'}
          onAction={
            hasActiveFilters
              ? undefined
              : () => {
                  navigate(ADMIN_ROUTE_PATHS.composeEmail);
                }
          }
        />
      )}

      {meta && (
        <OutboundEmailsPagination
          meta={meta}
          onPageChange={(page) => handleFilterChange('page', page)}
        />
      )}
    </div>
  );
}
