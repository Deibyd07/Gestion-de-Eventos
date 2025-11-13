import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class EventService {
  static async obtenerEventos(filtros?: {
    categoria?: string;
    ubicacion?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    busqueda?: string;
    precioMinimo?: number;
    precioMaximo?: number;
  }) {
    let consulta = supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*)
      `)
      .eq('estado', 'proximo')
      .order('fecha_evento', { ascending: true });

    if (filtros?.categoria) {
      consulta = consulta.eq('categoria', filtros.categoria);
    }

    if (filtros?.ubicacion) {
      consulta = consulta.ilike('ubicacion', `%${filtros.ubicacion}%`);
    }

    if (filtros?.fechaDesde) {
      console.log('Aplicando filtro fecha desde:', filtros.fechaDesde);
      consulta = consulta.gte('fecha_evento', filtros.fechaDesde);
    }

    if (filtros?.fechaHasta) {
      console.log('Aplicando filtro fecha hasta:', filtros.fechaHasta);
      consulta = consulta.lte('fecha_evento', filtros.fechaHasta);
    }

    if (filtros?.busqueda) {
      consulta = consulta.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
    }

    // Filtros de precio - necesitamos filtrar por los tipos de entrada
    if (filtros?.precioMinimo !== undefined || filtros?.precioMaximo !== undefined) {
      // Para filtrar por precio, necesitamos usar una subconsulta o filtrar después
      // Por ahora, vamos a obtener todos los eventos y filtrar en el frontend
      // Esto es temporal hasta que implementemos una consulta más eficiente
    }

    // Debug: mostrar la consulta final
    console.log('Consulta Supabase con filtros:', filtros);

    const { data, error } = await consulta;
    if (error) {
      console.error('Error en consulta Supabase:', error);
      throw error;
    }
    console.log('Eventos devueltos por Supabase:', data?.length, 'eventos');
    return data;
  }

  static async obtenerCategorias() {
    const { data, error } = await supabase
      .from('eventos')
      .select('categoria')
      .not('categoria', 'is', null)
      .order('categoria');
    
    if (error) throw error;
    
    // Extraer categorías únicas
    const categoriasUnicas = [...new Set(data?.map(item => item.categoria) || [])];
    return categoriasUnicas;
  }

  static async obtenerUbicaciones() {
    const { data, error } = await supabase
      .from('eventos')
      .select('ubicacion')
      .not('ubicacion', 'is', null)
      .order('ubicacion');
    
    if (error) throw error;
    
    // Extraer ubicaciones únicas
    const ubicacionesUnicas = [...new Set(data?.map(item => item.ubicacion) || [])];
    return ubicacionesUnicas;
  }

  static async obtenerEventoPorId(id: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*),
        compras (
          id,
          cantidad,
          total_pagado,
          estado,
          fecha_creacion
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener detalle completo del evento con todas las relaciones
  static async obtenerEventoCompleto(id: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*),
        compras (
          id,
          cantidad,
          total_pagado,
          estado,
          fecha_creacion,
          id_usuario
        ),
        asistencia_eventos (
          id,
          fecha_asistencia,
          id_usuario
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async crearEvento(datosEvento: Tables['eventos']['Insert']) {
    const { data, error } = await supabase
      .from('eventos')
      .insert(datosEvento)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarEvento(id: string, actualizaciones: Tables['eventos']['Update']) {
    const { data, error } = await supabase
      .from('eventos')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarEvento(id: string) {
    // Verificar si hay compras asociadas antes de eliminar
    const { data: compras, error: comprasError } = await supabase
      .from('compras')
      .select('id, estado')
      .eq('id_evento', id);

    if (comprasError) throw comprasError;

    // Verificar si hay compras completadas
    const comprasCompletadas = compras?.filter(c => c.estado === 'completada') || [];
    
    if (comprasCompletadas.length > 0) {
      throw new Error(`No se puede eliminar el evento porque tiene ${comprasCompletadas.length} compra(s) completada(s). Considera cancelar el evento en su lugar.`);
    }

    // Si hay compras pendientes, eliminarlas primero
    if (compras && compras.length > 0) {
      const { error: deletePurchasesError } = await supabase
        .from('compras')
        .delete()
        .eq('id_evento', id)
        .in('estado', ['pendiente', 'cancelada', 'fallida']);

      if (deletePurchasesError) throw deletePurchasesError;
    }

    // Eliminar registros relacionados
    // 1. Asistencia
    await supabase.from('asistencia_eventos').delete().eq('id_evento', id);
    
    // 2. Analytics
    await supabase.from('analiticas_eventos').delete().eq('id_evento', id);
    
    // 3. Tipos de entrada
    await supabase.from('tipos_entrada').delete().eq('id_evento', id);

    // Finalmente, eliminar el evento
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Cancelar evento (soft delete - cambiar estado a 'cancelado')
  static async cancelarEvento(id: string, motivo?: string) {
    const { data, error } = await supabase
      .from('eventos')
      .update({ 
        estado: 'cancelado',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Aquí podrías agregar lógica para:
    // - Notificar a los asistentes
    // - Procesar reembolsos automáticos
    // - Registrar el motivo de cancelación

    return data;
  }

  // Publicar/despublicar evento
  static async cambiarEstadoEvento(id: string, nuevoEstado: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado') {
    const { data, error } = await supabase
      .from('eventos')
      .update({ 
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerEventosUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*)
      `)
      .eq('id_organizador', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async obtenerTodosEventos() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*');

    if (error) throw error;
    return data || [];
  }
}
