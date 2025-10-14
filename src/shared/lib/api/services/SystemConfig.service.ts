import { supabase } from '../supabase';

export interface SystemConfig {
  id: string;
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json' | 'email' | 'url';
  descripcion?: string;
  categoria: string;
  es_sensible: boolean;
  solo_lectura: boolean;
  valor_por_defecto?: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
  actualizado_por?: string;
}

export interface ConfigValue {
  valor: string;
  tipo: string;
  existe: boolean;
}

export interface ConfigSetResult {
  exito: boolean;
  mensaje: string;
}

export class SystemConfigService {
  /**
   * Obtener una configuración específica
   */
  static async obtenerConfiguracion(clave: string): Promise<ConfigValue> {
    const { data, error } = await supabase.rpc('obtener_configuracion', {
      p_clave: clave
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Establecer o actualizar una configuración
   */
  static async establecerConfiguracion(
    clave: string,
    valor: string,
    tipo: 'string' | 'number' | 'boolean' | 'json' | 'email' | 'url' = 'string',
    descripcion?: string,
    categoria: string = 'general',
    actualizado_por?: string
  ): Promise<ConfigSetResult> {
    const { data, error } = await supabase.rpc('establecer_configuracion', {
      p_clave: clave,
      p_valor: valor,
      p_tipo: tipo,
      p_descripcion: descripcion || null,
      p_categoria: categoria,
      p_actualizado_por: actualizado_por || null
    });

    if (error) throw error;
    return data[0];
  }

  /**
   * Obtener configuraciones por categoría
   */
  static async obtenerConfiguracionesCategoria(categoria: string) {
    const { data, error } = await supabase.rpc('obtener_configuraciones_categoria', {
      p_categoria: categoria
    });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener todas las configuraciones
   */
  static async obtenerTodasConfiguraciones(filtros?: {
    categoria?: string;
    es_sensible?: boolean;
    solo_lectura?: boolean;
  }) {
    let consulta = supabase
      .from('configuraciones_sistema')
      .select('*')
      .order('categoria', { ascending: true })
      .order('clave', { ascending: true });

    if (filtros?.categoria) {
      consulta = consulta.eq('categoria', filtros.categoria);
    }

    if (filtros?.es_sensible !== undefined) {
      consulta = consulta.eq('es_sensible', filtros.es_sensible);
    }

    if (filtros?.solo_lectura !== undefined) {
      consulta = consulta.eq('solo_lectura', filtros.solo_lectura);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return data;
  }

  /**
   * Obtener configuraciones públicas (no sensibles)
   */
  static async obtenerConfiguracionesPublicas() {
    const { data, error } = await supabase
      .from('configuraciones_sistema')
      .select('clave, valor, tipo, descripcion, categoria')
      .eq('es_sensible', false)
      .order('categoria', { ascending: true })
      .order('clave', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Obtener configuración con valor tipado
   */
  static async obtenerConfiguracionTipada<T = any>(clave: string): Promise<T | null> {
    const config = await this.obtenerConfiguracion(clave);
    
    if (!config.existe) {
      return null;
    }

    try {
      switch (config.tipo) {
        case 'number':
          return Number(config.valor) as T;
        case 'boolean':
          return (config.valor === 'true' || config.valor === '1') as T;
        case 'json':
          return JSON.parse(config.valor) as T;
        default:
          return config.valor as T;
      }
    } catch (error) {
      console.error(`Error parsing config ${clave}:`, error);
      return null;
    }
  }

  /**
   * Establecer configuración con valor tipado
   */
  static async establecerConfiguracionTipada(
    clave: string,
    valor: any,
    tipo: 'string' | 'number' | 'boolean' | 'json' | 'email' | 'url' = 'string',
    descripcion?: string,
    categoria: string = 'general',
    actualizado_por?: string
  ): Promise<ConfigSetResult> {
    let valorString: string;

    switch (tipo) {
      case 'number':
        valorString = valor.toString();
        break;
      case 'boolean':
        valorString = valor ? 'true' : 'false';
        break;
      case 'json':
        valorString = JSON.stringify(valor);
        break;
      default:
        valorString = String(valor);
    }

    return this.establecerConfiguracion(
      clave,
      valorString,
      tipo,
      descripcion,
      categoria,
      actualizado_por
    );
  }

  /**
   * Eliminar configuración
   */
  static async eliminarConfiguracion(clave: string) {
    const { error } = await supabase
      .from('configuraciones_sistema')
      .delete()
      .eq('clave', clave);

    if (error) throw error;
  }

  /**
   * Obtener configuraciones por múltiples claves
   */
  static async obtenerConfiguracionesMultiples(claves: string[]) {
    const { data, error } = await supabase
      .from('configuraciones_sistema')
      .select('*')
      .in('clave', claves);

    if (error) throw error;
    return data;
  }

  /**
   * Obtener configuraciones como objeto clave-valor
   */
  static async obtenerConfiguracionesComoObjeto(categoria?: string) {
    const configuraciones = await this.obtenerTodasConfiguraciones({ 
      categoria,
      es_sensible: false 
    });

    const objeto: Record<string, any> = {};
    
    configuraciones.forEach(config => {
      try {
        switch (config.tipo) {
          case 'number':
            objeto[config.clave] = Number(config.valor);
            break;
          case 'boolean':
            objeto[config.clave] = config.valor === 'true' || config.valor === '1';
            break;
          case 'json':
            objeto[config.clave] = JSON.parse(config.valor);
            break;
          default:
            objeto[config.clave] = config.valor;
        }
      } catch (error) {
        console.error(`Error parsing config ${config.clave}:`, error);
        objeto[config.clave] = config.valor;
      }
    });

    return objeto;
  }

  /**
   * Verificar si una configuración existe
   */
  static async existeConfiguracion(clave: string): Promise<boolean> {
    const config = await this.obtenerConfiguracion(clave);
    return config.existe;
  }

  /**
   * Obtener configuraciones de la aplicación
   */
  static async obtenerConfiguracionesApp() {
    return this.obtenerConfiguracionesComoObjeto('general');
  }

  /**
   * Obtener configuraciones de email
   */
  static async obtenerConfiguracionesEmail() {
    return this.obtenerConfiguracionesComoObjeto('email');
  }

  /**
   * Obtener configuraciones de pagos
   */
  static async obtenerConfiguracionesPagos() {
    return this.obtenerConfiguracionesComoObjeto('payments');
  }

  /**
   * Obtener configuraciones de eventos
   */
  static async obtenerConfiguracionesEventos() {
    return this.obtenerConfiguracionesComoObjeto('events');
  }

  /**
   * Obtener configuraciones de seguridad
   */
  static async obtenerConfiguracionesSeguridad() {
    return this.obtenerConfiguracionesComoObjeto('security');
  }

  /**
   * Obtener configuraciones de notificaciones
   */
  static async obtenerConfiguracionesNotificaciones() {
    return this.obtenerConfiguracionesComoObjeto('notifications');
  }

  /**
   * Obtener configuraciones de UI
   */
  static async obtenerConfiguracionesUI() {
    return this.obtenerConfiguracionesComoObjeto('ui');
  }
}
