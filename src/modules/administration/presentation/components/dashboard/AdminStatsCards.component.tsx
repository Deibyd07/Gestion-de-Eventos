import React from 'react';
import { Users, Calendar, DollarSign, Activity } from 'lucide-react';

interface AdminStatsCardsProps {
  stats: {
    totalUsers: number;
    totalEvents: number;
    totalRevenue: number;
    activeEvents: number;
    growth: {
      users: number;
      events: number;
      revenue: number;
    };
  };
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number) => string;
}

export const AdminStatsCards: React.FC<AdminStatsCardsProps> = ({
  stats,
  formatCurrency,
  formatNumber
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
      {/* Total Users */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-blue-700 truncate">Total Usuarios</p>
            <p className="text-lg md:text-2xl font-bold text-blue-900">{formatNumber(stats.totalUsers)}</p>
            <p className={`text-xs font-medium flex items-center mt-1 ${stats.growth.users >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="truncate">{stats.growth.users >= 0 ? '+' : ''}{stats.growth.users.toFixed(1)}% vs mes anterior</span>
            </p>
          </div>
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Total Events */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-green-700 truncate">Total Eventos</p>
            <p className="text-lg md:text-2xl font-bold text-green-900">{formatNumber(stats.totalEvents)}</p>
            <p className={`text-xs font-medium flex items-center mt-1 ${stats.growth.events >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="truncate">{stats.growth.events >= 0 ? '+' : ''}{stats.growth.events.toFixed(1)}% vs mes anterior</span>
            </p>
          </div>
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm flex-shrink-0">
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-purple-700 truncate">Ingresos Totales</p>
            <p className="text-lg md:text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className={`text-xs font-medium flex items-center mt-1 ${stats.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="truncate">{stats.growth.revenue >= 0 ? '+' : ''}{stats.growth.revenue.toFixed(1)}% vs mes anterior</span>
            </p>
          </div>
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Active Events */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-orange-700 truncate">Eventos Publicados</p>
            <p className="text-lg md:text-2xl font-bold text-orange-900">{stats.activeEvents}</p>
            <p className="text-xs text-blue-600 font-medium flex items-center mt-1">
              <span className="truncate">Disponibles</span>
            </p>
          </div>
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-sm flex-shrink-0">
            <Activity className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
