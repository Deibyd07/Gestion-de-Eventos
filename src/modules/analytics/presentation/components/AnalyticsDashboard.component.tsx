import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, CheckCircle, AlertCircle, Download, Filter } from 'lucide-react';

interface AnalyticsData {
  totalEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  averageTicketPrice: number;
  topEvents: Array<{
    id: string;
    title: string;
    revenue: number;
    attendees: number;
    date: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    events: number;
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
  }>;
  geographicData: Array<{
    location: string;
    events: number;
    revenue: number;
  }>;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onExportReport: (format: 'csv' | 'excel' | 'pdf') => void;
  onFilterChange: (filters: AnalyticsFilters) => void;
  userRole: 'admin' | 'organizer';
}

interface AnalyticsFilters {
  dateFrom: string;
  dateTo: string;
  eventType: string;
  location: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  data,
  onExportReport
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'attendance'>('overview');
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.export-dropdown')) {
        setIsExportDropdownOpen(false);
      }
    };

    if (isExportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportDropdownOpen]);

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


  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: TrendingUp },
    { id: 'revenue', label: 'Ingresos', icon: DollarSign },
    { id: 'attendance', label: 'Asistencia', icon: Users }
  ] as const;

  return (
    <div className="space-y-6 admin-panel panel-consistent-width">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>
        <div className="relative export-dropdown">
          <button 
            onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </button>
          {isExportDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl shadow-lg z-10">
              <button
                onClick={() => {
                  onExportReport('csv');
                  setIsExportDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-t-xl"
              >
                Exportar CSV
              </button>
              <button
                onClick={() => {
                  onExportReport('excel');
                  setIsExportDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar Excel
              </button>
              <button
                onClick={() => {
                  onExportReport('pdf');
                  setIsExportDropdownOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-b-xl"
              >
                Exportar PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-blue-700 truncate">Total Eventos</p>
              <p className="text-lg md:text-2xl font-bold text-blue-900">{formatNumber(data.totalEvents)}</p>
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <span className="truncate">+12% vs mes anterior</span>
              </p>
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
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <span className="truncate">+8% vs mes anterior</span>
              </p>
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
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <span className="truncate">+15% vs mes anterior</span>
              </p>
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
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <span className="truncate">+2.3% vs mes anterior</span>
              </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {/* Top Events */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Eventos Destacados</h3>
              <div className="space-y-2">
                {data.topEvents.map((event, index) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{event.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(event.revenue)}</p>
                      <p className="text-sm text-gray-500">{event.attendees} asistentes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Mes</h3>
              <div className="space-y-3">
                {data.revenueByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(month.revenue / Math.max(...data.revenueByMonth.map(m => m.revenue))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-20 text-right">
                        {formatCurrency(month.revenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Tipo de Entrada</h3>
              <div className="space-y-3">
                {data.ticketSalesByType.map((type, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' : 'bg-yellow-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-700">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatNumber(type.sales)} ventas</p>
                      <p className="text-sm text-gray-500">{formatCurrency(type.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Precios</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Precio Promedio</span>
                  <span className="font-medium text-gray-900">{formatCurrency(data.averageTicketPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ticket Más Caro</span>
                  <span className="font-medium text-gray-900">{formatCurrency(data.averageTicketPrice * 2.5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ticket Más Barato</span>
                  <span className="font-medium text-gray-900">{formatCurrency(data.averageTicketPrice * 0.3)}</span>
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
                {data.attendanceTrends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{trend.date}</span>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">{trend.checkIns} check-ins</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-gray-600">{trend.noShows} no-shows</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas de Asistencia</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tasa de Asistencia Promedio</span>
                  <span className="font-medium text-gray-900">87.5%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Mejor Día de la Semana</span>
                  <span className="font-medium text-gray-900">Viernes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hora Pico de Check-in</span>
                  <span className="font-medium text-gray-900">19:00 - 20:00</span>
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
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
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
      </div>
    </div>
  );
};
