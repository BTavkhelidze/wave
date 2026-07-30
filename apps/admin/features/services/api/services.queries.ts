import { useQuery } from '@tanstack/react-query';
import { fetchServices } from './services.api';
import type { ServiceListQueryParams } from '../model/service.types';

export const servicesQueryKey = (params: ServiceListQueryParams) =>
  ['services', params] as const;

export function useServicesQuery(params: ServiceListQueryParams) {
  return useQuery({
    queryKey: servicesQueryKey(params),
    queryFn: () => fetchServices(params),
    placeholderData: (previousData) => previousData,
  });
}
