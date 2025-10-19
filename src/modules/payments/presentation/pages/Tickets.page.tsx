import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Calendar, Search, Filter, Download, QrCode, MapPin, Clock, Users, Eye, Ticket, Star, Share2 } from 'lucide-react';
import { usePurchaseStore } from '../../../payments/infrastructure/store/Purchase.store';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { TicketQR } from '../../../events/presentation/components/TicketQR.component';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';

export function TicketsPage() {
  const location = useLocation();
  const { user } = useAuthStore();
  const { getEventById } = useEventStore();
  const { getUserPurchases } = usePurchaseStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Get user's purchases
  const allPurchases = user ? getUserPurchases(user.id) : [];
  
  // Filter purchases based on search and status
  const filteredPurchases = allPurchases.filter(purchase => {
    const matchesSearch = purchase.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         purchase.ticketTypeName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Group purchases by event
  const purchasesByEvent = filteredPurchases.reduce((acc, purchase) => {
    if (!acc[purchase.eventId]) {
      acc[purchase.eventId] = [];
    }
    acc[purchase.eventId].push(purchase);
    return acc;
  }, {} as Record<string, typeof allPurchases>);

  const getEventDetails = (eventId: string) => {
    return getEventById(eventId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Mis Entradas
                </h1>
                <p className="text-gray-600">
                  Gestiona y descarga tus entradas para los eventos
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {Object.keys(purchasesByEvent).length}
                </div>
                <div className="text-sm text-gray-500">Eventos</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {allPurchases.reduce((sum, p) => sum + p.quantity, 0)}
                </div>
                <div className="text-sm text-gray-500">Entradas</div>
              </div>
            </div>
          </div>
        </div>

      {/* Success Message */}
      {location.state?.message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs">✓</span>
            </div>
            <p className="text-green-800">{location.state.message}</p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por evento o tipo de entrada..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completadas</option>
              <option value="pending">Pendientes</option>
              <option value="cancelled">Canceladas</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Descargar Todo</span>
            </button>
            <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2">
              <Share2 className="w-4 h-4" />
              <span>Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tickets */}
      {Object.keys(purchasesByEvent).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(purchasesByEvent).map(([eventId, purchases]) => {
            const eventDetails = getEventDetails(eventId);
            return (
              <div key={eventId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Event Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3">{purchases[0].eventTitle}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-100">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{eventDetails?.date || 'Fecha no disponible'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{eventDetails?.location || 'Ubicación no disponible'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <QrCode className="w-4 h-4" />
                          <span>{purchases.length} entrada{purchases.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">
                        {formatPriceDisplay(purchases.reduce((sum, p) => sum + p.total, 0))}
                      </div>
                      <div className="text-blue-100 text-sm">Total pagado</div>
                      <div className="mt-2">
                        <Link
                          to={`/events/${eventId}`}
                          className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-sm"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Evento
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tickets Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {purchases.map((purchase) => (
                      <TicketQR
                        key={purchase.id}
                        purchase={purchase}
                        eventDetails={eventDetails ? {
                          title: eventDetails.title,
                          date: eventDetails.date,
                          time: eventDetails.time,
                          location: eventDetails.location,
                          image: eventDetails.image
                        } : undefined}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-8">
            <Ticket className="w-16 h-16 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'No se encontraron entradas' 
              : '¡Aún no tienes entradas!'
            }
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
            {searchQuery || statusFilter !== 'all'
              ? 'Intenta ajustar tus filtros de búsqueda para encontrar tus entradas.'
              : 'Explora nuestros increíbles eventos y compra tus entradas favoritas para vivir experiencias únicas.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Explorar Eventos
            </Link>
            {searchQuery || statusFilter !== 'all' && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="inline-flex items-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <Filter className="w-5 h-5 mr-2" />
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      )}

        {/* Download All Button */}
        {Object.keys(purchasesByEvent).length > 0 && (
          <div className="text-center mt-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                ¿Necesitas todas tus entradas?
              </h3>
              <p className="text-gray-600 mb-6">
                Descarga todas tus entradas en un solo archivo para tenerlas siempre disponibles.
              </p>
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                <Download className="w-5 h-5 mr-2" />
                Descargar Todas las Entradas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


