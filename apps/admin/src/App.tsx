import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../features/auth/Login';
import DashboardPage from '../features/dashboard/Dashboard';
import AdminShell from '../features/AdminShell/page/AdminShell';
import AsidePanel from '../Widgets/AsidePanel/AsidePanel';
import PrivateRoute from '../features/routes/PrivateRoute';
import PublicRoute from '../features/routes/PublicRoute';

function PrivateLayout() {
  return (
    <div className='flex'>
      <AsidePanel />
      <div className='flex-1'>
        <AdminShell />
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path='/login'
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <PrivateRoute>
            <PrivateLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Route>
    </Routes>
  );
}

export default App;
