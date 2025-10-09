import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role !== 'admin') {
        // Si no es admin, redirigir según su rol
        switch (user.role) {
          case 'organizer':
            navigate('/dashboard');
            break;
          case 'attendee':
          default:
            navigate('/events');
            break;
        }
      }
    } else if (!isAuthenticated) {
      // Si no está autenticado, redirigir al login
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  // Si no es admin, no mostrar nada
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
};
