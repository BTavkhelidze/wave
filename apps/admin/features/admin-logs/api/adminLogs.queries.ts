import { useQuery } from '@tanstack/react-query';
import { fetchAdminLogs } from './adminLogs.api';
import type { AdminLogsQueryParams } from '../model/adminLogs.types';

export const adminLogsQueryKey = (params: AdminLogsQueryParams) =>
  ['admin-logs', params] as const;

export function useAdminLogsQuery(params: AdminLogsQueryParams) {
  return useQuery({
    queryKey: adminLogsQueryKey(params),
    queryFn: () => fetchAdminLogs(params),
    placeholderData: (previousData) => previousData,
  });
}
