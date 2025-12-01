import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Image, 
  Copy as CopyIcon, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Upload,
  Settings,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  Square,
  Share2,
  Download,
  Filter,
  Search,
  ClipboardList
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  maxAttendees: number;
  currentAttendees: number;
  revenue: number;
  views: number;
  conversionRate: number;
  image: string;
  category: string;
  tags: string[];
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
    available: number;
    sold: number;
  }>;
}

interface EventManagementAdvancedProps {
  events: Event[];
  onCreateEvent: () => void;
  onEditEvent: (eventId: string) => void;
  onViewEvent: (eventId: string) => void;
  onDeleteEvent: (eventId: string) => void;
  onDuplicateEvent: (eventId: string) => void;
  onUploadImage: (eventId: string) => void;
  onCustomizeEvent: (eventId: string) => void;
  onAttendanceControl?: (eventId: string) => void;
}

export const EventManagementAdvanced: React.FC<EventManagementAdvancedProps> = ({
  events,
  onCreateEvent,
  onEditEvent,
  onViewEvent,
  onDeleteEvent,
  onDuplicateEvent,
  onUploadImage,
  onCustomizeEvent,
  onAttendanceControl
}) => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published' | 'cancelled' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'revenue' | 'attendees'>('date');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Publicado';
      case 'draft': return 'Borrador';
      case 'cancelled': return 'Cancelado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return CheckCircle;
      case 'draft': return Clock;
      case 'cancelled': return XCircle;
      case 'completed': return Square;
      default: return AlertCircle;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'title': return a.title.localeCompare(b.title);
      case 'revenue': return b.revenue - a.revenue;
      case 'attendees': return b.currentAttendees - a.currentAttendees;
      default: return 0;
    }
  });

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* Header removed - using parent header */}

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-3 sm:p-4 md:p-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Buscar Eventos</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="draft">Borradores</option>
              <option value="published">Publicados</option>
              <option value="cancelled">Cancelados</option>
              <option value="completed">Completados</option>
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Ordenar</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">Fecha</option>
              <option value="title">Título</option>
              <option value="revenue">Ingresos</option>
              <option value="attendees">Asistentes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
        {sortedEvents.map((event) => {
          const StatusIcon = getStatusIcon(event.status);
          return (
            <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl hover:shadow-2xl transition-all duration-200">
              {/* Event Image */}
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-2xl">
                {event.image ? (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover rounded-t-2xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-white/50" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {getStatusText(event.status)}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span>{new Date(event.date).toLocaleDateString('es-ES')} a las {event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-red-600" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 text-green-600" />
                    <span>{event.currentAttendees}/{event.maxAttendees} asistentes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 text-yellow-600" />
                    <span>${event.revenue.toLocaleString()} ingresos</span>
                  </div>
                </div>

                {/* Ticket Types */}
                {event.ticketTypes && event.ticketTypes.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Tipos de Entrada</h5>
                    <div className="space-y-1">
                      {event.ticketTypes.slice(0, 2).map((ticket) => (
                        <div key={ticket.id} className="flex justify-between text-xs text-gray-600">
                          <span>{ticket.name}</span>
                          <span>${ticket.price.toLocaleString()}</span>
                        </div>
                      ))}
                      {event.ticketTypes.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{event.ticketTypes.length - 2} más...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewEvent(event.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs md:text-sm rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Ver
                  </button>
                  <button
                    onClick={() => onEditEvent(event.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Editar
                  </button>
                  {onAttendanceControl && (
                    <button
                      onClick={() => onAttendanceControl(event.id)}
                      className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs md:text-sm rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                      title="Control de Asistencia"
                    >
                      <ClipboardList className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                      <span className="hidden sm:inline">Asistencia</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      console.log('Click en botón duplicar, eventId:', event.id);
                      onDuplicateEvent(event.id);
                    }}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs md:text-sm rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                    title="Duplicar evento"
                  >
                    <CopyIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Duplicar</span>
                  </button>
                  <button
                    onClick={() => onUploadImage(event.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs md:text-sm rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                    title="Subir imagen"
                  >
                    <Upload className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Imagen</span>
                  </button>
                  <button
                    onClick={() => onCustomizeEvent(event.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs md:text-sm rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-200"
                    title="Personalizar"
                  >
                    <Settings className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Config</span>
                  </button>
                  <button
                    onClick={() => onDeleteEvent(event.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    title="Eliminar evento"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterStatus !== 'all' 
              ? 'No se encontraron eventos que coincidan con los filtros aplicados.'
              : 'Comienza creando tu primer evento.'
            }
          </p>
          <button
            onClick={onCreateEvent}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Evento
          </button>
        </div>
      )}
    </div>
  );
};
