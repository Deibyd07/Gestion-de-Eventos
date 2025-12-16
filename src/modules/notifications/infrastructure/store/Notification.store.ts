import { create } from 'zustand';
import { NotificationService } from '@shared/lib/api/services/Notification.service';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

// Notificación de la base de datos
export interface DatabaseNotification {
  id: string;
  id_usuario: string;
  id_evento?: string;
  tipo: 'sistema' | 'evento' | 'compra' | 'asistencia' | 'promocion' | 'recordatorio';
  titulo: string;
  mensaje: string;
  leida: boolean;
  url_accion?: string;
  texto_accion?: string;
  fecha_creacion: string;
  metadata?: {
    nombre_evento_original?: string;
    tipo_notificacion?: string;
    fecha_cancelacion?: string;
    [key: string]: any;
  };
  eventos?: {
    id: string;
    titulo: string;
    fecha_evento: string;
    ubicacion: string;
    estado: string;
    url_imagen?: string;
  } | null;
}

interface NotificationStore {
  // Toast notifications (temporales)
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Database notifications (persistentes)
  userNotifications: DatabaseNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  
  // Métodos para notificaciones de BD
  loadUserNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  getUserNotifications: (userId: string) => DatabaseNotification[];
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  // Toast notifications
  notifications: [],
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // Auto remove after duration (default 5 seconds)
    const duration = notification.duration || 5000;
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, duration);
  },
  
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
  
  // Database notifications
  userNotifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  loadUserNotifications: async (userId: string) => {
    set({ loading: true, error: null });
    try {
      const notifications = await NotificationService.obtenerNotificacionesUsuario(userId);
      const unreadCount = notifications.filter(n => !n.leida).length;
      
      set({ 
        userNotifications: notifications,
        unreadCount,
        loading: false 
      });
    } catch (error: any) {
      console.error('Error al cargar notificaciones:', error);
      set({ 
        error: error.message || 'Error al cargar notificaciones',
        loading: false 
      });
    }
  },
  
  markAsRead: async (notificationId: string) => {
    try {
      await NotificationService.marcarComoLeida(notificationId);
      
      set((state) => ({
        userNotifications: state.userNotifications.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      }));
    } catch (error: any) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  },
  
  markAllAsRead: async (userId: string) => {
    try {
      await NotificationService.marcarTodasComoLeidas(userId);
      
      set((state) => ({
        userNotifications: state.userNotifications.map(n => ({ ...n, leida: true })),
        unreadCount: 0
      }));
    } catch (error: any) {
      console.error('Error al marcar todas como leídas:', error);
      throw error;
    }
  },
  
  deleteNotification: async (notificationId: string) => {
    try {
      await NotificationService.eliminarNotificacion(notificationId);
      
      set((state) => {
        const notification = state.userNotifications.find(n => n.id === notificationId);
        const wasUnread = notification && !notification.leida;
        
        return {
          userNotifications: state.userNotifications.filter(n => n.id !== notificationId),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });
    } catch (error: any) {
      console.error('Error al eliminar notificación:', error);
      throw error;
    }
  },
  
  getUserNotifications: (userId: string) => {
    return get().userNotifications.filter(n => n.id_usuario === userId);
  }
}));