import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from '../layouts/AdminLayout';
import { ChangeInitialPasswordPage } from '../../../features/auth/change-initial-password';
import LoginPage from '../../../features/auth/Login';
import DashboardPage from '../../../features/dashboard/Dashboard';
import PrivateRoute from '../../../features/routes/PrivateRoute';
import PublicRoute from '../../../features/routes/PublicRoute';
import { RoleProtectedRoute } from '../../../features/routes/RoleProtectedRoute';
import { AnalyticsPage } from '../../../features/analytics/pages/AnalyticsPage';
import { AdminLogsPage } from '../../../features/admin-logs';
import { BlogsPage } from '../../../features/blogs/pages/BlogsPage';
import { ServicesPage } from '../../../features/services/pages/ServicesPage';
import { CreateUserPage } from '../../../features/users/create-user';
import { UsersPage } from '../../../features/users/users-page';
import { ADMIN_DEFAULT_ROUTE, ADMIN_ROUTE_PATHS } from './routes.constants';
import { ADMIN_ROUTE_ACCESS } from './routes.permissions';

export function AppRoutes() {
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
        path={ADMIN_ROUTE_PATHS.changeInitialPassword}
        element={
          <PrivateRoute allowInitialPasswordChange>
            <ChangeInitialPasswordPage />
          </PrivateRoute>
        }
      />

      <Route
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to={ADMIN_DEFAULT_ROUTE} replace />} />
        <Route
          path={ADMIN_ROUTE_PATHS.dashboard.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.dashboard]}
            >
              <DashboardPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.analytics.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.analytics]}
            >
              <AnalyticsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.users.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.users]}
            >
              <UsersPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.createUser.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.createUser]}
            >
              <CreateUserPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.adminLogs.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.adminLogs]}
            >
              <AdminLogsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.services.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.services]}
            >
              <ServicesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.blogs.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.blogs]}
            >
              <BlogsPage />
            </RoleProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to={ADMIN_DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  );
}
