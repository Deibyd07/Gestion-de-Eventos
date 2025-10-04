/**
 * Tipos compartidos de la aplicación EventHub
 * 
 * Este archivo contiene las definiciones de tipos TypeScript
 * utilizadas en toda la aplicación.
 */

// ==========================================
// TIPOS DE USUARIO
// ==========================================

export type UserRole = 'administrador' | 'organizador' | 'asistente';

export interface User {
  id: string;
  correo_electronico: string;
  nombre_completo: string;
  rol: UserRole;
  url_avatar?: string;
  preferencias?: Record<string, any>;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ==========================================
// TIPOS DE EVENTO
// ==========================================

export type EventStatus = 'proximo' | 'en_curso' | 'completado' | 'cancelado';

export interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  id_organizador: string;
  nombre_organizador: string;
  estado: EventStatus;
  etiquetas: string[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ==========================================
// TIPOS DE ENTRADA
// ==========================================

export interface TicketType {
  id: string;
  id_evento: string;
  nombre_tipo: string;
  precio: number;
  descripcion: string;
  cantidad_maxima: number;
  cantidad_disponible: number;
  fecha_creacion: string;
}

// ==========================================
// TIPOS DE COMPRA
// ==========================================

export type PurchaseStatus = 'pendiente' | 'completada' | 'cancelada' | 'reembolsada';

export interface Purchase {
  id: string;
  id_usuario: string;
  id_evento: string;
  id_tipo_entrada: string;
  cantidad: number;
  precio_unitario: number;
  total_pagado: number;
  estado: PurchaseStatus;
  codigo_qr?: string;
  asistio?: boolean;
  fecha_compra: string;
}

// ==========================================
// TIPOS DE NOTIFICACIÓN
// ==========================================

export type NotificationType = 'informativa' | 'exito' | 'advertencia' | 'error';

export interface Notification {
  id: string;
  id_usuario: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  leida: boolean;
  fecha_creacion: string;
}

// ==========================================
// TIPOS DE ANALÍTICAS
// ==========================================

export interface EventAnalytics {
  id: string;
  id_evento: string;
  total_visualizaciones: number;
  total_ventas: number;
  ingresos_totales: number;
  tasa_conversion: number;
  precio_promedio_entrada: number;
  tipo_entrada_mas_vendido?: string;
  tasa_asistencia: number;
  fecha_actualizacion: string;
}

export interface UserAnalytics {
  id: string;
  id_usuario: string;
  eventos_asistidos: number;
  eventos_organizados: number;
  total_gastado: number;
  eventos_favoritos: string[];
  categorias_preferidas: string[];
  fecha_actualizacion: string;
}

// ==========================================
// TIPOS DE CARRITO
// ==========================================

export interface CartItem {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
  eventTitle: string;
  ticketTypeName: string;
}

// ==========================================
// TIPOS DE FILTROS
// ==========================================

export interface EventFilters {
  categoria?: string;
  ubicacion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  precio_min?: number;
  precio_max?: number;
  estado?: EventStatus;
  busqueda?: string;
}

// ==========================================
// TIPOS DE FORMULARIOS
// ==========================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  nombre_completo: string;
  correo_electronico: string;
  contraseña: string;
  confirmar_contraseña: string;
}

export interface EventFormData {
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  etiquetas: string[];
}

// ==========================================
// TIPOS DE RESPUESTA API
// ==========================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ==========================================
// TIPOS DE ESTADO (STORES)
// ==========================================

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (eventId: string, ticketTypeId: string) => void;
  updateQuantity: (eventId: string, ticketTypeId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export interface EventState {
  events: Event[];
  selectedEvent: Event | null;
  loading: boolean;
  fetchEvents: (filters?: EventFilters) => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  createEvent: (event: EventFormData) => Promise<void>;
  updateEvent: (id: string, event: Partial<EventFormData>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

// ==========================================
// TIPOS UTILITARIOS
// ==========================================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// ==========================================
// CONSTANTES DE TIPOS
// ==========================================

export const USER_ROLES = {
  ADMIN: 'administrador' as UserRole,
  ORGANIZER: 'organizador' as UserRole,
  ATTENDEE: 'asistente' as UserRole,
} as const;

export const EVENT_STATUS = {
  UPCOMING: 'proximo' as EventStatus,
  IN_PROGRESS: 'en_curso' as EventStatus,
  COMPLETED: 'completado' as EventStatus,
  CANCELLED: 'cancelado' as EventStatus,
} as const;

export const PURCHASE_STATUS = {
  PENDING: 'pendiente' as PurchaseStatus,
  COMPLETED: 'completada' as PurchaseStatus,
  CANCELLED: 'cancelada' as PurchaseStatus,
  REFUNDED: 'reembolsada' as PurchaseStatus,
} as const;

export const NOTIFICATION_TYPES = {
  INFO: 'informativa' as NotificationType,
  SUCCESS: 'exito' as NotificationType,
  WARNING: 'advertencia' as NotificationType,
  ERROR: 'error' as NotificationType,
} as const;

