import { X, Ticket, QrCode, RefreshCw } from 'lucide-react';

type ActivityItem = {
  type: 'venta' | 'escaneo' | string;
  timeISO: string;
  title: string;
  description: string;
  badge?: string;
  eventTitle?: string;
};

interface AllActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityItem[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function AllActivityModal({ 
  isOpen, 
  onClose, 
  activities, 
  onRefresh,
  isLoading = false 
}: AllActivityModalProps) {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Toda la Actividad</h2>
              <p className="text-sm text-gray-600 mt-1">Historial completo de ventas y asistencias</p>
            </div>
            <div className="flex items-center space-x-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isLoading ? 'Actualizando...' : 'Actualizar'}
                >
                  <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay actividades registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200"
                  >
                    {/* Icon */}
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ 
                        background: activity.type === 'venta' 
                          ? 'linear-gradient(135deg, #22c55e, #059669)' 
                          : 'linear-gradient(135deg, #8b5cf6, #ec4899)' 
                      }}
                    >
                      {activity.type === 'venta' ? (
                        <Ticket className="w-6 h-6 text-white" />
                      ) : (
                        <QrCode className="w-6 h-6 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900">{activity.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                          {activity.eventTitle && (
                            <p className="text-xs text-gray-500 mt-1">
                              📍 {activity.eventTitle}
                            </p>
                          )}
                        </div>
                        {activity.badge && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium flex-shrink-0">
                            {activity.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{formatDate(activity.timeISO)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <p className="text-sm text-gray-600">
              Mostrando {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
