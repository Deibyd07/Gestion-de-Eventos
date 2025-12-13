import { RefreshCw } from 'lucide-react';
import { OrganizerMetrics } from './OrganizerMetrics.component';
import { RecentActivity } from './RecentActivity.component';
import { QuickActions } from './QuickActions.component';

interface QuickStats {
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  avgTicketPrice: number;
  upcomingEvents: number;
  completedEvents: number;
}

interface OrganizerDashboardContentProps {
  stats: QuickStats;
  onCreateEvent: () => void;
  onNavigateToTab: (tab: string) => void;
  formatRevenue: (amount: number) => string;
  recentActivity?: Array<{
    type: 'venta' | 'escaneo' | string;
    timeISO: string;
    title: string;
    description: string;
    badge?: string;
    eventTitle?: string;
  }>;
  onViewAllActivity?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function OrganizerDashboardContent({
  stats,
  onCreateEvent,
  onNavigateToTab,
  formatRevenue,
  recentActivity,
  onViewAllActivity,
  onRefresh,
  isRefreshing = false
}: OrganizerDashboardContentProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Controls */}
      {onRefresh && (
        <div className="flex justify-end items-center">
          <div className="flex flex-row-reverse sm:flex-row gap-2 sm:gap-3">
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
            </button>
          </div>
        </div>
      )}
      
      <OrganizerMetrics stats={stats} formatRevenue={formatRevenue} />
      <RecentActivity activities={recentActivity || []} onViewAll={onViewAllActivity} />
      <QuickActions onCreateEvent={onCreateEvent} onNavigateToTab={onNavigateToTab} />
    </div>
  );
}
