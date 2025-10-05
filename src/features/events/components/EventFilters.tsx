import { MapPin, DollarSign, Calendar, Filter, X, RefreshCw } from 'lucide-react';
import { useEventStore } from '../../../core/stores/eventStore';

export function EventFilters() {
  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocation,
    priceRange,
    setPriceRange
  } = useEventStore();

  const locations = [
    'Bogotá, Colombia',
    'Medellín, Colombia',
    'Cali, Colombia',
    'Barranquilla, Colombia',
    'Cartagena, Colombia',
    'Bucaramanga, Colombia',
    'Pereira, Colombia',
    'Santa Marta, Colombia',
    'Manizales, Colombia',
    'Armenia, Colombia'
  ];

  const clearFilters = () => {
    setSelectedCategory('Todos');
    setSelectedLocation('');
    setPriceRange([0, 500000]);
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filtros Avanzados</h3>
            <p className="text-sm text-gray-600">Encuentra eventos perfectos para ti</p>
          </div>
        </div>
        <button
          onClick={clearFilters}
          className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Limpiar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Filter */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5 h-full flex flex-col">
          <label className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-600" />
            Categorías
          </label>
          <div className="grid grid-cols-1 gap-2 flex-grow">
            {categories.map((category) => (
              <label key={category} className="flex items-center p-2.5 rounded-lg hover:bg-white/50 transition-all duration-200 cursor-pointer group">
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-blue-700 transition-colors">{category}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Filter */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 h-full flex flex-col">
          <label className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-green-600" />
            Ubicación
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm bg-white shadow-sm transition-all duration-200 font-medium"
          >
            <option value="">Todas las ubicaciones</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          <div className="mt-4 text-xs text-gray-600 bg-white/50 rounded-lg p-3">
            💡 <span className="font-medium">Tip:</span> Selecciona tu ciudad para ver eventos cercanos
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5 h-full flex flex-col">
          <label className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="w-4 h-4 mr-2 text-purple-600" />
            Rango de Precios
          </label>
          <div className="space-y-3 flex-grow">
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 mb-1.5">Mínimo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 font-bold text-sm">$</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full pl-7 pr-3 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white shadow-sm font-semibold text-gray-900 hover:border-purple-400 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-purple-700 mb-1.5">Máximo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-600 font-bold text-sm">$</span>
                  <input
                    type="number"
                    placeholder="500000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full pl-7 pr-3 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white shadow-sm font-semibold text-gray-900 hover:border-purple-400 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Filtros rápidos:</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPriceRange([0, 0])}
                  className="px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Gratis
                </button>
                <button
                  onClick={() => setPriceRange([0, 50000])}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-semibold hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  &lt; $50k
                </button>
                <button
                  onClick={() => setPriceRange([50000, 100000])}
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg text-xs font-semibold hover:bg-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  $50k - $100k
                </button>
                <button
                  onClick={() => setPriceRange([100000, 200000])}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  $100k - $200k
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-semibold text-gray-700">Filtros activos:</span>
          {selectedCategory !== 'Todos' && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              <Calendar className="w-3 h-3 mr-1" />
              {selectedCategory}
            </span>
          )}
          {selectedLocation && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3 mr-1" />
              {selectedLocation}
            </span>
          )}
          {(priceRange[0] !== 0 || priceRange[1] !== 500000) && (
            <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              <DollarSign className="w-3 h-3 mr-1" />
              ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
            </span>
          )}
          {(selectedCategory !== 'Todos' || selectedLocation || priceRange[0] !== 0 || priceRange[1] !== 500000) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-300 transition-all duration-200"
            >
              <X className="w-3 h-3 mr-1" />
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}