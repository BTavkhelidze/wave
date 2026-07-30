import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deleteUserByAdmin,
  fetchUsers,
  updateUserActiveStatus,
} from './usersList.api';
import type { UserListItemData } from '../model/usersList.types';

export const usersListQueryKey = ['users'] as const;

export function useUsersQuery() {
  return useQuery({
    queryKey: usersListQueryKey,
    queryFn: fetchUsers,
  });
}

export function useUpdateUserActiveStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserActiveStatus,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<UserListItemData[]>(
        usersListQueryKey,
        (currentUsers) =>
          currentUsers?.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ) ?? [updatedUser],
      );
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserByAdmin,
    onSuccess: (deletedUser) => {
      queryClient.setQueryData<UserListItemData[]>(
        usersListQueryKey,
        (currentUsers) =>
          currentUsers?.filter((user) => user.id !== deletedUser.id) ?? [],
      );
    },
  });
}
