import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { getRegistrationDate } from '@shared/lib/utils/Date.utils';

type Tables = Database['public']['Tables'];

export class UserService {
  static async obtenerUsuarioActual() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    return data;
  }

  static async crearUsuario(datosUsuario: Tables['usuarios']['Insert']) {
    // Agregar fecha de creación real
    const usuarioConFecha = {
      ...datosUsuario,
      fecha_creacion: getRegistrationDate(),
      fecha_actualizacion: getRegistrationDate()
    };

    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuarioConFecha)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarUsuario(id: string, actualizaciones: Tables['usuarios']['Update']) {
    // Agregar fecha de actualización real
    const actualizacionesConFecha = {
      ...actualizaciones,
      fecha_actualizacion: getRegistrationDate()
    };

    const { data, error } = await supabase
      .from('usuarios')
      .update(actualizacionesConFecha)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async verificarCredenciales(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('contraseña')
        .eq('correo_electronico', email)
        .single();

      if (error || !data) {
        return false;
      }

      // Verificar contraseña usando la función de Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return !authError && !!authData.user;
    } catch (error) {
      console.error('Error verifying credentials:', error);
      return false;
    }
  }

  static async obtenerUsuarioPorEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('correo_electronico', email)
        .single();

      if (error) {
        throw error;
      }
      
      // Mapear los campos de la base de datos al formato esperado
      const mappedData = {
        id: data.id,
        correo_electronico: data.correo_electronico,
        nombre: data.nombre_completo, // Mapear nombre_completo a nombre
        tipo_usuario: data.rol, // Mapear rol a tipo_usuario
        ubicacion: data.ubicacion || 'Colombia',
        url_avatar: data.url_avatar,
        preferencias: data.preferencias,
        fecha_creacion: data.fecha_creacion,
        fecha_actualizacion: data.fecha_actualizacion
      };
      
      return mappedData;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async obtenerUsuarioPorId(id: string) {
    try {
      if (!id || id === 'undefined') {
        return null;
      }
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .maybeSingle(); // Cambiar a maybeSingle() para que no falle si no existe

      if (error) throw error;
      return data; // Retorna null si no existe, en vez de lanzar error
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  static async registrarse(email: string, password: string, datosUsuario: { nombre: string; rol?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await this.crearUsuario({
        id: data.user.id,
        correo_electronico: email,
        nombre_completo: datosUsuario.nombre,
        rol: datosUsuario.rol as any || 'asistente'
      });
    }

    return data;
  }

  static async iniciarSesion(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  static async cerrarSesion() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async obtenerTodosUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  static async eliminarUsuario(id: string) {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
