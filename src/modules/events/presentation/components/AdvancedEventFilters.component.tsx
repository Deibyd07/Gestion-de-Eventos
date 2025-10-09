import React, { useState } from 'react';
import { Search, MapPin, Calendar, DollarSign, Users, Filter, X } from 'lucide-react';

interface FilterOptions {
  search: string;
  category: string;
  location: string;
  dateFrom: string;
  dateTo: string;
  priceMin: number;
  priceMax: number;
  attendeesMin: number;
  attendeesMax: number;
  sortBy: 'date' | 'price' | 'popularity' | 'name';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedEventFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

const categories = [
  'Tecnología', 'Música', 'Educación', 'Deportes', 'Arte',
  'Gastronomía', 'Negocios', 'Salud', 'Entretenimiento', 'Otros'
];

const sortOptions = [
  { value: 'date', label: 'Fecha del evento' },
  { value: 'price', label: 'Precio' },
  { value: 'popularity', label: 'Popularidad' },
  { value: 'name', label: 'Nombre del evento' }
];

export const AdvancedEventFilters: React.FC<AdvancedEventFiltersProps> = ({
  onFiltersChange,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 0,
    priceMax: 0,
    attendeesMin: 0,
    attendeesMax: 0,
    sortBy: 'date',
    sortOrder: 'asc',
    ...initialFilters
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterOptions = {
      search: '',
      category: '',
      location: '',
      dateFrom: '',
      dateTo: '',
      priceMin: 0,
      priceMax: 0,
      attendeesMin: 0,
      attendeesMax: 0,
      sortBy: 'date',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== 0 && value !== 'date' && value !== 'asc'
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Basic Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Ciudad, país..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <div className="flex space-x-2">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={filters.sortOrder}
              onChange={(e) => updateFilter('sortOrder', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="asc">Ascendente</option>
              <option value="desc">Descendente</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros Avanzados</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-700 text-sm"
          >
            <X className="w-4 h-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t border-gray-200 pt-6 space-y-6">
          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Rango de Fechas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Desde</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Hasta</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Rango de Precios</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Precio mínimo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.priceMin || ''}
                    onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Precio máximo</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.priceMax || ''}
                    onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 0)}
                    placeholder="Sin límite"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Attendees Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Número de Asistentes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mínimo</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.attendeesMin || ''}
                    onChange={(e) => updateFilter('attendeesMin', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Máximo</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={filters.attendeesMax || ''}
                    onChange={(e) => updateFilter('attendeesMax', parseInt(e.target.value) || 0)}
                    placeholder="Sin límite"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros Activos</h4>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Búsqueda: {filters.search}
              </span>
            )}
            {filters.category && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Categoría: {filters.category}
              </span>
            )}
            {filters.location && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Ubicación: {filters.location}
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Desde: {new Date(filters.datefrom.*Date.utilsString('es-ES')}
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Hasta: {new Date(filters.dateTo).toLocaleDateString('es-ES')}
              </span>
            )}
            {filters.priceMin > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Precio min: ${filters.priceMin.toLocaleString()}
              </span>
            )}
            {filters.priceMax > 0 && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Precio max: ${filters.priceMax.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
