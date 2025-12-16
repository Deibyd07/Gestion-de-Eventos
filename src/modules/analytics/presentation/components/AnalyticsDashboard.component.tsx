import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, CheckCircle, AlertCircle, Download, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface AnalyticsData {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  averageTicketPrice: number;
  growth: {
    events: number;
    revenue: number;
    attendees: number;
    conversionRate: number;
  };
  topEvents: Array<{
    id: string;
    title: string;
    revenue: number;
    attendees: number;
    date: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    year: number;
    revenue: number;
    events: number;
    eventsList: Array<{
      id: string;
      title: string;
      revenue: number;
      percentage: number;
    }>;
    growthVsPrevMonth: number;
  }>;
  attendanceTrends: Array<{
    date: string;
    checkIns: number;
    noShows: number;
  }>;
  ticketSalesByType: Array<{
    type: string;
    sales: number;
    revenue: number;
    eventName: string;
    eventId: string;
  }>;
  geographicData: Array<{
    location: string;
    events: number;
    revenue: number;
  }>;
  priceMetrics: {
    averagePrice: number;
    maxPrice: number;
    minPrice: number;
  };
  attendanceStats: {
    averageAttendanceRate: number;
    bestDayOfWeek: string;
    peakCheckInHour: string;
  };
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onExportReport: (format: 'csv' | 'excel' | 'pdf', filters: { month?: string; year: string }) => void;
  onFilterChange: (filters: AnalyticsFilters) => void;
  userRole: 'admin' | 'organizer';
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  eventType: string;
  location: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  onExportReport,
  onRefresh,
  isRefreshing = false
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'attendance' | 'reports'>('overview');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllTicketTypes, setShowAllTicketTypes] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [isExportingReport, setIsExportingReport] = useState<string | null>(null);

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

  // Función para obtener el color de la medalla (uniforme para todos)
  const getMedalColor = (index: number) => {
    return {
      bg: 'bg-white/70',
      border: 'border-indigo-200',
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-800',
      shadow: 'shadow-sm'
    };
  };

  // Obtener eventos a mostrar
  const eventsToShow = showAllEvents ? data.topEvents : data.topEvents.slice(0, 3);

  // Toggle expansión de mes
  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };


  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: TrendingUp },
    { id: 'revenue', label: 'Ingresos', icon: DollarSign },
    { id: 'attendance', label: 'Asistencia', icon: Users },
    { id: 'reports', label: 'Reportes', icon: Download }
  ] as const;

  return (
    <div className="space-y-6 admin-panel panel-consistent-width">
      {/* Action Buttons */}
      {onRefresh && (
        <div className="flex justify-end">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-blue-700 truncate">Total Eventos</p>
              <p className="text-lg md:text-2xl font-bold text-blue-900">{formatNumber(data.totalEvents)}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-green-700 truncate">Ingresos Totales</p>
              <p className="text-lg md:text-2xl font-bold text-green-900">{formatCurrency(data.totalRevenue)}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm flex-shrink-0">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-purple-700 truncate">Total Asistentes</p>
              <p className="text-lg md:text-2xl font-bold text-purple-900">{formatNumber(data.totalAttendees)}</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-yellow-700 truncate">Tasa de Conversión</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-900">{data.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="p-2 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-sm flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border-b-2 border-gray-300 rounded-xl md:rounded-2xl p-2">
        <nav className="grid grid-cols-3 sm:flex sm:space-x-1 sm:space-x-2 gap-1 sm:gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Events */}
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Eventos Destacados</h3>
                {data.topEvents && data.topEvents.length > 3 && (
                  <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
                  >
                    {showAllEvents ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Ver menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver todos ({data.topEvents.length})
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {data.topEvents && data.topEvents.length > 0 ? (
                  eventsToShow.map((event, index) => {
                    const colors = getMedalColor(index);
                    return (
                      <div 
                        key={event.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white via-gray-50 to-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-sm">
                            <span className={`text-lg ${colors.iconText}`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{event.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{new Date(event.date).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-lg text-gray-900">{formatCurrency(event.revenue)}</p>
                          <p className="text-xs text-gray-600 mt-1 flex items-center justify-end">
                            {event.attendees} asistentes
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white/50 rounded-xl">
                    <p className="text-gray-500 font-medium">No hay eventos con ventas disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center space-x-3 mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Ingresos por Mes</h3>
              </div>
              <div className="space-y-3">
                {data.revenueByMonth && data.revenueByMonth.length > 0 ? (
                  data.revenueByMonth.map((month, index) => {
                    const monthKey = `${month.month}-${month.year}`;
                    const isExpanded = expandedMonths.has(monthKey);
                    const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.revenue));
                    
                    return (
                      <div key={index} className="bg-gradient-to-r from-white via-gray-50 to-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
                        {/* Header - Siempre visible */}
                        <div 
                          className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 hover:from-emerald-100/80 hover:to-teal-100/80 cursor-pointer transition-all duration-200"
                          onClick={() => toggleMonth(monthKey)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="text-sm font-semibold text-gray-900">{month.month} {month.year}</span>
                              <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold shadow-sm">
                                {month.events} {month.events === 1 ? 'evento' : 'eventos'}
                              </span>
                              {month.growthVsPrevMonth !== 0 && (
                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm ${
                                  month.growthVsPrevMonth > 0 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {month.growthVsPrevMonth > 0 ? '↑ ' : '↓ '}{Math.abs(month.growthVsPrevMonth).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(month.revenue)}</span>
                              {month.events > 0 && (
                                isExpanded ? 
                                  <ChevronUp className="w-5 h-5 text-emerald-600" /> : 
                                  <ChevronDown className="w-5 h-5 text-emerald-600" />
                              )}
                            </div>
                          </div>
                          
                          {/* Barra de progreso */}
                          <div className="w-full bg-gray-200 rounded-full h-2.5 shadow-inner">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                              style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Detalles expandibles */}
                        {isExpanded && month.eventsList.length > 0 && (
                          <div className="p-4 bg-white/90 border-t-2 border-emerald-100">
                            <p className="text-xs font-semibold text-emerald-700 mb-3 uppercase tracking-wide">Eventos del mes:</p>
                            <div className="space-y-2">
                              {month.eventsList.map((event, eventIndex) => (
                                <div 
                                  key={event.id} 
                                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-emerald-50/30 rounded-lg hover:from-emerald-50 hover:to-emerald-100/50 transition-all duration-200 border border-gray-200 hover:border-emerald-300 hover:shadow-md"
                                >
                                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                                    <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                                      <span className="text-xs font-semibold text-white">#{eventIndex + 1}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 truncate">{event.title}</span>
                                  </div>
                                  <div className="flex items-center space-x-3 flex-shrink-0 ml-3">
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-gray-900">{formatCurrency(event.revenue)}</p>
                                      <p className="text-xs text-emerald-600 font-semibold">{event.percentage.toFixed(1)}% del total</p>
                                    </div>
                                    <div className="w-20 bg-gray-200 rounded-full h-2 shadow-inner">
                                      <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full shadow-sm"
                                        style={{ width: `${event.percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 bg-white/50 rounded-xl">
                    <p className="text-gray-500 font-medium">No hay datos de ingresos disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ventas por Tipo de Entrada</h3>
                {data.ticketSalesByType && data.ticketSalesByType.length > 3 && (
                  <button
                    onClick={() => setShowAllTicketTypes(!showAllTicketTypes)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    {showAllTicketTypes ? (
                      <>
                        <ChevronUp className="w-4 h-4" />
                        Mostrar menos
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Ver todos ({data.ticketSalesByType.length})
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {data.ticketSalesByType && data.ticketSalesByType.length > 0 ? (
                  <>
                    {(showAllTicketTypes ? data.ticketSalesByType : data.ticketSalesByType.slice(0, 3)).map((type, index) => (
                      <div key={index} className="border-l-4 border-indigo-500 bg-white/50 rounded-r-lg p-3 hover:bg-white/70 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{type.type}</p>
                              <p className="text-xs text-gray-600 mt-0.5 truncate" title={type.eventName}>
                                📌 {type.eventName}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <p className="text-sm font-medium text-gray-900">{formatNumber(type.sales)} ventas</p>
                            <p className="text-sm text-gray-500">{formatCurrency(type.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay datos de ventas por tipo de entrada</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Precios</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Precio Promedio</span>
                  <span className="font-medium text-gray-900">{formatCurrency(data.priceMetrics.averagePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Más Caro</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.priceMetrics.maxPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ticket Más Barato</span>
                  <span className="font-medium text-blue-600">{formatCurrency(data.priceMetrics.minPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias de Asistencia</h3>
              <div className="space-y-2">
                {data.attendanceTrends && data.attendanceTrends.length > 0 ? (
                  data.attendanceTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{trend.date}</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-600">{trend.checkIns} asistieron</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-gray-600">{trend.noShows} no asistieron</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Sistema de check-in próximamente disponible</p>
                    <p className="text-xs mt-2">Las tendencias de asistencia estarán disponibles cuando se implemente el sistema de verificación QR</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Asistencia</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa de Asistencia Promedio</span>
                  <span className="font-medium text-gray-900">{data.attendanceStats.averageAttendanceRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mejor Día de la Semana</span>
                  <span className="font-medium text-gray-900">{data.attendanceStats.bestDayOfWeek}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hora Pico de Registro</span>
                  <span className="font-medium text-gray-900">{data.attendanceStats.peakCheckInHour}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Geographic Tab */}
        {false && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución Geográfica</h3>
              <div className="space-y-3">
                {data.geographicData.map((location, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{location.location}</p>
                        <p className="text-sm text-gray-500">{location.events} eventos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(location.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas por Región</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Región con Más Eventos</span>
                  <span className="font-medium text-gray-900">Bogotá</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mayor Ingreso por Región</span>
                  <span className="font-medium text-gray-900">Medellín</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Crecimiento Regional</span>
                  <span className="font-medium text-green-600">+23% Valle del Cauca</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Reports Section */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h4 className="font-semibold text-gray-900 text-sm md:text-base">Reportes de Analytics</h4>
              </div>
              <div className="max-w-md">
                {/* General Report */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-gray-900 mb-2">Reporte General</h5>
                  <p className="text-sm text-gray-600 mb-3">Métricas y análisis generales del sistema</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setIsExportingReport('general-pdf');
                        onExportReport('pdf', {
                          year: new Date().getFullYear().toString()
                        });
                        setTimeout(() => setIsExportingReport(null), 2000);
                      }}
                      disabled={isExportingReport === 'general-pdf'}
                      className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4 mr-1 inline" />
                      {isExportingReport === 'general-pdf' ? 'Generando...' : 'PDF'}
                    </button>
                    <button
                      onClick={() => {
                        setIsExportingReport('general-excel');
                        onExportReport('excel', {
                          year: new Date().getFullYear().toString()
                        });
                        setTimeout(() => setIsExportingReport(null), 2000);
                      }}
                      disabled={isExportingReport === 'general-excel'}
                      className="px-3 py-2 bg-white text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4 mr-1 inline" />
                      {isExportingReport === 'general-excel' ? 'Generando...' : 'Excel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Information */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-indigo-600" />
                Información sobre Reportes
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>• El reporte general incluye todas las métricas principales del sistema</p>
                <p>• Contiene análisis de eventos, ingresos, asistencia y tendencias</p>
                <p>• Formato PDF: Ideal para presentaciones y documentos oficiales</p>
                <p>• Formato Excel: Permite análisis y manipulación de datos personalizada</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
