import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Calendar, 
  Clock, 
  Target, 
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

interface AdvancedMetricsData {
  conversionFunnel: {
    visitors: number;
    interested: number;
    registered: number;
    purchased: number;
    attended: number;
  };
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trafficSources: {
    direct: number;
    social: number;
    search: number;
    referral: number;
    email: number;
  };
  engagementMetrics: {
    averageSessionDuration: string;
    pagesPerSession: number;
    bounceRate: number;
    returnVisitorRate: number;
  };
  performanceMetrics: {
    pageLoadTime: number;
    serverResponseTime: number;
    uptime: number;
    errorRate: number;
  };
  revenueMetrics: {
    averageOrderValue: number;
    customerLifetimeValue: number;
    repeatCustomerRate: number;
    refundRate: number;
  };
  geographicMetrics: {
    topCountries: Array<{
      country: string;
      visitors: number;
      revenue: number;
    }>;
    topCities: Array<{
      city: string;
      events: number;
      attendees: number;
    }>;
  };
  timeBasedMetrics: {
    peakHours: Array<{
      hour: string;
      activity: number;
    }>;
    peakDays: Array<{
      day: string;
      activity: number;
    }>;
  };
}

interface AdvancedMetricsProps {
  data: AdvancedMetricsData;
  onTimeRangeChange: (range: string) => void;
  onMetricSelect: (metric: string) => void;
}

