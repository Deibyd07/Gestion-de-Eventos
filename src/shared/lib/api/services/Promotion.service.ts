import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class PromotionService {
  static async crearPromocion(datosPromocion: Tables['codigos_promocionales']['Insert']) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .insert(datosPromocion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerPromocionPorId(id: string) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerPromocionesOrganizador(idOrganizador: string) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .select('*')
      .eq('id_organizador', idOrganizador)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async obtenerPromocionesEvento(idEvento: string) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .select('*')
      .eq('id_evento', idEvento)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async actualizarPromocion(id: string, actualizaciones: Tables['codigos_promocionales']['Update']) {
    const { data, error } = await supabase
      .from('codigos_promocionales')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarPromocion(id: string) {
    const { error } = await supabase
      .from('codigos_promocionales')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async validarCodigo(codigo: string, idEvento?: string) {
    let query = supabase
      .from('codigos_promocionales')
      .select('*')
      .eq('codigo', codigo)
      .eq('activo', true)
      .lte('fecha_inicio', new Date().toISOString())
      .gte('fecha_fin', new Date().toISOString());

    if (idEvento) {
      query = query.or(`id_evento.is.null,id_evento.eq.${idEvento}`);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    
    // Verificar si el código tiene usos disponibles
    if (data && data.usos_actuales >= data.uso_maximo) {
      throw new Error('Este código promocional ha alcanzado su límite de usos');
    }

    return data;
  }

  static async incrementarUso(id: string) {
    const { error } = await supabase.rpc('incrementar_uso_codigo', { codigo_id: id });
    
    if (error) throw error;
  }
}
