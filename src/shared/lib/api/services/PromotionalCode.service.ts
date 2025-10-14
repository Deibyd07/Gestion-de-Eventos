import { supabase } from '../supabase';

// Definir tipos manualmente hasta que se actualice el archivo de tipos de Supabase
interface PromotionalCodeInsert {
  codigo: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'fijo';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  uso_maximo?: number;
  id_evento?: string;
  id_organizador: string;
  activo?: boolean;
}

interface PromotionalCodeUpdate {
  descripcion?: string;
  tipo_descuento?: 'porcentaje' | 'fijo';
  valor_descuento?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  uso_maximo?: number;
  activo?: boolean;
}

export interface PromotionalCode {
  id: string;
  codigo: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'fijo';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  uso_maximo?: number;
  usos_actuales: number;
  id_evento?: string;
  id_organizador: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PromotionalCodeValidation {
  valido: boolean;
  mensaje: string;
  descuento: number;
  tipo_descuento: string;
}

export interface PromotionalCodeApplication {
  precio_final: number;
  descuento_aplicado: number;
  mensaje: string;
}

export class PromotionalCodeService {
  /**
   * Crear un nuevo código promocional
   */
  static async crearCodigoPromocional(datosCodigo: PromotionalCodeInsert) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .insert(datosCodigo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener todos los códigos promocionales
   */
  static async obtenerCodigosPromocionales(filtros?: {
    id_organizador?: string;
    id_evento?: string;
    activo?: boolean;
  }) {
    let consulta = supabase
      .from('codigos_promocionales')
      .select(`
        *,
        eventos (titulo, fecha_evento),
        usuarios (nombre_completo)
      `)
      .order('fecha_creacion', { ascending: false });

    if (filtros?.id_organizador) {
      consulta = consulta.eq('id_organizador', filtros.id_organizador);
    }

    if (filtros?.id_evento) {
      consulta = consulta.eq('id_evento', filtros.id_evento);
    }

    if (filtros?.activo !== undefined) {
      consulta = consulta.eq('activo', filtros.activo);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener código promocional por ID
   */
  static async obtenerCodigoPromocionalPorId(id: string) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .select(`
        *,
        eventos (titulo, fecha_evento, ubicacion),
        usuarios (nombre_completo, correo_electronico)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Validar código promocional
   */
  static async validarCodigoPromocional(
    codigo: string,
    id_evento?: string,
    id_usuario?: string
  ): Promise<PromotionalCodeValidation> {
    const { data, error } = await supabase.rpc('validar_codigo_promocional', {
      p_codigo: codigo,
      p_id_evento: id_evento || null,
      p_id_usuario: id_usuario || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Aplicar código promocional a un precio
   */
  static async aplicarCodigoPromocional(
    codigo: string,
    precio_original: number,
    id_evento?: string
  ): Promise<PromotionalCodeApplication> {
    const { data, error } = await supabase.rpc('aplicar_codigo_promocional', {
      p_codigo: codigo,
      p_precio_original: precio_original,
      p_id_evento: id_evento || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Actualizar código promocional
   */
  static async actualizarCodigoPromocional(
    id: string,
    actualizaciones: PromotionalCodeUpdate
  ) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar código promocional
   */
  static async eliminarCodigoPromocional(id: string) {
    const { error } = await supabase
      .from('codigos_promocionales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Activar/Desactivar código promocional
   */
  static async toggleCodigoPromocional(id: string, activo: boolean) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .update({ activo })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener estadísticas de uso de código promocional
   */
  static async obtenerEstadisticasCodigo(id: string) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .select(`
        codigo,
        usos_actuales,
        uso_maximo,
        fecha_inicio,
        fecha_fin,
        activo
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    const porcentaje_uso = data.uso_maximo 
      ? (data.usos_actuales / data.uso_maximo) * 100 
      : 0;

    const dias_restantes = new Date(data.fecha_fin).getTime() - new Date().getTime();
    const dias_restantes_calculados = Math.ceil(dias_restantes / (1000 * 60 * 60 * 24));

    return {
      ...data,
      porcentaje_uso: Math.round(porcentaje_uso),
      dias_restantes: Math.max(0, dias_restantes_calculados),
      esta_expirado: new Date() > new Date(data.fecha_fin),
      esta_agotado: data.uso_maximo ? data.usos_actuales >= data.uso_maximo : false
    };
  }

  /**
   * Buscar códigos promocionales por texto
   */
  static async buscarCodigosPromocionales(
    busqueda: string,
    id_organizador?: string
  ) {
    let consulta = supabase
      .from('codigos_promocionales')
      .select(`
        *,
        eventos (titulo, fecha_evento),
        usuarios (nombre_completo)
      `)
      .or(`codigo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
      .order('fecha_creacion', { ascending: false });

    if (id_organizador) {
      consulta = consulta.eq('id_organizador', id_organizador);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }
}
