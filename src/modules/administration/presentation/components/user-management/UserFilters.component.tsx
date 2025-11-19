import React from 'react';
import { Search, Filter, Download, Upload } from 'lucide-react';

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Limpiar búsqueda"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Role Filter */}
      <select
        value={filterRole}
        onChange={(e) => setFilterRole(e.target.value)}
        className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
      >
        <option value="all">Todos los roles</option>
        <option value="admin">Administrador</option>
        <option value="organizador">Organizador</option>
        <option value="asistente">Asistente</option>
      </select>

      {/* Status Filter */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
      >
        <option value="all">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
        <option value="suspendido">Suspendido</option>
        <option value="pendiente">Pendiente</option>
      </select>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
      >
        <option value="fecha_registro">Ordenar por fecha</option>
        <option value="nombre_completo">Ordenar por nombre</option>
        <option value="ultima_actividad">Ordenar por actividad</option>
        <option value="rating">Ordenar por rating</option>
      </select>
    </div>
  );
};
