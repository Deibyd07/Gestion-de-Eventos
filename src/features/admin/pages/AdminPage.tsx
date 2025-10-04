import { useState } from 'react';
import { 
  LogOut, 
  User, 
  Menu, 
  X, 
  BarChart3, 
  Users, 
  Calendar, 
  Bell, 
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../../core/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '../components/dashboard/AdminDashboardNew';
import { UserManagement } from '../components/users/UserManagementAdvanced';
import { EventManagement } from '../components/events/EventManagement';
import { AnalyticsDashboard } from '../../analytics/components/AnalyticsDashboard';
import { PaymentsDashboard } from '../components/dashboard/PaymentsDashboard';
import { NotificationsDashboard } from '../components/dashboard/NotificationsDashboard';
import { AdminProfilePanel } from '../components/dashboard/AdminProfilePanel';


export function AdminPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Datos de ejemplo para el dashboard
  const adminStats = {
    totalUsers: 1250,
    totalEvents: 89,
    totalRevenue: 45000000,
    activeEvents: 23,
    pendingApprovals: 5,
    systemHealth: 'excellent' as const,
    recentActivity: [
      {
        id: '1',
        type: 'user_registration' as const,
        description: 'Nuevo usuario registrado: María García',
        timestamp: 'Hace 2 horas',
        severity: 'low' as const
      },
      {
        id: '2',
        type: 'event_created' as const,
        description: 'Evento creado: "Conferencia de Tecnología 2024"',
        timestamp: 'Hace 4 horas',
        severity: 'medium' as const
      },
      {
        id: '3',
        type: 'payment_received' as const,
        description: 'Pago recibido: €2,500 por evento "Workshop React"',
        timestamp: 'Hace 6 horas',
        severity: 'low' as const
      }
    ],
    topOrganizers: [
      {
        id: '1',
        name: 'Juan Pérez',
        events: 12,
        revenue: 15000000,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Ana López',
        events: 8,
        revenue: 12000000,
        rating: 4.9
      }
    ],
    systemMetrics: {
      serverUptime: '99.9%',
      responseTime: 120,
      errorRate: 0.1,
      activeConnections: 156
    }
  };

  const handleRefresh = async () => {
    console.log('Actualizando datos...');
  };

  const handleExportData = (type: string) => {
    console.log('Exportando datos:', type);
  };

  const handleSystemAction = (action: string) => {
    console.log('Acción del sistema:', action);
  };

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Panel Principal', 
      icon: BarChart3, 
      color: 'text-blue-600',
      description: 'Resumen general de la plataforma'
    },
    { 
      id: 'events', 
      label: 'Gestión de Eventos', 
      icon: Calendar, 
      color: 'text-purple-600',
      description: 'Aprobar y moderar eventos'
    },
    { 
      id: 'users', 
      label: 'Comunidad', 
      icon: Users, 
      color: 'text-green-600',
      description: 'Usuarios y organizadores'
    },
    { 
      id: 'payments', 
      label: 'Finanzas', 
      icon: CreditCard, 
      color: 'text-emerald-600',
      description: 'Pagos y transacciones'
    },
    { 
      id: 'analytics', 
      label: 'Reportes', 
      icon: TrendingUp, 
      color: 'text-orange-600',
      description: 'Análisis y métricas'
    },
    { 
      id: 'notifications', 
      label: 'Comunicación', 
      icon: Bell, 
      color: 'text-pink-600',
      description: 'Notificaciones y emails'
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
                <p className="text-xs text-blue-100">Panel de Administración</p>
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
                     {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                   </h2>
                 </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
                    <p className="text-sm font-medium text-white">Administrador</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Administrador</p>
                      <p className="text-xs text-gray-500">admin@sistema.com</p>
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
        <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm dashboard-container mt-16" style={{height: 'calc(100vh - 80px)'}}>
          {/* Content Header */}
          <div className="mb-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.label}
              </h2>
              <p className="text-gray-600 mt-1">
                {navigationItems.find(item => item.id === activeTab)?.description}
              </p>
            </div>
          </div>
          {/* Content Cards */}
          <div className="space-y-2 admin-panel panel-consistent-width">
            {activeTab === 'dashboard' && (
              <AdminDashboard
                stats={adminStats}
                onRefresh={handleRefresh}
                onExportData={handleExportData}
                onSystemAction={handleSystemAction}
              />
            )}
            {activeTab === 'events' && (
              <EventManagement />
            )}
            {activeTab === 'users' && (
              <UserManagement />
            )}
            {activeTab === 'analytics' && (
              <AnalyticsDashboard 
                data={{
                  totalEvents: adminStats.totalEvents,
                  totalRevenue: adminStats.totalRevenue,
                  totalAttendees: 1250,
                  conversionRate: 12.5,
                  averageTicketPrice: 35000,
                  topEvents: [
                    { id: '1', title: 'Feria Agropecuaria', revenue: 2500000, attendees: 150, date: '2024-01-15' },
                    { id: '2', title: 'Festival de Música', revenue: 1800000, attendees: 200, date: '2024-02-20' }
                  ],
                  revenueByMonth: [
                    { month: 'Enero', revenue: 1500000, events: 5 },
                    { month: 'Febrero', revenue: 2200000, events: 8 },
                    { month: 'Marzo', revenue: 1800000, events: 6 }
                  ],
                  attendanceTrends: [
                    { date: '2024-01-15', checkIns: 140, noShows: 10 },
                    { date: '2024-02-20', checkIns: 180, noShows: 20 }
                  ],
                  ticketSalesByType: [
                    { type: 'General', sales: 100, revenue: 2000000 },
                    { type: 'VIP', sales: 50, revenue: 1500000 }
                  ],
                  geographicData: [
                    { location: 'Zarzal', events: 15, revenue: 3000000 },
                    { location: 'Cartago', events: 8, revenue: 1500000 }
                  ]
                }}
                onExportReport={(format) => console.log('Exportando reporte:', format)}
                onFilterChange={(filters) => console.log('Filtros:', filters)}
                userRole="admin"
              />
            )}
            {activeTab === 'payments' && (
              <PaymentsDashboard />
            )}
            {activeTab === 'notifications' && (
              <NotificationsDashboard />
            )}
            {activeTab === 'profile' && (
              <AdminProfilePanel />
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}