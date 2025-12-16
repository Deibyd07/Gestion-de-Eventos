import { useState, useEffect } from 'react';
import { Bell, Mail, Settings, Send, Users, Calendar, Trash2, Check, CheckCheck, XCircle, MapPin } from 'lucide-react';
import { useNotificationStore } from '../../../notifications/infrastructure/store/Notification.store';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { useNavigate } from 'react-router-dom';

export function NotificationsPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { 
    userNotifications, 
    unreadCount, 
    loading, 
    loadUserNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();

  useEffect(() => {
    if (user?.id) {
      loadUserNotifications(user.id);
    }
  }, [user?.id, loadUserNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllAsRead(user.id);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
    }
  };

  const handleNotificationClick = (notification: any) => {
    // Marcar como leída
    if (!notification.leida) {
      handleMarkAsRead(notification.id);
    }
    
    // Navegar si tiene URL de acción
    if (notification.url_accion) {
      navigate(notification.url_accion);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case 'evento': return <Calendar className="w-5 h-5" />;
      case 'compra': return <Mail className="w-5 h-5" />;
      case 'sistema': return <Settings className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (tipo: string) => {
    switch (tipo) {
      case 'evento': return 'bg-blue-100 text-blue-600';
      case 'compra': return 'bg-green-100 text-green-600';
      case 'sistema': return 'bg-gray-100 text-gray-600';
      case 'promocion': return 'bg-purple-100 text-purple-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con diseño mejorado */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Notificaciones
                </h1>
                <p className="text-gray-600 mt-1">
                  {unreadCount > 0 
                    ? `Tienes ${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} sin leer`
                    : 'No tienes notificaciones sin leer'
                  }
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                <CheckCheck className="w-4 h-4" />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Lista de notificaciones */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Cargando notificaciones...</p>
              </div>
            ) : userNotifications.length > 0 ? (
              userNotifications.map((notification) => {
                // Obtener título y subtítulo actualizados
                const displayTitle = notification.evento?.titulo || notification.titulo;
                const isEventCancelled = notification.evento?.estado === 'cancelado';
                
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-5 transition-all cursor-pointer hover:bg-gray-50 ${
                      !notification.leida ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icono */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.tipo)}`}>
                        {getNotificationIcon(notification.tipo)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold text-gray-900 ${!notification.leida ? 'font-bold' : ''}`}>
                            {displayTitle}
                            {isEventCancelled && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                Cancelado
                              </span>
                            )}
                          </h3>
                          {!notification.leida && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                          )}
                        </div>

                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {notification.mensaje}
                        </p>

                        {notification.evento && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>
                              {new Date(notification.evento.fecha_evento).toLocaleDateString('es-CO', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            {notification.evento.ubicacion && (
                              <>
                                <span>•</span>
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{notification.evento.ubicacion}</span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs text-gray-500">
                            {(() => {
                              const date = new Date(notification.fecha_creacion);
                              // Ajustar 5 horas (sumar para compensar la diferencia UTC/Colombia)
                              date.setHours(date.getHours() + 5);
                              const hour = String(date.getHours()).padStart(2, '0');
                              const minute = String(date.getMinutes()).padStart(2, '0');
                              return `${hour}:${minute}`;
                            })()}
                          </span>

                          <div className="flex items-center gap-2">
                            {notification.url_accion && (
                              <span className="text-xs text-blue-600 font-medium">
                                {notification.texto_accion || 'Ver más'}
                              </span>
                            )}
                            
                            {!notification.leida && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkAsRead(notification.id);
                                }}
                                className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Marcar como leída"
                              >
                                <Check className="w-4 h-4 text-blue-600" />
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                              className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No tienes notificaciones
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'unread' 
                    ? 'Ya has leído todas tus notificaciones'
                    : 'Aún no tienes notificaciones'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}