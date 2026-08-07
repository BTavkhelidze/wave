import type { IServices } from '@/Interface/Interface';

const SERVICES_PUBLIC_PATH = '/services/public';

export class ServicesRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ServicesRequestError';
  }
}

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }

  return apiBaseUrl;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function readOptionalString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];

  return typeof value === 'string' ? value : undefined;
}

function readRequiredString(
  record: Record<string, unknown>,
  key: string,
  index: number,
): string {
  const value = record[key];

  if (typeof value !== 'string') {
    throw new Error(`Invalid service response: item ${index} is missing ${key}`);
  }

  return value;
}

function parsePublicService(value: unknown, index: number): IServices {
  if (!isRecord(value)) {
    throw new Error(`Invalid service response: item ${index} is not an object`);
  }

  const colors = value.colors;

  return {
    id: readRequiredString(value, 'id', index),
    title_ka: readOptionalString(value, 'title_ka'),
    title_en: readOptionalString(value, 'title_en'),
    description_ka: readOptionalString(value, 'description_ka'),
    description_en: readOptionalString(value, 'description_en'),
    icon: readRequiredString(value, 'icon', index),
    iconColor: readRequiredString(value, 'iconColor', index),
    colors: isStringArray(colors) ? colors : [],
  };
}

async function getResponseErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Services request failed with ${response.status} ${response.statusText}`;
  const responseText = await response.text().catch(() => '');

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const errorBody: unknown = JSON.parse(responseText);

    if (isRecord(errorBody)) {
      const message = errorBody.message;

      if (typeof message === 'string') {
        return message;
      }

      if (isStringArray(message)) {
        return message.join(', ');
      }

      if (typeof errorBody.error === 'string') {
        return errorBody.error;
      }
    }
  } catch {
    return responseText;
  }

  return responseText;
}

export async function fetchPublicServices(
  signal?: AbortSignal,
): Promise<IServices[]> {
  const response = await fetch(`${getApiBaseUrl()}${SERVICES_PUBLIC_PATH}`, {
    signal,
  });

  if (!response.ok) {
    throw new ServicesRequestError(
      await getResponseErrorMessage(response),
      response.status,
    );
  }

  const data: unknown = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Invalid service response: expected an array');
  }

  return data.map(parsePublicService);
}
