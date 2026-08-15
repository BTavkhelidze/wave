import { apiRequest } from '../../../src/shared/api/httpClient';
import type {
  CreateServicePayload,
  CreateServiceResponse,
  CreateServiceTranslationPayload,
  ReorderServicesPayload,
  ReorderServicesResponse,
  ServicesAnalyticsResponse,
  ServiceListItemData,
  ServiceListQueryParams,
  ServiceTranslationMutationResponse,
  UpdateServiceTranslationPayload,
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

export function fetchServicesAnalytics(
  signal?: AbortSignal,
): Promise<ServicesAnalyticsResponse> {
  return apiRequest<ServicesAnalyticsResponse>('/services/analytics', {
    signal,
  });
}

export function createService(
  payload: CreateServicePayload,
): Promise<CreateServiceResponse> {
  return apiRequest<CreateServiceResponse>('/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export function createServiceTranslation(
  serviceId: string,
  payload: CreateServiceTranslationPayload,
): Promise<ServiceListItemData> {
  return apiRequest<ServiceListItemData>(
    `/services/${encodeURIComponent(serviceId)}/translations`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}

export function updateServiceTranslation(
  translationId: string,
  payload: UpdateServiceTranslationPayload,
): Promise<ServiceTranslationMutationResponse> {
  return apiRequest<ServiceTranslationMutationResponse>(
    `/services/${encodeURIComponent(translationId)}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}

export function deleteService(
  serviceId: string,
): Promise<{ service: CreateServiceResponse; message: string }> {
  return apiRequest<{
    service: CreateServiceResponse;
    message: string;
  }>(
    `/services/${encodeURIComponent(serviceId)}`,
    {
      method: 'DELETE',
    },
  );
}

export function reorderServices(
  payload: ReorderServicesPayload,
): Promise<ReorderServicesResponse> {
  return apiRequest<ReorderServicesResponse>('/services/reorder', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
