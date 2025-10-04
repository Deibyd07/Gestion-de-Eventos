import { supabase } from '../supabase';
import type { Database } from '../supabase';
import { getRegistrationDate } from '../../shared/utils/date';

type Tables = Database['public']['Tables'];

// Servicio de Usuarios
export class ServicioUsuarios {
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
        ubicacion: data.ubicacion || 'Zarzal, Valle del Cauca',
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

// Servicio de Eventos
export class ServicioEventos {
  static async obtenerEventos(filtros?: {
    categoria?: string;
    ubicacion?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    busqueda?: string;
  }) {
    let consulta = supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*)
      `)
      .eq('estado', 'proximo')
      .order('fecha_evento', { ascending: true });

    if (filtros?.categoria) {
      consulta = consulta.eq('categoria', filtros.categoria);
    }

    if (filtros?.ubicacion) {
      consulta = consulta.ilike('ubicacion', `%${filtros.ubicacion}%`);
    }

    if (filtros?.fechaDesde) {
      consulta = consulta.gte('fecha_evento', filtros.fechaDesde);
    }

    if (filtros?.fechaHasta) {
      consulta = consulta.lte('fecha_evento', filtros.fechaHasta);
    }

    if (filtros?.busqueda) {
      consulta = consulta.or(`titulo.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  static async obtenerEventoPorId(id: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async crearEvento(datosEvento: Tables['eventos']['Insert']) {
    const { data, error } = await supabase
      .from('eventos')
      .insert(datosEvento)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async actualizarEvento(id: string, actualizaciones: Tables['eventos']['Update']) {
    const { data, error } = await supabase
      .from('eventos')
      .update(actualizaciones)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async eliminarEvento(id: string) {
    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async obtenerEventosUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select(`
        *,
        tipos_entrada (*),
        analiticas_eventos (*)
      `)
      .eq('id_organizador', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async obtenerTodosEventos() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*');

    if (error) throw error;
    return data || [];
  }
}

// Servicio de Tipos de Entrada
export class ServicioTiposEntrada {
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

// Servicio de Compras
export class ServicioCompras {
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

// Servicio de Notificaciones
export class ServicioNotificaciones {
  static async crearNotificacion(datosNotificacion: Tables['notificaciones']['Insert']) {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert(datosNotificacion)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async obtenerNotificacionesUsuario(idUsuario: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('id_usuario', idUsuario)
      .order('fecha_creacion', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async marcarComoLeida(id: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async marcarTodasComoLeidas(idUsuario: string) {
    const { data, error } = await supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id_usuario', idUsuario)
      .eq('leida', false)
      .select();

    if (error) throw error;
    return data;
  }

  static async eliminarNotificacion(id: string) {
    const { error } = await supabase
      .from('notificaciones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

// Servicio de Plantillas de Email
export class ServicioPlantillasEmail {
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

// Servicio de Analíticas
export class ServicioAnaliticas {
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

// Servicio de Tiempo Real
export class ServicioTiempoReal {
  static suscribirseANotificaciones(idUsuario: string, callback: (payload: any) => void) {
    return supabase
      .channel('notificaciones')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notificaciones',
          filter: `id_usuario=eq.${idUsuario}`
        }, 
        callback
      )
      .subscribe();
  }

  static suscribirseAEventos(idEvento: string, callback: (payload: any) => void) {
    return supabase
      .channel('eventos')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'eventos',
          filter: `id=eq.${idEvento}`
        }, 
        callback
      )
      .subscribe();
  }

  static suscribirseACompras(idUsuario: string, callback: (payload: any) => void) {
    return supabase
      .channel('compras')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'compras',
          filter: `id_usuario=eq.${idUsuario}`
        }, 
        callback
      )
      .subscribe();
  }
}
