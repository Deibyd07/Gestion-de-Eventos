// =============================================
// Tipos para las nuevas entidades del sistema
// =============================================

// =============================================
// TIPOS PARA CALIFICACIONES DE EVENTOS
// =============================================

export interface EventRating {
  id: string;
  id_evento: string;
  id_usuario: string;
  calificacion: number;
  comentario?: string;
  aspectos_positivos: string[];
  aspectos_negativos: string[];
  recomendaria: boolean;
  categoria_calificacion: string;
  fecha_evento_asistido?: string;
  anonima: boolean;
  moderada: boolean;
  visible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface EventRatingCreate {
  id_evento: string;
  calificacion: number;
  comentario?: string;
  aspectos_positivos?: string[];
  aspectos_negativos?: string[];
  recomendaria?: boolean;
  categoria_calificacion?: string;
  fecha_evento_asistido?: string;
  anonima?: boolean;
}

export interface EventRatingUpdate {
  calificacion?: number;
  comentario?: string;
  aspectos_positivos?: string[];
  aspectos_negativos?: string[];
  recomendaria?: boolean;
  categoria_calificacion?: string;
  anonima?: boolean;
}

export interface EventRatingStats {
  rating_promedio: number;
  total_calificaciones: number;
  distribucion_calificaciones: Record<string, number>;
  aspectos_mas_mencionados: Record<string, number>;
}

export interface EventRatingWithUser {
  id: string;
  calificacion: number;
  comentario?: string;
  aspectos_positivos: string[];
  aspectos_negativos: string[];
  recomendaria: boolean;
  categoria_calificacion: string;
  anonima: boolean;
  fecha_creacion: string;
  usuario_nombre: string;
  usuario_avatar?: string;
}

export interface CanRateEvent {
  puede_calificar: boolean;
  razon: string;
  fecha_evento?: string;
  ya_calificado: boolean;
}

export interface UserRatingStats {
  total_calificaciones: number;
  calificacion_promedio_dada: number;
  eventos_mas_calificados: Array<{
    id_evento: string;
    calificacion: number;
    fecha_calificacion: string;
  }>;
  distribucion_calificaciones: Record<string, number>;
}

export interface ModerateRating {
  exito: boolean;
  mensaje: string;
}

// =============================================
// TIPOS PARA FAVORITOS DE USUARIOS
// =============================================

export interface UserFavorite {
  id: string;
  id_usuario: string;
  id_evento: string;
  categoria_favorito: string;
  notas_personales?: string;
  recordatorio_activo: boolean;
  fecha_recordatorio?: string;
  prioridad: number;
  visible: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UserFavoriteCreate {
  id_evento: string;
  categoria_favorito?: string;
  notas_personales?: string;
  prioridad?: number;
  recordatorio_activo?: boolean;
  fecha_recordatorio?: string;
}

export interface UserFavoriteUpdate {
  categoria_favorito?: string;
  notas_personales?: string;
  prioridad?: number;
  recordatorio_activo?: boolean;
  fecha_recordatorio?: string;
}

export interface FavoriteWithEvent {
  id: string;
  id_evento: string;
  categoria_favorito: string;
  notas_personales?: string;
  prioridad: number;
  recordatorio_activo: boolean;
  fecha_recordatorio?: string;
  fecha_creacion: string;
  // Datos del evento
  titulo_evento: string;
  descripcion_evento: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion_evento: string;
  url_imagen_evento: string;
  categoria_evento: string;
  precio_minimo: number;
  asistentes_actuales: number;
  maximo_asistentes: number;
  nombre_organizador: string;
  dias_restantes: number;
  esta_lleno: boolean;
}

export interface AddFavoriteResult {
  exito: boolean;
  mensaje: string;
  id_favorito?: string;
}

export interface IsFavoriteResult {
  es_favorito: boolean;
  categoria_favorito?: string;
  fecha_agregado?: string;
  prioridad?: number;
}

export interface FavoriteStats {
  total_favoritos: number;
  favoritos_por_categoria: Record<string, number>;
  eventos_proximos: number;
  eventos_llenos: number;
  eventos_pasados: number;
  recordatorios_activos: number;
}

export interface PendingReminder {
  id_favorito: string;
  id_usuario: string;
  id_evento: string;
  titulo_evento: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion_evento: string;
  fecha_recordatorio: string;
  notas_personales?: string;
}

// =============================================
// TIPOS PARA CÓDIGOS PROMOCIONALES
// =============================================

// Tipos para Códigos Promocionales
export interface PromotionalCode {
  id: string;
  codigo: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'fijo';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  uso_maximo?: number;
  usos_actuales: number;
  id_evento?: string;
  id_organizador: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PromotionalCodeCreate {
  codigo: string;
  descripcion?: string;
  tipo_descuento: 'porcentaje' | 'fijo';
  valor_descuento: number;
  fecha_inicio: string;
  fecha_fin: string;
  uso_maximo?: number;
  id_evento?: string;
  id_organizador: string;
  activo?: boolean;
}

export interface PromotionalCodeUpdate {
  descripcion?: string;
  tipo_descuento?: 'porcentaje' | 'fijo';
  valor_descuento?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  uso_maximo?: number;
  activo?: boolean;
}

export interface PromotionalCodeValidation {
  valido: boolean;
  mensaje: string;
  descuento: number;
  tipo_descuento: string;
}

export interface PromotionalCodeApplication {
  precio_final: number;
  descuento_aplicado: number;
  mensaje: string;
}

export interface PromotionalCodeStats {
  codigo: string;
  usos_actuales: number;
  uso_maximo?: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  porcentaje_uso: number;
  dias_restantes: number;
  esta_expirado: boolean;
  esta_agotado: boolean;
}

// Tipos para Asistencia a Eventos
export interface Attendance {
  id: string;
  id_compra: string;
  id_evento: string;
  id_usuario: string;
  fecha_asistencia: string;
  validado_por?: string;
  metodo_validacion: 'qr' | 'manual' | 'nfc' | 'biometrico';
  observaciones?: string;
  estado_asistencia: 'presente' | 'ausente' | 'tarde' | 'cancelado';
  ubicacion_validacion?: {
    lat: number;
    lng: number;
  };
  dispositivo_validacion?: Record<string, any>;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface AttendanceCreate {
  id_compra: string;
  metodo_validacion: 'qr' | 'manual' | 'nfc' | 'biometrico';
  validado_por?: string;
  observaciones?: string;
  ubicacion_validacion?: {
    lat: number;
    lng: number;
  };
  dispositivo_validacion?: Record<string, any>;
}

export interface AttendanceUpdate {
  estado_asistencia?: 'presente' | 'ausente' | 'tarde' | 'cancelado';
  observaciones?: string;
}

export interface AttendanceRegistration {
  exito: boolean;
  mensaje: string;
  id_asistencia?: string;
}

export interface AttendanceStats {
  total_entradas_vendidas: number;
  total_asistentes: number;
  tasa_asistencia: number;
  asistentes_por_metodo: Record<string, number>;
  asistentes_por_hora: Record<string, number>;
}

export interface QRValidation {
  valida: boolean;
  mensaje: string;
  datos_compra?: {
    id_compra: string;
    cantidad: number;
    total_pagado: number;
    fecha_compra: string;
  };
  datos_evento?: {
    titulo: string;
    fecha_evento: string;
    hora_evento: string;
    ubicacion: string;
  };
}

export interface AttendanceReport {
  total_asistentes: number;
  por_metodo: Record<string, number>;
  por_hora: Record<number, number>;
  ultimas_asistencias: Attendance[];
}

// Tipos para Configuraciones del Sistema
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

export interface SystemConfigCreate {
  clave: string;
  valor: string;
  tipo: 'string' | 'number' | 'boolean' | 'json' | 'email' | 'url';
  descripcion?: string;
  categoria?: string;
  es_sensible?: boolean;
  solo_lectura?: boolean;
  valor_por_defecto?: string;
  actualizado_por?: string;
}

export interface SystemConfigUpdate {
  valor?: string;
  descripcion?: string;
  categoria?: string;
  es_sensible?: boolean;
  solo_lectura?: boolean;
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

// Tipos para configuraciones específicas
export interface AppConfig {
  app_name: string;
  app_version: string;
  app_timezone: string;
  app_language: string;
}

export interface EmailConfig {
  email_smtp_host: string;
  email_smtp_port: number;
  email_smtp_user: string;
  email_smtp_password: string;
  email_from_name: string;
  email_from_address: string;
}

export interface PaymentConfig {
  payment_currency: string;
  payment_commission_rate: number;
  payment_min_amount: number;
  payment_max_amount: number;
}

export interface EventConfig {
  event_max_attendees: number;
  event_min_price: number;
  event_max_price: number;
  event_auto_approve: boolean;
}

export interface SecurityConfig {
  security_session_timeout: number;
  security_max_login_attempts: number;
  security_password_min_length: number;
  security_require_email_verification: boolean;
}

export interface NotificationConfig {
  notifications_enabled: boolean;
  notifications_email_enabled: boolean;
  notifications_push_enabled: boolean;
  notifications_sms_enabled: boolean;
}

export interface AnalyticsConfig {
  analytics_enabled: boolean;
  analytics_retention_days: number;
  analytics_auto_cleanup: boolean;
}

export interface UIConfig {
  ui_theme: string;
  ui_primary_color: string;
  ui_secondary_color: string;
  ui_max_events_per_page: number;
}

export interface IntegrationConfig {
  integration_google_maps_key: string;
  integration_stripe_key: string;
  integration_paypal_key: string;
  integration_social_login: boolean;
}

// Tipos para filtros y búsquedas
export interface PromotionalCodeFilters {
  id_organizador?: string;
  id_evento?: string;
  activo?: boolean;
  busqueda?: string;
}

export interface AttendanceFilters {
  estado_asistencia?: string;
  metodo_validacion?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  id_evento?: string;
  id_usuario?: string;
}

export interface SystemConfigFilters {
  categoria?: string;
  es_sensible?: boolean;
  solo_lectura?: boolean;
  busqueda?: string;
}

// Tipos para respuestas de API
export interface PromotionalCodeResponse {
  data: PromotionalCode[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceResponse {
  data: Attendance[];
  total: number;
  page: number;
  limit: number;
}

export interface SystemConfigResponse {
  data: SystemConfig[];
  total: number;
  page: number;
  limit: number;
}

// Tipos para estadísticas y reportes
export interface PromotionalCodeAnalytics {
  total_codigos: number;
  codigos_activos: number;
  codigos_expirados: number;
  total_usos: number;
  codigo_mas_usado: string;
  categoria_mas_popular: string;
}

export interface AttendanceAnalytics {
  total_asistencias: number;
  asistencias_hoy: number;
  tasa_asistencia_promedio: number;
  metodo_mas_usado: string;
  eventos_mas_asistidos: Array<{
    id_evento: string;
    titulo: string;
    total_asistentes: number;
  }>;
}

export interface SystemConfigAnalytics {
  total_configuraciones: number;
  configuraciones_por_categoria: Record<string, number>;
  configuraciones_sensibles: number;
  configuraciones_solo_lectura: number;
  ultimas_modificaciones: Array<{
    clave: string;
    fecha_actualizacion: string;
    actualizado_por: string;
  }>;
}
