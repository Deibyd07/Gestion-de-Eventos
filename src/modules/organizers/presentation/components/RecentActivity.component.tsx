import { 
  Calendar, 
  Ticket, 
  CreditCard, 
  QrCode, 
  Percent, 
  Users, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  DollarSign 
} from 'lucide-react';

type ActivityItem = {
  type: 'venta' | 'escaneo' | string;
  timeISO: string;
  title: string;
  description: string;
  badge?: string;
  eventTitle?: string;
};

interface RecentActivityProps {
  activities?: ActivityItem[];
  onViewAll?: () => void;
}

export function RecentActivity({ activities = [], onViewAll }: RecentActivityProps) {
  // Mostrar solo las últimas 3 actividades
  const displayedActivities = activities.slice(0, 3);
  
  return (
    <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold text-white">Actividad Reciente</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs md:text-sm text-blue-100 hidden sm:inline">En tiempo real</span>
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {displayedActivities.length === 0 && (
            <div className="text-center text-gray-500 text-sm">Sin actividad reciente</div>
          )}
          {displayedActivities.map((item, idx) => (
            <div key={idx} className="p-3 md:p-4 bg-white rounded-lg md:rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: item.type === 'venta' ? 'linear-gradient(90deg,#22c55e,#059669)' : 'linear-gradient(90deg,#8b5cf6,#ec4899)' }}>
                  {item.type === 'venta' ? <Ticket className="w-5 h-5 md:w-6 md:h-6 text-white" /> : <QrCode className="w-5 h-5 md:w-6 md:h-6 text-white" />}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 w-full">
                    <h4 className="font-semibold text-sm md:text-base text-gray-900">{item.title}</h4>
                    <span className="text-xs text-gray-500">{new Date(item.timeISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
                  {item.eventTitle && (
                    <div className="text-xs text-gray-500 mt-1">{item.eventTitle}</div>
                  )}
                </div>
                {item.badge && (
                  <div className="px-3 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium self-start sm:self-auto">
                    {item.badge}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Activity Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button 
            onClick={onViewAll}
            disabled={!onViewAll || activities.length === 0}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Activity className="w-4 h-4" />
            <span>Ver Toda la Actividad {activities.length > 3 && `(${activities.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
