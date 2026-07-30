import { apiRequest } from '../../../../src/shared/api/httpClient';
import type { UserListItemData } from '../model/usersList.types';

export function fetchUsers(): Promise<UserListItemData[]> {
  return apiRequest<UserListItemData[]>('/users');
}

export function updateUserActiveStatus({
  userId,
  isActive,
}: {
  userId: string;
  isActive: boolean;
}): Promise<UserListItemData> {
  return apiRequest<UserListItemData>(`/users/${userId}/active-status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ isActive }),
  });
}

export function deleteUserByAdmin(userId: string): Promise<UserListItemData> {
  return apiRequest<UserListItemData>(`/users/${userId}`, {
    method: 'DELETE',
  });
}
