import React, { useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { AdminDashboardContent } from './dashboard/AdminDashboardContent.component';

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
        description: 'Evento creado: "Feria Agropecuaria Nacional 2024"',
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
      'Bogotá': 35,
      'Medellín': 25,
      'Cali': 20,
      'Barranquilla': 12,
      'Otras ciudades': 8
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

      <AdminDashboardContent 
        stats={stats}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
        dashboardData={dashboardData}
      />
    </div>
  );
};
