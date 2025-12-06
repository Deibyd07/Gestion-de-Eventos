import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

type MetricasOrganizador = {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  upcomingEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  avgTicketPrice: number;
  ventasHoy: number;
  ingresosHoy: number;
  comisionHoy: number;
  netoHoy: number;
  vistasUnicas: number;
  abandonoCarrito: number;
  eventosEnCurso: number;
  asistenciaPromedio: number;
  ultimoEscaneoISO?: string | null;
};

function startEndOfTodayUTC() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  return { startISO: start.toISOString(), endISO: end.toISOString() };
}

export class AnalyticsService {
  // Actividad reciente combinada del organizador
  static async obtenerActividadRecienteOrganizador(idOrganizador: string) {
    // 1) Traer eventos del organizador para limitar consultas por id_evento
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('id, titulo')
      .eq('id_organizador', idOrganizador);
    if (eventosError) throw eventosError;
    const eventIds = (eventos || []).map(e => e.id);
    const eventoMap = new Map<string, string>((eventos || []).map(e => [String(e.id), String(e.titulo)]));

    if (eventIds.length === 0) return [] as Array<any>;

    // 2) Últimas compras completadas
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id, id_evento, cantidad, total_pagado, estado, fecha_creacion')
      .in('id_evento', eventIds)
      .order('fecha_creacion', { ascending: false })
      .limit(8);
    if (comprasError) throw comprasError;

    // 3) Últimos escaneos (asistencias registradas vía QR)
    const { data: scans, error: scansError } = await supabase
      .from('codigos_qr_entradas')
      .select('id_evento, estado, fecha_escaneado')
      .in('id_evento', eventIds)
      .eq('estado', 'usado')
      .order('fecha_escaneado', { ascending: false })
      .limit(8);
    if (scansError) throw scansError;

    // Normalizar
    const comprasItems = (compras || []).map(c => ({
      type: 'venta' as const,
      timeISO: c.fecha_creacion as string,
      title: 'Venta de Entradas',
      description: `${c.cantidad || 0} entradas • $${Number(c.total_pagado || 0).toLocaleString('es-CO')}`,
      badge: 'Venta',
      eventTitle: eventoMap.get(String(c.id_evento)) || 'Evento'
    }));

    const scanItems = (scans || [])
      .filter(s => !!s.fecha_escaneado)
      .map(s => ({
        type: 'escaneo' as const,
        timeISO: s.fecha_escaneado as string,
        title: 'Asistencia Registrada',
        description: `Escaneo confirmado • ${eventoMap.get(String(s.id_evento)) || 'Evento'}`,
        badge: 'Escaneado',
        eventTitle: eventoMap.get(String(s.id_evento)) || 'Evento'
      }));

    // Combinar por fecha
    const combined = [...comprasItems, ...scanItems]
      .sort((a, b) => new Date(b.timeISO).getTime() - new Date(a.timeISO).getTime())
      .slice(0, 10);

    return combined;
  }
  static async obtenerAnaliticasEvento(idEvento: string) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .select('*')
      .eq('id_evento', idEvento)
      .single();

