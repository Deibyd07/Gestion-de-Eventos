import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ServicioUsuarios } from '../services/supabaseServiceEspanol';
import { supabase } from '../supabase';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'organizer' | 'attendee';
  avatar?: string;
  preferences?: {
    categories: string[];
    location: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  register: (userData: { email: string; password: string; name: string }) => Promise<void>;
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
          const userName = userData.nombre || userData.name || 'Usuario';
          const dbRole = userData.tipo_usuario || userData.role || 'asistente';
          
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
            email: userData.correo_electronico || userData.email,
            name: userName,
            role: userRole,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            preferences: {
              categories: [],
              location: userData.ubicacion || userData.location || 'Colombia'
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
          // Crear usuario en la base de datos
          const newUserData = await ServicioUsuarios.crearUsuario({
            correo_electronico: userData.email,
            nombre: userData.name,
            contraseña: userData.password,
            tipo_usuario: 'attendee' as any,
            ubicacion: 'Colombia'
          });

          const user: User = {
            id: newUserData.id,
            email: newUserData.correo_electronico,
            name: newUserData.nombre,
            role: newUserData.tipo_usuario as 'admin' | 'organizer' | 'attendee',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
            preferences: {
              categories: [],
              location: newUserData.ubicacion || 'Colombia'
            }
          };

          set({
            user,
            isAuthenticated: true,
            token: `auth-token-${newUserData.id}`
          });
        } catch (error: any) {
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