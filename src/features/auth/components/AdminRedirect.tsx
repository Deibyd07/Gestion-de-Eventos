import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../core/stores/authStore';

interface AdminRedirectProps {
  children: React.ReactNode;
}

export const AdminRedirect: React.FC<AdminRedirectProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      // Si es admin, redirigir al panel de administración
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Si es admin, no mostrar el contenido normal
  if (isAuthenticated && user?.role === 'admin') {
    return null;
  }

  return <>{children}</>;
};
