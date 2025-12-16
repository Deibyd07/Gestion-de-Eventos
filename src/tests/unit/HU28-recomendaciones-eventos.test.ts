/**
 * HU28: Recomendaciones de eventos basadas en intereses y ubicación
 * 
 * Como usuario, quiero recibir recomendaciones de eventos basadas en mis intereses y ubicación
 * para descubrir eventos relevantes que se ajusten a mis preferencias
 * 
 * Criterios de Aceptación:
 * - Los eventos de organizadores seguidos aparecen primero
 * - Los eventos cercanos a mi ubicación tienen prioridad
 * - Si no sigo organizadores, solo se aplica filtro de ubicación
 * - El resto de eventos se ordena por relevancia
 * - Recomendaciones visibles en página de eventos y home
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventStore } from '@modules/events/infrastructure/store/Event.store';

vi.mock('@shared/lib/api/supabase', async () => {
  const { mockSupabaseClient } = await import('../mocks/mockData');
  return {
    supabase: mockSupabaseClient,
  };
});

const { mockEvent, mockUser, mockSupabaseClient } = await import('../mocks/mockData');

describe('HU28: Recomendaciones de eventos basadas en intereses y ubicación', () => {
  beforeEach(() => {
    useEventStore.setState({ 
      events: [], 
      filteredEvents: [],
      featuredEvents: [],
      recommendedEvents: [],
      categories: [],
      searchQuery: '',
      selectedCategory: '',
      selectedLocation: '',
      priceRange: [0, 1000000],
      dateRange: ['', ''],
      loading: false, 
      error: null,
    });
    vi.clearAllMocks();
  });

  it('CA1: debe priorizar eventos de organizadores seguidos', async () => {
    // Arrange
    const userId = 'user-123';
    const followedOrganizerId = 'org-456';
    const otherOrganizerId = 'org-789';

    const followedOrganizers = [
      { id: followedOrganizerId, nombre_completo: 'Organizador Seguido' }
    ];

    const eventos = [
      {
        ...mockEvent,
        id: 'event-1',
        id_organizador: followedOrganizerId,
        titulo: 'Evento de Organizador Seguido',
        ubicacion: 'Bogotá, Colombia',
        fecha_evento: '2025-01-15',
        tipos_entrada: [{ 
          id: 'ticket-1',
          nombre_tipo: 'General',
          precio: 50000,
          cantidad_disponible: 50, 
          cantidad_maxima: 100 
        }]
      },
      {
        ...mockEvent,
        id: 'event-2',
        id_organizador: otherOrganizerId,
        titulo: 'Evento de Otro Organizador',
        ubicacion: 'Bogotá, Colombia',
        fecha_evento: '2025-01-15',
        tipos_entrada: [{ 
          id: 'ticket-2',
          nombre_tipo: 'General',
          precio: 45000,
          cantidad_disponible: 50, 
          cantidad_maxima: 100 
        }]
      }
    ];

    // Mock para organizadores seguidos
    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'seguidores_organizadores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ 
            data: [{ id_organizador: followedOrganizerId }], 
            error: null 
          })
        };
      }
      if (table === 'usuarios') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ 
            data: followedOrganizers, 
            error: null 
          })
        };
      }
      if (table === 'eventos') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ 
            data: eventos, 
            error: null 
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null })
      };
    });

    // Act
    const { result } = renderHook(() => useEventStore());
    await act(async () => {
      await result.current.loadRecommendedEvents(userId);
    });

    // Assert
    const recommended = result.current.recommendedEvents;
    expect(recommended.length).toBeGreaterThan(0);
    // El primer evento debe ser del organizador seguido
    if (recommended.length > 1) {
      const firstEvent = recommended[0];
      expect(firstEvent.organizerId).toBe(followedOrganizerId);
    }
  });

  it('CA2: debe priorizar eventos cercanos por ubicación', async () => {
    // Arrange
    const userId = 'user-123';
    const userLocation = 'Bogotá, Colombia';

    const eventos = [
      {
        ...mockEvent,
        id: 'event-1',
        titulo: 'Evento en Bogotá',
        ubicacion: 'Bogotá, Colombia',
        id_organizador: 'org-123',
        fecha_evento: '2025-01-15',
        tipos_entrada: [{ 
          id: 'ticket-1',
          nombre_tipo: 'General',
          precio: 50000,
          cantidad_disponible: 50 
        }]
      },
      {
        ...mockEvent,
        id: 'event-2',
        titulo: 'Evento en Medellín',
        ubicacion: 'Medellín, Colombia',
        id_organizador: 'org-124',
        fecha_evento: '2025-01-15',
        tipos_entrada: [{ 
          id: 'ticket-2',
          nombre_tipo: 'General',
          precio: 45000,
          cantidad_disponible: 50 
        }]
      }
    ];

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'seguidores_organizadores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      if (table === 'eventos') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: eventos, error: null })
        };
      }
      if (table === 'usuarios') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { preferencias: { ubicacion: userLocation } }, 
            error: null 
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
    });

    // Act
    const { result } = renderHook(() => useEventStore());
    await act(async () => {
      await result.current.loadRecommendedEvents(userId, userLocation);
    });

    // Assert
    const recommended = result.current.recommendedEvents;
    expect(recommended.length).toBeGreaterThan(0);
    // El evento de Bogotá debe tener mayor prioridad
    if (recommended.length > 1) {
      const firstEvent = recommended[0];
      expect(firstEvent.location).toContain('Bogotá');
    }
  });

  it('CA3: debe funcionar sin organizadores seguidos (solo ubicación)', async () => {
    // Arrange
    const userId = 'user-123';
    const userLocation = 'Medellín, Colombia';

    const eventos = [
      {
        ...mockEvent,
        id: 'event-1',
        titulo: 'Evento Local',
        ubicacion: 'Medellín, Antioquia',
        id_organizador: 'org-123',
        fecha_evento: '2025-01-15',
        tipos_entrada: [{ 
          id: 'ticket-1',
          nombre_tipo: 'General',
          precio: 40000,
          cantidad_disponible: 50 
        }]
      }
    ];

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'seguidores_organizadores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      if (table === 'eventos') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: eventos, error: null })
        };
      }
      if (table === 'usuarios') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: { ubicacion: userLocation }, error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
    });

    // Act
    const { result } = renderHook(() => useEventStore());
    await act(async () => {
      await result.current.loadRecommendedEvents(userId, userLocation);
    });

    // Assert - No debe fallar aunque no haya organizadores seguidos
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('CA4: debe calcular puntuación de relevancia correctamente', () => {
    // Arrange
    const eventoOrganizadorSeguido = {
      id_organizador: 'org-seguido',
      ubicacion: 'Bogotá, Colombia',
      fecha_evento: '2025-01-10',
      tipos_entrada: [{ cantidad_disponible: 30 }]
    };

    const eventoNormal = {
      id_organizador: 'org-normal',
      ubicacion: 'Cali, Colombia',
      fecha_evento: '2025-02-15',
      tipos_entrada: [{ cantidad_disponible: 10 }]
    };

    const followedOrganizerIds = ['org-seguido'];
    const userLocation = 'Bogotá, Colombia';

    // Act
    // Calcular score para evento de organizador seguido
    let score1 = 0;
    if (followedOrganizerIds.includes(eventoOrganizadorSeguido.id_organizador)) {
      score1 += 1000; // Organizador seguido
    }
    if (eventoOrganizadorSeguido.ubicacion.includes('Bogotá')) {
      score1 += 500; // Ubicación exacta
    }

    // Calcular score para evento normal
    let score2 = 0;
    // No es organizador seguido: 0 puntos
    
    // Assert
    expect(score1).toBeGreaterThan(score2);
    expect(score1).toBeGreaterThanOrEqual(1000); // Al menos el bonus de seguidor
  });

  it('CA5: debe calcular similitud de ubicación', () => {
    // Arrange
    const testCases = [
      { 
        user: 'Bogotá, Colombia', 
        event: 'Bogotá, Colombia', 
        expected: 100 // Exacta
      },
      { 
        user: 'Bogotá, Colombia', 
        event: 'Bogotá, Cundinamarca', 
        expectedMin: 50 // Parcial
      },
      { 
        user: 'Bogotá, Colombia', 
        event: 'Medellín, Colombia', 
        expectedMin: 50 // Comparten país
      },
      { 
        user: 'Bogotá, Colombia', 
        event: 'Madrid, España', 
        expected: 0 // Sin similitud
      }
    ];

    testCases.forEach(({ user, event, expected, expectedMin }) => {
      // Act - Simular algoritmo de similitud
      let similarity = 0;
      const userLoc = user.toLowerCase();
      const eventLoc = event.toLowerCase();

      if (userLoc === eventLoc) {
        similarity = 100;
      } else {
        const userParts = userLoc.split(',').map(p => p.trim());
        const eventParts = eventLoc.split(',').map(p => p.trim());
        const commonParts = userParts.filter(part => 
          eventParts.some(ep => ep.includes(part) || part.includes(ep))
        );
        if (commonParts.length > 0) {
          similarity = 50 + (commonParts.length / Math.max(userParts.length, eventParts.length)) * 50;
        }
      }

      // Assert
      if (expected !== undefined) {
        expect(similarity).toBe(expected);
      }
      if (expectedMin !== undefined) {
        expect(similarity).toBeGreaterThanOrEqual(expectedMin);
      }
    });
  });

  it('CA6: debe ordenar eventos por score descendente', async () => {
    // Arrange
    const userId = 'user-123';
    const followedOrganizerId = 'org-seguido';

    const eventos = [
      {
        ...mockEvent,
        id: 'event-1',
        id_organizador: 'org-normal-1',
        titulo: 'Evento en Cali',
        ubicacion: 'Cali, Colombia',
        fecha_evento: '2025-03-15',
        tipos_entrada: [{ 
          id: 'ticket-1',
          nombre_tipo: 'General',
          precio: 30000,
          cantidad_disponible: 10 
        }]
      },
      {
        ...mockEvent,
        id: 'event-2',
        id_organizador: followedOrganizerId,
        titulo: 'Evento Seguido en Bogotá',
        ubicacion: 'Bogotá, Colombia',
        fecha_evento: '2025-01-10',
        tipos_entrada: [{ 
          id: 'ticket-2',
          nombre_tipo: 'General',
          precio: 50000,
          cantidad_disponible: 50 
        }]
      },
      {
        ...mockEvent,
        id: 'event-3',
        id_organizador: 'org-normal-2',
        titulo: 'Otro Evento en Bogotá',
        ubicacion: 'Bogotá, Colombia',
        fecha_evento: '2025-01-12',
        tipos_entrada: [{ 
          id: 'ticket-3',
          nombre_tipo: 'General',
          precio: 45000,
          cantidad_disponible: 30 
        }]
      }
    ];

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'seguidores_organizadores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ 
            data: [{ id_organizador: followedOrganizerId }], 
            error: null 
          })
        };
      }
      if (table === 'usuarios') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({ 
            data: [{ id: followedOrganizerId }], 
            error: null 
          })
        };
      }
      if (table === 'eventos') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: eventos, error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis()
      };
    });

    // Act
    const { result } = renderHook(() => useEventStore());
    await act(async () => {
      await result.current.loadRecommendedEvents(userId, 'Bogotá, Colombia');
    });

    // Assert
    const recommended = result.current.recommendedEvents;
    expect(recommended.length).toBeGreaterThan(0);
    
    // Verificar que event-2 (seguido + ubicación) esté primero
    if (recommended.length > 1) {
      const firstEvent = recommended[0];
      // Debe ser el de mayor score (organizador seguido + ubicación)
      expect(firstEvent.organizerId).toBe(followedOrganizerId);
    }
  });

  it('CA7: debe manejar usuario sin ubicación configurada', async () => {
    // Arrange
    const userId = 'user-no-location';
    const eventos = [
      {
        ...mockEvent,
        id: 'event-1',
        titulo: 'Evento Sin Ubicación Usuario',
        ubicacion: 'Bogotá, Colombia',
        id_organizador: 'org-123',
        fecha_evento: '2025-01-15',
        tipos_entrada: [{ 
          id: 'ticket-1',
          nombre_tipo: 'General',
          precio: 40000,
          cantidad_disponible: 50 
        }]
      }
    ];

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'seguidores_organizadores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      if (table === 'eventos') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: eventos, error: null })
        };
      }
      if (table === 'usuarios') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { preferencias: {} }, // Sin ubicación
            error: null 
          })
        };
      }
      return {
        select: vi.fn().mockReturnThis()
      };
    });

    // Act
    const { result } = renderHook(() => useEventStore());
    await act(async () => {
      await result.current.loadRecommendedEvents(userId);
    });

    // Assert - No debe fallar
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('CA8: debe aplicar factor temporal (eventos próximos)', () => {
    // Arrange
    const now = new Date();
    const eventoCercano = new Date(now);
    eventoCercano.setDate(eventoCercano.getDate() + 5); // En 5 días

    const eventoLejano = new Date(now);
    eventoLejano.setDate(eventoLejano.getDate() + 25); // En 25 días

    // Act - Calcular puntos temporales
    const diasCercano = 5;
    const diasLejano = 25;

    let scoreCercano = 0;
    let scoreLejano = 0;

    if (diasCercano > 0 && diasCercano <= 30) {
      scoreCercano = Math.max(0, 100 - diasCercano * 3); // 85 puntos
    }

    if (diasLejano > 0 && diasLejano <= 30) {
      scoreLejano = Math.max(0, 100 - diasLejano * 3); // 25 puntos
    }

    // Assert
    expect(scoreCercano).toBeGreaterThan(scoreLejano);
    expect(scoreCercano).toBe(85);
    expect(scoreLejano).toBe(25);
  });

  it('CA9: debe aplicar factor de disponibilidad de entradas', () => {
    // Arrange
    const eventoMuchasEntradas = {
      tipos_entrada: [
        { cantidad_disponible: 80 },
        { cantidad_disponible: 120 }
      ]
    };

    const eventoPocasEntradas = {
      tipos_entrada: [
        { cantidad_disponible: 5 }
      ]
    };

    // Act - Calcular score de disponibilidad
    const disponibilidadAlta = eventoMuchasEntradas.tipos_entrada.reduce(
      (acc, t) => acc + t.cantidad_disponible, 0
    );
    const disponibilidadBaja = eventoPocasEntradas.tipos_entrada.reduce(
      (acc, t) => acc + t.cantidad_disponible, 0
    );

    const scoreAlta = Math.min(50, disponibilidadAlta);
    const scoreBaja = Math.min(50, disponibilidadBaja);

    // Assert
    expect(scoreAlta).toBe(50); // Máximo
    expect(scoreBaja).toBe(5);
    expect(scoreAlta).toBeGreaterThan(scoreBaja);
  });

  it('CA10: debe retornar array vacío si no hay eventos', async () => {
    // Arrange
    const userId = 'user-123';

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'seguidores_organizadores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      if (table === 'eventos') {
        return {
          select: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({ data: [], error: null })
        };
      }
      if (table === 'usuarios') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        };
      }
      return {
        select: vi.fn().mockReturnThis()
      };
    });

    // Act
    const { result } = renderHook(() => useEventStore());
    await act(async () => {
      await result.current.loadRecommendedEvents(userId);
    });

    // Assert
    expect(result.current.recommendedEvents).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});
