import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

interface AuthRedirectProps {
  children: React.ReactNode;
}

export const AuthRedirect: React.FC<AuthRedirectProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Solo redirigir si estamos en la página principal y no hay navegación activa
      if (location.pathname === '/' && !location.state?.fromNavigation) {
        // Delay para permitir navegación normal
        const timer = setTimeout(() => {
          switch (user.role) {
            case 'admin':
              navigate('/admin', { replace: true });
              break;
            case 'organizer':
              navigate('/dashboard', { replace: true });
              break;
            case 'attendee':
            default:
              navigate('/events', { replace: true });
              break;
          }
        }, 3000); // 3 segundos de delay
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname, location.state]);

  return <>{children}</>;
};
