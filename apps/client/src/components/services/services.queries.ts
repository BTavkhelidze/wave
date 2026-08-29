import { useQuery } from '@tanstack/react-query';

import { fetchPublicServices } from './services.api';

export const publicServicesQueryKey = (locale: string) =>
  ['services', 'public', locale] as const;

export function usePublicServicesQuery(locale: string) {
  return useQuery({
    queryKey: publicServicesQueryKey(locale),
    queryFn: ({ signal }) => fetchPublicServices(signal),
    staleTime: 5 * 60 * 1000,
  });
}
