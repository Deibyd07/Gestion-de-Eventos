import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class NotificationService {
  static async crearNotificacion(datosNotificacion: Tables['notificaciones']['Insert']) {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert(datosNotificacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerNotificacionesUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async marcarComoLeida(id: string) {
    const { data, error } = await supabase
      .from('notificaciones')
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
}
