import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  FileBarChart,
  Bell
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
import { EditEventModal, EditEventFormData } from '../../../events/presentation/components/EditEventModal.component';
import { ViewEventModal } from '../../../events/presentation/components/ViewEventModal.component';
import { DeleteEventConfirmation } from '../../../events/presentation/components/DeleteEventConfirmation.component';
import { ConfigureEventModal } from '../../../events/presentation/components/ConfigureEventModal.component';
import { CreateTicketModal, CreateTicketFormData } from '../components/CreateTicketModal.component';
import { TicketTypeService } from '@shared/lib/api/services/TicketType.service';
import { CreatePromotionModal, CreatePromotionFormData } from '../components/CreatePromotionModal.component';
import { UploadImageModal } from '../../../events/presentation/components/UploadImageModal.component';
import { DuplicateEventModal } from '../../../events/presentation/components/DuplicateEventModal.component';
import { formatRevenue } from '@shared/lib/utils/Currency.utils';
import { EventService } from '@shared/lib/api/services/Event.service';
import { AnalyticsService } from '@shared/lib/api/services/Analytics.service';


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

    // Estados para los modales CRUD de tipo de entrada
    const [isViewTicketModalOpen, setIsViewTicketModalOpen] = useState(false);
    const [isEditTicketModalOpen, setIsEditTicketModalOpen] = useState(false);
    const [isDuplicateTicketModalOpen, setIsDuplicateTicketModalOpen] = useState(false);
    const [isDeleteTicketModalOpen, setIsDeleteTicketModalOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

    // Handlers para CRUD de tipo de entrada
    const handleViewTicket = (ticketId: string) => {
      const ticket = selectedEvent?.ticketTypes?.find((t: any) => t.id === ticketId);
      setSelectedTicket(ticket);
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

  const handleLogout = () => {
    logout();
    // No navegar, solo cerrar sesión
  };

  // Usar datos reales del store
  const { events: storeEvents, setEvents } = useEventStore();
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  
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
  const [metricsLoading, setMetricsLoading] = useState(false);
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
    if (!user?.id) return;
    setMetricsLoading(true);
    setMetricsError(null);
    try {
      const data = await AnalyticsService.obtenerMetricasOrganizador(user.id);
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
        eventosEnCurso: data.eventosEnCurso,
        asistenciaPromedio: Number(data.asistenciaPromedio.toFixed(2)),
        ultimoEscaneoISO: data.ultimoEscaneoISO
      });
    } catch (err: any) {
      console.error('Error cargando métricas del organizador:', err);
      setMetricsError(err.message || 'Error al cargar métricas');
    } finally {
      setMetricsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar métricas cuando se cargan eventos o cambia usuario
    if (user?.id) {
      loadMetrics();
    }
  }, [user?.id, finalEvents.length]);

  // Status functions removed - not used in current implementation

  const handleRefresh = async () => {
    console.log('Actualizando datos...');
    // Recargar eventos del organizador
    if (!user?.id) return;
    
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
          status: dbEvent.estado || 'upcoming',
          tags: dbEvent.etiquetas || [],
          ticketTypes: dbEvent.tipos_entrada || []
        }));
        
        const otherEvents = storeEvents.filter(e => e.organizerId !== user.id);
        setEvents([...otherEvents, ...convertedEvents]);
      }
    } catch (error) {
      console.error('Error al refrescar eventos:', error);
    }
  };

  const handleCreateEvent = async (formData: CreateEventFormData) => {
    setIsCreatingEvent(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real para crear el evento
      console.log('Creando evento:', formData);
      
      // Cerrar modal
      setIsCreateEventModalOpen(false);
      
      // Mostrar mensaje de éxito (puedes implementar un toast)
      console.log('Evento creado exitosamente');
      
    } catch (error) {
      console.error('Error al crear evento:', error);
      // Aquí podrías mostrar un mensaje de error
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

  const handleCreatePromotion = async (formData: CreatePromotionFormData) => {
    setIsCreatingPromotion(true);
    
    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real para crear la promoción
      console.log('Creando código de descuento:', formData);
      
      // Cerrar modal
      setIsCreatePromotionModalOpen(false);
      
      // Mostrar mensaje de éxito (puedes implementar un toast)
      console.log('Código de descuento creado exitosamente');
      
    } catch (error) {
      console.error('Error al crear código de descuento:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsCreatingPromotion(false);
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
      const eventDetails = await EventService.obtenerEventoCompleto(eventId);
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
      const eventDetails = await EventService.obtenerEventoCompleto(eventId);
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
        alert('No se pudo cargar el evento');
        return;
      }

      setSelectedEventForConfigure(evento);
      setIsConfigureEventModalOpen(true);
    } catch (error: any) {
      console.error('Error al cargar evento para configurar:', error);
      alert(error.message || 'Error al cargar el evento');
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
      
      alert('Estado del evento actualizado correctamente');
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
      <div className={`${
        isSidebarOpen ? 'w-64' : 'w-16'
      } bg-white/90 backdrop-blur-md shadow-xl border-r border-white/20 transition-all duration-300 flex-shrink-0 fixed left-0 top-0 h-dvh md:h-full z-30 md:z-40 overflow-y-auto md:overflow-hidden overscroll-contain touch-pan-y ${
        !isSidebarOpen ? 'hidden md:flex md:flex-col' : 'flex flex-col'
      }`}>
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center ${isSidebarOpen ? 'justify-between px-4' : 'justify-center px-2'} bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm`}>
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

        {/* Navigation */}
        <nav className={`${isSidebarOpen ? 'p-4' : 'px-0 py-4 flex flex-col items-center'} space-y-2 max-h-[calc(100dvh-8rem)] overflow-y-auto md:max-h-none md:overflow-y-visible`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`${
                  isSidebarOpen 
                    ? 'w-full flex items-start space-x-3 px-4 py-3 rounded-xl'
                    : 'w-12 h-12 flex items-center justify-center rounded-lg'
                } backdrop-blur-sm transition-all duration-200 ${
                  activeTab === item.id
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
                    <div className={`p-2 rounded-lg backdrop-blur-sm border transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-white/30 border-white/40' 
                        : 'bg-white/10 border-white/20 hover:bg-blue-100/50 hover:border-blue-300/50'
                    }`}>
                      <Icon className={`w-4 h-4 transition-colors duration-200 ${
                        activeTab === item.id 
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
                  <Icon className={`w-5 h-5 transition-colors duration-200 ${
                    activeTab === item.id 
                      ? 'text-blue-600' 
                      : 'text-gray-500 hover:text-blue-600'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button in Sidebar */}
        <div className={`${isSidebarOpen ? 'absolute bottom-4 left-4 right-4' : 'mt-auto pb-4 flex justify-center'}`}>
          <button
            onClick={handleLogout}
            className={`${
              isSidebarOpen 
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
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
      } ${
        !isSidebarOpen ? 'ml-0' : 'ml-0'
      }`}>
        {/* Top Header */}
        <div className={`fixed top-0 right-0 z-20 bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl transition-all duration-300 ${
          isSidebarOpen ? 'md:left-64' : 'md:left-16'
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
                          selectedEvent.status === 'completed' ? 'Completado' : 'Cancelado'})
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
        <div className="flex-1 min-w-0 overflow-y-auto bg-gray-100 mt-16 w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 box-border" style={{height: 'calc(100vh - 80px)'}}>
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
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm"
            >
              <RefreshCw className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
            <button 
                      onClick={() => console.log('Exportando eventos...')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
            >
              <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Exportar</span>
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
                    status: selectedEvent.status === 'upcoming' ? 'published' : 
                           selectedEvent.status === 'ongoing' ? 'published' : 
                           selectedEvent.status === 'completed' ? 'completed' : 
                           selectedEvent.status === 'cancelled' ? 'cancelled' : 'draft'
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
                    {selectedEvent && (
                      <p className="text-sm text-gray-600 mt-1">
                        {selectedEvent.location} • {new Date(selectedEvent.date).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleRefresh}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <RefreshCw className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Actualizar</span>
                    </button>
                    <button 
                      onClick={() => console.log('Exportando entradas...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Exportar</span>
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
                  tickets={selectedEvent?.ticketTypes?.map(ticket => ({
                    id: ticket.id,
                    name: ticket.nombre_tipo || 'Sin nombre',
                    description: ticket.descripcion || '',
                    price: ticket.precio || 0,
                    available: ticket.cantidad_disponible || 0,
                    sold: (ticket.cantidad_maxima || 0) - (ticket.cantidad_disponible || 0),
                    type: 'general' as const,
                    isActive: true,
                    features: [],
                    eventId: selectedEvent.id
                  })) || []}
                  onCreateTicket={() => setIsCreateTicketModalOpen(true)}
                  onEditTicket={handleEditTicket}
                  onDeleteTicket={handleDeleteTicket}
                  onDuplicateTicket={handleDuplicateTicket}
                  onToggleTicket={(ticketId) => {}}
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
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <RefreshCw className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Actualizar</span>
                    </button>
                    <button
                      onClick={() => console.log('Exportando promociones...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Download className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Exportar</span>
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
                  promotions={selectedEvent ? [
                    {
                      id: '1',
                      code: `EARLY${selectedEvent.id.substring(0, 4).toUpperCase()}`,
                      name: `Early Bird - ${selectedEvent.title}`,
                      description: 'Descuento por compra anticipada',
                      type: 'percentage',
                      value: 20,
                      usageLimit: 100,
                      usedCount: 45,
                      isActive: true,
                      startDate: '2024-01-01',
                      endDate: '2024-12-31',
                      applicableEvents: [selectedEvent.id],
                      applicableTicketTypes: ['general'],
                      maxUsesPerUser: 1,
                      isPublic: true,
                      createdDate: '2024-01-01'
                    }
                  ] : []}
                  onCreatePromotion={() => setIsCreatePromotionModalOpen(true)}
                  onEditPromotion={(promotionId) => console.log('Edit promotion:', promotionId)}
                  onDeletePromotion={(promotionId) => console.log('Delete promotion:', promotionId)}
                  onDuplicatePromotion={(promotionId) => console.log('Duplicate promotion:', promotionId)}
                  onTogglePromotion={(promotionId) => console.log('Toggle promotion:', promotionId)}
                  onViewAnalytics={(promotionId) => console.log('View promotion analytics:', promotionId)}
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
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Exportando reportes de pago...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Methods */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                    <h4 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Métodos de Pago Activos</h4>
                    <div className="space-y-3 md:space-y-4">
                      <div className="p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900 text-xs md:text-sm truncate">Tarjetas de Crédito/Débito</h5>
                              <p className="text-xs md:text-sm text-gray-600 truncate">Visa, Mastercard, American Express</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0 ml-2">Activo</span>
                        </div>
                      </div>
                      <div className="p-3 md:p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                            <Wallet className="w-4 h-4 md:w-5 md:h-5 text-purple-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900 text-xs md:text-sm truncate">Wallets Digitales</h5>
                              <p className="text-xs md:text-sm text-gray-600 truncate">PayPal, Apple Pay, Google Pay</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0 ml-2">Activo</span>
                        </div>
                      </div>
                      <div className="p-3 md:p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                            <Receipt className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-medium text-gray-900 text-xs md:text-sm truncate">Transferencias Bancarias</h5>
                              <p className="text-xs md:text-sm text-gray-600 truncate">PSE, Nequi, Daviplata</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0 ml-2">Activo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reconciliation Reports */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Reportes de Reconciliación</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium text-gray-900">Reporte Mensual</h5>
                          <span className="text-sm text-gray-500">Diciembre 2024</span>
                    </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Ingresos Totales:</p>
                            <p className="font-semibold text-green-600">$2,450,000</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Comisiones:</p>
                            <p className="font-semibold text-red-600">$122,500</p>
                          </div>
                        </div>
                        <button className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm">
                          <Download className="w-4 h-4 mr-1" />
                          Descargar Reporte
                    </button>
                      </div>
                    </div>
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
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleRefresh}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Actualizar</span>
                    </button>
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
                      <QrCode className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Escanear</span>
                    </button>
                    <button className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
                      <CheckCircle className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Registrar</span>
                    </button>
                  </div>
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
                        <button className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200">
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
                          <div className="text-2xl font-bold text-green-600">85%</div>
                          <div className="text-sm text-gray-600">Tasa de Asistencia</div>
                      </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">127</div>
                          <div className="text-sm text-gray-600">Asistentes Registrados</div>
                      </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-2">Últimos Escaneos</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Juan Pérez</span>
                            <span className="text-green-600">14:32</span>
                          </div>
                          <div className="flex justify-between">
                            <span>María García</span>
                            <span className="text-green-600">14:28</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Carlos López</span>
                            <span className="text-green-600">14:25</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance Reports */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                    <h4 className="font-semibold text-gray-900 text-sm md:text-base">Reportes de Asistencia</h4>
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs md:text-sm rounded-lg md:rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200">
                      <FileBarChart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                      <span className="truncate">Generar Reporte</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-medium text-gray-900 mb-2">Reporte por Evento</h5>
                      <p className="text-sm text-gray-600 mb-3">Lista detallada de asistentes por evento</p>
                      <button className="w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </button>
                  </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <h5 className="font-medium text-gray-900 mb-2">Estadísticas Generales</h5>
                      <p className="text-sm text-gray-600 mb-3">Métricas y análisis de asistencia</p>
                      <button className="w-full px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </button>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h5 className="font-medium text-gray-900 mb-2">Reporte Financiero</h5>
                      <p className="text-sm text-gray-600 mb-3">Reconciliación de ingresos vs asistencia</p>
                      <button className="w-full px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 text-sm">
                        <Download className="w-4 h-4 mr-1" />
                        Descargar
                      </button>
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
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Exportando lista de asistentes...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Enviar notificación masiva...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-sm"
                    >
                      <Bell className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <AttendeeManagement 
                  eventId={selectedEvent?.id}
                  eventTitle={selectedEvent?.title}
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
        onSave={handleCreatePromotion}
        isLoading={isCreatingPromotion}
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
    </div>
  );
}
