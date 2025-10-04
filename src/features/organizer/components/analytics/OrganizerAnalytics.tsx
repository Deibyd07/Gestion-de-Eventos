import { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye, 
  Target, 
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Filter,
  RefreshCw,
  Award,
  Clock,
  MapPin,
  Tag,
  Star,
  Activity,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { useEventStore } from '../../../../core/stores/eventStore';
import { usePurchaseStore } from '../../../../core/stores/purchaseStore';
import { useAnalyticsStore } from '../../../../core/stores/analyticsStore';
import { useAuthStore } from '../../../../core/stores/authStore';
import { TrendsDashboardSimple } from '../../../analytics/components/TrendsDashboardSimple';

interface AnalyticsData {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  totalViews: number;
  conversionRate: number;
  avgTicketPrice: number;
  satisfaction: number;
  monthlyGrowth: number;
  topEvent: {
    title: string;
    revenue: number;
    attendees: number;
  };
  revenueByMonth: {
    month: string;
    revenue: number;
    events: number;
  }[];
  eventsByCategory: {
    category: string;
    count: number;
    revenue: number;
  }[];
  attendanceTrend: {
    date: string;
    attendees: number;
    revenue: number;
  }[];
  ticketTypePerformance: {
    type: string;
    sold: number;
    revenue: number;
    conversion: number;
  }[];
}

export function OrganizerAnalytics() {
  const { user } = useAuthStore();
  const { events: storeEvents } = useEventStore();
  const { purchases } = usePurchaseStore();
  const { eventAnalytics, platformAnalytics } = useAnalyticsStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState('trends');

  // Filtrar eventos del organizador actual
  const events = storeEvents.filter(event => event.organizerId === user?.id);
  
  // Calcular datos reales
  const totalRevenue = events.reduce((sum, event) => sum + (event.price || 0), 0);
  const totalAttendees = events.reduce((sum, event) => sum + (event.currentAttendees || 0), 0);
  const totalViews = events.reduce((sum, event) => sum + (event.views || 0), 0);
  
  const analyticsData: AnalyticsData = {
    totalEvents: events.length,
    activeEvents: events.filter(event => event.status === 'active').length,
    completedEvents: events.filter(event => event.status === 'completed').length,
    totalRevenue,
    totalAttendees,
    totalViews,
    conversionRate: totalViews > 0 ? (totalAttendees / totalViews) * 100 : 0,
    avgTicketPrice: events.length > 0 ? totalRevenue / events.length : 0,
    satisfaction: 4.7, // TODO: Calcular desde feedback real
    monthlyGrowth: 12.5, // TODO: Calcular desde datos históricos
    topEvent: events.length > 0 ? {
      title: events[0].title,
      revenue: events[0].price || 0,
      attendees: events[0].currentAttendees || 0
    } : { title: 'N/A', revenue: 0, attendees: 0 },
    revenueByMonth: [], // TODO: Calcular desde datos históricos
    eventsByCategory: [], // TODO: Agrupar por categoría
    attendanceTrend: [], // TODO: Calcular tendencias
    ticketTypePerformance: [] // TODO: Calcular desde tipos de entrada
  };

  const mainMetrics = [
    {
      label: 'Ingresos Totales',
      value: `€${analyticsData.totalRevenue.toLocaleString()}`,
      change: `+${analyticsData.monthlyGrowth}%`,
      changeType: 'positive',
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Total Asistentes',
      value: analyticsData.totalAttendees.toLocaleString(),
      change: '+18.2%',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Tasa de Conversión',
      value: `${analyticsData.conversionRate}%`,
      change: '+2.1%',
      changeType: 'positive',
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Satisfacción',
      value: `${analyticsData.satisfaction}/5`,
      change: '+0.3',
      changeType: 'positive',
      icon: Star,
      color: 'yellow'
    }
  ];

  const performanceMetrics = [
    {
      label: 'Eventos Completados',
      value: analyticsData.completedEvents,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Eventos Activos',
      value: analyticsData.activeEvents,
      icon: Activity,
      color: 'blue'
    },
    {
      label: 'Vistas Totales',
      value: analyticsData.totalViews.toLocaleString(),
      icon: Eye,
      color: 'purple'
    },
    {
      label: 'Ticket Promedio',
      value: `€${analyticsData.avgTicketPrice}`,
      icon: Award,
      color: 'orange'
    }
  ];

  const getCategoryColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500'];
    return colors[index % colors.length];
  };

  const getTicketTypeColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500'];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex justify-end">
        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Analytics Avanzados
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Análisis detallado del rendimiento de tus eventos
            </p>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </select>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Vista General</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'trends'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Tendencias</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === 'performance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Rendimiento</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'trends' && (
        <>
          {console.log('Renderizando pestaña trends, activeTab:', activeTab)}
          <TrendsDashboardSimple />
        </>
      )}

      {activeTab === 'overview' && (
        <>
          {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainMetrics.map((metric, index) => {
          const getCardStyle = (index: number) => {
            const styles = [
              'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700',
              'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700',
              'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700',
              'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700'
            ];
            return styles[index] || styles[0];
          };
          
          const getIconStyle = (index: number) => {
            const styles = [
              'bg-gradient-to-r from-blue-500 to-blue-600',
              'bg-gradient-to-r from-green-500 to-green-600',
              'bg-gradient-to-r from-purple-500 to-purple-600',
              'bg-gradient-to-r from-orange-500 to-orange-600'
            ];
            return styles[index] || styles[0];
          };
          
          return (
            <div key={index} className={`${getCardStyle(index)} border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                  <div className={`flex items-center mt-2 text-sm ${
                    metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${getIconStyle(index)} rounded-lg flex items-center justify-center shadow-sm`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => {
          const getCardStyle = (index: number) => {
            const styles = [
              'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-700',
              'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700',
              'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700',
              'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 text-orange-700'
            ];
            return styles[index] || styles[0];
          };
          
          const getIconStyle = (index: number) => {
            const styles = [
              'bg-gradient-to-r from-green-500 to-green-600',
              'bg-gradient-to-r from-blue-500 to-blue-600',
              'bg-gradient-to-r from-purple-500 to-purple-600',
              'bg-gradient-to-r from-orange-500 to-orange-600'
            ];
            return styles[index] || styles[0];
          };
          
          return (
            <div key={index} className={`${getCardStyle(index)} border rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{metric.label}</p>
                  <p className="text-2xl font-bold mt-2">{metric.value}</p>
                </div>
                <div className={`w-12 h-12 ${getIconStyle(index)} rounded-lg flex items-center justify-center shadow-sm`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Ingresos por Mes</h4>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-lg ${chartType === 'bar' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setChartType('line')}
                className={`p-2 rounded-lg ${chartType === 'line' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              {chartType === 'bar' ? (
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              ) : (
                <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              )}
              <p className="text-gray-600">Gráfico de ingresos por mes</p>
              <p className="text-sm text-gray-500">Los gráficos interactivos se implementarán próximamente</p>
            </div>
          </div>
        </div>

        {/* Events by Category */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold text-gray-900">Eventos por Categoría</h4>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600">
              <PieChart className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {analyticsData.eventsByCategory.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getCategoryColor(index)}`}></div>
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{category.count} eventos</div>
                  <div className="text-xs text-gray-500">€{category.revenue.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 grid-scrollable grid-consistent">
        {/* Top Event */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Evento Destacado</h4>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h5 className="text-lg font-semibold">{analyticsData.topEvent.title}</h5>
              <Award className="w-6 h-6" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Ingresos</p>
                <p className="text-xl font-bold">€{analyticsData.topEvent.revenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Asistentes</p>
                <p className="text-xl font-bold">{analyticsData.topEvent.attendees}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ticket Type Performance */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Tipo de Entrada</h4>
          <div className="space-y-4">
            {analyticsData.ticketTypePerformance.map((ticket, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${getTicketTypeColor(index)}`}></div>
                  <div>
                    <div className="font-medium text-gray-900">{ticket.type}</div>
                    <div className="text-sm text-gray-500">{ticket.sold} vendidas</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">€{ticket.revenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">{ticket.conversion}% conversión</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance Trend */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900">Tendencia de Asistencia</h4>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
              Últimos 6 meses
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
              Último año
            </button>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Gráfico de tendencia de asistencia</p>
            <p className="text-sm text-gray-500">Visualización de datos en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold">Insights y Recomendaciones</h4>
          <Zap className="w-6 h-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-semibold mb-2">💡 Oportunidades</h5>
            <ul className="text-purple-100 space-y-1 text-sm">
              <li>• Los eventos de tecnología tienen mayor conversión</li>
              <li>• Las entradas VIP generan más ingresos por asistente</li>
              <li>• Los eventos de networking tienen alta satisfacción</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">📈 Recomendaciones</h5>
            <ul className="text-purple-100 space-y-1 text-sm">
              <li>• Aumentar eventos de tecnología en Q2</li>
              <li>• Crear más opciones de entradas premium</li>
              <li>• Optimizar precios basado en demanda</li>
            </ul>
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'performance' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Rendimiento</h4>
          <p className="text-gray-600">Próximamente: Análisis detallado de rendimiento por evento.</p>
        </div>
      )}
    </div>
  );
}

