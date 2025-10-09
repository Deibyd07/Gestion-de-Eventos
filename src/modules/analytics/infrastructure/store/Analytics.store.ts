import { create } from 'zustand';

export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  conversionRate: number;
  averageTicketPrice: number;
  topTicketType: string;
  salesByDay: { date: string; sales: number; revenue: number }[];
  salesByTicketType: { ticketType: string; sales: number; revenue: number }[];
  attendanceRate: number;
  refunds: number;
  refundAmount: number;
}

export interface PlatformAnalytics {
  totalEvents: number;
  totalUsers: number;
  totalRevenue: number;
  totalTicketsSold: number;
  averageEventRating: number;
  topCategories: { category: string; count: number; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  userGrowth: { month: string; users: number }[];
  eventGrowth: { month: string; events: number }[];
}

interface AnalyticsState {
  eventAnalytics: EventAnalytics[];
  platformAnalytics: PlatformAnalytics | null;
  loading: boolean;
  setEventAnalytics: (analytics: EventAnalytics[]) => void;
  setPlatformAnalytics: (analytics: PlatformAnalytics) => void;
  getEventAnalytics: (eventId: string) => EventAnalytics | undefined;
  generateMockAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  eventAnalytics: [],
  platformAnalytics: null,
  loading: false,

  setEventAnalytics: (analytics) => set({ eventAnalytics: analytics }),

  setPlatformAnalytics: (analytics) => set({ platformAnalytics: analytics }),

  getEventAnalytics: (eventId) => {
    const { eventAnalytics } = get();
    return eventAnalytics.find(analytics => analytics.eventId === eventId);
  },

  generateMockAnalytics: () => {
    set({ loading: true });
    
    // Simulate API call
    setTimeout(() => {
      const mockEventAnalytics: EventAnalytics[] = [
        {
          eventId: '1',
          eventTitle: 'Conferencia Tech Madrid 2024',
          totalViews: 15420,
          totalSales: 342,
          totalRevenue: 30438,
          conversionRate: 2.2,
          averageTicketPrice: 89,
          topTicketType: 'General',
          salesByDay: [
            { date: '2024-01-01', sales: 15, revenue: 1335 },
            { date: '2024-01-02', sales: 23, revenue: 2047 },
            { date: '2024-01-03', sales: 18, revenue: 1602 },
            { date: '2024-01-04', sales: 31, revenue: 2759 },
            { date: '2024-01-05', sales: 27, revenue: 2403 },
            { date: '2024-01-06', sales: 35, revenue: 3115 },
            { date: '2024-01-07', sales: 42, revenue: 3738 }
          ],
          salesByTicketType: [
            { ticketType: 'Early Bird', sales: 45, revenue: 3105 },
            { ticketType: 'General', sales: 158, revenue: 14062 },
            { ticketType: 'VIP', sales: 12, revenue: 1788 }
          ],
          attendanceRate: 94.2,
          refunds: 3,
          refundAmount: 267
        },
        {
          eventId: '2',
          eventTitle: 'Festival de Música Electrónica',
          totalViews: 23450,
          totalSales: 756,
          totalRevenue: 34020,
          conversionRate: 3.2,
          averageTicketPrice: 45,
          topTicketType: 'General',
          salesByDay: [
            { date: '2024-01-01', sales: 28, revenue: 1260 },
            { date: '2024-01-02', sales: 35, revenue: 1575 },
            { date: '2024-01-03', sales: 42, revenue: 1890 },
            { date: '2024-01-04', sales: 38, revenue: 1710 },
            { date: '2024-01-05', sales: 45, revenue: 2025 },
            { date: '2024-01-06', sales: 52, revenue: 2340 },
            { date: '2024-01-07', sales: 48, revenue: 2160 }
          ],
          salesByTicketType: [
            { ticketType: 'General', sales: 756, revenue: 34020 }
          ],
          attendanceRate: 98.1,
          refunds: 1,
          refundAmount: 45
        },
        {
          eventId: '3',
          eventTitle: 'Masterclass de Fotografía Digital',
          totalViews: 3420,
          totalSales: 32,
          totalRevenue: 1120,
          conversionRate: 0.9,
          averageTicketPrice: 35,
          topTicketType: 'General',
          salesByDay: [
            { date: '2024-01-01', sales: 2, revenue: 70 },
            { date: '2024-01-02', sales: 3, revenue: 105 },
            { date: '2024-01-03', sales: 1, revenue: 35 },
            { date: '2024-01-04', sales: 4, revenue: 140 },
            { date: '2024-01-05', sales: 2, revenue: 70 },
            { date: '2024-01-06', sales: 3, revenue: 105 },
            { date: '2024-01-07', sales: 1, revenue: 35 }
          ],
          salesByTicketType: [
            { ticketType: 'Estudiante', sales: 8, revenue: 200 },
            { ticketType: 'General', sales: 10, revenue: 350 }
          ],
          attendanceRate: 100,
          refunds: 0,
          refundAmount: 0
        }
      ];

      const mockPlatformAnalytics: PlatformAnalytics = {
        totalEvents: 156,
        totalUsers: 12450,
        totalRevenue: 245680,
        totalTicketsSold: 8934,
        averageEventRating: 4.6,
        topCategories: [
          { category: 'Tecnología', count: 45, revenue: 125430 },
          { category: 'Música', count: 38, revenue: 67890 },
          { category: 'Educación', count: 28, revenue: 23450 },
          { category: 'Deportes', count: 22, revenue: 18920 },
          { category: 'Arte', count: 15, revenue: 8990 }
        ],
        monthlyRevenue: [
          { month: 'Ene', revenue: 18500 },
          { month: 'Feb', revenue: 22100 },
          { month: 'Mar', revenue: 28900 },
          { month: 'Abr', revenue: 31200 },
          { month: 'May', revenue: 35600 },
          { month: 'Jun', revenue: 29800 }
        ],
        userGrowth: [
          { month: 'Ene', users: 850 },
          { month: 'Feb', users: 920 },
          { month: 'Mar', users: 1150 },
          { month: 'Abr', users: 1280 },
          { month: 'May', users: 1420 },
          { month: 'Jun', users: 1350 }
        ],
        eventGrowth: [
          { month: 'Ene', events: 12 },
          { month: 'Feb', events: 18 },
          { month: 'Mar', events: 24 },
          { month: 'Abr', events: 28 },
          { month: 'May', events: 32 },
          { month: 'Jun', events: 26 }
        ]
      };

      set({ 
        eventAnalytics: mockEventAnalytics,
        platformAnalytics: mockPlatformAnalytics,
        loading: false 
      });
    }, 1000);
  }
}));


