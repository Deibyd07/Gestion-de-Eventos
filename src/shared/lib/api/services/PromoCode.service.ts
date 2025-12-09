import { supabase } from '../supabase';

export interface PromoCode {
  id: string;
  codigo: string;
  descripcion: string | null;
  tipo_descuento: 'porcentaje' | 'monto_fijo';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  uso_maximo: number;
  usos_actuales: number;
  id_evento: string | null;
  id_organizador: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export class PromoCodeService {
  /**
   * Validar y obtener un código promocional
   */
  static async validarCodigo(codigo: string, idEvento: string): Promise<{
    valido: boolean;
    codigo?: PromoCode;
    mensaje?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('codigos_promocionales')
        .select('*')
        .eq('codigo', codigo.toUpperCase())
        .eq('activo', true)
        .single();

      if (error || !data) {
        return {
          valido: false,
          mensaje: 'Código promocional no encontrado'
        };
      }

      const codigoData = data as any;

      // Verificar si el código es para este evento específico o es global
      if (codigoData.id_evento && codigoData.id_evento !== idEvento) {
        return {
          valido: false,
          mensaje: 'Este código no es válido para este evento'
        };
      }

      // Verificar fechas de validez
      const ahora = new Date();
      const fechaInicio = new Date(codigoData.fecha_inicio);
      const fechaFin = new Date(codigoData.fecha_fin);

      if (ahora < fechaInicio) {
        return {
          valido: false,
          mensaje: 'Este código aún no está disponible'
        };
      }

      if (ahora > fechaFin) {
        return {
          valido: false,
          mensaje: 'Este código ha expirado'
        };
      }

      // Verificar límite de usos
      if (codigoData.usos_actuales >= codigoData.uso_maximo) {
        return {
          valido: false,
          mensaje: 'Este código ha alcanzado su límite de usos'
        };
      }

      return {
        valido: true,
        codigo: codigoData as PromoCode,
        mensaje: 'Código válido'
      };
    } catch (error) {
      console.error('Error validando código promocional:', error);
      return {
        valido: false,
        mensaje: 'Error al validar el código'
      };
    }
  }

  /**
   * Incrementar el contador de usos de un código promocional
   */
  static async incrementarUso(idCodigo: string): Promise<boolean> {
    try {
      // Primero obtener el código actual
      const { data: codigoActual, error: errorGet } = await supabase
        .from('codigos_promocionales')
        .select('usos_actuales')
        .eq('id', idCodigo)
        .single();

      if (errorGet || !codigoActual) {
        console.error('Error obteniendo código:', errorGet);
        return false;
      }

      // @ts-ignore - codigos_promocionales no está en los tipos de Supabase
      const { error } = await supabase
        .from('codigos_promocionales')
        // @ts-ignore
        .update({ 
          usos_actuales: (codigoActual as any).usos_actuales + 1,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', idCodigo);

      if (error) {
        console.error('Error incrementando uso de código:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error incrementando uso de código:', error);
      return false;
    }
  }

  /**
   * Calcular el descuento aplicado
   */
  static calcularDescuento(
    precioOriginal: number,
    codigo: PromoCode
  ): { precioFinal: number; descuento: number } {
    let descuento = 0;

    if (codigo.tipo_descuento === 'porcentaje') {
      descuento = (precioOriginal * codigo.valor_descuento) / 100;
    } else if (codigo.tipo_descuento === 'monto_fijo') {
      descuento = Math.min(codigo.valor_descuento, precioOriginal);
    }

    const precioFinal = Math.max(0, precioOriginal - descuento);

    return {
      precioFinal,
      descuento
    };
  }

  /**
   * Obtener códigos promocionales de un organizador
   */
  static async obtenerCodigosPorOrganizador(idOrganizador: string): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('codigos_promocionales')
        .select('*')
        .eq('id_organizador', idOrganizador)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo códigos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo códigos:', error);
      return [];
    }
  }

  /**
   * Obtener códigos promocionales de un evento
   */
  static async obtenerCodigosPorEvento(idEvento: string): Promise<PromoCode[]> {
    try {
      const { data, error } = await supabase
        .from('codigos_promocionales')
        .select('*')
        .eq('id_evento', idEvento)
        .eq('activo', true)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        console.error('Error obteniendo códigos del evento:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo códigos del evento:', error);
      return [];
    }
  }

  /**
   * Crear un nuevo código promocional
   */
  static async crearCodigo(codigo: Omit<PromoCode, 'id' | 'usos_actuales' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<PromoCode | null> {
    try {
      // @ts-ignore - codigos_promocionales no está en los tipos de Supabase
      const { data, error } = await supabase
        .from('codigos_promocionales')
        // @ts-ignore
        .insert([
          {
            ...codigo,
            codigo: codigo.codigo.toUpperCase(),
            usos_actuales: 0
          } as any
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creando código:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creando código:', error);
      return null;
    }
  }

  /**
   * Desactivar un código promocional
   */
  static async desactivarCodigo(idCodigo: string): Promise<boolean> {
    try {
      // @ts-ignore - codigos_promocionales no está en los tipos de Supabase
      const { error } = await supabase
        .from('codigos_promocionales')
        // @ts-ignore
        .update({ 
          activo: false,
          fecha_actualizacion: new Date().toISOString()
        } as any)
        .eq('id', idCodigo);

      if (error) {
        console.error('Error desactivando código:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error desactivando código:', error);
      return false;
    }
  }
}
