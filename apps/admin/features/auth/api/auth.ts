const API_Base = 'http://localhost:5000/api';

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

interface User {
  id: string;
  email: string;
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_Base}/users/profile`, {
    credentials: 'include',
  });

  return handleResponse<User>(res);
}

interface IData {
  email: string;
  password: string;
}

export async function loginUser(data: IData) {
  const res = await fetch(`${API_Base}/users/login`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function logoutUser() {
  const res = await fetch(`${API_Base}/users/logout`, {
    method: 'POST',
    credentials: 'include',
  });
  return handleResponse(res);
}
