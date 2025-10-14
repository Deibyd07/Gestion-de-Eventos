import { supabase } from '../supabase';

export interface EventRating {
  id: string;
  id_evento: string;
  id_usuario: string;
  calificacion: number;
  comentario?: string;
  aspectos_positivos: string[];
  aspectos_negativos: string[];
  recomendaria: boolean;
  categoria_calificacion: string;
  fecha_evento_asistido?: string;
  anonima: boolean;
  moderada: boolean;
  visible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EventRatingCreate {
  id_evento: string;
  calificacion: number;
  comentario?: string;
  aspectos_positivos?: string[];
  aspectos_negativos?: string[];
  recomendaria?: boolean;
  categoria_calificacion?: string;
  fecha_evento_asistido?: string;
  anonima?: boolean;
}

export interface EventRatingUpdate {
  calificacion?: number;
  comentario?: string;
  aspectos_positivos?: string[];
  aspectos_negativos?: string[];
  recomendaria?: boolean;
  categoria_calificacion?: string;
  anonima?: boolean;
}

export interface EventRatingStats {
  rating_promedio: number;
  total_calificaciones: number;
  distribucion_calificaciones: Record<string, number>;
  aspectos_mas_mencionados: Record<string, number>;
}

export interface EventRatingWithUser {
  id: string;
  calificacion: number;
  comentario?: string;
  aspectos_positivos: string[];
  aspectos_negativos: string[];
  recomendaria: boolean;
  categoria_calificacion: string;
  anonima: boolean;
  fecha_creacion: string;
  usuario_nombre: string;
  usuario_avatar?: string;
}

export interface CanRateEvent {
  puede_calificar: boolean;
  razon: string;
  fecha_evento?: string;
  ya_calificado: boolean;
}

export interface UserRatingStats {
  total_calificaciones: number;
  calificacion_promedio_dada: number;
  eventos_mas_calificados: Array<{
    id_evento: string;
    calificacion: number;
    fecha_calificacion: string;
  }>;
  distribucion_calificaciones: Record<string, number>;
}

export interface ModerateRating {
  exito: boolean;
  mensaje: string;
}

export class EventRatingService {
  /**
   * Crear una nueva calificación
   */
  static async crearCalificacion(datosCalificacion: EventRatingCreate) {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .insert(datosCalificacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Verificar si un usuario puede calificar un evento
   */
  static async puedeCalificarEvento(
    id_evento: string,
    id_usuario: string
  ): Promise<CanRateEvent> {
    const { data, error } = await supabase.rpc('puede_calificar_evento', {
      p_id_evento: id_evento,
      p_id_usuario: id_usuario
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener calificaciones de un evento
   */
  static async obtenerCalificacionesEvento(
    id_evento: string,
    opciones?: {
      limite?: number;
      offset?: number;
      calificacion_minima?: number;
      solo_con_comentarios?: boolean;
    }
  ): Promise<EventRatingWithUser[]> {
    const { data, error } = await supabase.rpc('obtener_calificaciones_evento', {
      p_id_evento: id_evento,
      p_limite: opciones?.limite || 10,
      p_offset: opciones?.offset || 0,
      p_calificacion_minima: opciones?.calificacion_minima || null,
      p_solo_con_comentarios: opciones?.solo_con_comentarios || false
    });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener estadísticas de calificaciones de un evento
   */
  static async obtenerEstadisticasEvento(id_evento: string): Promise<EventRatingStats> {
    const { data, error } = await supabase.rpc('calcular_rating_evento', {
      p_id_evento: id_evento
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener calificaciones de un usuario
   */
  static async obtenerCalificacionesUsuario(id_usuario: string) {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (
          titulo,
          fecha_evento,
          ubicacion,
          url_imagen
        )
      `)
      .eq('id_usuario', id_usuario)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener estadísticas de calificaciones de un usuario
   */
  static async obtenerEstadisticasUsuario(id_usuario: string): Promise<UserRatingStats> {
    const { data, error } = await supabase.rpc('obtener_estadisticas_calificaciones_usuario', {
      p_id_usuario: id_usuario
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Actualizar calificación
   */
  static async actualizarCalificacion(
    id: string,
    actualizaciones: EventRatingUpdate
  ) {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar calificación (marcar como no visible)
   */
  static async eliminarCalificacion(id: string) {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .update({ visible: false })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Moderar calificación
   */
  static async moderarCalificacion(
    id: string,
    visible: boolean,
    motivo_moderacion?: string
  ): Promise<ModerateRating> {
    const { data, error } = await supabase.rpc('moderar_calificacion', {
      p_id_calificacion: id,
      p_visible: visible,
      p_motivo_moderacion: motivo_moderacion || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener calificación por ID
   */
  static async obtenerCalificacionPorId(id: string) {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (
          titulo,
          fecha_evento,
          ubicacion,
          url_imagen
        ),
        usuarios (
          nombre_completo,
          url_avatar
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar calificaciones por texto
   */
  static async buscarCalificaciones(
    busqueda: string,
    id_evento?: string
  ) {
    let consulta = supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (titulo, fecha_evento),
        usuarios (nombre_completo)
      `)
      .ilike('comentario', `%${busqueda}%`)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false });

    if (id_evento) {
      consulta = consulta.eq('id_evento', id_evento);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener calificaciones por rango de fechas
   */
  static async obtenerCalificacionesPorRango(
    fecha_desde: string,
    fecha_hasta: string,
    id_evento?: string
  ) {
    let consulta = supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (titulo, fecha_evento, ubicacion),
        usuarios (nombre_completo)
      `)
      .gte('fecha_creacion', fecha_desde)
      .lte('fecha_creacion', fecha_hasta)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false });

    if (id_evento) {
      consulta = consulta.eq('id_evento', id_evento);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener calificaciones pendientes de moderación
   */
  static async obtenerCalificacionesPendientesModeracion() {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (titulo, fecha_evento),
        usuarios (nombre_completo)
      `)
      .eq('moderada', false)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener calificaciones por categoría
   */
  static async obtenerCalificacionesPorCategoria(
    categoria: string,
    id_evento?: string
  ) {
    let consulta = supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (titulo, fecha_evento),
        usuarios (nombre_completo)
      `)
      .eq('categoria_calificacion', categoria)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false });

    if (id_evento) {
      consulta = consulta.eq('id_evento', id_evento);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener eventos mejor calificados
   */
  static async obtenerEventosMejorCalificados(limite: number = 10) {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        calificaciones_eventos!inner (
          calificacion,
          visible
        )
      `)
      .eq('calificaciones_eventos.visible', true)
      .order('rating_promedio', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data;
  }

  /**
   * Obtener calificaciones recientes
   */
  static async obtenerCalificacionesRecientes(limite: number = 10) {
    const { data, error } = await supabase
      .from('calificaciones_eventos')
      .select(`
        *,
        eventos (
          titulo,
          fecha_evento,
          ubicacion,
          url_imagen
        ),
        usuarios (
          nombre_completo,
          url_avatar
        )
      `)
      .eq('visible', true)
      .order('fecha_creacion', { ascending: false })
      .limit(limite);

    if (error) throw error;
    return data;
  }
}
