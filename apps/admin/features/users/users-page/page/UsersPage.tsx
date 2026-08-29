import {
  canAccessRole,
  SUPER_ADMIN_ONLY,
} from '../../../auth/lib/authorization';
import { useAuth } from '../../../context/AuthContext';
import { UsersList } from '../../users-list';

export function UsersPage() {
  const { user } = useAuth();
  const canManageUsers = canAccessRole(user?.role, SUPER_ADMIN_ONLY);

  return (
    <div className='mx-auto max-w-5xl space-y-8'>
      <section>
        <h2 className='text-2xl font-semibold tracking-tight text-[#111827]'>
          Users
        </h2>
        <p className='mt-2 max-w-2xl text-sm leading-6 text-[#6B7280]'>
          Manage administrator and employee accounts.
        </p>
      </section>

      <section className='space-y-4'>
        <div>
          <h3 className='text-base font-semibold text-[#111827]'>
            User accounts
          </h3>
          <p className='mt-1 text-sm leading-6 text-[#6B7280]'>
            View the current administrator and employee accounts.
          </p>
        </div>

        <UsersList canManageUsers={canManageUsers} />
      </section>
    </div>
  );
}
