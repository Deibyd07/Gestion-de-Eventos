import { supabase } from '../supabase';

export interface UserFavorite {
  id: string;
  id_usuario: string;
  id_evento: string;
  categoria_favorito: string;
  notas_personales?: string;
  recordatorio_activo: boolean;
  fecha_recordatorio?: string;
  prioridad: number;
  visible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UserFavoriteCreate {
  id_evento: string;
  categoria_favorito?: string;
  notas_personales?: string;
  prioridad?: number;
  recordatorio_activo?: boolean;
  fecha_recordatorio?: string;
}

export interface UserFavoriteUpdate {
  categoria_favorito?: string;
  notas_personales?: string;
  prioridad?: number;
  recordatorio_activo?: boolean;
  fecha_recordatorio?: string;
}

export interface FavoriteWithEvent {
  id: string;
  id_evento: string;
  categoria_favorito: string;
  notas_personales?: string;
  prioridad: number;
  recordatorio_activo: boolean;
  fecha_recordatorio?: string;
  fecha_creacion: string;
  // Datos del evento
  titulo_evento: string;
  descripcion_evento: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion_evento: string;
  url_imagen_evento: string;
  categoria_evento: string;
  precio_minimo: number;
  asistentes_actuales: number;
  maximo_asistentes: number;
  nombre_organizador: string;
  dias_restantes: number;
  esta_lleno: boolean;
}

export interface AddFavoriteResult {
  exito: boolean;
  mensaje: string;
  id_favorito?: string;
}

export interface IsFavoriteResult {
  es_favorito: boolean;
  categoria_favorito?: string;
  fecha_agregado?: string;
  prioridad?: number;
}

export interface FavoriteStats {
  total_favoritos: number;
  favoritos_por_categoria: Record<string, number>;
  eventos_proximos: number;
  eventos_llenos: number;
  eventos_pasados: number;
  recordatorios_activos: number;
}

export interface PendingReminder {
  id_favorito: string;
  id_usuario: string;
  id_evento: string;
  titulo_evento: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion_evento: string;
  fecha_recordatorio: string;
  notas_personales?: string;
}

export class UserFavoritesService {
  /**
   * Agregar evento a favoritos
   */
  static async agregarFavorito(
    id_usuario: string,
    datosFavorito: UserFavoriteCreate
  ): Promise<AddFavoriteResult> {
    const { data, error } = await supabase.rpc('agregar_favorito', {
      p_id_usuario: id_usuario,
      p_id_evento: datosFavorito.id_evento,
      p_categoria_favorito: datosFavorito.categoria_favorito || 'general',
      p_notas_personales: datosFavorito.notas_personales || null,
      p_prioridad: datosFavorito.prioridad || 1,
      p_recordatorio_activo: datosFavorito.recordatorio_activo || false,
      p_fecha_recordatorio: datosFavorito.fecha_recordatorio || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Verificar si un evento está en favoritos
   */
  static async esFavorito(
    id_usuario: string,
    id_evento: string
  ): Promise<IsFavoriteResult> {
    const { data, error } = await supabase.rpc('es_favorito', {
      p_id_usuario: id_usuario,
      p_id_evento: id_evento
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener favoritos de un usuario
   */
  static async obtenerFavoritosUsuario(
    id_usuario: string,
    opciones?: {
      categoria?: string;
      limite?: number;
      offset?: number;
      ordenar_por?: 'fecha_creacion' | 'prioridad' | 'fecha_evento';
    }
  ): Promise<FavoriteWithEvent[]> {
    const { data, error } = await supabase.rpc('obtener_favoritos_usuario', {
      p_id_usuario: id_usuario,
      p_categoria: opciones?.categoria || null,
      p_limite: opciones?.limite || 20,
      p_offset: opciones?.offset || 0,
      p_ordenar_por: opciones?.ordenar_por || 'fecha_creacion'
    });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener estadísticas de favoritos de un usuario
   */
  static async obtenerEstadisticasUsuario(id_usuario: string): Promise<FavoriteStats> {
    const { data, error } = await supabase.rpc('obtener_estadisticas_favoritos_usuario', {
      p_id_usuario: id_usuario
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Actualizar favorito
   */
  static async actualizarFavorito(
    id_favorito: string,
    actualizaciones: UserFavoriteUpdate
  ) {
    const { data, error } = await supabase.rpc('actualizar_favorito', {
      p_id_favorito: id_favorito,
      p_categoria_favorito: actualizaciones.categoria_favorito || null,
      p_notas_personales: actualizaciones.notas_personales || null,
      p_prioridad: actualizaciones.prioridad || null,
      p_recordatorio_activo: actualizaciones.recordatorio_activo || null,
      p_fecha_recordatorio: actualizaciones.fecha_recordatorio || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Eliminar favorito
   */
  static async eliminarFavorito(id_usuario: string, id_evento: string) {
    const { data, error } = await supabase.rpc('eliminar_favorito', {
      p_id_usuario: id_usuario,
      p_id_evento: id_evento
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener recordatorios pendientes
   */
  static async obtenerRecordatoriosPendientes(): Promise<PendingReminder[]> {
    const { data, error } = await supabase.rpc('obtener_recordatorios_pendientes');

    if (error) throw error;
    return data;
  }

  /**
   * Obtener favoritos por categoría
   */
  static async obtenerFavoritosPorCategoria(
    id_usuario: string,
    categoria: string
  ) {
    return this.obtenerFavoritosUsuario(id_usuario, { categoria });
  }

  /**
   * Obtener favoritos próximos (eventos que están por ocurrir)
   */
  static async obtenerFavoritosProximos(id_usuario: string, dias: number = 30) {
    const fecha_limite = new Date();
    fecha_limite.setDate(fecha_limite.getDate() + dias);

    const { data, error } = await supabase
      .from('favoritos_usuarios')
      .select(`
        *,
        eventos (
          titulo,
          descripcion,
          fecha_evento,
          hora_evento,
          ubicacion,
          url_imagen,
          categoria,
          asistentes_actuales,
          maximo_asistentes
        )
      `)
      .eq('id_usuario', id_usuario)
      .eq('visible', true)
      .gte('eventos.fecha_evento', new Date().toISOString().split('T')[0])
      .lte('eventos.fecha_evento', fecha_limite.toISOString().split('T')[0])
      .order('eventos.fecha_evento', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener favoritos con recordatorios activos
   */
  static async obtenerFavoritosConRecordatorios(id_usuario: string) {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
      .select(`
        *,
        eventos (
          titulo,
          fecha_evento,
          hora_evento,
          ubicacion
        )
      `)
      .eq('id_usuario', id_usuario)
      .eq('visible', true)
      .eq('recordatorio_activo', true)
      .order('fecha_recordatorio', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Buscar favoritos por texto
   */
  static async buscarFavoritos(
    id_usuario: string,
    busqueda: string
  ) {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
      .select(`
        *,
        eventos (
          titulo,
          descripcion,
          fecha_evento,
          ubicacion,
          url_imagen
        )
      `)
      .eq('id_usuario', id_usuario)
      .eq('visible', true)
      .or(`notas_personales.ilike.%${busqueda}%,eventos.titulo.ilike.%${busqueda}%,eventos.descripcion.ilike.%${busqueda}%`)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener favoritos por prioridad
   */
  static async obtenerFavoritosPorPrioridad(
    id_usuario: string,
    prioridad_minima: number = 1
  ) {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
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
      .gte('prioridad', prioridad_minima)
      .order('prioridad', { ascending: false })
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener favoritos por rango de fechas
   */
  static async obtenerFavoritosPorRango(
    id_usuario: string,
    fecha_desde: string,
    fecha_hasta: string
  ) {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
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
      .gte('fecha_creacion', fecha_desde)
      .lte('fecha_creacion', fecha_hasta)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener favorito por ID
   */
  static async obtenerFavoritoPorId(id_favorito: string) {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
      .select(`
        *,
        eventos (
          titulo,
          descripcion,
          fecha_evento,
          hora_evento,
          ubicacion,
          url_imagen,
          categoria,
          asistentes_actuales,
          maximo_asistentes,
          nombre_organizador
        ),
        usuarios (
          nombre_completo,
          correo_electronico
        )
      `)
      .eq('id', id_favorito)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener eventos más favoritos (estadísticas globales)
   */
  static async obtenerEventosMasFavoritos(limite: number = 10) {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
      .select(`
        id_evento,
        eventos (
          titulo,
          fecha_evento,
          ubicacion,
          url_imagen,
          categoria
        )
      `)
      .eq('visible', true)
      .eq('eventos.estado', 'proximo');

    if (error) throw error;

    // Contar favoritos por evento
    const conteo = data.reduce((acc: Record<string, any>, item) => {
      const eventoId = item.id_evento;
      if (!acc[eventoId]) {
        acc[eventoId] = {
          ...item.eventos,
          total_favoritos: 0
        };
      }
      acc[eventoId].total_favoritos++;
      return acc;
    }, {});

    // Ordenar por total de favoritos y limitar
    return Object.values(conteo)
      .sort((a: any, b: any) => b.total_favoritos - a.total_favoritos)
      .slice(0, limite);
  }

  /**
   * Obtener categorías de favoritos más populares
   */
  static async obtenerCategoriasPopulares() {
    const { data, error } = await supabase
      .from('favoritos_usuarios')
      .select('categoria_favorito')
      .eq('visible', true);

    if (error) throw error;

    // Contar categorías
    const conteo = data.reduce((acc: Record<string, number>, item) => {
      acc[item.categoria_favorito] = (acc[item.categoria_favorito] || 0) + 1;
      return acc;
    }, {});

    // Ordenar por popularidad
    return Object.entries(conteo)
      .map(([categoria, cantidad]) => ({ categoria, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }
}
