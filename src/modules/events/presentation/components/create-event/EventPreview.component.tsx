import React from 'react';
import { Calendar, MapPin, Clock, Users, DollarSign } from 'lucide-react';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';

interface EventPreviewProps {
  eventData: {
    title: string;
    description: string;
    image: string;
    date: string;
    time: string;
    location: string;
    category: string;
    maxAttendees: number;
    ticketTypes: Array<{
      name: string;
      price: number;
      description: string;
      maxQuantity: number;
    }>;
    tags: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const EventPreview: React.FC<EventPreviewProps> = ({
  eventData,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Vista Previa del Evento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Event Image */}
          {eventData.image && (
            <div className="mb-6">
              <img
                src={eventData.image}
                alt={eventData.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Event Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {eventData.title || 'Título del Evento'}
          </h1>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-gray-600">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{formatDate(eventData.date) || 'Fecha del evento'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-5 h-5 mr-2" />
              <span>{formatTime(eventData.time) || 'Hora del evento'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{eventData.location || 'Ubicación del evento'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2" />
              <span>Aforo: {eventData.maxAttendees || 0} personas</span>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {eventData.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {eventData.category}
              </span>
            )}
            {eventData.tags && eventData.tags.split(',').map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {tag.trim()}
              </span>
            ))}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
            <p className="text-gray-600">
              {eventData.description || 'Descripción del evento...'}
            </p>
          </div>

          {/* Ticket Types */}
          {eventData.ticketTypes && eventData.ticketTypes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Entrada</h3>
              <div className="space-y-3">
                {eventData.ticketTypes.map((ticket, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{ticket.name || `Tipo ${index + 1}`}</h4>
                      {ticket.description && (
                        <p className="text-sm text-gray-600">{ticket.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPriceDisplay(ticket.price)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ticket.maxQuantity} disponibles
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Resumen</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Aforo máximo:</span>
                <span className="ml-2 font-medium">{eventData.maxAttendees || 0} personas</span>
              </div>
              <div>
                <span className="text-blue-700">Tipos de entrada:</span>
                <span className="ml-2 font-medium">{eventData.ticketTypes?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
