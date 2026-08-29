import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ADMIN_DEFAULT_ROUTE,
  ADMIN_ROUTE_PATHS,
} from '../../src/app/router/routes.constants';

type PrivateRouteProps = {
  children: ReactNode;
  allowInitialPasswordChange?: boolean;
};

const PrivateRoute = ({
  children,
  allowInitialPasswordChange = false,
}: PrivateRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) return <Navigate to={ADMIN_ROUTE_PATHS.login} replace />;

  if (user.mustChangePassword && !allowInitialPasswordChange) {
    return <Navigate to={ADMIN_ROUTE_PATHS.changeInitialPassword} replace />;
  }

  if (allowInitialPasswordChange && !user.mustChangePassword) {
    return <Navigate to={ADMIN_DEFAULT_ROUTE} replace />;
  }

  return children;
};

export default PrivateRoute;
