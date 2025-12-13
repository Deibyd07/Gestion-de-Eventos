import { useState, useEffect } from 'react';
import { LogOut, User, Menu, X, BarChart3, Users, Calendar, CreditCard, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { useNavigate } from 'react-router-dom';
import { AdminDashboard } from '../components/AdminDashboard.component';
import { UserManagement } from '../components/UserManagementAdvanced.component';
import { EventManagement } from '../components/EventManagement.component';
import { AnalyticsDashboard } from '../../../analytics/presentation/components/AnalyticsDashboard.component';
import { PaymentsDashboard } from '../components/PaymentsDashboard.component';
import { AdminProfilePanel } from '../components/AdminProfilePanel.component';
import { OrganizerProfilePanel } from '../../../organizers/presentation/components/OrganizerProfilePanel.component';
import { AdminStatsService } from '@shared/lib/api/services/AdminStats.service';
import { AnalyticsService } from '@shared/lib/api/services/Analytics.service';
import { ExportReportService } from '@shared/lib/services/ExportReport.service';

export function AdminPage() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalRevenue: 0,
    activeEvents: 0,
    pendingApprovals: 5,
    recentActivity: [
      { id: '1', type: 'user_registration' as const, description: 'Nuevo usuario registrado: María García', timestamp: 'Hace 2 horas', severity: 'low' as const },
      { id: '2', type: 'event_created' as const, description: 'Evento creado: "Conferencia de Tecnología 2024"', timestamp: 'Hace 4 horas', severity: 'medium' as const },
      { id: '3', type: 'payment_received' as const, description: 'Pago recibido: €2,500 por evento "Workshop React"', timestamp: 'Hace 6 horas', severity: 'low' as const }
    ],
    topOrganizers: [
      { id: '1', name: 'Juan Pérez', events: 12, revenue: 15000000, rating: 4.8 },
      { id: '2', name: 'Ana López', events: 8, revenue: 12000000, rating: 4.9 }
    ],
  });
  
  // Sidebar abierto por defecto en desktop, cerrado en móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadDashboardStats();
  }, []);

  // Cargar datos de analytics cuando se accede a la pestaña
  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      loadAnalyticsData();
    }
  }, [activeTab]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      const stats = await AdminStatsService.getDashboardStats();
      setAdminStats(prev => ({
        ...prev,
        totalUsers: stats.totalUsers,
        totalEvents: stats.totalEvents,
        totalRevenue: stats.totalRevenue,
        activeEvents: stats.activeEvents
      }));
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoadingAnalytics(true);
      const data = await AnalyticsService.getAdminAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error al cargar datos de analytics:', error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = async () => {
    console.log('Actualizando datos...');
    setIsRefreshing(true);
    try {
      await loadDashboardStats();
      // Si estamos en la pestaña de analytics, también recargar esos datos
      if (activeTab === 'analytics') {
        await loadAnalyticsData();
      }
    } catch (error) {
      console.error('Error al refrescar datos:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportData = (type: string) => {
    console.log('Exportando datos:', type);
  };

  const handleSystemAction = (action: string) => {
    console.log('Acción del sistema:', action);
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Panel Principal', icon: BarChart3, color: 'text-blue-600', description: 'Resumen general de la plataforma' },
    { id: 'events', label: 'Gestión de Eventos', icon: Calendar, color: 'text-purple-600', description: 'Aprobar y moderar eventos' },
    { id: 'users', label: 'Comunidad', icon: Users, color: 'text-green-600', description: 'Usuarios y organizadores' },
    { id: 'payments', label: 'Finanzas', icon: CreditCard, color: 'text-emerald-600', description: 'Pagos y transacciones' },
    { id: 'analytics', label: 'Reportes', icon: TrendingUp, color: 'text-orange-600', description: 'Análisis y métricas' }
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
              
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-2xl font-bold text-white truncate">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h2>
                  <p className="text-xs md:text-sm text-blue-100 mt-1 truncate">
                    {navigationItems.find(item => item.id === activeTab)?.description}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 md:space-x-3 flex-shrink-0">
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
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">Administrador</p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">Administrador</p>
                      <p className="text-xs text-gray-500">admin@sistema.com</p>
                    </div>
                    <div onClick={() => { console.log('Click en Mi Perfil'); setIsProfileMenuOpen(false); setActiveTab('profile'); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 cursor-pointer transition-colors duration-200">
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </div>
                    <div onClick={() => { console.log('Click en Cerrar Sesión'); setIsProfileMenuOpen(false); handleLogout(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 cursor-pointer transition-colors duration-200">
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

          {/* Content Cards */}
          <div className="space-y-4 w-full max-w-full">
            {activeTab === 'dashboard' && (
              <AdminDashboard stats={adminStats} onRefresh={handleRefresh} onExportData={handleExportData} onSystemAction={handleSystemAction} />
            )}
            {activeTab === 'events' && (
              <EventManagement />
            )}
            {activeTab === 'users' && (
              <UserManagement onViewOrganizerProfile={() => setActiveTab('organizer-profile')} />
            )}
            {activeTab === 'analytics' && (
              isLoadingAnalytics ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : analyticsData ? (
                <AnalyticsDashboard 
                  data={analyticsData} 
                  onExportReport={(format, filters) => {
                    if (format === 'excel') {
                      ExportReportService.exportToExcel(analyticsData, filters);
                    } else if (format === 'pdf') {
                      ExportReportService.exportToPDF(analyticsData, filters);
                    }
                  }}
                  onFilterChange={(filters) => console.log('Filtros:', filters)} 
                  userRole="admin" 
                />
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">No se pudieron cargar los datos de análisis</p>
                </div>
              )
            )}
            {activeTab === 'payments' && (
              <PaymentsDashboard />
            )}
            {activeTab === 'profile' && (
              <AdminProfilePanel />
            )}
            {activeTab === 'organizer-profile' && (
              <OrganizerProfilePanel />
            )}
          </div>
        </div>
      </div>

    </div>
  );
}