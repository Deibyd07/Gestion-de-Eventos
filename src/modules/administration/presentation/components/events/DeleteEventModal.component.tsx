import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  asistentes_actuales: number;
  maximo_asistentes: number;
}

interface DeleteEventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (eventId: string) => Promise<void>;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({ event, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen || !event) return null;

  const hasAttendees = event.asistentes_actuales > 0;
  // Siempre requiere confirmación escribiendo "ELIMINAR"
  const isConfirmationValid = confirmText.trim().toLowerCase() === 'eliminar';

  const handleDelete = async () => {
    // Validación: requiere escribir exactamente "eliminar" (sin importar mayúsculas/minúsculas)
    if (confirmText.trim().toLowerCase() !== 'eliminar') {
      setError('Por favor escribe "ELIMINAR" para confirmar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConfirm(event.id);
      onClose();
      setConfirmText('');
    } catch (err: any) {
      console.error('Error al eliminar evento:', err);
      setError(err.message || 'Error al eliminar el evento');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Eliminar Evento</h2>
                <p className="text-red-100 text-sm mt-1">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium text-sm">¡Atención!</p>
              <p className="text-amber-700 text-sm mt-1">
                Estás a punto de eliminar este evento de forma permanente.
              </p>
            </div>
          </div>

          {/* Event Info */}
          <div className="mb-6">
            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={event.url_imagen || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                alt={event.titulo}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{event.titulo}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">{event.descripcion}</p>
                {hasAttendees && (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    ⚠️ {event.asistentes_actuales} asistentes registrados
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Consequences */}
          <div className="mb-6 space-y-2">
            <p className="text-sm font-medium text-gray-700">Al eliminar este evento:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Se eliminará toda la información del evento</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Se eliminarán los tipos de entrada asociados</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Se eliminarán las analíticas del evento</span>
              </li>
              {hasAttendees && (
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="font-medium text-red-600">
                    Las compras pendientes/canceladas se eliminarán. Las compras completadas evitarán la eliminación.
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Confirmation Input - Siempre requerido */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escribe <span className="font-bold text-red-600">ELIMINAR</span> para confirmar:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ELIMINAR"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              No es sensible a mayúsculas/minúsculas
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleClose}
              className="w-full sm:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-medium shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isConfirmationValid}
            >
              <Trash2 className="w-5 h-5" />
              <span>{loading ? 'Eliminando...' : 'Eliminar Evento'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
