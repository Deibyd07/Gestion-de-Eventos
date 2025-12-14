import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Plus,
  Ticket,
  Download,
  BarChart3,
  RefreshCw,
  QrCode,
  CheckCircle,
  LogOut,
  User,
  Menu,
  X,
  CreditCard,
  Percent,
  Wallet,
  Receipt,
  FileBarChart
} from 'lucide-react';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { useEventStore } from '../../../events/infrastructure/store/Event.store';
import { EventManagementAdvanced } from '../components/EventManagementAdvanced.component';
import { TicketManagement } from '../components/TicketManagement.component';
import { PromotionManagement } from '../components/PromotionManagement.component';
import { AttendeeManagement } from '../components/AttendeeManagement.component';
import { OrganizerDashboardContent } from '../components/OrganizerDashboardContent.component';
import { OrganizerProfilePanel } from '../components/OrganizerProfilePanel.component';
import { CreateEventModal, CreateEventFormData } from '../../../events/presentation/components/CreateEventModal.component';
import { ViewTicketModal } from '../components/ViewTicketModal.component';
import { EditTicketModal } from '../components/EditTicketModal.component';
import { DuplicateTicketModal } from '../components/DuplicateTicketModal.component';
import { DeleteTicketModal } from '../components/DeleteTicketModal.component';
import { ViewPromotionModal } from '../components/ViewPromotionModal.component';
import { EditPromotionModal } from '../components/EditPromotionModal.component';
import { DuplicatePromotionModal } from '../components/DuplicatePromotionModal.component';
import { DeletePromotionModal } from '../components/DeletePromotionModal.component';
import { EditEventModal, EditEventFormData } from '../../../events/presentation/components/EditEventModal.component';
import { ViewEventModal } from '../../../events/presentation/components/ViewEventModal.component';
import { DeleteEventConfirmation } from '../../../events/presentation/components/DeleteEventConfirmation.component';
import { ConfigureEventModal } from '../../../events/presentation/components/ConfigureEventModal.component';
import { CreateTicketModal, CreateTicketFormData } from '../components/CreateTicketModal.component';
import { TicketTypeService } from '@shared/lib/api/services/TicketType.service';
import { StorageService } from '@shared/lib/services/Storage.service';
import { PaymentMethodService } from '@shared/lib/api/services/PaymentMethod.service';
import { CreatePromotionModal, CreatePromotionFormData } from '../components/CreatePromotionModal.component';
import { UploadImageModal } from '../../../events/presentation/components/UploadImageModal.component';
import { DuplicateEventModal } from '../../../events/presentation/components/DuplicateEventModal.component';
import {
  CreatePaymentMethodModal,
  CreatePaymentMethodFormData,
  ViewPaymentMethodModal,
  EditPaymentMethodModal,
  DeletePaymentMethodModal
} from '../components';
import { formatRevenue } from '@shared/lib/utils/Currency.utils';
import { EventService } from '@shared/lib/api/services/Event.service';
import { QRScannerModal } from '../components/QRScannerModal.component';
import { AnalyticsService } from '@shared/lib/api/services/Analytics.service';
import { AttendeeService, type AttendeeRow } from '@shared/lib/api/services/Attendee.service';
import { Toast } from '@shared/ui/components/Toast/Toast.component';
import { AllActivityModal } from '../components/AllActivityModal.component';


// Event interface removed - using store types

interface QuickStats {
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalAttendees: number;
  conversionRate: number;
  avgTicketPrice: number;
  upcomingEvents: number;
  completedEvents: number;
  ventasHoy?: number;
  ingresosHoy?: number;
  comisionHoy?: number;
  netoHoy?: number;
  vistasUnicas?: number;
  abandonoCarrito?: number;
  eventosEnCurso?: number;
  asistenciaPromedio?: number;
  ultimoEscaneoISO?: string | null;
}

