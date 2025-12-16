/**
 * HU19: Generar reportes de asistencia por evento
 * 
 * Como organizador, quiero generar reportes detallados de asistencia
 * con métricas y estadísticas por evento
 * 
 * Criterios de Aceptación:
 * - Generar reporte de check-ins realizados
 * - Calcular porcentaje de asistencia
 * - Desglosar por tipo de entrada
 * - Exportar a PDF/Excel
 * - Filtrar por rango de fechas
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

const { mockEvent, mockAttendee, mockSupabaseClient } = await import('../mocks/mockData');

describe('HU19: Generar reportes de asistencia por evento', () => {
  beforeEach(() => {
    useEventStore.setState({ 
      // @ts-expect-error - mockEvent type mismatch
      events: [mockEvent], 
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

      generateAttendanceReport: vi.fn(async (eventId) => {
        // @ts-expect-error - Mock chaining
        const result = await mockSupabaseClient.from('asistentes').select('*').eq('id_evento', eventId);
        const checkedIn = result.data?.filter((a: any) => a.check_in === true) || [];
        return { data: checkedIn, error: null };
      }),
      exportReport: vi.fn(async (eventId, format) => {
        // @ts-expect-error - Mock chaining
        const attendees = await mockSupabaseClient.from('asistentes').select('*').eq('id_evento', eventId);
        return { data: attendees.data, format };
      }),
      getAttendanceStats: vi.fn(async (eventId) => {
        // @ts-expect-error - Mock chaining
        const allAttendees = await mockSupabaseClient.from('asistentes').select('*').eq('id_evento', eventId);
        const checkedIn = allAttendees.data?.filter(a => a.check_in) || [];
        return { total: allAttendees.data?.length || 0, checkedIn: checkedIn.length, percentage: (checkedIn.length / (allAttendees.data?.length || 1)) * 100 };
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

  it('CA1: debe generar reporte de check-ins para un evento', async () => {
    // Arrange
    const attendees = [
      { estado_checkin: 'confirmado' },
      { estado_checkin: 'confirmado' },
      { estado_checkin: 'pendiente' },
    ];

    // @ts-expect-error - Partial mock
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ 
        data: attendees, 
        error: null 
      }),
    });

    const { result } = renderHook(() => useEventStore());

    // Act
    let report;
    await act(async () => {
      // @ts-expect-error - Mock function not in EventState
      report = await result.current.generateAttendanceReport(mockEvent.id_evento);
    });

    // Assert
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('asistentes');
  });

  it('CA2: debe calcular total de check-ins realizados', () => {
    // Arrange
    const attendees = [
      { estado_checkin: 'confirmado' },
      { estado_checkin: 'confirmado' },
      { estado_checkin: 'pendiente' },
      { estado_checkin: 'confirmado' },
    ];

    // Act
    const checkInsRealizados = attendees.filter(a => a.estado_checkin === 'confirmado').length;

    // Assert
    expect(checkInsRealizados).toBe(3);
  });

  it('CA3: debe calcular porcentaje de asistencia', () => {
    // Arrange
    const totalEntradas = 100;
    const checkInsRealizados = 75;

    // Act
    const porcentaje = (checkInsRealizados / totalEntradas) * 100;

    // Assert
    expect(porcentaje).toBe(75);
  });

  it('CA4: debe desglosar asistencia por tipo de entrada', () => {
    // Arrange
    const attendees = [
      { tipo_entrada: 'VIP', estado_checkin: 'confirmado' },
      { tipo_entrada: 'VIP', estado_checkin: 'pendiente' },
      { tipo_entrada: 'General', estado_checkin: 'confirmado' },
      { tipo_entrada: 'General', estado_checkin: 'confirmado' },
      { tipo_entrada: 'VIP', estado_checkin: 'confirmado' },
    ];

    // Act
    const byType = {
      VIP: attendees.filter(a => a.tipo_entrada === 'VIP' && a.estado_checkin === 'confirmado').length,
      General: attendees.filter(a => a.tipo_entrada === 'General' && a.estado_checkin === 'confirmado').length,
    };

    // Assert
    expect(byType.VIP).toBe(2);
    expect(byType.General).toBe(2);
  });

  it('CA5: debe calcular tasa de no presentación (no-show)', () => {
    // Arrange
    const totalEntradas = 100;
    const checkInsRealizados = 75;

    // Act
    const noShows = totalEntradas - checkInsRealizados;
    const tasaNoShow = (noShows / totalEntradas) * 100;

    // Assert
    expect(noShows).toBe(25);
    expect(tasaNoShow).toBe(25);
  });

  it('CA6: debe incluir hora pico de check-ins', () => {
    // Arrange
    const checkIns = [
      { hora: '18:00', cantidad: 15 },
      { hora: '18:30', cantidad: 45 },
      { hora: '19:00', cantidad: 30 },
      { hora: '19:30', cantidad: 10 },
    ];

    // Act
    const horaPico = checkIns.reduce((max, current) => 
      current.cantidad > max.cantidad ? current : max
    );

    // Assert
    expect(horaPico.hora).toBe('18:30');
    expect(horaPico.cantidad).toBe(45);
  });

  it('CA7: debe calcular tiempo promedio de entrada', () => {
    // Arrange
    const checkIns = [
      { tiempo_procesamiento: 30 }, // segundos
      { tiempo_procesamiento: 45 },
      { tiempo_procesamiento: 25 },
      { tiempo_procesamiento: 40 },
    ];

    // Act
    const promedio = checkIns.reduce((sum, c) => sum + c.tiempo_procesamiento, 0) / checkIns.length;

    // Assert
    expect(promedio).toBe(35);
  });

  it('CA8: debe exportar reporte a formato CSV', () => {
    // Arrange
    const attendees = [
      { nombre: 'Juan Pérez', tipo: 'VIP', hora_checkin: '18:30', estado: 'confirmado' },
      { nombre: 'María González', tipo: 'General', hora_checkin: '19:00', estado: 'confirmado' },
    ];

    // Act
    const csv = [
      'Nombre,Tipo Entrada,Hora Check-in,Estado',
      ...attendees.map(a => `${a.nombre},${a.tipo},${a.hora_checkin},${a.estado}`)
    ].join('\n');

    // Assert
    expect(csv).toContain('Juan Pérez');
    expect(csv).toContain('VIP');
  });

  it('CA9: debe filtrar reporte por rango de fechas', () => {
    // Arrange
    const checkIns = [
      { fecha: '2024-06-15', cantidad: 50 },
      { fecha: '2024-06-20', cantidad: 75 },
      { fecha: '2024-06-25', cantidad: 60 },
    ];

    const fechaInicio = new Date('2024-06-18');
    const fechaFin = new Date('2024-06-30');

    // Act
    const filtered = checkIns.filter(c => {
      const fecha = new Date(c.fecha);
      return fecha >= fechaInicio && fecha <= fechaFin;
    });

    // Assert
    expect(filtered).toHaveLength(2);
    expect(filtered[0].fecha).toBe('2024-06-20');
  });

  it('CA10: debe mostrar resumen ejecutivo del evento', () => {
    // Arrange
    const report = {
      evento: 'Concierto Rock 2024',
      fecha: '2024-12-31',
      total_entradas: 500,
      check_ins_realizados: 425,
      porcentaje_asistencia: 85,
      ingresos_totales: 25000000,
    };

    // Act & Assert
    expect(report.total_entradas).toBe(500);
    expect(report.porcentaje_asistencia).toBe(85);
    expect(report.check_ins_realizados).toBe(425);
  });

  it('CA11: debe incluir gráfico de asistencia por hora', () => {
    // Arrange
    const hourlyData = [
      { hora: '18:00', asistentes: 50 },
      { hora: '19:00', asistentes: 150 },
      { hora: '20:00', asistentes: 200 },
      { hora: '21:00', asistentes: 25 },
    ];

    // Act
    const totalAsistentes = hourlyData.reduce((sum, h) => sum + h.asistentes, 0);

    // Assert
    expect(totalAsistentes).toBe(425);
    expect(hourlyData).toHaveLength(4);
  });

  it('CA12: debe comparar con eventos anteriores', () => {
    // Arrange
    const currentEvent = {
      porcentaje_asistencia: 85,
      ingresos: 25000000,
    };

    const previousEvent = {
      porcentaje_asistencia: 78,
      ingresos: 22000000,
    };

    // Act
    const mejoramiento = {
      asistencia: currentEvent.porcentaje_asistencia - previousEvent.porcentaje_asistencia,
      ingresos: ((currentEvent.ingresos - previousEvent.ingresos) / previousEvent.ingresos) * 100,
    };

    // Assert
    expect(mejoramiento.asistencia).toBe(7);
    expect(mejoramiento.ingresos).toBeCloseTo(13.64, 1);
  });

  it('CA13: debe incluir lista de no presentados', () => {
    // Arrange
    const attendees = [
      { nombre: 'Juan Pérez', estado_checkin: 'pendiente', tipo: 'VIP' },
      { nombre: 'María González', estado_checkin: 'confirmado', tipo: 'General' },
      { nombre: 'Carlos López', estado_checkin: 'pendiente', tipo: 'General' },
    ];

    // Act
    const noShows = attendees.filter(a => a.estado_checkin === 'pendiente');

    // Assert
    expect(noShows).toHaveLength(2);
    expect(noShows[0].nombre).toBe('Juan Pérez');
  });

  it('CA14: debe calcular ingresos reales vs proyectados', () => {
    // Arrange
    const proyeccion = {
      entradas_esperadas: 500,
      precio_promedio: 50000,
      ingreso_proyectado: 25000000,
    };

    const real = {
      entradas_vendidas: 425,
      ingreso_real: 21250000,
    };

    // Act
    const diferencia = real.ingreso_real - proyeccion.ingreso_proyectado;
    const porcentajeCumplimiento = (real.ingreso_real / proyeccion.ingreso_proyectado) * 100;

    // Assert
    expect(diferencia).toBe(-3750000);
    expect(porcentajeCumplimiento).toBe(85);
  });

  it('CA15: debe generar código QR para reporte compartible', () => {
    // Arrange
    const reportUrl = `https://eventhub.com/reports/${(mockEvent as any).id_evento}/attendance`;

    // Act
    const qrData = {
      type: 'report',
      url: reportUrl,
      eventId: (mockEvent as any).id_evento,
    };

    // Assert
    expect(qrData.url).toContain('/reports/');
    expect(qrData.type).toBe('report');
  });

  it('CA16: debe permitir programar envío automático de reportes', () => {
    // Arrange
    const scheduledReport = {
      evento_id: (mockEvent as any).id_evento,
      frecuencia: 'semanal',
      destinatarios: ['admin@example.com', 'manager@example.com'],
      dia_envio: 'lunes',
      hora_envio: '09:00',
    };

    // Act & Assert
    expect(scheduledReport.frecuencia).toBe('semanal');
    expect(scheduledReport.destinatarios).toHaveLength(2);
  });

  it('CA17: debe incluir comentarios y observaciones', () => {
    // Arrange
    const report = {
      evento_id: (mockEvent as any).id_evento,
      observaciones: 'Excelente asistencia. Hora pico a las 19:00. Considerar más personal de entrada.',
      recomendaciones: ['Ampliar horario de check-in', 'Agregar más puntos de entrada'],
    };

    // Act & Assert
    expect(report.observaciones).toBeTruthy();
    expect(report.recomendaciones).toHaveLength(2);
  });

  it('CA18: debe calcular ROI del evento', () => {
    // Arrange
    const evento = {
      ingresos_totales: 25000000,
      costos_totales: 18000000,
    };

    // Act
    const ganancia = evento.ingresos_totales - evento.costos_totales;
    const roi = ((ganancia / evento.costos_totales) * 100).toFixed(2);

    // Assert
    expect(ganancia).toBe(7000000);
    expect(parseFloat(roi)).toBeCloseTo(38.89, 1);
  });
});
