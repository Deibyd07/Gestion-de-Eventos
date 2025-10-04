import { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Mail, 
  Phone, 
  QrCode, 
  CheckCircle, 
  Clock, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Send,
  MessageSquare,
  FileText,
  Calendar,
  MapPin,
  Tag,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';
import { usePurchaseStore } from '../../../../core/stores/purchaseStore';
import { useEventStore } from '../../../../core/stores/eventStore';
import { useAuthStore } from '../../../../core/stores/authStore';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventId: string;
  eventTitle: string;
  ticketType: string;
  ticketPrice: number;
  purchaseDate: string;
  checkInStatus: 'pending' | 'checked-in' | 'no-show';
  checkInTime?: string;
  notes?: string;
  tags: string[];
}

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  status: string;
  attendees: number;
}

export interface AttendeeManagementProps {
  eventId?: string;
  eventTitle?: string;
}

export function AttendeeManagement({ eventId, eventTitle }: AttendeeManagementProps) {
  const { user } = useAuthStore();
  const { events: storeEvents } = useEventStore();
  const { purchases, loading: purchasesLoading } = usePurchaseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTicketType, setFilterTicketType] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  // Filtrar eventos del organizador actual
  const events = storeEvents.filter(event => event.organizerId === user?.id);
  
  // Si hay un evento específico seleccionado, filtrar solo ese evento
  const filteredEvents = eventId 
    ? events.filter(event => event.id === eventId)
    : events;
  
  // Obtener asistentes del evento seleccionado o todos los eventos
  const attendees = purchases.filter(purchase => 
    filteredEvents.some(event => event.id === purchase.eventId)
  );

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === 'all' || attendee.eventId === filterEvent;
    const matchesStatus = filterStatus === 'all' || attendee.checkInStatus === filterStatus;
    const matchesTicketType = filterTicketType === 'all' || attendee.ticketType === filterTicketType;
    return matchesSearch && matchesEvent && matchesStatus && matchesTicketType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no-show':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'Registrado';
      case 'pending':
        return 'Pendiente';
      case 'no-show':
        return 'No asistió';
      default:
        return 'Desconocido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'checked-in':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'no-show':
        return <UserX className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const handleAttendeeAction = (attendeeId: string, action: string) => {
    console.log(`Acción ${action} para asistente ${attendeeId}`);
  };

  const handleBulkAction = (action: string) => {
    console.log(`Acción masiva ${action} para asistentes:`, selectedAttendees);
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  return (
    <div className="space-y-4">
      {/* Action buttons removed - using parent header buttons */}

      {/* Stats Cards - Glassmorphism Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Asistentes</p>
              <p className="text-2xl font-bold text-gray-900">469</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                +12% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Registrados</p>
              <p className="text-2xl font-bold text-gray-900">342</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                73% del total
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">127</p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                Esperando registro
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa Asistencia</p>
              <p className="text-2xl font-bold text-gray-900">94.4%</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                Excelente rendimiento
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar asistentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <select
            value={filterEvent}
            onChange={(e) => setFilterEvent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Todos los eventos</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>{event.title}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Todos los estados</option>
            <option value="checked-in">Registrado</option>
            <option value="pending">Pendiente</option>
            <option value="no-show">No asistió</option>
          </select>
          <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gestión de Asistentes
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {eventTitle ? `Gestiona los asistentes de: ${eventTitle}` : 'Gestiona y comunícate con los asistentes de tus eventos'}
          </p>
          {eventId && (
            <div className="mt-2 flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-600 font-medium">
                Vista específica del evento seleccionado
              </span>
            </div>
          )}
        </div>
      </div>



      {/* Events with Attendees */}
      <div className="space-y-4">
        {events.map((event) => {
          const eventAttendees = filteredAttendees.filter(attendee => attendee.eventId === event.id);
          const isExpanded = expandedEvent === event.id;
          
          return (
            <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-200">
              <div 
                className="p-6 cursor-pointer hover:bg-white/20 transition-all duration-200"
                onClick={() => toggleEventExpansion(event.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.attendees} asistentes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      event.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {event.status === 'active' ? 'Activo' : 'Completado'}
                    </span>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  {eventAttendees.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              <input type="checkbox" className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asistente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo de Entrada</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Compra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eventAttendees.map((attendee) => (
                            <tr key={attendee.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={selectedAttendees.includes(attendee.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedAttendees([...selectedAttendees, attendee.id]);
                                    } else {
                                      setSelectedAttendees(selectedAttendees.filter(id => id !== attendee.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                                    <div className="text-sm text-gray-500">{attendee.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{attendee.ticketType}</div>
                                <div className="text-sm text-gray-500">€{attendee.ticketPrice}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full border flex items-center w-fit ${getStatusColor(attendee.checkInStatus)}`}>
                                  {getStatusIcon(attendee.checkInStatus)}
                                  <span className="ml-1">{getStatusText(attendee.checkInStatus)}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(attendee.purchaseDate).toLocaleDateString('es-ES')}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => handleAttendeeAction(attendee.id, 'view')}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Ver detalles"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleAttendeeAction(attendee.id, 'checkin')}
                                    className="text-green-600 hover:text-green-900"
                                    title="Registrar asistencia"
                                  >
                                    <UserCheck className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleAttendeeAction(attendee.id, 'email')}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Enviar email"
                                  >
                                    <Mail className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleAttendeeAction(attendee.id, 'qr')}
                                    className="text-purple-600 hover:text-purple-900"
                                    title="Ver QR"
                                  >
                                    <QrCode className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay asistentes para este evento</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

