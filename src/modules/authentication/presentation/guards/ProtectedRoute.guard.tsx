import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'organizer' | 'attendee';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/events" replace />;
  }

  return <>{children}</>;
}