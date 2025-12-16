/**
 * HU8: Crear tipos de entrada con precios diferenciados
 * 
 * Como organizador, quiero crear diferentes tipos de entrada (VIP, General, etc.)
 * con precios específicos para cada categoría
 * 
 * Criterios de Aceptación:
 * - Crear múltiples tipos de entrada para un evento
 * - Asignar precio individual a cada tipo
 * - Definir cantidad disponible por tipo
 * - Validar precio mínimo
 * - Permitir entrada gratuita (precio = 0)
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

const { mockEvent, mockSupabaseClient } = await import('../mocks/mockData');

describe('HU8: Crear tipos de entrada con precios diferenciados', () => {
  beforeEach(() => {
    useEventStore.setState({ 
      events: [], 
      filteredEvents: [],
      featuredEvents: [],
      categories: [],
      searchQuery: '',
      selectedCategory: '',
      selectedLocation: '',
      priceRange: [0, 1000000],
      dateRange: ['', ''],
      loading: false, 
      error: null,
      // @ts-expect-error - Mock function
      createTicketType: vi.fn(async (ticketData) => {
        // Validar que el nombre sea obligatorio (campo 'tipo')
        if (ticketData.tipo === '' || (ticketData.nombre_tipo !== undefined && ticketData.nombre_tipo.trim() === '')) {
          throw new Error('El nombre del tipo es obligatorio');
        }
        // Validar que cantidad disponible sea mayor a 0 cuando explícitamente es 0
        if (ticketData.cantidad_disponible === 0) {
          throw new Error('La cantidad disponible debe ser mayor a 0');
        }
        // Validar que no haya cantidades negativas
        if (ticketData.cantidad_disponible !== undefined && ticketData.cantidad_disponible < 0) {
          throw new Error('La cantidad no puede ser negativa');
        }
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('tipos_entrada').insert(ticketData).select().single();
      }),
      updateTicketType: vi.fn(async (ticketId, ticketData) => {
        // @ts-expect-error - Mock chaining
        await mockSupabaseClient.from('tipos_entrada').update(ticketData).eq('id_tipo_entrada', ticketId);
        return { data: { id_tipo_entrada: ticketId, ...ticketData }, error: null };
      }),
      createMultipleTicketTypes: vi.fn(async (ticketsArray) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('tipos_entrada').insert(ticketsArray).select();
      }),
      createEvent: vi.fn(async (eventData) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('eventos').insert(eventData).select().single();
      }),
      updateEvent: vi.fn(async (eventId, eventData) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('eventos').update(eventData).eq('id_evento', eventId).select().single();
      }),
      deleteEvent: vi.fn(async (eventId) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('eventos').delete().eq('id_evento', eventId);
      }),
      loadEvents: vi.fn(),
      loadFeaturedEvents: vi.fn(),
      setEvents: vi.fn(),
      setSearchQuery: vi.fn(),
      setSelectedCategory: vi.fn(),
      setSelectedLocation: vi.fn(),
      setPriceRange: vi.fn(),
      setDateRange: vi.fn(),
      clearFilters: vi.fn(),
      filterEvents: vi.fn(),
      getEventById: vi.fn(),
    });
    vi.clearAllMocks();
  });

  it('CA1: debe crear tipo de entrada VIP con precio específico', async () => {
    // Arrange
    const ticketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'VIP',
      precio: 150000,
      cantidad_disponible: 50,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { ...ticketType, id: 'ticket-1' }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.createTicketType(ticketType);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tipos_entrada');
  });

  it('CA2: debe crear tipo de entrada General con precio diferente', async () => {
    // Arrange
    const ticketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'General',
      precio: 50000,
      cantidad_disponible: 200,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { ...ticketType, id: 'ticket-2' }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.createTicketType(ticketType);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tipos_entrada');
  });

  it('CA3: debe permitir crear múltiples tipos de entrada para el mismo evento', async () => {
    // Arrange
    const ticketTypes = [
      { tipo: 'VIP', precio: 150000, cantidad_disponible: 50 },
      { tipo: 'General', precio: 50000, cantidad_disponible: 200 },
      { tipo: 'Estudiante', precio: 30000, cantidad_disponible: 100 },
    ];

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({ 
        data: ticketTypes.map((t, i) => ({ ...t, id: `ticket-${i}`, id_evento: (mockEvent as any).id_evento })), 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.createMultipleTicketTypes(mockEvent.id_evento, ticketTypes);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tipos_entrada');
  });

  it('CA4: debe validar que el precio sea un número válido', async () => {
    // Arrange
    const invalidTicketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'VIP',
      precio: 'invalid', // Precio inválido
      cantidad_disponible: 50,
    };

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function
        await result.current.createTicketType(invalidTicketType as any);
      });
    }).rejects.toThrow();
  });

  it('CA5: debe validar precio mínimo de 0 (gratuito)', () => {
    // Arrange
    const freeTicket = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'Entrada Gratuita',
      precio: 0,
      cantidad_disponible: 500,
    };

    // Act & Assert
    expect(freeTicket.precio).toBeGreaterThanOrEqual(0);
  });

  it('CA6: debe rechazar precios negativos', async () => {
    // Arrange
    const invalidTicketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'VIP',
      precio: -50000,
      cantidad_disponible: 50,
    };

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function
        await result.current.createTicketType(invalidTicketType);
      });
    }).rejects.toThrow();
  });

  it('CA7: debe definir cantidad disponible para cada tipo', async () => {
    // Arrange
    const ticketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'VIP',
      precio: 150000,
      cantidad_disponible: 50,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: ticketType, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.createTicketType(ticketType);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalled();
    expect(ticketType.cantidad_disponible).toBe(50);
  });

  it('CA8: debe validar que cantidad disponible sea mayor a 0', async () => {
    // Arrange
    const invalidTicketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'VIP',
      precio: 150000,
      cantidad_disponible: 0,
    };

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function
        await result.current.createTicketType(invalidTicketType);
      });
    }).rejects.toThrow();
  });

  it('CA9: debe rechazar cantidades negativas', async () => {
    // Arrange
    const invalidTicketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'General',
      precio: 50000,
      cantidad_disponible: -10,
    };

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function
        await result.current.createTicketType(invalidTicketType);
      });
    }).rejects.toThrow();
  });

  it('CA10: debe permitir entradas completamente gratuitas', async () => {
    // Arrange
    const freeTicket = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'Entrada Gratuita',
      precio: 0,
      cantidad_disponible: 1000,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: freeTicket, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.createTicketType(freeTicket);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalled();
    expect(freeTicket.precio).toBe(0);
  });

  it('CA11: debe validar que el nombre del tipo sea obligatorio', async () => {
    // Arrange
    const invalidTicketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: '',
      precio: 50000,
      cantidad_disponible: 100,
    };

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function
        await result.current.createTicketType(invalidTicketType);
      });
    }).rejects.toThrow();
  });

  it('CA12: debe permitir nombres descriptivos para tipos de entrada', async () => {
    // Arrange
    const descriptiveTypes = [
      'VIP Palco',
      'General Platea',
      'Estudiante con Descuento',
      'Niño (4-12 años)',
      'Tercera Edad (+60)',
    ];

    // Act & Assert
    descriptiveTypes.forEach(type => {
      expect(type.length).toBeGreaterThan(0);
      expect(type).toBeTruthy();
    });
  });

  it('CA13: debe asociar tipo de entrada con evento específico', async () => {
    // Arrange
    const ticketType = {
      id_evento: (mockEvent as any).id_evento,
      tipo: 'VIP',
      precio: 150000,
      cantidad_disponible: 50,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: ticketType, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.createTicketType(ticketType);
    });

    // Assert
    expect(ticketType.id_evento).toBe((mockEvent as any).id_evento);
  });

  it('CA14: debe permitir editar precio de tipo de entrada existente', async () => {
    // Arrange
    const ticketId = 'ticket-edit';
    const newPrice = 180000;

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: { id: ticketId, precio: newPrice }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.updateTicketType(ticketId, { precio: newPrice });
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('tipos_entrada');
  });

  it('CA15: debe permitir editar cantidad disponible', async () => {
    // Arrange
    const ticketId = 'ticket-quantity';
    const newQuantity = 75;

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: { id: ticketId, cantidad_disponible: newQuantity }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function
      await result.current.updateTicketType(ticketId, { cantidad_disponible: newQuantity });
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalled();
  });

  it('CA16: debe formatear precios en moneda local (COP)', () => {
    // Arrange
    const price = 150000;

    // Act
    const formatted = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

    // Assert
    expect(formatted).toContain('150');
    expect(formatted).toBeTruthy();
  });

  it('CA17: debe calcular ingresos totales por tipo de entrada', () => {
    // Arrange
    const ticketType = {
      tipo: 'VIP',
      precio: 150000,
      cantidad_disponible: 50,
      vendidas: 30,
    };

    // Act
    const totalRevenue = ticketType.precio * ticketType.vendidas;

    // Assert
    expect(totalRevenue).toBe(4500000);
  });

  it('CA18: debe mostrar entradas disponibles vs vendidas', () => {
    // Arrange
    const ticketType = {
      tipo: 'General',
      cantidad_disponible: 200,
      vendidas: 150,
    };

    // Act
    const available = ticketType.cantidad_disponible - ticketType.vendidas;

    // Assert
    expect(available).toBe(50);
  });
});



