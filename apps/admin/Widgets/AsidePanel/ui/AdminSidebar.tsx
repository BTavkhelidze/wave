import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../../features/context/AuthContext';
import { SidebarNavigation } from './SidebarNavigation';

export function AdminSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className='w-72 border-r border-[#E5E7EB] bg-slate-200 px-5 py-6 lg:flex lg:flex-col'>
      <div className='flex items-center gap-3 px-2'>
        <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-[#7C3AED] text-sm font-semibold text-white'>
          W
        </div>
        <div>
          <p className='text-sm font-semibold text-[#111827]'>Wave Admin</p>

          <p className='text-xs text-[#535963]'>{user?.email}</p>
        </div>
      </div>

      <div className='mt-8 space-y-7 overflow-y-auto'>
        <SidebarNavigation />
        <button
          type='button'
          onClick={handleLogout}
          disabled={isLoggingOut}
          className='w-full rounded-lg bg-[#111827] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#374151] disabled:cursor-not-allowed disabled:opacity-70'
        >
          {isLoggingOut ? 'Logging out...' : 'Log Out'}
        </button>
      </div>
    </aside>
  );
}