export const AdvancedMetrics: React.FC<AdvancedMetricsProps> = ({
  data,
  onTimeRangeChange,
  onMetricSelect
}) => {
  const [activeMetric, setActiveMetric] = useState('conversion');
  const [timeRange, setTimeRange] = useState('30d');

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

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const metrics = [
    { id: 'conversion', label: 'Embudo de Conversión', icon: Target },
    { id: 'devices', label: 'Dispositivos', icon: Smartphone },
    { id: 'traffic', label: 'Fuentes de Tráfico', icon: Globe },
    { id: 'engagement', label: 'Engagement', icon: Activity },
    { id: 'performance', label: 'Rendimiento', icon: Zap },
    { id: 'revenue', label: 'Ingresos', icon: DollarSign },
    { id: 'geographic', label: 'Geográfico', icon: MapPin },
    { id: 'temporal', label: 'Temporal', icon: Clock }
  ] as const;

  const timeRanges = [
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' },
    { value: '1y', label: 'Último año' }
  ];

  const handleMetricChange = (metric: string) => {
    setActiveMetric(metric);
    onMetricSelect(metric);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    onTimeRangeChange(range);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Métricas Avanzadas</h2>
          <p className="text-gray-600">Análisis detallado del rendimiento de la plataforma</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => handleTimeRangeChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metric Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <button
              key={metric.id}
              onClick={() => handleMetricChange(metric.id)}
              className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
                activeMetric === metric.id
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-2 border-transparent'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium text-center">{metric.label}</span>
            </button>
          );
        })}
      </div>

      {/* Metric Content */}
      <div className="space-y-6">
        {/* Conversion Funnel */}
        {activeMetric === 'conversion' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Embudo de Conversión</h3>
              <div className="space-y-4">
                {[
                  { label: 'Visitantes', value: data.conversionFunnel.visitors, color: 'bg-blue-500' },
                  { label: 'Interesados', value: data.conversionFunnel.interested, color: 'bg-green-500' },
                  { label: 'Registrados', value: data.conversionFunnel.registered, color: 'bg-yellow-500' },
                  { label: 'Compradores', value: data.conversionFunnel.purchased, color: 'bg-orange-500' },
                  { label: 'Asistentes', value: data.conversionFunnel.attended, color: 'bg-red-500' }
                ].map((step, index) => {
                  const percentage = index === 0 ? 100 : (step.value / data.conversionFunnel.visitors) * 100;
                  return (
                    <div key={step.label} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{step.label}</span>
                        <span className="text-sm text-gray-500">{formatNumber(step.value)} ({formatPercentage(percentage)})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${step.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasas de Conversión</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Visitante → Comprador</span>
                  <span className="text-lg font-bold text-blue-600">
                    {formatPercentage((data.conversionFunnel.purchased / data.conversionFunnel.visitors) * 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Comprador → Asistente</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPercentage((data.conversionFunnel.attended / data.conversionFunnel.purchased) * 100)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Retención General</span>
                  <span className="text-lg font-bold text-purple-600">
                    {formatPercentage((data.conversionFunnel.attended / data.conversionFunnel.visitors) * 100)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Device Breakdown */}
        {activeMetric === 'devices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Dispositivo</h3>
              <div className="space-y-4">
                {[
                  { label: 'Desktop', value: data.deviceBreakdown.desktop, color: 'bg-blue-500', icon: Monitor },
                  { label: 'Mobile', value: data.deviceBreakdown.mobile, color: 'bg-green-500', icon: Smartphone },
                  { label: 'Tablet', value: data.deviceBreakdown.tablet, color: 'bg-purple-500', icon: Smartphone }
                ].map((device) => {
                  const total = data.deviceBreakdown.desktop + data.deviceBreakdown.mobile + data.deviceBreakdown.tablet;
                  const percentage = (device.value / total) * 100;
                  const Icon = device.icon;
                  return (
                    <div key={device.label} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${device.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                          <Icon className={`w-4 h-4 ${device.color.replace('bg-', 'text-')}`} />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{device.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{formatNumber(device.value)}</span>
                        <span className="text-sm text-gray-500 ml-2">({formatPercentage(percentage)})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento por Dispositivo</h3>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Desktop</span>
                    <span className="text-sm font-bold text-blue-600">Alto</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tiempo promedio: 4.2 min | Conversión: 3.8%
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Mobile</span>
                    <span className="text-sm font-bold text-green-600">Medio</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tiempo promedio: 2.1 min | Conversión: 2.1%
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Tablet</span>
                    <span className="text-sm font-bold text-purple-600">Bajo</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Tiempo promedio: 1.8 min | Conversión: 1.5%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Sources */}
        {activeMetric === 'traffic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes de Tráfico</h3>
              <div className="space-y-4">
                {[
                  { label: 'Directo', value: data.trafficSources.direct, color: 'bg-blue-500' },
                  { label: 'Redes Sociales', value: data.trafficSources.social, color: 'bg-green-500' },
                  { label: 'Búsqueda', value: data.trafficSources.search, color: 'bg-yellow-500' },
                  { label: 'Referidos', value: data.trafficSources.referral, color: 'bg-purple-500' },
                  { label: 'Email', value: data.trafficSources.email, color: 'bg-red-500' }
                ].map((source) => {
                  const total = Object.values(data.trafficSources).reduce((sum, val) => sum + val, 0);
                  const percentage = (source.value / total) * 100;
                  return (
                    <div key={source.label} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-700">{source.label}</span>
                        <span className="text-sm text-gray-500">{formatNumber(source.value)} ({formatPercentage(percentage)})</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${source.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calidad del Tráfico</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Mejor Fuente</span>
                  <span className="text-sm font-bold text-green-600">Email (4.2% conversión)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Mayor Volumen</span>
                  <span className="text-sm font-bold text-blue-600">Búsqueda (45%)</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Crecimiento</span>
                  <span className="text-sm font-bold text-yellow-600">Redes Sociales (+23%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Metrics */}
        {activeMetric === 'engagement' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Duración Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{data.engagementMetrics.averageSessionDuration}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Páginas por Sesión</p>
                  <p className="text-2xl font-bold text-gray-900">{data.engagementMetrics.pagesPerSession.toFixed(1)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tasa de Rebote</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.engagementMetrics.bounceRate)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Visitantes Recurrentes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.engagementMetrics.returnVisitorRate)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {activeMetric === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tiempo de Carga</p>
                  <p className="text-2xl font-bold text-gray-900">{data.performanceMetrics.pageLoadTime}ms</p>
                  <p className="text-sm text-green-600">Excelente</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Respuesta del Servidor</p>
                  <p className="text-2xl font-bold text-gray-900">{data.performanceMetrics.serverResponseTime}ms</p>
                  <p className="text-sm text-blue-600">Bueno</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tiempo Activo</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.performanceMetrics.uptime)}</p>
                  <p className="text-sm text-purple-600">Excelente</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tasa de Error</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.performanceMetrics.errorRate)}</p>
                  <p className="text-sm text-red-600">Bajo</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Metrics */}
        {activeMetric === 'revenue' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Valor Promedio de Orden</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenueMetrics.averageOrderValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Valor de Vida del Cliente</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(data.revenueMetrics.customerLifetimeValue)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Clientes Recurrentes</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.revenueMetrics.repeatCustomerRate)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tasa de Reembolso</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPercentage(data.revenueMetrics.refundRate)}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Geographic Metrics */}
        {activeMetric === 'geographic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Países Top</h3>
              <div className="space-y-4">
                {data.geographicMetrics.topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{country.country}</p>
                        <p className="text-sm text-gray-500">{formatNumber(country.visitors)} visitantes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(country.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ciudades Top</h3>
              <div className="space-y-4">
                {data.geographicMetrics.topCities.map((city, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{city.city}</p>
                        <p className="text-sm text-gray-500">{formatNumber(city.events)} eventos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatNumber(city.attendees)} asistentes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Temporal Metrics */}
        {activeMetric === 'temporal' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horas Pico</h3>
              <div className="space-y-3">
                {data.timeBasedMetrics.peakHours.map((hour, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{hour.hour}:00</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(hour.activity / Math.max(...data.timeBasedMetrics.peakHours.map(h => h.activity))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {formatNumber(hour.activity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Días de Mayor Actividad</h3>
              <div className="space-y-3">
                {data.timeBasedMetrics.peakDays.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{day.day}</span>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(day.activity / Math.max(...data.timeBasedMetrics.peakDays.map(d => d.activity))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">
                        {formatNumber(day.activity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
