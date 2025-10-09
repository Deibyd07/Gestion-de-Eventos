import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download, 
  Upload, 
  RefreshCw,
  Trash2,
  Archive,
  Monitor,
  HardDrive,
  Cpu,
  MemoryStick,
  Wifi,
  Globe,
  Lock,
  Key,
  Bell,
  Mail,
  Users,
  Calendar,
  DollarSign
} from 'lucide-react';

interface SystemStatus {
  server: {
    status: 'online' | 'offline' | 'maintenance';
    uptime: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
  };
  database: {
    status: 'connected' | 'disconnected' | 'slow';
    connections: number;
    queryTime: number;
    size: string;
    lastBackup: string;
  };
  security: {
    sslStatus: 'active' | 'expired' | 'inactive';
    firewallStatus: 'active' | 'inactive';
    lastSecurityScan: string;
    threatsBlocked: number;
    failedLogins: number;
  };
  performance: {
    pageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

interface SystemManagementProps {
  systemStatus: SystemStatus;
  onSystemAction: (action: string, params?: any) => void;
  onBackup: () => void;
  onMaintenance: (enable: boolean) => void;
  onSecurityScan: () => void;
  onClearCache: () => void;
  onOptimizeDatabase: () => void;
}

export const SystemManagement: React.FC<SystemManagementProps> = ({
  systemStatus,
  onSystemAction,
  onBackup,
  onMaintenance,
  onSecurityScan,
  onClearCache,
  onOptimizeDatabase
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'server' | 'database' | 'security' | 'performance' | 'backups'>('overview');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'offline':
      case 'disconnected':
      case 'inactive':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
      case 'slow':
        return 'text-yellow-600 bg-yellow-100';
      case 'expired':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'En Línea';
      case 'offline': return 'Fuera de Línea';
      case 'maintenance': return 'Mantenimiento';
      case 'connected': return 'Conectado';
      case 'disconnected': return 'Desconectado';
      case 'slow': return 'Lento';
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'expired': return 'Expirado';
      default: return 'Desconocido';
    }
  };

  const handleSystemAction = async (action: string, params?: any) => {
    setIsProcessing(true);
    try {
      await onSystemAction(action, params);
    } finally {
      setIsProcessing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: Monitor },
    { id: 'server', label: 'Servidor', icon: Server },
    { id: 'database', label: 'Base de Datos', icon: Database },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'performance', label: 'Rendimiento', icon: Cpu },
    { id: 'backups', label: 'Respaldos', icon: Archive }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión del Sistema</h2>
          <p className="text-gray-600">Monitoreo y administración de la infraestructura</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleSystemAction('refresh')}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Server Status */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getStatusColor(systemStatus.server.status)}`}>
                  <Server className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Servidor</p>
                  <p className="text-lg font-bold text-gray-900">{getStatusText(systemStatus.server.status)}</p>
                  <p className="text-sm text-gray-600">Uptime: {systemStatus.server.uptime}</p>
                </div>
              </div>
            </div>

            {/* Database Status */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getStatusColor(systemStatus.database.status)}`}>
                  <Database className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Base de Datos</p>
                  <p className="text-lg font-bold text-gray-900">{getStatusText(systemStatus.database.status)}</p>
                  <p className="text-sm text-gray-600">Conexiones: {systemStatus.database.connections}</p>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getStatusColor(systemStatus.security.sslStatus)}`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Seguridad</p>
                  <p className="text-lg font-bold text-gray-900">{getStatusText(systemStatus.security.sslStatus)}</p>
                  <p className="text-sm text-gray-600">SSL: {systemStatus.security.sslStatus}</p>
                </div>
              </div>
            </div>

            {/* Performance Status */}
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Cpu className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rendimiento</p>
                  <p className="text-lg font-bold text-gray-900">{systemStatus.performance.pageLoadTime}ms</p>
                  <p className="text-sm text-gray-600">Tiempo de carga</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Tab */}
        {activeTab === 'server' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Cpu className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Uso de CPU</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.server.cpuUsage}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${systemStatus.server.cpuUsage > 80 ? 'bg-red-500' : systemStatus.server.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemStatus.server.cpuUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <MemoryStick className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Uso de Memoria</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.server.memoryUsage}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${systemStatus.server.memoryUsage > 80 ? 'bg-red-500' : systemStatus.server.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemStatus.server.memoryUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <HardDrive className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Uso de Disco</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.server.diskUsage}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${systemStatus.server.diskUsage > 80 ? 'bg-red-500' : systemStatus.server.diskUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemStatus.server.diskUsage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tiempo de Respuesta</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.server.responseTime}ms</p>
                    <p className="text-sm text-gray-600">Promedio</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones del Servidor</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => handleSystemAction('restart_server')}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Reiniciar Servidor</h5>
                      <p className="text-sm text-gray-500">Reinicia los servicios del servidor</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onMaintenance(true)}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Modo Mantenimiento</h5>
                      <p className="text-sm text-gray-500">Activar modo mantenimiento</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onClearCache()}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Limpiar Cache</h5>
                      <p className="text-sm text-gray-500">Limpiar cache del sistema</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Database Tab */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getStatusColor(systemStatus.database.status)}`}>
                    <Database className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Estado</p>
                    <p className="text-lg font-bold text-gray-900">{getStatusText(systemStatus.database.status)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Conexiones</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.database.connections}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tiempo de Query</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.database.queryTime}ms</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <HardDrive className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tamaño</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.database.size}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Base de Datos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => onBackup()}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Crear Respaldo</h5>
                      <p className="text-sm text-gray-500">Generar backup completo</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onOptimizeDatabase()}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-green-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Optimizar DB</h5>
                      <p className="text-sm text-gray-500">Optimizar tablas y índices</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSystemAction('repair_database')}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Reparar DB</h5>
                      <p className="text-sm text-gray-500">Verificar y reparar errores</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getStatusColor(systemStatus.security.sslStatus)}`}>
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">SSL</p>
                    <p className="text-lg font-bold text-gray-900">{getStatusText(systemStatus.security.sslStatus)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${getStatusColor(systemStatus.security.firewallStatus)}`}>
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Firewall</p>
                    <p className="text-lg font-bold text-gray-900">{getStatusText(systemStatus.security.firewallStatus)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Amenazas Bloqueadas</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.security.threatsBlocked}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Key className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Logins Fallidos</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.security.failedLogins}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones de Seguridad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => onSecurityScan()}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Escanear Seguridad</h5>
                      <p className="text-sm text-gray-500">Ejecutar análisis de seguridad</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSystemAction('update_security')}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Upload className="w-5 h-5 text-green-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Actualizar Seguridad</h5>
                      <p className="text-sm text-gray-500">Actualizar políticas de seguridad</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSystemAction('block_suspicious')}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Bloquear Sospechosos</h5>
                      <p className="text-sm text-gray-500">Bloquear IPs sospechosas</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tiempo de Carga</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.performance.pageLoadTime}ms</p>
                    <p className="text-sm text-gray-600">Páginas</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">API Response</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.performance.apiResponseTime}ms</p>
                    <p className="text-sm text-gray-600">Promedio</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Tasa de Error</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.performance.errorRate}%</p>
                    <p className="text-sm text-gray-600">Errores</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Cpu className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Cache Hit Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{systemStatus.performance.cacheHitRate}%</p>
                    <p className="text-sm text-gray-600">Eficiencia</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimización de Rendimiento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => onClearCache()}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Limpiar Cache</h5>
                      <p className="text-sm text-gray-500">Limpiar cache del sistema</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSystemAction('optimize_images')}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-green-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Optimizar Imágenes</h5>
                      <p className="text-sm text-gray-500">Comprimir y optimizar imágenes</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSystemAction('compress_assets')}
                  disabled={isProcessing}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <Archive className="w-5 h-5 text-purple-600" />
                    <div>
                      <h5 className="font-medium text-gray-900">Comprimir Assets</h5>
                      <p className="text-sm text-gray-500">Comprimir CSS y JS</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Respaldos del Sistema</h3>
                <button
                  onClick={() => onBackup()}
                  disabled={isProcessing}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Crear Respaldo
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Sample backup entries */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">backup_2024_01_15_143022.sql</p>
                      <p className="text-sm text-gray-500">Creado hace 2 horas • 245 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">backup_2024_01_14_090015.sql</p>
                      <p className="text-sm text-gray-500">Creado hace 1 día • 238 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">backup_2024_01_13_180030.sql</p>
                      <p className="text-sm text-gray-500">En progreso • 0 MB</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button disabled className="text-gray-400">
                      <Download className="w-4 h-4" />
                    </button>
                    <button disabled className="text-gray-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Respaldos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frecuencia de Respaldos
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="daily">Diario</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retención de Respaldos
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="7">7 días</option>
                    <option value="30">30 días</option>
                    <option value="90">90 días</option>
                    <option value="365">1 año</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
