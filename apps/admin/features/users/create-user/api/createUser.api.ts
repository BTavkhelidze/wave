import { apiRequest } from '../../../../src/shared/api/httpClient';
import type { UserListItemData } from '../../users-list';
import type { CreateUserFormValues } from '../model/createUserForm.types';

export type CreateUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  role: CreateUserFormValues['role'];
};

export type CreateUserResponse = {
  user: UserListItemData;
  emailSent: boolean;
  message: string;
};

export function createUserByAdmin(
  payload: CreateUserPayload,
): Promise<CreateUserResponse> {
  return apiRequest<CreateUserResponse>('/users/admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}