export function OrganizerDashboard() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  // Sidebar abierto por defecto en desktop, cerrado en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isCreateEventModalOpen, setIsCreateEventModalOpen] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [isCreatePromotionModalOpen, setIsCreatePromotionModalOpen] = useState(false);
  const [isCreatingPromotion, setIsCreatingPromotion] = useState(false);
  const [isUploadImageModalOpen, setIsUploadImageModalOpen] = useState(false);
  const [selectedEventForImage, setSelectedEventForImage] = useState<{ id: string; title: string; currentImage?: string } | null>(null);
  const [isDuplicateEventModalOpen, setIsDuplicateEventModalOpen] = useState(false);
  const [selectedEventForDuplication, setSelectedEventForDuplication] = useState<any | null>(null);

  // Estados para el modal de crear método de pago
  const [isCreatePaymentMethodModalOpen, setIsCreatePaymentMethodModalOpen] = useState(false);
  const [isCreatingPaymentMethod, setIsCreatingPaymentMethod] = useState(false);

  // Estados para los nuevos modales CRUD
  const [isViewEventModalOpen, setIsViewEventModalOpen] = useState(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [isDeleteEventModalOpen, setIsDeleteEventModalOpen] = useState(false);
  const [isConfigureEventModalOpen, setIsConfigureEventModalOpen] = useState(false);
  const [selectedEventForView, setSelectedEventForView] = useState<any | null>(null);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<any | null>(null);
  const [selectedEventForDelete, setSelectedEventForDelete] = useState<any | null>(null);
  const [selectedEventForConfigure, setSelectedEventForConfigure] = useState<any | null>(null);
  const [isLoadingEventDetails, setIsLoadingEventDetails] = useState(false);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);

  // Estado para el modal de escáner QR
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  // Estados para estadísticas de asistencia en tiempo real
  const [attendanceStats, setAttendanceStats] = useState({
    totalAttendees: 0,
    checkedIn: 0,
    pending: 0,
    attendanceRate: 0,
    recentScans: [] as Array<{ name: string; time: string }>
  });
  const [isExportingReport, setIsExportingReport] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Actividad reciente del organizador
  const [recentActivity, setRecentActivity] = useState<Array<{ type: 'venta' | 'escaneo' | string; timeISO: string; title: string; description: string; badge?: string; eventTitle?: string }>>([]);
  const [isAllActivityModalOpen, setIsAllActivityModalOpen] = useState(false);

  // Estados para el Toast de notificaciones
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Estados para los modales CRUD de tipo de entrada
  const [isViewTicketModalOpen, setIsViewTicketModalOpen] = useState(false);
  const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState(false);
  const [isDuplicateTicketModalOpen, setIsDuplicateTicketModalOpen] = useState(false);
  const [isDeleteTicketModalOpen, setIsDeleteTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  // Handlers para CRUD de tipo de entrada
  const handleViewTicket = (ticketId: string) => {
    const ticket = selectedEvent?.ticketTypes?.find((t: any) => t.id === ticketId);
    if (ticket) {
      // Normalizar clave para buscar el revenue correspondiente
      const key = normalizeTicketKey(ticket.name || ticket.nombre_tipo);
      const revenue = ticketRevenueByType[key];
      // Inyectar el revenue calculado al objeto ticket para que el modal lo pueda leer
      setSelectedTicket({ ...ticket, revenue });
    } else {
      setSelectedTicket(null);
    }
    setIsViewTicketModalOpen(true);
  };

  const handleEditTicket = (ticketId: string) => {
    const ticket = selectedEvent?.ticketTypes?.find((t: any) => t.id === ticketId);
    setSelectedTicket(ticket);
    setIsEditTicketModalOpen(true);
  };

  const handleDuplicateTicket = (ticketId: string) => {
    const ticket = selectedEvent?.ticketTypes?.find((t: any) => t.id === ticketId);
    setSelectedTicket(ticket);
    setIsDuplicateTicketModalOpen(true);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const ticket = selectedEvent?.ticketTypes?.find((t: any) => t.id === ticketId);
    setSelectedTicket(ticket);
    setIsDeleteTicketModalOpen(true);
  };

  // Callbacks para cerrar modales
  const closeTicketModals = () => {
    setIsViewTicketModalOpen(false);
    setIsEditTicketModalOpen(false);
    setIsDuplicateTicketModalOpen(false);
    setIsDeleteTicketModalOpen(false);
    setSelectedTicket(null);
  };

  // Estados para los modales CRUD de promociones
  const [isViewPromotionModalOpen, setIsViewPromotionModalOpen] = useState(false);
  const [isEditPromotionModalOpen, setIsEditPromotionModalOpen] = useState(false);
  const [isDuplicatePromotionModalOpen, setIsDuplicatePromotionModalOpen] = useState(false);
  const [isDeletePromotionModalOpen, setIsDeletePromotionModalOpen] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);
  const [promotions, setPromotions] = useState<any[]>([]);

  // Estados para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  // Estados para modales CRUD de métodos de pago
  const [isViewPaymentMethodModalOpen, setIsViewPaymentMethodModalOpen] = useState(false);
  const [isEditPaymentMethodModalOpen, setIsEditPaymentMethodModalOpen] = useState(false);
  const [isDeletePaymentMethodModalOpen, setIsDeletePaymentMethodModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any | null>(null);
  const [isLoadingPaymentMethodDetails, setIsLoadingPaymentMethodDetails] = useState(false);
  // Ingresos reales por tipo de entrada (considerando descuentos) para la pestaña de tickets
  const [ticketRevenueByType, setTicketRevenueByType] = useState<Record<string, number>>({});
  const [isDeletingPaymentMethod, setIsDeletingPaymentMethod] = useState(false);
  const [openPaymentMethodDropdown, setOpenPaymentMethodDropdown] = useState<string | null>(null);
  const [eventPaymentStats, setEventPaymentStats] = useState<any | null>(null);
  const [isLoadingEventPaymentStats, setIsLoadingEventPaymentStats] = useState(false);

  // Handlers para CRUD de promociones
  const handleViewPromotion = (promotionId: string) => {
    const promotion = promotions.find((p: any) => p.id === promotionId);
    setSelectedPromotion(promotion);
    setIsViewPromotionModalOpen(true);
  };

  const handleEditPromotion = (promotionId: string) => {
    const promotion = promotions.find((p: any) => p.id === promotionId);
    setSelectedPromotion(promotion);
    setIsEditPromotionModalOpen(true);
  };

  const handleDuplicatePromotion = (promotionId: string) => {
    const promotion = promotions.find((p: any) => p.id === promotionId);
    setSelectedPromotion(promotion);
    setIsDuplicatePromotionModalOpen(true);
  };

  const handleDeletePromotion = (promotionId: string) => {
    const promotion = promotions.find((p: any) => p.id === promotionId);
    setSelectedPromotion(promotion);
    setIsDeletePromotionModalOpen(true);
  };

  // Callbacks para cerrar modales de promociones
  const closePromotionModals = () => {
    setIsViewPromotionModalOpen(false);
    setIsEditPromotionModalOpen(false);
    setIsDuplicatePromotionModalOpen(false);
    setIsDeletePromotionModalOpen(false);
    setSelectedPromotion(null);
  };

  // Función para cargar promociones
  const loadPromotions = async () => {
    try {
      if (user?.id) {
        const PromotionService = (await import('@shared/lib/api/services/Promotion.service')).PromotionService;
        const data = selectedEventId
          ? await PromotionService.obtenerPromocionesEvento(selectedEventId)
          : await PromotionService.obtenerPromocionesOrganizador(user.id);
        setPromotions(data || []);
      }
    } catch (error) {
      console.error('Error al cargar promociones:', error);
    }
  };

  // Función para cargar métodos de pago (estrictamente por evento si hay uno seleccionado)
  const loadPaymentMethods = async () => {
    if (!user?.id) return;
    setIsLoadingPaymentMethods(true);
    try {
      // Solo mostrar métodos del evento seleccionado; si no hay evento, lista vacía
      if (!selectedEventId) {
        setPaymentMethods([]);
        setEventPaymentStats(null);
        return;
      }
      const data = await PaymentMethodService.obtenerMetodosPagoEvento(selectedEventId) || [];
      setPaymentMethods(data);
      // Cargar estadísticas inmediatamente después de cargar métodos
      await loadEventPaymentStats();
    } catch (error) {
      console.error('❌ Error al cargar métodos de pago:', error);
      setPaymentMethods([]);
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  const loadEventPaymentStats = async () => {
    if (!selectedEventId) {
      setEventPaymentStats(null);
      return;
    }
    setIsLoadingEventPaymentStats(true);
    try {
      const stats = await PaymentMethodService.obtenerEstadisticasMetodosPagoEvento(selectedEventId);
      setEventPaymentStats(stats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas de métodos de pago del evento:', error);
      setEventPaymentStats(null);
    } finally {
      setIsLoadingEventPaymentStats(false);
    }
  };

  // Handlers para CRUD de métodos de pago
  const handleViewPaymentMethod = async (paymentMethodId: string) => {
    console.log('Ver método de pago:', paymentMethodId);
    setIsLoadingPaymentMethodDetails(true);
    try {
      const paymentMethod = await PaymentMethodService.obtenerMetodoPagoPorId(paymentMethodId);
      setSelectedPaymentMethod(paymentMethod);
      setIsViewPaymentMethodModalOpen(true);
    } catch (error) {
      console.error('Error al cargar método de pago:', error);
      alert('Error al cargar los detalles del método de pago');
    } finally {
      setIsLoadingPaymentMethodDetails(false);
    }
  };

  const handleEditPaymentMethod = async (paymentMethodId: string) => {
    console.log('Editar método de pago:', paymentMethodId);
    setIsLoadingPaymentMethodDetails(true);
    try {
      const paymentMethod = await PaymentMethodService.obtenerMetodoPagoPorId(paymentMethodId);
      setSelectedPaymentMethod(paymentMethod);
      setIsEditPaymentMethodModalOpen(true);
    } catch (error) {
      console.error('Error al cargar método de pago para editar:', error);
      alert('Error al cargar el método de pago');
    } finally {
      setIsLoadingPaymentMethodDetails(false);
    }
  };

  const handleSavePaymentMethodChanges = async (formData: any) => {
    if (!selectedPaymentMethod) return;

    try {
      console.log('Guardando cambios en método de pago:', formData);
      await PaymentMethodService.actualizarMetodoPago(selectedPaymentMethod.id, {
        nombre: formData.name,
        tipo: formData.type,
        proveedor: formData.provider,
        descripcion: formData.description,
        activo: formData.isActive,
        comision_porcentaje: formData.processingFee,
        comision_fija: formData.fixedFee,
        monto_minimo: formData.minAmount,
        monto_maximo: formData.maxAmount,
        monedas_soportadas: formData.supportedCurrencies,
        requiere_verificacion: formData.requiresVerification,
        tiempo_procesamiento: formData.processingTime,
        configuracion: {
          apiKey: formData.configuration.apiKey,
          merchantId: formData.configuration.merchantId,
          publicKey: formData.configuration.publicKey,
          secretKey: formData.configuration.secretKey,
          webhookUrl: formData.configuration.webhookUrl,
          sandboxMode: formData.configuration.sandboxMode
        }
      });
      console.log('Método de pago actualizado exitosamente');
      await loadPaymentMethods();
      await loadEventPaymentStats();
      setIsEditPaymentMethodModalOpen(false);
      setSelectedPaymentMethod(null);
      setToastMessage('Método de pago actualizado exitosamente');
      setShowSuccessToast(true);
    } catch (error) {
      console.error('Error al actualizar método de pago:', error);
      setToastMessage('Error al actualizar el método de pago');
      setShowErrorToast(true);
      throw error;
    }
  };



  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    console.log('🗑️ DELETE: Iniciando proceso de eliminación:', paymentMethodId);
    setIsLoadingPaymentMethodDetails(true);
    try {
      console.log('🔍 DELETE: Cargando detalles del método...');
      const paymentMethod = await PaymentMethodService.obtenerMetodoPagoPorId(paymentMethodId);
      console.log('✅ DELETE: Método cargado:', paymentMethod);
      setSelectedPaymentMethod(paymentMethod);
      console.log('🚀 DELETE: Abriendo modal de eliminación...');
      setIsDeletePaymentMethodModalOpen(true);
      console.log('📊 DELETE: Estado del modal:', isDeletePaymentMethodModalOpen);
    } catch (error) {
      console.error('❌ DELETE: Error al cargar método de pago:', error);
      alert('Error al cargar información del método de pago');
    } finally {
      setIsLoadingPaymentMethodDetails(false);
      console.log('🏁 DELETE: Proceso de carga completado');
    }
  };

  const handleConfirmDeletePaymentMethod = async () => {
    if (!selectedPaymentMethod) return;

    setIsDeletingPaymentMethod(true);
    try {
      console.log('Confirmando eliminación del método de pago:', selectedPaymentMethod.id);
      await PaymentMethodService.eliminarMetodoPago(selectedPaymentMethod.id);
      console.log('Método de pago eliminado exitosamente');
      await loadPaymentMethods();
      setIsDeletePaymentMethodModalOpen(false);
      setSelectedPaymentMethod(null);
      setToastMessage('Método de pago eliminado exitosamente');
      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Error al eliminar método de pago:', error);
      setToastMessage(error.message || 'Error al eliminar el método de pago');
      setShowErrorToast(true);
    } finally {
      setIsDeletingPaymentMethod(false);
    }
  };

  // Función para cerrar modales de métodos de pago
  const closePaymentMethodModals = () => {
    setIsViewPaymentMethodModalOpen(false);
    setIsEditPaymentMethodModalOpen(false);
    setIsDeletePaymentMethodModalOpen(false);
    setSelectedPaymentMethod(null);
  };

  const handleLogout = () => {
    logout();
    // No navegar, solo cerrar sesión
  };

  // Usar datos reales del store
  const { events: storeEvents, setEvents } = useEventStore();
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Cargar eventos reales del organizador desde Supabase
  useEffect(() => {
    const loadOrganizerEvents = async () => {
      if (!user?.id) {
        console.log('No hay usuario autenticado');
        return;
      }

      console.log('Cargando eventos para usuario:', user.id);
      setIsLoadingEvents(true);
      try {
        const dbEvents = await EventService.obtenerEventosUsuario(user.id);
        console.log('Eventos obtenidos de la BD:', dbEvents);

        if (dbEvents && dbEvents.length > 0) {
          // Convertir eventos de BD al formato del store
          const convertedEvents = dbEvents.map((dbEvent: any) => ({
            id: dbEvent.id,
            title: dbEvent.titulo,
            description: dbEvent.descripcion,
            image: dbEvent.url_imagen || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg',
            date: dbEvent.fecha_evento,
            time: dbEvent.hora_evento,
            location: dbEvent.ubicacion,
            category: dbEvent.categoria,
            price: 0, // Se calcula desde tipos_entrada
            maxAttendees: dbEvent.maximo_asistentes,
            currentAttendees: dbEvent.asistentes_actuales || 0,
            organizerId: dbEvent.id_organizador,
            organizerName: dbEvent.nombre_organizador || user.name,
            status: dbEvent.estado || 'upcoming',
            tags: dbEvent.etiquetas || [],
            ticketTypes: dbEvent.tipos_entrada || []
          }));

          console.log('Eventos convertidos:', convertedEvents);

          // Actualizar el store global (solo reemplazar los del organizador)
          const otherEvents = storeEvents.filter(e => e.organizerId !== user.id);
          setEvents([...otherEvents, ...convertedEvents]);
        } else {
          console.log('No se encontraron eventos para este organizador');
        }
      } catch (error) {
        console.error('Error al cargar eventos del organizador:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    loadOrganizerEvents();
  }, [user?.id]);

  // Filtrar eventos del organizador actual
  const events = storeEvents.filter(event => event.organizerId === user?.id);

  console.log('Eventos filtrados para el organizador:', events);

  console.log('Eventos filtrados para el organizador:', events);

  // IMPORTANTE: No usar eventos mock - solo eventos reales de la BD
  // Si no hay eventos, mostrar mensaje para crear uno
  const finalEvents = events;

  // Seleccionar automáticamente el primer evento si no hay uno seleccionado
  const selectedEvent = selectedEventId
    ? finalEvents.find(event => event.id === selectedEventId)
    : finalEvents.length > 0 ? finalEvents[0] : null;

  console.log('Evento seleccionado:', selectedEvent);

  // Si no hay evento seleccionado pero hay eventos disponibles, seleccionar el primero
  if (!selectedEventId && finalEvents.length > 0) {
    setSelectedEventId(finalEvents[0].id);
  }

  // Métricas reales agregadas del organizador
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalAttendees: 0,
    conversionRate: 0,
    avgTicketPrice: 0,
    upcomingEvents: 0,
    completedEvents: 0
  });

  const loadMetrics = async () => {
    const eventIdAtStart = selectedEvent?.id || null;
    console.group('METRICAS-ASISTENCIA');
    // Calcular a partir de todos los asistentes del organizador (evita depender de status)
    let eventosEnCurso = 0;
    let totalVendidos = 0;
    let totalCheckin = 0;
    let ultimoEscaneoISO: string | null = null;
    try {
      const attendeesAll = await AttendeeService.getOrganizerAttendees(user.id);
      console.log('attendeesAll:', attendeesAll?.length);
      totalVendidos = attendeesAll.length;
      const checkinsAll = attendeesAll.filter(a => a.estado_qr === 'usado');
      totalCheckin = checkinsAll.length;
      // eventosEnCurso = número de eventos únicos con asistentes (aproximación operativa)
      const eventIdSet = new Set(attendeesAll.map(a => a.eventId));
      eventosEnCurso = eventIdSet.size;
      for (const a of checkinsAll) {
        if (a.fecha_escaneado && (!ultimoEscaneoISO || new Date(a.fecha_escaneado) > new Date(ultimoEscaneoISO))) {
          ultimoEscaneoISO = a.fecha_escaneado as string;
        }
      }
    } catch (e) {
      console.warn('Error obteniendo attendeesAll para métricas:', (e as any)?.message);
    }
    console.log('Totales:', { eventosEnCurso, totalVendidos, totalCheckin, ultimoEscaneoISO });
    console.groupEnd();
    if (!user?.id) return;
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const data = eventIdAtStart
        ? await AnalyticsService.obtenerMetricasEvento(eventIdAtStart)
        : await AnalyticsService.obtenerMetricasOrganizador(user.id);
      // Calcular métricas de asistencia al estilo del módulo de control (event-specific si hay seleccionado)
      let asistenciaPromedio = 0;
      let eventosEnCurso = 0;
      let ultimoEscaneoISO: string | null = null;
      try {
        const attendeesAll = await AttendeeService.getOrganizerAttendees(user.id, eventIdAtStart || undefined);
        const total = attendeesAll.length;
        const checkedIn = attendeesAll.filter(a => a.estado_qr === 'usado').length;
        asistenciaPromedio = total > 0 ? (checkedIn / total) * 100 : 0;
        const eventIdSet = new Set(attendeesAll.map(a => a.eventId));
        eventosEnCurso = selectedEvent ? (eventIdSet.size > 0 ? 1 : 0) : eventIdSet.size;
        const last = attendeesAll
          .filter(a => !!a.fecha_escaneado)
          .sort((a, b) => new Date(String(b.fecha_escaneado)).getTime() - new Date(String(a.fecha_escaneado)).getTime())[0];
        ultimoEscaneoISO = last?.fecha_escaneado ?? null;
      } catch { }
      // Evitar race conditions: si el evento cambió mientras cargábamos, no sobrescribir
      if (eventIdAtStart !== (selectedEvent?.id || null)) {
        return;
      }
      // Usar Analytics como base y sobreescribir las tres métricas con cálculo real
      setQuickStats({
        totalEvents: data.totalEvents,
        activeEvents: data.activeEvents,
        totalRevenue: data.totalRevenue,
        totalAttendees: data.totalAttendees,
        conversionRate: Number(data.conversionRate.toFixed(2)),
        avgTicketPrice: data.avgTicketPrice,
        upcomingEvents: data.upcomingEvents,
        completedEvents: data.completedEvents,
        ventasHoy: data.ventasHoy,
        ingresosHoy: data.ingresosHoy,
        comisionHoy: data.comisionHoy,
        netoHoy: data.netoHoy,
        vistasUnicas: data.vistasUnicas,
        abandonoCarrito: Number(data.abandonoCarrito.toFixed(2)),
        eventosEnCurso: (typeof data.eventosEnCurso === 'number' && data.eventosEnCurso > 0) ? data.eventosEnCurso : (eventosEnCurso || 0),
        asistenciaPromedio: Number((asistenciaPromedio || data.asistenciaPromedio || 0).toFixed(2)),
        ultimoEscaneoISO: ultimoEscaneoISO ?? data.ultimoEscaneoISO ?? null
      });
    } catch (err: any) {
      console.error('Error cargando métricas del organizador:', err);
      setMetricsError(err.message || 'Error al cargar métricas');
    } finally {
      setMetricsLoading(false);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  };

  const loadRecentActivity = async () => {
    if (!user?.id) return;
    try {
      const items = await AnalyticsService.obtenerActividadRecienteOrganizador(user.id);
      setRecentActivity(items as any);
    } catch (e) {
      console.error('Error cargando actividad reciente:', e);
      setRecentActivity([]);
    }
  };

  useEffect(() => {
    // Cargar métricas cuando se cargan eventos, cambia usuario o cambia evento seleccionado
    if (user?.id) {
      loadMetrics();
      loadRecentActivity();
      loadPromotions();
      loadPaymentMethods();
    }
  }, [user?.id, finalEvents.length, selectedEventId]);

  // Cargar ingresos reales por tipo de entrada al entrar en la pestaña de tickets
  useEffect(() => {
    const loadRevenue = async () => {
      if (activeTab !== 'tickets' || !selectedEventId) return;
      const map = await calculateTicketRevenue(selectedEventId);
      setTicketRevenueByType(map);
    };
    loadRevenue();
  }, [activeTab, selectedEventId]);

  // Effect para cargar estadísticas de asistencia
  useEffect(() => {
    if (activeTab === 'attendance' && selectedEvent) {
      loadAttendanceStats(selectedEvent.id);
    }
  }, [activeTab, selectedEvent]);

  // Effect para cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openPaymentMethodDropdown) {
        const target = event.target as Element;

        // No cerrar si el clic fue dentro del dropdown o en el botón del dropdown
        if (target && (
          target.closest('.dropdown-menu') ||
          target.closest('[data-dropdown-button]')
        )) {
          return;
        }

        console.log('🚫 CLOSING DROPDOWN: Cerrando dropdown por clic fuera');
        setOpenPaymentMethodDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openPaymentMethodDropdown]);

  // Status functions removed - not used in current implementation

  const mapDbEstadoToStatus = (estado?: string) => {
    switch ((estado || '').toLowerCase()) {
      case 'publicado':
        return 'upcoming';
      case 'borrador':
        return 'draft';
      case 'pausado':
        return 'paused';
      case 'cancelado':
        return 'cancelled';
      case 'finalizado':
        return 'completed';
      default:
        return 'upcoming';
    }
  };

  const handleRefresh = async () => {
    console.log('Actualizando datos...');
    // Recargar eventos del organizador
    if (!user?.id) return;

    setIsRefreshing(true);
    try {
      const dbEvents = await EventService.obtenerEventosUsuario(user.id);

      if (dbEvents && dbEvents.length > 0) {
        const convertedEvents = dbEvents.map((dbEvent: any) => ({
          id: dbEvent.id,
          title: dbEvent.titulo,
          description: dbEvent.descripcion,
          image: dbEvent.url_imagen || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg',
          date: dbEvent.fecha_evento,
          time: dbEvent.hora_evento,
          location: dbEvent.ubicacion,
          category: dbEvent.categoria,
          price: 0,
          maxAttendees: dbEvent.maximo_asistentes,
          currentAttendees: dbEvent.asistentes_actuales || 0,
          organizerId: dbEvent.id_organizador,
          organizerName: dbEvent.nombre_organizador || user.name,
          status: mapDbEstadoToStatus(dbEvent.estado),
          tags: dbEvent.etiquetas || [],
          ticketTypes: (dbEvent.tipos_entrada || []).map((t: any) => ({
            id: t.id,
            name: t.nombre_tipo,
            description: t.descripcion,
            price: t.precio,
            originalPrice: undefined,
            available: t.cantidad_disponible,
            sold: (t.cantidad_maxima || 0) - (t.cantidad_disponible || 0),
            type: t.tipo || 'general',
            isActive: true,
            salesStartDate: undefined,
            salesEndDate: undefined,
            maxPerUser: undefined,
            features: [],
            eventId: dbEvent.id
          }))
        }));

        const otherEvents = storeEvents.filter(e => e.organizerId !== user.id);
        setEvents([...otherEvents, ...convertedEvents]);
      }

      // Recargar también métodos de pago
      await loadPaymentMethods();

      // Recargar métricas
      await loadMetrics();

      // Recalcular ingresos reales por tipo de entrada (incluye descuentos) al refrescar
      if (activeTab === 'tickets') {
        const currentEventId = selectedEventId || convertedEvents[0]?.id;
        if (currentEventId) {
          try {
            const revenueMap = await calculateTicketRevenue(currentEventId);
            setTicketRevenueByType(revenueMap);
          } catch (revenueErr) {
            console.error('Error recalculando ingresos por tipo de entrada:', revenueErr);
          }
        } else {
          // Si no hay evento, limpiar el mapa para no mostrar valores desactualizados
          setTicketRevenueByType({});
        }
      }

      // Si estamos en la pestaña de asistentes, recargar asistentes también
      if (activeTab === 'attendees' && (window as any).__attendeeRefresh) {
        await (window as any).__attendeeRefresh();
      }

      // Si estamos en la pestaña de attendance, recargar estadísticas
      if (activeTab === 'attendance' && selectedEvent) {
        await loadAttendanceStats(selectedEvent.id);
      }
    } catch (error) {
      console.error('Error al refrescar eventos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Función para cargar estadísticas de asistencia en tiempo real
  const loadAttendanceStats = async (eventId: string) => {
    if (!user?.id) return;

    try {
      const { AttendeeService } = await import('@shared/lib/api/services/Attendee.service');
      const attendees = await AttendeeService.getOrganizerAttendees(user.id, eventId);

      // Calcular estadísticas
      const total = attendees.length;
      const checkedIn = attendees.filter(a => a.estado_qr === 'usado').length;
      const pending = attendees.filter(a => a.estado_qr === 'activo').length;
      const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

      // Obtener últimos 3 escaneos
      const recentScans = attendees
        .filter(a => a.fecha_escaneado)
        .sort((a, b) => new Date(b.fecha_escaneado!).getTime() - new Date(a.fecha_escaneado!).getTime())
        .slice(0, 3)
        .map(a => ({
          name: a.name,
          time: new Date(a.fecha_escaneado!).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }));

      setAttendanceStats({
        totalAttendees: total,
        checkedIn,
        pending,
        attendanceRate: rate,
        recentScans
      });
    } catch (error) {
      console.error('Error al cargar estadísticas de asistencia:', error);
    }
  };

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  };

  const formatCurrency = (value?: number | null) => {
    const amount = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const revenuePerAttendee = (attendee: AttendeeRow) => {
    const quantity = attendee.purchaseQuantity && attendee.purchaseQuantity > 0 ? attendee.purchaseQuantity : 1;
    if (typeof attendee.purchaseTotalPaid === 'number' && quantity > 0) {
      return attendee.purchaseTotalPaid / quantity;
    }
    if (typeof attendee.ticketPrice === 'number') {
      return attendee.ticketPrice;
    }
    return 0;
  };

  const fetchAttendeesForSelectedEvent = async () => {
    if (!user?.id) throw new Error('No hay usuario autenticado');
    if (!selectedEventId) throw new Error('Selecciona un evento para exportar');
    const attendees = await AttendeeService.getOrganizerAttendees(user.id, selectedEventId);
    if (!attendees || attendees.length === 0) {
      throw new Error('No hay asistentes para este evento');
    }
    return attendees;
  };

  // Normaliza clave de tipo de entrada para coincidir nombres/tipos con o sin mayúsculas
  const normalizeTicketKey = (raw?: string | null) => {
    return (raw || 'general').toString().trim().toLowerCase();
  };

  // Calcula ingresos reales por tipo de entrada (considerando descuentos) para un evento específico
  const calculateTicketRevenue = async (eventId: string) => {
    if (!user?.id) return {};
    try {
      const attendees = await AttendeeService.getOrganizerAttendees(user.id, eventId);
      const revenueMap: Record<string, number> = {};
      // Agrupar por purchaseId para evitar contar múltiples veces la misma compra
      const purchaseMap = new Map<string, { totalPaid: number; quantity: number; ticketType: string }>();

      // Primero, agrupar por compra para obtener el total pagado por compra
      attendees.forEach((att) => {
        const qty = att.purchaseQuantity && att.purchaseQuantity > 0 ? att.purchaseQuantity : 1;
        const ticketKey = normalizeTicketKey(att.ticketType);
        const totalPaid = typeof att.purchaseTotalPaid === 'number' ? att.purchaseTotalPaid : (att.ticketPrice || 0) * qty;

        // Si tiene purchaseId, agrupamos para evitar contarla varias veces
        if (att.purchaseId) {
          if (!purchaseMap.has(att.purchaseId)) {
            purchaseMap.set(att.purchaseId, {
              totalPaid,
              quantity: qty,
              ticketType: ticketKey
            });
          }
          return;
        }

        // Si no hay purchaseId (caso legacy/fallback), contamos el ingreso individualmente
        if (!revenueMap[ticketKey]) revenueMap[ticketKey] = 0;
        revenueMap[ticketKey] += totalPaid;
      });

      // Ahora calcular ingresos por tipo de entrada agrupados por purchaseId
      purchaseMap.forEach((purchase) => {
        const ticketKey = normalizeTicketKey(purchase.ticketType);
        // El precio por ticket es el total pagado dividido por la cantidad
        // Esto ya incluye descuentos porque totalPaid es el valor neto pagado
        const totalRevenueForThisPurchase = purchase.totalPaid; // Total de la compra

        if (!revenueMap[ticketKey]) revenueMap[ticketKey] = 0;
        revenueMap[ticketKey] += totalRevenueForThisPurchase;
      });

      return revenueMap;
    } catch (e) {
      console.error('Error calculando ingresos por tipo de entrada:', e);
      return {};
    }
  };

  const exportToExcel = async (sheets: Array<{ name: string; rows: Record<string, any>[] }>, fileName: string) => {
    const XLSX = await import('xlsx');
    const workbook = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const sanitizedRows = sheet.rows.length > 0 ? sheet.rows : [{ Nota: 'Sin datos disponibles' }];
      const worksheet = XLSX.utils.json_to_sheet(sanitizedRows);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
    });

    XLSX.writeFile(workbook, fileName);
  };

  const exportTablesToPdf = async (
    title: string,
    tables: Array<{ headers: string[]; rows: Array<Array<string | number>> }>,
    fileName: string
  ) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    // Configuración de colores (igual que en administrador)
    const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo
    const secondaryColor: [number, number, number] = [99, 102, 241]; // Indigo claro

    // Encabezado principal
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('EventHub - Sistema de Gestión de Eventos', 105, 25, { align: 'center' });

    // Información de fecha
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 20, 45);

    let startY = 55;
    tables.forEach((table, index) => {
      if (startY > 250) {
        doc.addPage();
        startY = 20;
      }

      const tableRows = table.rows.length > 0 ? table.rows : [['Sin datos', '—']];
      const fillColor = index === 0 ? primaryColor : secondaryColor;

      autoTable(doc, {
        startY,
        head: [table.headers],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: fillColor,
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10
        },
        styles: { fontSize: 9 }
      });
      const lastTable = (doc as any).lastAutoTable;
      startY = lastTable?.finalY ? lastTable.finalY + 15 : startY + 15;
    });

    // Pie de página en todas las páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `EventHub © ${new Date().getFullYear()} - Página ${i} de ${pageCount}`,
        105,
        290,
        { align: 'center' }
      );
    }

    doc.save(fileName);
  };

  const buildTicketBreakdown = (attendees: AttendeeRow[]) => {
    const map = new Map<string, { ticketType: string; asistentes: number; escaneados: number; revenue: number }>();

    attendees.forEach((att) => {
      const key = att.ticketType || 'Sin tipo';
      const current = map.get(key) || { ticketType: key, asistentes: 0, escaneados: 0, revenue: 0 };
      current.asistentes += 1;
      if (att.estado_qr === 'usado') current.escaneados += 1;
      current.revenue += revenuePerAttendee(att);
      map.set(key, current);
    });

    return Array.from(map.values());
  };

  const handleExportAttendanceReport = async (
    type: 'event' | 'general' | 'financial',
    format: 'pdf' | 'excel'
  ) => {
    try {
      setIsExportingReport(`${type}-${format}`);
      const attendees = await fetchAttendeesForSelectedEvent();
      const eventTitle = selectedEvent?.title || attendees[0]?.eventTitle || 'evento';
      const fileSafeTitle = eventTitle.replace(/[^a-zA-Z0-9-_]+/g, '_');

      const total = attendees.length;
      const checkedIn = attendees.filter((a) => a.estado_qr === 'usado').length;
      const pending = attendees.filter((a) => a.estado_qr === 'activo').length;
      const canceled = attendees.filter((a) => a.estado_qr === 'cancelado' || a.estado_qr === 'expirado').length;
      const ticketBreakdown = buildTicketBreakdown(attendees);

      if (type === 'event') {
        const rows = attendees.map((a) => ({
          Evento: eventTitle,
          Nombre: a.name || 'Sin nombre',
          Correo: a.email || 'Sin correo',
          Estado: a.estado_qr,
          'Tipo de entrada': a.ticketType || 'N/A',
          Precio: revenuePerAttendee(a),
          'N.º Orden': a.purchaseOrderNumber || '—',
          'Fecha compra': formatDateTime(a.purchaseDate),
          'Fecha escaneo': a.fecha_escaneado ? formatDateTime(a.fecha_escaneado) : 'No escaneado'
        }));

        if (format === 'excel') {
          await exportToExcel([{ name: 'Asistentes', rows }], `reporte_evento_${fileSafeTitle}.xlsx`);
        } else {
          await exportTablesToPdf(
            `Reporte por evento - ${eventTitle}`,
            [
              {
                headers: ['Nombre', 'Correo', 'Estado', 'Entrada', 'Orden', 'Compra', 'Escaneo'],
                rows: rows.map((r) => [
                  r.Nombre,
                  r.Correo,
                  r.Estado,
                  r['Tipo de entrada'],
                  r['N.º Orden'],
                  r['Fecha compra'],
                  r['Fecha escaneo']
                ])
              }
            ],
            `reporte_evento_${fileSafeTitle}.pdf`
          );
        }
      } else if (type === 'general') {
        const summaryRows = [
          { Indicador: 'Total asistentes', Valor: total },
          { Indicador: 'Check-ins', Valor: checkedIn },
          { Indicador: 'Pendientes', Valor: pending },
          { Indicador: 'Cancelados / expirados', Valor: canceled },
          { Indicador: 'Tasa de asistencia', Valor: total > 0 ? `${Math.round((checkedIn / total) * 100)}%` : '0%' }
        ];

        if (format === 'excel') {
          await exportToExcel(
            [
              { name: 'Resumen', rows: summaryRows },
              {
                name: 'Por tipo de entrada',
                rows: ticketBreakdown.map((t) => ({
                  'Tipo de entrada': t.ticketType,
                  Asistentes: t.asistentes,
                  Escaneados: t.escaneados,
                  Participacion: total > 0 ? `${((t.asistentes / total) * 100).toFixed(1)}%` : '0%'
                }))
              }
            ],
            `estadisticas_generales_${fileSafeTitle}.xlsx`
          );
        } else {
          await exportTablesToPdf(
            `Estadísticas de asistencia - ${eventTitle}`,
            [
              {
                headers: ['Indicador', 'Valor'],
                rows: summaryRows.map((r) => [r.Indicador, String(r.Valor)])
              },
              {
                headers: ['Tipo de entrada', 'Asistentes', 'Escaneados', 'Participación'],
                rows: ticketBreakdown.map((t) => [
                  t.ticketType,
                  t.asistentes,
                  t.escaneados,
                  total > 0 ? `${((t.asistentes / total) * 100).toFixed(1)}%` : '0%'
                ])
              }
            ],
            `estadisticas_generales_${fileSafeTitle}.pdf`
          );
        }
      } else {
        const totalRevenue = attendees.reduce((sum, a) => sum + revenuePerAttendee(a), 0);
        const validatedRevenue = attendees
          .filter((a) => a.estado_qr === 'usado')
          .reduce((sum, a) => sum + revenuePerAttendee(a), 0);
        const pendingRevenue = totalRevenue - validatedRevenue;

        const financialRows = [
          { Indicador: 'Total vendido', Valor: formatCurrency(totalRevenue) },
          { Indicador: 'Ingresos validados (check-in)', Valor: formatCurrency(validatedRevenue) },
          { Indicador: 'Ingresos pendientes', Valor: formatCurrency(pendingRevenue) },
          { Indicador: 'Asistentes con check-in', Valor: checkedIn },
          { Indicador: 'Asistentes sin escanear', Valor: pending },
          { Indicador: 'Ticket promedio', Valor: formatCurrency(total > 0 ? totalRevenue / total : 0) }
        ];

        if (format === 'excel') {
          await exportToExcel(
            [
              { name: 'Resumen financiero', rows: financialRows },
              {
                name: 'Ingresos por entrada',
                rows: ticketBreakdown.map((t) => ({
                  'Tipo de entrada': t.ticketType,
                  Asistentes: t.asistentes,
                  Escaneados: t.escaneados,
                  'Ingreso estimado': Number(t.revenue.toFixed(2))
                }))
              }
            ],
            `reporte_financiero_${fileSafeTitle}.xlsx`
          );
        } else {
          await exportTablesToPdf(
            `Reporte financiero - ${eventTitle}`,
            [
              {
                headers: ['Indicador', 'Valor'],
                rows: financialRows.map((r) => [r.Indicador, String(r.Valor)])
              },
              {
                headers: ['Tipo de entrada', 'Asistentes', 'Escaneados', 'Ingreso estimado'],
                rows: ticketBreakdown.map((t) => [
                  t.ticketType,
                  t.asistentes,
                  t.escaneados,
                  formatCurrency(t.revenue)
                ])
              }
            ],
            `reporte_financiero_${fileSafeTitle}.pdf`
          );
        }
      }

      setToastMessage('Reporte generado correctamente');
      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Error al exportar reporte:', error);
      setToastMessage(error?.message || 'No se pudo generar el reporte');
      setShowErrorToast(true);
    } finally {
      setIsExportingReport(null);
    }
  };

  const handleCreateEvent = async (formData: CreateEventFormData) => {
    if (!user?.id) {
      setToastMessage('Debes iniciar sesión para crear eventos');
      setShowErrorToast(true);
      return;
    }

    setIsCreatingEvent(true);

    try {
      // Subir imagen si el usuario adjuntó una
      let imageUrl = 'https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg';
      if (formData.image) {
        try {
          imageUrl = await StorageService.uploadImage(formData.image as File);
        } catch (uploadError: any) {
          console.error('No se pudo subir la imagen, usando placeholder:', uploadError);
          setToastMessage(uploadError?.message || 'No se pudo subir la imagen, usando imagen por defecto');
          setShowErrorToast(true);
        }
      }

      const nuevoEvento = {
        titulo: formData.title.trim(),
        descripcion: formData.description.trim(),
        url_imagen: imageUrl,
        fecha_evento: formData.date,
        hora_evento: formData.time,
        ubicacion: `${formData.city}, ${formData.country}`,
        categoria: 'General',
        maximo_asistentes: formData.maxAttendees,
        asistentes_actuales: 0,
        id_organizador: user.id,
        nombre_organizador: user.name || 'Organizador',
        estado: 'publicado',
        etiquetas: []
      } as any;

      const createdEvent = await EventService.crearEvento(nuevoEvento);

      await TicketTypeService.crearTipoEntrada({
        id_evento: createdEvent.id,
        nombre_tipo: 'General',
        tipo: 'general',
        precio: formData.ticketPrice ?? 0,
        descripcion: 'Entrada general',
        cantidad_maxima: formData.maxAttendees,
        cantidad_disponible: formData.maxAttendees
      });

      await handleRefresh();
      setIsCreateEventModalOpen(false);
      setToastMessage('Evento creado exitosamente');
      setShowSuccessToast(true);
    } catch (error: any) {
      console.error('Error al crear evento:', error);
      setToastMessage(error?.message || 'No se pudo crear el evento');
      setShowErrorToast(true);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleCreateTicket = async (formData: CreateTicketFormData) => {
    setIsCreatingTicket(true);
    try {
      if (!selectedEvent) throw new Error('No hay evento seleccionado');

      // Construir el objeto para la tabla tipos_entrada
      const datosTipo = {
        id_evento: selectedEvent.id,
        nombre_evento: selectedEvent.title,
        nombre_tipo: formData.name,
        tipo: formData.type,
        precio: formData.price,
        descripcion: formData.description,
        cantidad_maxima: formData.available,
        cantidad_disponible: formData.available,
        // Puedes agregar más campos si la tabla lo permite
      };

      // Crear tipo de entrada en Supabase
      await TicketTypeService.crearTipoEntrada(datosTipo);

      // Cerrar modal y mostrar éxito
      setIsCreateTicketModalOpen(false);
      console.log('Tipo de entrada creado exitosamente');
      await handleRefresh();
    } catch (error) {
      console.error('Error al crear tipo de entrada:', error);
      // TODO: Implementar un toast de error
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleCreatePromotion = async () => {
    await loadPromotions();
  };

  const handleCreatePaymentMethod = async (formData: CreatePaymentMethodFormData) => {
    setIsCreatingPaymentMethod(true);

    try {
      if (!user?.id) {
        throw new Error('No hay usuario autenticado');
      }

      // Convertir los datos del formulario al formato de la base de datos
      const datosMetodoPago: any = {
        nombre: formData.name,
        tipo: formData.type,
        proveedor: formData.provider,
        descripcion: formData.description,
        activo: formData.isActive,
        comision_porcentaje: formData.processingFee,
        comision_fija: formData.fixedFee,
        monto_minimo: formData.minAmount,
        monto_maximo: formData.maxAmount,
        monedas_soportadas: formData.supportedCurrencies,
        requiere_verificacion: formData.requiresVerification,
        tiempo_procesamiento: formData.processingTime,
        configuracion: {
          apiKey: formData.configuration.apiKey,
          merchantId: formData.configuration.merchantId,
          publicKey: formData.configuration.publicKey,
          secretKey: formData.configuration.secretKey,
          webhookUrl: formData.configuration.webhookUrl,
          sandboxMode: formData.configuration.sandboxMode
        },
        id_organizador: user.id,
      };

      // Crear el método de pago usando el servicio real de Supabase
      // Asignar al evento si hay uno seleccionado
      const metodoPagoCreado: any = await PaymentMethodService.crearMetodoPago({
        ...datosMetodoPago,
        id_evento: selectedEventId || null
      });

      // Cerrar modal
      setIsCreatePaymentMethodModalOpen(false);

      // Refrescar métodos de pago (evitar recargar todo el dashboard)
      await loadPaymentMethods();

      // Mostrar mensaje de éxito
      setToastMessage('Método de pago creado exitosamente');
      setShowSuccessToast(true);

    } catch (error: any) {
      console.error('❌ Error al crear método de pago:', error);

      // Mostrar mensaje de error al usuario
      const errorMessage = error.message || 'Error al crear el método de pago';
      alert(`❌ Error: ${errorMessage}`);

      // Re-lanzar el error para que el modal lo maneje si es necesario
      throw error;
    } finally {
      setIsCreatingPaymentMethod(false);
    }
  };

  const handleUploadImage = (eventId: string) => {
    // Validar que no sea un evento mock
    if (eventId.startsWith('org-')) {
      console.error('No se puede actualizar imagen de eventos mock. Por favor crea un evento real primero.');
      alert('No puedes actualizar imágenes de eventos de ejemplo. Por favor crea un evento real desde "Crear Evento".');
      return;
    }

    // Encontrar el evento seleccionado
    const event = finalEvents.find(e => e.id === eventId);
    if (event) {
      console.log('Abriendo modal para subir imagen del evento:', event);
      setSelectedEventForImage({
        id: event.id,
        title: event.title,
        currentImage: event.image
      });
      setIsUploadImageModalOpen(true);
    }
  };

  const handleImageUploaded = async (imageUrl: string) => {
    if (!selectedEventForImage) return;

    try {
      // Actualizar la imagen del evento en la base de datos
      await EventService.actualizarImagenEvento(selectedEventForImage.id, imageUrl);

      // Refrescar la lista de eventos
      handleRefresh();

      // Cerrar modal
      setIsUploadImageModalOpen(false);
      setSelectedEventForImage(null);

      console.log('Imagen actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar imagen del evento:', error);
    }
  };

  const handleDuplicateEvent = (eventId: string) => {
    console.log('Duplicando evento:', eventId);

    // Validar que no sea un evento mock
    if (eventId.startsWith('org-')) {
      console.error('No se puede duplicar eventos mock');
      alert('No puedes duplicar eventos de ejemplo. Por favor crea un evento real primero.');
      return;
    }

    // Encontrar el evento a duplicar
    const event = finalEvents.find(e => e.id === eventId);
    if (event) {
      console.log('Evento encontrado para duplicar:', event);

      // Convertir al formato que espera el modal
      const eventData = {
        id: event.id,
        titulo: event.title,
        descripcion: event.description,
        url_imagen: event.image,
        fecha_evento: event.date,
        hora_evento: event.time,
        ubicacion: event.location,
        categoria: event.category,
        maximo_asistentes: event.maxAttendees,
        tipos_entrada: (event.ticketTypes || []).map((ticket: any) => ({
          nombre_tipo: ticket.nombre_tipo || ticket.name || 'Sin nombre',
          precio: ticket.precio || ticket.price || 0,
          descripcion: ticket.descripcion || ticket.description || '',
          cantidad_maxima: ticket.cantidad_maxima || ticket.maxQuantity || 0
        }))
      };

      console.log('Datos del evento para modal:', eventData);
      setSelectedEventForDuplication(eventData);
      setIsDuplicateEventModalOpen(true);
    } else {
      console.error('Evento no encontrado:', eventId);
    }
  };

  const handleDuplicateEventConfirm = async (adjustments: {
    titulo?: string;
    fecha_evento?: string;
    hora_evento?: string;
  }) => {
    if (!selectedEventForDuplication) {
      console.warn('⚠️ No hay evento seleccionado para duplicar');
      return;
    }

    try {
      console.log('🔄 Iniciando duplicación con ajustes:', adjustments);
      console.log('📋 Evento a duplicar:', selectedEventForDuplication);

      // Llamar al servicio de duplicación
      const eventoDuplicado = await EventService.duplicarEvento(
        selectedEventForDuplication.id,
        adjustments
      );

      console.log('✅ Evento duplicado exitosamente:', eventoDuplicado);

      // Refrescar la lista de eventos
      console.log('🔄 Refrescando lista de eventos...');
      await handleRefresh();
      console.log('✅ Lista de eventos actualizada');

      // Cerrar modal
      setIsDuplicateEventModalOpen(false);
      setSelectedEventForDuplication(null);
      console.log('✅ Modal cerrado');
    } catch (error) {
      console.error('❌ Error al duplicar evento:', error);
      throw error; // Re-lanzar para que el modal lo maneje
    }
  };

  // Handlers para CRUD de eventos
  const handleViewEvent = async (eventId: string) => {
    console.log('Ver evento:', eventId);
    setIsLoadingEventDetails(true);
    try {
      const eventDetails = await EventService.obtenerEventoCompleto(eventId) as any;
      console.log('Detalles del evento:', eventDetails);
      setSelectedEventForView(eventDetails);
      setIsViewEventModalOpen(true);
    } catch (error) {
      console.error('Error al cargar detalles del evento:', error);
      alert('Error al cargar los detalles del evento');
    } finally {
      setIsLoadingEventDetails(false);
    }
  };

  const handleEditEvent = async (eventId: string) => {
    console.log('Editar evento:', eventId);
    setIsLoadingEventDetails(true);
    try {
      const eventDetails = await EventService.obtenerEventoPorId(eventId);
      console.log('Evento para editar:', eventDetails);
      setSelectedEventForEdit(eventDetails);
      setIsEditEventModalOpen(true);
    } catch (error) {
      console.error('Error al cargar evento para editar:', error);
      alert('Error al cargar el evento');
    } finally {
      setIsLoadingEventDetails(false);
    }
  };

  const handleSaveEventChanges = async (formData: EditEventFormData) => {
    if (!selectedEventForEdit) return;

    try {
      console.log('Guardando cambios:', formData);
      await EventService.actualizarEvento(selectedEventForEdit.id, formData);
      console.log('Evento actualizado exitosamente');
      await handleRefresh();
      setIsEditEventModalOpen(false);
      setSelectedEventForEdit(null);
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      throw error;
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    console.log('Eliminar evento:', eventId);
    setIsLoadingEventDetails(true);
    try {
      const eventDetails: any = await EventService.obtenerEventoCompleto(eventId);
      if (!eventDetails) {
        alert('Evento no encontrado');
        return;
      }
      const comprasCompletadas = eventDetails.compras?.filter((c: any) => c.estado === 'completada') || [];
      const totalVentas = comprasCompletadas.reduce((sum: number, c: any) => sum + Number(c.total_pagado || 0), 0);

      setSelectedEventForDelete({
        id: eventDetails.id,
        titulo: eventDetails.titulo,
        fecha_evento: eventDetails.fecha_evento,
        asistentes_actuales: eventDetails.asistentes_actuales || 0,
        comprasCompletadas: comprasCompletadas.length,
        totalVentas: totalVentas
      });

      setIsDeleteEventModalOpen(true);
    } catch (error) {
      console.error('Error al preparar eliminación:', error);
      alert('Error al cargar información del evento');
    } finally {
      setIsLoadingEventDetails(false);
    }
  };

  const handleConfirmDeleteEvent = async () => {
    if (!selectedEventForDelete) return;

    setIsDeletingEvent(true);
    try {
      console.log('Confirmando eliminación del evento:', selectedEventForDelete.id);
      await EventService.eliminarEvento(selectedEventForDelete.id);
      console.log('Evento eliminado exitosamente');
      await handleRefresh();
      setIsDeleteEventModalOpen(false);
      setSelectedEventForDelete(null);
    } catch (error: any) {
      console.error('Error al eliminar evento:', error);
      alert(error.message || 'Error al eliminar el evento');
    } finally {
      setIsDeletingEvent(false);
    }
  };

  // Handler para configurar evento (cambiar estado)
  const handleConfigureEvent = async (eventId: string) => {
    try {
      setIsLoadingEventDetails(true);
      const evento = await EventService.obtenerEventoPorId(eventId);

      if (!evento) {
        setToastMessage('No se pudo cargar el evento');
        setShowErrorToast(true);
        return;
      }

      setSelectedEventForConfigure(evento);
      setIsConfigureEventModalOpen(true);
    } catch (error: any) {
      console.error('Error al cargar evento para configurar:', error);
      setToastMessage(error.message || 'Error al cargar el evento');
      setShowErrorToast(true);
    } finally {
      setIsLoadingEventDetails(false);
    }
  };

  // Handler para guardar configuración de evento (cambiar estado)
  const handleSaveEventConfiguration = async (newStatus: 'borrador' | 'publicado' | 'pausado' | 'cancelado' | 'finalizado') => {
    if (!selectedEventForConfigure) return;

    try {
      await EventService.cambiarEstadoEvento(selectedEventForConfigure.id, newStatus);

      // Recargar eventos
      await handleRefresh();
      setToastMessage('Estado del evento actualizado correctamente');
      setShowSuccessToast(true);
      setIsConfigureEventModalOpen(false);
      setSelectedEventForConfigure(null);
    } catch (error: any) {
      console.error('Error al cambiar estado del evento:', error);
      throw error; // Re-lanzar para que el modal maneje el error
    }
  };


  const navigationItems = [
    {
      id: 'overview',
      label: 'Panel Principal',
      icon: BarChart3,
      color: 'text-blue-600',
      description: 'Resumen y métricas en tiempo real'
    },
    {
      id: 'events',
      label: 'Gestión de Eventos',
      icon: Calendar,
      color: 'text-purple-600',
      description: 'Crear, editar y gestionar eventos'
    },
    {
      id: 'tickets',
      label: 'Tipos de Entradas',
      icon: Ticket,
      color: 'text-green-600',
      description: 'Configurar entradas y precios'
    },
    {
      id: 'promotions',
      label: 'Descuentos',
      icon: Percent,
      color: 'text-emerald-600',
      description: 'Códigos promocionales y descuentos'
    },
    {
      id: 'payments',
      label: 'Métodos de Pago',
      icon: CreditCard,
      color: 'text-orange-600',
      description: 'Configurar pagos y reconciliación'
    },
    {
      id: 'attendance',
      label: 'Control de Asistencia',
      icon: QrCode,
      color: 'text-pink-600',
      description: 'Escanear QR y reportes de asistencia'
    },
    {
      id: 'attendees',
      label: 'Asistentes',
      icon: Users,
      color: 'text-cyan-600',
      description: 'Gestionar participantes'
    }
  ];

  // Mostrar loader solo en la carga inicial
  if (isInitialLoad && (isLoadingEvents || metricsLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl animate-pulse">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cargando Dashboard</h2>
          <p className="text-gray-600 mb-6">Preparando tus eventos y estadísticas...</p>
          <div className="flex justify-center items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden w-full max-w-full">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'
        } bg-white/90 backdrop-blur-md shadow-xl border-r border-white/20 transition-all duration-300 flex-shrink-0 fixed left-0 top-0 h-dvh md:h-full z-30 md:z-40 ${!isSidebarOpen ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}>
        {/* Sidebar Header */}
        <div className={`h-16 flex-shrink-0 flex items-center ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-2'} bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm`}>
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">EventHub</h1>
                <p className="text-xs text-blue-100">Panel de Organizador</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 text-white border border-white/20"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation - Scrollable Area */}
        <nav className={`${isSidebarOpen ? 'p-4' : 'px-0 py-4 flex flex-col items-center'} space-y-2 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${isSidebarOpen
                  ? 'w-full flex items-start space-x-3 px-4 py-3 rounded-xl'
                  : 'w-12 h-12 flex items-center justify-center rounded-lg'
                  } backdrop-blur-sm transition-all duration-200 ${activeTab === item.id
                    ? (isSidebarOpen
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-l-4 border-indigo-400 shadow-lg border border-white/30'
                      : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20')
                    : (isSidebarOpen
                      ? 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-blue-700 hover:border-l-4 hover:border-indigo-300 hover:shadow-lg hover:border hover:border-indigo-200/30'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10')
                  }`}
              >
                {isSidebarOpen ? (
                  <>
                    <div className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-200 ${activeTab === item.id
                      ? 'bg-white/30 border-white/40'
                      : 'bg-white/10 border-white/20 hover:bg-blue-100/50 hover:border-blue-300/50'
                      }`}>
                      <Icon className={`w-4 h-4 transition-colors duration-200 ${activeTab === item.id
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-600'
                        }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">{item.label}</span>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">{item.description}</p>
                    </div>
                  </>
                ) : (
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${activeTab === item.id
                    ? 'text-blue-600'
                    : 'text-gray-500 hover:text-blue-600'
                    }`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button in Sidebar - Fixed at Bottom */}
        <div className={`${isSidebarOpen ? 'p-4' : 'pb-4 flex justify-center'} flex-shrink-0 border-t border-gray-200/50`}>
          <button
            onClick={handleLogout}
            className={`${isSidebarOpen
              ? 'w-full flex items-center justify-center space-x-2 p-3'
              : 'w-12 h-12 flex items-center justify-center'
              } bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-700 rounded-xl border border-red-200 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md`}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="text-sm font-medium">Cerrar Sesión</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        } ${!isSidebarOpen ? 'ml-0' : 'ml-0'
        }`}>
        {/* Top Header */}
        <div className={`fixed top-0 right-0 z-20 bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl transition-all duration-300 ${isSidebarOpen ? 'md:left-64' : 'md:left-16'
          } left-0`}>
          <div className="h-16 flex items-center justify-between px-3 md:px-6 gap-2 md:gap-4">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              {/* Hamburger Menu Button for Mobile */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 text-white border border-white/20"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-2xl font-bold text-white truncate">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Panel Principal'}
                  </h2>
                  {selectedEvent && (
                    <div className="mt-1 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs md:text-sm text-green-100 font-medium truncate">
                        {selectedEvent.title}
                      </span>
                      <span className="hidden lg:inline text-xs text-blue-200">
                        ({selectedEvent.status === 'upcoming' ? 'Próximo' :
                          selectedEvent.status === 'ongoing' ? 'En curso' :
                            selectedEvent.status === 'completed' ? 'Completado' :
                              selectedEvent.status === 'cancelled' ? 'Cancelado' :
                                selectedEvent.status === 'paused' ? 'Pausado' :
                                  selectedEvent.status === 'draft' ? 'Borrador' : 'Próximo'})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 md:space-x-3 flex-shrink-0">
              {/* Event Selector */}
              {finalEvents.length > 0 ? (
                <div className="relative w-8 h-8 md:w-auto md:h-auto">
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="appearance-none w-full h-full md:h-auto bg-white/20 backdrop-blur-sm border border-white/30 rounded-md md:rounded-xl text-transparent md:text-white text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 cursor-pointer px-1 md:px-4 py-1 md:py-2 pr-1 md:pr-10"
                  >
                    {finalEvents.map(event => (
                      <option key={event.id} value={event.id} className="text-gray-900">
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <Calendar className="absolute left-1/2 top-1/2 md:right-3 md:left-auto md:top-1/2 transform -translate-x-1/2 -translate-y-1/2 md:transform md:-translate-y-1/2 w-4 h-4 md:w-4 md:h-4 text-white pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-xl">
                  <Calendar className="w-4 h-4 text-yellow-200" />
                  <span className="text-yellow-200 text-xs md:text-sm font-medium hidden sm:inline">Sin eventos</span>
                </div>
              )}

              {/* Profile Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 md:space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">{user?.name || 'Organizador'}</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || 'Organizador'}</p>
                      <p className="text-xs text-gray-500">{user?.email || 'organizador@eventhub.com'}</p>
                    </div>

                    <div
                      onClick={() => {
                        console.log('Click en Mi Perfil');
                        setIsProfileMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer transition-colors duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </div>

                    <div
                      onClick={() => {
                        console.log('Click en Cerrar Sesión');
                        setIsProfileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto bg-gray-100 mt-16 w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 box-border" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Content Header */}
          <div className="mb-4 md:mb-6 w-full max-w-full px-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                {navigationItems.find(item => item.id === activeTab)?.description}
              </p>
            </div>
          </div>
          {/* Action Buttons - Removed from.*Layout.layout */}

          {/* Content Cards */}
          <div className="space-y-4 w-full max-w-full">
            {activeTab === 'overview' && (
              <>
                {metricsLoading && (
                  <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <p className="text-sm text-gray-600">Cargando métricas...</p>
                  </div>
                )}
                {metricsError && (
                  <div className="bg-red-50 rounded-xl p-6 shadow-md border border-red-200">
                    <p className="text-sm text-red-600">{metricsError}</p>
                    <button
                      onClick={loadMetrics}
                      className="mt-2 inline-flex items-center px-3 py-2 bg-red-600 text-white rounded-md text-xs"
                    >Reintentar</button>
                  </div>
                )}
                {!metricsLoading && !metricsError && (
                  <OrganizerDashboardContent
                    stats={quickStats}
                    onCreateEvent={() => {
                      setActiveTab('events');
                      setIsCreateEventModalOpen(true);
                    }}
                    onNavigateToTab={setActiveTab}
                    formatRevenue={formatRevenue}
                    recentActivity={recentActivity}
                    onViewAllActivity={() => setIsAllActivityModalOpen(true)}
                    onRefresh={handleRefresh}
                    isRefreshing={isRefreshing}
                  />
                )}
              </>
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                {/* Mensaje si no hay eventos reales */}
                {!isLoadingEvents && finalEvents.length === 0 && (
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes eventos creados</h3>
                    <p className="text-gray-600 mb-6">
                      Comienza creando tu primer evento para gestionar entradas, promociones y asistentes.
                    </p>
                    <button
                      onClick={() => setIsCreateEventModalOpen(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Primer Evento
                    </button>
                  </div>
                )}

                {/* Loading state */}
                {isLoadingEvents && (
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-8 text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Cargando eventos...</p>
                  </div>
                )}

                {/* Event Management Actions - Solo mostrar si hay eventos */}
                {!isLoadingEvents && finalEvents.length > 0 && (
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Gestión de Eventos</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={handleRefresh}
                          disabled={isRefreshing}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <RefreshCw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                          <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                        </button>
                        <button
                          onClick={() => setIsCreateEventModalOpen(true)}
                          className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm text-sm"
                        >
                          <Plus className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Nuevo</span>
                        </button>
                      </div>
                    </div>

                    <EventManagementAdvanced
                      events={selectedEvent ? [{
                        ...selectedEvent,
                        revenue: selectedEvent.price || 0,
                        views: Math.floor(Math.random() * 1000),
                        conversionRate: Math.random() * 10,
                        ticketTypes: (selectedEvent.ticketTypes || []).map((t: any) => ({
                          id: t.id,
                          name: t.nombre_tipo || t.name || 'Sin nombre',
                          price: t.precio || t.price || 0,
                          available: t.cantidad_disponible || t.available || 0,
                          sold: (t.cantidad_maxima || t.maxQuantity || 0) - (t.cantidad_disponible || t.available || 0)
                        })),
                        status: selectedEvent.status === 'draft' ? 'draft'
                          : selectedEvent.status === 'paused' ? 'paused'
                            : selectedEvent.status === 'cancelled' ? 'cancelled'
                              : selectedEvent.status === 'completed' ? 'completed'
                                : 'published' // upcoming/ongoing → published
                      }] : []}
                      onCreateEvent={() => setIsCreateEventModalOpen(true)}
                      onEditEvent={handleEditEvent}
                      onViewEvent={handleViewEvent}
                      onDeleteEvent={handleDeleteEvent}
                      onDuplicateEvent={handleDuplicateEvent}
                      onUploadImage={handleUploadImage}
                      onCustomizeEvent={handleConfigureEvent}
                    />
                  </>
                )}
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                {/* Ticket Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Gestión de Entradas {selectedEvent && `- ${selectedEvent.title}`}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                    </button>
                    <button
                      onClick={() => setIsCreateTicketModalOpen(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Nueva</span>
                    </button>
                  </div>
                </div>

                <TicketManagement
                  tickets={(selectedEvent?.ticketTypes || []).map((ticket: any) => {
                    const keyRaw = (ticket.type ?? ticket.tipo ?? ticket.name ?? ticket.nombre_tipo ?? 'general') as string;
                    const key = normalizeTicketKey(keyRaw);
                    return {
                      id: ticket.id,
                      name: ticket.name ?? ticket.nombre_tipo ?? 'Sin nombre',
                      description: ticket.description ?? ticket.descripcion ?? '',
                      price: ticket.price ?? ticket.precio ?? 0,
                      available: ticket.available ?? ticket.cantidad_disponible ?? 0,
                      sold: ticket.sold ?? ((ticket.cantidad_maxima || 0) - (ticket.cantidad_disponible || 0)),
                      type: ticket.type ?? ticket.tipo ?? 'general',
                      revenue: ticketRevenueByType[key] ?? undefined,
                      isActive: true,
                      features: ticket.features ?? [],
                      eventId: selectedEvent.id
                    };
                  })}
                  onCreateTicket={() => setIsCreateTicketModalOpen(true)}
                  onEditTicket={handleEditTicket}
                  onDeleteTicket={handleDeleteTicket}
                  onDuplicateTicket={handleDuplicateTicket}
                  onToggleTicket={(ticketId) => { }}
                  onViewAnalytics={handleViewTicket}
                />
                {/* Modales CRUD de tipo de entrada */}
                <ViewTicketModal
                  isOpen={isViewTicketModalOpen}
                  onClose={closeTicketModals}
                  ticket={selectedTicket}
                />
                <EditTicketModal
                  isOpen={isEditTicketModalOpen}
                  onClose={closeTicketModals}
                  ticket={selectedTicket}
                  onSave={async () => { await handleRefresh(); closeTicketModals(); }}
                />
                <DuplicateTicketModal
                  isOpen={isDuplicateTicketModalOpen}
                  onClose={closeTicketModals}
                  ticket={selectedTicket}
                  onDuplicate={async () => { await handleRefresh(); closeTicketModals(); }}
                />
                <DeleteTicketModal
                  isOpen={isDeleteTicketModalOpen}
                  onClose={closeTicketModals}
                  ticket={selectedTicket}
                  onDelete={async () => { await handleRefresh(); closeTicketModals(); }}
                />
              </div>
            )}

            {activeTab === 'promotions' && (
              <div className="space-y-6">
                {/* Promotion Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Gestión de Promociones {selectedEvent && `- ${selectedEvent.title}`}
                    </h3>
                    {selectedEvent && (
                      <p className="text-sm text-gray-600 mt-1">
                        Códigos de descuento y promociones para este evento
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 sm:mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                    </button>
                    <button
                      onClick={() => setIsCreatePromotionModalOpen(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Nuevo</span>
                    </button>
                  </div>
                </div>

                <PromotionManagement
                  promotions={promotions.map((promo: any) => ({
                    id: promo.id,
                    code: promo.codigo,
                    name: promo.codigo, // Usar código como nombre por ahora
                    description: promo.descripcion,
                    type: promo.tipo_descuento === 'porcentaje' ? 'percentage' : 'fixed',
                    value: promo.valor_descuento,
                    usageLimit: promo.uso_maximo,
                    usedCount: promo.usos_actuales,
                    isActive: promo.activo,
                    startDate: promo.fecha_inicio,
                    endDate: promo.fecha_fin,
                    applicableEvents: promo.id_evento ? [promo.id_evento] : [],
                    applicableTicketTypes: [],
                    maxUsesPerUser: 1,
                    isPublic: true,
                    createdDate: promo.created_at
                  }))}
                  onCreatePromotion={() => setIsCreatePromotionModalOpen(true)}
                  onEditPromotion={handleEditPromotion}
                  onDeletePromotion={handleDeletePromotion}
                  onDuplicatePromotion={handleDuplicatePromotion}
                  onTogglePromotion={(promotionId) => console.log('Toggle promotion:', promotionId)}
                  onViewAnalytics={handleViewPromotion}
                />
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                {/* Payment Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago y Reconciliación</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                    </button>
                    <button
                      onClick={() => setIsCreatePaymentMethodModalOpen(true)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Nuevo</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Methods */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3 md:mb-4">
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">Métodos de Pago</h4>
                      {isLoadingPaymentMethods && (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      )}
                    </div>

                    {isLoadingPaymentMethods ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">Cargando métodos de pago...</p>
                        </div>
                      </div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="text-center py-8">
                        <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500 mb-2">No hay métodos de pago configurados</p>
                        <p className="text-xs text-gray-400">Haz clic en "Nuevo" para agregar tu primer método de pago</p>
                      </div>
                    ) : (
                      <div className="space-y-3 md:space-y-4">
                        {paymentMethods.map((method) => {
                          const getPaymentMethodIcon = (tipo: string) => {
                            switch (tipo) {
                              case 'credit_card':
                              case 'debit_card':
                                return CreditCard;
                              case 'digital_wallet':
                                return Wallet;
                              case 'bank_transfer':
                                return Receipt;
                              case 'cash':
                                return Receipt;
                              case 'crypto':
                                return Receipt;
                              default:
                                return CreditCard;
                            }
                          };

                          const getPaymentMethodColor = (tipo: string) => {
                            switch (tipo) {
                              case 'credit_card':
                              case 'debit_card':
                                return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' };
                              case 'digital_wallet':
                                return { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' };
                              case 'bank_transfer':
                                return { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' };
                              case 'cash':
                                return { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' };
                              case 'crypto':
                                return { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' };
                              default:
                                return { bg: 'bg-gray-50', border: 'border-gray-200', icon: 'text-gray-600' };
                            }
                          };

                          const Icon = getPaymentMethodIcon(method.tipo);
                          const colors = getPaymentMethodColor(method.tipo);

                          return (
                            <div key={method.id} className={`p-3 md:p-4 ${colors.bg} rounded-lg border ${colors.border} hover:shadow-md transition-shadow`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                                  <Icon className={`w-4 h-4 md:w-5 md:h-5 ${colors.icon} flex-shrink-0`} />
                                  <div className="min-w-0 flex-1">
                                    <h5 className="font-medium text-gray-900 text-xs md:text-sm truncate">{method.nombre}</h5>
                                    <p className="text-xs md:text-sm text-gray-600 truncate">{method.proveedor} • {method.comision_porcentaje.toFixed(1)}% comisión</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${method.activo
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {method.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const newState = openPaymentMethodDropdown === method.id ? null : method.id;
                                        console.log('📋 DROPDOWN: Cambiando estado dropdown para método:', method.id, 'nuevo estado:', newState);
                                        setOpenPaymentMethodDropdown(newState);
                                      }}
                                      className="p-1 hover:bg-white/50 rounded-full transition-colors"
                                      title="Más opciones"
                                      data-dropdown-button="true"
                                    >
                                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                      </svg>
                                    </button>
                                    {/* Menú desplegable dinámico */}
                                    <div className={`dropdown-menu ${openPaymentMethodDropdown === method.id ? 'block' : 'hidden'
                                      } absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50`}
                                      style={{ zIndex: 9999, pointerEvents: 'auto' }}
                                      onClick={() => console.log('📋 DROPDOWN CLICK: Click en el dropdown')}>
                                      {openPaymentMethodDropdown === method.id && (() => {
                                        console.log('🎨 DROPDOWN RENDER: Renderizando dropdown para método:', method.id);
                                        return null;
                                      })()}
                                      <div className="py-1">
                                        <button
                                          onClick={(e) => {
                                            console.log('👁️ CLICK VIEW BUTTON: Ver detalles clickeado para:', method.id);
                                            e.stopPropagation();
                                            handleViewPaymentMethod(method.id);
                                            setOpenPaymentMethodDropdown(null);
                                          }}
                                          onMouseDown={() => console.log('🖱️ MOUSEDOWN VIEW: MouseDown en Ver')}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                          style={{ pointerEvents: 'auto', zIndex: 9999 }}
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          <span>Ver detalles</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            console.log('✏️ CLICK EDIT BUTTON: Editar clickeado para:', method.id);
                                            handleEditPaymentMethod(method.id);
                                            setOpenPaymentMethodDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          <span>Editar</span>
                                        </button>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                          onClick={() => {
                                            console.log('🔴 CLICK DELETE BUTTON: Botón eliminar clickeado para método:', method.id);
                                            handleDeletePaymentMethod(method.id);
                                            setOpenPaymentMethodDropdown(null);
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          <span>Eliminar</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reconciliation Reports */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Estadísticas de Métodos de Pago</h4>
                    {!selectedEventId ? (
                      <p className="text-sm text-gray-500">Selecciona un evento para ver sus métodos.</p>
                    ) : isLoadingEventPaymentStats ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>Cargando estadísticas...</div>
                    ) : !eventPaymentStats ? (
                      <p className="text-sm text-gray-500">Sin métodos de pago en este evento.</p>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs md:text-sm">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500">Total</p>
                            <p className="font-semibold text-gray-900">{eventPaymentStats.total}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500">Activos</p>
                            <p className="font-semibold text-green-600">{eventPaymentStats.activos}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500">Inactivos</p>
                            <p className="font-semibold text-red-600">{eventPaymentStats.inactivos}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-gray-500">Tipos</p>
                            <p className="font-semibold text-indigo-600">{Object.keys(eventPaymentStats.porTipo).length}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {paymentMethods.map(m => {
                            const stats = eventPaymentStats.uso.find((u: any) => u.id === m.id);
                            return (
                              <div key={m.id} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2 text-xs md:text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-800">{m.nombre}</span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-100 text-indigo-700">{m.tipo}</span>
                                  {!m.activo && <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-100 text-red-700">Inactivo</span>}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] md:text-xs text-gray-500">
                                  <span>Uso: {stats?.porcentaje?.toFixed(1) || 0}%</span>
                                  <span>Tx: {stats?.transacciones || 0}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-[11px] text-gray-400">Para registrar uso, asigna método de pago al crear compra.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-6">
                {/* Attendance Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Control de Asistencia</h3>
                  </div>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* QR Code Scanner */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Escáner QR</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium text-gray-900">Estado del Escáner</h5>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm text-green-600">Activo</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Escanea códigos QR de las entradas para registrar asistencia en tiempo real
                        </p>
                        <button
                          onClick={() => setIsQRScannerOpen(true)}
                          className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Activar Cámara
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Stats */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Estadísticas de Asistencia</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{attendanceStats.attendanceRate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-600">Tasa de Asistencia</div>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{attendanceStats.checkedIn}</div>
                          <div className="text-sm text-gray-600">Asistentes Registrados</div>
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Últimos Escaneos</h5>
                        <div className="space-y-2 text-sm">
                          {attendanceStats.recentScans.length > 0 ? (
                            attendanceStats.recentScans.map((scan, index) => (
                              <div key={index} className="flex justify-between">
                                <span>{scan.name}</span>
                                <span className="text-green-600">{scan.time}</span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center text-gray-500 py-2">
                              No hay escaneos recientes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Reports */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Reportes de Asistencia</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-gray-900 mb-2">Reporte por Evento</h5>
                      <p className="text-sm text-gray-600 mb-3">Lista detallada de asistentes por evento</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleExportAttendanceReport('event', 'pdf')}
                          disabled={!selectedEventId || isExportingReport === 'event-pdf'}
                          className="px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          {isExportingReport === 'event-pdf' ? 'Generando...' : 'PDF'}
                        </button>
                        <button
                          onClick={() => handleExportAttendanceReport('event', 'excel')}
                          disabled={!selectedEventId || isExportingReport === 'event-excel'}
                          className="px-3 py-2 bg-white text-blue-700 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          {isExportingReport === 'event-excel' ? 'Generando...' : 'Excel'}
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">Estadísticas Generales</h5>
                      <p className="text-sm text-gray-600 mb-3">Métricas y análisis de asistencia</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleExportAttendanceReport('general', 'pdf')}
                          disabled={!selectedEventId || isExportingReport === 'general-pdf'}
                          className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          {isExportingReport === 'general-pdf' ? 'Generando...' : 'PDF'}
                        </button>
                        <button
                          onClick={() => handleExportAttendanceReport('general', 'excel')}
                          disabled={!selectedEventId || isExportingReport === 'general-excel'}
                          className="px-3 py-2 bg-white text-green-700 border border-green-200 rounded-xl hover:bg-green-50 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          {isExportingReport === 'general-excel' ? 'Generando...' : 'Excel'}
                        </button>
                      </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-medium text-gray-900 mb-2">Reporte Financiero</h5>
                      <p className="text-sm text-gray-600 mb-3">Reconciliación de ingresos vs asistencia</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleExportAttendanceReport('financial', 'pdf')}
                          disabled={!selectedEventId || isExportingReport === 'financial-pdf'}
                          className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          {isExportingReport === 'financial-pdf' ? 'Generando...' : 'PDF'}
                        </button>
                        <button
                          onClick={() => handleExportAttendanceReport('financial', 'excel')}
                          disabled={!selectedEventId || isExportingReport === 'financial-excel'}
                          className="px-3 py-2 bg-white text-orange-700 border border-orange-200 rounded-xl hover:bg-orange-50 transition-all duration-200 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4 mr-1 inline" />
                          {isExportingReport === 'financial-excel' ? 'Generando...' : 'Excel'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendees' && (
              <div className="space-y-6">
                {/* Attendee Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Gestión de Asistentes {selectedEvent && `- ${selectedEvent.title}`}
                    </h3>
                    {selectedEvent && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedEvent.currentAttendees}/{selectedEvent.maxAttendees} asistentes registrados
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      aria-label="Actualizar asistentes"
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      <span className="ml-2 text-xs sm:text-sm">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
                    </button>
                    {/* Export format selector removed */}
                  </div>
                </div>

                <AttendeeManagement
                  eventId={selectedEvent?.id}
                  eventTitle={selectedEvent?.title}
                  onRefreshRequest={() => { }}
                />
              </div>
            )}

            {activeTab === 'profile' && (
              <OrganizerProfilePanel />
            )}

          </div>
        </div>
      </div>

      {/* Modal de Crear Evento */}
      <CreateEventModal
        isOpen={isCreateEventModalOpen}
        onClose={() => setIsCreateEventModalOpen(false)}
        onSave={handleCreateEvent}
        isLoading={isCreatingEvent}
      />

      {/* Modal de Crear Tipo de Entrada */}
      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
        onSave={handleCreateTicket}
        isLoading={isCreatingTicket}
      />

      {/* Modal de Crear Código de Descuento */}
      <CreatePromotionModal
        isOpen={isCreatePromotionModalOpen}
        onClose={() => setIsCreatePromotionModalOpen(false)}
        onSave={() => {
          loadPromotions();
        }}
        eventId={selectedEvent?.id}
        organizerId={user?.id || ''}
      />

      {/* Modal de Subir/Editar Imagen de Evento */}
      <UploadImageModal
        isOpen={isUploadImageModalOpen}
        onClose={() => {
          setIsUploadImageModalOpen(false);
          setSelectedEventForImage(null);
        }}
        onImageUploaded={handleImageUploaded}
        currentImageUrl={selectedEventForImage?.currentImage}
        eventId={selectedEventForImage?.id}
        eventTitle={selectedEventForImage?.title}
      />

      {/* Modal de Duplicar Evento */}
      <DuplicateEventModal
        event={selectedEventForDuplication}
        isOpen={isDuplicateEventModalOpen}
        onClose={() => {
          setIsDuplicateEventModalOpen(false);
          setSelectedEventForDuplication(null);
        }}
        onDuplicate={handleDuplicateEventConfirm}
      />

      {/* Modal de Ver Detalles del Evento */}
      <ViewEventModal
        isOpen={isViewEventModalOpen}
        onClose={() => {
          setIsViewEventModalOpen(false);
          setSelectedEventForView(null);
        }}
        event={selectedEventForView}
      />

      {/* Modal de Editar Evento */}
      <EditEventModal
        isOpen={isEditEventModalOpen}
        onClose={() => {
          setIsEditEventModalOpen(false);
          setSelectedEventForEdit(null);
        }}
        onSave={handleSaveEventChanges}
        event={selectedEventForEdit}
        isLoading={isLoadingEventDetails}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteEventConfirmation
        isOpen={isDeleteEventModalOpen}
        onClose={() => {
          setIsDeleteEventModalOpen(false);
          setSelectedEventForDelete(null);
        }}
        onConfirm={handleConfirmDeleteEvent}
        event={selectedEventForDelete}
        isDeleting={isDeletingEvent}
      />

      {/* Modal de Configuración de Evento */}
      <ConfigureEventModal
        isOpen={isConfigureEventModalOpen}
        onClose={() => {
          setIsConfigureEventModalOpen(false);
          setSelectedEventForConfigure(null);
        }}
        onSave={handleSaveEventConfiguration}
        event={selectedEventForConfigure}
        isLoading={isLoadingEventDetails}
      />

      {/* Modales CRUD de Promociones */}
      <ViewPromotionModal
        isOpen={isViewPromotionModalOpen}
        onClose={closePromotionModals}
        promotion={selectedPromotion}
      />

      <EditPromotionModal
        isOpen={isEditPromotionModalOpen}
        onClose={closePromotionModals}
        promotion={selectedPromotion}
        onSave={() => {
          loadPromotions();
          closePromotionModals();
        }}
      />

      <DuplicatePromotionModal
        isOpen={isDuplicatePromotionModalOpen}
        onClose={closePromotionModals}
        promotion={selectedPromotion}
        onDuplicate={() => {
          loadPromotions();
          closePromotionModals();
        }}
      />

      <DeletePromotionModal
        isOpen={isDeletePromotionModalOpen}
        onClose={closePromotionModals}
        promotion={selectedPromotion}
        onDelete={() => {
          loadPromotions();
          closePromotionModals();
        }}
      />

      {/* Modal de Crear Método de Pago */}
      <CreatePaymentMethodModal
        isOpen={isCreatePaymentMethodModalOpen}
        onClose={() => setIsCreatePaymentMethodModalOpen(false)}
        onSave={handleCreatePaymentMethod}
        isLoading={isCreatingPaymentMethod}
      />

      {/* Modales CRUD de Métodos de Pago */}
      <ViewPaymentMethodModal
        isOpen={isViewPaymentMethodModalOpen}
        onClose={closePaymentMethodModals}
        paymentMethod={selectedPaymentMethod}
      />

      <EditPaymentMethodModal
        isOpen={isEditPaymentMethodModalOpen}
        onClose={closePaymentMethodModals}
        paymentMethod={selectedPaymentMethod}
        onSave={handleSavePaymentMethodChanges}
        isLoading={isLoadingPaymentMethodDetails}
      />

      <DeletePaymentMethodModal
        isOpen={isDeletePaymentMethodModalOpen}
        onClose={closePaymentMethodModals}
        paymentMethod={selectedPaymentMethod}
        onDelete={handleConfirmDeletePaymentMethod}
      />

      {/* Modal de Escáner QR */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        eventId={selectedEventId || undefined}
      />

      {/* Modal de toda la actividad */}
      <AllActivityModal
        isOpen={isAllActivityModalOpen}
        onClose={() => setIsAllActivityModalOpen(false)}
        activities={recentActivity}
        onRefresh={loadRecentActivity}
      />

      {/* Toast de éxito */}
      {showSuccessToast && (
        <Toast
          variant="success"
          title="¡Éxito!"
          position="top-right"
          duration={4000}
          show={showSuccessToast}
          onClose={() => setShowSuccessToast(false)}
        >
          {toastMessage}
        </Toast>
      )}

      {/* Toast de error */}
      {showErrorToast && (
        <Toast
          variant="error"
          title="Error"
          position="top-right"
          duration={5000}
          show={showErrorToast}
          onClose={() => setShowErrorToast(false)}
        >
          {toastMessage}
        </Toast>
      )}
    </div>
  );
}
