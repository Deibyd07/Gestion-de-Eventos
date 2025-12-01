/**
 * Email Verification Guard
 * 
 * Verifica si el usuario ha confirmado su email.
 * Si no está verificado, redirige a la sala de espera.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@shared/lib/api/supabase';
import { useAuthStore } from '@modules/authentication/infrastructure/store/Auth.store';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
}

export const EmailVerificationGuard: React.FC<EmailVerificationGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const checkEmailVerification = async () => {
      if (!isAuthenticated) {
        setIsVerified(true); // Si no está autenticado, dejar pasar (otros guards manejan auth)
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsVerified(true);
          return;
        }

        // Verificar si el email está confirmado
        const emailConfirmed = !!user.email_confirmed_at;
        
        if (!emailConfirmed) {
          // Email no verificado, redirigir a sala de espera
          navigate('/auth/verify-email', { replace: true });
          return;
        }

        setIsVerified(true);
      } catch (error) {
        console.error('Error verificando email:', error);
        setIsVerified(true); // En caso de error, dejar pasar
      }
    };

    checkEmailVerification();
  }, [isAuthenticated, navigate]);

  // Mientras verifica, mostrar loading
  if (isVerified === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return <>{children}</>;
};
