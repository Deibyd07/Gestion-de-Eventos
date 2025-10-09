import React, { useState } from 'react';
import { Copy, X, Calendar, MapPin, Clock, Users, DollarSign } from 'lucide-react';

interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  tipos_entrada: Array<{
    nombre_tipo: string;
    precio: number;
    descripcion: string;
    cantidad_maxima: number;
  }>;
}

interface DuplicateEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onDuplicate: (duplicatedEvent: Partial<Event>) => void;
}

export const DuplicateEventModal: React.FC<DuplicateEventModalProps> = ({
  event,
  isOpen,
  onClose,
  onDuplicate
}) => {
  const [newTitle, setNewTitle] = useState(`${event.titulo} (Copia)`);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState(event.hora_evento);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    
    try {
      // Create duplicated event data
      const duplicatedEvent = {
        titulo: newTitle,
        descripcion: event.descripcion,
        url_imagen: event.url_imagen,
        fecha_evento: newDate,
        hora_evento: newTime,
        ubicacion: event.ubicacion,
        categoria: event.categoria,
        maximo_asistentes: event.maximo_asistentes,
        tipos_entrada: event.tipos_entrada.map(tipo => ({
          ...tipo,
          cantidad_disponible: tipo.cantidad_maxima
        }))
      };

      await onDuplicate(duplicatedEvent);
      onClose();
    } catch (error) {
      console.error('Error duplicating event:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Copy className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Duplicar Evento</h3>
              <p className="text-sm text-gray-500">Crea una copia de este evento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Original Event Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Evento Original</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{event.titulo}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{event.ubicacion}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">
                  {new Date(event.fecha_evento).toLocaleDateString('es-ES')} a las {event.hora_evento}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{event.maximo_asistentes} asistentes</span>
              </div>
            </div>
          </div>

          {/* New Event Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Título *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Título del nuevo evento"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Fecha *
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Hora *
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Ticket Types Preview */}
          {event.tipos_entrada && event.tipos_entrada.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Tipos de Entrada (se copiarán)</h4>
              <div className="space-y-2">
                {event.tipos_entrada.map((tipo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">{tipo.nombre_tipo}</span>
                      <p className="text-sm text-gray-600">{tipo.descripcion}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{tipo.precio.toLocaleString('es-CO')} COP</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{tipo.cantidad_maxima} disponibles</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleDuplicate}
            disabled={!newTitle || !newDate || isDuplicating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isDuplicating ? 'Duplicando...' : 'Duplicar Evento'}
          </button>
        </div>
      </div>
    </div>
  );
};
