import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, LogIn, UserPlus, Lock, Calendar, Users, Mail, Eye, EyeOff, User, Phone, MapPin, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../../core/stores/authStore';

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  action?: string;
  defaultToRegister?: boolean;
}

export function LoginRequiredModal({ 
  isOpen, 
  onClose, 
  title = "Inicia sesión para continuar",
  message = "Necesitas una cuenta para acceder a esta funcionalidad",
  action = "Ver detalles del evento",
  defaultToRegister = false
}: LoginRequiredModalProps) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState('');
  const { login, register, isAuthenticated, user } = useAuthStore();

  // Efecto para detectar cuando la autenticación se complete
  useEffect(() => {
    if ((isLoggingIn || isRegistering) && isAuthenticated && user) {
      setIsAuthenticating(true);
      // Para organizadores, esperar un poco más antes de marcar como redirigiendo
      const delay = user.role === 'organizer' ? 1000 : 500;
      const timer = setTimeout(() => {
        setIsRedirecting(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isLoggingIn, isRegistering, isAuthenticated, user]);

  // Efecto para cerrar el modal cuando la redirección se complete
  useEffect(() => {
    if (isRedirecting) {
      // Esperar más tiempo para organizadores ya que tienen redirección más compleja
      const delay = user?.role === 'organizer' ? 4000 : 2500;
      const timer = setTimeout(() => {
        onClose();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [isRedirecting, onClose, user?.role]);

  // Efecto para abrir directamente el formulario de registro si defaultToRegister es true
  useEffect(() => {
    if (isOpen && defaultToRegister) {
      setShowRegisterForm(true);
    }
  }, [isOpen, defaultToRegister]);

  // Efecto para resetear estados cuando el modal se cierre
  useEffect(() => {
    if (!isOpen) {
      setIsLoggingIn(false);
      setIsRegistering(false);
      setIsAuthenticating(false);
      setIsRedirecting(false);
      setShowLoginForm(false);
      setShowRegisterForm(false);
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhone('');
      setLocation('');
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setIsLoggingIn(true);
      setError('');
      await login(email, password);
      // No cerramos inmediatamente, dejamos que el estado de carga se muestre
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, intenta de nuevo.');
      setIsLoggingIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setIsLoading(true);
      setIsRegistering(true);
      setError('');
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        location: location || undefined,
        role: 'attendee'
      });
      // No cerramos inmediatamente, dejamos que el estado de carga se muestre
    } catch (err) {
      setError('Error al crear la cuenta. Por favor, intenta de nuevo.');
      setIsRegistering(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100 overflow-hidden">
        {/* Header */}
        <div className="relative bg-white px-6 pt-6 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoggingIn || isRegistering || isAuthenticating || isRedirecting ? (
            // Pantalla de carga después del login/registro
            <div className="text-center py-8">
              <div className={`w-16 h-16 bg-gradient-to-br ${isLoggingIn ? 'from-green-600 to-emerald-600' : 'from-blue-600 to-indigo-600'} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
                {isLoggingIn ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {isRedirecting 
                  ? (isLoggingIn ? '¡Bienvenido de vuelta!' : '¡Cuenta creada exitosamente!')
                  : isAuthenticating 
                    ? (isLoggingIn ? '¡Bienvenido de vuelta!' : '¡Cuenta creada exitosamente!')
                    : (isLoggingIn ? 'Iniciando sesión...' : 'Creando cuenta...')
                }
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {isRedirecting 
                  ? (user?.role === 'organizer' 
                      ? 'Configurando tu panel de organizador...' 
                      : 'Redirigiendo a tu dashboard...')
                  : isAuthenticating 
                    ? (user?.role === 'organizer' 
                        ? 'Preparando tu panel de organizador...' 
                        : 'Preparando tu dashboard...')
                    : (isLoggingIn ? 'Verificando credenciales...' : 'Configurando tu nueva cuenta...')
                }
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : !showLoginForm && !showRegisterForm ? (
            // Vista inicial
            <>
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-100">
                  <Calendar className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Únete a EventHub
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Crea una cuenta gratis para acceder a todas las funcionalidades
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-gray-50 rounded-2xl p-5 mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Beneficios de tu cuenta:</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Ver detalles completos de eventos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Comprar entradas de forma segura</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Crear y gestionar eventos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Recibir notificaciones personalizadas</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Iniciar Sesión
                </button>
                
                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="w-full flex items-center justify-center px-4 py-3.5 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Crear Cuenta Gratis
                </button>
              </div>
            </>
          ) : showLoginForm ? (
            // Formulario de login
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Iniciar Sesión
                </h3>
                <p className="text-gray-600 text-sm">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowLoginForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  ← Volver
                </button>
              </div>
            </>
          ) : (
            // Formulario de registro
            <>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Crear Cuenta
                </h3>
                <p className="text-gray-600 text-sm">
                  Completa el formulario para registrarte
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Teléfono (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Ubicación (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="Zarzal, Valle del Cauca"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowRegisterForm(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  ← Volver
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Al continuar, aceptas nuestros{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">
                Términos de Servicio
              </Link>
              {' '}y{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
