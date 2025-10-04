import React, { useState, useEffect } from 'react';
import { Bell, Mail, MessageSquare, AlertCircle, CheckCircle, X, Filter, Search, MarkAsRead } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'promotion';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
  category: 'event' | 'payment' | 'system' | 'marketing';
  eventId?: string;
  eventTitle?: string;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (notificationId: string) => void;
  onFilterChange: (filters: NotificationFilters) => void;
}

interface NotificationFilters {
  type: string;
  category: string;
  priority: string;
  isRead: string;
  search: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onFilterChange
}) => {
  const [filters, setFilters] = useState<NotificationFilters>({
    type: '',
    category: '',
    priority: '',
    isRead: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  const filteredNotifications = notifications.filter(notification => {
    if (filters.type && notification.type !== filters.type) return false;
    if (filters.category && notification.category !== filters.category) return false;
    if (filters.priority && notification.priority !== filters.priority) return false;
    if (filters.isRead === 'read' && !notification.isRead) return false;
    if (filters.isRead === 'unread' && notification.isRead) return false;
    if (filters.search && !notification.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !notification.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Bell className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <X className="w-5 h-5 text-red-500" />;
      case 'reminder':
        return <Bell className="w-5 h-5 text-purple-500" />;
      case 'promotion':
        return <MessageSquare className="w-5 h-5 text-pink-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'reminder':
        return 'bg-purple-50 border-purple-200';
      case 'promotion':
        return 'bg-pink-50 border-pink-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString('es-ES');
  };

  const updateFilter = (key: keyof NotificationFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectNotification = (notificationId: string) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleMarkSelectedAsRead = () => {
    selectedNotifications.forEach(id => onMarkAsRead(id));
    setSelectedNotifications([]);
  };

  const handleDeleteSelected = () => {
    if (confirm('¿Estás seguro de que quieres eliminar las notificaciones seleccionadas?')) {
      selectedNotifications.forEach(id => onDeleteNotification(id));
      setSelectedNotifications([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Centro de Notificaciones</h3>
          <p className="text-sm text-gray-500">
            {notifications.length} notificaciones • {unreadCount} sin leer
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <MarkAsRead className="w-4 h-4 mr-2" />
              Marcar todo como leído
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Filtros</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
              <select
                value={filters.type}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="info">Información</option>
                <option value="success">Éxito</option>
                <option value="warning">Advertencia</option>
                <option value="error">Error</option>
                <option value="reminder">Recordatorio</option>
                <option value="promotion">Promoción</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <select
                value={filters.category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las categorías</option>
                <option value="event">Evento</option>
                <option value="payment">Pago</option>
                <option value="system">Sistema</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <select
                value={filters.priority}
                onChange={(e) => updateFilter('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas las prioridades</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.isRead}
                onChange={(e) => updateFilter('isRead', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="unread">Sin leer</option>
                <option value="read">Leídas</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Buscar en notificaciones..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedNotifications.length} notificaciones seleccionadas
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleMarkSelectedAsRead}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Marcar como leídas
              </button>
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se encontraron notificaciones con los filtros aplicados.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 transition-colors ${
                notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
              } ${getNotificationColor(notification.type)}`}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification.id)}
                  onChange={() => handleSelectNotification(notification.id)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-sm font-medium ${
                        notification.isRead ? 'text-gray-900' : 'text-gray-900 font-semibold'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                  
                  {notification.eventTitle && (
                    <div className="mt-2 text-xs text-gray-500">
                      Evento: {notification.eventTitle}
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {notification.category} • {notification.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!notification.isRead && (
                        <button
                          onClick={() => onMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          Marcar como leída
                        </button>
                      )}
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          {notification.actionText || 'Ver más'}
                        </a>
                      )}
                      <button
                        onClick={() => onDeleteNotification(notification.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Sin leer</p>
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Alta Prioridad</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.priority === 'high').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <MessageSquare className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Eventos</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.filter(n => n.category === 'event').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};