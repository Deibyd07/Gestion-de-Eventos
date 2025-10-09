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
}

export function OrganizerDashboardContent({
  stats,
  onCreateEvent,
  onNavigateToTab,
  formatRevenue
}: OrganizerDashboardContentProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <OrganizerMetrics stats={stats} formatRevenue={formatRevenue} />
      <RecentActivity />
      <QuickActions onCreateEvent={onCreateEvent} onNavigateToTab={onNavigateToTab} />
    </div>
  );
}
