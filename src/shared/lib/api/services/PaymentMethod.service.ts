import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class PaymentMethodService {
  /**
   * Crear un nuevo método de pago
   */
  static async crearMetodoPago(datosMetodo: Tables['metodos_pago']['Insert']) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .insert(datosMetodo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener método de pago por ID
   */
  static async obtenerMetodoPagoPorId(id: string) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener todos los métodos de pago de un organizador
   */
  static async obtenerMetodosPagoOrganizador(idOrganizador: string) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .select('*')
      .eq('id_organizador', idOrganizador)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener métodos de pago asociados a un evento específico (directo por columna id_evento)
   */
  static async obtenerMetodosPagoEvento(idEvento: string) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .select('*')
      .eq('id_evento', idEvento)
      .order('fecha_creacion', { ascending: false });
    if (error) throw error;
    return data;
  }

  /**
   * Obtener métricas de reconciliación del evento (compras vs métodos de pago)
   */
  static async obtenerReconciliacionEvento(idEvento: string) {
    // Traer compras del evento
    const { data: compras, error } = await supabase
      .from('compras')
      .select('id, total_pagado, estado, fecha_creacion')
      .eq('id_evento', idEvento);
    if (error) throw error;

    const totalTransacciones = compras?.length || 0;
    const ingresosCompletados = compras?.filter(c => c.estado === 'completada').reduce((s, c) => s + (c.total_pagado || 0), 0) || 0;
    const ingresosReembolsados = compras?.filter(c => c.estado === 'reembolsada').reduce((s, c) => s + (c.total_pagado || 0), 0) || 0;
    const ingresosNetos = ingresosCompletados - ingresosReembolsados;
    const completadas = compras?.filter(c => c.estado === 'completada').length || 0;
    const pendientes = compras?.filter(c => c.estado === 'pendiente').length || 0;
    const canceladas = compras?.filter(c => c.estado === 'cancelada').length || 0;
    const reembolsadas = compras?.filter(c => c.estado === 'reembolsada').length || 0;
    const promedioTransaccion = completadas > 0 ? ingresosCompletados / completadas : 0;
    const ultimoPago = compras?.sort((a,b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())[0]?.fecha_creacion || null;

    // Comisión fija del 2.5% como en dashboard
    const comision = ingresosCompletados * 0.025;
    const netoDespuesComision = ingresosCompletados - comision - ingresosReembolsados;

    return {
      totalTransacciones,
      ingresosCompletados,
      ingresosReembolsados,
      ingresosNetos,
      completadas,
      pendientes,
      canceladas,
      reembolsadas,
      promedioTransaccion,
      ultimoPago,
      comision,
      netoDespuesComision
    };
  }

  /** Obtener estadísticas de métodos de pago de un evento */
  static async obtenerEstadisticasMetodosPagoEvento(idEvento: string) {
    console.log('📊 [STATS] Obteniendo estadísticas para evento:', idEvento);
    const metodos = await this.obtenerMetodosPagoEvento(idEvento) || [];
    console.log('📊 [STATS] Métodos encontrados:', metodos.length, metodos);
    const total = metodos.length;
    const activos = metodos.filter(m => m.activo).length;
    const inactivos = total - activos;
    const porTipo = metodos.reduce((acc: Record<string, number>, m: any) => {
      acc[m.tipo] = (acc[m.tipo] || 0) + 1;
      return acc;
    }, {});

    // Obtener compras del evento para calcular uso real por método
    const { data: compras, error } = await supabase
      .from('compras')
      .select('id, id_metodo_pago, estado')
      .eq('id_evento', idEvento)
      .eq('estado', 'completada');
    
    console.log('📊 [STATS] Compras query:', { error, comprasCount: compras?.length });
    console.log('📊 [STATS] Compras completadas:', compras);
    
    const totalCompletadas = compras?.length || 0;
    const uso = metodos.map(m => {
      const transacciones = compras?.filter(c => c.id_metodo_pago === m.id).length || 0;
      const porcentaje = totalCompletadas > 0 ? (transacciones / totalCompletadas) * 100 : 0;
      console.log(`📊 [STATS] Método ${m.nombre}: ${transacciones} transacciones (${porcentaje.toFixed(1)}%)`);
      return {
        id: m.id,
        nombre: m.nombre,
        tipo: m.tipo,
        transacciones,
        porcentaje
      };
    });

    const result = { total, activos, inactivos, porTipo, uso };
    console.log('📊 [STATS] Resultado final:', result);
    return result;
  }

  /**
   * Obtener métodos de pago activos de un organizador
   */
  static async obtenerMetodosPagoActivos(idOrganizador: string) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .select('*')
      .eq('id_organizador', idOrganizador)
      .eq('activo', true)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Actualizar un método de pago
   */
  static async actualizarMetodoPago(id: string, actualizaciones: Tables['metodos_pago']['Update']) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .update({
        ...actualizaciones,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Eliminar un método de pago
   */
  static async eliminarMetodoPago(id: string) {
    console.log('🗑️ Iniciando eliminación del método de pago:', id);
    
    try {
      // Usar la misma lógica que funciona en el DEBUG
      const { error: deleteError, count } = await supabase
        .from('metodos_pago')
        .delete({ count: 'exact' })
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Error durante la eliminación:', deleteError);
        throw new Error(`Error al eliminar el método de pago: ${deleteError.message}`);
      }

      console.log('✅ Eliminación completada. Registros afectados:', count);
      
      if (count === 0) {
        console.warn('⚠️ No se eliminó ningún registro');
        throw new Error('No se pudo eliminar el método de pago - registro no encontrado');
      }

      console.log('🎉 MÉTODO DE PAGO ELIMINADO EXITOSAMENTE');
      return { success: true, deletedCount: count };
    } catch (error) {
      console.error('💥 Error completo en eliminación:', error);
      throw error;
    }
  }

  /**
   * Activar/desactivar un método de pago
   */
  static async cambiarEstadoMetodoPago(id: string, activo: boolean) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .update({ 
        activo,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtener métodos de pago por tipo
   */
  static async obtenerMetodosPagoPorTipo(
    idOrganizador: string, 
    tipo: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'cash' | 'crypto'
  ) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .select('*')
      .eq('id_organizador', idOrganizador)
      .eq('tipo', tipo)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener estadísticas de métodos de pago de un organizador
   */
  static async obtenerEstadisticasMetodosPago(idOrganizador: string) {
    const { data, error } = await supabase
      .from('metodos_pago')
      .select('tipo, activo')
      .eq('id_organizador', idOrganizador);

    if (error) throw error;

    // Procesar estadísticas
    const total = data?.length || 0;
    const activos = data?.filter(m => m.activo).length || 0;
    const inactivos = total - activos;
    
    const porTipo = data?.reduce((acc, metodo) => {
      acc[metodo.tipo] = (acc[metodo.tipo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      total,
      activos,
      inactivos,
      porTipo
    };
  }


}