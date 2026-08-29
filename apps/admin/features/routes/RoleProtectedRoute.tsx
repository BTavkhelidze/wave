import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { canAccessRole, type RoleAccessRule } from '../auth/lib/authorization';
import { useAuth } from '../context/AuthContext';
import { ADMIN_DEFAULT_ROUTE } from '../../src/app/router/routes.constants';

type RoleProtectedRouteProps = {
  allowedRoles: RoleAccessRule;
  children: ReactNode;
};

export function RoleProtectedRoute({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) return <Navigate to='/login' replace />;

  if (!canAccessRole(user.role, allowedRoles)) {
    return <Navigate to={ADMIN_DEFAULT_ROUTE} replace />;
  }

  return children;
}
