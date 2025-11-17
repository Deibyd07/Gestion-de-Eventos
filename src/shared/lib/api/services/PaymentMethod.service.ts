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