import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];
type Evento = Tables['eventos']['Row'];
type EventoInsert = Tables['eventos']['Insert'];
type EventoUpdate = Tables['eventos']['Update'];

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
    
    // Calcular asistencia real basada en códigos QR escaneados
    if (data && data.length > 0) {
      const eventIds = data.map((e: any) => e.id);
      const { data: qrEscaneados, error: qrError } = await supabase
        .from('codigos_qr_entradas')
        .select('id_evento')
        .in('id_evento', eventIds)
        .eq('estado', 'usado');
      
      if (!qrError && qrEscaneados) {
        const asistenciasPorEvento = new Map<string, number>();
        (qrEscaneados as any[]).forEach((qr: any) => {
          const count = asistenciasPorEvento.get(qr.id_evento) || 0;
          asistenciasPorEvento.set(qr.id_evento, count + 1);
        });
        
        // Actualizar cada evento con la asistencia real
        (data as any[]).forEach((evento: any) => {
          evento.asistentes_reales = asistenciasPorEvento.get(evento.id) || 0;
        });
      }
    }
    
    return data;
  }

  // Obtener los 3 eventos con mayor actividad reciente (compras + asistencias)
  static async obtenerEventosDestacados(limite: number = 3) {
    try {
      // 1. Obtener todos los eventos publicados
      const { data: eventos, error: eventosError } = await supabase
        .from('eventos')
        .select(`
          *,
          tipos_entrada (*),
          analiticas_eventos (*)
        `)
        .eq('estado', 'publicado')
        .order('fecha_evento', { ascending: true });

      if (eventosError) throw eventosError;
      if (!eventos || eventos.length === 0) return [];

      const eventIds = (eventos as any[]).map((e: any) => e.id);

      // 2. Obtener conteo de compras por evento (últimos 30 días)
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select('id_evento')
        .in('id_evento', eventIds)
        .eq('estado', 'completada')
        .gte('fecha_creacion', treintaDiasAtras.toISOString());

      if (comprasError) console.error('Error obteniendo compras:', comprasError);

      // 3. Obtener conteo de asistencias por evento (últimos 30 días)
      const { data: asistencias, error: asistenciasError } = await supabase
        .from('codigos_qr_entradas')
        .select('id_evento')
        .in('id_evento', eventIds)
        .eq('estado', 'usado')
        .gte('fecha_escaneado', treintaDiasAtras.toISOString());

      if (asistenciasError) console.error('Error obteniendo asistencias:', asistenciasError);

      // 4. Calcular actividad por evento
      const actividadPorEvento = new Map<string, number>();

      // Contar compras
      ((compras as any[]) || []).forEach((c: any) => {
        const count = actividadPorEvento.get(c.id_evento) || 0;
        actividadPorEvento.set(c.id_evento, count + 1);
      });

      // Contar asistencias
      ((asistencias as any[]) || []).forEach((a: any) => {
        const count = actividadPorEvento.get(a.id_evento) || 0;
        actividadPorEvento.set(a.id_evento, count + 1);
      });

      // 5. Calcular asistencia real por evento
      const { data: todosQrEscaneados, error: todosQrError } = await supabase
        .from('codigos_qr_entradas')
        .select('id_evento')
        .in('id_evento', eventIds)
        .eq('estado', 'usado');

      const asistenciaRealPorEvento = new Map<string, number>();
      if (!todosQrError && todosQrEscaneados) {
        (todosQrEscaneados as any[]).forEach((qr: any) => {
          const count = asistenciaRealPorEvento.get(qr.id_evento) || 0;
          asistenciaRealPorEvento.set(qr.id_evento, count + 1);
        });
      }

      // 6. Ordenar eventos por actividad y tomar los top 3
      const eventosConActividad = (eventos as any[])
        .map((evento: any) => ({
          ...evento,
          actividad: actividadPorEvento.get(evento.id) || 0,
          asistentes_reales: asistenciaRealPorEvento.get(evento.id) || 0
        }))
        .sort((a, b) => b.actividad - a.actividad)
        .slice(0, limite);

      return eventosConActividad;
    } catch (error) {
      console.error('Error obteniendo eventos destacados:', error);
      throw error;
    }
  }

  static async obtenerCategorias() {
    const { data, error } = await supabase
      .from('eventos')
      .select('categoria')
      .not('categoria', 'is', null)
      .order('categoria');
    
    if (error) throw error;
    
    // Extraer categorías únicas
    const categoriasUnicas = [...new Set((data as any[])?.map((item: any) => item.categoria) || [])];
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
    const ubicacionesUnicas = [...new Set((data as any[])?.map((item: any) => item.ubicacion) || [])];
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

  static async crearEvento(datosEvento: EventoInsert) {
    const { data, error } = await supabase
      .from('eventos')
      .insert(datosEvento as any)
      .select()
      .single();

    if (error) throw error;

    // Notificar seguidores del organizador sobre el nuevo evento
    try {
      const { data: seguidores } = await supabase
        .from('seguidores_organizadores')
        .select('id_usuario_seguidor')
        .eq('id_organizador', datosEvento.id_organizador);

      if (seguidores && seguidores.length > 0 && data) {
        const inserts = (seguidores as any[]).map((seg: any) => ({
          id_usuario: seg.id_usuario_seguidor,
          id_evento: (data as any).id, // Referencia al evento para datos actualizados
          tipo: 'evento',
          titulo: `Nuevo evento`,
          mensaje: `Tu organizador favorito ha publicado un nuevo evento.`,
          url_accion: `/events/${(data as any).id}`,
          texto_accion: 'Ver evento',
          metadata: {
            nombre_organizador: datosEvento.nombre_organizador,
            tipo_notificacion: 'nuevo_evento',
            fecha_publicacion: new Date().toISOString()
          }
        }));
        await supabase.from('notificaciones').insert(inserts as any);
      }
    } catch (e) {
      console.error('Error creando notificaciones para seguidores:', e);
    }

    return data;
  }

  static async actualizarEvento(id: string, actualizaciones: EventoUpdate) {
    const { data, error } = await supabase
      .from('eventos')
      // @ts-ignore - Supabase types issue
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
    const comprasCompletadas = (compras as any[])?.filter((c: any) => c.estado === 'completada') || [];
    
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
    // Primero obtenemos la información del evento
    const { data: evento, error: eventoError } = await supabase
      .from('eventos')
      .select('titulo')
      .eq('id', id)
      .single();

    if (eventoError) throw eventoError;

    const { data, error } = await supabase
      .from('eventos')
      // @ts-ignore - Supabase types issue
      .update({ 
        estado: 'cancelado',
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notificar a todos los asistentes
    try {
      const { NotificationService } = await import('./Notification.service');
      const numUsuariosNotificados = await NotificationService.notificarEventoCancelado(
        id, 
        (evento as any)?.titulo, 
        motivo
      );
      console.log(`✅ ${numUsuariosNotificados} usuarios notificados sobre la cancelación`);
    } catch (notifError) {
      console.error('⚠️ Error al enviar notificaciones, pero el evento fue cancelado:', notifError);
      // No lanzamos el error para que la cancelación del evento se complete
    }

    return data;
  }

  // Publicar/despublicar evento
  static async cambiarEstadoEvento(id: string, nuevoEstado: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado', motivo?: string) {
    // Si se cancela, primero obtenemos el título del evento
    let tituloEvento: string | undefined;
    if (nuevoEstado === 'cancelado') {
      const { data: evento, error: eventoError } = await supabase
        .from('eventos')
        .select('titulo')
        .eq('id', id)
        .single();

      if (!eventoError && evento) {
        tituloEvento = (evento as any).titulo;
      }
    }

    const { data, error} = await supabase
      .from('eventos')
      // @ts-ignore - Supabase types issue
      .update({ 
        estado: nuevoEstado,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Si se cancela el evento, notificar a los asistentes
    if (nuevoEstado === 'cancelado' && tituloEvento) {
      try {
        const { NotificationService } = await import('./Notification.service');
        const numUsuariosNotificados = await NotificationService.notificarEventoCancelado(
          id, 
          tituloEvento, 
          motivo
        );
        console.log(`✅ ${numUsuariosNotificados} usuarios notificados sobre la cancelación`);
      } catch (notifError) {
        console.error('⚠️ Error al enviar notificaciones, pero el evento fue cancelado:', notifError);
        // No lanzamos el error para que la cancelación del evento se complete
      }
    }

    return data;
  }

  static async actualizarImagenEvento(id: string, urlImagen: string) {
    const { data, error } = await supabase
      .from('eventos')
      // @ts-ignore - Supabase types issue
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
      .order('fecha_creacion', { ascending: false });

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
      const nuevoEvento: EventoInsert = {
        titulo: ajustes?.titulo || `${(eventoOriginal as any).titulo} (Copia)`,
        descripcion: (eventoOriginal as any).descripcion,
        url_imagen: (eventoOriginal as any).url_imagen,
        fecha_evento: ajustes?.fecha_evento || (eventoOriginal as any).fecha_evento,
        hora_evento: ajustes?.hora_evento || (eventoOriginal as any).hora_evento,
        ubicacion: (eventoOriginal as any).ubicacion,
        categoria: (eventoOriginal as any).categoria,
        maximo_asistentes: (eventoOriginal as any).maximo_asistentes,
        asistentes_actuales: 0, // Reiniciar asistentes
        id_organizador: (eventoOriginal as any).id_organizador,
        nombre_organizador: (eventoOriginal as any).nombre_organizador,
        etiquetas: (eventoOriginal as any).etiquetas,
      };

      console.log('✨ Datos del nuevo evento preparados:', nuevoEvento);

      // 3. Crear el nuevo evento
      const eventoDuplicado = await this.crearEvento(nuevoEvento);
      console.log('✅ Evento duplicado creado en BD:', eventoDuplicado);

      if (!eventoDuplicado) {
        throw new Error('Error al crear el evento duplicado');
      }

      // 4. Duplicar los tipos de entrada si existen
      if ((eventoOriginal as any).tipos_entrada && (eventoOriginal as any).tipos_entrada.length > 0) {
        console.log(`🎫 Duplicando ${(eventoOriginal as any).tipos_entrada.length} tipos de entrada...`);
        
        const tiposEntradaPromises = (eventoOriginal as any).tipos_entrada.map((tipo: any) => {
          return supabase
            .from('tipos_entrada')
            .insert({
              id_evento: (eventoDuplicado as any).id,
              nombre_tipo: tipo.nombre_tipo,
              tipo: tipo.tipo,
              precio: tipo.precio,
              descripcion: tipo.descripcion,
              cantidad_maxima: tipo.cantidad_maxima,
              cantidad_disponible: tipo.cantidad_maxima, // Reiniciar disponibilidad
              nombre_evento: (eventoDuplicado as any).titulo
            } as any)
            .select()
            .single();
        });

        const resultadosTipos = await Promise.all(tiposEntradaPromises);
        console.log('✅ Tipos de entrada duplicados:', resultadosTipos);
      } else {
        console.log('ℹ️ No hay tipos de entrada para duplicar');
      }

      // 5. Obtener el evento completo con sus tipos de entrada
      const eventoCompleto = await this.obtenerEventoPorId((eventoDuplicado as any).id);
      console.log('🎉 Evento completo duplicado:', eventoCompleto);
      
      return eventoCompleto;
    } catch (error) {
      console.error('❌ Error al duplicar evento:', error);
      throw error;
    }
  }
}
