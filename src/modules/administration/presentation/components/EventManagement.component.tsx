import React, { useState, useEffect } from 'react';
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
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import { EventService } from '../../../../shared/lib/api/services';
import { ViewEventModal } from './events/ViewEventModal.component';
import { EditEventModal } from './events/EditEventModal.component';
import { DeleteEventModal } from './events/DeleteEventModal.component';
import { CreateEventModal, EventCreateData } from './events/CreateEventModal.component';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { supabase } from '@shared/lib/api/supabase';
import { formatFullRevenue } from '@shared/lib/utils/Currency.utils';

// Tipo de evento según la base de datos
interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  url_imagen: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  categoria: string;
  maximo_asistentes: number;
  asistentes_actuales: number;
  estado: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado';
  id_organizador: string;
  nombre_organizador: string;
  etiquetas: string[];
  fecha_creacion: string;
  fecha_actualizacion: string;
  tipos_entrada?: any[];
  analiticas_eventos?: any[];
}

interface EventManagementProps {
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const EventManagement: React.FC<EventManagementProps> = ({ onRefresh, isRefreshing = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Estados para datos reales de Supabase
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAttendees, setTotalAttendees] = useState<number>(0);

  // Estados para los modales
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Obtener usuario autenticado
  const { user } = useAuthStore();

  // Cargar eventos desde Supabase
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await EventService.obtenerTodosEventos();
      setEvents(data || []);

      // Calcular total de asistentes desde compras completadas
      await loadTotalAttendees();
    } catch (err) {
      console.error('Error al cargar eventos:', err);
      setError('Error al cargar los eventos. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const loadTotalAttendees = async () => {
    try {
      const { data, error } = await supabase
        .from('compras')
        .select('cantidad')
        .eq('estado', 'completada');

      if (error) {
        console.error('Error al obtener total de asistentes:', error);
        return;
      }

      const total = (data as Array<{ cantidad: number }>)?.reduce((sum, compra) =>
        sum + (compra.cantidad || 0), 0) || 0;

      setTotalAttendees(total);
    } catch (err) {
      console.error('Error al calcular total de asistentes:', err);
    }
  };

  // Manejadores de modales
  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setViewModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setEditModalOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setDeleteModalOpen(true);
  };

  // Función para guardar cambios en el evento
  const handleSaveEvent = async (eventId: string, updates: Partial<Event>) => {
    await EventService.actualizarEvento(eventId, updates);
    await loadEvents(); // Recargar la lista
  };

  // Función para confirmar eliminación
  const handleConfirmDelete = async (eventId: string) => {
    await EventService.eliminarEvento(eventId);
    await loadEvents(); // Recargar la lista
  };

