import React, { useState } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign,
  Star,
  AlertTriangle,
  MoreVertical,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  status: 'active' | 'pending' | 'cancelled' | 'completed';
  organizer: string;
  category: string;
  image: string;
  createdAt: string;
}

export const EventManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Datos de ejemplo
  const events: Event[] = [
    {
      id: '1',
      title: 'Feria Agropecuaria Nacional 2024',
      description: 'La feria más importante de Colombia con exhibición de ganado, productos agrícolas y artesanías.',
      date: '2024-12-15',
      location: 'Bogotá, Colombia',
      price: 0,
      maxAttendees: 5000,
      currentAttendees: 3247,
      status: 'active',
      organizer: 'Juan Pérez',
      category: 'Agropecuario',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
      createdAt: '2024-11-01'
    },
    {
      id: '2',
      title: 'Workshop de React Avanzado',
      description: 'Aprende las mejores prácticas de React con proyectos reales.',
      date: '2024-12-20',
      location: 'Medellín, Colombia',
      price: 150000,
      maxAttendees: 50,
      currentAttendees: 32,
      status: 'active',
      organizer: 'Ana López',
      category: 'Tecnología',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      createdAt: '2024-11-05'
    },
    {
      id: '3',
      title: 'Festival de Música Vallenata',
      description: 'Disfruta de la mejor música vallenata con artistas reconocidos.',
      date: '2024-12-25',
      location: 'Cali, Colombia',
      price: 50000,
      maxAttendees: 2000,
      currentAttendees: 0,
      status: 'pending',
      organizer: 'Carlos Ruiz',
      category: 'Cultura',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      createdAt: '2024-11-10'
    },
    {
      id: '4',
      title: 'Conferencia de Emprendimiento',
      description: 'Conoce las claves del éxito empresarial con expertos.',
      date: '2024-11-30',
      location: 'Barranquilla, Colombia',
      price: 75000,
      maxAttendees: 200,
      currentAttendees: 156,
      status: 'completed',
      organizer: 'María García',
      category: 'Negocios',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
      createdAt: '2024-10-15'
    }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Gratis';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="flex flex-row-reverse sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          <button className="flex-1 min-w-0 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex-1 min-w-0 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm">
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </button>
          <button className="flex-1 min-w-0 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
            <Plus className="w-4 h-4" />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-blue-700 truncate">Total Eventos</p>
              <p className="text-lg md:text-2xl font-bold text-blue-900">{events.length}</p>
              <p className="text-xs text-blue-600 font-medium flex items-center mt-1">
                <span className="truncate">Registrados</span>
              </p>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-green-700 truncate">Eventos Activos</p>
              <p className="text-lg md:text-2xl font-bold text-green-900">{events.filter(e => e.status === 'active').length}</p>
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <span className="truncate">En curso</span>
              </p>
            </div>
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm flex-shrink-0">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-amber-700 truncate">Pendientes</p>
              <p className="text-lg md:text-2xl font-bold text-amber-900">{events.filter(e => e.status === 'pending').length}</p>
              <p className="text-xs text-yellow-600 font-medium flex items-center mt-1">
                <span className="truncate">Por aprobar</span>
              </p>
            </div>
            <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm flex-shrink-0">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-purple-700 truncate">Total Asistentes</p>
              <p className="text-lg md:text-2xl font-bold text-purple-900">{events.reduce((sum, e) => sum + e.currentAttendees, 0)}</p>
              <p className="text-xs text-purple-600 font-medium flex items-center mt-1">
                <span className="truncate">Registrados</span>
              </p>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Cancelados</option>
            <option value="completed">Completados</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
          >
            <option value="all">Todas las categorías</option>
            <option value="Agropecuario">Agropecuario</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Cultura">Cultura</option>
            <option value="Negocios">Negocios</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm text-sm"
          >
            <option value="date">Ordenar por fecha</option>
            <option value="title">Ordenar por título</option>
            <option value="attendees">Ordenar por asistentes</option>
            <option value="price">Ordenar por precio</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm text-gray-600">Vista:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Vista de cuadrícula"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`hidden sm:flex p-2 rounded-xl transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Vista de lista"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs md:text-sm text-gray-600">
            {filteredEvents.length} eventos encontrados
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-200">
              {/* Event Image */}
              <div className="relative h-40 md:h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 md:top-4 left-3 md:left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
                <div className="absolute top-3 md:top-4 right-3 md:right-4">
                  <button className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                </div>
                
                <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span className="truncate">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <Users className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span className="truncate">{event.currentAttendees} / {event.maxAttendees} asistentes</span>
                  </div>
                  <div className="flex items-center text-xs md:text-sm text-gray-600">
                    <DollarSign className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                    <span className="truncate">{formatCurrency(event.price)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-1 md:space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Ver">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Editar">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 truncate">
                    Por {event.organizer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Asistentes</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Precio</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Estado</th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover mr-3 md:mr-4"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{event.title}</div>
                          <div className="text-xs md:text-sm text-gray-500 truncate">{event.organizer}</div>
                          {/* Mobile: Show additional info inline */}
                          <div className="sm:hidden flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {getStatusText(event.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">{formatDate(event.date)}</td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                      {event.currentAttendees} / {event.maxAttendees}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">{formatCurrency(event.price)}</td>
                    <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex space-x-1 md:space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Ver">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};