import { getUserRoleLabel } from '../model/usersList.constants';
import type { UserListItemData } from '../model/usersList.types';

type UserListItemProps = {
  user: UserListItemData;
  isPending: boolean;
  canManageUsers: boolean;
  onToggleActive: (userId: string, isActive: boolean) => void;
  onDelete: (userId: string) => void;
};

const createdDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

function formatCreatedDate(createdAt: string): string {
  return createdDateFormatter.format(new Date(createdAt));
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  const label = isActive ? 'Active' : 'Inactive';
  const className = isActive
    ? 'bg-[#ECFDF5] text-[#047857]'
    : 'bg-[#F8FAFC] text-[#6B7280]';

  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

export function UserListItem({
  user,
  isPending,
  canManageUsers,
  onToggleActive,
  onDelete,
}: UserListItemProps) {
  const activeActionLabel = user.isActive ? 'Make inactive' : 'Make active';

  return (
    <tr className='border-b border-[#E5E7EB] last:border-b-0'>
      <td className='whitespace-nowrap px-5 py-4 text-sm font-medium text-[#111827]'>
        {user.email}
      </td>
      <td className='whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]'>
        {getUserRoleLabel(user.role)}
      </td>
      <td className='whitespace-nowrap px-5 py-4'>
        <StatusBadge isActive={user.isActive} />
      </td>
      <td className='whitespace-nowrap px-5 py-4 text-sm text-[#6B7280]'>
        {formatCreatedDate(user.createdAt)}
      </td>
      {canManageUsers && (
        <td className='whitespace-nowrap px-5 py-4'>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              onClick={() => onToggleActive(user.id, user.isActive)}
              disabled={isPending}
              aria-label={`${activeActionLabel} ${user.email}`}
              className='rounded-md border border-[#D1D5DB] bg-white px-3 py-1.5 text-xs font-medium text-[#111827] transition hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 disabled:cursor-not-allowed disabled:opacity-60'
            >
              {activeActionLabel}
            </button>
            <button
              type='button'
              onClick={() => onDelete(user.id)}
              disabled={isPending}
              aria-label={`Delete ${user.email}`}
              className='rounded-md border border-[#FCA5A5] bg-white px-3 py-1.5 text-xs font-medium text-[#B91C1C] transition hover:bg-[#FEF2F2] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/20 disabled:cursor-not-allowed disabled:opacity-60'
            >
              Delete
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}
