import { useMutation, useQueryClient } from '@tanstack/react-query';

import { adminLogsRootQueryKey } from '../../../admin-logs/api/adminLogs.queries';
import { changeInitialPassword } from './changeInitialPassword.api';

export function useChangeInitialPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeInitialPassword,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}
