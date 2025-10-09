import { MapPin, Users, Clock, Heart, Share2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Event } from '../../../events/infrastructure/store/Event.store';
import { useCartStore } from '../../../payments/infrastructure/store/Cart.store';
import { useNotificationStore } from '../../../notifications/infrastructure/store/Notification.store';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';

interface EventCardProps {
  event: Event;
  viewMode?: 'grid' | 'list';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export function EventCard({ event, viewMode = 'grid', isFavorite = false, onToggleFavorite }: EventCardProps) {
  const { addItem } = useCartStore();
  const { addNotification } = useNotificationStore();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Próximamente';
      case 'ongoing':
        return 'En curso';
      case 'completed':
        return 'Finalizado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const availableSpots = event.maxAttendees - event.currentAttendees;
  const isAlmostFull = availableSpots <= event.maxAttendees * 0.1; // Less than 10% available

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const handleAddToCart = () => {
    // Si el evento tiene tipos de tickets, usar el primero disponible
    if (event.ticketTypes && event.ticketTypes.length > 0) {
      const availableTicket = event.ticketTypes.find(ticket => ticket.available > 0);
      if (availableTicket) {
        addItem({
          eventId: event.id,
          ticketTypeId: availableTicket.id,
          price: availableTicket.price,
          eventTitle: event.title,
          ticketTypeName: availableTicket.name,
          quantity: 1
        });
        addNotification({
          type: 'success',
          title: '¡Agregado al carrito!',
          message: `${availableTicket.name} de ${event.title} se agregó correctamente`,
          duration: 4000
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Sin disponibilidad',
          message: 'No hay entradas disponibles para este evento',
          duration: 4000
        });
      }
    } else {
      // Si no hay tipos de tickets, usar el precio general del evento
      addItem({
        eventId: event.id,
        ticketTypeId: 'general',
        price: event.price,
        eventTitle: event.title,
        ticketTypeName: 'Entrada General',
        quantity: 1
      });
      addNotification({
        type: 'success',
        title: '¡Agregado al carrito!',
        message: `Entrada para ${event.title} se agregó correctamente`,
        duration: 4000
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
        <div className="flex">
          <div className="relative w-48 h-32 flex-shrink-0">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg">
              <div className="text-center">
                <div className="text-sm font-bold text-gray-900">
                  {formatDate(event.date).split(' ')[0]}
                </div>
                <div className="text-xs text-gray-600 uppercase">
                  {formatDate(event.date).split(' ')[1]}
                </div>
              </div>
            </div>
            <div className="absolute top-2 right-2 flex space-x-1">
              <button
                onClick={onToggleFavorite}
                className={`p-1.5 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  isFavorite 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/95 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 bg-white/95 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-all duration-200"
              >
                <Share2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200">
                  {event.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {event.description}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-gray-900">
                  {formatPriceDisplay(event.price)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1 text-gray-400" />
                <span>{formatTime(event.time)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-gray-400" />
                <span>
                  {event.currentAttendees} / {event.maxAttendees}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                  {getStatusText(event.status)}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {event.category}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddToCart}
                  className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center space-x-2 border border-green-400"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
                <Link
                  to={`/events/${event.id}`}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 border border-blue-400"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 overflow-hidden group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Date Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {formatDate(event.date).split(' ')[0]}
            </div>
            <div className="text-xs text-gray-600 uppercase">
              {formatDate(event.date).split(' ')[1]}
            </div>
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
          {event.category}
        </div>

        {/* Status Badge */}
        <div className={`absolute bottom-4 left-4 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
          {getStatusText(event.status)}
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-full backdrop-blur-sm transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/95 text-gray-700 hover:bg-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white/95 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-all duration-200"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formatTime(event.time)}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>
              {event.currentAttendees} / {event.maxAttendees} asistentes
              {isAlmostFull && (
                <span className="ml-1 text-orange-600 font-medium">
                  · ¡Últimas plazas!
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{event.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold text-gray-900">
                {formatPriceDisplay(event.price)}
              </span>
              {event.price > 0 && (
                <span className="text-gray-500 text-xs font-medium">por persona</span>
              )}
            </div>
            {event.price === 0 && (
              <div className="flex items-center mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                  Gratis
                </span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 ml-3">
            <button
              onClick={handleAddToCart}
              className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 flex items-center space-x-1 border border-green-400 text-xs"
            >
              <ShoppingCart className="w-3 h-3" />
              <span>Agregar</span>
            </button>
            <Link
              to={`/events/${event.id}`}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105 border border-blue-400 text-xs"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

