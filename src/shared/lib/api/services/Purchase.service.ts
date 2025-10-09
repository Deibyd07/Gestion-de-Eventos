import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class PurchaseService {
  static async crearCompra(datosCompra: Tables['compras']['Insert']) {
    const { data, error } = await supabase
      .from('compras')
      .insert(datosCompra)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerComprasUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        eventos (titulo, fecha_evento, hora_evento, ubicacion, url_imagen),
        tipos_entrada (nombre_tipo, precio)
      `)
      .eq('id_usuario', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async actualizarEstadoCompra(id: string, estado: Tables['compras']['Update']['estado']) {
    const { data, error } = await supabase
      .from('compras')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerCompraPorQR(codigoQR: string) {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        *,
        eventos (titulo, fecha_evento, hora_evento, ubicacion),
        tipos_entrada (nombre_tipo, precio),
        usuarios (nombre_completo, correo_electronico)
      `)
      .eq('codigo_qr', codigoQR)
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerEstadisticasGenerales() {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('*');

      if (error) throw error;
      
      const ingresos_totales = data?.reduce((sum, compra) => sum + (compra.total || 0), 0) || 0;
      const tasa_conversion = data?.length > 0 ? (data.filter(c => c.estado === 'completada').length / data.length) * 100 : 0;
      
      return {
        ingresos_totales,
        tasa_conversion,
        total_compras: data?.length || 0
      };
    } catch (error) {
      // Si hay error, retornar valores por defecto
      return {
        ingresos_totales: 0,
        tasa_conversion: 0,
        total_compras: 0
      };
    }
  }
}
