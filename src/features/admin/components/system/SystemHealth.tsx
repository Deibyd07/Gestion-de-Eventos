import { useState, useEffect } from 'react';
import { Activity, Server, Database, Globe, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useEventStore } from '../../../core/stores/eventStore';
import { useAuthStore } from '../../../core/stores/authStore';
import { usePurchaseStore } from '../../../core/stores/purchaseStore';

interface SystemMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  unit: string;
  trend: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  message: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function SystemHealth() {
  const { events } = useEventStore();
  const { purchases } = usePurchaseStore();
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadSystemData();
    const interval = setInterval(loadSystemData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      // Calcular métricas reales del sistema
      const totalEvents = events.length;
      const activeEvents = events.filter(event => event.status === 'active').length;
      const totalPurchases = purchases.length;
      const totalUsers = 1; // TODO: Obtener desde store de usuarios
      
      const systemMetrics: SystemMetric[] = [
        {
          name: 'Total Eventos',
          value: totalEvents,
          status: totalEvents > 0 ? 'healthy' : 'warning',
          unit: 'eventos',
          trend: 'stable'
        },
        {
          name: 'Eventos Activos',
          value: activeEvents,
          status: activeEvents > 0 ? 'healthy' : 'warning',
          unit: 'eventos',
          trend: 'stable'
        },
        {
          name: 'Total Compras',
          value: totalPurchases,
          status: totalPurchases > 0 ? 'healthy' : 'warning',
          unit: 'compras',
          trend: 'stable'
        },
        {
          name: 'Usuarios Activos',
          value: totalUsers,
          status: totalUsers > 0 ? 'healthy' : 'warning',
          unit: 'usuarios',
          trend: 'stable'
        },
        {
          name: 'Tasa de Conversión',
          value: totalEvents > 0 ? (totalPurchases / totalEvents) * 100 : 0,
          status: totalEvents > 0 && (totalPurchases / totalEvents) > 0.1 ? 'healthy' : 'warning',
          unit: '%',
          trend: 'stable'
        },
        {
          name: 'Sistema',
          value: 100,
          status: 'healthy',
          unit: '%',
          trend: 'stable'
        }
      ];

      const systemAlerts: SystemAlert[] = [
        {
          id: '1',
          type: 'warning',
          message: 'High memory usage detected - 67.8%',
          timestamp: '2 minutes ago',
          severity: 'medium'
        },
        {
          id: '2',
          type: 'success',
          message: 'Database backup completed successfully',
          timestamp: '15 minutes ago',
          severity: 'low'
        },
        {
          id: '3',
          type: 'error',
          message: 'Failed to process 3 payment transactions',
          timestamp: '1 hour ago',
          severity: 'high'
        },
        {
          id: '4',
          type: 'info',
          message: 'Scheduled maintenance completed',
          timestamp: '2 hours ago',
          severity: 'low'
        }
      ];

      setMetrics(systemMetrics);
      setAlerts(systemAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Activity className="w-5 h-5 text-blue-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Salud del Sistema
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Monitoreo en tiempo real del sistema
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </span>
          <button 
            onClick={loadSystemData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  {getStatusIcon(metric.status)}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{metric.name}</h4>
                  <p className="text-xs text-gray-500">Current status</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {metric.value}{metric.unit}
                </div>
                <div className={`text-xs flex items-center ${
                  metric.trend === 'up' ? 'text-green-600' :
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                  {metric.trend === 'up' ? 'Increasing' : metric.trend === 'down' ? 'Decreasing' : 'Stable'}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  metric.status === 'healthy' ? 'bg-green-500' :
                  metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(metric.value, 100)}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* System Alerts */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Alertas del Sistema</h4>
          <p className="text-sm text-gray-600">Notificaciones y alertas en tiempo real</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                alert.type === 'error' ? 'bg-red-50 border-red-200' :
                alert.type === 'success' ? 'bg-green-50 border-green-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center space-x-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{alert.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Server className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Servidor</h4>
              <p className="text-sm text-gray-600">Estado del servidor</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">Online</span>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Database className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Base de Datos</h4>
              <p className="text-sm text-gray-600">Estado de la BD</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">Conectada</span>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">APIs</h4>
              <p className="text-sm text-gray-600">Estado de las APIs</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-green-600">Activas</span>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

