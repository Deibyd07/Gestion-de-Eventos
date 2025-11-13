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
    estado?: string;
  }) {
    let consulta = supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*)
      `)
      .order('fecha_evento', { ascending: true });

    if (filtros?.estado) {
      consulta = consulta.eq('estado', filtros.estado as any);
    }

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
        analiticas_eventos (*)
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
    const { data, error} = await supabase
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

  static async actualizarImagenEvento(id: string, urlImagen: string) {
    const { data, error } = await supabase
      .from('eventos')
      .update({ url_imagen: urlImagen })
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

  /**
   * Duplica un evento existente con todos sus tipos de entrada
   * @param eventoId - ID del evento a duplicar
   * @param ajustes - Objeto opcional con ajustes para el nuevo evento (titulo, fecha, etc.)
   * @returns Evento duplicado con sus tipos de entrada
   */
  static async duplicarEvento(
    eventoId: string, 
    ajustes?: {
      titulo?: string;
      fecha_evento?: string;
      hora_evento?: string;
    }
  ) {
    try {
      console.log('🔄 Iniciando duplicación de evento:', eventoId);
      console.log('📝 Ajustes recibidos:', ajustes);
      
      // 1. Obtener el evento original con sus tipos de entrada
      const eventoOriginal = await this.obtenerEventoPorId(eventoId);
      console.log('📋 Evento original obtenido:', eventoOriginal);
      
      if (!eventoOriginal) {
        throw new Error('Evento no encontrado');
      }

      // 2. Preparar datos del nuevo evento
      const nuevoEvento: Tables['eventos']['Insert'] = {
        titulo: ajustes?.titulo || `${eventoOriginal.titulo} (Copia)`,
        descripcion: eventoOriginal.descripcion,
        url_imagen: eventoOriginal.url_imagen,
        fecha_evento: ajustes?.fecha_evento || eventoOriginal.fecha_evento,
        hora_evento: ajustes?.hora_evento || eventoOriginal.hora_evento,
        ubicacion: eventoOriginal.ubicacion,
        categoria: eventoOriginal.categoria,
        maximo_asistentes: eventoOriginal.maximo_asistentes,
        asistentes_actuales: 0, // Reiniciar asistentes
        id_organizador: eventoOriginal.id_organizador,
        nombre_organizador: eventoOriginal.nombre_organizador,
        etiquetas: eventoOriginal.etiquetas,
      };

      console.log('✨ Datos del nuevo evento preparados:', nuevoEvento);

      // 3. Crear el nuevo evento
      const eventoDuplicado = await this.crearEvento(nuevoEvento);
      console.log('✅ Evento duplicado creado en BD:', eventoDuplicado);

      // 4. Duplicar los tipos de entrada si existen
      if (eventoOriginal.tipos_entrada && eventoOriginal.tipos_entrada.length > 0) {
        console.log(`🎫 Duplicando ${eventoOriginal.tipos_entrada.length} tipos de entrada...`);
        
        const tiposEntradaPromises = eventoOriginal.tipos_entrada.map((tipo: any) => {
          return supabase
            .from('tipos_entrada')
            .insert({
              id_evento: eventoDuplicado.id,
              nombre_tipo: tipo.nombre_tipo,
              precio: tipo.precio,
              descripcion: tipo.descripcion,
              cantidad_maxima: tipo.cantidad_maxima,
              cantidad_disponible: tipo.cantidad_maxima, // Reiniciar disponibilidad
              nombre_evento: eventoDuplicado.titulo
            })
            .select()
            .single();
        });

        const resultadosTipos = await Promise.all(tiposEntradaPromises);
        console.log('✅ Tipos de entrada duplicados:', resultadosTipos);
      } else {
        console.log('ℹ️ No hay tipos de entrada para duplicar');
      }

      // 5. Obtener el evento completo con sus tipos de entrada
      const eventoCompleto = await this.obtenerEventoPorId(eventoDuplicado.id);
      console.log('🎉 Evento completo duplicado:', eventoCompleto);
      
      return eventoCompleto;
    } catch (error) {
      console.error('❌ Error al duplicar evento:', error);
      throw error;
    }
  }
}
