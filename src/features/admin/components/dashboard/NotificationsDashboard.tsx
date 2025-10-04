import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users,
  Calendar,
  DollarSign,
  Activity,
  Shield,
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  MoreVertical,
  Check,
  X,
  Plus,
  RefreshCw
} from 'lucide-react';

export const NotificationsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system' | 'user' | 'event' | 'payment'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Datos de ejemplo
  const notifications = [
    {
      id: '1',
      type: 'system',
      priority: 'high',
      title: 'Alto tráfico detectado en el servidor',
      message: 'El servidor está experimentando un aumento inusual en el tráfico.',
      timestamp: '2024-11-28T10:30:00Z',
      read: false,
      category: 'system',
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-100'
    },
    {
      id: '2',
      type: 'user',
      priority: 'medium',
      title: 'Nuevo usuario registrado',
      message: 'María García se ha registrado en la plataforma.',
      timestamp: '2024-11-28T09:15:00Z',
      read: false,
      category: 'user',
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      id: '3',
      type: 'event',
      priority: 'low',
      title: 'Evento creado exitosamente',
      message: 'El evento "Feria Agropecuaria Zarzal 2024" ha sido creado.',
      timestamp: '2024-11-28T08:45:00Z',
      read: true,
      category: 'event',
      icon: Calendar,
      color: 'text-green-600 bg-green-100'
    },
    {
      id: '4',
      type: 'payment',
      priority: 'high',
      title: 'Pago procesado exitosamente',
      message: 'Se ha procesado un pago de $150,000.',
      timestamp: '2024-11-28T08:20:00Z',
      read: false,
      category: 'payment',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-100'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesTab = activeTab === 'all' || notification.category === activeTab;
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'Todas', count: notifications.length, icon: Bell },
    { id: 'unread', label: 'No leídas', count: notifications.filter(n => !n.read).length, icon: Clock },
    { id: 'system', label: 'Sistema', count: notifications.filter(n => n.category === 'system').length, icon: Activity },
    { id: 'user', label: 'Usuarios', count: notifications.filter(n => n.category === 'user').length, icon: Users },
    { id: 'event', label: 'Eventos', count: notifications.filter(n => n.category === 'event').length, icon: Calendar },
    { id: 'payment', label: 'Pagos', count: notifications.filter(n => n.category === 'payment').length, icon: DollarSign }
  ];

  return (
    <div className="p-4 space-y-2">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm">
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Nueva Notificación</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-1">
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const getCardStyle = (index: number) => {
            const styles = [
              'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700',
              'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700',
              'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700',
              'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700',
              'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 text-pink-700',
              'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 text-indigo-700'
            ];
            return styles[index] || styles[0];
          };
          
          const getIconStyle = (index: number) => {
            const styles = [
              'bg-gradient-to-r from-blue-500 to-blue-600',
              'bg-gradient-to-r from-green-500 to-green-600',
              'bg-gradient-to-r from-purple-500 to-purple-600',
              'bg-gradient-to-r from-orange-500 to-orange-600',
              'bg-gradient-to-r from-pink-500 to-pink-600',
              'bg-gradient-to-r from-indigo-500 to-indigo-600'
            ];
            return styles[index] || styles[0];
          };
          
          return (
            <div key={tab.id} className={`${getCardStyle(index)} border rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 p-4 backdrop-blur-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{tab.label}</p>
                  <p className="text-2xl font-bold">{tab.count}</p>
                </div>
                <div className={`p-2 ${getIconStyle(index)} rounded-xl shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border-b-2 border-gray-300 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filtros adicionales</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-2xl shadow-sm border border-white/20 p-2">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-shadow ${
                !notification.read ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-lg ${notification.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {getPriorityText(notification.priority)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{notification.message}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{formatDate(notification.timestamp)}</span>
                        <span className="capitalize">{notification.category}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="flex space-x-1">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          {notification.read ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notificaciones</h3>
          <p className="text-gray-600">No se encontraron notificaciones que coincidan con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
};
