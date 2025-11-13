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
  static async obtenerAnaliticasEvento(idEvento: string) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .select('*')
      .eq('id_evento', idEvento)
      .single();

    if (error) throw error;
    return data;
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
    const eventosEnCurso = (eventos || []).filter(e => e.estado === 'publicado' && String(e.fecha_evento) === todayStr).length;
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
    const asistenciaPromedio = (analytics && analytics.length > 0)
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
    const { data: ultimoScan, error: ultimoScanError } = await supabase
      .from('asistencia_eventos')
      .select('fecha_asistencia')
      .in('id_evento', eventIds)
      .order('fecha_asistencia', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ultimoScanError && ultimoScanError.code !== 'PGRST116') {
      throw ultimoScanError;
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
      ultimoEscaneoISO: ultimoScan?.fecha_asistencia ?? null
    };
  }
}
