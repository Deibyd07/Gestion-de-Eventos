import { Calendar, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

interface QuickStats {
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  avgTicketPrice: number;
  upcomingEvents: number;
  completedEvents: number;
  ventasHoy?: number;
  ingresosHoy?: number;
  comisionHoy?: number;
  netoHoy?: number;
  vistasUnicas?: number;
  abandonoCarrito?: number;
  eventosEnCurso?: number;
  asistenciaPromedio?: number;
  ultimoEscaneoISO?: string | null;
}

interface OrganizerMetricsProps {
  stats: QuickStats;
  formatRevenue: (amount: number) => string;
}

export function OrganizerMetrics({ stats, formatRevenue }: OrganizerMetricsProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Real-time Metrics Dashboard - HU23 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {/* Eventos Activos */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Eventos Activos</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
              <p className="text-xs md:text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="truncate">+2 este mes</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ingresos en Tiempo Real */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{formatRevenue(stats.totalRevenue)}</p>
              <p className="text-xs md:text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="truncate">+12.5% vs mes anterior</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Asistencia en Tiempo Real */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Total Asistentes</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
              <p className="text-xs md:text-sm text-blue-600 flex items-center mt-1">
                <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="truncate">{stats.conversionRate}% conversión</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Ventas en Tiempo Real */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4 md:p-6">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.ventasHoy ?? 0}</p>
              <p className="text-xs md:text-sm text-orange-600 flex items-center mt-1">
                <Activity className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                <span className="truncate">+23% vs ayer</span>
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Métricas de Asistencia */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Asistencia en Tiempo Real</h3>
          <div className="space-y-3 md:space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <span className="text-xs md:text-sm text-gray-600">Eventos en Curso</span>
              <span className="font-semibold text-green-600 text-sm md:text-base">{stats.eventosEnCurso ?? 0}</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <span className="text-xs md:text-sm text-gray-600">Asistencia Promedio</span>
              <span className="font-semibold text-blue-600 text-sm md:text-base">{(stats.asistenciaPromedio ?? 0).toFixed(1)}%</span>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <span className="text-xs md:text-sm text-gray-600">Último Escaneo</span>
              <span className="font-semibold text-gray-600 text-sm md:text-base">
                {stats.ultimoEscaneoISO ? new Date(stats.ultimoEscaneoISO).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Métricas Financieras (del Evento) */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Métricas Financieras</h3>
          <div className="space-y-3 md:space-y-4">
            {(() => {
              const tasa = 0.025; // 2.5%
              const ingresosEvento = stats.totalRevenue || 0;
              const comisionEvento = ingresosEvento * tasa;
              const netoEvento = ingresosEvento - comisionEvento;
              return (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <span className="text-xs md:text-sm text-gray-600">Ingresos del Evento</span>
                    <span className="font-semibold text-green-600 text-sm md:text-base">{formatRevenue(ingresosEvento)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <span className="text-xs md:text-sm text-gray-600">Comisión del Evento</span>
                    <span className="font-semibold text-red-600 text-sm md:text-base">{formatRevenue(comisionEvento)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <span className="text-xs md:text-sm text-gray-600">Neto del Evento</span>
                    <span className="font-semibold text-blue-600 text-sm md:text-base">{formatRevenue(netoEvento)}</span>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
