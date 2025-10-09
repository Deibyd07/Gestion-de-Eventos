import { 
  Calendar, 
  Ticket, 
  CreditCard, 
  QrCode 
} from 'lucide-react';

interface QuickActionsProps {
  onCreateEvent: () => void;
  onNavigateToTab: (tab: string) => void;
}

export function QuickActions({ onCreateEvent, onNavigateToTab }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {/* HU4-HU7: Gestión de Eventos */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Gestión de Eventos</h3>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
          Crear, editar, personalizar y duplicar eventos con información detallada
        </p>
        <button 
          onClick={onCreateEvent}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 text-sm md:text-base rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Crear Evento
        </button>
      </div>

      {/* HU8-HU10: Tipos de Entradas */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Tipos de Entradas</h3>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Ticket className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
          Configura entradas, descuentos y límites de compra por usuario
        </p>
        <button 
          onClick={() => onNavigateToTab('tickets')}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm md:text-base rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Configurar
        </button>
      </div>

      {/* HU14-HU16: Métodos de Pago */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Métodos de Pago</h3>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
          Configura múltiples métodos de pago y recibe reportes de reconciliación
        </p>
        <button 
          onClick={() => onNavigateToTab('payments')}
          className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 text-sm md:text-base rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Configurar
        </button>
      </div>

      {/* HU17-HU19: Control de Asistencia */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900">Control de Asistencia</h3>
          <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">
          Escanea QR, registra asistencia y genera reportes en tiempo real
        </p>
        <button 
          onClick={() => onNavigateToTab('attendance')}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 text-sm md:text-base rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Iniciar Escaneo
        </button>
      </div>
    </div>
  );
}
