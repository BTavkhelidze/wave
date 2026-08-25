export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export function getApiBaseUrl(): string {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === 'development' ? 'http://localhost:5000/api' : '');

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
  }

  return apiBaseUrl.replace(/\/+$/, '');
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export async function getResponseErrorMessage(
  response: Response,
  fallbackLabel: string,
): Promise<string> {
  const fallbackMessage = `${fallbackLabel} failed with ${response.status} ${response.statusText}`;
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

export function readOptionalString(
  record: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = record[key];

  return typeof value === 'string' ? value : undefined;
}

export function readRequiredString(
  record: Record<string, unknown>,
  key: string,
  context: string,
): string {
  const value = record[key];

  if (typeof value !== 'string') {
    throw new Error(`Invalid ${context}: missing ${key}`);
  }

  return value;
}
