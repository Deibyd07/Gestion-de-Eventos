import { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Calendar, Users, Clock, Star, TrendingUp, Eye, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { useCartStore } from '../../../payments/infrastructure/store/Cart.store';
import { EventCard } from '../components/EventCard.component';
import { EventFilters } from '../components/EventFilters.component';

export function EventsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const {
    filteredEvents,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    categories,
    loading,
    loadEvents,
    filterEvents,
    setPriceRange,
    setDateRange,
    clearFilters
  } = useEventStore();
  const { items } = useCartStore();

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    filterEvents();
  }, [filterEvents]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Funciones para filtros rápidos
  const handleTodayFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange([today, today]);
  };

  const handleNearMeFilter = () => {
    // Por ahora, mostrar todos los eventos
    // TODO: Implementar geolocalización
    clearFilters();
  };

  const handleFreeFilter = () => {
    setPriceRange([0, 0]);
  };

  const handleFeaturedFilter = () => {
    // Por ahora, mostrar todos los eventos
    // TODO: Implementar lógica de eventos destacados
    clearFilters();
  };

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'popularity':
        return b.currentAttendees - a.currentAttendees;
      case 'rating':
        return (b as any).rating - (a as any).rating;
      default:
        return 0;
    }
  });

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="w-full">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-4">
                Descubre eventos increíbles
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl">
                Encuentra tu próxima experiencia entre miles de eventos únicos.
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTodayFilter}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm text-xs sm:text-sm"
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Hoy</span>
              </button>
              <button
                onClick={handleNearMeFilter}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-sm text-sm"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium">Cerca</span>
              </button>
              <button
                onClick={handleFreeFilter}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg sm:rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-xs sm:text-sm"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Gratis</span>
              </button>
              <button
                onClick={handleFeaturedFilter}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 shadow-sm text-sm"
              >
                <Star className="w-4 h-4" />
                <span className="font-medium">Destacados</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg sm:rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm text-xs sm:text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="font-medium">Filtros</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <EventFilters />
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {selectedCategory === 'Todos' ? 'Todos los eventos' : selectedCategory}
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              {sortedEvents.length} eventos
              {searchQuery && (
                <span className="ml-1">
                  para "{searchQuery}"
                </span>
              )}
              {cartItemsCount > 0 && (
                <span className="ml-2 text-blue-600 font-medium">
                  · {cartItemsCount} en tu carrito
                </span>
              )}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle - Hidden on mobile */}
            <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                  <div className="bg-current rounded-sm"></div>
                </div>
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-md transition-colors ${viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <div className="w-4 h-4 flex flex-col gap-0.5">
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                  <div className="bg-current rounded-sm h-1"></div>
                </div>
              </button>
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ordenar por:</span>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Fecha (próximos)</option>
                <option value="price-low">Precio (menor a mayor)</option>
                <option value="price-high">Precio (mayor a menor)</option>
                <option value="popularity">Popularidad</option>
                <option value="rating">Mejor valorados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedEvents.length > 0 ? (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            : "space-y-3 sm:space-y-4"
          }>
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron eventos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? `No encontramos eventos que coincidan con "${searchQuery}". Intenta con otros términos.`
                : 'No hay eventos disponibles con los filtros seleccionados.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setShowFilters(false);
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Ver todos los eventos
              </button>
              <Link
                to="/dashboard"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Crear un evento
              </Link>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredEvents.length > 0 && (
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
              Cargar más eventos
            </button>
          </div>
        )}
      </div>
    </div>
  );
}