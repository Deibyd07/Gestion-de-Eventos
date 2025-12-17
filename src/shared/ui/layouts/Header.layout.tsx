import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, ShoppingCart, Menu, X, Search, LogOut, Settings, Shield, Bell } from 'lucide-react';
import { useAuthStore } from '../../../modules/authentication/infrastructure/store/Auth.store';
import { useCartStore } from '../../../modules/payments/infrastructure/store/Cart.store';
import { useNotificationStore } from '../../../modules/notifications/infrastructure/store/Notification.store';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();
  const { items } = useCartStore();
  const { unreadCount, loadUserNotifications } = useNotificationStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Cargar notificaciones cuando el usuario está autenticado
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadUserNotifications(user.id);
      
      // Actualizar cada 30 segundos
      const interval = setInterval(() => {
        loadUserNotifications(user.id);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id, loadUserNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-gradient-to-r from-purple-600/90 via-purple-600/90 to-blue-500/90 backdrop-blur-md shadow-xl border-b border-white/20 fixed top-0 left-0 right-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              EventHub
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/events" 
              className={`flex items-center space-x-1 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                isActive('/events') 
                  ? 'text-white bg-white/20 font-medium shadow-lg border border-white/30' 
                  : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explorar</span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                to="/tickets" 
                className={`flex items-center space-x-1 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                  isActive('/tickets')
                    ? 'text-white bg-white/20 font-medium shadow-lg border border-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Mis Entradas</span>
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'organizer' && (
              <Link 
                to="/organizer/dashboard" 
                className={`flex items-center space-x-1 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                  isActive('/organizer/dashboard')
                    ? 'text-white bg-white/20 font-medium shadow-lg border border-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
            )}
            
            {isAuthenticated && user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className={`flex items-center space-x-1 px-4 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 ${
                  isActive('/admin')
                    ? 'text-white bg-white/20 font-medium shadow-lg border border-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Administración</span>
              </Link>
            )}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Notifications Bell - Desktop only */}
                <Link 
                  to="/notifications" 
                  className="hidden md:block relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-white/20"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* Shopping Cart */}
                <Link 
                  to="/checkout" 
                  className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-white/20"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center shadow-lg">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Menu - Desktop only */}
                <div className="hidden md:block relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-white/20"
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-white/30 shadow-lg"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-white">
                      {user?.name}
                    </span>
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-xl border border-white/20 py-1 z-50">
                      <div className="px-4 py-3 border-b border-gray-100/50">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        Mi Perfil
                      </Link>
                      
                      <Link
                        to="/followed-organizers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Organizadores Seguidos</span>
                      </Link>
                      
                      <Link
                        to="/tickets"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Mis Entradas</span>
                      </Link>
                      
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          <Shield className="w-4 h-4" />
                          <span>Panel de Administración</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/80 backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-white/80 hover:text-white font-medium transition-colors duration-200 hover:bg-white/10 rounded-xl backdrop-blur-sm"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  to="/register"
                  className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium shadow-lg hover:shadow-xl border border-white/30"
                >
                  Registrarse
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-white/20"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 pb-4">
            <div className="pt-4 space-y-2">
              {/* User Profile Section in Mobile */}
              {isAuthenticated && (
                <div className="px-4 py-3 mb-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500/80 to-blue-500/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-white/70">{user?.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <Link 
                to="/events"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                  isActive('/events')
                    ? 'text-white bg-white/20 shadow-lg border border-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-5 h-5" />
                <span>Explorar Eventos</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link 
                    to="/profile"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                      isActive('/profile')
                        ? 'text-white bg-white/20 shadow-lg border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Mi Perfil</span>
                  </Link>

                  <Link 
                    to="/tickets"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                      isActive('/tickets')
                        ? 'text-white bg-white/20 shadow-lg border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Mis Entradas</span>
                  </Link>

                  <Link 
                    to="/followed-organizers"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                      isActive('/followed-organizers')
                        ? 'text-white bg-white/20 shadow-lg border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Organizadores Seguidos</span>
                  </Link>

                  <Link 
                    to="/notifications"
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                      isActive('/notifications')
                        ? 'text-white bg-white/20 shadow-lg border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <Bell className="w-5 h-5" />
                      <span>Notificaciones</span>
                    </div>
                    {unreadCount > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link 
                    to="/checkout"
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                      isActive('/checkout')
                        ? 'text-white bg-white/20 shadow-lg border border-white/30'
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="w-5 h-5" />
                      <span>Carrito</span>
                    </div>
                    {cartItemsCount > 0 && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        {cartItemsCount}
                      </span>
                    )}
                  </Link>
                </>
              )}
              
              {isAuthenticated && user?.role === 'organizer' && (
                <Link 
                  to="/organizer/dashboard"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                    isActive('/organizer/dashboard')
                      ? 'text-white bg-white/20 shadow-lg border border-white/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {isAuthenticated && user?.role === 'admin' && (
                <Link 
                  to="/admin"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 backdrop-blur-sm ${
                    isActive('/admin')
                      ? 'text-white bg-white/20 shadow-lg border border-white/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10 hover:shadow-lg hover:border hover:border-white/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  <span>Panel de Administración</span>
                </Link>
              )}

              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 backdrop-blur-sm transition-all duration-200 border border-transparent hover:border-red-400/30"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              )}
              
              {!isAuthenticated && (
                <div className="pt-4 space-y-2">
                  <Link 
                    to="/login"
                    className="block px-4 py-3 text-center border border-white/30 rounded-xl text-white font-medium hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                  <Link 
                    to="/register"
                    className="block px-4 py-3 text-center bg-white/20 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/30 transition-all duration-200 shadow-lg border border-white/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Overlay for profile menu */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProfileMenuOpen(false)}
        />
      )}
    </header>
  );
}