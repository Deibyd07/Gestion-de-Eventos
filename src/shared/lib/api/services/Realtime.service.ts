import { supabase } from '../supabase';

export class RealtimeService {
  static suscribirseANotificaciones(idUsuario: string, callback: (payload: any) => void) {
    return supabase
      .channel('notificaciones')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notificaciones',
          filter: `id_usuario=eq.${idUsuario}`
        }, 
        callback
      )
      .subscribe();
  }

  static suscribirseAEventos(idEvento: string, callback: (payload: any) => void) {
    return supabase
      .channel('eventos')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'eventos',
          filter: `id=eq.${idEvento}`
        }, 
        callback
      )
      .subscribe();
  }

  static suscribirseACompras(idUsuario: string, callback: (payload: any) => void) {
    return supabase
      .channel('compras')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'compras',
          filter: `id_usuario=eq.${idUsuario}`
        }, 
        callback
      )
      .subscribe();
  }
}
