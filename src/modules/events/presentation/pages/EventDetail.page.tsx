import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Plus, Minus, ArrowLeft } from 'lucide-react';
import { supabase } from '@shared/lib/api/supabase';
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { useCartStore } from '../../../payments/infrastructure/store/Cart.store';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';
import { parseDateString } from '@shared/lib/utils/Date.utils';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getEventById } = useEventStore();
  const { addItem } = useCartStore();
  const event = id ? getEventById(id) : null;
  const [selectedTickets, setSelectedTickets] = useState<{ [key: string]: number }>({});
  const [ticketTypesData, setTicketTypesData] = useState(event?.ticketTypes || []);
  const [totalCapacity, setTotalCapacity] = useState<number>(event?.maxAttendees || 0);
  const [currentAttendees, setCurrentAttendees] = useState<number>(event?.currentAttendees || 0);
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(true);
  const safeCapacity = totalCapacity || event?.maxAttendees || 0;
  const safeCurrent = currentAttendees || 0;
  const availableSeats = Math.max(0, safeCapacity - safeCurrent);

  // Scroll al inicio cuando se carga la página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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
    const date = parseDateString(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const updateTicketQuantity = (ticketTypeId: string, change: number) => {
    const ticketType = (ticketTypesData as any[]).find(t => t.id === ticketTypeId);
    const maxAvailable = ticketType ? Math.min(ticketType.cantidad_disponible ?? Infinity, ticketType.cantidad_maxima ?? Infinity) : Infinity;
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const newQuantity = Math.max(0, Math.min(currentQuantity + change, maxAvailable));

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
      const ticketType = (ticketTypesData as any[]).find(t => t.id === ticketTypeId);
      return total + (ticketType ? ticketType.precio * quantity : 0);
    }, 0);
  };

  const getTotalTickets = () => {
    return Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  };

  useEffect(() => {
    if (!event) return;

    const fetchAvailability = async () => {
      try {
        // Empezar con los valores que llegan al card para mantener consistencia inicial
        let maxCapacity = event.maxAttendees;
        let current = event.currentAttendees;

        const { data: ticketTypes, error: ticketError } = await supabase
          .from('tipos_entrada')
          .select('id, nombre_tipo, descripcion, precio, cantidad_disponible, cantidad_maxima')
          .eq('id_evento', event.id);

        if (!ticketError && ticketTypes) {
          setTicketTypesData(ticketTypes as any);
          const capacitySum = ticketTypes.reduce((sum: number, t: any) => sum + (t.cantidad_maxima || 0), 0);
          const availableSum = ticketTypes.reduce((sum: number, t: any) => sum + (t.cantidad_disponible || 0), 0);
          if (capacitySum > 0) {
            maxCapacity = capacitySum;
          }
          // Derivar asistentes a partir de capacidad - disponibles
          current = Math.max(0, maxCapacity - availableSum);
        }

        const { data: eventoData, error: eventoError } = await supabase
          .from('eventos')
          .select('asistentes_actuales, maximo_asistentes')
          .eq('id', event.id)
          .single();

        if (!eventoError && eventoData) {
          if (eventoData.maximo_asistentes) {
            maxCapacity = eventoData.maximo_asistentes;
          }
          if (eventoData.asistentes_actuales !== undefined && eventoData.asistentes_actuales !== null) {
            current = eventoData.asistentes_actuales;
          }
        }

        setTotalCapacity(maxCapacity);
        setCurrentAttendees(current);
      } catch (err) {
        console.error('Error obteniendo disponibilidad en detalle:', err);
        setTotalCapacity(event.maxAttendees);
        setCurrentAttendees(event.currentAttendees);
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();

    const channelId = `${Date.now()}-${Math.random()}`;
    const comprasChannel = supabase
      .channel(`compras-${event.id}-detail-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'compras', filter: `id_evento=eq.${event.id}` },
        () => fetchAvailability()
      )
      .subscribe();

    const ticketsChannel = supabase
      .channel(`tipos_entrada-${event.id}-detail-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tipos_entrada', filter: `id_evento=eq.${event.id}` },
        () => fetchAvailability()
      )
      .subscribe();

    return () => {
      comprasChannel.unsubscribe();
      ticketsChannel.unsubscribe();
    };
  }, [event.id]);

  const handleAddToCart = () => {
    Object.entries(selectedTickets).forEach(([ticketTypeId, quantity]) => {
      const ticketType = (ticketTypesData as any[]).find(t => t.id === ticketTypeId);
      if (ticketType && quantity > 0) {
        addItem({
          eventId: event.id,
          ticketTypeId: ticketType.id,
          price: ticketType.precio,
          eventTitle: event.title,
          ticketTypeName: ticketType.nombre_tipo,
          quantity
        });
      }
    });
    setSelectedTickets({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb - oculto en móvil, visible en tablet+ */}
        <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 mb-4 md:mb-6">
          <Link to="/events" className="hover:text-blue-600 transition-colors duration-200">
            Eventos
          </Link>
          <span>→</span>
          <span className="text-gray-900 truncate max-w-[200px] md:max-w-none">{event.title}</span>
        </nav>

        {/* Botón volver en móvil */}
        <div className="sm:hidden mb-4">
          <Link
            to="/events"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span className="text-sm">Volver a eventos</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 lg:space-y-8">
            {/* Event Image */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl md:rounded-2xl overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 sm:top-6 left-3 sm:left-6 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg">
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    {(() => {
                      const date = parseDateString(event.date);
                      return date.getDate();
                    })()}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 capitalize">
                    {(() => {
                      const date = parseDateString(event.date);
                      return date.toLocaleDateString('es-ES', { month: 'short' });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4 md:space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-medium">
                    {event.category}
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm">
                    Por {event.organizerName}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6">
                  <div className="flex items-center space-x-3 text-gray-700 bg-blue-50/50 p-3 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base truncate">{formatDate(event.date)}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Fecha</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-700 bg-green-50/50 p-3 rounded-lg">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm sm:text-base">{event.time}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Hora</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-gray-700 bg-purple-50/50 p-3 rounded-lg sm:col-span-2 md:col-span-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm sm:text-base truncate">{event.location}</div>
                      <div className="text-xs sm:text-sm text-gray-500">Ubicación</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Descripción</h2>
                <div className="prose max-w-none text-gray-700 leading-relaxed text-sm sm:text-base">
                  <p>{event.description}</p>
                  <p className="mt-3 sm:mt-4">
                    Este evento promete ser una experiencia única donde podrás conectar con personas
                    afines, aprender de expertos en la materia y disfrutar de un ambiente excepcional.
                    No te pierdas esta oportunidad de formar parte de algo especial.
                  </p>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Etiquetas</h2>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
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
            <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 lg:sticky lg:top-24">
              {/* Mostrar advertencia si el evento está cancelado */}
              {event.status === 'cancelado' && (
                <div className="mb-4 sm:mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="text-lg font-bold text-red-800 mb-2">Evento Cancelado</h3>
                  <p className="text-sm text-red-700">
                    Este evento ha sido cancelado. No es posible comprar entradas en este momento.
                  </p>
                </div>
              )}

              <div className="mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Entradas</h3>
                <div className="flex items-center text-gray-600 text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {loadingAvailability
                      ? 'Calculando cupos...'
                      : `${safeCurrent} de ${safeCapacity} plazas ocupadas`}
                  </span>
                </div>
              </div>

              {event.status !== 'cancelado' && (
                <>
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    {ticketTypesData.map((ticketType: any) => (
                      <div key={ticketType.id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex justify-between items-start mb-2 sm:mb-3">
                          <div className="flex-1 min-w-0 mr-2">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{ticketType.nombre_tipo}</h4>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">{ticketType.descripcion}</p>
                            {ticketType.cantidad_disponible <= 5 && ticketType.cantidad_disponible > 0 && (
                              <p className="text-xs sm:text-sm text-orange-600 mt-1">
                                ¡Solo quedan {ticketType.cantidad_disponible}!
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-base sm:text-lg font-bold text-gray-900">
                              {formatPriceDisplay(ticketType.precio)}
                            </span>
                          </div>
                        </div>

                        {ticketType.cantidad_disponible > 0 ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-600">
                              {ticketType.cantidad_disponible} disponibles
                            </span>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <button
                                onClick={() => updateTicketQuantity(ticketType.id, -1)}
                                disabled={!selectedTickets[ticketType.id]}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                              <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                                {selectedTickets[ticketType.id] || 0}
                              </span>
                              <button
                                onClick={() => updateTicketQuantity(ticketType.id, 1)}
                                disabled={
                                  (selectedTickets[ticketType.id] || 0) >= ticketType.cantidad_disponible ||
                                  (selectedTickets[ticketType.id] || 0) >= ticketType.cantidad_maxima
                                }
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-2">
                            <span className="text-red-600 text-xs sm:text-sm font-medium">Agotado</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {getTotalTickets() > 0 && (
                    <div className="border-t border-gray-200 pt-3 sm:pt-4 mb-4 sm:mb-6">
                      <div className="flex justify-between items-center text-base sm:text-lg font-semibold">
                        <span>Total ({getTotalTickets()} entradas)</span>
                        <span>{formatPriceDisplay(getTotalPrice())}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={getTotalTickets() === 0}
                    className="w-full py-2.5 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 text-sm sm:text-base"
                  >
                    {getTotalTickets() > 0 ? 'Añadir al carrito' : 'Selecciona entradas'}
                  </button>

                  <div className="mt-3 sm:mt-4 text-center">
                    <Link
                      to="/checkout"
                      className="text-blue-600 hover:text-blue-500 text-xs sm:text-sm font-medium"
                    >
                      Ver carrito
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}