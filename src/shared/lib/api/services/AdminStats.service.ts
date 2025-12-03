import { supabase } from '../supabase';

export interface AdminDashboardStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  activeEvents: number;
}

/**
 * Servicio para obtener estadísticas del panel de administración
 */
export class AdminStatsService {
  /**
   * Obtiene todas las estadísticas del dashboard de administración
   */
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [
        totalUsers,
        totalEvents,
        totalRevenue,
        activeEvents
      ] = await Promise.all([
        this.getTotalUsers(),
        this.getTotalEvents(),
        this.getTotalRevenue(),
        this.getActiveEvents()
      ]);

      return {
        totalUsers,
        totalEvents,
        totalRevenue,
        activeEvents
      };
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw error;
    }
  }

  /**
   * Obtiene el total de usuarios con rol 'asistente'
   */
  private static async getTotalUsers(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'asistente');

      if (error) {
        console.error('Error al obtener total de usuarios:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error en getTotalUsers:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de eventos (todos los estados)
   */
  private static async getTotalEvents(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error al obtener total de eventos:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error en getTotalEvents:', error);
      return 0;
    }
  }

  /**
   * Obtiene los ingresos totales de todas las compras completadas
   */
  private static async getTotalRevenue(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada');

      if (error) {
        console.error('Error al obtener ingresos totales:', error);
        throw error;
      }

      // Sumar todos los totales pagados
      const totalRevenue = (data as Array<{ total_pagado: number }>)?.reduce((sum, compra) => {
        return sum + (parseFloat(String(compra.total_pagado)) || 0);
      }, 0) || 0;

      return totalRevenue;
    } catch (error) {
      console.error('Error en getTotalRevenue:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de eventos con estado 'publicado'
   */
  private static async getActiveEvents(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'publicado');

      if (error) {
        console.error('Error al obtener eventos publicados:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error en getActiveEvents:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de crecimiento comparando con el mes anterior
   */
  static async getGrowthStats(): Promise<{
    users: number;
    events: number;
    revenue: number;
  }> {
    try {
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // Usuarios del mes actual
      const { count: currentMonthUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'asistente')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      // Usuarios del mes anterior
      const { count: lastMonthUsers } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('rol', 'asistente')
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      // Eventos del mes actual
      const { count: currentMonthEvents } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      // Eventos del mes anterior
      const { count: lastMonthEvents } = await supabase
        .from('eventos')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      // Ingresos del mes actual
      const { data: currentMonthRevenue } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const currentRevenue = (currentMonthRevenue as Array<{ total_pagado: number }>)?.reduce((sum, compra) => 
        sum + (parseFloat(String(compra.total_pagado)) || 0), 0) || 0;

      // Ingresos del mes anterior
      const { data: lastMonthRevenueData } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const lastRevenue = (lastMonthRevenueData as Array<{ total_pagado: number }>)?.reduce((sum, compra) => 
        sum + (parseFloat(String(compra.total_pagado)) || 0), 0) || 0;

      // Calcular porcentajes de crecimiento
      const usersGrowth = lastMonthUsers && lastMonthUsers > 0 
        ? ((currentMonthUsers || 0) - lastMonthUsers) / lastMonthUsers * 100 
        : 0;

      const eventsGrowth = lastMonthEvents && lastMonthEvents > 0 
        ? ((currentMonthEvents || 0) - lastMonthEvents) / lastMonthEvents * 100 
        : 0;

      const revenueGrowth = lastRevenue && lastRevenue > 0 
        ? (currentRevenue - lastRevenue) / lastRevenue * 100 
        : 0;

      return {
        users: Math.round(usersGrowth * 10) / 10,
        events: Math.round(eventsGrowth * 10) / 10,
        revenue: Math.round(revenueGrowth * 10) / 10
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de crecimiento:', error);
      return { users: 0, events: 0, revenue: 0 };
    }
  }
}
