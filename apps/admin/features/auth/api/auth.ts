const API_Base = 'http://localhost:3000/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown Error');
    throw new Error(text);
  }

  return res.json() as Promise<T>;
}

export interface User {
  id: string;
  email: string;
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_Base}/auth/active-account`, {
    method: 'POST',
    credentials: 'include',
  });

  return handleResponse<User>(res);
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: number;
  message: string;
}

export async function loginUser(data: LoginCredentials) {
  const res = await fetch(`${API_Base}/auth/signin`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return handleResponse<LoginResponse>(res);
}

export async function logoutUser() {
  const res = await fetch(`${API_Base}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(res);
}
