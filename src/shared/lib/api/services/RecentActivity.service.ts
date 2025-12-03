import { supabase } from '../supabase';

export type ActivityType = 'user_registration' | 'event_created' | 'payment_received' | 'system_alert';

export interface RecentActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

/**
 * Servicio para obtener actividad reciente del sistema
 */
export class RecentActivityService {
  /**
   * Obtiene las actividades recientes del sistema (últimas 10)
   */
  static async getRecentActivities(limit: number = 10): Promise<RecentActivityItem[]> {
    try {
      const activities: RecentActivityItem[] = [];

      // Obtener actividades en paralelo
      const [userActivities, eventActivities, paymentActivities] = await Promise.all([
        this.getUserRegistrations(limit),
        this.getEventCreations(limit),
        this.getPaymentReceived(limit)
      ]);

      // Combinar todas las actividades
      activities.push(...userActivities);
      activities.push(...eventActivities);
      activities.push(...paymentActivities);

      // Ordenar por fecha más reciente y limitar
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

      return sortedActivities;
    } catch (error) {
      console.error('Error al obtener actividades recientes:', error);
      return [];
    }
  }

  /**
   * Obtiene los últimos registros de usuarios
   */
  private static async getUserRegistrations(limit: number): Promise<RecentActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, nombre_completo, rol, fecha_creacion')
        .order('fecha_creacion', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error al obtener registros de usuarios:', error);
        return [];
      }

      type UserData = {
        id: string;
        nombre_completo: string;
        rol: string;
        fecha_creacion: string;
      };

      return ((data || []) as UserData[]).map(user => ({
        id: `user-${user.id}`,
        type: 'user_registration' as ActivityType,
        description: `Nuevo usuario registrado: ${user.nombre_completo} (${this.getRoleName(user.rol)})`,
        timestamp: user.fecha_creacion,
        severity: 'low' as const
      }));
    } catch (error) {
      console.error('Error en getUserRegistrations:', error);
      return [];
    }
  }

  /**
   * Obtiene los últimos eventos creados
   */
  private static async getEventCreations(limit: number): Promise<RecentActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('id, titulo, nombre_organizador, fecha_creacion')
        .order('fecha_creacion', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error al obtener eventos creados:', error);
        return [];
      }

      type EventData = {
        id: string;
        titulo: string;
        nombre_organizador: string;
        fecha_creacion: string;
      };

      return ((data || []) as EventData[]).map(event => ({
        id: `event-${event.id}`,
        type: 'event_created' as ActivityType,
        description: `Evento creado: "${event.titulo}" por ${event.nombre_organizador}`,
        timestamp: event.fecha_creacion,
        severity: 'medium' as const
      }));
    } catch (error) {
      console.error('Error en getEventCreations:', error);
      return [];
    }
  }

  /**
   * Obtiene los últimos pagos recibidos
   */
  private static async getPaymentReceived(limit: number): Promise<RecentActivityItem[]> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select(`
          id,
          total_pagado,
          fecha_creacion,
          eventos:id_evento (
            titulo
          )
        `)
        .eq('estado', 'completada')
        .order('fecha_creacion', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error al obtener pagos recibidos:', error);
        return [];
      }

      type PaymentData = {
        id: string;
        total_pagado: number;
        fecha_creacion: string;
        eventos: { titulo: string } | null;
      };

      return ((data || []) as PaymentData[]).map(payment => {
        const eventTitle = payment.eventos?.titulo || 'Evento desconocido';
        const amount = this.formatCurrency(parseFloat(String(payment.total_pagado)));
        
        return {
          id: `payment-${payment.id}`,
          type: 'payment_received' as ActivityType,
          description: `Pago recibido: ${amount} por evento "${eventTitle}"`,
          timestamp: payment.fecha_creacion,
          severity: 'low' as const
        };
      });
    } catch (error) {
      console.error('Error en getPaymentReceived:', error);
      return [];
    }
  }

  /**
   * Formatea el timestamp a un formato legible
   */
  static formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
      return 'Justo ahora';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-CO', { 
        day: 'numeric', 
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Obtiene el nombre legible del rol
   */
  private static getRoleName(rol: string): string {
    const roles: Record<string, string> = {
      'asistente': 'Asistente',
      'organizador': 'Organizador',
      'admin': 'Administrador'
    };
    return roles[rol] || rol;
  }

  /**
   * Formatea el monto a moneda colombiana
   */
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  }
}
