import { apiRequest } from '../../../src/shared/api/httpClient';
import type {
  AdminLogsQueryParams,
  AdminLogsResponse,
} from '../model/adminLogs.types';

export function fetchAdminLogs(
  params: AdminLogsQueryParams,
): Promise<AdminLogsResponse> {
  const searchParams = new URLSearchParams();

  appendParam(searchParams, 'page', params.page);
  appendParam(searchParams, 'limit', params.limit);
  appendParam(searchParams, 'userId', params.userId);
  appendParam(searchParams, 'action', params.action);
  appendParam(searchParams, 'entity', params.entity);
  appendParam(searchParams, 'dateFrom', params.dateFrom);
  appendParam(searchParams, 'dateTo', params.dateTo);
  appendParam(searchParams, 'search', params.search);

  appendParam(searchParams, 'sortOrder', params.sortOrder);

  const queryString = searchParams.toString();

  return apiRequest<AdminLogsResponse>(
    `/admin-logs${queryString ? `?${queryString}` : ''}`,
  );
}

function appendParam(
  searchParams: URLSearchParams,
  key: string,
  value: string | number | undefined,
) {
  if (value !== undefined && value !== '') {
    searchParams.set(key, String(value));
  }
}
