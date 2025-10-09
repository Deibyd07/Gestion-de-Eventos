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

export function RecentActivity() {
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
          {/* Event Activity */}
          <div className="p-3 md:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg md:rounded-xl border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 w-full">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 w-full">
                  <h4 className="font-semibold text-sm md:text-base text-gray-900">Nuevo Evento Creado</h4>
                  <span className="text-xs text-gray-500">Hace 2 horas</span>
                </div>
                <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2">"Conferencia de Tecnología 2024" - Bogotá</p>
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    150/200 asistentes
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    $7,500,000 ingresos
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium self-start sm:self-auto">
                Activo
              </div>
            </div>
          </div>
          
          {/* Ticket Sales Activity */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <h4 className="font-semibold text-gray-900">Venta de Entradas</h4>
                  <span className="text-xs text-gray-500">Hace 15 minutos</span>
                </div>
                <p className="text-sm text-gray-600">3 entradas VIP vendidas - $450,000</p>
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Entrada VIP
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15% vs ayer
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium self-start sm:self-auto">
                Venta
              </div>
            </div>
          </div>

          {/* Payment Activity */}
          <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <h4 className="font-semibold text-gray-900">Pago Procesado</h4>
                  <span className="text-xs text-gray-500">Hace 1 hora</span>
                </div>
                <p className="text-sm text-gray-600">Pago de $150,000 procesado exitosamente</p>
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Tarjeta de Crédito
                  </span>
                  <span className="flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Comisión: $7,500
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium self-start sm:self-auto">
                Completado
              </div>
            </div>
          </div>

          {/* QR Scan Activity */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <h4 className="font-semibold text-gray-900">Asistencia Registrada</h4>
                  <span className="text-xs text-gray-500">Hace 5 minutos</span>
                </div>
                <p className="text-sm text-gray-600">María García - Entrada General escaneada</p>
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Total: 127 asistentes
                  </span>
                  <span className="flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    85% tasa de asistencia
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium self-start sm:self-auto">
                Escaneado
              </div>
            </div>
          </div>

          {/* Promotion Activity */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                  <h4 className="font-semibold text-gray-900">Descuento Aplicado</h4>
                  <span className="text-xs text-gray-500">Hace 30 minutos</span>
                </div>
                <p className="text-sm text-gray-600">Código "EARLYBIRD" usado - 30% descuento</p>
                <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center">
                    <Percent className="w-3 h-3 mr-1" />
                    Ahorro: $45,000
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    Usos: 25/50
                  </span>
                </div>
              </div>
              <div className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium self-start sm:self-auto">
                Descuento
              </div>
            </div>
          </div>
        </div>

        {/* View All Activity Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
            <Activity className="w-4 h-4" />
            <span>Ver Toda la Actividad</span>
          </button>
        </div>
      </div>
    </div>
  );
}
