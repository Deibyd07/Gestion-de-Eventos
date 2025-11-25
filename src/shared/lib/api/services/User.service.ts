import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { getRegistrationDate } from '@shared/lib/utils/Date.utils';

type Tables = Database['public']['Tables'];

export class UserService {
  static async obtenerUsuarioActual() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // Buscar directamente por id (unificado con auth.users)
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

    // Eliminar el campo contraseña si existe (Supabase Auth lo maneja)
    const { contraseña, ...datosLimpios } = usuarioConFecha as any;

    const { data, error } = await supabase
      .from('usuarios')
      .insert(datosLimpios)
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
      .update(actualizacionesConFecha as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async verificarCredenciales(email: string, password: string): Promise<boolean> {
    try {
      // Verificar contraseña usando Supabase Auth directamente
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

      if (error || !data) {
        throw error || new Error('Usuario no encontrado');
      }
      
      // Mapear los campos de la base de datos al formato esperado
      const mappedData = {
        id: (data as any).id,
        correo_electronico: (data as any).correo_electronico,
        nombre: (data as any).nombre_completo, // Mapear nombre_completo a nombre
        tipo_usuario: (data as any).rol, // Mapear rol a tipo_usuario
        ubicacion: (data as any).ubicacion || 'Colombia',
        url_avatar: (data as any).url_avatar,
        preferencias: (data as any).preferencias,
        fecha_creacion: (data as any).fecha_creacion,
        fecha_actualizacion: (data as any).fecha_actualizacion
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

  static async registrarse(email: string, password: string, datosUsuario: { nombre: string; telefono?: string; ubicacion?: string; rol?: string }) {
    // 1. Crear usuario en Supabase Auth (encripta la contraseña y guarda metadatos)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre_completo: datosUsuario.nombre,
          telefono: datosUsuario.telefono,
          ubicacion: datosUsuario.ubicacion,
          rol: datosUsuario.rol || 'asistente'
        }
      }
    });

    if (error) throw error;

    // 2. Trigger handle_new_user() debe crear el registro en usuarios con el mismo id
    // Fallback: si tras breve espera no existe, insertar manualmente usando el mismo id
    if (data.user) {
      const userId = data.user.id;
      // Pequeña espera opcional para que el trigger corra (no bloqueante si falla)
      await new Promise(r => setTimeout(r, 150));
      const { data: existente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existente) {
        try {
          await this.crearUsuario({
            id: userId as any, // Forzar el mismo ID
            correo_electronico: email,
            nombre_completo: datosUsuario.nombre,
            rol: (datosUsuario.rol as any) || 'asistente',
            ...(datosUsuario.telefono && { telefono: datosUsuario.telefono } as any),
            ...(datosUsuario.ubicacion && { ubicacion: datosUsuario.ubicacion } as any)
          } as any);
        } catch (e: any) {
          // Ignorar si se creó por el trigger entre la verificación y la inserción
          if (!e.message?.includes('duplicate')) {
            console.error('Error fallback creación usuario:', e);
          }
        }
      }
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
      .select('*')
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async actualizarEstadoUsuario(id: string, estado: string) {
    // Nota: Necesitas agregar el campo 'estado' a la tabla 'usuarios' en Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .update({ 
        estado: estado,
        fecha_actualizacion: getRegistrationDate()
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async buscarUsuarios(termino: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .or(`nombre_completo.ilike.%${termino}%,correo_electronico.ilike.%${termino}%`)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async obtenerUsuariosPorRol(rol: 'administrador' | 'organizador' | 'asistente') {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('rol', rol)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async obtenerEstadisticasUsuarios() {
    const { data, error } = await supabase
      .from('usuarios')
      .select('rol, id')

    if (error) throw error;
    
    const usuarios = data || [];
    return {
      total: usuarios.length,
      administradores: usuarios.filter(u => u.rol === 'administrador').length,
      organizadores: usuarios.filter(u => u.rol === 'organizador').length,
      asistentes: usuarios.filter(u => u.rol === 'asistente').length
    };
  }

  static async eliminarUsuario(id: string) {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
