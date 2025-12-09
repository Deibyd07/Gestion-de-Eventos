/**
 * Auth Callback Page
 * 
 * Maneja la confirmación de email después de que el usuario hace clic
 * en el enlace de verificación enviado por Supabase Auth.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@shared/lib/api/supabase';
import { ServicioUsuarios } from '@shared/lib/api/Supabase.service';
import { useAuthStore } from '@modules/authentication/infrastructure/store/Auth.store';

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu correo electrónico...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Timeout de seguridad: si después de 15 segundos no pasó nada, mostrar error
    const safetyTimeout = setTimeout(() => {
      if (status === 'loading') {
        console.error('[AuthCallback] Timeout: La verificación tomó demasiado tiempo');
        setStatus('error');
        setMessage('La verificación está tomando más tiempo del esperado. Por favor, intenta iniciar sesión manualmente.');
      }
    }, 15000);

    const handleAuthCallback = async () => {
      try {
        setProgress(10);
        
        // Obtener el código del hash de la URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('[AuthCallback] Parámetros recibidos:', { type, hasAccessToken: !!accessToken, error: errorParam });
        setProgress(20);

        // Manejar errores de Supabase en la URL
        if (errorParam) {
          console.error('[AuthCallback] Error en URL:', errorParam, errorDescription);
          throw new Error(errorDescription || errorParam);
        }

        if (!accessToken) {
          throw new Error('Faltan parámetros de verificación en la URL');
        }

        // Aceptar cualquier tipo con access_token (signup, recovery, email_change, etc.)
        if (accessToken) {
          setMessage('Estableciendo sesión...');
          setProgress(30);
          
          // Email confirmado exitosamente
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (sessionError) {
            console.error('[AuthCallback] Error al establecer sesión:', sessionError);
            throw sessionError;
          }

          setProgress(40);
          setMessage('Obteniendo información del usuario...');
          
          // Obtener información del usuario y actualizar el store
          const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();
          
          if (getUserError) {
            console.error('[AuthCallback] Error al obtener usuario:', getUserError);
            throw getUserError;
          }
          
          console.log('[AuthCallback] Usuario autenticado:', authUser?.email);
          setProgress(50);
          
          if (authUser) {
            setMessage('Creando tu perfil...');
            
            // Esperar un poco para que el trigger de la base de datos se ejecute (si está configurado)
            console.log('[AuthCallback] Esperando a que el trigger cree el usuario...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setProgress(60);
            
            // IMPORTANTE: Primero verificar si el usuario ya existe en la tabla usuarios
            let userData = await ServicioUsuarios.obtenerUsuarioPorEmail(authUser.email!);
            
            // Si no existe, crearlo usando los metadatos guardados durante el registro
            if (!userData) {
              console.log('[AuthCallback] Usuario no encontrado en BD, creando perfil manualmente...');
              setMessage('Configurando tu cuenta...');
              setProgress(70);
              
              const metadata = authUser.user_metadata || {};
              const roleMapping: { [key: string]: string } = {
                'admin': 'administrador',
                'organizer': 'organizador',
                'attendee': 'asistente'
              };
              
              const dbRole = roleMapping[metadata.rol] || 'asistente';
              
              try {
                // Crear usuario en la tabla usuarios
                userData = await ServicioUsuarios.crearUsuario({
                  id: authUser.id as any,
                  correo_electronico: authUser.email!,
                  nombre_completo: metadata.nombre_completo || 'Usuario',
                  rol: dbRole as any,
                  telefono: metadata.telefono || null,
                  ubicacion: metadata.ubicacion || null,
                  email_verified: true // Marcar como verificado
                } as any);
                
                console.log('[AuthCallback] Perfil de usuario creado manualmente:', userData?.id);
              } catch (createError: any) {
                console.error('[AuthCallback] Error al crear perfil:', createError);
                
                // Si falla por duplicado, el trigger lo creó justo después de nuestra verificación
                if (createError.message?.includes('duplicate') || 
                    createError.code === '23505') {
                  console.log('[AuthCallback] Usuario ya existe, reintentando obtención...');
                  await new Promise(resolve => setTimeout(resolve, 500));
                  userData = await ServicioUsuarios.obtenerUsuarioPorEmail(authUser.email!);
                }
                
                if (!userData) {
                  throw new Error('No se pudo crear el perfil de usuario. Por favor contacta soporte.');
                }
              }
            } else {
              console.log('[AuthCallback] Usuario encontrado en BD:', userData.id);
              setProgress(70);
              
              // Actualizar email_verified a true si aún no lo está
              if (!userData.email_verified) {
                await supabase
                  .from('usuarios')
                  .update({ email_verified: true })
                  .eq('id', authUser.id);
                
                console.log('[AuthCallback] Email marcado como verificado en BD');
              }
            }
            
            setProgress(80);
            setMessage('Finalizando configuración...');
            
            if (userData) {
              // Mapear roles
              const roleMapping: { [key: string]: 'admin' | 'organizer' | 'attendee' } = {
                'administrador': 'admin',
                'organizador': 'organizer', 
                'asistente': 'attendee',
              };
              
              const userRole = roleMapping[userData.tipo_usuario?.toLowerCase() || userData.rol?.toLowerCase()] || 'attendee';

              // IMPORTANTE: Limpiar localStorage anterior antes de establecer el nuevo usuario
              localStorage.removeItem('auth-storage');
              
              // Actualizar el store DIRECTAMENTE con los datos completos del nuevo usuario
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
              
              console.log('[AuthCallback] Store actualizado con usuario:', useAuthStore.getState().user?.id);
              setProgress(90);
            } else {
              throw new Error('No se encontraron datos del usuario en la base de datos');
            }
          } else {
            throw new Error('No se pudo obtener el usuario autenticado');
          }

          setProgress(100);
          setStatus('success');
          setMessage('¡Email verificado exitosamente!');
          
          console.log('[AuthCallback] Verificación completada, redirigiendo en 2 segundos...');
          
          // Redirigir después de 2 segundos según el rol del usuario
          setTimeout(() => {
            const currentUser = useAuthStore.getState().user;
            const redirectPath = currentUser?.role === 'organizer' 
              ? '/organizer/dashboard' 
              : currentUser?.role === 'admin'
              ? '/admin'
              : '/events';
            
            console.log('[AuthCallback] Redirigiendo a:', redirectPath);
            navigate(redirectPath, { replace: true });
          }, 2000);
        }
      } catch (error: any) {
        console.error('[AuthCallback] Error en callback de autenticación:', error);
        setStatus('error');
        setMessage(error.message || 'Error al verificar el correo electrónico');
        setProgress(0);
        setProgress(0);
        
        // Redirigir al home después de 3 segundos
        setTimeout(() => {
          console.log('[AuthCallback] Redirigiendo al home después de error');
          navigate('/', { replace: true });
        }, 3000);
      } finally {
        clearTimeout(safetyTimeout);
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full animate-bounce">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {status === 'error' && (
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full animate-pulse">
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

          {/* Progress bar - Solo mostrar durante carga */}
          {status === 'loading' && (
            <div className="w-full mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{progress}%</p>
            </div>
          )}

          {/* Success message */}
          {status === 'success' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>Redirigiendo a tu dashboard...</span>
              </div>
            </div>
          )}

          {/* Error button */}
          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => navigate('/', { replace: true })}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Ir al inicio
              </button>
              <p className="text-xs text-gray-500">
                O intenta iniciar sesión manualmente
              </p>
            </div>
          )}
        </div>

        {/* Debug info - Solo en desarrollo */}
        {import.meta.env.DEV && status === 'loading' && (
          <div className="mt-4 p-4 bg-gray-800 text-gray-300 rounded-lg text-xs font-mono">
            <p className="font-bold mb-2">Debug Info:</p>
            <p>Progress: {progress}%</p>
            <p>Status: {status}</p>
            <p>Message: {message}</p>
          </div>
        )}
      </div>
    </div>
  );
};
