export type ContactFormPayload = {
  fullName: string;
  email: string;
  phone?: string;
  message: string;
};

export type ContactFormResponse = {
  message: string;
  data: {
    id: string;
    status: 'UNREAD';
    createdAt: string;
  };
};

export class ContactRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ContactRequestError';
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

async function getResponseErrorMessage(response: Response): Promise<string> {
  const fallbackMessage =
    response.status === 400
      ? 'Please check the form fields and try again.'
      : 'We could not send your message. Please try again later.';
  const responseText = await response.text().catch(() => '');

  if (!responseText) {
    return fallbackMessage;
  }

  try {
    const errorBody: unknown = JSON.parse(responseText);

    if (isRecord(errorBody)) {
      const message = errorBody.message;

      if (typeof message === 'string') {
        return response.status === 400 ? message : fallbackMessage;
      }

      if (
        Array.isArray(message) &&
        message.every((item) => typeof item === 'string')
      ) {
        return response.status === 400 ? message.join(', ') : fallbackMessage;
      }
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export async function submitContactMessage(
  payload: ContactFormPayload,
): Promise<ContactFormResponse> {
  const response = await fetch(`${getApiBaseUrl()}/contact-messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new ContactRequestError(
      await getResponseErrorMessage(response),
      response.status,
    );
  }

  return response.json() as Promise<ContactFormResponse>;
}
