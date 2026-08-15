import { apiRequest } from '../../../../src/shared/api/httpClient';

export type ChangeInitialPasswordPayload = {
  newPassword: string;
};

export type ChangeInitialPasswordResponse = {
  message: string;
};

export function changeInitialPassword(
  payload: ChangeInitialPasswordPayload,
): Promise<ChangeInitialPasswordResponse> {
  return apiRequest<ChangeInitialPasswordResponse>(
    '/auth/change-initial-password',
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  );
}
