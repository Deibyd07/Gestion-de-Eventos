import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos de base de datos en español
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          correo_electronico: string;
          nombre_completo: string;
          rol: 'administrador' | 'organizador' | 'asistente';
          url_avatar?: string;
          preferencias?: any;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id: string;
          correo_electronico: string;
          nombre_completo: string;
          rol?: 'administrador' | 'organizador' | 'asistente';
          url_avatar?: string;
          preferencias?: any;
        };
        Update: {
          correo_electronico?: string;
          nombre_completo?: string;
          rol?: 'administrador' | 'organizador' | 'asistente';
          url_avatar?: string;
          preferencias?: any;
        };
      };
      eventos: {
        Row: {
          id: string;
          titulo: string;
          descripcion: string;
          url_imagen: string;
          fecha_evento: string;
          hora_evento: string;
          ubicacion: string;
          categoria: string;
          maximo_asistentes: number;
          asistentes_actuales: number;
          id_organizador: string;
          nombre_organizador: string;
          estado: 'proximo' | 'en_curso' | 'completado' | 'cancelado';
          etiquetas: string[];
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          titulo: string;
          descripcion: string;
          url_imagen: string;
          fecha_evento: string;
          hora_evento: string;
          ubicacion: string;
          categoria: string;
          maximo_asistentes: number;
          asistentes_actuales?: number;
          id_organizador: string;
          nombre_organizador: string;
          estado?: 'proximo' | 'en_curso' | 'completado' | 'cancelado';
          etiquetas?: string[];
        };
        Update: {
          titulo?: string;
          descripcion?: string;
          url_imagen?: string;
          fecha_evento?: string;
          hora_evento?: string;
          ubicacion?: string;
          categoria?: string;
          maximo_asistentes?: number;
          asistentes_actuales?: number;
          nombre_organizador?: string;
          estado?: 'proximo' | 'en_curso' | 'completado' | 'cancelado';
          etiquetas?: string[];
        };
      };
      tipos_entrada: {
        Row: {
          id: string;
          id_evento: string;
          nombre_tipo: string;
          precio: number;
          descripcion: string;
          cantidad_maxima: number;
          cantidad_disponible: number;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          id_evento: string;
          nombre_tipo: string;
          precio: number;
          descripcion: string;
          cantidad_maxima: number;
          cantidad_disponible: number;
        };
        Update: {
          nombre_tipo?: string;
          precio?: number;
          descripcion?: string;
          cantidad_maxima?: number;
          cantidad_disponible?: number;
        };
      };
      codigos_promocionales: {
        Row: {
          id: string;
          codigo: string;
          descripcion: string;
          tipo_descuento: string;
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
        };
        Insert: {
          id?: string;
          codigo: string;
          descripcion: string;
          tipo_descuento: string;
          valor_descuento: number;
          fecha_inicio: string;
          fecha_fin: string;
          uso_maximo?: number;
          usos_actuales?: number;
          id_evento?: string | null;
          id_organizador: string;
          activo?: boolean;
        };
        Update: {
          codigo?: string;
          descripcion?: string;
          tipo_descuento?: string;
          valor_descuento?: number;
          fecha_inicio?: string;
          fecha_fin?: string;
          uso_maximo?: number;
          usos_actuales?: number;
          id_evento?: string | null;
          activo?: boolean;
        };
      };
      seguidores_organizadores: {
        Row: {
          id: string;
          id_usuario_seguidor: string;
          id_organizador: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          id_usuario_seguidor: string;
          id_organizador: string;
        };
        Update: {
          // No hay campos editables salvo potencial soft delete futuro
        };
      };
      compras: {
        Row: {
          id: string;
          id_usuario: string;
          id_evento: string;
          id_tipo_entrada: string;
          cantidad: number;
          precio_unitario: number;
          total_pagado: number;
          estado: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada';
          codigo_qr: string;
          numero_orden: string;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          id_usuario: string;
          id_evento: string;
          id_tipo_entrada: string;
          cantidad: number;
          precio_unitario: number;
          total_pagado: number;
          estado?: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada';
          codigo_qr: string;
          numero_orden: string;
        };
        Update: {
          estado?: 'pendiente' | 'completada' | 'cancelada' | 'reembolsada';
        };
      };
      notificaciones: {
        Row: {
          id: string;
          id_usuario: string;
          tipo: 'informativa' | 'exito' | 'advertencia' | 'error';
          titulo: string;
          mensaje: string;
          leida: boolean;
          url_accion?: string;
          texto_accion?: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          id_usuario: string;
          tipo: 'informativa' | 'exito' | 'advertencia' | 'error';
          titulo: string;
          mensaje: string;
          leida?: boolean;
          url_accion?: string;
          texto_accion?: string;
        };
        Update: {
          leida?: boolean;
        };
      };
      plantillas_email: {
        Row: {
          id: string;
          nombre_plantilla: string;
          asunto: string;
          contenido: string;
          tipo: 'bienvenida' | 'recordatorio_evento' | 'confirmacion_entrada' | 'evento_cancelado' | 'encuesta';
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          nombre_plantilla: string;
          asunto: string;
          contenido: string;
          tipo: 'bienvenida' | 'recordatorio_evento' | 'confirmacion_entrada' | 'evento_cancelado' | 'encuesta';
        };
        Update: {
          nombre_plantilla?: string;
          asunto?: string;
          contenido?: string;
          tipo?: 'bienvenida' | 'recordatorio_evento' | 'confirmacion_entrada' | 'evento_cancelado' | 'encuesta';
        };
      };
      analiticas_eventos: {
        Row: {
          id: string;
          id_evento: string;
          total_visualizaciones: number;
          total_ventas: number;
          ingresos_totales: number;
          tasa_conversion: number;
          precio_promedio_entrada: number;
          tipo_entrada_mas_vendido: string;
          tasa_asistencia: number;
          reembolsos: number;
          monto_reembolsos: number;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          id_evento: string;
          total_visualizaciones?: number;
          total_ventas?: number;
          ingresos_totales?: number;
          tasa_conversion?: number;
          precio_promedio_entrada?: number;
          tipo_entrada_mas_vendido?: string;
          tasa_asistencia?: number;
          reembolsos?: number;
          monto_reembolsos?: number;
        };
        Update: {
          total_visualizaciones?: number;
          total_ventas?: number;
          ingresos_totales?: number;
          tasa_conversion?: number;
          precio_promedio_entrada?: number;
          tipo_entrada_mas_vendido?: string;
          tasa_asistencia?: number;
          reembolsos?: number;
          monto_reembolsos?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
