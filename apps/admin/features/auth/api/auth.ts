import { apiRequest } from '../../../src/shared/api/httpClient';
import type { AuthenticatedUser } from '../model/user.types';

export type User = AuthenticatedUser;

export async function fetchCurrentUser() {
  return apiRequest<User>('/auth/active-account', {
    method: 'POST',
  });
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
  return apiRequest<LoginResponse>('/auth/signin', {
    method: 'POST',
    skipAuthRefresh: true,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

export async function logoutUser() {
  return apiRequest('/auth/logout', {
    method: 'POST',
  });
}
