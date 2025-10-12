import React from 'react';
import { AdminStatsCards } from './AdminStatsCards.component';
import { RecentActivity } from './RecentActivity.component';
import { TopOrganizers } from './TopOrganizers.component';
import { DeviceLocationStats } from './DeviceLocationStats.component';

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

interface AdminDashboardContentProps {
  stats: AdminStats;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
  dashboardData: {
    overview: {
      totalUsers: number;
      totalEvents: number;
      totalRevenue: number;
      activeEvents: number;
      pendingApprovals: number;
      growth: {
        users: number;
        events: number;
        revenue: number;
      };
    };
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
    deviceStats: {
      desktop: number;
      mobile: number;
      tablet: number;
    };
    locationStats: Record<string, number>;
  };
}

export const AdminDashboardContent: React.FC<AdminDashboardContentProps> = ({
  stats,
  formatCurrency,
  formatNumber,
  dashboardData
}) => {
  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      {/* Key Metrics Grid */}
      <AdminStatsCards 
        stats={dashboardData.overview}
        formatCurrency={formatCurrency}
        formatNumber={formatNumber}
      />


      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <RecentActivity activities={dashboardData.recentActivity} />
        <TopOrganizers 
          organizers={dashboardData.topOrganizers}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Device and Location Stats */}
      <DeviceLocationStats 
        deviceStats={dashboardData.deviceStats}
        locationStats={dashboardData.locationStats}
      />
    </div>
  );
};
