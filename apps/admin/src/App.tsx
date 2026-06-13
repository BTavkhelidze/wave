import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import DashboardPage from '../features/dashboard/Dashboard';
function App() {
  return (
    <div className='min-h-screen text-slate-100'>
      <div className='mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8'>
        <header className='mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur'>
          <div>
            <p className='text-xs uppercase tracking-[0.35em] text-sky-200/70'>
              Wave Admin
            </p>
            <h1 className='mt-1 text-lg font-semibold text-white'>
              Operations Console
            </h1>
          </div>
          <nav className='flex items-center gap-3 text-sm'>
            <Link
              to='/'
              className='rounded-full border border-white/10 px-4 py-2 text-slate-200 transition hover:border-sky-300/50 hover:text-white'
            >
              Dashboard
            </Link>
            <Link
              to='/sign-in'
              className='rounded-full bg-sky-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-sky-300'
            >
              Sign in
            </Link>
          </nav>
        </header>

        <Routes>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/sign-in' element={<DashboardPage />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
