import React from 'react';
import { Shield, Server, Zap, Globe } from 'lucide-react';

interface SystemMetricsProps {
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  systemMetrics: {
    serverUptime: string;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
}

export const SystemMetrics: React.FC<SystemMetricsProps> = ({
  systemHealth,
  systemMetrics
}) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* System Health */}
      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-emerald-700">Salud del Sistema</p>
            <p className="text-2xl font-bold text-emerald-900">{getSystemHealthText(systemHealth)}</p>
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
            <p className="text-2xl font-bold text-cyan-900">{systemMetrics.serverUptime}</p>
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
            <p className="text-2xl font-bold text-amber-900">{systemMetrics.responseTime}ms</p>
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
            <p className="text-2xl font-bold text-indigo-900">{systemMetrics.activeConnections}</p>
            <p className="text-sm text-purple-600 font-medium">En línea</p>
          </div>
        </div>
      </div>
    </div>
  );
};
