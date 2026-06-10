import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, LogIn, UserPlus, Lock, Mail, Eye, EyeOff, User, Phone, MapPin, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

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
  const navigate = useNavigate();

  // Efecto para detectar cuando la autenticación se complete (solo para login)
  useEffect(() => {
    if (isLoggingIn && isAuthenticated && user) {
      setIsAuthenticating(true);
      // Redirigir inmediatamente según el rol
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        // Navegar según el rol del usuario
        if (user.role === 'organizer') {
          navigate('/organizer/dashboard');
        } else if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/events');
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isLoggingIn, isRegistering, isAuthenticated, user, navigate]);

  // Efecto para cerrar el modal cuando la redirección se complete
  useEffect(() => {
    if (isRedirecting) {
      // Cerrar el modal después de un breve delay
      const timer = setTimeout(() => {
        onClose();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isRedirecting, onClose]);

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

      // Intentar registro
      await register({
        name,
        email,
        password,
        phone: phone || undefined,
        location: location || undefined,
        role: 'attendee'
      });

      // Solo si el registro fue exitoso (sin errores), redirigir a sala de espera
      onClose();
      navigate(`/auth/verify-email?email=${encodeURIComponent(email)}`, { replace: true });
    } catch (err: any) {
      // Si hay error, mostrar el mensaje y NO redirigir
      console.error('[LoginRequiredModal] Error en registro:', err);
      const errorMessage = err?.message || 'Error al crear la cuenta. Por favor, intenta de nuevo.';
      setError(errorMessage);
      setIsRegistering(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Clases compartidas para inputs (estilo del nuevo sistema de diseño)
  const inputClass =
    "w-full pl-10 pr-4 py-3 bg-purple-50 border-2 border-violet-100 rounded-xl text-sm text-violet-950 placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 transition-colors duration-200";
  const inputWithToggleClass =
    "w-full pl-10 pr-11 py-3 bg-purple-50 border-2 border-violet-100 rounded-xl text-sm text-violet-950 placeholder:text-slate-400 focus:bg-white focus:border-violet-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 transition-colors duration-200";
  const labelClass = "block text-xs sm:text-sm font-medium text-violet-950 mb-1.5";
  const iconClass = "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-violet-400";
  const toggleBtnClass =
    "absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors duration-200 cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-violet-950/60 backdrop-blur-md font-body">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl shadow-violet-950/30 max-w-md w-full mx-2 sm:mx-4 border border-violet-100 overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-violet-100">
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-slate-400 hover:text-violet-700 hover:bg-violet-50 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
          </button>

          <div className="pr-8 sm:pr-10">
            <div className="flex items-center gap-2 mb-3">
              <img src="/Logo-sin-texto.png" alt="" className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0" />
              <span className="font-display text-lg sm:text-xl leading-none">
                <span className="text-violet-700">Event</span><span className="text-orange-500">Hub</span>
              </span>
            </div>
            <h2 className="font-display text-lg sm:text-xl text-violet-950 leading-tight">{title}</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {isLoggingIn || isAuthenticating || isRedirecting ? (
            // Pantalla de carga solo para login (registro redirige directamente)
            <div className="text-center py-6 sm:py-8" aria-live="polite">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse shadow-lg shadow-orange-500/30">
                <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-white" aria-hidden="true" />
              </div>
              <h3 className="font-display text-base sm:text-lg text-violet-950 mb-2 leading-tight">
                {isRedirecting
                  ? '¡Bienvenido de vuelta!'
                  : isAuthenticating
                    ? '¡Bienvenido de vuelta!'
                    : 'Iniciando sesión...'
                }
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed px-2">
                {isRedirecting
                  ? (user?.role === 'organizer'
                      ? 'Configurando tu panel de organizador...'
                      : 'Redirigiendo a tu dashboard...')
                  : isAuthenticating
                    ? (user?.role === 'organizer'
                        ? 'Preparando tu panel de organizador...'
                        : 'Preparando tu dashboard...')
                    : 'Verificando credenciales...'
                }
              </p>
              <div className="flex justify-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 border-3 sm:border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : !showLoginForm && !showRegisterForm ? (
            // Vista inicial
            <>
              <div className="text-center mb-4 sm:mb-6">
                <img src="/Logo-sin-texto.png" alt="" className="h-20 sm:h-24 w-auto mx-auto mb-3 sm:mb-4" />
                <h3 className="font-display text-lg sm:text-xl text-violet-950 mb-2 leading-tight">
                  Únete a EventHub
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed px-2">
                  Crea una cuenta gratis para acceder a todas las funcionalidades
                </p>
              </div>

              {/* Benefits */}
              <div className="bg-purple-50 rounded-2xl border-2 border-violet-100 p-4 sm:p-5 mb-4 sm:mb-6">
                <h4 className="text-xs sm:text-sm font-semibold text-violet-950 mb-3 sm:mb-4">Beneficios de tu cuenta:</h4>
                <div className="space-y-2.5 sm:space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 mr-2.5 sm:mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">Ver detalles completos de eventos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 mr-2.5 sm:mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">Comprar entradas de forma segura</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 mr-2.5 sm:mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">Crear y gestionar eventos</span>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 mr-2.5 sm:mr-3 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">Recibir notificaciones personalizadas</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 sm:space-y-3">
                <button
                  onClick={() => setShowLoginForm(true)}
                  className="w-full flex items-center justify-center px-4 py-3 sm:py-3.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors duration-200 shadow-md shadow-violet-600/20 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                  Iniciar Sesión
                </button>

                <button
                  onClick={() => setShowRegisterForm(true)}
                  className="w-full flex items-center justify-center px-4 py-3 sm:py-3.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200 shadow-md shadow-orange-500/30 text-sm sm:text-base cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                >
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" aria-hidden="true" />
                  Crear Cuenta Gratis
                </button>
              </div>
            </>
          ) : showLoginForm ? (
            // Formulario de login
            <>
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display text-xl sm:text-2xl text-violet-950 mb-2 leading-tight">
                  Iniciar Sesión
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Ingresa tus credenciales para continuar
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                {error && (
                  <div className="bg-orange-50 border-2 border-orange-200 text-orange-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm" aria-live="polite">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={iconClass} aria-hidden="true" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={labelClass}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className={iconClass} aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputWithToggleClass}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className={toggleBtnClass}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-600/20 text-sm sm:text-base cursor-pointer"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-3 sm:mt-4 text-center">
                <button
                  onClick={() => setShowLoginForm(false)}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-600 hover:text-violet-700 font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Volver
                </button>
              </div>
            </>
          ) : (
            // Formulario de registro
            <>
              <div className="mb-4 sm:mb-6">
                <h3 className="font-display text-xl sm:text-2xl text-violet-950 mb-2 leading-tight">
                  Crear Cuenta
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  Completa el formulario para registrarte
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                {error && (
                  <div className="bg-orange-50 border-2 border-orange-200 text-orange-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm" aria-live="polite">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="name" className={labelClass}>
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className={iconClass} aria-hidden="true" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <div className="relative">
                    <Mail className={iconClass} aria-hidden="true" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Teléfono (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className={iconClass} aria-hidden="true" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className={labelClass}>
                    Ubicación (Opcional)
                  </label>
                  <div className="relative">
                    <MapPin className={iconClass} aria-hidden="true" />
                    <input
                      id="location"
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className={inputClass}
                      placeholder="Ej: Bogotá, Medellín, Cali..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={labelClass}>
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className={iconClass} aria-hidden="true" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputWithToggleClass}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className={toggleBtnClass}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className={iconClass} aria-hidden="true" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={inputWithToggleClass}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      className={toggleBtnClass}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-500/30 text-sm sm:text-base cursor-pointer"
                >
                  {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </button>
              </form>

              <div className="mt-3 sm:mt-4 text-center">
                <button
                  onClick={() => setShowRegisterForm(false)}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-slate-600 hover:text-violet-700 font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Volver
                </button>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="mt-4 sm:mt-6 text-center px-2">
            <p className="text-xs text-slate-500 leading-relaxed">
              Al continuar, aceptas nuestros{' '}
              <Link to="/terms" className="text-violet-600 hover:text-violet-700 hover:underline font-medium">
                Términos de Servicio
              </Link>
              {' '}y{' '}
              <Link to="/privacy" className="text-violet-600 hover:text-violet-700 hover:underline font-medium">
                Política de Privacidad
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
