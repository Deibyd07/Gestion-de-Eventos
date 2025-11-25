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
          // Primero autenticar con Supabase Auth
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (authError || !authData.user) {
            throw new Error('Credenciales inválidas');
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
          // 1. Crear usuario en Supabase Auth (encripta contraseña y agrega metadatos)
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
            options: {
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
            throw new Error(authError.message || 'Error al crear la cuenta');
          }
          if (!authData.user) throw new Error('No se pudo crear el usuario');

          const userId = authData.user.id;

          // 2. Esperar a que el trigger inserte en usuarios; fallback si no existe.
          await new Promise(r => setTimeout(r, 150));
          const { data: perfil } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', userId)
            .maybeSingle();

          let finalPerfil = perfil;
          if (!finalPerfil) {
            // Mapear rol frontend -> BD
            const roleMapping: { [key: string]: string } = {
              admin: 'administrador',
              organizer: 'organizador',
              attendee: 'asistente'
            };
            const dbRole = roleMapping[userData.role || 'attendee'] || 'asistente';
            try {
              finalPerfil = await ServicioUsuarios.crearUsuario({
                id: userId as any,
                correo_electronico: userData.email,
                nombre_completo: userData.name,
                rol: dbRole as any,
                ...(userData.phone && { telefono: userData.phone } as any),
                ...(userData.location && { ubicacion: userData.location } as any)
              } as any);
            } catch (e: any) {
              if (!e.message?.includes('duplicate')) {
                console.error('[Auth.register] Fallback inserción usuarios error:', e);
                throw new Error('Error creando perfil de usuario');
              }
              // Si es duplicate, reintentar obtener
              const { data: existente } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
              finalPerfil = existente || null;
            }
          }

          if (!finalPerfil) throw new Error('No se pudo obtener el perfil de usuario');

          const mappedRole = (userData.role as any) || 'attendee';

          const user: User = {
            id: finalPerfil.id,
            email: finalPerfil.correo_electronico,
            name: finalPerfil.nombre_completo || userData.name,
            role: mappedRole,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            preferences: {
              categories: [],
              location: finalPerfil.ubicacion || userData.location || 'Colombia'
            }
          };

          set({ user, isAuthenticated: true, token: `auth-token-${user.id}` });
        } catch (error: any) {
          console.error('[Auth.register] Error final:', error);
          throw new Error(error.message || 'Error al crear la cuenta');
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null
        });
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