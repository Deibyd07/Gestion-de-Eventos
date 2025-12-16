import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class NotificationService {
  static async crearNotificacion(datosNotificacion: Tables['notificaciones']['Insert']) {
    const { data, error } = await supabase
      .from('notificaciones')
      // @ts-ignore - Supabase types issue
      .insert(datosNotificacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerNotificacionesUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select(`
        *,
        eventos:id_evento (
          id,
          titulo,
          fecha_evento,
          ubicacion,
          estado,
          url_imagen
        )
      `)
      .eq('id_usuario', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async marcarComoLeida(id: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      // @ts-ignore - Supabase types issue
      .update({ leida: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async marcarTodasComoLeidas(idUsuario: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      // @ts-ignore - Supabase types issue
      .update({ leida: true })
      .eq('id_usuario', idUsuario)
      .eq('leida', false)
      .select();

    if (error) throw error;
    return data;
  }

  static async eliminarNotificacion(id: string) {
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Crea notificaciones masivas para múltiples usuarios
   */
  static async crearNotificacionesMasivas(notificaciones: Tables['notificaciones']['Insert'][]) {
    const { data, error } = await supabase
      .from('notificaciones')
      // @ts-ignore - Supabase types issue
      .insert(notificaciones)
      .select();

    if (error) {
      console.error('Error al crear notificaciones masivas:', error);
      throw error;
    }

    return data;
  }

  /**
   * Notifica a todos los asistentes de un evento cancelado
   */
  static async notificarEventoCancelado(
    idEvento: string, 
    tituloEvento: string, 
    motivo?: string
  ): Promise<number> {
    try {
      // 1. Obtener todos los usuarios que compraron entradas para este evento
      const { data: compras, error: comprasError } = await supabase
        .from('compras')
        .select('id_usuario')
        .eq('id_evento', idEvento)
        .in('estado', ['completada', 'pendiente']); // Solo compras activas

      if (comprasError) {
        console.error('Error al obtener compras:', comprasError);
        throw comprasError;
      }

      if (!compras || compras.length === 0) {
        console.log('No hay compradores para notificar');
        return 0;
      }

      // 2. Eliminar duplicados (un usuario puede tener múltiples compras)
      const usuariosUnicos = Array.from(
        new Set((compras as any[]).map((c: any) => c.id_usuario))
      );

      console.log(`Notificando a ${usuariosUnicos.length} usuarios sobre cancelación del evento`);

      // 3. Crear notificaciones para cada usuario único
      const notificaciones: any[] = usuariosUnicos.map(idUsuario => ({
        id_usuario: idUsuario,
        id_evento: idEvento, // Referencia al evento para obtener datos actualizados
        tipo: 'evento',
        titulo: `Evento Cancelado: ${tituloEvento}`,
        mensaje: motivo 
          ? `El evento "${tituloEvento}" ha sido cancelado. Motivo: ${motivo}. Tus entradas serán reembolsadas automáticamente.`
          : `El evento "${tituloEvento}" ha sido cancelado. Tus entradas serán reembolsadas automáticamente.`,
        leida: false,
        url_accion: `/events/${idEvento}`,
        texto_accion: 'Ver detalles',
        metadata: {
          nombre_evento_original: tituloEvento,
          tipo_notificacion: 'evento_cancelado',
          fecha_cancelacion: new Date().toISOString()
        }
      }));

      // 4. Crear notificaciones en batch
      await this.crearNotificacionesMasivas(notificaciones);

      // 5. Actualizar estado de asistencia si existen registros (opcional)
      const { data: asistencias } = await supabase
        .from('asistencia_eventos')
        .select('id')
        .eq('id_evento', idEvento)
        .neq('estado_asistencia', 'cancelado')
        .limit(1);

      if (asistencias && asistencias.length > 0) {
        await supabase
          .from('asistencia_eventos')
          // @ts-ignore - Supabase types issue
          .update({ 
            estado_asistencia: 'cancelado',
            observaciones: motivo || 'Evento cancelado por el organizador'
          })
          .eq('id_evento', idEvento)
          .neq('estado_asistencia', 'cancelado');
      }

      return usuariosUnicos.length;
    } catch (error) {
      console.error('Error al notificar cancelación de evento:', error);
      throw error;
    }
  }

  /**
   * Cuenta notificaciones no leídas de un usuario
   */
  static async contarNoLeidas(idUsuario: string): Promise<number> {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('id_usuario', idUsuario)
      .eq('leida', false);

    if (error) {
      console.error('Error al contar notificaciones no leídas:', error);
      throw error;
    }

    return count || 0;
  }
}
