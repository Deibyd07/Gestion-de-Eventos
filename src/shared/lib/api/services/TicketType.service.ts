import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class TicketTypeService {
  static async crearTipoEntrada(datosTipo: Tables['tipos_entrada']['Insert']) {
    const { data, error } = await supabase
      .from('tipos_entrada')
      .insert(datosTipo)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarTipoEntrada(id: string, actualizaciones: Tables['tipos_entrada']['Update']) {
    const { data, error } = await supabase
      .from('tipos_entrada')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarTipoEntrada(id: string) {
    const { error } = await supabase
      .from('tipos_entrada')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
