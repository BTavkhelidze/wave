import { useQuery } from '@tanstack/react-query';
import { fetchAdminLogs } from './adminLogs.api';
import type { AdminLogsQueryParams } from '../model/adminLogs.types';

export const adminLogsRootQueryKey = ['admin-logs'] as const;

export const adminLogsQueryKey = (params: AdminLogsQueryParams) =>
  [...adminLogsRootQueryKey, params] as const;

export function useAdminLogsQuery(params: AdminLogsQueryParams) {
  return useQuery({
    queryKey: adminLogsQueryKey(params),
    queryFn: ({ signal }) => fetchAdminLogs(params, signal),
    placeholderData: (previousData) => previousData,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
