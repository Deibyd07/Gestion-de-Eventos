import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Filter,
  Download,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  Settings,
  Ticket,
  MapPin,
  Star,
  Share2,
  QrCode
} from 'lucide-react';

interface OrganizerStats {
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  upcomingEvents: number;
  completedEvents: number;
  averageRating: number;
  totalTicketsSold: number;
  conversionRate: number;
  topPerformingEvent: {
    id: string;
    title: string;
    revenue: number;
    attendees: number;
    date: string;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    date: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    attendees: number;
    revenue: number;
    rating?: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    events: number;
  }>;
  ticketSalesByType: Array<{
    type: string;
    sales: number;
    revenue: number;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    eventTitle: string;
    deadline: string;
    type: 'event_start' | 'ticket_sales_end' | 'refund_deadline';
    priority: 'high' | 'medium' | 'low';
  }>;
}

interface OrganizerDashboardProps {
  stats: OrganizerStats;
  onRefresh: () => void;
  onExportData: (type: string) => void;
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
  onViewEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const OrganizerDashboard: React.FC<OrganizerDashboardProps> = ({
  stats,
  onRefresh,
  onExportData,
  onCreateEvent,
  onEditEvent,
  onViewEvent,
  onDeleteEvent
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'analytics' | 'settings'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'cancelled' | 'completed'>('all');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDeadlineIcon = (type: string) => {
    switch (type) {
      case 'event_start': return Calendar;
      case 'ticket_sales_end': return Ticket;
      case 'refund_deadline': return DollarSign;
      default: return Clock;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'events', label: 'Mis Eventos', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ] as const;

  const filteredEvents = stats.recentEvents.filter(event => 
    filterStatus === 'all' || event.status === filterStatus
  );

  return (
    <div className="space-y-4 md:space-y-6 w-full box-border min-w-0">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 justify-end w-full">
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 md:w-4 md:h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
        <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
          <Download className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Exportar</span>
        </button>
        <button
          onClick={onCreateEvent}
          className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-3 h-3 md:w-4 md:h-4" />
          <span className="hidden sm:inline">Nuevo</span>
        </button>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-3 sm:p-4 md:p-6 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg md:text-3xl font-bold text-gray-900">Panel del Organizador</h1>
            <p className="text-xs md:text-base text-gray-600 mt-1">Gestiona tus eventos y analiza el rendimiento</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 w-full">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6 w-full">
          <div className="flex items-center">
            <div className="p-2 md:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-500">Total Eventos</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{formatNumber(stats.totalEvents)}</p>
              <p className="text-xs md:text-sm text-green-600">{stats.activeEvents} activos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6 w-full">
          <div className="flex items-center">
            <div className="p-2 md:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <DollarSign className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-500">Ingresos Totales</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs md:text-sm text-green-600">+12.5% este mes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6 w-full">
          <div className="flex items-center">
            <div className="p-2 md:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <Users className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-500">Total Asistentes</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{formatNumber(stats.totalAttendees)}</p>
              <p className="text-xs md:text-sm text-green-600">+8.3% este mes</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6 w-full">
          <div className="flex items-center">
            <div className="p-2 md:p-3 bg-yellow-100 rounded-lg flex-shrink-0">
              <Star className="w-4 h-4 md:w-6 md:h-6 text-yellow-600" />
            </div>
            <div className="ml-3 md:ml-4 flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-500">Calificación Promedio</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
              <p className="text-xs md:text-sm text-gray-600">basado en {stats.completedEvents} eventos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto w-full max-w-full">
        <nav className="-mb-px flex space-x-4 md:space-x-8 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-3 h-3 md:w-4 md:h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 md:space-y-6 w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
            {/* Upcoming Deadlines */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-3 sm:p-4 md:p-6 hover:shadow-2xl transition-all duration-200 w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Próximas Fechas Límite</h3>
              <div className="space-y-2 md:space-y-3">
                {stats.upcomingDeadlines.map((deadline) => {
                  const Icon = getDeadlineIcon(deadline.type);
                  return (
                    <div key={deadline.id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                        <div className={`p-1.5 md:p-2 rounded-full flex-shrink-0 ${getPriorityColor(deadline.priority)}`}>
                          <Icon className="w-3 h-3 md:w-4 md:h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm md:text-base font-medium text-gray-900 truncate">{deadline.eventTitle}</p>
                          <p className="text-xs md:text-sm text-gray-500">{deadline.deadline}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 md:py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority === 'high' ? 'Alta' : deadline.priority === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Performing Event */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-3 sm:p-4 md:p-6 hover:shadow-2xl transition-all duration-200 w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Evento Destacado</h3>
              <div className="p-3 md:p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm md:text-base font-semibold text-gray-900 mb-2">{stats.topPerformingEvent.title}</h4>
                <p className="text-xs md:text-sm text-gray-600 mb-3">{stats.topPerformingEvent.date}</p>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Ingresos</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900 truncate">{formatCurrency(stats.topPerformingEvent.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Asistentes</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">{formatNumber(stats.topPerformingEvent.attendees)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-4 md:space-y-6 w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Mis Eventos</h3>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="draft">Borradores</option>
                  <option value="published">Publicados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="completed">Completados</option>
                </select>
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg w-full max-w-full">
              <div className="overflow-x-auto w-full">
                <div className="inline-block min-w-full align-middle">
                  <div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Asistentes
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">ID: {event.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {event.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {getStatusText(event.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatNumber(event.attendees)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(event.revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onViewEvent(event.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Ver evento"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditEvent(event.id)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Editar evento"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteEvent(event.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar evento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
            {/* Revenue Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6 w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Ingresos por Mes</h3>
              <div className="space-y-3 md:space-y-4">
                {stats.revenueByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <span className="text-xs md:text-sm font-medium text-gray-700 flex-shrink-0">{month.month}</span>
                    <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(month.revenue / Math.max(...stats.revenueByMonth.map(m => m.revenue))) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900 text-right truncate max-w-[80px] md:max-w-none">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ticket Sales */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6 w-full">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Ventas por Tipo de Entrada</h3>
              <div className="space-y-3 md:space-y-4">
                {stats.ticketSalesByType.map((type, index) => (
                  <div key={index} className="flex items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-xs md:text-sm font-medium text-gray-700 truncate">{type.type}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs md:text-sm font-medium text-gray-900">{formatNumber(type.sales)} ventas</p>
                      <p className="text-xs md:text-sm text-gray-500 truncate">{formatCurrency(type.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Configuración del Organizador</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 w-full">
              <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Perfil del Organizador</h4>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Organización
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mi Organización"
                    />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe tu organización..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 md:p-6">
                <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Preferencias</h4>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Notificaciones por Email</span>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs md:text-sm font-medium text-gray-700">Aprobación Automática</span>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