  // Función para crear nuevo evento
  const handleCreateEvent = async (eventData: EventCreateData) => {
    // Verificar que haya un usuario autenticado
    if (!user) {
      throw new Error('Debes estar autenticado para crear eventos');
    }

    const newEventData = {
      ...eventData,
      id_organizador: user.id,
      nombre_organizador: user.name,
      asistentes_actuales: 0
    };

    await EventService.crearEvento(newEventData);
    await loadEvents(); // Recargar la lista
  };

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.nombre_organizador.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.estado === statusFilter;
    const matchesCategory = categoryFilter === 'all' || event.categoria === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Ordenar eventos según el criterio seleccionado
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.fecha_evento).getTime() - new Date(b.fecha_evento).getTime();

      case 'title':
        return a.titulo.localeCompare(b.titulo, 'es');

      case 'attendees':
        return (b.asistentes_actuales || 0) - (a.asistentes_actuales || 0);

      case 'price':
        const priceA = a.tipos_entrada && a.tipos_entrada.length > 0
          ? Math.min(...a.tipos_entrada.map((t: any) => t.precio))
          : 0;
        const priceB = b.tipos_entrada && b.tipos_entrada.length > 0
          ? Math.min(...b.tipos_entrada.map((t: any) => t.precio))
          : 0;
        return priceA - priceB;

      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'publicado': return 'text-green-600 bg-green-100';
      case 'borrador': return 'text-yellow-600 bg-yellow-100';
      case 'pausado': return 'text-orange-600 bg-orange-100';
      case 'cancelado': return 'text-red-600 bg-red-100';
      case 'finalizado': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'publicado': return 'Publicado';
      case 'borrador': return 'Borrador';
      case 'pausado': return 'Pausado';
      case 'cancelado': return 'Cancelado';
      case 'finalizado': return 'Finalizado';
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
    const date = dateString.includes('T') ? new Date(dateString) : new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={loadEvents}
            className="ml-auto p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="flex flex-row-reverse sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex-1 min-w-0 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          )}
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex-1 min-w-0 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
          >
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
              <p className="text-xs md:text-sm font-medium text-green-700 truncate">Eventos Publicados</p>
              <p className="text-lg md:text-2xl font-bold text-green-900">{loading ? '...' : events.filter(e => e.estado === 'publicado').length}</p>
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <span className="truncate">Activos</span>
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
              <p className="text-xs md:text-sm font-medium text-amber-700 truncate">Borradores</p>
              <p className="text-lg md:text-2xl font-bold text-amber-900">{loading ? '...' : events.filter(e => e.estado === 'borrador').length}</p>
              <p className="text-xs text-yellow-600 font-medium flex items-center mt-1">
                <span className="truncate">Por publicar</span>
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
              <p className="text-lg md:text-2xl font-bold text-purple-900">{loading ? '...' : totalAttendees}</p>
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
            <option value="publicado">Publicados</option>
            <option value="borrador">Borradores</option>
            <option value="pausado">Pausados</option>
            <option value="cancelado">Cancelados</option>
            <option value="finalizado">Finalizados</option>
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
            <option value="date">Fecha (Más próximos primero)</option>
            <option value="title">Título (A-Z alfabético)</option>
            <option value="attendees">Asistentes (Mayor a menor)</option>
            <option value="price">Precio (Menor a mayor)</option>
          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm text-gray-600">Vista:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-200 ${viewMode === 'grid'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              title="Vista de cuadrícula"
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`hidden sm:flex p-2 rounded-xl transition-all duration-200 ${viewMode === 'list'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              title="Vista de lista"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs md:text-sm text-gray-600">
            {sortedEvents.length} eventos encontrados
          </div>
        </div>
      </div>

      {/* Events Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        </div>
      ) : sortedEvents.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
          <p className="text-gray-600 mb-4">No hay eventos que coincidan con los filtros seleccionados.</p>
          <button
            onClick={loadEvents}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Recargar eventos
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {sortedEvents.map((event) => (
            <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl hover:shadow-2xl transition-all duration-200 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Event Image - left side on desktop */}
                <div className="relative w-full md:w-72 lg:w-80 flex-shrink-0 h-48 md:h-auto md:min-h-[280px] bg-gradient-to-br from-gray-200 to-gray-300">
                  <img
                    src={event.url_imagen || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                    alt={event.titulo}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 md:left-4 md:right-auto">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.estado)}`}>
                      {getStatusText(event.estado)}
                    </span>
                  </div>
                </div>

                {/* Event Content - right side on desktop */}
                <div className="flex-1 p-4 md:p-6 flex flex-col">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{event.titulo}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{event.descripcion}</p>
                  </div>

                  {/* Event Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{formatDate(event.fecha_evento)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-red-600 flex-shrink-0" />
                      <span className="truncate">{event.ubicacion}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                      <span>{event.asistentes_actuales || 0}/{event.maximo_asistentes} asistentes</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-yellow-600 flex-shrink-0" />
                      <span>
                        {(() => {
                          const generalTicket = event.tipos_entrada?.find((t: any) => t.nombre_tipo.toLowerCase().includes('general')) ||
                            event.tipos_entrada?.find((t: any) => t.nombre_tipo.toLowerCase().includes('entrada')) ||
                            event.tipos_entrada?.[0];

                          return generalTicket ? formatFullRevenue(generalTicket.precio) : 'Gratis';
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Organizer Info */}
                  <div className="text-xs text-gray-500 mb-4">
                    Organizado por: <span className="font-medium text-gray-700">{event.nombre_organizador}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <button
                      onClick={() => handleViewEvent(event)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs md:text-sm rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                    >
                      <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      Eliminar
                    </button>
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
                {sortedEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={event.url_imagen || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400'}
                          alt={event.titulo}
                          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover mr-3 md:mr-4"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{event.titulo}</div>
                          <div className="text-xs md:text-sm text-gray-500 truncate">{event.nombre_organizador}</div>
                          {/* Mobile: Show additional info inline */}
                          <div className="sm:hidden flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{formatDate(event.fecha_evento)}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.estado)}`}>
                              {getStatusText(event.estado)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden sm:table-cell">{formatDate(event.fecha_evento)}</td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                      {event.asistentes_actuales || 0} / {event.maximo_asistentes}
                    </td>
                    <td className="px-3 md:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                      {event.tipos_entrada && event.tipos_entrada.length > 0
                        ? formatCurrency(Math.min(...event.tipos_entrada.map((t: any) => t.precio)))
                        : 'Sin precio'}
                    </td>
                    <td className="px-3 md:px-6 py-4 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.estado)}`}>
                        {getStatusText(event.estado)}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4">
                      <div className="flex space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleViewEvent(event)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Eliminar"
                        >
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

      {/* Modales */}
      <ViewEventModal
        event={selectedEvent}
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
      />

      <EditEventModal
        event={selectedEvent}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEvent}
      />

      <DeleteEventModal
        event={selectedEvent}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />

      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateEvent}
      />
    </div>
  );
};