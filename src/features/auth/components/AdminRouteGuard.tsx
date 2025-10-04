import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../core/stores/authStore';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      // Solo redirigir si está en la página principal y no ha hecho clic en ningún enlace
      // Permitir navegación normal en otras rutas
      if (location.pathname === '/' && !location.state?.fromNavigation) {
        // Pequeño delay para permitir que el usuario vea la página antes de redirigir
        const timer = setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 2000); // 2 segundos de delay
        
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname, location.state]);

  return <>{children}</>;
};

