import { AlertTriangle, X, DollarSign, Users, Calendar } from 'lucide-react';
import { Modal } from '@shared/ui';
import { formatRevenue } from '@shared/lib/utils/Currency.utils';

interface DeleteEventConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: {
    id: string;
    titulo: string;
    fecha_evento: string;
    asistentes_actuales: number;
    comprasCompletadas?: number;
    totalVentas?: number;
  } | null;
  isDeleting?: boolean;
}

export function DeleteEventConfirmation({
  isOpen,
  onClose,
  onConfirm,
  event,
  isDeleting = false
}: DeleteEventConfirmationProps) {
  if (!event) return null;

  const hasAttendees = event.asistentes_actuales > 0;
  const hasSales = (event.comprasCompletadas || 0) > 0;
  const canDelete = !hasSales; // Solo se puede eliminar si no hay ventas completadas

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
          canDelete ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          <AlertTriangle className={`w-7 h-7 ${canDelete ? 'text-red-600' : 'text-yellow-600'}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">
            {canDelete ? '¿Eliminar Evento?' : 'No se puede eliminar'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {canDelete 
              ? 'Esta acción no se puede deshacer' 
              : 'Este evento tiene restricciones que impiden su eliminación'
            }
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Información del evento */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-1">{event.titulo}</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.fecha_evento).toLocaleDateString('es-CO')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{event.asistentes_actuales} asistentes</span>
          </div>
        </div>
      </div>

      {/* Advertencias y validaciones */}
      <div className="space-y-3 mb-6">
        {hasSales && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 text-sm">Ventas Completadas</p>
                <p className="text-sm text-red-700 mt-1">
                  Este evento tiene <strong>{event.comprasCompletadas} compra(s) completada(s)</strong> por un total de <strong>{formatRevenue(event.totalVentas || 0)}</strong>.
                </p>
                <p className="text-xs text-red-600 mt-2">
                  ❌ No puedes eliminar un evento con ventas completadas. Considera <strong>cancelar</strong> el evento en su lugar.
                </p>
              </div>
            </div>
          </div>
        )}

        {!hasSales && hasAttendees && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900 text-sm">Asistentes Registrados</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Hay <strong>{event.asistentes_actuales} persona(s)</strong> registrada(s) para este evento.
                </p>
                <p className="text-xs text-yellow-600 mt-2">
                  ⚠️ Se eliminarán todos los registros asociados.
                </p>
              </div>
            </div>
          </div>
        )}

        {canDelete && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Se eliminarán permanentemente:</strong>
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 ml-4 list-disc">
              <li>Información del evento</li>
              <li>Tipos de entrada configurados</li>
              <li>Registros de asistencia</li>
              <li>Datos analíticos</li>
              <li>Compras pendientes o canceladas</li>
            </ul>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canDelete ? 'Cancelar' : 'Cerrar'}
        </button>

        {canDelete && (
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Eliminando...</span>
              </>
            ) : (
              <span>Sí, Eliminar Evento</span>
            )}
          </button>
        )}
      </div>

      {!canDelete && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            💡 <strong>Sugerencia:</strong> Puedes <span className="text-blue-600 font-semibold">cancelar</span> el evento para mantener el historial y procesar reembolsos.
          </p>
        </div>
      )}
    </Modal>
  );
}
