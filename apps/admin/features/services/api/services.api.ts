import { apiRequest } from '../../../src/shared/api/httpClient';
import type {
  ServiceListItemData,
  ServiceListQueryParams,
} from '../model/service.types';

export function fetchServices(
  params: ServiceListQueryParams,
  signal?: AbortSignal,
): Promise<ServiceListItemData[]> {
  const searchParams = new URLSearchParams();

  if (params.language) {
    searchParams.set('language', params.language);
  }

  const queryString = searchParams.toString();

  return apiRequest<ServiceListItemData[]>(
    `/services${queryString ? `?${queryString}` : ''}`,
    { signal },
  );
}
