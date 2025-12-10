import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { formatPrice } from '@shared/lib/utils/Currency.utils';
import { parseDateString } from '@shared/lib/utils/Date.utils';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { AttendeeService, type AttendeeRow } from '@shared/lib/api/services/Attendee.service';
// (Export functionality removed: PDF/Excel dependencies eliminated)
import { supabase } from '@shared/lib/api/supabase';
import { useRef } from 'react';
import { Toast } from '@shared/ui/components/Toast/Toast.component';
import { AttendeeDetailsModal } from './AttendeeDetailsModal.component';
import { SendEmailModal } from './SendEmailModal.component';
import { ViewQRCodeModal } from './ViewQRCodeModal.component';
import { EmailService } from '@shared/lib/services/Email.service';

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string | null;
  userRole?: string | null;
  eventId: string;
  eventTitle: string;
  ticketType: string;
  ticketPrice: number;
  purchaseDate: string;
  purchaseOrderNumber?: string | null;
  purchaseQuantity?: number | null;
  purchaseTotalPaid?: number | null;
  checkInStatus: 'pending' | 'checked-in' | 'no-show';
  checkInTime?: string;
  notes?: string;
  tags: string[];
  qrCode: string;
  purchaseId?: string; // agregado para poder actualizar estado optimistamente por id_compra
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
  onRefreshRequest?: () => void;
}

