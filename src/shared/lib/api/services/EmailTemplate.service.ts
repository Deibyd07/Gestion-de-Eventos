import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class EmailTemplateService {
  static async obtenerPlantillas() {
    const { data, error } = await supabase
      .from('plantillas_email')
      .select('*')
      .order('fecha_creacion', { ascending: true });

    if (error) throw error;
    return data;
  }

  static async crearPlantilla(datosPlantilla: Tables['plantillas_email']['Insert']) {
    const { data, error } = await supabase
      .from('plantillas_email')
      .insert(datosPlantilla)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarPlantilla(id: string, actualizaciones: Tables['plantillas_email']['Update']) {
    const { data, error } = await supabase
      .from('plantillas_email')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarPlantilla(id: string) {
    const { error } = await supabase
      .from('plantillas_email')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
