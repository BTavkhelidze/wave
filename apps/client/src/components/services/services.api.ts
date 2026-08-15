import type { IServices } from '@/Interface/Interface';
import {
  ApiRequestError,
  getApiBaseUrl,
  getResponseErrorMessage,
  isRecord,
  isStringArray,
  readOptionalString,
  readRequiredString,
} from '@/lib/api';

const SERVICES_PUBLIC_PATH = '/services/public';

function parsePublicService(value: unknown, index: number): IServices {
  const context = `service response item ${index}`;

  if (!isRecord(value)) {
    throw new Error(`Invalid service response: item ${index} is not an object`);
  }

  const colors = value.colors;

  return {
    id: readRequiredString(value, 'id', context),
    title_ka: readOptionalString(value, 'title_ka'),
    title_en: readOptionalString(value, 'title_en'),
    description_ka: readOptionalString(value, 'description_ka'),
    description_en: readOptionalString(value, 'description_en'),
    slug_ka: readOptionalString(value, 'slug_ka'),
    slug_en: readOptionalString(value, 'slug_en'),
    metaTitle_ka: readOptionalString(value, 'metaTitle_ka'),
    metaTitle_en: readOptionalString(value, 'metaTitle_en'),
    metaDescription_ka: readOptionalString(value, 'metaDescription_ka'),
    metaDescription_en: readOptionalString(value, 'metaDescription_en'),
    icon: readRequiredString(value, 'icon', context),
    iconColor: readRequiredString(value, 'iconColor', context),
    colors: isStringArray(colors) ? colors : [],
  };
}

export async function fetchPublicServices(
  signal?: AbortSignal,
): Promise<IServices[]> {
  const response = await fetch(`${getApiBaseUrl()}${SERVICES_PUBLIC_PATH}`, {
    signal,
  });

  if (!response.ok) {
    throw new ApiRequestError(
      await getResponseErrorMessage(response, 'Services request'),
      response.status,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid service response: expected an array');
  }

  return data.map(parsePublicService);
}
