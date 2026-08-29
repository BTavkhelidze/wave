import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ADMIN_DEFAULT_ROUTE,
  ADMIN_ROUTE_PATHS,
} from '../../src/app/router/routes.constants';

type PublicRouteProps = {
  children: ReactNode;
};

const PublicRoute = ({ children }: PublicRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!user) return children;

  return (
    <Navigate
      to={
        user.mustChangePassword
          ? ADMIN_ROUTE_PATHS.changeInitialPassword
          : ADMIN_DEFAULT_ROUTE
      }
      replace
    />
  );
};

export default PublicRoute;
