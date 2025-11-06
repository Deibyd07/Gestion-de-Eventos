import { useState } from 'react';
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
import { CreateTicketModal, CreateTicketFormData } from '../components/CreateTicketModal.component';
import { formatRevenue } from '@shared/lib/utils/Currency.utils';


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

  const handleLogout = () => {
    logout();
    // No navegar, solo cerrar sesión
  };

  // Usar datos reales del store
  const { events: storeEvents } = useEventStore();
  
  // Filtrar eventos del organizador actual
  const events = storeEvents.filter(event => event.organizerId === user?.id);
  
  // Si no hay eventos del organizador, crear algunos eventos de prueba
  const mockOrganizerEvents = [
    {
      id: 'org-1',
      title: 'Conferencia de Tecnología 2024',
      description: 'Evento de tecnología para desarrolladores',
      image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: '2024-03-15',
      time: '09:00',
      location: 'Bogotá, Colombia',
      category: 'Tecnología',
      price: 150000,
      maxAttendees: 200,
      currentAttendees: 150,
      organizerId: user?.id || '1',
      organizerName: user?.name || 'Organizador',
      status: 'upcoming' as const,
      tags: ['tecnología', 'conferencia'],
      ticketTypes: []
    },
    {
      id: 'org-2',
      title: 'Workshop de Marketing Digital',
      description: 'Aprende las mejores estrategias de marketing digital',
      image: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
      date: '2024-03-20',
      time: '14:00',
      location: 'Medellín, Colombia',
      category: 'Marketing',
      price: 80000,
      maxAttendees: 50,
      currentAttendees: 25,
      organizerId: user?.id || '1',
      organizerName: user?.name || 'Organizador',
      status: 'ongoing' as const,
      tags: ['marketing', 'workshop'],
      ticketTypes: []
    }
  ];
  
  // Usar eventos del organizador o eventos mock si no hay ninguno
  const finalEvents = events.length > 0 ? events : mockOrganizerEvents;
  
  // Seleccionar automáticamente el primer evento si no hay uno seleccionado
  const selectedEvent = selectedEventId 
    ? finalEvents.find(event => event.id === selectedEventId)
    : finalEvents.length > 0 ? finalEvents[0] : null;
  
  // Si no hay evento seleccionado pero hay eventos disponibles, seleccionar el primero
  if (!selectedEventId && finalEvents.length > 0) {
    setSelectedEventId(finalEvents[0].id);
  }
  
  // Calcular estadísticas específicas del evento seleccionado
  const quickStats: QuickStats = selectedEvent ? {
    totalEvents: 1, // Solo el evento seleccionado
    activeEvents: selectedEvent.status === 'upcoming' || selectedEvent.status === 'ongoing' ? 1 : 0,
    totalRevenue: selectedEvent.price || 0,
    totalAttendees: selectedEvent.currentAttendees || 0,
    conversionRate: Math.random() * 15 + 5, // Valor dinámico para demo
    avgTicketPrice: selectedEvent.price || 0,
    upcomingEvents: new Date(selectedEvent.date) > new Date() && 
      (selectedEvent.status === 'upcoming' || selectedEvent.status === 'ongoing') ? 1 : 0,
    completedEvents: selectedEvent.status === 'completed' ? 1 : 0
  } : {
    totalEvents: 0,
    activeEvents: 0,
    totalRevenue: 0,
    totalAttendees: 0,
    conversionRate: 0,
    avgTicketPrice: 0,
    upcomingEvents: 0,
    completedEvents: 0
  };

  // Status functions removed - not used in current implementation

  const handleRefresh = async () => {
    console.log('Actualizando datos...');
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
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí iría la lógica real para crear la entrada
      console.log('Creando tipo de entrada:', formData);
      
      // Cerrar modal
      setIsCreateTicketModalOpen(false);
      
      // Mostrar mensaje de éxito (puedes implementar un toast)
      console.log('Tipo de entrada creado exitosamente');
      
    } catch (error) {
      console.error('Error al crear tipo de entrada:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsCreatingTicket(false);
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

            {activeTab === 'events' && (
              <div className="space-y-6">
                {/* Event Management Actions */}
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
                  events={finalEvents.map(event => ({
                    ...event,
                    revenue: event.price || 0,
                    views: Math.floor(Math.random() * 1000),
                    conversionRate: Math.random() * 10,
                    ticketTypes: [],
                    status: event.status === 'upcoming' ? 'published' : 
                           event.status === 'ongoing' ? 'published' : 
                           event.status === 'completed' ? 'completed' : 
                           event.status === 'cancelled' ? 'cancelled' : 'draft'
                  }))}
                  onCreateEvent={() => setIsCreateEventModalOpen(true)}
                  onEditEvent={(eventId) => console.log('Edit event:', eventId)}
                  onViewEvent={(eventId) => console.log('View event:', eventId)}
                  onDeleteEvent={(eventId) => console.log('Delete event:', eventId)}
                  onDuplicateEvent={(eventId) => console.log('Duplicate event:', eventId)}
                  onUploadImage={(eventId) => console.log('Upload image for event:', eventId)}
                  onCustomizeEvent={(eventId) => console.log('Customize event:', eventId)}
                />
              </div>
            )}

            {activeTab === 'tickets' && (
              <div className="space-y-6">
                {/* Ticket Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Entradas</h3>
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
                  tickets={[
                    {
                      id: '1',
                      name: 'Entrada General',
                      description: 'Acceso general al evento',
                      price: 50000,
                      available: 150,
                      sold: 50,
                      type: 'general',
                      isActive: true,
                      features: ['Acceso general', 'WiFi gratuito'],
                      eventId: 'event-1'
                    },
                    {
                      id: '2',
                      name: 'Entrada VIP',
                      description: 'Acceso VIP con beneficios exclusivos',
                      price: 150000,
                      originalPrice: 200000,
                      available: 25,
                      sold: 25,
                      type: 'vip',
                      isActive: true,
                      features: ['Acceso VIP', 'Catering premium', 'Parking reservado'],
                      eventId: 'event-1'
                    },
                    {
                      id: '3',
                      name: 'Early Bird',
                      description: 'Descuento por compra anticipada',
                      price: 35000,
                      originalPrice: 50000,
                      available: 0,
                      sold: 100,
                      type: 'early_bird',
                      isActive: true,
                      features: ['Descuento especial', 'Acceso general'],
                      eventId: 'event-1'
                    }
                  ]}
                  onCreateTicket={() => setIsCreateTicketModalOpen(true)}
                  onEditTicket={(ticketId) => console.log('Edit ticket:', ticketId)}
                  onDeleteTicket={(ticketId) => console.log('Delete ticket:', ticketId)}
                  onDuplicateTicket={(ticketId) => console.log('Duplicate ticket:', ticketId)}
                  onToggleTicket={(ticketId) => console.log('Toggle ticket:', ticketId)}
                  onViewAnalytics={(ticketId) => console.log('View ticket analytics:', ticketId)}
                />
              </div>
            )}

            {activeTab === 'promotions' && (
              <div className="space-y-6">
                {/* Promotion Management Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Promociones</h3>
                  </div>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button 
                      onClick={handleRefresh}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Exportando promociones...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => console.log('Crear nueva promoción...')}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 md:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <PromotionManagement
                  promotions={[
                    {
                      id: '1',
                      code: 'DESCUENTO20',
                      name: 'Descuento del 20%',
                      description: 'Descuento especial del 20% en todas las entradas',
                      type: 'percentage',
                      value: 20,
                      minOrderAmount: 100000,
                      usageLimit: 100,
                      usedCount: 45,
                      isActive: true,
                      startDate: '2024-01-01',
                      endDate: '2024-12-31',
                      applicableEvents: ['event-1'],
                      applicableTicketTypes: ['general', 'vip'],
                      maxUsesPerUser: 2,
                      isPublic: true,
                      createdDate: '2024-01-01'
                    },
                    {
                      id: '2',
                      code: 'EARLYBIRD',
                      name: 'Early Bird 30%',
                      description: 'Descuento por compra anticipada',
                      type: 'early_bird',
                      value: 30,
                      usageLimit: 50,
                      usedCount: 25,
                      isActive: true,
                      startDate: '2024-01-01',
                      endDate: '2025-01-15',
                      applicableEvents: ['event-1'],
                      applicableTicketTypes: ['general'],
                      maxUsesPerUser: 1,
                      isPublic: true,
                      createdDate: '2024-01-01'
                    },
                    {
                      id: '3',
                      code: 'STUDENT50',
                      name: 'Descuento Estudiante',
                      description: 'Descuento especial para estudiantes',
                      type: 'fixed',
                      value: 25000,
                      usageLimit: 200,
                      usedCount: 120,
                      isActive: true,
                      startDate: '2024-01-01',
                      endDate: '2024-12-31',
                      applicableEvents: ['event-1'],
                      applicableTicketTypes: ['general'],
                      maxUsesPerUser: 1,
                      isPublic: false,
                      createdDate: '2024-01-01'
                    }
                  ]}
                  onCreatePromotion={() => console.log('Create promotion')}
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
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Asistentes</h3>
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
    </div>
  );
}
