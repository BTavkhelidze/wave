import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminLogsRootQueryKey } from '../../../admin-logs/api/adminLogs.queries';
import {
  deleteUserByAdmin,
  fetchUsers,
  resetUserPasswordByAdmin,
  updateUserActiveStatus,
  type ResetUserPasswordResponse,
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
    onSuccess: async (updatedUser) => {
      queryClient.setQueryData<UserListItemData[]>(
        usersListQueryKey,
        (currentUsers) =>
          currentUsers?.map((user) =>
            user.id === updatedUser.id ? updatedUser : user,
          ) ?? [updatedUser],
      );
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserByAdmin,
    onSuccess: async (deletedUser) => {
      queryClient.setQueryData<UserListItemData[]>(
        usersListQueryKey,
        (currentUsers) =>
          currentUsers?.filter((user) => user.id !== deletedUser.id) ?? [],
      );
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

export function useResetUserPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUserPasswordByAdmin,
    onSuccess: async (response) => {
      queryClient.setQueryData<UserListItemData[]>(
        usersListQueryKey,
        (currentUsers) =>
          currentUsers?.map((user) =>
            user.id === response.user.id ? response.user : user,
          ) ?? [response.user],
      );
      await queryClient.invalidateQueries({ queryKey: adminLogsRootQueryKey });
    },
  });
}

export type { ResetUserPasswordResponse };
