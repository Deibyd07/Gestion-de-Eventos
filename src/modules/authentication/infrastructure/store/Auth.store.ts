import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ServicioUsuarios } from '@shared/lib/api/Supabase.service';
import { supabase } from '@shared/lib/api/supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organizer' | 'attendee';
  avatar?: string;
  preferences?: {
    categories: string[];
    location: string;
    organization?: string;
    bio?: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (userData: { email: string; password: string; name: string; phone?: string; location?: string; role?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
  updateUserRole: (userId: string, role: 'admin' | 'organizer' | 'attendee') => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: async (email: string, password: string) => {
        try {
          // IMPORTANTE: Limpiar cualquier sesión/datos anteriores antes de iniciar sesión
          await supabase.auth.signOut();
          set({
            user: null,
            isAuthenticated: false,
            token: null
          });
          localStorage.removeItem('auth-storage');
          
          // Ahora autenticar con Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError || !authData.user) {
            throw new Error('Credenciales inválidas');
          }

          // Verificar si el email está confirmado
          if (!authData.user.email_confirmed_at) {
            // Email no verificado - cerrar sesión y no permitir login
            await supabase.auth.signOut();
            throw new Error('Debes verificar tu correo electrónico antes de iniciar sesión. Revisa tu bandeja de entrada.');
          }

          // Obtener datos del usuario desde la base de datos
          const userData = await ServicioUsuarios.obtenerUsuarioPorEmail(email);
          
          if (!userData) {
            throw new Error('Usuario no encontrado en la base de datos');
          }

          // Verificar que los campos existan y tengan valores
          const userName = userData.nombre || 'Usuario';
          const dbRole = userData.tipo_usuario || 'asistente';
          
          // Mapear roles de la base de datos a los roles del sistema
          const roleMapping: { [key: string]: 'admin' | 'organizer' | 'attendee' } = {
            'administrador': 'admin',
            'organizador': 'organizer', 
            'asistente': 'attendee',
            'admin': 'admin',
            'organizer': 'organizer',
            'attendee': 'attendee'
          };
          
          const userRole = roleMapping[dbRole.toLowerCase()] || 'attendee';

          const user: User = {
            id: userData.id,
            email: userData.correo_electronico,
            name: userName,
            role: userRole,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            preferences: {
              categories: [],
              location: userData.ubicacion || 'Colombia'
            }
          };

          set({
            user,
            isAuthenticated: true,
            token: `auth-token-${userData.id}`
          });
        } catch (error: any) {
          throw new Error(error.message || 'Error al iniciar sesión');
        }
      },

      register: async (userData) => {
        try {
          // Limpiar sesión previa para evitar refresh tokens inválidos
          await supabase.auth.signOut();
          localStorage.removeItem('auth-storage');

          // 0. Verificar si el correo ya está registrado en la tabla usuarios
          const { data: existingUser, error: checkError } = await supabase
            .from('usuarios')
            .select('correo_electronico')
            .eq('correo_electronico', userData.email)
            .maybeSingle();

          if (existingUser) {
            throw new Error('Este correo electrónico ya está en uso. Por favor usa otro correo o inicia sesión.');
          }

          // 1. Crear usuario en Supabase Auth (encripta contraseña y agrega metadatos)
          // IMPORTANTE: emailRedirectTo debe apuntar a tu dominio de producción o localhost en desarrollo
          const redirectUrl = window.location.origin + '/auth/callback';
          
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
              emailRedirectTo: redirectUrl,
              data: {
                nombre_completo: userData.name,
                telefono: userData.phone,
                ubicacion: userData.location,
                rol: userData.role || 'attendee'
              }
            }
          });

          if (authError) {
            console.error('[Auth.register] Supabase signUp error:', authError);
            // Mensajes de error más específicos según el tipo de error
            if (authError.message.includes('already registered') || 
                authError.message.includes('already been registered') ||
                authError.message.includes('User already registered') ||
                authError.message.toLowerCase().includes('duplicate')) {
              throw new Error('Este correo electrónico ya está en uso. Por favor usa otro correo o inicia sesión.');
            }
            if (authError.message.includes('Email rate limit exceeded')) {
              throw new Error('Demasiados intentos. Por favor espera un momento e intenta nuevamente');
            }
            if (authError.message.includes('Invalid email')) {
              throw new Error('El formato del correo electrónico no es válido');
            }
            throw new Error(authError.message || 'Error al crear la cuenta');
          }
          if (!authData.user) throw new Error('No se pudo crear el usuario');

          // Verificar si el usuario necesita confirmar su email
          const needsEmailConfirmation = authData.user.identities && authData.user.identities.length > 0;
          console.log('[Auth.register] Usuario creado:', {
            userId: authData.user.id,
            email: authData.user.email,
            emailConfirmed: authData.user.email_confirmed_at,
            needsConfirmation: needsEmailConfirmation
          });

          const userId = authData.user.id;

          // Crear/actualizar registro en public.usuarios (estado pendiente) para evitar 406
          // y permitir que el callback lo marque como verificado al confirmar el correo
          const roleMapping: { [key: string]: string } = {
            admin: 'administrador',
            organizer: 'organizador',
            attendee: 'asistente',
          };
          const dbRole = roleMapping[userData.role || 'attendee'] || 'asistente';

          // Intento obligatorio de crear el registro en public.usuarios desde el botón "Crear cuenta"
          const perfilPendiente = {
            id: userId,
            correo_electronico: userData.email,
            nombre_completo: userData.name || 'Usuario',
            rol: dbRole as any,          // columna existente en el schema actual
            telefono: userData.phone || null,
            ubicacion: userData.location || null,
            estado: 'pendiente',
            email_verified: false,
          } as any;

          const { error: upsertError } = await supabase
            .from('usuarios')
            .upsert(perfilPendiente, { onConflict: 'id' });

          if (upsertError) {
            console.error('[Auth.register] Error al crear perfil en usuarios:', upsertError);
            throw new Error('No se pudo crear la cuenta en la tabla usuarios: ' + upsertError.message);
          }

          console.log('[Auth.register] Perfil creado/actualizado en public.usuarios (pendiente)');

          // IMPORTANTE: NO crear el perfil todavía
          // El perfil se creará automáticamente por el trigger DESPUÉS de que el usuario verifique su email
          // Por ahora, solo guardamos los metadatos en Supabase Auth para usarlos después
          
          console.log('[Auth.register] Usuario creado en Auth. Esperando verificación de email...');

          // NO iniciar sesión en el store - el usuario debe verificar su email primero
          // IMPORTANTE: NO hacemos signOut() porque eso eliminaría al usuario de Supabase Auth
          // La sesión debe permanecer para que el callback de verificación funcione
          // Solo limpiamos el store LOCAL para que no aparezca como autenticado en la UI
          
          set({ 
            user: null, 
            isAuthenticated: false, 
            token: null 
          });
          
          // NO limpiar el localStorage de Supabase, solo nuestro store
          localStorage.removeItem('auth-storage');
          
          console.log('[Auth.register] Usuario creado en Supabase Auth:', userId);
          console.log('[Auth.register] Email de verificación enviado. Usuario debe confirmar su correo.');
        } catch (error: any) {
          console.error('[Auth.register] Error final:', error);
          throw new Error(error.message || 'Error al crear la cuenta');
        }
      },

      logout: () => {
        // Cerrar sesión de Supabase
        supabase.auth.signOut();
        
        // Limpiar el store
        set({
          user: null,
          isAuthenticated: false,
          token: null
        });
        
        // IMPORTANTE: Limpiar el localStorage manualmente para asegurar que no queden datos
        localStorage.removeItem('auth-storage');
      },

      loginWithGoogle: async () => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message || 'Error al iniciar sesión con Google');
        }
      },

      loginWithFacebook: async () => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'facebook',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`
            }
          });

          if (error) throw error;
        } catch (error: any) {
          throw new Error(error.message || 'Error al iniciar sesión con Facebook');
        }
      },

      updateProfile: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      },

      updateUserRole: async (userId: string, role: 'admin' | 'organizer' | 'attendee') => {
        try {
          await ServicioUsuarios.actualizarUsuario(userId, { rol: role as any });
        } catch (error: any) {
          throw new Error(error.message || 'Error al actualizar el rol del usuario');
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);