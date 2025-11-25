/**
 * Auth Callback Page
 * 
 * Maneja la confirmación de email después de que el usuario hace clic
 * en el enlace de verificación enviado por Supabase Auth.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@shared/lib/api/supabase';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Obtener el código del hash de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (type === 'signup' && accessToken) {
          // Email confirmado exitosamente
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) throw error;

          setStatus('success');
          setMessage('¡Email verificado exitosamente!');
          
          // Redirigir después de 2 segundos
          setTimeout(() => {
            navigate('/events', { replace: true });
          }, 2000);
        } else {
          throw new Error('Tipo de confirmación no válido');
        }
      } catch (error: any) {
        console.error('Error en callback de autenticación:', error);
        setStatus('error');
        setMessage(error.message || 'Error al verificar el correo electrónico');
        
        // Redirigir al home después de 3 segundos
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mb-6">
            {status === 'loading' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'loading' && 'Verificando correo'}
            {status === 'success' && '¡Verificación exitosa!'}
            {status === 'error' && 'Error de verificación'}
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Loading bar */}
          {status === 'loading' && (
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div className="bg-purple-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          )}

          {/* Success message */}
          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirigiendo a la página de eventos...
            </p>
          )}

          {/* Error button */}
          {status === 'error' && (
            <button
              onClick={() => navigate('/', { replace: true })}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Ir al inicio
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
