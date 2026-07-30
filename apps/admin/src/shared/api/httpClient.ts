export const API_BASE_URL = 'http://localhost:3000/api';

const SESSION_EXPIRED_EVENT = 'admin-session-expired';

type ApiFetchOptions = RequestInit & {
  skipAuthRefresh?: boolean;
};

let refreshTokenRequest: Promise<void> | null = null;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export class AuthRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthRequestError';
  }
}

export function isAuthRequestError(error: unknown): error is AuthRequestError {
  return error instanceof AuthRequestError;
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

function emitSessionExpired() {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));

  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

async function refreshAccessToken(): Promise<void> {
  refreshTokenRequest ??= fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    credentials: 'include',
  }).then(async (response) => {
    if (!response.ok) {
      throw new AuthRequestError('Session expired');
    }
  });

  try {
    await refreshTokenRequest;
  } finally {
    refreshTokenRequest = null;
  }
}

export async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new AuthRequestError('Unauthorized');
  }

  if (!response.ok) {
    const message = await response.text().catch(() => 'Unknown Error');
    throw new ApiRequestError(message, response.status);
  }

  return response.json() as Promise<T>;
}

export async function apiRequest<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<T> {
  const { skipAuthRefresh, ...requestInit } = init ?? {};
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...requestInit,
    headers: {
      ...requestInit.headers,
    },
  });

  if (response.status === 401 && !skipAuthRefresh) {
    try {
      await refreshAccessToken();
    } catch (error) {
      emitSessionExpired();
      throw error;
    }

    const retriedResponse = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      ...requestInit,
      headers: {
        ...requestInit.headers,
      },
    });

    if (retriedResponse.status === 401) {
      emitSessionExpired();
    }

    return handleJsonResponse<T>(retriedResponse);
  }

  return handleJsonResponse<T>(response);
}

export function subscribeToSessionExpired(callback: () => void): () => void {
  window.addEventListener(SESSION_EXPIRED_EVENT, callback);

  return () => {
    window.removeEventListener(SESSION_EXPIRED_EVENT, callback);
  };
}
