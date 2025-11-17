import { supabase } from '../supabase';
import type { Database } from '../supabase';

type Tables = Database['public']['Tables'];

export class OrganizerFollowService {
  static async seguirOrganizador(idUsuarioSeguidor: string, idOrganizador: string) {
    const { data, error } = await supabase
      .from('seguidores_organizadores')
      .insert({ id_usuario_seguidor: idUsuarioSeguidor, id_organizador: idOrganizador })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async dejarDeSeguir(idUsuarioSeguidor: string, idOrganizador: string) {
    const { error } = await supabase
      .from('seguidores_organizadores')
      .delete()
      .eq('id_usuario_seguidor', idUsuarioSeguidor)
      .eq('id_organizador', idOrganizador);
    if (error) throw error;
  }

  static async listarOrganizadoresSeguidos(idUsuarioSeguidor: string) {
    try {
      // Primero obtenemos los IDs de los organizadores seguidos
      const { data: follows, error: followError } = await supabase
        .from('seguidores_organizadores')
        .select('id_organizador, fecha_creacion')
        .eq('id_usuario_seguidor', idUsuarioSeguidor)
        .order('fecha_creacion', { ascending: false });
      
      if (followError) throw followError;
      if (!follows || follows.length === 0) return [];
      
      // Luego obtenemos los datos completos de cada organizador
      const organizerIds = follows.map(f => f.id_organizador);
      const { data: organizers, error: orgError } = await supabase
        .from('usuarios')
        .select('*')
        .in('id', organizerIds);
      
      if (orgError) throw orgError;
      
      // Combinamos los datos
      return (organizers || []).map(org => {
        const followData = follows.find(f => f.id_organizador === org.id);
        return {
          ...org,
          fecha_seguimiento: followData?.fecha_creacion
        };
      });
    } catch (error) {
      console.error('Error en listarOrganizadoresSeguidos:', error);
      throw error;
    }
  }

  static async listarSeguidoresOrganizador(idOrganizador: string) {
    const { data, error } = await supabase
      .from('seguidores_organizadores')
      .select('id_usuario_seguidor, fecha_creacion')
      .eq('id_organizador', idOrganizador)
      .order('fecha_creacion', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  static async esSeguido(idUsuarioSeguidor: string, idOrganizador: string) {
    const { data, error } = await supabase
      .from('seguidores_organizadores')
      .select('id')
      .eq('id_usuario_seguidor', idUsuarioSeguidor)
      .eq('id_organizador', idOrganizador)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  }
}
