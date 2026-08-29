import { useMutation } from '@tanstack/react-query';

import { forgotPassword } from './forgotPassword.api';

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPassword,
  });
}