export function AttendeeManagement({ eventId, eventTitle, onRefreshRequest }: AttendeeManagementProps) {
  const { user } = useAuthStore();
  const { events: storeEvents } = useEventStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTicketType, setFilterTicketType] = useState('all');
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(eventId || null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para modales
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  
  const [toast, setToast] = useState<{ show: boolean; variant: 'success'|'error'|'info'; message: string }>(
    { show: false, variant: 'success', message: '' }
  );
  // Ref para debouncing de recargas en tiempo real
  const realtimeReloadTimer = useRef<NodeJS.Timeout | null>(null);
  // Set de purchases escaneadas (para fallback cuando RLS impide leer filas QR/asistencia)
  const scannedPurchaseIdsRef = useRef<Set<string>>(new Set());
  
  // Filtrar eventos del organizador actual
  const events = storeEvents.filter(event => event.organizerId === user?.id);
  
  // Al montar, recuperar escaneos previos persistidos localmente
  useEffect(() => {
    try {
      const raw = localStorage.getItem('eh_scanned_purchases');
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) scannedPurchaseIdsRef.current = new Set(arr);
      }
    } catch {}
  }, []);

  // Auto-expandir el evento si viene seleccionado
  useEffect(() => {
    if (eventId) {
      setExpandedEvent(eventId);
    }
  }, [eventId]);
  
  // Función para cargar asistentes desde Supabase
  const loadAttendees = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const rows: AttendeeRow[] = await AttendeeService.getOrganizerAttendees(user.id, eventId);
      let mapped: Attendee[] = rows.map((r: AttendeeRow) => ({
        id: r.userId,
        name: r.name,
        email: r.email,
        phone: r.phone || '',
        avatar: r.avatar || null,
        userRole: r.userRole || null,
        eventId: r.eventId,
        eventTitle: r.eventTitle,
        ticketType: r.ticketType || 'General',
        ticketPrice: r.ticketPrice || 0,
        purchaseDate: r.purchaseDate,
        purchaseOrderNumber: r.purchaseOrderNumber || null,
        purchaseQuantity: r.purchaseQuantity || null,
        purchaseTotalPaid: r.purchaseTotalPaid || null,
        checkInStatus: AttendeeService.mapQrEstadoToUiStatus(r.estado_qr) as any,
        checkInTime: r.fecha_escaneado || undefined,
        notes: undefined,
        tags: [],
        qrCode: r.codigo_qr,
        purchaseId: r.purchaseId
      }));
      // Si venimos solo de compras (fallback) estado_qr será "activo" aunque ya se haya escaneado; forzamos estado con memoria local
      if (scannedPurchaseIdsRef.current.size > 0) {
        mapped = mapped.map(a => {
          if (a.purchaseId && scannedPurchaseIdsRef.current.has(a.purchaseId) && a.checkInStatus !== 'checked-in') {
            return { ...a, checkInStatus: 'checked-in', checkInTime: a.checkInTime || new Date().toISOString() };
          }
          return a;
        });
      }
      setAttendees(mapped);
    } catch (e:any) {
      setToast({ show: true, variant: 'error', message: e.message || 'Error al cargar asistentes' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, eventId]);

  // PDF export removed

  // CSV export removed

  // Excel export removed

  // Export exposure removed

  // Exponer función de recarga al componente padre
  useEffect(() => {
    if (onRefreshRequest) {
      (window as any).__attendeeRefresh = loadAttendees;
    }
  }, [onRefreshRequest, loadAttendees]);

  // Cargar asistentes al montar y cuando cambien las dependencias
  useEffect(() => {
    loadAttendees();
  }, [loadAttendees]);

  // Suscripción en tiempo real a cambios en QR y asistencias
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel('organizer-attendees-realtime')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'codigos_qr_entradas'
      }, (payload) => {
        const nuevo = payload.new as any;
        if (!eventId || nuevo.id_evento === eventId) {
          // Actualización optimista: marcar como checked-in si coincide por id_compra
          setAttendees(prev => {
            if (!nuevo.id_compra) return prev;
            let changed = false;
            const updated = prev.map(a => {
              if (a.purchaseId && a.purchaseId === nuevo.id_compra) {
                changed = true;
                // Guardar en memoria
                scannedPurchaseIdsRef.current.add(nuevo.id_compra);
                return {
                  ...a,
                  checkInStatus: AttendeeService.mapQrEstadoToUiStatus(nuevo.estado),
                  checkInTime: nuevo.fecha_escaneado || new Date().toISOString()
                };
              }
              return a;
            });
            if (changed) {
              try { localStorage.setItem('eh_scanned_purchases', JSON.stringify(Array.from(scannedPurchaseIdsRef.current))); } catch {}
            }
            return changed ? updated : prev;
          });
          // Debounce para recarga real (en caso de que ahora sí se pueda leer fila QR)
          if (realtimeReloadTimer.current) clearTimeout(realtimeReloadTimer.current);
          realtimeReloadTimer.current = setTimeout(() => {
            loadAttendees();
            setToast({ show: true, variant: 'info', message: 'Actualizado tras escaneo de QR' });
          }, 400);
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'asistencia_eventos'
      }, (payload) => {
        const nuevo = payload.new as any;
        if (!eventId || nuevo.id_evento === eventId) {
          // Actualización optimista para asistencia manual
          setAttendees(prev => {
            if (!nuevo.id_compra) return prev;
            // Si ya existe por purchaseId no duplicar, solo marcar.
            let exists = false;
            const updated = prev.map(a => {
              if (a.purchaseId && a.purchaseId === nuevo.id_compra) {
                exists = true;
                scannedPurchaseIdsRef.current.add(nuevo.id_compra);
                return {
                  ...a,
                  checkInStatus: 'checked-in',
                  checkInTime: nuevo.fecha_asistencia || new Date().toISOString()
                };
              }
              return a;
            });
            if (exists) {
              try { localStorage.setItem('eh_scanned_purchases', JSON.stringify(Array.from(scannedPurchaseIdsRef.current))); } catch {}
              return updated;
            }
            // Si no existe y tenemos datos mínimos, crear entrada básica
            const basic: Attendee = {
              id: `MANUAL-${nuevo.id}`,
              name: 'Asistente',
              email: '',
              phone: '',
              eventId: nuevo.id_evento,
              eventTitle: 'Evento',
              ticketType: 'General',
              ticketPrice: 0,
              purchaseDate: nuevo.fecha_asistencia || new Date().toISOString(),
              checkInStatus: 'checked-in',
              checkInTime: nuevo.fecha_asistencia || new Date().toISOString(),
              notes: undefined,
              tags: [],
              qrCode: `MANUAL-${nuevo.id}`,
              purchaseId: nuevo.id_compra
            };
            if (basic.purchaseId) scannedPurchaseIdsRef.current.add(basic.purchaseId);
            try { localStorage.setItem('eh_scanned_purchases', JSON.stringify(Array.from(scannedPurchaseIdsRef.current))); } catch {}
            return [...updated, basic];
          });
          if (realtimeReloadTimer.current) clearTimeout(realtimeReloadTimer.current);
          realtimeReloadTimer.current = setTimeout(() => {
            loadAttendees();
            setToast({ show: true, variant: 'info', message: 'Nueva asistencia registrada' });
          }, 400);
        }
      })
      .subscribe();

    return () => {
      if (realtimeReloadTimer.current) clearTimeout(realtimeReloadTimer.current);
      supabase.removeChannel(channel);
    };
  }, [user?.id, eventId, loadAttendees]);

  // Si hay un evento específico seleccionado para filtros manuales
  const filteredEvents = useMemo(() => (
    eventId ? events.filter(event => event.id === eventId) : events
  ), [events, eventId]);

  const filteredAttendees = attendees.filter(attendee => {
    const matchesSearch = attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         attendee.email.toLowerCase().includes(searchTerm.toLowerCase());
    // Si hay eventId seleccionado, solo mostrar asistentes de ese evento
    const matchesEvent = !eventId || attendee.eventId === eventId;
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

  const handleAttendeeAction = async (attendeeId: string, action: string) => {
    const attendee = attendees.find(a => a.id === attendeeId);
    if (!attendee) return;

    switch (action) {
      case 'view':
        setSelectedAttendee(attendee);
        setViewModalOpen(true);
        break;
      
      case 'email':
        setSelectedAttendee(attendee);
        setEmailModalOpen(true);
        break;
      
      case 'qr':
        setSelectedAttendee(attendee);
        setQrModalOpen(true);
        break;
      
      case 'checkin':
        if (user?.id) {
          try {
            await AttendeeService.checkInByQrCode(attendee.qrCode, user.id);
            // Recargar asistentes desde la base de datos para obtener datos actualizados
            await loadAttendees();
            setToast({ show: true, variant: 'success', message: 'Asistencia registrada correctamente' });
          } catch (e:any) {
            setToast({ show: true, variant: 'error', message: e.message || 'No se pudo registrar asistencia' });
          }
        }
        break;
    }
  };

  const handleBulkAction = (action: string) => {
    // TODO: Implementar acciones masivas
  };

  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  // Calcular métricas reales desde los datos cargados
  const metrics = useMemo(() => {
    const total = attendees.length;
    const checkedIn = attendees.filter(a => a.checkInStatus === 'checked-in').length;
    const pending = attendees.filter(a => a.checkInStatus === 'pending').length;
    const noShow = attendees.filter(a => a.checkInStatus === 'no-show').length;
    const attendanceRate = total > 0 ? ((checkedIn / total) * 100) : 0;
    const checkedInPercentage = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

    return {
      total,
      checkedIn,
      pending,
      noShow,
      attendanceRate,
      checkedInPercentage
    };
  }, [attendees]);

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {toast.show && (
        <Toast
          variant={toast.variant}
          title={toast.variant === 'success' ? '¡Éxito!' : toast.variant === 'error' ? 'Error' : 'Info'}
          position="top-right"
          duration={4000}
          show={toast.show}
          onClose={() => setToast(s => ({ ...s, show: false }))}
        >
          {toast.message}
        </Toast>
      )}
      {/* Action buttons removed - using parent header buttons */}

      {/* Stats Cards - Glassmorphism Design */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Asistentes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                {eventTitle ? 'Del evento actual' : 'Todos los eventos'}
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
              <p className="text-2xl font-bold text-gray-900">{metrics.checkedIn}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                {metrics.checkedInPercentage}% del total
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
              <p className="text-2xl font-bold text-gray-900">{metrics.pending}</p>
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
              <p className="text-sm font-medium text-gray-600">Tasa de Asistencia</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.attendanceRate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                {metrics.attendanceRate >= 80 ? 'Excelente' : metrics.attendanceRate >= 60 ? 'Bueno' : 'Regular'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Todos los estados</option>
            <option value="checked-in">Registrado</option>
            <option value="pending">Pendiente</option>
            <option value="no-show">No asistió</option>
          </select>
          <select
            value={filterTicketType}
            onChange={(e) => setFilterTicketType(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="all">Todos los tipos</option>
            <option value="General">General</option>
            <option value="VIP">VIP</option>
            <option value="Early Bird">Early Bird</option>
          </select>
        </div>
        {eventId && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-blue-600">
            <Filter className="w-4 h-4" />
            <span>Mostrando solo asistentes de: <strong>{eventTitle || 'este evento'}</strong></span>
          </div>
        )}
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
        {eventId ? (
          // Vista directa cuando hay evento seleccionado
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-gray-300 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-gray-600">Cargando asistentes...</div>
            ) : filteredAttendees.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div>
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
                          {filteredAttendees.map((attendee) => (
                          <tr key={attendee.purchaseId || `${attendee.id}-${attendee.eventId}`} className="hover:bg-gray-50">
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
                              <div className="text-sm text-gray-500">{formatPrice(attendee.ticketPrice)}</div>
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
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay asistentes para este evento</p>
                <p className="text-sm text-gray-500 mt-2">Los asistentes aparecerán aquí cuando realicen una compra</p>
              </div>
            )}
          </div>
        ) : (
          // Vista accordion cuando no hay evento seleccionado
          events.map((event) => {
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
                          {parseDateString(event.date).toLocaleDateString('es-ES')}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </span>
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.currentAttendees} asistentes
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      (event.status === 'ongoing' || event.status === 'upcoming')
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {(event.status === 'ongoing' || event.status === 'upcoming') ? 'Activo' : 'Completado'}
                    </span>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-200">
                  {loading ? (
                    <div className="p-8 text-center text-gray-600">Cargando asistentes...</div>
                  ) : eventAttendees.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
              <div>
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
                            <tr key={attendee.purchaseId || `${attendee.id}-${attendee.eventId}`} className="hover:bg-gray-50">
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
                                <div className="text-sm text-gray-500">{formatPrice(attendee.ticketPrice)}</div>
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
                      </div>
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
        })
        )}
      </div>

      {/* Modales */}
      <AttendeeDetailsModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedAttendee(null);
        }}
        attendee={selectedAttendee}
      />

      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => {
          setEmailModalOpen(false);
          setSelectedAttendee(null);
        }}
        attendee={selectedAttendee ? {
          id: selectedAttendee.id,
          name: selectedAttendee.name,
          email: selectedAttendee.email
        } : null}
        onSend={async (emailData) => {
          try {
            const result = await EmailService.sendDirectEmail({
              to: emailData.to,
              subject: emailData.subject,
              message: emailData.message
            });

            if (result.success) {
              setToast({ 
                show: true, 
                variant: 'success', 
                message: `Email enviado exitosamente a ${emailData.to}` 
              });
            } else {
              throw new Error(result.error || 'Error al enviar el email');
            }
          } catch (error) {
            console.error('Error sending email:', error);
            setToast({ 
              show: true, 
              variant: 'error', 
              message: error instanceof Error ? error.message : 'Error al enviar el email' 
            });
            throw error;
          }
        }}
      />

      <ViewQRCodeModal
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setSelectedAttendee(null);
        }}
        attendee={selectedAttendee ? {
          id: selectedAttendee.id,
          name: selectedAttendee.name,
          email: selectedAttendee.email,
          eventTitle: selectedAttendee.eventTitle,
          ticketType: selectedAttendee.ticketType,
          qrCode: selectedAttendee.qrCode,
          checkInStatus: selectedAttendee.checkInStatus,
          checkInDate: selectedAttendee.checkInTime,
          avatar: selectedAttendee.avatar || undefined,
          userRole: selectedAttendee.userRole || undefined,
          phone: selectedAttendee.phone,
          purchaseOrderNumber: selectedAttendee.purchaseOrderNumber || undefined,
          purchaseQuantity: selectedAttendee.purchaseQuantity || undefined,
          purchaseTotalPaid: selectedAttendee.purchaseTotalPaid || undefined,
          purchaseDate: selectedAttendee.purchaseDate,
          price: selectedAttendee.ticketPrice
        } : null}
      />
    </div>
  );
}

