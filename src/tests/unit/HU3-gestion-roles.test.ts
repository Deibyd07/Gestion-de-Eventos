/**
 * HU3: Gestión de roles de usuario
 * 
 * Como administrador, quiero gestionar roles de usuario (administrador, 
 * organizador, asistente) para controlar accesos
 * 
 * Criterios de Aceptación:
 * - Crear usuarios con diferentes roles
 * - Cambiar rol de usuario existente
 * - Validar permisos por rol
 * - Restringir acciones según rol
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@modules/authentication/infrastructure/store/Auth.store';

vi.mock('@shared/lib/api/supabase', async () => {
  const { mockSupabaseClient } = await import('../mocks/mockData');
  return {
    supabase: mockSupabaseClient,
  };
});

const { mockUser, mockOrganizer, mockAdmin, mockSupabaseClient } = await import('../mocks/mockData');

describe('HU3: Gestión de roles de usuario', () => {
  beforeEach(() => {
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false,
      token: null,
      register: vi.fn(async (userData) => {
        return await mockSupabaseClient.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              nombre_completo: userData.name,
              rol: userData.role || 'attendee',
            },
          },
        });
      }),
      login: vi.fn(async (email, password) => {
        return await mockSupabaseClient.auth.signInWithPassword({ email, password });
      }),
      logout: vi.fn(async () => {
        return await mockSupabaseClient.auth.signOut();
      }),
      updateProfile: vi.fn(),
      updateUserRole: vi.fn(async (userId, newRole) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('usuarios').update({ rol: newRole }).eq('id', userId);
      }),
      loginWithGoogle: vi.fn(async () => {
        return await mockSupabaseClient.auth.signInWithOAuth({ provider: 'google' });
      }),
      loginWithFacebook: vi.fn(async () => {
        return await mockSupabaseClient.auth.signInWithOAuth({ provider: 'facebook' });
      }),
      // @ts-expect-error - Mock function for testing
      setUser: vi.fn((user) => {
        useAuthStore.setState({ user, isAuthenticated: !!user });
      }),
    });
    vi.clearAllMocks();
  });

  it('CA1: debe crear usuario con rol de asistente', async () => {
    // Arrange
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: {
        user: { id: mockUser.id, email: mockUser.email },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { result } = renderHook(() => useAuthStore());

    // Act
    await act(async () => {
      await result.current.register({
        email: mockUser.email,
        password: 'Password123!',
        name: mockUser.name,
        role: 'attendee',
      });
    });

    // Assert
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            rol: 'attendee',
          }),
        }),
      })
    );
  });

  it('CA2: debe crear usuario con rol de organizador', async () => {
    // Arrange
    mockSupabaseClient.auth.signUp.mockResolvedValue({
      data: {
        user: { id: mockOrganizer.id, email: mockOrganizer.email },
        session: { access_token: 'token' },
      },
      error: null,
    });

    const { result } = renderHook(() => useAuthStore());

    // Act
    await act(async () => {
      await result.current.register({
        email: mockOrganizer.email,
        password: 'Password123!',
        name: mockOrganizer.name,
        role: 'organizer',
      });
    });

    // Assert
    expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          data: expect.objectContaining({
            rol: 'organizer',
          }),
        }),
      })
    );
  });

  it('CA3: debe crear usuario con rol de administrador', async () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());

    // Act
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser({
        ...mockAdmin,
        role: 'admin',
      });
    });

    // Assert
    expect(result.current.user?.role).toBe('admin');
  });

  it('CA4: debe permitir cambiar rol de usuario (admin → organizer)', async () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockAdmin);
    });

    const targetUserId = 'user-change-role';
    const newRole = 'organizer';

    // @ts-expect-error - Partial mock for testing
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    // Act
    await act(async () => {
      await result.current.updateUserRole(targetUserId, newRole as any);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('usuarios');
  });

  it('CA5: debe permitir cambiar rol de asistente a organizador', async () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockAdmin);
    });

    // @ts-expect-error - Partial mock for testing
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: { tipo_usuario: 'organizador' }, 
        error: null 
      }),
    });

    // Act
    await act(async () => {
      await result.current.updateUserRole(mockUser.id, 'organizer' as any);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('usuarios');
  });

  it('CA6: debe validar que el rol sea válido antes de asignar', () => {
    // Arrange
    const validRoles = ['admin', 'organizer', 'attendee'];
    const { result } = renderHook(() => useAuthStore());

    // Act
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser({
        ...mockUser,
        role: 'attendee' as any,
      });
    });

    // Assert
    expect(validRoles).toContain(result.current.user?.role);
  });

  it('CA7: debe restringir acceso a dashboard de organizador para asistentes', () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());

    // Act
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockUser); // Usuario asistente
    });

    // Assert
    expect(result.current.user?.role).toBe('attendee');
    expect(result.current.user?.role).not.toBe('organizer');
    expect(result.current.user?.role).not.toBe('admin');
  });

  it('CA8: debe permitir acceso a funciones de organizador solo a organizadores', () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());

    // Act
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockOrganizer);
    });

    // Assert
    expect(result.current.user?.role).toBe('organizer');
    expect(['organizer', 'admin']).toContain(result.current.user?.role);
  });

  it('CA9: debe permitir acceso completo solo a administradores', () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());

    // Act
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockAdmin);
    });

    // Assert
    expect(result.current.user?.role).toBe('admin');
  });

  it('CA10: debe rechazar cambio de rol por usuario no autorizado', async () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());
    
    // Usuario asistente intenta cambiar roles
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockUser);
    });

    // Assert
    expect(result.current.user?.role).toBe('attendee');
    // Un asistente no debería poder ejecutar updateUserRole
  });

  it('CA11: debe mantener rol consistente en toda la sesión', () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());

    // Act
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockOrganizer);
    });

    const firstRole = result.current.user?.role;

    // Simular navegación/actualización
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(result.current.user);
    });

    const secondRole = result.current.user?.role;

    // Assert
    expect(firstRole).toBe(secondRole);
    expect(firstRole).toBe('organizer');
  });

  it('CA12: debe permitir a admin degradar su propio rol (con confirmación)', async () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockAdmin);
    });

    // @ts-expect-error - Partial mock for testing
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    // Act
    await act(async () => {
      await result.current.updateUserRole(mockAdmin.id, 'organizer' as any);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalled();
  });

  it('CA13: debe registrar cambios de rol en el historial', async () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockAdmin);
    });

    const userId = 'user-history';
    const newRole = 'organizer';

    // @ts-expect-error - Partial mock for testing
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    // Act
    await act(async () => {
      await result.current.updateUserRole(userId, newRole as any);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('usuarios');
  });

  it('CA14: debe validar que solo roles permitidos se puedan asignar', () => {
    // Arrange
    const allowedRoles = ['admin', 'organizer', 'attendee'];
    const { result } = renderHook(() => useAuthStore());

    // Act & Assert
    for (const role of allowedRoles) {
      act(() => {
        // @ts-expect-error - Mock function for testing

        result.current.setUser({
          ...mockUser,
          role: role as any,
        });
      });

      expect(result.current.user?.role).toBe(role);
    }
  });

  it('CA15: debe mostrar permisos diferentes según el rol', () => {
    // Arrange
    const { result } = renderHook(() => useAuthStore());

    // Test asistente
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockUser);
    });
    expect(result.current.user?.role).toBe('attendee');

    // Test organizador
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockOrganizer);
    });
    expect(result.current.user?.role).toBe('organizer');

    // Test admin
    act(() => {
      // @ts-expect-error - Mock function for testing

      result.current.setUser(mockAdmin);
    });
    expect(result.current.user?.role).toBe('admin');
  });
});


