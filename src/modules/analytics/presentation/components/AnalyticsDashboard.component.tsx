import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, CheckCircle, AlertCircle, Download, Filter, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [showAllTicketTypes, setShowAllTicketTypes] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  
  // Filtros de exportación
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  // Generar años disponibles (desde 2025 - año de creación del sistema - hasta el año actual)
  const SYSTEM_START_YEAR = 2025;
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from(
    { length: currentYear - SYSTEM_START_YEAR + 1 }, 
    (_, i) => currentYear - i
  );

  // Meses del año
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' }
  ];

  // Detectar meses con datos basándose en revenueByMonth
  const availableMonths = React.useMemo(() => {
    if (!data.revenueByMonth || data.revenueByMonth.length === 0) {
      return new Set<string>();
    }

    const monthsWithData = new Set<string>();
    data.revenueByMonth.forEach((item) => {
      if (item.year.toString() === selectedYear) {
        // Extraer mes del string "Noviembre", "Diciembre", etc.
        const monthIndex = months.findIndex(m => m.label === item.month);
        if (monthIndex !== -1) {
          monthsWithData.add(months[monthIndex].value);
        }
      }
    });

    return monthsWithData;
  }, [data.revenueByMonth, selectedYear]);

  // Filtrar meses disponibles para el año seleccionado
  const filteredMonths = months.filter(month => 
    availableMonths.has(month.value)
  );

  // Resetear mes cuando cambia el año si el mes seleccionado no está disponible
  React.useEffect(() => {
    if (selectedMonth && !availableMonths.has(selectedMonth)) {
      setSelectedMonth('');
    }
  }, [selectedYear, selectedMonth, availableMonths]);

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

  // Función para obtener el color de la medalla
  const getMedalColor = (index: number) => {
    switch(index) {
      case 0:
        return {
          bg: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
          border: 'border-yellow-400',
          iconBg: 'bg-gradient-to-br from-yellow-400 to-yellow-500',
          iconText: 'text-white',
          shadow: 'shadow-yellow-200'
        };
      case 1:
        return {
          bg: 'bg-gradient-to-br from-gray-100 to-gray-200',
          border: 'border-gray-400',
          iconBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
          iconText: 'text-white',
          shadow: 'shadow-gray-200'
        };
      case 2:
        return {
          bg: 'bg-gradient-to-br from-orange-100 to-orange-200',
          border: 'border-orange-400',
          iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
          iconText: 'text-white',
          shadow: 'shadow-orange-200'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-blue-100',
          iconText: 'text-blue-600',
          shadow: ''
        };
    }
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
    { id: 'attendance', label: 'Asistencia', icon: Users }
  ] as const;

  return (
    <div className="space-y-6 admin-panel panel-consistent-width">
      {/* Filtros de Período y Exportación */}
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl p-4 shadow-sm border border-indigo-100">
        <div className="flex flex-wrap items-end gap-4">
          {/* Selector de Año */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Selector de Mes */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mes {filteredMonths.length > 0 && <span className="text-xs text-gray-500">({filteredMonths.length} disponibles)</span>}
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              disabled={filteredMonths.length === 0}
            >
              <option value="">Todos los meses</option>
              {filteredMonths.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
              {filteredMonths.length === 0 && (
                <option value="" disabled>No hay datos para este año</option>
              )}
            </select>
          </div>

          {/* Botón Exportar */}
          <div className="relative export-dropdown">
            <button 
              onClick={() => setIsExportDropdownOpen(!isExportDropdownOpen)}
              className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar Reporte
            </button>
            {isExportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                <button
                  onClick={() => {
                    onExportReport('excel', {
                      month: selectedMonth || undefined,
                      year: selectedYear
                    });
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors text-gray-700 font-medium rounded-t-lg"
                >
                  Excel (.xlsx)
                </button>
                <button
                  onClick={() => {
                    onExportReport('pdf', {
                      month: selectedMonth || undefined,
                      year: selectedYear
                    });
                    setIsExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors text-gray-700 font-medium rounded-b-lg"
                >
                  PDF
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Indicador de período seleccionado */}
        {selectedMonth && (
          <div className="mt-3 text-sm text-indigo-600 font-medium">
            📅 Período seleccionado: {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
          </div>
        )}
        {!selectedMonth && (
          <div className="mt-3 text-sm text-gray-600">
            📅 Mostrando todo el año {selectedYear}
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-blue-700 truncate">Total Eventos</p>
              <p className="text-lg md:text-2xl font-bold text-blue-900">{formatNumber(data.totalEvents)}</p>
              <p className={`text-xs font-medium flex items-center mt-1 ${data.growth.events >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="truncate">{data.growth.events >= 0 ? '+' : ''}{data.growth.events}% vs mes anterior</span>
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
              <p className={`text-xs font-medium flex items-center mt-1 ${data.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="truncate">{data.growth.revenue >= 0 ? '+' : ''}{data.growth.revenue}% vs mes anterior</span>
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
              <p className={`text-xs font-medium flex items-center mt-1 ${data.growth.attendees >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="truncate">{data.growth.attendees >= 0 ? '+' : ''}{data.growth.attendees}% vs mes anterior</span>
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
              <p className={`text-xs font-medium flex items-center mt-1 ${data.growth.conversionRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span className="truncate">{data.growth.conversionRate >= 0 ? '+' : ''}{data.growth.conversionRate}% vs mes anterior</span>
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Eventos Destacados</h3>
                {data.topEvents && data.topEvents.length > 3 && (
                  <button
                    onClick={() => setShowAllEvents(!showAllEvents)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {showAllEvents ? 'Ver menos' : `Ver todos (${data.topEvents.length})`}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {data.topEvents && data.topEvents.length > 0 ? (
                  eventsToShow.map((event, index) => {
                    const colors = getMedalColor(index);
                    return (
                      <div 
                        key={event.id} 
                        className={`flex items-center justify-between p-3 ${colors.bg} border ${colors.border} rounded-lg ${colors.shadow} transition-all duration-200 hover:scale-102`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${colors.iconBg} rounded-full flex items-center justify-center shadow-md`}>
                            <span className={`text-base font-bold ${colors.iconText}`}>
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-600">{new Date(event.date).toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(event.revenue)}</p>
                          <p className="text-xs text-gray-600">
                            <Users className="w-3 h-3 inline mr-1" />
                            {event.attendees} asistentes
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay eventos con ventas disponibles</p>
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos por Mes</h3>
              <div className="space-y-2">
                {data.revenueByMonth.map((month, index) => {
                  const monthKey = `${month.month}-${month.year}`;
                  const isExpanded = expandedMonths.has(monthKey);
                  const maxRevenue = Math.max(...data.revenueByMonth.map(m => m.revenue));
                  
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Header - Siempre visible */}
                      <div 
                        className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 cursor-pointer transition-colors"
                        onClick={() => toggleMonth(monthKey)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-900">{month.month} {month.year}</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {month.events} {month.events === 1 ? 'evento' : 'eventos'}
                            </span>
                            {month.growthVsPrevMonth !== 0 && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                month.growthVsPrevMonth > 0 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {month.growthVsPrevMonth > 0 ? '+' : ''}{month.growthVsPrevMonth.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-bold text-gray-900">{formatCurrency(month.revenue)}</span>
                            {month.events > 0 && (
                              isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                        </div>
                        
                        {/* Barra de progreso */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Detalles expandibles */}
                      {isExpanded && month.eventsList.length > 0 && (
                        <div className="p-3 bg-white border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2 uppercase">Eventos del mes:</p>
                          <div className="space-y-2">
                            {month.eventsList.map((event, eventIndex) => (
                              <div 
                                key={event.id} 
                                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <span className="text-xs font-medium text-gray-500 flex-shrink-0">#{eventIndex + 1}</span>
                                  <span className="text-sm text-gray-900 truncate">{event.title}</span>
                                </div>
                                <div className="flex items-center space-x-3 flex-shrink-0">
                                  <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(event.revenue)}</p>
                                    <p className="text-xs text-gray-500">{event.percentage.toFixed(1)}% del total</p>
                                  </div>
                                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full"
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
                })}
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
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium py-1 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
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
                  <span className="font-medium text-gray-900">{data.attendanceStats.averageAttendanceRate}%</span>
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
