import { UserListItem } from './UserListItem';
import {
  useDeleteUserMutation,
  useUpdateUserActiveStatusMutation,
  useUsersQuery,
} from '../api/usersList.queries';

type UsersListProps = {
  canManageUsers: boolean;
};

export function UsersList({ canManageUsers }: UsersListProps) {
  const usersQuery = useUsersQuery();
  const updateUserActiveStatusMutation = useUpdateUserActiveStatusMutation();
  const deleteUserMutation = useDeleteUserMutation();

  const handleToggleActive = (userId: string, isActive: boolean) => {
    updateUserActiveStatusMutation.mutate({
      userId,
      isActive: !isActive,
    });
  };

  const handleDelete = (userId: string) => {
    deleteUserMutation.mutate(userId);
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
      : undefined;

  return (
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
  );
}
