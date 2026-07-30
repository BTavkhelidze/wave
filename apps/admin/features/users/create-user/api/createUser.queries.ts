import { useMutation, useQueryClient } from '@tanstack/react-query';

import { usersListQueryKey } from '../../users-list/api/usersList.queries';
import { createUserByAdmin } from './createUser.api';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUserByAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersListQueryKey });
    },
  });
}
