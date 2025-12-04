import { supabase } from '../supabase';

export interface FinanceOverview {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayments: number;
  failedPayments: number;
  avgTransactionValue: number;
  totalTransactions: number;
  successRate: number;
  growth: {
    revenue: number;
    transactions: number;
    successRate: number;
  };
}

/**
 * Servicio para gestionar estadísticas financieras
 */
export class FinanceService {
  /**
   * Obtiene el resumen financiero completo
   */
  static async getFinanceOverview(): Promise<FinanceOverview> {
    try {
      const [
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        failedPayments,
        transactionStats,
        growthStats
      ] = await Promise.all([
        this.getTotalRevenue(),
        this.getMonthlyRevenue(),
        this.getPendingPayments(),
        this.getFailedPayments(),
        this.getTransactionStats(),
        this.getGrowthStats()
      ]);

      return {
        totalRevenue,
        monthlyRevenue,
        pendingPayments,
        failedPayments,
        avgTransactionValue: transactionStats.avgValue,
        totalTransactions: transactionStats.total,
        successRate: transactionStats.successRate,
        growth: growthStats
      };
    } catch (error) {
      console.error('Error al obtener resumen financiero:', error);
      throw error;
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
   * Obtiene los ingresos del mes actual
   */
  private static async getMonthlyRevenue(): Promise<number> {
    try {
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data, error } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      if (error) {
        console.error('Error al obtener ingresos mensuales:', error);
        throw error;
      }

      const monthlyRevenue = (data as Array<{ total_pagado: number }>)?.reduce((sum, compra) => {
        return sum + (parseFloat(String(compra.total_pagado)) || 0);
      }, 0) || 0;

      return monthlyRevenue;
    } catch (error) {
      console.error('Error en getMonthlyRevenue:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de pagos pendientes
   */
  private static async getPendingPayments(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'pendiente');

      if (error) {
        console.error('Error al obtener pagos pendientes:', error);
        throw error;
      }

      const pendingPayments = (data as Array<{ total_pagado: number }>)?.reduce((sum, compra) => {
        return sum + (parseFloat(String(compra.total_pagado)) || 0);
      }, 0) || 0;

      return pendingPayments;
    } catch (error) {
      console.error('Error en getPendingPayments:', error);
      return 0;
    }
  }

  /**
   * Obtiene el total de pagos fallidos
   */
  private static async getFailedPayments(): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('total_pagado')
        .eq('estado', 'fallida');

      if (error) {
        console.error('Error al obtener pagos fallidos:', error);
        throw error;
      }

      const failedPayments = (data as Array<{ total_pagado: number }>)?.reduce((sum, compra) => {
        return sum + (parseFloat(String(compra.total_pagado)) || 0);
      }, 0) || 0;

      return failedPayments;
    } catch (error) {
      console.error('Error en getFailedPayments:', error);
      return 0;
    }
  }

  /**
   * Obtiene estadísticas de transacciones
   */
  private static async getTransactionStats(): Promise<{
    total: number;
    avgValue: number;
    successRate: number;
  }> {
    try {
      // Total de transacciones
      const { count: totalCount } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true });

      // Transacciones completadas
      const { data: completedData, count: completedCount } = await supabase
        .from('compras')
        .select('total_pagado', { count: 'exact' })
        .eq('estado', 'completada');

      // Calcular valor promedio
      const totalRevenue = (completedData as Array<{ total_pagado: number }>)?.reduce((sum, compra) => {
        return sum + (parseFloat(String(compra.total_pagado)) || 0);
      }, 0) || 0;

      const avgValue = completedCount && completedCount > 0 
        ? totalRevenue / completedCount 
        : 0;

      // Calcular tasa de éxito
      const successRate = totalCount && totalCount > 0 
        ? (completedCount || 0) / totalCount * 100 
        : 0;

      return {
        total: totalCount || 0,
        avgValue: Math.round(avgValue),
        successRate: Math.round(successRate * 10) / 10
      };
    } catch (error) {
      console.error('Error en getTransactionStats:', error);
      return { total: 0, avgValue: 0, successRate: 0 };
    }
  }

  /**
   * Obtiene estadísticas de crecimiento comparando con el mes anterior
   */
  private static async getGrowthStats(): Promise<{
    revenue: number;
    transactions: number;
    successRate: number;
  }> {
    try {
      const now = new Date();
      const firstDayCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

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

      // Transacciones del mes actual
      const { count: currentMonthTransactions } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      // Transacciones del mes anterior
      const { count: lastMonthTransactions } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      // Tasa de éxito del mes actual
      const { count: currentMonthTotal } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const { count: currentMonthCompleted } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayCurrentMonth.toISOString());

      const currentSuccessRate = currentMonthTotal && currentMonthTotal > 0 
        ? (currentMonthCompleted || 0) / currentMonthTotal * 100 
        : 0;

      // Tasa de éxito del mes anterior
      const { count: lastMonthTotal } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const { count: lastMonthCompleted } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'completada')
        .gte('fecha_creacion', firstDayLastMonth.toISOString())
        .lte('fecha_creacion', lastDayLastMonth.toISOString());

      const lastSuccessRate = lastMonthTotal && lastMonthTotal > 0 
        ? (lastMonthCompleted || 0) / lastMonthTotal * 100 
        : 0;

      // Calcular porcentajes de crecimiento
      const revenueGrowth = lastRevenue && lastRevenue > 0 
        ? (currentRevenue - lastRevenue) / lastRevenue * 100 
        : 0;

      const transactionsGrowth = lastMonthTransactions && lastMonthTransactions > 0 
        ? ((currentMonthTransactions || 0) - lastMonthTransactions) / lastMonthTransactions * 100 
        : 0;

      const successRateGrowth = lastSuccessRate && lastSuccessRate > 0 
        ? (currentSuccessRate - lastSuccessRate) / lastSuccessRate * 100 
        : 0;

      return {
        revenue: Math.round(revenueGrowth * 10) / 10,
        transactions: Math.round(transactionsGrowth * 10) / 10,
        successRate: Math.round(successRateGrowth * 10) / 10
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de crecimiento:', error);
      return { revenue: 0, transactions: 0, successRate: 0 };
    }
  }
}
