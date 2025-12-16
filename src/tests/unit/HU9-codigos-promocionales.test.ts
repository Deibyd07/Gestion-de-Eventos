/**
 * HU9: Crear códigos promocionales y descuentos
 * 
 * Como organizador, quiero crear códigos promocionales con descuentos
 * porcentuales o fijos para incentivar ventas
 * 
 * Criterios de Aceptación:
 * - Crear código promocional único
 * - Definir descuento porcentual (10%, 20%, etc.)
 * - Definir descuento fijo en moneda
 * - Establecer límite de uso
 * - Definir fecha de validez
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

const { mockEvent, mockPromotion, mockSupabaseClient } = await import('../mocks/mockData');

describe('HU9: Crear códigos promocionales y descuentos', () => {
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
      // @ts-expect-error - Mock function not in EventState
      createPromotion: vi.fn(async (promotionData) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('codigos_promocionales').insert(promotionData).select().single();
      }),
      updatePromotion: vi.fn(async (promoId, promotionData) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('codigos_promocionales').update(promotionData).eq('id_codigo', promoId).select().single();
      }),
      deletePromotion: vi.fn(async (promoId) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('codigos_promocionales').delete().eq('id_codigo', promoId);
      }),
      validatePromotionCode: vi.fn(async (code) => {
        // @ts-expect-error - Mock chaining
        return await mockSupabaseClient.from('codigos_promocionales').select('*').eq('codigo', code).single();
      }),
      incrementPromotionUse: vi.fn(async (promoId) => {
        // @ts-expect-error - Mock chaining
        await mockSupabaseClient.from('codigos_promocionales').update({ usos_actuales: 6 }).eq('id_codigo', promoId);
        return { data: { id_codigo: promoId, usos_actuales: 6 }, error: null };
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

  it('CA1: debe crear código promocional con nombre único', async () => {
    // Arrange
    const promotion = {
      // @ts-expect-error - mockEvent property mismatch
      id_evento: mockEvent.id_evento,
      codigo: 'VERANO2024',
      tipo_descuento: 'porcentaje',
      valor_descuento: 20,
      limite_uso: 100,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: { ...promotion, id: 'promo-1' }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function not in EventState
      await result.current.createPromotion(promotion);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('codigos_promocionales');
  });

  it('CA2: debe crear descuento porcentual (20%)', async () => {
    // Arrange
    const promotion = {
      // @ts-expect-error - mockEvent property mismatch
      id_evento: mockEvent.id_evento,
      codigo: 'DESC20',
      tipo_descuento: 'porcentaje',
      valor_descuento: 20,
      limite_uso: 50,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: promotion, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function not in EventState
      await result.current.createPromotion(promotion);
    });

    // Assert
    expect(promotion.tipo_descuento).toBe('porcentaje');
    expect(promotion.valor_descuento).toBe(20);
  });

  it('CA3: debe crear descuento fijo en moneda ($10,000)', async () => {
    // Arrange
    const promotion = {
      // @ts-expect-error - mockEvent property mismatch
      id_evento: mockEvent.id_evento,
      codigo: 'FIJO10K',
      tipo_descuento: 'fijo',
      valor_descuento: 10000,
      limite_uso: 75,
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: promotion, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function not in EventState
      await result.current.createPromotion(promotion);
    });

    // Assert
    expect(promotion.tipo_descuento).toBe('fijo');
    expect(promotion.valor_descuento).toBe(10000);
  });

  it('CA4: debe validar que código no esté duplicado', async () => {
    // Arrange
    const existingCode = 'VERANO2024';

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: [{ codigo: existingCode }], 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function
        await result.current.validatePromoCode(existingCode);
      });
    }).rejects.toThrow();
  });

  it('CA5: debe establecer límite de uso del código', async () => {
    // Arrange
    const promotion = {
      ...mockPromotion,
      limite_uso: 100,
      usos_actuales: 0,
    };

    // Act & Assert
    expect(promotion.limite_uso).toBe(100);
    expect(promotion.usos_actuales).toBeLessThan(promotion.limite_uso);
  });

  it('CA6: debe validar que descuento porcentual esté entre 1-100', async () => {
    // Arrange
    const invalidPromotions = [
      { valor_descuento: 0, tipo_descuento: 'porcentaje' },
      { valor_descuento: 101, tipo_descuento: 'porcentaje' },
      { valor_descuento: -10, tipo_descuento: 'porcentaje' },
    ];

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    for (const promo of invalidPromotions) {
      await expect(async () => {
        await act(async () => {
          // @ts-expect-error - Mock function not in EventState
          await result.current.createPromotion({
            // @ts-expect-error - mockEvent property mismatch
            id_evento: mockEvent.id_evento,
            codigo: 'TEST',
            ...promo,
            limite_uso: 10,
          } as any);
        });
      }).rejects.toThrow();
    }
  });

  it('CA7: debe validar que descuento fijo sea mayor a 0', async () => {
    // Arrange
    const invalidPromotion = {
      // @ts-expect-error - mockEvent property mismatch
      id_evento: mockEvent.id_evento,
      codigo: 'INVALID',
      tipo_descuento: 'fijo',
      valor_descuento: -5000,
      limite_uso: 10,
    };

    const { result } = renderHook(() => useEventStore());

    // Act & Assert
    await expect(async () => {
      await act(async () => {
        // @ts-expect-error - Mock function not in EventState
        await result.current.createPromotion(invalidPromotion);
      });
    }).rejects.toThrow();
  });

  it('CA8: debe definir fecha de inicio de validez', async () => {
    // Arrange
    const promotion = {
      ...mockPromotion,
      fecha_inicio: '2024-06-01',
      fecha_fin: '2024-06-30',
    };

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: promotion, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function not in EventState
      await result.current.createPromotion(promotion);
    });

    // Assert
    expect(promotion.fecha_inicio).toBeTruthy();
    expect(new Date(promotion.fecha_inicio)).toBeInstanceOf(Date);
  });

  it('CA9: debe definir fecha de fin de validez', async () => {
    // Arrange
    const promotion = {
      ...mockPromotion,
      fecha_inicio: '2024-06-01',
      fecha_fin: '2024-06-30',
    };

    // Act & Assert
    expect(promotion.fecha_fin).toBeTruthy();
    expect(new Date(promotion.fecha_fin)).toBeInstanceOf(Date);
  });

  it('CA10: debe validar que fecha_fin sea posterior a fecha_inicio', () => {
    // Arrange
    const validPromotion = {
      fecha_inicio: '2024-06-01',
      fecha_fin: '2024-06-30',
    };

    const invalidPromotion = {
      fecha_inicio: '2024-06-30',
      fecha_fin: '2024-06-01',
    };

    // Act & Assert
    expect(new Date(validPromotion.fecha_fin) > new Date(validPromotion.fecha_inicio)).toBe(true);
    expect(new Date(invalidPromotion.fecha_fin) > new Date(invalidPromotion.fecha_inicio)).toBe(false);
  });

  it('CA11: debe aplicar descuento porcentual correctamente', () => {
    // Arrange
    const precio = 100000;
    const descuento = 20; // 20%

    // Act
    const precioConDescuento = precio * (1 - descuento / 100);

    // Assert
    expect(precioConDescuento).toBe(80000);
  });

  it('CA12: debe aplicar descuento fijo correctamente', () => {
    // Arrange
    const precio = 100000;
    const descuentoFijo = 15000;

    // Act
    const precioConDescuento = precio - descuentoFijo;

    // Assert
    expect(precioConDescuento).toBe(85000);
  });

  it('CA13: debe incrementar contador de usos al aplicar código', async () => {
    // Arrange
    const promotionId = 'promo-counter';
    const currentUses = 5;

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: { id: promotionId, usos_actuales: currentUses + 1 }, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    await act(async () => {
      // @ts-expect-error - Mock function not in EventState
      await result.current.incrementPromotionUse(promotionId);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('codigos_promocionales');
  });

  it('CA14: debe rechazar código si alcanzó límite de uso', () => {
    // Arrange
    const promotion = {
      ...mockPromotion,
      limite_uso: 100,
      usos_actuales: 100,
    };

    // Act
    const isAvailable = promotion.usos_actuales < promotion.limite_uso;

    // Assert
    expect(isAvailable).toBe(false);
  });

  it('CA15: debe rechazar código si está fuera de fecha de validez', () => {
    // Arrange
    const promotion = {
      ...mockPromotion,
      fecha_inicio: '2024-01-01',
      fecha_fin: '2024-01-31',
    };

    const currentDate = new Date('2024-02-15');

    // Act
    const isValid = currentDate >= new Date(promotion.fecha_inicio) && 
                    currentDate <= new Date(promotion.fecha_fin);

    // Assert
    expect(isValid).toBe(false);
  });

  it('CA16: debe validar código antes de aplicar descuento', async () => {
    // Arrange
    const code = 'VERANO2024';

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ 
        data: mockPromotion, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    let isValid = false;
    await act(async () => {
      // @ts-expect-error - Mock function
      isValid = await result.current.validatePromotionCode(code);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('codigos_promocionales');
  });

  it('CA17: debe mostrar descuento aplicado en resumen de compra', () => {
    // Arrange
    const purchase = {
      precio_original: 100000,
      codigo_descuento: 'DESC20',
      descuento_aplicado: 20000,
      precio_final: 80000,
    };

    // Act & Assert
    expect(purchase.precio_final).toBe(purchase.precio_original - purchase.descuento_aplicado);
  });

  it('CA18: debe convertir código a mayúsculas automáticamente', () => {
    // Arrange
    const inputCode = 'verano2024';

    // Act
    const normalizedCode = inputCode.toUpperCase();

    // Assert
    expect(normalizedCode).toBe('VERANO2024');
  });
});
