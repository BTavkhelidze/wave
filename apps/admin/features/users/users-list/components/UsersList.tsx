import { UserListItem } from './UserListItem';
import { ResetUserPasswordDialog } from './ResetUserPasswordDialog';
import {
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useUpdateUserActiveStatusMutation,
  useUsersQuery,
} from '../api/usersList.queries';
import { useState } from 'react';
import type { UserListItemData } from '../model/usersList.types';

type UsersListProps = {
  canManageUsers: boolean;
};

export function UsersList({ canManageUsers }: UsersListProps) {
  const [selectedUserForReset, setSelectedUserForReset] =
    useState<UserListItemData | null>(null);
  const [resetResult, setResetResult] = useState<{
    email: string;
    emailSent: boolean;
    message: string;
  } | null>(null);
  const usersQuery = useUsersQuery();
  const updateUserActiveStatusMutation = useUpdateUserActiveStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();
  const resetUserPasswordMutation = useResetUserPasswordMutation();

  const handleToggleActive = (userId: string, isActive: boolean) => {
    updateUserActiveStatusMutation.mutate({
      userId,
      isActive: !isActive,
    });
  };

  const handleDelete = (userId: string) => {
    deleteUserMutation.mutate(userId);
  };

  const handleOpenResetDialog = (user: UserListItemData) => {
    setResetResult(null);
    setSelectedUserForReset(user);
  };

  const handleCloseResetDialog = () => {
    if (resetUserPasswordMutation.isPending) {
      return;
    }

    resetUserPasswordMutation.reset();
    setSelectedUserForReset(null);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUserForReset) {
      return;
    }

    const response = await resetUserPasswordMutation.mutateAsync(
      selectedUserForReset.id,
    );

    setResetResult({
      email: response.user.email,
      emailSent: response.emailSent,
      message: response.message,
    });
    setSelectedUserForReset(null);
  };

  if (usersQuery.isLoading) {
    return (
      <div className='rounded-lg border border-[#E5E7EB] bg-white p-5 shadow-sm'>
        <p className='text-sm text-[#6B7280]'>Loading users...</p>
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div className='rounded-lg border border-[#FCA5A5] bg-white p-5 shadow-sm'>
        <p className='text-sm font-medium text-[#B91C1C]'>
          Could not load users.
        </p>
        <button
          type='button'
          onClick={() => void usersQuery.refetch()}
          className='mt-3 rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30'
        >
          Try again
        </button>
      </div>
    );
  }

  const users = usersQuery.data ?? [];
  const pendingUserId = updateUserActiveStatusMutation.isPending
    ? updateUserActiveStatusMutation.variables.userId
    : deleteUserMutation.isPending
      ? deleteUserMutation.variables
      : resetUserPasswordMutation.isPending
        ? resetUserPasswordMutation.variables
        : undefined;

  return (
    <>
      <div className='space-y-4'>
        {resetResult && (
          <div
            aria-live='polite'
            className='rounded-lg border border-[#D1FAE5] bg-[#ECFDF5] px-4 py-3 text-sm leading-6 text-[#065F46]'
          >
            <p className='font-semibold'>
              {resetResult.emailSent
                ? `Password reset successfully. A new temporary password was sent to ${resetResult.email}.`
                : 'Password was reset, but the temporary-password email could not be delivered.'}
            </p>
            <p className='mt-1'>
              Email:{' '}
              <span className='font-mono font-semibold'>
                {resetResult.email}
              </span>
            </p>
            <p className='mt-1'>{resetResult.message}</p>
          </div>
        )}

        <div className='overflow-hidden rounded-lg border border-[#E5E7EB] bg-white shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-left'>
              <thead className='bg-[#F8FAFC]'>
                <tr className='border-b border-[#E5E7EB] text-xs font-medium uppercase tracking-wide text-[#6B7280]'>
                  <th scope='col' className='px-5 py-3'>
                    Email
                  </th>
                  <th scope='col' className='px-5 py-3'>
                    Role
                  </th>
                  <th scope='col' className='px-5 py-3'>
                    Status
                  </th>
                  <th scope='col' className='px-5 py-3'>
                    Created date
                  </th>
                  {canManageUsers && (
                    <th scope='col' className='px-5 py-3 text-right'>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <UserListItem
                      key={user.id}
                      user={user}
                      isPending={pendingUserId === user.id}
                      canManageUsers={canManageUsers}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                      onResetPassword={handleOpenResetDialog}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={canManageUsers ? 5 : 4}
                      className='px-5 py-4 text-sm text-[#6B7280]'
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedUserForReset && (
        <ResetUserPasswordDialog
          userEmail={selectedUserForReset.email}
          isResetting={resetUserPasswordMutation.isPending}
          errorMessage={
            resetUserPasswordMutation.error instanceof Error
              ? resetUserPasswordMutation.error.message
              : null
          }
          onCancel={handleCloseResetDialog}
          onConfirm={() => void handleConfirmResetPassword()}
        />
      )}
    </>
  );
}
