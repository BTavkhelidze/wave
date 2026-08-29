import { useMutation } from '@tanstack/react-query';

import { resetPassword } from './resetPassword.api';

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: resetPassword,
  });
}