    if (error) throw error;
    return data;
  }

  // Métricas agregadas para un evento específico (compatibles con MetricasOrganizador)
  static async obtenerMetricasEvento(idEvento: string): Promise<MetricasOrganizador> {
    // 1) Datos del evento
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('id, estado, fecha_evento, asistentes_actuales')
      .eq('id', idEvento)
      .maybeSingle();
    if (eventoError) throw eventoError;

    const todayStr = new Date().toISOString().slice(0, 10);
    const totalEvents = evento ? 1 : 0;
    const activeEvents = evento && String(evento.estado) === 'publicado' ? 1 : 0;
    const completedEvents = evento && String(evento.estado) === 'finalizado' ? 1 : 0;
    const upcomingEvents = evento && (() => {
      const d = new Date(String(evento.fecha_evento));
      const now = new Date();
      return String(evento.estado) === 'publicado' && d > now ? 1 : 0;
    })() || 0;
    let eventosEnCurso = evento && String(evento.fecha_evento) === todayStr ? 1 : 0;

    // 2) Compras del evento
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id, cantidad, total_pagado, estado, fecha_creacion, id_evento')
      .eq('id_evento', idEvento);
    if (comprasError) throw comprasError;
    const comprasCompletadas = (compras || []).filter(c => c.estado === 'completada');
    const totalTicketsVendidos = comprasCompletadas.reduce((s, c) => s + (c.cantidad || 0), 0);
    const totalRevenue = comprasCompletadas.reduce((s, c) => s + Number(c.total_pagado || 0), 0);

    // 3) Analytics del evento
    const { data: analytics, error: analyticsError } = await supabase
      .from('analiticas_eventos')
      .select('total_visualizaciones, total_ventas, tasa_conversion, tasa_asistencia')
      .eq('id_evento', idEvento)
      .maybeSingle();
    if (analyticsError && analyticsError.code !== 'PGRST116') throw analyticsError;

    const totalVistas = Number(analytics?.total_visualizaciones || 0);
    const totalVentasAnalytics = Number(analytics?.total_ventas || 0);
    const conversionRate = totalVistas > 0 ? (totalVentasAnalytics / totalVistas) * 100 : 0;

    // 4) Ventas de hoy
    const { startISO, endISO } = startEndOfTodayUTC();
    const { data: comprasHoy, error: comprasHoyError } = await supabase
      .from('compras')
      .select('id, total_pagado, cantidad, estado, fecha_creacion, id_evento')
      .eq('id_evento', idEvento)
      .gte('fecha_creacion', startISO)
      .lte('fecha_creacion', endISO);
    if (comprasHoyError) throw comprasHoyError;
    const comprasHoyCompletadas = (comprasHoy || []).filter(c => c.estado === 'completada');
    const ventasHoy = comprasHoyCompletadas.reduce((sum, c) => sum + (c.cantidad || 0), 0);
    const ingresosHoy = comprasHoyCompletadas.reduce((sum, c) => sum + Number(c.total_pagado || 0), 0);

    // 5) Comisión y neto
    const tasa = 2.5;
    const comisionHoy = ingresosHoy * (tasa / 100);
    const netoHoy = ingresosHoy - comisionHoy;

    // 6) Abandono de carrito del evento
    const abandonadas = (compras || []).filter(c => ['pendiente','cancelada','fallida','reembolsada'].includes(String(c.estado))).length;
    const abandonoCarrito = (compras && compras.length > 0) ? (abandonadas / compras.length) * 100 : 0;

    // 7) Asistencia promedio desde QR con fallback a analytics
    let asistenciaPromedio = Number(analytics?.tasa_asistencia || 0);
    const { data: qrRows, error: qrErr } = await supabase
      .from('codigos_qr_entradas')
      .select('estado, fecha_escaneado')
      .eq('id_evento', idEvento);
    if (!qrErr && qrRows) {
      const totalVendidosQR = qrRows.length;
      const totalUsadosQR = qrRows.filter(r => r.estado === 'usado').length;
      const tasaQR = totalVendidosQR > 0 ? (totalUsadosQR / totalVendidosQR) * 100 : 0;
      if (!analytics) asistenciaPromedio = tasaQR; else if (tasaQR > 0) asistenciaPromedio = tasaQR;
    }

    // 8) Último escaneo
    let ultimoEscaneoISO: string | null = null;
    const { data: ultimoQr, error: ultimoQrErr } = await supabase
      .from('codigos_qr_entradas')
      .select('fecha_escaneado')
      .eq('id_evento', idEvento)
      .eq('estado','usado')
      .order('fecha_escaneado', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!ultimoQrErr && ultimoQr?.fecha_escaneado) {
      ultimoEscaneoISO = String(ultimoQr.fecha_escaneado);
    }

    return {
      totalEvents,
      activeEvents,
      completedEvents,
      upcomingEvents,
      totalRevenue,
      totalAttendees: totalTicketsVendidos,
      conversionRate,
      avgTicketPrice: totalTicketsVendidos > 0 ? totalRevenue / totalTicketsVendidos : 0,
      ventasHoy,
      ingresosHoy,
      comisionHoy,
      netoHoy,
      vistasUnicas: totalVistas,
      abandonoCarrito,
      eventosEnCurso,
      asistenciaPromedio,
      ultimoEscaneoISO
    };
  }

  static async crearAnaliticasEvento(datosAnaliticas: Tables['analiticas_eventos']['Insert']) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .insert(datosAnaliticas)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarAnaliticasEvento(idEvento: string, actualizaciones: Tables['analiticas_eventos']['Update']) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .update(actualizaciones)
      .eq('id_evento', idEvento)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerAnaliticasUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .select(`
        *,
        eventos (titulo, id_organizador)
      `)
      .eq('eventos.id_organizador', idUsuario);

    if (error) throw error;
    return data;
  }

  static async obtenerMetricasGenerales() {
    try {
      const { data, error } = await supabase
        .from('analiticas_eventos')
        .select('*');

      if (error) throw error;
      
      return {
        total_eventos: data?.length || 0,
        eventos_activos: data?.filter(a => a.estado === 'activo').length || 0,
        total_asistentes: data?.reduce((sum, a) => sum + (a.asistentes_confirmados || 0), 0) || 0
      };
    } catch (error) {
      // Si hay error, retornar valores por defecto
      return {
        total_eventos: 0,
        eventos_activos: 0,
        total_asistentes: 0
      };
    }
  }

  // Métricas agregadas reales para el panel del organizador
  static async obtenerMetricasOrganizador(idOrganizador: string): Promise<MetricasOrganizador> {
    // 1) Eventos del organizador
    const { data: eventos, error: eventosError } = await supabase
      .from('eventos')
      .select('id, estado, fecha_evento, asistentes_actuales')
      .eq('id_organizador', idOrganizador);

    if (eventosError) throw eventosError;

    const totalEvents = eventos?.length || 0;
    const completedEvents = (eventos || []).filter(e => e.estado === 'finalizado').length;
    const activeEvents = (eventos || []).filter(e => e.estado === 'publicado').length;
    const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    // eventosEnCurso: más robusto, contar eventos con actividad (compras o escaneos) hoy
    let eventosEnCurso = (eventos || []).filter(e => String(e.fecha_evento) === todayStr).length;
    const upcomingEvents = (eventos || []).filter(e => {
      const d = new Date(String(e.fecha_evento));
      const now = new Date();
      return e.estado === 'publicado' && d > now;
    }).length;

    const eventIds = (eventos || []).map(e => e.id);

    // Si no tiene eventos, devolver ceros
    if (eventIds.length === 0) {
      return {
        totalEvents: 0,
        activeEvents: 0,
        completedEvents: 0,
        upcomingEvents: 0,
        totalRevenue: 0,
        totalAttendees: 0,
        conversionRate: 0,
        avgTicketPrice: 0,
        ventasHoy: 0,
        ingresosHoy: 0,
        comisionHoy: 0,
        netoHoy: 0,
        vistasUnicas: 0,
        abandonoCarrito: 0,
        eventosEnCurso: 0,
        asistenciaPromedio: 0,
        ultimoEscaneoISO: null
      };
    }

    // 2) Compras asociadas a estos eventos
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id, id_evento, cantidad, total_pagado, estado, fecha_creacion')
      .in('id_evento', eventIds);

    if (comprasError) throw comprasError;

    const comprasCompletadas = (compras || []).filter(c => c.estado === 'completada');
    const totalTicketsVendidos = comprasCompletadas.reduce((sum, c) => sum + (c.cantidad || 0), 0);
    const totalRevenue = comprasCompletadas.reduce((sum, c) => sum + Number(c.total_pagado || 0), 0);

    // 3) Analytics por evento (vistas, tasa conversion, asistencia)
    const { data: analytics, error: analyticsError } = await supabase
      .from('analiticas_eventos')
      .select('id_evento, total_visualizaciones, total_ventas, tasa_conversion, tasa_asistencia')
      .in('id_evento', eventIds);

    if (analyticsError) throw analyticsError;

    const totalVistas = (analytics || []).reduce((s, a) => s + (a.total_visualizaciones || 0), 0);
    const totalVentasAnalytics = (analytics || []).reduce((s, a) => s + (a.total_ventas || 0), 0);
    const conversionRate = totalVistas > 0 ? (totalVentasAnalytics / totalVistas) * 100 : 0;
    let asistenciaPromedio = (analytics && analytics.length > 0)
      ? (analytics.reduce((s, a) => s + Number(a.tasa_asistencia || 0), 0) / analytics.length)
      : 0;

    const avgTicketPrice = totalTicketsVendidos > 0 ? totalRevenue / totalTicketsVendidos : 0;

    // 4) Ventas de hoy
    const { startISO, endISO } = startEndOfTodayUTC();
    const { data: comprasHoy, error: comprasHoyError } = await supabase
      .from('compras')
      .select('id, total_pagado, cantidad, estado, fecha_creacion, id_evento')
      .in('id_evento', eventIds)
      .gte('fecha_creacion', startISO)
      .lte('fecha_creacion', endISO);

    if (comprasHoyError) throw comprasHoyError;
    const comprasHoyCompletadas = (comprasHoy || []).filter(c => c.estado === 'completada');
    const ventasHoy = comprasHoyCompletadas.reduce((sum, c) => sum + (c.cantidad || 0), 0);
    const ingresosHoy = comprasHoyCompletadas.reduce((sum, c) => sum + Number(c.total_pagado || 0), 0);
    // Ajustar eventosEnCurso si hay actividad hoy
    if ((comprasHoyCompletadas || []).length > 0) {
      const activeTodayEvents = new Set<string>((comprasHoyCompletadas || []).map(c => String(c.id_evento)));
      eventosEnCurso = activeTodayEvents.size;
    }

    // Calcular asistenciaPromedio desde QR si analytics vacío
    if (!analytics || analytics.length === 0) {
      const { data: qrRows, error: qrErr } = await supabase
        .from('codigos_qr_entradas')
        .select('id_evento, estado, fecha_escaneado')
        .in('id_evento', eventIds);
      if (!qrErr && qrRows) {
        const totalVendidosQR = (qrRows || []).length;
        const totalUsadosQR = (qrRows || []).filter(r => r.estado === 'usado').length;
        asistenciaPromedio = totalVendidosQR > 0 ? (totalUsadosQR / totalVendidosQR) * 100 : 0;
      }
    }

    // 5) Configuración de comisión
    // NOTA: Usando tasa fija por defecto hasta que se cree la tabla configuraciones_sistema
    // Para crear la tabla, ejecutar el script: Documentacion/database/migrations/add_configuraciones_sistema_table.sql
    const tasa = 2.5; // Tasa por defecto: 2.5%
    const comisionHoy = ingresosHoy * (tasa / 100);
    const netoHoy = ingresosHoy - comisionHoy;

    // 6) Abandono de carrito (aproximación): (pendiente + cancelada + fallida + reembolsada) / total compras
    const abandonadas = (compras || []).filter(c => ['pendiente','cancelada','fallida','reembolsada'].includes(String(c.estado))).length;
    const abandonoCarrito = (compras && compras.length > 0) ? (abandonadas / compras.length) * 100 : 0;

    // 7) Último escaneo
    // Último escaneo: intentar asistencia_eventos, luego QR como fallback
    let ultimoEscaneoISO: string | null = null;
    try {
      const { data: ultimoScan, error: ultimoScanError } = await supabase
        .from('asistencia_eventos')
        .select('fecha_asistencia')
        .in('id_evento', eventIds)
        .order('fecha_asistencia', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!ultimoScanError && ultimoScan?.fecha_asistencia) {
        ultimoEscaneoISO = String(ultimoScan.fecha_asistencia);
      } else if (ultimoScanError && ultimoScanError.code !== 'PGRST116') {
        throw ultimoScanError;
      }
    } catch {}
    if (!ultimoEscaneoISO) {
      const { data: ultimoQr, error: ultimoQrErr } = await supabase
        .from('codigos_qr_entradas')
        .select('fecha_escaneado')
        .in('id_evento', eventIds)
        .eq('estado', 'usado')
        .order('fecha_escaneado', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!ultimoQrErr && ultimoQr?.fecha_escaneado) {
        ultimoEscaneoISO = String(ultimoQr.fecha_escaneado);
      }
    }

    return {
      totalEvents,
      activeEvents,
      completedEvents,
      upcomingEvents,
      totalRevenue,
      totalAttendees: totalTicketsVendidos,
      conversionRate,
      avgTicketPrice,
      ventasHoy,
      ingresosHoy,
      comisionHoy,
      netoHoy,
      vistasUnicas: totalVistas,
      abandonoCarrito,
      eventosEnCurso,
      asistenciaPromedio,
      ultimoEscaneoISO
    };
  }

  /**
   * Obtiene todos los datos de análisis para el módulo de reportes del administrador
   */
  static async getAdminAnalyticsData(): Promise<{
    totalEvents: number;
    totalRevenue: number;
    totalAttendees: number;
    conversionRate: number;
    averageTicketPrice: number;
    growth: {
      events: number;
      revenue: number;
      attendees: number;
      conversionRate: number;
    };
    topEvents: Array<{
      id: string;
      title: string;
      revenue: number;
      attendees: number;
      date: string;
    }>;
    revenueByMonth: Array<{
      month: string;
      revenue: number;
      events: number;
    }>;
    attendanceTrends: Array<{
      date: string;
      checkIns: number;
      noShows: number;
    }>;
    ticketSalesByType: Array<{
      type: string;
      sales: number;
      revenue: number;
    }>;
    geographicData: Array<{
      location: string;
      events: number;
      revenue: number;
    }>;
    priceMetrics: {
      averagePrice: number;
      maxPrice: number;
      minPrice: number;
    };
    attendanceStats: {
      averageAttendanceRate: number;
      bestDayOfWeek: string;
      peakCheckInHour: string;
    };
  }> {
    try {
      console.log('Cargando datos de analytics del admin...');
      
      const [
        totalEvents,
        totalRevenue,
        totalAttendees,
        conversionRate,
        averageTicketPrice,
        growthStats,
        topEvents,
        revenueByMonth,
        attendanceTrends,
        ticketSalesByType,
        geographicData,
        priceMetrics,
        attendanceStats
      ] = await Promise.all([
        this.getAdminTotalEvents(),
        this.getAdminTotalRevenue(),
        this.getAdminTotalAttendees(),
        this.getAdminConversionRate(),
        this.getAdminAverageTicketPrice(),
        this.getAdminGrowthStats(),
        this.getAdminTopEvents(),
        this.getAdminRevenueByMonth(),
        this.getAdminAttendanceTrends(),
        this.getAdminTicketSalesByType(),
        this.getAdminGeographicData(),
        this.getAdminPriceMetrics(),
        this.getAdminAttendanceStats()
      ]);

      console.log('Datos cargados:', {
        totalEvents,
        totalRevenue,
        totalAttendees,
        topEventsCount: topEvents.length,
        ticketSalesTypesCount: ticketSalesByType.length,
        revenueByMonthCount: revenueByMonth.length,
        geographicDataCount: geographicData.length
      });

      return {
        totalEvents,
        totalRevenue,
        totalAttendees,
        conversionRate,
        averageTicketPrice,
        growth: growthStats,
        topEvents,
        revenueByMonth,
        attendanceTrends,
        ticketSalesByType,
        geographicData,
        priceMetrics,
        attendanceStats
      };
    } catch (error) {
      console.error('Error al obtener datos de analytics del admin:', error);
      throw error;
    }
  }

  private static async getAdminTotalEvents(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error al obtener total de eventos:', error);
      return 0;
    }
  }

  private static async getAdminTotalRevenue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada');

      if (error) throw error;

      return (data as Array<{ total_pagado: number }>)?.reduce((sum, compra) => 
        sum + (parseFloat(String(compra.total_pagado)) || 0), 0) || 0;
    } catch (error) {
      console.error('Error al obtener ingresos totales:', error);
      return 0;
    }
  }

  private static async getAdminTotalAttendees(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('cantidad')
        .eq('estado', 'completada');

      if (error) throw error;

      return (data as Array<{ cantidad: number }>)?.reduce((sum, compra) => 
        sum + (compra.cantidad || 0), 0) || 0;
    } catch (error) {
      console.error('Error al obtener total de asistentes:', error);
      return 0;
    }
  }

  private static async getAdminConversionRate(): Promise<number> {
    try {
      const { count: totalCompras } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true });

      const { count: completadas } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada');

      if (!totalCompras || totalCompras === 0) return 0;
      return ((completadas || 0) / totalCompras) * 100;
    } catch (error) {
      console.error('Error al calcular tasa de conversión:', error);
      return 0;
    }
  }

  private static async getAdminAverageTicketPrice(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('total_pagado, cantidad')
        .eq('estado', 'completada');

      if (error) throw error;
      if (!data || data.length === 0) return 0;

      const totalRevenue = (data as Array<{ total_pagado: number; cantidad: number }>).reduce((sum, compra) => 
        sum + (parseFloat(String(compra.total_pagado)) || 0), 0);
      
      const totalTickets = (data as Array<{ total_pagado: number; cantidad: number }>).reduce((sum, compra) => 
        sum + (compra.cantidad || 0), 0);

      return totalTickets > 0 ? totalRevenue / totalTickets : 0;
    } catch (error) {
      console.error('Error al calcular precio promedio:', error);
      return 0;
    }
  }

  private static async getAdminGrowthStats(): Promise<{
    events: number;
    revenue: number;
    attendees: number;
    conversionRate: number;
  }> {
    try {
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Eventos del mes actual
      const { count: currentMonthEvents } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      // Eventos del mes anterior
      const { count: lastMonthEvents } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      // Ingresos del mes actual
      const { data: currentMonthRevenue } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const currentRevenue = (currentMonthRevenue as Array<{ total_pagado: number }>)?.reduce((sum, compra) => 
        sum + (parseFloat(String(compra.total_pagado)) || 0), 0) || 0;

      // Ingresos del mes anterior
      const { data: lastMonthRevenueData } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const lastRevenue = (lastMonthRevenueData as Array<{ total_pagado: number }>)?.reduce((sum, compra) => 
        sum + (parseFloat(String(compra.total_pagado)) || 0), 0) || 0;

      // Asistentes del mes actual
      const { data: currentMonthAttendees } = await supabase
        .from('compras')
        .select('cantidad')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const currentAttendees = (currentMonthAttendees as Array<{ cantidad: number }>)?.reduce((sum, compra) => 
        sum + (compra.cantidad || 0), 0) || 0;

      // Asistentes del mes anterior
      const { data: lastMonthAttendeesData } = await supabase
        .from('compras')
        .select('cantidad')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const lastAttendees = (lastMonthAttendeesData as Array<{ cantidad: number }>)?.reduce((sum, compra) => 
        sum + (compra.cantidad || 0), 0) || 0;

      // Tasa de conversión del mes actual
      const { count: currentMonthTotal } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const { count: currentMonthCompleted } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const currentConversionRate = currentMonthTotal && currentMonthTotal > 0 
        ? (currentMonthCompleted || 0) / currentMonthTotal * 100 
        : 0;

      // Tasa de conversión del mes anterior
      const { count: lastMonthTotal } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const { count: lastMonthCompleted } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const lastConversionRate = lastMonthTotal && lastMonthTotal > 0 
        ? (lastMonthCompleted || 0) / lastMonthTotal * 100 
        : 0;

      // Calcular porcentajes de crecimiento
      const eventsGrowth = lastMonthEvents && lastMonthEvents > 0 
        ? ((currentMonthEvents || 0) - lastMonthEvents) / lastMonthEvents * 100 
        : 0;

      const revenueGrowth = lastRevenue && lastRevenue > 0 
        ? (currentRevenue - lastRevenue) / lastRevenue * 100 
        : 0;

      const attendeesGrowth = lastAttendees && lastAttendees > 0 
        ? (currentAttendees - lastAttendees) / lastAttendees * 100 
        : 0;

      const conversionRateGrowth = lastConversionRate && lastConversionRate > 0 
        ? (currentConversionRate - lastConversionRate) / lastConversionRate * 100 
        : 0;

      return {
        events: Math.round(eventsGrowth * 10) / 10,
        revenue: Math.round(revenueGrowth * 10) / 10,
        attendees: Math.round(attendeesGrowth * 10) / 10,
        conversionRate: Math.round(conversionRateGrowth * 10) / 10
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de crecimiento:', error);
      return { events: 0, revenue: 0, attendees: 0, conversionRate: 0 };
    }
  }

  private static async getAdminTopEvents(): Promise<Array<{
    id: string;
    title: string;
    revenue: number;
    attendees: number;
    date: string;
  }>> {
    try {
      // Obtener todas las compras completadas con información del evento
      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select('id_evento, total_pagado, cantidad')
        .eq('estado', 'completada');

      if (comprasError) {
        console.error('Error al obtener compras:', comprasError);
        throw comprasError;
      }

      if (!compras || compras.length === 0) {
        console.log('No hay compras completadas');
        return [];
      }

      // Agrupar por evento
      const eventRevenues = new Map<string, { revenue: number; attendees: number }>();
      
      compras.forEach((compra: any) => {
        const existing = eventRevenues.get(compra.id_evento);
        const revenue = parseFloat(String(compra.total_pagado)) || 0;
        const attendees = compra.cantidad || 0;

        if (existing) {
          existing.revenue += revenue;
          existing.attendees += attendees;
        } else {
          eventRevenues.set(compra.id_evento, { revenue, attendees });
        }
      });

      // Obtener información de los eventos con mayores ingresos
      const topEventIds = Array.from(eventRevenues.entries())
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 10)
        .map(([id]) => id);

      if (topEventIds.length === 0) {
        console.log('No hay eventos con ingresos');
        return [];
      }

      // Consultar información de esos eventos
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select('id, titulo, fecha_evento')
        .in('id', topEventIds);

      if (eventosError) {
        console.error('Error al obtener eventos:', eventosError);
        throw eventosError;
      }

      if (!eventos || eventos.length === 0) {
        console.log('No se encontraron eventos');
        return [];
      }

      // Combinar datos
      const result = eventos.map(evento => {
        const stats = eventRevenues.get(evento.id);
        return {
          id: evento.id,
          title: evento.titulo,
          revenue: stats?.revenue || 0,
          attendees: stats?.attendees || 0,
          date: evento.fecha_evento
        };
      }).sort((a, b) => b.revenue - a.revenue);

      console.log('Top eventos obtenidos:', result.length);
      return result;
    } catch (error) {
      console.error('Error al obtener top eventos:', error);
      return [];
    }
  }

  private static async getAdminRevenueByMonth(): Promise<Array<{
    month: string;
    year: number;
    revenue: number;
    events: number;
    eventsList: Array<{
      id: string;
      title: string;
      revenue: number;
      percentage: number;
      eventDate?: string;
      salesStart?: string;
    }>;
    growthVsPrevMonth: number;
  }>> {
    try {
      // Obtener TODAS las compras completadas para calcular por mes
      const { data: allCompras } = await supabase
        .from('compras')
        .select('id_evento, total_pagado, fecha_creacion')
        .eq('estado', 'completada')
        .order('fecha_creacion', { ascending: true });

      if (!allCompras || allCompras.length === 0) {
        return [];
      }

      // Agrupar compras por año-mes
      const monthlyData = new Map<string, {
        year: number;
        month: number;
        revenue: number;
        eventRevenueMap: Map<string, number>;
      }>();

      allCompras.forEach((compra: any) => {
        const date = new Date(compra.fecha_creacion);
        const year = date.getFullYear();
        const month = date.getMonth();
        const key = `${year}-${month}`;

        if (!monthlyData.has(key)) {
          monthlyData.set(key, {
            year,
            month,
            revenue: 0,
            eventRevenueMap: new Map()
          });
        }

        const data = monthlyData.get(key)!;
        const amount = parseFloat(String(compra.total_pagado)) || 0;
        data.revenue += amount;

        const currentEventRevenue = data.eventRevenueMap.get(compra.id_evento) || 0;
        data.eventRevenueMap.set(compra.id_evento, currentEventRevenue + amount);
      });

      // Convertir a array y ordenar por fecha
      const sortedMonths = Array.from(monthlyData.entries())
        .sort((a, b) => {
          const [yearA, monthA] = a[0].split('-').map(Number);
          const [yearB, monthB] = b[0].split('-').map(Number);
          return (yearA * 12 + monthA) - (yearB * 12 + monthB);
        });

      // Procesar cada mes
      const monthsData = [];
      for (const [key, data] of sortedMonths) {
        const eventIds = Array.from(data.eventRevenueMap.keys());
        let eventsList: Array<{
          id: string;
          title: string;
          revenue: number;
          percentage: number;
          eventDate?: string;
          salesStart?: string;
        }> = [];

        if (eventIds.length > 0) {
          const { data: eventos } = await supabase
            .from('eventos')
            .select('id, titulo, fecha_evento, fecha_creacion')
            .in('id', eventIds);

          eventsList = eventos?.map((evento: any) => {
            const revenue = data.eventRevenueMap.get(evento.id) || 0;
            return {
              id: evento.id,
              title: evento.titulo,
              revenue,
              percentage: data.revenue > 0 ? (revenue / data.revenue) * 100 : 0,
              eventDate: evento.fecha_evento,
              salesStart: evento.fecha_creacion
            };
          }).sort((a, b) => b.revenue - a.revenue) || [];
        }

        // Obtener nombre del mes en español
        const monthNames = [
          'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
          'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        monthsData.push({
          month: monthNames[data.month],
          year: data.year,
          revenue: data.revenue,
          events: eventIds.length,
          eventsList,
          growthVsPrevMonth: 0 // Se calculará después
        });
      }

      // Calcular crecimiento vs mes anterior
      for (let i = 0; i < monthsData.length; i++) {
        if (i > 0) {
          const currentRevenue = monthsData[i].revenue;
          const prevRevenue = monthsData[i - 1].revenue;
          if (prevRevenue > 0) {
            monthsData[i].growthVsPrevMonth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
          }
        }
      }

      console.log('Ingresos por mes obtenidos:', monthsData.length);
      return monthsData;
    } catch (error) {
      console.error('Error al obtener ingresos por mes:', error);
      return [];
    }
  }

  private static async getAdminAttendanceTrends(): Promise<Array<{
    date: string;
    checkIns: number;
    noShows: number;
  }>> {
    try {
      console.log('=== Obteniendo tendencias de asistencia ===');
      
      // Primero intentar obtener TODOS los registros sin filtro de fecha
      console.log('Intentando obtener todos los códigos QR...');

      const { data: allQR, error: errorAll } = await supabase
        .from('codigos_qr_entradas')
        .select('estado, fecha_escaneado, fecha_generacion');

      console.log('Total de códigos QR SIN filtro:', allQR?.length || 0);
      if (errorAll) {
        console.error('Error al obtener TODOS los códigos QR:', errorAll);
      }

      // Ahora con filtro de 90 días
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      console.log('Buscando códigos QR desde:', ninetyDaysAgo.toISOString());

      const { data: qrCodes, error } = await supabase
        .from('codigos_qr_entradas')
        .select('estado, fecha_escaneado, fecha_generacion')
        .gte('fecha_generacion', ninetyDaysAgo.toISOString())
        .order('fecha_generacion', { ascending: true });

      if (error) {
        console.error('Error al obtener códigos QR con filtro:', error);
        // Si hay error con filtro, usar todos los datos
        if (allQR && allQR.length > 0) {
          console.log('Usando TODOS los registros debido a error en filtro');
          return this.processAttendanceTrends(allQR);
        }
        return [];
      }

      console.log('Total de códigos QR encontrados CON filtro:', qrCodes?.length || 0);
      
      if (!qrCodes || qrCodes.length === 0) {
        console.log('No hay códigos QR generados en los últimos 90 días');
        // Si no hay datos con filtro pero sí sin filtro, usar todos
        if (allQR && allQR.length > 0) {
          console.log('Usando TODOS los registros porque el filtro no devolvió datos');
          return this.processAttendanceTrends(allQR);
        }
        return [];
      }

      return this.processAttendanceTrends(qrCodes);
    } catch (error) {
      console.error('Error al obtener tendencias de asistencia:', error);
      return [];
    }
  }

  private static processAttendanceTrends(qrCodes: any[]): Array<{
    date: string;
    checkIns: number;
    noShows: number;
  }> {
    // Contar estados
    const estadosCount = qrCodes.reduce((acc: any, qr: any) => {
      acc[qr.estado] = (acc[qr.estado] || 0) + 1;
      return acc;
    }, {});
    console.log('Códigos QR por estado:', estadosCount);

    // Agrupar por fecha
    const dateMap = new Map<string, { checkIns: number; noShows: number }>();

    qrCodes.forEach((qr: any) => {
      let dateStr: string;
      
      // Para códigos usados, usar fecha de escaneo
      if (qr.estado === 'usado' && qr.fecha_escaneado) {
        dateStr = new Date(qr.fecha_escaneado).toISOString().split('T')[0];
      } else if (qr.fecha_generacion) {
        // Para otros estados, usar fecha de generación
        dateStr = new Date(qr.fecha_generacion).toISOString().split('T')[0];
      } else {
        // Si no hay ninguna fecha, saltar
        return;
      }

      const existing = dateMap.get(dateStr);

      if (existing) {
        if (qr.estado === 'usado') {
          existing.checkIns += 1;
        } else if (qr.estado === 'activo' || qr.estado === 'expirado') {
          existing.noShows += 1;
        }
      } else {
        dateMap.set(dateStr, {
          checkIns: qr.estado === 'usado' ? 1 : 0,
          noShows: (qr.estado === 'activo' || qr.estado === 'expirado') ? 1 : 0
        });
      }
    });

    const result = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        checkIns: data.checkIns,
        noShows: data.noShows
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Tendencias de asistencia encontradas:', result.length, 'días');
    console.log('Primeros 5 días:', result.slice(0, 5));
    
    return result;
  }

  private static async getAdminTicketSalesByType(): Promise<Array<{
    type: string;
    sales: number;
    revenue: number;
    eventName: string;
    eventId: string;
  }>> {
    try {
      // Obtener compras completadas
      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select('id_tipo_entrada, id_evento, cantidad, total_pagado')
        .eq('estado', 'completada');

      if (comprasError) {
        console.error('Error al obtener compras:', comprasError);
        throw comprasError;
      }

      if (!compras || compras.length === 0) {
        console.log('No hay compras completadas');
        return [];
      }

      // Obtener IDs únicos de tipos de entrada
      const tipoEntradaIds = [...new Set(compras.map((c: any) => c.id_tipo_entrada).filter(Boolean))];

      if (tipoEntradaIds.length === 0) {
        console.log('No hay tipos de entrada asociados a las compras');
        return [];
      }

      // Obtener información de los tipos de entrada (incluye id_evento y nombre_evento)
      const { data: tiposEntrada, error: tiposError } = await supabase
        .from('tipos_entrada')
        .select('id, nombre_tipo, id_evento, nombre_evento')
        .in('id', tipoEntradaIds);

      if (tiposError) {
        console.error('Error al obtener tipos de entrada:', tiposError);
        throw tiposError;
      }

      // Crear mapa de tipos de entrada con información del evento
      const tipoEntradaMap = new Map<string, { nombre: string; eventoId: string; eventoNombre: string }>();
      tiposEntrada?.forEach((tipo: any) => {
        tipoEntradaMap.set(tipo.id, {
          nombre: tipo.nombre_tipo || 'General',
          eventoId: tipo.id_evento,
          eventoNombre: tipo.nombre_evento
        });
      });

      console.log('Tipos de entrada encontrados:', tiposEntrada?.length);

      // Agrupar por tipo de entrada + evento (combinación única)
      const typeMap = new Map<string, { 
        type: string; 
        sales: number; 
        revenue: number;
        eventName: string;
        eventId: string;
      }>();

      compras.forEach((compra: any) => {
        const tipoInfo = tipoEntradaMap.get(compra.id_tipo_entrada);
        if (!tipoInfo) return;

        // Crear clave única combinando tipo + evento
        const key = `${tipoInfo.nombre}_${tipoInfo.eventoId}`;
        const existing = typeMap.get(key);
        const revenue = parseFloat(String(compra.total_pagado)) || 0;
        const sales = compra.cantidad || 0;

        if (existing) {
          existing.sales += sales;
          existing.revenue += revenue;
        } else {
          typeMap.set(key, {
            type: tipoInfo.nombre,
            sales,
            revenue,
            eventName: tipoInfo.eventoNombre,
            eventId: tipoInfo.eventoId
          });
        }
      });

      const result = Array.from(typeMap.values())
        .sort((a, b) => b.revenue - a.revenue);

      console.log('Tipos de entrada con eventos encontrados:', result.length);
      return result;
    } catch (error) {
      console.error('Error al obtener ventas por tipo:', error);
      return [];
    }
  }

  private static async getAdminGeographicData(): Promise<Array<{
    location: string;
    events: number;
    revenue: number;
  }>> {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          id,
          ubicacion,
          compras(total_pagado, estado)
        `);

      if (error) throw error;

      const locationMap = new Map<string, { events: number; revenue: number }>();

      (data as any[])?.forEach((evento: any) => {
        const location = evento.ubicacion || 'Sin especificar';
        const existing = locationMap.get(location);
        
        const eventRevenue = evento.compras
          ?.filter((c: any) => c.estado === 'completada')
          ?.reduce((sum: number, c: any) => sum + (parseFloat(String(c.total_pagado)) || 0), 0) || 0;

        if (existing) {
          existing.events += 1;
          existing.revenue += eventRevenue;
        } else {
          locationMap.set(location, { events: 1, revenue: eventRevenue });
        }
      });

      return Array.from(locationMap.entries())
        .map(([location, data]) => ({
          location,
          events: data.events,
          revenue: data.revenue
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    } catch (error) {
      console.error('Error al obtener datos geográficos:', error);
      return [];
    }
  }

  /**
   * Obtiene métricas de precios de tickets desde la tabla tipos_entrada
   */
  private static async getAdminPriceMetrics(): Promise<{
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
  }> {
    try {
      const { data: tiposEntrada, error } = await supabase
        .from('tipos_entrada')
        .select('precio');

      if (error) {
        console.error('Error al obtener precios de tipos de entrada:', error);
        throw error;
      }

      if (!tiposEntrada || tiposEntrada.length === 0) {
        console.log('No hay tipos de entrada con precios');
        return { averagePrice: 0, maxPrice: 0, minPrice: 0 };
      }

      const precios = tiposEntrada
        .map((t: any) => parseFloat(String(t.precio)) || 0)
        .filter(p => p > 0);

      if (precios.length === 0) {
        return { averagePrice: 0, maxPrice: 0, minPrice: 0 };
      }

      const averagePrice = precios.reduce((sum, p) => sum + p, 0) / precios.length;
      const maxPrice = Math.max(...precios);
      const minPrice = Math.min(...precios);

      console.log('Métricas de precios:', {
        averagePrice,
        maxPrice,
        minPrice,
        totalTicketTypes: precios.length
      });

      return {
        averagePrice,
        maxPrice,
        minPrice
      };
    } catch (error) {
      console.error('Error al obtener métricas de precios:', error);
      return { averagePrice: 0, maxPrice: 0, minPrice: 0 };
    }
  }

  /**
   * Obtiene estadísticas de asistencia desde códigos QR
   */
  private static async getAdminAttendanceStats(): Promise<{
    averageAttendanceRate: number;
    bestDayOfWeek: string;
    peakCheckInHour: string;
  }> {
    try {
      const { data: qrCodes, error } = await supabase
        .from('codigos_qr_entradas')
        .select('estado, fecha_escaneado');

      if (error) {
        console.error('Error al obtener códigos QR para estadísticas:', error);
        throw error;
      }

      if (!qrCodes || qrCodes.length === 0) {
        console.log('No hay códigos QR para calcular estadísticas');
        return {
          averageAttendanceRate: 0,
          bestDayOfWeek: 'N/A',
          peakCheckInHour: 'N/A'
        };
      }

      // Calcular tasa de asistencia
      const totalCodigos = qrCodes.length;
      const codigosUsados = qrCodes.filter((qr: any) => qr.estado === 'usado').length;
      const averageAttendanceRate = totalCodigos > 0 ? (codigosUsados / totalCodigos) * 100 : 0;

      // Obtener códigos escaneados (solo los usados)
      const codigosEscaneados = qrCodes.filter((qr: any) => qr.estado === 'usado' && qr.fecha_escaneado);

      if (codigosEscaneados.length === 0) {
        console.log('No hay códigos escaneados para calcular mejores días y horas');
        return {
          averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
          bestDayOfWeek: 'N/A',
          peakCheckInHour: 'N/A'
        };
      }

      // Calcular mejor día de la semana
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const contadorDias: Record<string, number> = {};

      codigosEscaneados.forEach((qr: any) => {
        const fecha = new Date(qr.fecha_escaneado);
        const dia = diasSemana[fecha.getDay()];
        contadorDias[dia] = (contadorDias[dia] || 0) + 1;
      });

      const bestDayOfWeek = Object.entries(contadorDias)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

      // Calcular hora pico de check-in
      const contadorHoras: Record<number, number> = {};

      codigosEscaneados.forEach((qr: any) => {
        const fecha = new Date(qr.fecha_escaneado);
        const hora = fecha.getHours();
        contadorHoras[hora] = (contadorHoras[hora] || 0) + 1;
      });

      const horaMasFrecuente = Object.entries(contadorHoras)
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      const peakCheckInHour = horaMasFrecuente 
        ? `${horaMasFrecuente}:00 - ${Number(horaMasFrecuente) + 1}:00`
        : 'N/A';

      console.log('Estadísticas de asistencia:', {
        averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
        bestDayOfWeek,
        peakCheckInHour,
        totalCodigos,
        codigosUsados
      });

      return {
        averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
        bestDayOfWeek,
        peakCheckInHour
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de asistencia:', error);
      return {
        averageAttendanceRate: 0,
        bestDayOfWeek: 'N/A',
        peakCheckInHour: 'N/A'
      };
    }
  }
}
