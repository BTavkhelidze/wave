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
import { CreateBlogPage } from '../../../features/blogs/create-blog';
import { BlogsPage } from '../../../features/blogs/pages/BlogsPage';
import { PublicBlogDetailPage } from '../../../features/blogs/pages/PublicBlogDetailPage';
import { PublicBlogsPage } from '../../../features/blogs/pages/PublicBlogsPage';
import { CreateServicePage } from '../../../features/services/pages/CreateServicePage';
import { ServiceDetailPage } from '../../../features/services/pages/ServiceDetailPage';
import { ServiceTranslationPreviewPage } from '../../../features/services/pages/ServiceTranslationPreviewPage';
import { ServicesPage } from '../../../features/services/pages/ServicesPage';
import { CreateUserPage } from '../../../features/users/create-user';
import { UsersPage } from '../../../features/users/users-page';
import {
  ADMIN_DEFAULT_ROUTE,
  ADMIN_ROUTE_PATHS,
  PUBLIC_ROUTE_PATHS,
} from './routes.constants';
import { ADMIN_ROUTE_ACCESS } from './routes.permissions';

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={PUBLIC_ROUTE_PATHS.blogs}
        element={<PublicBlogsPage />}
      />
      <Route
        path={PUBLIC_ROUTE_PATHS.blogDetail}
        element={<PublicBlogDetailPage />}
      />

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
          path={ADMIN_ROUTE_PATHS.createService.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.createService]}
            >
              <CreateServicePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.serviceDetail.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.serviceDetail]}
            >
              <ServiceDetailPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path={ADMIN_ROUTE_PATHS.serviceTranslationDetail.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={
                ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.serviceTranslationDetail]
              }
            >
              <ServiceTranslationPreviewPage />
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
        <Route
          path={ADMIN_ROUTE_PATHS.createBlog.slice(1)}
          element={
            <RoleProtectedRoute
              allowedRoles={ADMIN_ROUTE_ACCESS[ADMIN_ROUTE_PATHS.createBlog]}
            >
              <CreateBlogPage />
            </RoleProtectedRoute>
          }
        />
        <Route path='*' element={<Navigate to={ADMIN_DEFAULT_ROUTE} replace />} />
      </Route>
    </Routes>
  );
}
