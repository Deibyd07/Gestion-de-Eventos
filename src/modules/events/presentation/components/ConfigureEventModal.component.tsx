import { Settings, X, Eye, EyeOff, Pause, Play, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Modal } from '@shared/ui';
import { useState } from 'react';

interface ConfigureEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newStatus: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado') => Promise<void>;
  event: {
    id: string;
    titulo: string;
    estado: string;
    fecha_evento: string;
  } | null;
  isLoading?: boolean;
}

export function ConfigureEventModal({
  isOpen,
  onClose,
  onSave,
  event,
  isLoading = false
}: ConfigureEventModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  if (!event) return null;

  const statusOptions = [
    {
      value: 'borrador',
      label: 'Borrador',
      icon: FileText,
      color: 'gray',
      description: 'El evento no es visible para el público',
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-300'
    },
    {
      value: 'publicado',
      label: 'Publicado',
      icon: Eye,
      color: 'green',
      description: 'El evento es visible y se pueden vender entradas',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-300'
    },
    {
      value: 'pausado',
      label: 'Pausado',
      icon: Pause,
      color: 'yellow',
      description: 'El evento es visible pero las ventas están detenidas',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-300'
    },
    {
      value: 'cancelado',
      label: 'Cancelado',
      icon: XCircle,
      color: 'red',
      description: 'El evento fue cancelado, se pueden procesar reembolsos',
      bgColor: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-300'
    },
    {
      value: 'finalizado',
      label: 'Finalizado',
      icon: CheckCircle,
      color: 'blue',
      description: 'El evento ya ocurrió y finalizó',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300'
    }
  ];

  const currentStatus = statusOptions.find(s => s.value === event.estado);

  const handleSubmit = async () => {
    if (!selectedStatus || selectedStatus === event.estado) return;

    setIsSaving(true);
    try {
      await onSave(selectedStatus as any);
      onClose();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving && !isLoading) {
      setSelectedStatus('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Settings className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Configurar Evento</h2>
          <p className="text-sm text-gray-500 mt-1">Cambiar el estado de visibilidad y ventas</p>
        </div>
        <button
          onClick={handleClose}
          disabled={isSaving || isLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Información del evento */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
        <h3 className="font-bold text-gray-900 mb-1">{event.titulo}</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Fecha: {new Date(event.fecha_evento).toLocaleDateString('es-CO')}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Estado actual:</span>
            {currentStatus && (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStatus.bgColor} ${currentStatus.textColor} ${currentStatus.borderColor}`}>
                {currentStatus.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Opciones de estado */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Selecciona el nuevo estado:
        </label>
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStatus === option.value;
          const isCurrent = event.estado === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setSelectedStatus(option.value)}
              disabled={isCurrent || isSaving || isLoading}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? `${option.borderColor} ${option.bgColor} shadow-md`
                  : isCurrent
                  ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } disabled:cursor-not-allowed`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isSelected || isCurrent ? option.bgColor : 'bg-gray-100'
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isSelected || isCurrent ? option.textColor : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold ${
                      isSelected || isCurrent ? option.textColor : 'text-gray-900'
                    }`}>
                      {option.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-xs text-gray-500 italic">Estado actual</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Advertencias según el estado seleccionado */}
      {selectedStatus === 'cancelado' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-900 font-semibold mb-2">⚠️ Advertencia</p>
          <p className="text-sm text-red-700">
            Al cancelar el evento, deberás procesar manualmente los reembolsos para los asistentes que ya compraron entradas.
          </p>
        </div>
      )}

      {selectedStatus === 'pausado' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-900 font-semibold mb-2">ℹ️ Información</p>
          <p className="text-sm text-yellow-700">
            El evento seguirá siendo visible pero las ventas se detendrán temporalmente. Puedes reactivarlas cambiando el estado a "Publicado".
          </p>
        </div>
      )}

      {selectedStatus === 'borrador' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Información</p>
          <p className="text-sm text-blue-700">
            El evento dejará de ser visible para el público. Las ventas existentes se mantendrán pero no se podrán realizar nuevas compras.
          </p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          onClick={handleClose}
          disabled={isSaving || isLoading}
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedStatus || selectedStatus === event.estado || isSaving || isLoading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {(isSaving || isLoading) ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Settings className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </div>
    </Modal>
  );
}
