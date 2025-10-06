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
    <div className="p-4 space-y-2 admin-panel panel-consistent-width">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm">
          <Upload className="w-4 h-4" />
          <span>Importar</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Eventos</p>
              <p className="text-2xl font-bold text-blue-900">{events.length}</p>
              <p className="text-sm text-blue-600 font-medium">Registrados</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Eventos Activos</p>
              <p className="text-2xl font-bold text-green-900">{events.filter(e => e.status === 'active').length}</p>
              <p className="text-sm text-green-600 font-medium">En curso</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-sm">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">Pendientes</p>
              <p className="text-2xl font-bold text-amber-900">{events.filter(e => e.status === 'pending').length}</p>
              <p className="text-sm text-yellow-600 font-medium">Por aprobar</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Total Asistentes</p>
              <p className="text-2xl font-bold text-purple-900">{events.reduce((sum, e) => sum + e.currentAttendees, 0)}</p>
              <p className="text-sm text-purple-600 font-medium">Registrados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
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
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
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
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
          >
            <option value="date">Ordenar por fecha</option>
            <option value="title">Ordenar por título</option>
            <option value="attendees">Ordenar por asistentes</option>
            <option value="price">Ordenar por precio</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vista:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600">
            {filteredEvents.length} eventos encontrados
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 grid-consistent">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-200 card-consistent">
              {/* Event Image */}
              <div className="relative h-48">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusText(event.status)}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{event.title}</h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {event.currentAttendees} / {event.maxAttendees} asistentes
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    {formatCurrency(event.price)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Por {event.organizer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden">
          <div className="admin-table">
            <table className="w-full">
              <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistentes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500">{event.organizer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatDate(event.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {event.currentAttendees} / {event.maxAttendees}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(event.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
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