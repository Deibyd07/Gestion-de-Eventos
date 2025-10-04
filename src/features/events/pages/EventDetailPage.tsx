import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Share2, Heart, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useEventStore } from '../../../core/stores/eventStore';
import { useCartStore } from '../../../core/stores/cartStore';
import { formatPriceDisplay } from '../../../shared/utils/currency';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getEventById } = useEventStore();
  const { addItem } = useCartStore();
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [isLiked, setIsLiked] = useState(false);

  const event = id ? getEventById(id) : null;

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Evento no encontrado</h1>
        <Link 
          to="/events" 
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Volver a eventos
        </Link>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const updateTicketQuantity = (ticketTypeId: string, change: number) => {
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);
    
    if (newQuantity === 0) {
      const { [ticketTypeId]: removed, ...rest } = selectedTickets;
      setSelectedTickets(rest);
    } else {
      setSelectedTickets(prev => ({
        ...prev,
        [ticketTypeId]: newQuantity
      }));
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketTypeId, quantity]) => {
      const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
      return total + (ticketType ? ticketType.price * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handleAddToCart = () => {
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      const ticketType = event.ticketTypes.find(t => t.id === ticketTypeId);
      if (ticketType && quantity > 0) {
        addItem({
          eventId: event.id,
          ticketTypeId: ticketType.id,
          price: ticketType.price,
          eventTitle: event.title,
          ticketTypeName: ticketType.name,
          quantity
        });
      }
    });
    setSelectedTickets({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/events" className="hover:text-blue-600 transition-colors duration-200">
            Eventos
          </Link>
          <span>→</span>
          <span className="text-gray-900">{event.title}</span>
        </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Event Image */}
          <div className="relative h-80 md:h-96 rounded-2xl overflow-hidden">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">
                  {formatDate(event.date).split(',')[0].split(' ')[1]}
                </div>
                <div className="text-sm text-gray-600">
                  {formatDate(event.date).split(' ')[2]}
                </div>
              </div>
            </div>
            <div className="absolute top-6 right-6 flex space-x-2">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className={`p-3 rounded-full backdrop-blur-sm transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/95 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-white/95 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-all duration-200">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {event.category}
                </span>
                <span className="text-gray-500 text-sm">
                  Organizado por {event.organizerName}
                </span>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {event.title}
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{formatDate(event.date)}</div>
                    <div className="text-sm text-gray-500">Fecha del evento</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">{event.time}</div>
                    <div className="text-sm text-gray-500">Hora de inicio</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-700">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium">{event.location}</div>
                    <div className="text-sm text-gray-500">Ubicación</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed">
                <p>{event.description}</p>
                <p className="mt-4">
                  Este evento promete ser una experiencia única donde podrás conectar con personas 
                  afines, aprender de expertos en la materia y disfrutar de un ambiente excepcional. 
                  No te pierdas esta oportunidad de formar parte de algo especial.
                </p>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Etiquetas</h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Ticket Purchase */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Entradas</h3>
              <div className="flex items-center text-gray-600 text-sm">
                <Users className="w-4 h-4 mr-2" />
                <span>
                  {event.currentAttendees} de {event.maxAttendees} plazas ocupadas
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {event.ticketTypes.map((ticketType) => (
                <div key={ticketType.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{ticketType.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{ticketType.description}</p>
                      {ticketType.available <= 5 && ticketType.available > 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                          ¡Solo quedan {ticketType.available} disponibles!
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPriceDisplay(ticketType.price)}
                      </span>
                    </div>
                  </div>

                  {ticketType.available > 0 ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {ticketType.available} disponibles
                      </span>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => updateTicketQuantity(ticketType.id, -1)}
                          disabled={!selectedTickets[ticketType.id]}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium">
                          {selectedTickets[ticketType.id] || 0}
                        </span>
                        <button
                          onClick={() => updateTicketQuantity(ticketType.id, 1)}
                          disabled={
                            (selectedTickets[ticketType.id] || 0) >= ticketType.available ||
                            (selectedTickets[ticketType.id] || 0) >= ticketType.maxQuantity
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <span className="text-red-600 text-sm font-medium">Agotado</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {getTotalTickets() > 0 && (
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total ({getTotalTickets()} entradas)</span>
                  <span>{formatPriceDisplay(getTotalPrice())}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={getTotalTickets() === 0}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {getTotalTickets() > 0 ? 'Añadir al carrito' : 'Selecciona entradas'}
            </button>

            <div className="mt-4 text-center">
              <Link 
                to="/checkout"
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                Ver carrito
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
      </div>
    );
  }