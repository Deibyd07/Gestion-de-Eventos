import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class AnalyticsService {
  static async obtenerAnaliticasEvento(idEvento: string) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .select('*')
      .eq('id_evento', idEvento)
      .single();

    if (error) throw error;
    return data;
  }

  static async crearAnaliticasEvento(datosAnaliticas: Tables['analiticas_eventos']['Insert']) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .insert(datosAnaliticas)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarAnaliticasEvento(idEvento: string, actualizaciones: Tables['analiticas_eventos']['Update']) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .update(actualizaciones)
      .eq('id_evento', idEvento)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerAnaliticasUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('analiticas_eventos')
      .select(`
        *,
        eventos (titulo, id_organizador)
      `)
      .eq('eventos.id_organizador', idUsuario);

    if (error) throw error;
    return data;
  }

  static async obtenerMetricasGenerales() {
    try {
      const { data, error } = await supabase
        .from('analiticas_eventos')
        .select('*');

      if (error) throw error;
      
      return {
        total_eventos: data?.length || 0,
        eventos_activos: data?.filter(a => a.estado === 'activo').length || 0,
        total_asistentes: data?.reduce((sum, a) => sum + (a.asistentes_confirmados || 0), 0) || 0
      };
    } catch (error) {
      // Si hay error, retornar valores por defecto
      return {
        total_eventos: 0,
        eventos_activos: 0,
        total_asistentes: 0
      };
    }
  }
}
