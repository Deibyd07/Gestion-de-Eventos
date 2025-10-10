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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {/* Total Users */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-blue-700">Total Usuarios</p>
            <p className="text-xl md:text-2xl font-bold text-blue-900">{formatNumber(stats.totalUsers)}</p>
            <p className="text-xs md:text-sm text-green-600 font-medium flex items-center mt-1">
              <span className="truncate">+{stats.growth.users}% vs mes anterior</span>
            </p>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Total Events */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-green-700">Total Eventos</p>
            <p className="text-2xl font-bold text-green-900">{formatNumber(stats.totalEvents)}</p>
            <p className="text-sm text-green-600 font-medium">+{stats.growth.events}% vs mes anterior</p>
          </div>
        </div>
      </div>

      {/* Total Revenue */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-purple-700">Ingresos Totales</p>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-green-600 font-medium">+{stats.growth.revenue}% vs mes anterior</p>
          </div>
        </div>
      </div>

      {/* Active Events */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
        <div className="flex items-center">
          <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-orange-700">Eventos Activos</p>
            <p className="text-2xl font-bold text-orange-900">{stats.activeEvents}</p>
            <p className="text-sm text-blue-600 font-medium">En curso</p>
          </div>
        </div>
      </div>
    </div>
  );
};
