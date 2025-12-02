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
}
