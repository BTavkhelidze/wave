import {
  DEFAULT_SERVICE_LANGUAGE,
  SERVICE_LANGUAGES,
} from './service.constants';
import type { ServiceLanguage, ServiceListQueryParams } from './service.types';

function parseLanguage(value: string | null): ServiceLanguage {
  return SERVICE_LANGUAGES.includes(value as ServiceLanguage)
    ? (value as ServiceLanguage)
    : DEFAULT_SERVICE_LANGUAGE;
}

export function getServicesParamsFromSearch(
  searchParams: URLSearchParams,
): Required<ServiceListQueryParams> {
  return {
    language: parseLanguage(searchParams.get('language')),
  };
}

export function setServicesSearchParam(
  currentParams: URLSearchParams,
  key: keyof ServiceListQueryParams,
  value: string | undefined,
): URLSearchParams {
  const nextParams = new URLSearchParams(currentParams);
  const normalizedValue = value?.trim();

  if (normalizedValue) {
    nextParams.set(key, normalizedValue);
  } else {
    nextParams.delete(key);
  }

  return nextParams;
}
