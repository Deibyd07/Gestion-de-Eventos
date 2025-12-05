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

export interface PaymentMethod {
  id: string;
  nombre: string;
  tipo: string;
  transactions: number;
  revenue: number;
  percentage: number;
  activo: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  status: string;
  customer: string;
  customerEmail: string;
  event: string;
  eventId: string;
  date: string;
  reference: string;
  paymentMethod: string;
  paymentMethodId: string | null;
  quantity: number;
  unitPrice: number;
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

  /**
   * Obtiene los métodos de pago activos con sus estadísticas
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      // Obtener métodos de pago activos
      const { data: paymentMethods, error: methodsError } = await supabase
        .from('metodos_pago')
        .select('id, nombre, tipo, activo')
        .eq('activo', true)
        .order('nombre');

      if (methodsError) {
        console.error('Error al obtener métodos de pago:', methodsError);
        throw methodsError;
      }

      if (!paymentMethods || paymentMethods.length === 0) {
        return [];
      }

      // Obtener todas las compras completadas para calcular estadísticas
      const { data: allPurchases, error: purchasesError } = await supabase
        .from('compras')
        .select('id_metodo_pago, total_pagado')
        .eq('estado', 'completada')
        .not('id_metodo_pago', 'is', null); // Solo compras con método de pago asignado

      if (purchasesError) {
        console.error('Error al obtener compras:', purchasesError);
        // Continuar sin estadísticas si hay error
      }

      const totalRevenue = (allPurchases as Array<{ total_pagado: number }>)?.reduce((sum, p) => 
        sum + (parseFloat(String(p.total_pagado)) || 0), 0) || 0;

      // Calcular estadísticas para cada método de pago
      const methodsWithStats = (paymentMethods as Array<{ id: string; nombre: string; tipo: string; activo: boolean }>).map(method => {
        const methodPurchases = (allPurchases as Array<{ id_metodo_pago: string; total_pagado: number }>)
          ?.filter(p => p.id_metodo_pago === method.id) || [];
        
        const methodRevenue = methodPurchases.reduce((sum, p) => 
          sum + (parseFloat(String(p.total_pagado)) || 0), 0);
        
        const percentage = totalRevenue > 0 ? (methodRevenue / totalRevenue) * 100 : 0;

        return {
          id: method.id,
          nombre: method.nombre,
          tipo: method.tipo,
          transactions: methodPurchases.length,
          revenue: methodRevenue,
          percentage: Math.round(percentage * 10) / 10,
          activo: method.activo
        };
      });

      // Ordenar por número de transacciones (descendente)
      return methodsWithStats.sort((a, b) => b.transactions - a.transactions);

    } catch (error) {
      console.error('Error en getPaymentMethods:', error);
      return [];
    }
  }

  /**
   * Obtiene las transacciones (compras) con información detallada
   */
  static async getTransactions(limit: number = 100, offset: number = 0): Promise<Transaction[]> {
    try {
      const { data: purchases, error } = await supabase
        .from('compras')
        .select(`
          id,
          total_pagado,
          estado,
          numero_orden,
          cantidad,
          precio_unitario,
          fecha_creacion,
          id_metodo_pago,
          usuarios!inner(id, nombre_completo, correo_electronico),
          eventos!inner(id, titulo),
          metodos_pago(nombre)
        `)
        .order('fecha_creacion', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error al obtener transacciones:', error);
        throw error;
      }

      if (!purchases || purchases.length === 0) {
        return [];
      }

      // Mapear los datos a la interfaz Transaction
      const transactions: Transaction[] = (purchases as any[]).map(purchase => ({
        id: purchase.id,
        amount: parseFloat(String(purchase.total_pagado)) || 0,
        status: purchase.estado,
        customer: purchase.usuarios?.nombre_completo || 'Usuario desconocido',
        customerEmail: purchase.usuarios?.correo_electronico || '',
        event: purchase.eventos?.titulo || 'Evento desconocido',
        eventId: purchase.eventos?.id || '',
        date: purchase.fecha_creacion,
        reference: purchase.numero_orden,
        paymentMethod: purchase.metodos_pago?.nombre || 'Sin método de pago',
        paymentMethodId: purchase.id_metodo_pago,
        quantity: purchase.cantidad,
        unitPrice: parseFloat(String(purchase.precio_unitario)) || 0
      }));

      return transactions;

    } catch (error) {
      console.error('Error en getTransactions:', error);
      return [];
    }
  }

  /**
   * Actualiza un método de pago
   */
  static async updatePaymentMethod(id: string, data: { nombre: string; tipo: string; activo: boolean }): Promise<boolean> {
    try {
      const { error } = await (supabase
        .from('metodos_pago') as any)
        .update({
          nombre: data.nombre,
          tipo: data.tipo,
          activo: data.activo
        })
        .eq('id', id);

      if (error) {
        console.error('Error al actualizar método de pago:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error en updatePaymentMethod:', error);
      return false;
    }
  }

  /**
   * Elimina un método de pago (solo si no tiene transacciones asociadas)
   */
  static async deletePaymentMethod(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verificar si hay transacciones asociadas
      const { count, error: countError } = await supabase
        .from('compras')
        .select('*', { count: 'exact', head: true })
        .eq('id_metodo_pago', id);

      if (countError) {
        console.error('Error al verificar transacciones:', countError);
        return { success: false, message: 'Error al verificar transacciones asociadas' };
      }

      if (count && count > 0) {
        return { 
          success: false, 
          message: `No se puede eliminar. Hay ${count} transacción(es) asociada(s) a este método de pago.` 
        };
      }

      // Si no hay transacciones, proceder a eliminar
      const { error } = await supabase
        .from('metodos_pago')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar método de pago:', error);
        return { success: false, message: 'Error al eliminar el método de pago' };
      }

      return { success: true, message: 'Método de pago eliminado correctamente' };
    } catch (error) {
      console.error('Error en deletePaymentMethod:', error);
      return { success: false, message: 'Error inesperado al eliminar el método de pago' };
    }
  }

  /**
   * Crea un nuevo método de pago
   */
  static async createPaymentMethod(data: { nombre: string; tipo: string; activo: boolean }): Promise<{ success: boolean; message: string; id?: string }> {
    try {
      const { data: newMethod, error } = await (supabase
        .from('metodos_pago') as any)
        .insert({
          nombre: data.nombre,
          tipo: data.tipo,
          activo: data.activo
        })
        .select()
        .single();

      if (error) {
        console.error('Error al crear método de pago:', error);
        return { success: false, message: 'Error al crear el método de pago' };
      }

      if (!newMethod) {
        return { success: false, message: 'No se pudo crear el método de pago' };
      }

      return { success: true, message: 'Método de pago creado correctamente', id: (newMethod as any).id };
    } catch (error) {
      console.error('Error en createPaymentMethod:', error);
      return { success: false, message: 'Error inesperado al crear el método de pago' };
    }
  }
}
