/**
 * Email Verification Pending Page
 * 
 * Sala de espera para usuarios que deben verificar su email.
 * Muestra instrucciones y permite reenviar el correo de verificación.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@shared/lib/api/supabase';
import { useAuthStore } from '@modules/authentication/infrastructure/store/Auth.store';
import { ServicioUsuarios } from '@shared/lib/api/Supabase.service';

export const EmailVerificationPendingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, isAuthenticated, user } = useAuthStore();
  const [userEmail, setUserEmail] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener email desde querystring (fallback si no hay sesión)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qsEmail = params.get('email');
    if (qsEmail) setUserEmail(qsEmail);

    // Intentar también leer sesión por si ya existe
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email && !qsEmail) setUserEmail(user.email);
    })();
  }, [location.search]);

  // Verificar cada 2 segundos si el email_verified está en true en la BD
  useEffect(() => {
    if (!userEmail) return;

    const checkEmailVerified = async () => {
      try {
        // Consultar directamente la tabla usuarios para verificar email_verified
        const { data, error } = await supabase
          .from('usuarios')
          .select('email_verified, id, correo_electronico')
          .eq('correo_electronico', userEmail)
          .single();

        if (error) {
          console.error('Error verificando email_verified:', error);
          return;
        }

        if (data && (data as any).email_verified === true) {
          // Email verificado en la base de datos, iniciar sesión y redirigir
          console.log('Email verificado detectado en BD, iniciando sesión...');
          await loginUserAndRedirect((data as any).correo_electronico);
        }
      } catch (err) {
        console.error('Error en checkEmailVerified:', err);
      }
    };

    // Verificar inmediatamente al montar
    checkEmailVerified();

    // Luego verificar cada 2 segundos
    const interval = setInterval(checkEmailVerified, 2000);
    
    // Limpiar intervalo al desmontar
    return () => clearInterval(interval);
  }, [userEmail, navigate]);

  const handleResendEmail = async () => {
    if (!userEmail) return;
    
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });

      if (resendError) throw resendError;

      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Error al reenviar el correo');
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/', { replace: true });
  };

  // Función para iniciar sesión del usuario después de verificar
  const loginUserAndRedirect = async (email: string) => {
    try {
      console.log('[EmailVerificationPending] Email verificado detectado para:', email);
      
      // IMPORTANTE: Verificar si ya hay una sesión activa de Supabase
      // La sesión se establece cuando el usuario hace clic en el enlace del correo (AuthCallback)
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[EmailVerificationPending] Sesión de Supabase:', session ? 'Activa' : 'No activa');

      if (!session) {
        // No hay sesión de Supabase, lo cual significa que:
        // 1. El usuario verificó desde otro dispositivo/navegador
        // 2. La pestaña del callback se cerró antes de establecer la sesión
        // 3. El token de sesión expiró
        console.log('[EmailVerificationPending] No hay sesión de Supabase activa');
        console.log('[EmailVerificationPending] El usuario debe iniciar sesión manualmente');
        
        setError('¡Email verificado! Por favor, inicia sesión con tu email y contraseña para continuar.');
        
        // Redirigir al home después de 4 segundos para que puedan leer el mensaje
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 4000);
        return;
      }

      // Si hay sesión activa, obtener datos del usuario y actualizar el store
      console.log('[EmailVerificationPending] Sesión activa, obteniendo datos del usuario...');
      
      const userData = await ServicioUsuarios.obtenerUsuarioPorEmail(email);
      console.log('[EmailVerificationPending] Datos del usuario desde BD:', userData);
      
      if (!userData) {
        console.error('[EmailVerificationPending] Usuario no encontrado en la base de datos');
        setError('Usuario no encontrado. Por favor, inicia sesión manualmente.');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
        return;
      }

      // Mapear roles
      const roleMapping: { [key: string]: 'admin' | 'organizer' | 'attendee' } = {
        'administrador': 'admin',
        'organizador': 'organizer', 
        'asistente': 'attendee',
      };
      
      const userRole = roleMapping[userData.tipo_usuario?.toLowerCase()] || 'attendee';

      // IMPORTANTE: Limpiar localStorage anterior antes de establecer el nuevo usuario
      localStorage.removeItem('auth-storage');
      
      // Actualizar el store con los datos completos del nuevo usuario
      useAuthStore.setState({
        user: {
          id: userData.id,
          email: userData.correo_electronico,
          name: userData.nombre || 'Usuario',
          role: userRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.correo_electronico}`,
          preferences: {
            categories: [],
            location: userData.ubicacion || 'Colombia'
          }
        },
        isAuthenticated: true,
        token: `auth-token-${userData.id}`
      });

      console.log('[EmailVerificationPending] Store actualizado con sesión activa de Supabase');
      console.log('[EmailVerificationPending] Redirigiendo a /events');
      navigate('/events', { replace: true });
    } catch (err) {
      console.error('[EmailVerificationPending] Error al procesar verificación:', err);
      setError('Email verificado. Por favor, inicia sesión para continuar.');
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Verifica tu correo electrónico
          </h1>

          {/* Email display */}
          <p className="text-center text-gray-600 mb-6">
            Hemos enviado un correo de verificación a:
            <span className="block mt-1 font-semibold text-purple-600">
              {userEmail}
            </span>
          </p>

          {/* Instructions */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-purple-900 mb-2">Instrucciones:</h3>
            <ol className="text-sm text-purple-800 space-y-1 list-decimal list-inside">
              <li>Revisa tu bandeja de entrada</li>
              <li>Busca el correo de EventHub</li>
              <li>Haz clic en el botón de verificación</li>
              <li>Serás redirigido automáticamente</li>
            </ol>
          </div>

          {/* Tips */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              💡 <strong>Consejo:</strong> Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
            </p>
          </div>

          {/* Success message */}
          {resendSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800 text-center">
                ✅ Correo reenviado exitosamente
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 text-center">{error}</p>
            </div>
          )}

          {/* Resend button */}
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="w-full mb-3 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
          >
            {isResending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Reenviando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reenviar correo
              </>
            )}
          </button>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Salir y usar otra cuenta
          </button>

          {/* Auto-check indicator */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
              Verificando automáticamente...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
