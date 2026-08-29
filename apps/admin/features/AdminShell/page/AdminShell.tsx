import { Outlet } from 'react-router-dom';

export default function AdminShell() {
  return (
    <div className='min-h-screen bg-[#F8FAFC] text-[#111827]'>
      <div className='mx-auto flex min-h-screen max-w-[1440px]'>
        <div className='flex min-w-0 flex-1 flex-col'>
          <main className='flex-1 px-4 py-6 lg:px-8'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
