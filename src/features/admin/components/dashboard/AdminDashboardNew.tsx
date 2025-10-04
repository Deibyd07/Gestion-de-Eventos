import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Shield, 
  BarChart3, 
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Activity,
  Server,
  Database,
  Globe,
  Smartphone,
  Monitor,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Target,
  Zap,
  UserPlus,
  CalendarPlus,
  CreditCard,
  Bell
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  activeEvents: number;
  pendingApprovals: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  recentActivity: Array<{
    id: string;
    type: 'user_registration' | 'event_created' | 'payment_received' | 'system_alert';
    description: string;
    timestamp: string;
    severity?: 'low' | 'medium' | 'high';
  }>;
  topOrganizers: Array<{
    id: string;
    name: string;
    events: number;
    revenue: number;
    rating: number;
  }>;
  systemMetrics: {
    serverUptime: string;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

interface AdminDashboardProps {
  stats: AdminStats;
  onRefresh: () => void;
  onExportData: (type: string) => void;
  onSystemAction: (action: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  onRefresh,
  onExportData,
  onSystemAction
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  // Datos de ejemplo más realistas
  const dashboardData = {
    overview: {
      totalUsers: 2847,
      totalEvents: 156,
      totalRevenue: 125000000,
      activeEvents: 23,
      pendingApprovals: 5,
      systemHealth: 'excellent' as const,
      growth: {
        users: 12.5,
        events: 8.3,
        revenue: 15.2
      }
    },
    metrics: {
      serverUptime: '99.9%',
      responseTime: 120,
      errorRate: 0.1,
      activeConnections: 156,
      avgSessionTime: '4m 32s',
      pageViews: 12547,
      bounceRate: 23.4
    },
    recentActivity: [
      {
        id: '1',
        type: 'user_registration' as const,
        description: 'Nuevo usuario registrado: María García',
        timestamp: 'Hace 2 horas',
        severity: 'low' as const
      },
      {
        id: '2',
        type: 'event_created' as const,
        description: 'Evento creado: "Feria Agropecuaria Zarzal 2024"',
        timestamp: 'Hace 4 horas',
        severity: 'medium' as const
      },
      {
        id: '3',
        type: 'payment_received' as const,
        description: 'Pago recibido: $2,500,000 por evento "Workshop React"',
        timestamp: 'Hace 6 horas',
        severity: 'low' as const
      },
      {
        id: '4',
        type: 'system_alert' as const,
        description: 'Alto tráfico detectado en el servidor',
        timestamp: 'Hace 8 horas',
        severity: 'high' as const
      }
    ],
    topOrganizers: [
      {
        id: '1',
        name: 'Juan Pérez',
        events: 12,
        revenue: 15000000,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Ana López',
        events: 8,
        revenue: 12000000,
        rating: 4.9
      },
      {
        id: '3',
        name: 'Carlos Ruiz',
        events: 6,
        revenue: 8500000,
        rating: 4.7
      }
    ],
    deviceStats: {
      desktop: 65,
      mobile: 30,
      tablet: 5
    },
    locationStats: {
      'Zarzal': 45,
      'Cali': 25,
      'Palmira': 15,
      'Tulua': 10,
      'Otros': 5
    }
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

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemHealthText = (health: string) => {
    switch (health) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bueno';
      case 'warning': return 'Advertencia';
      case 'critical': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-4 space-y-2 admin-panel panel-consistent-width">
      {/* Controls */}
      <div className="flex justify-end items-center">
        <div className="flex space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
          <button
            onClick={() => onExportData('dashboard')}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 metrics-container grid-consistent">
        {/* Total Users */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Usuarios</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(dashboardData.overview.totalUsers)}</p>
              <p className="text-sm text-green-600 font-medium">+{dashboardData.overview.growth.users}% vs mes anterior</p>
            </div>
          </div>
        </div>

        {/* Total Events */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Total Eventos</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(dashboardData.overview.totalEvents)}</p>
              <p className="text-sm text-green-600 font-medium">+{dashboardData.overview.growth.events}% vs mes anterior</p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Ingresos Totales</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(dashboardData.overview.totalRevenue)}</p>
              <p className="text-sm text-green-600 font-medium">+{dashboardData.overview.growth.revenue}% vs mes anterior</p>
            </div>
          </div>
        </div>

        {/* Active Events */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Eventos Activos</p>
              <p className="text-2xl font-bold text-orange-900">{dashboardData.overview.activeEvents}</p>
              <p className="text-sm text-blue-600 font-medium">En curso</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* System Health */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-emerald-700">Salud del Sistema</p>
              <p className="text-2xl font-bold text-emerald-900">{getSystemHealthText(dashboardData.overview.systemHealth)}</p>
              <p className="text-sm text-green-600 font-medium">Operativo</p>
            </div>
          </div>
        </div>

        {/* Server Uptime */}
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl shadow-sm">
              <Server className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-cyan-700">Tiempo de Actividad</p>
              <p className="text-2xl font-bold text-cyan-900">{dashboardData.metrics.serverUptime}</p>
              <p className="text-sm text-blue-600 font-medium">Estable</p>
            </div>
          </div>
        </div>

        {/* Response Time */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-sm">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">Tiempo de Respuesta</p>
              <p className="text-2xl font-bold text-amber-900">{dashboardData.metrics.responseTime}ms</p>
              <p className="text-sm text-green-600 font-medium">Rápido</p>
            </div>
          </div>
        </div>

        {/* Active Connections */}
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl shadow-sm">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-indigo-700">Conexiones Activas</p>
              <p className="text-2xl font-bold text-indigo-900">{dashboardData.metrics.activeConnections}</p>
              <p className="text-sm text-purple-600 font-medium">En línea</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver todas
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                  {activity.type === 'user_registration' && <UserPlus className="w-4 h-4" />}
                  {activity.type === 'event_created' && <CalendarPlus className="w-4 h-4" />}
                  {activity.type === 'payment_received' && <CreditCard className="w-4 h-4" />}
                  {activity.type === 'system_alert' && <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Organizers */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Organizadores</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Ver ranking
            </button>
          </div>
          <div className="space-y-4">
            {dashboardData.topOrganizers.map((organizer, index) => (
              <div key={organizer.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{organizer.name}</p>
                    <p className="text-xs text-gray-500">{organizer.events} eventos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(organizer.revenue)}</p>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="text-xs text-gray-500">{organizer.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device and Location Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Statistics */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivos</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">Desktop</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${dashboardData.deviceStats.desktop}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.deviceStats.desktop}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Mobile</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${dashboardData.deviceStats.mobile}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.deviceStats.mobile}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">Tablet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${dashboardData.deviceStats.tablet}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900">{dashboardData.deviceStats.tablet}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Location Statistics */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicaciones</h3>
          <div className="space-y-4">
            {Object.entries(dashboardData.locationStats).map(([location, percentage]) => (
              <div key={location} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{location}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
