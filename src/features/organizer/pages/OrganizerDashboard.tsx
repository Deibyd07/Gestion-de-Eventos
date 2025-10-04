import { useState } from 'react';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus, 
  Ticket, 
  Star, 
  Download,
  BarChart3,
  RefreshCw,
  QrCode,
  CheckCircle,
  Activity,
  LogOut,
  User,
  Menu,
  X,
  CreditCard,
  Percent,
  Wallet,
  Receipt,
  FileBarChart,
  ChevronDown,
  Bell
} from 'lucide-react';
import { useAuthStore } from '../../../core/stores/authStore';
import { useEventStore } from '../../../core/stores/eventStore';
import { EventManagementAdvanced } from '../components/events/EventManagementAdvanced';
import { TicketManagement } from '../components/tickets/TicketManagement';
import { PromotionManagement } from '../components/promotions/PromotionManagement';
import { AttendeeManagement } from '../components/attendees/AttendeeManagement';
import { formatRevenue } from '../../../shared/utils/currency';

// Componente para el contenido del dashboard del organizador
interface OrganizerDashboardContentProps {
  stats: QuickStats;
  onCreateEvent: () => void;
  onNavigateToTab: (tab: string) => void;
  formatRevenue: (amount: number) => string;
}

function OrganizerDashboardContent({
  stats,
  onCreateEvent,
  onNavigateToTab,
  formatRevenue
}: OrganizerDashboardContentProps) {
  return (
    <div className="space-y-6">
      {/* Real-time Metrics Dashboard - HU23 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 metrics-container grid-consistent">
        {/* Eventos Activos */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6 dashboard-card card-consistent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eventos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +2 este mes
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Ingresos en Tiempo Real */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6 dashboard-card card-consistent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatRevenue(stats.totalRevenue)}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.5% vs mes anterior
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Asistencia en Tiempo Real */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6 dashboard-card card-consistent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Asistentes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAttendees}</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <Users className="w-4 h-4 mr-1" />
                {stats.conversionRate}% conversión
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Ventas en Tiempo Real */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6 dashboard-card card-consistent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">47</p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <Activity className="w-4 h-4 mr-1" />
                +23% vs ayer
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Métricas de Conversión */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Conversión</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tasa de Conversión</span>
              <span className="font-semibold text-green-600">3.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Vistas Únicas</span>
              <span className="font-semibold text-blue-600">1,247</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Abandono de Carrito</span>
              <span className="font-semibold text-red-600">68%</span>
            </div>
          </div>
        </div>

        {/* Métricas de Asistencia */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asistencia en Tiempo Real</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Eventos en Curso</span>
              <span className="font-semibold text-green-600">2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Asistencia Promedio</span>
              <span className="font-semibold text-blue-600">87%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Último Escaneo</span>
              <span className="font-semibold text-gray-600">Hace 2 min</span>
            </div>
          </div>
        </div>

        {/* Métricas Financieras */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas Financieras</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Ingresos Hoy</span>
              <span className="font-semibold text-green-600">$2,350,000</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Comisiones</span>
              <span className="font-semibold text-red-600">$117,500</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Neto</span>
              <span className="font-semibold text-blue-600">$2,232,500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Enhanced */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Actividad Reciente</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-100">En tiempo real</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Event Activity */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                  </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Nuevo Evento Creado</h4>
                    <span className="text-xs text-gray-500">Hace 2 horas</span>
                  </div>
                  <p className="text-sm text-gray-600">"Conferencia de Tecnología 2024" - Bogotá</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      150/200 asistentes
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      $7,500,000 ingresos
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Activo
                </div>
                  </div>
                </div>
                
            {/* Ticket Sales Activity */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Ticket className="w-6 h-6 text-white" />
                  </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Venta de Entradas</h4>
                    <span className="text-xs text-gray-500">Hace 15 minutos</span>
                  </div>
                  <p className="text-sm text-gray-600">3 entradas VIP vendidas - $450,000</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      Entrada VIP
                    </span>
                    <span className="flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +15% vs ayer
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                  Venta
              </div>
              </div>
            </div>

            {/* Payment Activity */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-yellow-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Pago Procesado</h4>
                    <span className="text-xs text-gray-500">Hace 1 hora</span>
                  </div>
                  <p className="text-sm text-gray-600">Pago de $150,000 procesado exitosamente</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Tarjeta de Crédito
                    </span>
                    <span className="flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Comisión: $7,500
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                  Completado
          </div>
        </div>
      </div>

            {/* QR Scan Activity */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Asistencia Registrada</h4>
                    <span className="text-xs text-gray-500">Hace 5 minutos</span>
                  </div>
                  <p className="text-sm text-gray-600">María García - Entrada General escaneada</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Total: 127 asistentes
                    </span>
                    <span className="flex items-center">
                      <Activity className="w-3 h-3 mr-1" />
                      85% tasa de asistencia
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                  Escaneado
                </div>
              </div>
            </div>

            {/* Promotion Activity */}
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">Descuento Aplicado</h4>
                    <span className="text-xs text-gray-500">Hace 30 minutos</span>
                  </div>
                  <p className="text-sm text-gray-600">Código "EARLYBIRD" usado - 30% descuento</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Percent className="w-3 h-3 mr-1" />
                      Ahorro: $45,000
                    </span>
                    <span className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      Usos: 25/50
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium">
                  Descuento
                </div>
              </div>
            </div>
          </div>

          {/* View All Activity Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md">
              <Activity className="w-4 h-4" />
              <span>Ver Toda la Actividad</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions with Glassmorphism Effect - All HU Functions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* HU4-HU7: Gestión de Eventos */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Eventos</h3>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600" />
          </div>
          </div>
          <p className="text-gray-600 mb-4">
            Crear, editar, personalizar y duplicar eventos con información detallada
          </p>
          <button 
            onClick={onCreateEvent}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Crear Evento
          </button>
        </div>

        {/* HU8-HU10: Tipos de Entradas */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Tipos de Entradas</h3>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600" />
          </div>
          </div>
          <p className="text-gray-600 mb-4">
            Configura entradas, descuentos y límites de compra por usuario
          </p>
          <button 
            onClick={() => onNavigateToTab('tickets')}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Configurar
          </button>
        </div>

        {/* HU14-HU16: Métodos de Pago */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago</h3>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-orange-600" />
          </div>
          </div>
          <p className="text-gray-600 mb-4">
            Configura múltiples métodos de pago y recibe reportes de reconciliación
          </p>
          <button 
            onClick={() => onNavigateToTab('payments')}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Configurar
          </button>
        </div>

        {/* HU17-HU19: Control de Asistencia */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Control de Asistencia</h3>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6 text-purple-600" />
      </div>
          </div>
          <p className="text-gray-600 mb-4">
            Escanea QR, registra asistencia y genera reportes en tiempo real
          </p>
          <button 
            onClick={() => onNavigateToTab('attendance')}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Iniciar Escaneo
          </button>
        </div>
      </div>

    </div>
  );
}

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Fixed */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white/80 backdrop-blur-md shadow-xl border-r border-white/20 transition-all duration-300 flex-shrink-0 fixed left-0 top-0 h-full z-10`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm">
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
        <nav className="p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-start space-x-3 px-4 py-3 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border-l-4 border-indigo-400 shadow-lg border border-white/30'
                    : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:text-blue-700 hover:border-l-4 hover:border-indigo-300 hover:shadow-lg hover:border hover:border-indigo-200/30'
                }`}
              >
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
                {isSidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm">{item.label}</span>
                    <p className="text-xs text-gray-500 mt-1 leading-tight">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button in Sidebar */}
        {isSidebarOpen && (
          <div className="absolute bottom-4 left-4 right-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-700 rounded-xl border border-red-200 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Top Header */}
        <div className={`fixed top-0 right-0 z-20 bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl transition-all duration-300 ${isSidebarOpen ? 'left-64' : 'left-16'}`}>
          <div className="h-16 flex items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                 <div>
                   <h2 className="text-2xl font-bold text-white">
                     {navigationItems.find(item => item.id === activeTab)?.label || 'Panel Principal'}
                   </h2>
                   {selectedEvent && (
                     <div className="mt-1 flex items-center space-x-2">
                       <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                       <span className="text-sm text-green-100 font-medium">
                         Evento: {selectedEvent.title}
                       </span>
                       <span className="text-xs text-blue-200">
                         ({selectedEvent.status === 'upcoming' ? 'Próximo' : 
                           selectedEvent.status === 'ongoing' ? 'En curso' : 
                           selectedEvent.status === 'completed' ? 'Completado' : 'Cancelado'})
                       </span>
                     </div>
                   )}
                 </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Event Selector */}
              {finalEvents.length > 0 ? (
                <div className="relative">
                  <select
                    value={selectedEventId || ''}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="appearance-none bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 pr-8 text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 min-w-[200px]"
                  >
                    {finalEvents.map(event => (
                      <option key={event.id} value={event.id} className="text-gray-900">
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-xl">
                  <Calendar className="w-4 h-4 text-yellow-200" />
                  <span className="text-yellow-200 text-sm font-medium">Sin eventos</span>
                </div>
              )}
              
              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">{user?.name || 'Organizador'}</p>
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
                        setActiveTab('settings');
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
        <div className="flex-1 p-6 overflow-y-auto bg-gray-100 mt-16" style={{height: 'calc(100vh - 80px)'}}>
          {/* Content Header */}
          <div className="mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                {navigationItems.find(item => item.id === activeTab)?.description}
              </p>
            </div>
          </div>
          {/* Action Buttons - Removed from global header */}

          {/* Content Cards */}
          <div className="p-6 space-y-4">
            {activeTab === 'overview' && (
              <OrganizerDashboardContent
                stats={quickStats}
                onCreateEvent={() => setActiveTab('events')}
                onNavigateToTab={setActiveTab}
                formatRevenue={formatRevenue}
              />
            )}

            {activeTab === 'events' && (
              <div className="space-y-6">
                {/* Event Management Actions */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Eventos</h3>
                  </div>
                  <div className="flex space-x-3">
            <button 
              onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </button>
            <button 
                      onClick={() => console.log('Exportando eventos...')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
                      Exportar Eventos
            </button>
            <button 
                      onClick={() => console.log('Crear nuevo evento...')}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
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
                  onCreateEvent={() => console.log('Crear nuevo evento desde componente...')}
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Entradas</h3>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                    <button 
                      onClick={() => console.log('Exportando entradas...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Entradas
                    </button>
                    <button 
                      onClick={() => console.log('Crear nuevo tipo de entrada...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Entrada
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
                  onCreateTicket={() => console.log('Create ticket')}
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Promociones</h3>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                    <button 
                      onClick={() => console.log('Exportando promociones...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                    >
                    <Download className="w-4 h-4 mr-2" />
                      Exportar Promociones
                    </button>
                    <button 
                      onClick={() => console.log('Crear nueva promoción...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Promoción
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago y Reconciliación</h3>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                    <button 
                      onClick={() => console.log('Exportando reportes de pago...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Reportes
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Configurar Método
                    </button>
                  </div>
                  </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Payment Methods */}
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Métodos de Pago Activos</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="w-5 h-5 text-blue-600" />
                            <div>
                              <h5 className="font-medium text-gray-900">Tarjetas de Crédito/Débito</h5>
                              <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                    </div>
                  </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                    </div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Wallet className="w-5 h-5 text-purple-600" />
                            <div>
                              <h5 className="font-medium text-gray-900">Wallets Digitales</h5>
                              <p className="text-sm text-gray-600">PayPal, Apple Pay, Google Pay</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                        </div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Receipt className="w-5 h-5 text-green-600" />
                            <div>
                              <h5 className="font-medium text-gray-900">Transferencias Bancarias</h5>
                              <p className="text-sm text-gray-600">PSE, Nequi, Daviplata</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Control de Asistencia</h3>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
                      <QrCode className="w-4 h-4 mr-2" />
                      Iniciar Escaneo
                    </button>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Registrar Asistencia
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
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">Reportes de Asistencia</h4>
                    <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200">
                      <FileBarChart className="w-4 h-4 mr-2" />
                      Generar Reporte
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
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Gestión de Asistentes</h3>
          </div>
                  <div className="flex space-x-3">
                    <button 
                      onClick={handleRefresh}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                    <button 
                      onClick={() => console.log('Exportando lista de asistentes...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Lista
                    </button>
                    <button 
                      onClick={() => console.log('Enviar notificación masiva...')}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 shadow-sm"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notificar Asistentes
                    </button>
                  </div>
                </div>
                
                <AttendeeManagement 
                  eventId={selectedEvent?.id}
                  eventTitle={selectedEvent?.title}
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
