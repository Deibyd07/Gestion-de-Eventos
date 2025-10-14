import { supabase } from '../supabase';

export interface Attendance {
  id: string;
  id_compra: string;
  id_evento: string;
  id_usuario: string;
  fecha_asistencia: string;
  validado_por?: string;
  metodo_validacion: 'qr' | 'manual' | 'nfc' | 'biometrico';
  observaciones?: string;
  estado_asistencia: 'presente' | 'ausente' | 'tarde' | 'cancelado';
  ubicacion_validacion?: { lat: number; lng: number };
  dispositivo_validacion?: Record<string, any>;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AttendanceRegistration {
  exito: boolean;
  mensaje: string;
  id_asistencia?: string;
}

export interface AttendanceStats {
  total_entradas_vendidas: number;
  total_asistentes: number;
  tasa_asistencia: number;
  asistentes_por_metodo: Record<string, number>;
  asistentes_por_hora: Record<string, number>;
}

export interface QRValidation {
  valida: boolean;
  mensaje: string;
  datos_compra?: Record<string, any>;
  datos_evento?: Record<string, any>;
}

export class AttendanceService {
  /**
   * Registrar asistencia a un evento
   */
  static async registrarAsistencia(
    id_compra: string,
    metodo_validacion: 'qr' | 'manual' | 'nfc' | 'biometrico' = 'qr',
    validado_por?: string,
    observaciones?: string,
    ubicacion?: { lat: number; lng: number },
    dispositivo?: Record<string, any>
  ): Promise<AttendanceRegistration> {
    const { data, error } = await supabase.rpc('registrar_asistencia', {
      p_id_compra: id_compra,
      p_metodo_validacion: metodo_validacion,
      p_validado_por: validado_por || null,
      p_observaciones: observaciones || null,
      p_ubicacion: ubicacion ? `POINT(${ubicacion.lng} ${ubicacion.lat})` : null,
      p_dispositivo: dispositivo || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener estadísticas de asistencia de un evento
   */
  static async obtenerEstadisticasAsistencia(id_evento: string): Promise<AttendanceStats> {
    const { data, error } = await supabase.rpc('obtener_estadisticas_asistencia', {
      p_id_evento: id_evento
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Validar entrada por código QR
   */
  static async validarEntradaQR(codigo_qr: string): Promise<QRValidation> {
    const { data, error } = await supabase.rpc('validar_entrada_qr', {
      p_codigo_qr: codigo_qr
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener asistencias de un evento
   */
  static async obtenerAsistenciasEvento(id_evento: string, filtros?: {
    estado_asistencia?: string;
    metodo_validacion?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }) {
    let consulta = supabase
      .from('asistencia_eventos')
      .select(`
        *,
        compras (
          cantidad,
          total_pagado,
          fecha_creacion
        ),
        usuarios (
          nombre_completo,
          correo_electronico
        ),
        eventos (
          titulo,
          fecha_evento,
          hora_evento
        )
      `)
      .eq('id_evento', id_evento)
      .order('fecha_asistencia', { ascending: false });

    if (filtros?.estado_asistencia) {
      consulta = consulta.eq('estado_asistencia', filtros.estado_asistencia);
    }

    if (filtros?.metodo_validacion) {
      consulta = consulta.eq('metodo_validacion', filtros.metodo_validacion);
    }

    if (filtros?.fecha_desde) {
      consulta = consulta.gte('fecha_asistencia', filtros.fecha_desde);
    }

    if (filtros?.fecha_hasta) {
      consulta = consulta.lte('fecha_asistencia', filtros.fecha_hasta);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener asistencias de un usuario
   */
  static async obtenerAsistenciasUsuario(id_usuario: string) {
    const { data, error } = await supabase
      .from('asistencia_eventos')
      .select(`
        *,
        eventos (
          titulo,
          fecha_evento,
          hora_evento,
          ubicacion,
          url_imagen
        ),
        compras (
          cantidad,
          total_pagado
        )
      `)
      .eq('id_usuario', id_usuario)
      .order('fecha_asistencia', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Actualizar estado de asistencia
   */
  static async actualizarEstadoAsistencia(
    id: string,
    estado_asistencia: 'presente' | 'ausente' | 'tarde' | 'cancelado',
    observaciones?: string
  ) {
    const { data, error } = await supabase
      .from('asistencia_eventos')
      .update({ 
        estado_asistencia,
        observaciones: observaciones || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener asistencias por rango de fechas
   */
  static async obtenerAsistenciasPorRango(
    fecha_desde: string,
    fecha_hasta: string,
    id_evento?: string
  ) {
    let consulta = supabase
      .from('asistencia_eventos')
      .select(`
        *,
        eventos (titulo, fecha_evento),
        usuarios (nombre_completo),
        compras (cantidad, total_pagado)
      `)
      .gte('fecha_asistencia', fecha_desde)
      .lte('fecha_asistencia', fecha_hasta)
      .order('fecha_asistencia', { ascending: false });

    if (id_evento) {
      consulta = consulta.eq('id_evento', id_evento);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener reporte de asistencia en tiempo real
   */
  static async obtenerReporteTiempoReal(id_evento: string) {
    const { data, error } = await supabase
      .from('asistencia_eventos')
      .select(`
        fecha_asistencia,
        metodo_validacion,
        estado_asistencia,
        eventos (titulo, fecha_evento, hora_evento)
      `)
      .eq('id_evento', id_evento)
      .eq('estado_asistencia', 'presente')
      .order('fecha_asistencia', { ascending: false });

    if (error) throw error;

    // Procesar datos para el reporte
    const reporte = {
      total_asistentes: data.length,
      por_metodo: data.reduce((acc, item) => {
        acc[item.metodo_validacion] = (acc[item.metodo_validacion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      por_hora: data.reduce((acc, item) => {
        const hora = new Date(item.fecha_asistencia).getHours();
        acc[hora] = (acc[hora] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
      ultimas_asistencias: data.slice(0, 10)
    };

    return reporte;
  }

  /**
   * Eliminar registro de asistencia
   */
  static async eliminarAsistencia(id: string) {
    const { error } = await supabase
      .from('asistencia_eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Obtener asistencias por método de validación
   */
  static async obtenerAsistenciasPorMetodo(
    id_evento: string,
    metodo_validacion: string
  ) {
    const { data, error } = await supabase
      .from('asistencia_eventos')
      .select(`
        *,
        usuarios (nombre_completo, correo_electronico),
        compras (cantidad, total_pagado)
      `)
      .eq('id_evento', id_evento)
      .eq('metodo_validacion', metodo_validacion)
      .order('fecha_asistencia', { ascending: false });

    if (error) throw error;
    return data;
  }
}
