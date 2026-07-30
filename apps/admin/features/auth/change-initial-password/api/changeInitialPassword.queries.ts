import { useMutation } from '@tanstack/react-query';

import { changeInitialPassword } from './changeInitialPassword.api';

export function useChangeInitialPasswordMutation() {
  return useMutation({
    mutationFn: changeInitialPassword,
  });
}
