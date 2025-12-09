import React, { useState, useEffect } from 'react';
import { RefreshCw, Download } from 'lucide-react';
import { AdminDashboardContent } from './dashboard/AdminDashboardContent.component';
import { AdminStatsService } from '@shared/lib/api/services/AdminStats.service';
import { RecentActivityService, RecentActivityItem } from '@shared/lib/api/services/RecentActivity.service';
import { TopOrganizersService, TopOrganizer } from '@shared/lib/api/services/TopOrganizers.service';
import { LocationStatsService } from '@shared/lib/api/services/LocationStats.service';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalRevenue: number;
  activeEvents: number;
  pendingApprovals: number;
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
  const [growthStats, setGrowthStats] = useState({
    users: 0,
    events: 0,
    revenue: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivityItem[]>([]);
  const [topOrganizers, setTopOrganizers] = useState<TopOrganizer[]>([]);
  const [locationStats, setLocationStats] = useState<Record<string, number>>({});

  // Cargar estadísticas de crecimiento y actividad reciente al montar
  useEffect(() => {
    loadGrowthStats();
    loadRecentActivities();
    loadTopOrganizers();
    loadLocationStats();
  }, [stats]);

  const loadGrowthStats = async () => {
    try {
      const growth = await AdminStatsService.getGrowthStats();
      setGrowthStats(growth);
    } catch (error) {
      console.error('Error al cargar estadísticas de crecimiento:', error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      const activities = await RecentActivityService.getRecentActivities(5);
      // Formatear timestamps
      const formattedActivities = activities.map(activity => ({
        ...activity,
        timestamp: RecentActivityService.formatTimestamp(activity.timestamp)
      }));
      setRecentActivities(formattedActivities);
    } catch (error) {
      console.error('Error al cargar actividades recientes:', error);
    }
  };

  const loadTopOrganizers = async () => {
    try {
      const organizers = await TopOrganizersService.getTopOrganizers(5);
      setTopOrganizers(organizers);
    } catch (error) {
      console.error('Error al cargar top organizadores:', error);
    }
  };

  const loadLocationStats = async () => {
    try {
      const stats = await LocationStatsService.getTopLocations(5);
      setLocationStats(stats);
    } catch (error) {
      console.error('Error al cargar estadísticas de ubicaciones:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    await loadGrowthStats();
    await loadRecentActivities();
    await loadTopOrganizers();
    await loadLocationStats();
    setIsRefreshing(false);
  };

  // Datos del dashboard con las estadísticas reales
  const dashboardData = {
    overview: {
      totalUsers: stats.totalUsers,
      totalEvents: stats.totalEvents,
      totalRevenue: stats.totalRevenue,
      activeEvents: stats.activeEvents,
      pendingApprovals: stats.pendingApprovals,
      growth: growthStats
    },
    recentActivity: recentActivities,
    topOrganizers: topOrganizers,
    locationStats: locationStats
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
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-2 sm:gap-3">
         <div className="flex flex-row-reverse sm:flex-row flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
           <button
             onClick={handleRefresh}
             disabled={isRefreshing}
             className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all duration-200 shadow-sm"
           >
             <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
             <span>Actualizar</span>
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
