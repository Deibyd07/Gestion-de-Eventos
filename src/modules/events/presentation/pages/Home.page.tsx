import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Cpu,
  Facebook,
  Instagram,
  KeyRound,
  Mail,
  MapPin,
  Mic2,
  Music,
  Palette,
  PartyPopper,
  Phone,
  Quote,
  Search,
  Shield,
  Sparkles,
  Star,
  Ticket,
  Trophy,
  Twitter,
  Users,
  UtensilsCrossed,
  Youtube,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useEventStore, Event } from '../../../events/infrastructure/store/Event.store';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { AuthRedirect } from '../../../authentication/presentation/guards/AuthRedirect.guard';
import { LoginRequiredModal } from '../../../authentication/presentation/guards/LoginRequiredModal.guard';
import LiquidEther from '../../../payments/presentation/components/LiquidEther.component';
import { supabase } from '@shared/lib/api/supabase';

// Componente para mostrar cupos reales calculados desde la BD
function EventAttendanceDisplay({ event }: { event: Event }) {
  const [occupiedTickets, setOccupiedTickets] = useState<number>(event.currentAttendees || 0);
  const [totalCapacity, setTotalCapacity] = useState<number>(event.maxAttendees || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        let maxCapacity = event.maxAttendees;
        let currentOccupied = event.currentAttendees;

        // Obtener tipos de entrada para calcular capacidad y disponibilidad
        const { data: ticketTypes, error: ticketError } = await supabase
          .from('tipos_entrada')
          .select('cantidad_maxima, cantidad_disponible')
          .eq('id_evento', event.id);

        if (!ticketError && ticketTypes && ticketTypes.length > 0) {
          const capacitySum = ticketTypes.reduce((sum, t: any) => sum + (t.cantidad_maxima || 0), 0);
          const availableSum = ticketTypes.reduce((sum, t: any) => sum + (t.cantidad_disponible || 0), 0);
          if (capacitySum > 0) {
            maxCapacity = capacitySum;
            currentOccupied = Math.max(0, maxCapacity - availableSum);
          }
        }

        // Obtener asistentes actuales desde la tabla eventos
        const { data: eventoData, error: eventoError } = await supabase
          .from('eventos')
          .select('asistentes_actuales, maximo_asistentes')
          .eq('id', event.id)
          .single();

        if (!eventoError && eventoData) {
          if ((eventoData as any).maximo_asistentes) {
            maxCapacity = (eventoData as any).maximo_asistentes;
          }
          if ((eventoData as any).asistentes_actuales !== undefined && (eventoData as any).asistentes_actuales !== null) {
            currentOccupied = (eventoData as any).asistentes_actuales;
          }
        }

        setTotalCapacity(maxCapacity);
        setOccupiedTickets(currentOccupied);
      } catch (error) {
        console.error('Error fetching availability:', error);
        setTotalCapacity(event.maxAttendees);
        setOccupiedTickets(event.currentAttendees);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [event.id]);

  if (loading) {
    return (
      <span className="text-sm text-slate-500">...</span>
    );
  }

  return (
    <span className="text-sm text-slate-500">
      <span className="font-semibold text-violet-700">{occupiedTickets}</span>
      {' / '}{totalCapacity} cupos
    </span>
  );
}

const liquidEtherProps = {
  colors: ['#7C3AED', '#F97316', '#A78BFA'],
  mouseForce: 19,
  cursorSize: 100,
  isViscous: true,
  viscous: 30,
  iterationsViscous: 32,
  iterationsPoisson: 32,
  resolution: 0.5,
  dt: 0.014,
  BFECC: true,
  isBounce: false,
  autoDemo: false,
  autoSpeed: 0.5,
  autoIntensity: 2.2,
  takeoverDuration: 0.25,
  autoResumeDelay: 1000,
  autoRampDuration: 0.6,
};

export function HomePage() {
  const { featuredEvents, recommendedEvents, loadFeaturedEvents, loadRecommendedEvents, loading, error } = useEventStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: ''
  });

  // No renderizar el fondo animado WebGL si el usuario prefiere menos movimiento
  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    loadFeaturedEvents();
    // Cargar eventos recomendados si el usuario está autenticado
    if (user?.id) {
      loadRecommendedEvents(user.id);
    }
  }, [loadFeaturedEvents, loadRecommendedEvents, user?.id]);

  const handleRequireLogin = (title: string, message: string, action: string) => {
    if (isAuthenticated) {
      return true; // Permitir la acción si está autenticado
    }

    setModalConfig({ title, message, action });
    setShowLoginModal(true);
    return false; // Prevenir la acción si no está autenticado
  };

  const handleEventClick = (eventId: string) => {
    if (handleRequireLogin(
      "Ver detalles del evento",
      "Necesitas una cuenta para ver los detalles completos del evento",
      "Ver detalles del evento"
    )) {
      // Si está autenticado, permitir navegación
      navigate(`/events/${eventId}`, { state: { fromNavigation: true } });
    }
  };

  const handleExploreEvents = () => {
    if (handleRequireLogin(
      "Explorar eventos",
      "Necesitas una cuenta para explorar todos los eventos disponibles",
      "Explorar eventos"
    )) {
      // Si está autenticado, permitir navegación
      navigate('/events', { state: { fromNavigation: true } });
    }
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleExploreEvents();
  };

  const redirectByRole = () => {
    const { user: currentUser } = useAuthStore.getState();
    if (currentUser?.role === 'admin') {
      navigate('/admin', { state: { fromNavigation: true } });
    } else if (currentUser?.role === 'organizer') {
      navigate('/organizer/dashboard', { state: { fromNavigation: true } });
    } else {
      navigate('/events', { state: { fromNavigation: true } });
    }
  };

  const handleLoginClick = () => {
    if (isAuthenticated) {
      redirectByRole();
      return;
    }
    setModalConfig({
      title: 'Inicia sesión',
      message: 'Accede a tu cuenta para descubrir y comprar entradas a los mejores eventos de Colombia',
      action: 'Iniciar sesión'
    });
    setShowLoginModal(true);
  };

  const handleCreateAccount = () => {
    if (isAuthenticated) {
      redirectByRole();
    } else {
      // Si no está autenticado, abrir modal de registro
      setShowRegisterModal(true);
    }
  };

  const categories = [
    { name: 'Música', icon: Music },
    { name: 'Conciertos', icon: Mic2 },
    { name: 'Festivales', icon: PartyPopper },
    { name: 'Deportes', icon: Trophy },
    { name: 'Tecnología', icon: Cpu },
    { name: 'Gastronomía', icon: UtensilsCrossed },
    { name: 'Arte y Cultura', icon: Palette },
    { name: 'Experiencias', icon: Sparkles },
  ];

  const demoAccounts = [
    {
      role: 'Administrador',
      description: 'Panel completo de administración',
      icon: Shield,
      accent: 'bg-orange-500',
      email: 'admin@eventhub.com',
      password: 'admin123',
    },
    {
      role: 'Organizador',
      description: 'Crea y gestiona eventos',
      icon: Calendar,
      accent: 'bg-violet-600',
      email: 'organizador1@eventhub.com',
      password: 'organizador123',
    },
    {
      role: 'Asistente',
      description: 'Explora y compra entradas',
      icon: Users,
      accent: 'bg-violet-400',
      email: 'bayfrox@gmail.com',
      password: 'usuario123',
    },
  ];

  const stats = [
    { value: '1000+', label: 'Eventos publicados', accent: 'text-violet-700' },
    { value: '50K+', label: 'Usuarios activos', accent: 'text-orange-500' },
    { value: '95%', label: 'Satisfacción', accent: 'text-violet-700' },
    { value: '24/7', label: 'Soporte', accent: 'text-orange-500' },
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Gestión Completa',
      description: 'Crea, edita y gestiona todos tus eventos en Colombia desde una sola plataforma intuitiva y profesional.'
    },
    {
      icon: Users,
      title: 'Conexión Nacional',
      description: 'Conecta con comunidades de todo el país y descubre eventos increíbles en cada rincón de Colombia.'
    },
    {
      icon: Shield,
      title: 'Pagos Seguros',
      description: 'Transacciones protegidas con la más alta seguridad y múltiples métodos de pago en pesos colombianos.'
    },
    {
      icon: Star,
      title: 'Experiencias Únicas',
      description: 'Desde conciertos en Bogotá hasta ferias en Medellín, encuentra tu próxima aventura en Colombia.'
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Organizadora de eventos en Bogotá',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      quote: 'EventHub transformó completamente la forma en que gestiono mis eventos a nivel nacional. ¡Increíble!'
    },
    {
      name: 'Carlos Ruiz',
      role: 'Productor de eventos en Medellín',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      quote: 'La mejor plataforma para gestionar eventos en todo el país. La interfaz es perfecta y muy intuitiva.'
    },
    {
      name: 'Ana López',
      role: 'Productora de eventos culturales',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      quote: 'Organicé festivales en Cali, Cartagena y Barranquilla usando EventHub. Los resultados superaron todas mis expectativas.'
    }
  ];

  const displayedEvents = user?.id && recommendedEvents.length > 0 ? recommendedEvents.slice(0, 3) : featuredEvents;

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-purple-50 font-body">
        {/* Floating Navbar */}
        <header className="fixed top-4 left-4 right-4 z-50">
          <nav className="max-w-7xl mx-auto flex items-center justify-between rounded-2xl bg-white/90 backdrop-blur-lg border border-violet-100 shadow-lg shadow-violet-950/10 px-4 sm:px-6 py-3">
            <a href="/" className="flex items-center gap-2 cursor-pointer" aria-label="EventHub - Inicio">
              <img src="/Logo-sin-texto.png" alt="" className="h-10 sm:h-11 w-auto" />
              <span className="font-display text-xl sm:text-2xl leading-none">
                <span className="text-violet-700">Event</span><span className="text-orange-500">Hub</span>
              </span>
            </a>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleLoginClick}
                className="px-3 sm:px-5 py-2.5 text-sm font-semibold text-violet-950 rounded-xl hover:bg-violet-50 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Iniciar sesión
              </button>
              <button
                onClick={handleCreateAccount}
                className="px-4 sm:px-5 py-2.5 text-sm font-semibold text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors duration-200 shadow-md shadow-orange-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
              >
                Crear cuenta
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-950 to-slate-950" style={{ isolation: 'isolate' }}>
          {/* Liquid Ether Background Effect */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            {prefersReducedMotion ? (
              <div className="absolute inset-0 bg-gradient-to-br from-violet-800/40 via-transparent to-orange-900/30" />
            ) : (
              <LiquidEther {...liquidEtherProps} />
            )}
          </div>

          <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{ zIndex: 1 }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-36 md:pt-44 pb-24 sm:pb-28 md:pb-36 pointer-events-none" style={{ zIndex: 2 }}>
            <div className="text-center space-y-6 sm:space-y-8">
              <span className="pointer-events-auto inline-flex items-center gap-2 text-sm font-medium text-violet-100">
                <Sparkles className="w-4 h-4 text-orange-400" aria-hidden="true" />
                La plataforma de eventos de Colombia
              </span>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white leading-tight px-2">
                Vive los mejores
                <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent mt-2 pb-2">
                  eventos de Colombia
                </span>
              </h1>

              <p className="text-lg sm:text-xl md:text-2xl text-violet-100 max-w-3xl mx-auto leading-relaxed px-4 sm:px-2">
                Descubre conciertos, festivales y experiencias únicas en todo el país.
                <span className="hidden sm:inline"> Compra tus entradas de forma segura y conecta con tu comunidad.</span>
              </p>

              {/* Hero Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pointer-events-auto max-w-2xl mx-auto px-4 pt-4">
                <label htmlFor="hero-search" className="sr-only">Buscar eventos</label>
                <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-2xl p-2 shadow-2xl shadow-violet-950/40">
                  <div className="flex items-center flex-1 px-3">
                    <Search className="w-5 h-5 text-violet-400 shrink-0" aria-hidden="true" />
                    <input
                      id="hero-search"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Concierto, festival, ciudad..."
                      className="w-full px-3 py-3 text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                  >
                    Buscar eventos
                  </button>
                </div>
              </form>

              {/* Trust signals */}
              <div className="pointer-events-auto flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-violet-200 px-4">
                {['Pagos 100% seguros', 'Boletas digitales con QR', 'Organizadores verificados'].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-orange-400" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-violet-950 mb-4">
                Explora por categoría
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Conciertos, festivales, deporte, gastronomía y mucho más: encuentra el plan perfecto en tu ciudad.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {categories.map((category, index) => (
                <button
                  key={category.name}
                  onClick={handleExploreEvents}
                  className="group flex flex-col items-center gap-4 p-6 sm:p-8 rounded-3xl border-2 border-violet-100 bg-purple-50 hover:border-violet-400 hover:bg-white hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  <span className={`flex w-14 h-14 items-center justify-center rounded-2xl ${index % 2 === 0 ? 'bg-violet-600' : 'bg-orange-500'} text-white shadow-lg`}>
                    <category.icon className="w-7 h-7" aria-hidden="true" />
                  </span>
                  <span className="font-semibold text-violet-950">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Credentials Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <span className="inline-flex w-12 h-12 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg mb-4">
                <KeyRound className="w-6 h-6" aria-hidden="true" />
              </span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-violet-950 mb-4">
                Prueba la plataforma
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Usa estas cuentas de demostración para explorar cada perfil sin registrarte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {demoAccounts.map((account) => (
                <div
                  key={account.role}
                  className="bg-white rounded-3xl border-2 border-violet-100 p-6 sm:p-8 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-200"
                >
                  <div className="flex items-center justify-center mb-4">
                    <span className={`flex w-14 h-14 items-center justify-center rounded-2xl ${account.accent} text-white shadow-lg`}>
                      <account.icon className="w-7 h-7" aria-hidden="true" />
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-violet-950 text-center mb-2">{account.role}</h3>
                  <p className="text-sm text-slate-600 text-center mb-5">{account.description}</p>
                  <div className="bg-purple-50 rounded-2xl p-4 space-y-3 font-mono text-sm">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1">Email:</span>
                      <span className="text-violet-950 font-semibold break-all">{account.email}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 mb-1">Contraseña:</span>
                      <span className="text-violet-950 font-semibold">{account.password}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="inline-flex items-center gap-2 text-sm text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-violet-500" aria-hidden="true" />
                Cuentas de demostración: siéntete libre de explorar todas las funcionalidades del sistema.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center rounded-3xl border-2 border-violet-100 bg-purple-50 p-6 sm:p-8 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-200"
                >
                  <div className={`font-display text-4xl sm:text-5xl ${stat.accent} mb-2`}>{stat.value}</div>
                  <div className="text-slate-600 font-semibold text-sm sm:text-base">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14 md:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-violet-950 mb-4 sm:mb-6">
                Todo lo que necesitas
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-3xl mx-auto px-4">
                Desde la creación hasta el control de asistencia, EventHub te ofrece todas las herramientas
                para hacer de tu evento un éxito rotundo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="p-8 bg-white rounded-3xl border-2 border-violet-100 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-200"
                >
                  <span className={`flex w-14 h-14 items-center justify-center rounded-2xl ${index % 2 === 0 ? 'bg-violet-600' : 'bg-orange-500'} text-white shadow-lg mb-6`}>
                    <feature.icon className="w-7 h-7" aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-bold text-violet-950 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Preview */}
        <section className="py-16 sm:py-20 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14 md:mb-16">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-violet-950 mb-4 sm:mb-6">
                {user?.id && recommendedEvents.length > 0 ? 'Eventos recomendados para ti' : 'Eventos destacados'}
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-slate-600">
                {user?.id && recommendedEvents.length > 0
                  ? 'Basados en tus intereses y organizadores que sigues'
                  : 'Descubre algunos de los eventos más populares de nuestra plataforma'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
              {loading ? (
                // Estados de carga
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-3xl border-2 border-violet-100 overflow-hidden animate-pulse w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md">
                    <div className="h-48 bg-violet-100"></div>
                    <div className="p-6">
                      <div className="h-6 bg-violet-100 rounded mb-2"></div>
                      <div className="h-4 bg-violet-100 rounded mb-4"></div>
                      <div className="h-4 bg-violet-100 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : error ? (
                // Estado de error
                <div className="w-full text-center py-12">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-orange-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-violet-950 mb-2">Error al cargar eventos</h3>
                  <p className="text-slate-600 mb-4">{error}</p>
                  <button
                    onClick={() => loadFeaturedEvents()}
                    className="px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : displayedEvents.length > 0 ? (
                // Eventos destacados o recomendados
                displayedEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event.id)}
                    className="bg-white rounded-3xl border-2 border-violet-100 overflow-hidden hover:border-violet-300 hover:shadow-2xl hover:shadow-violet-200/60 transition-all duration-300 group flex flex-col w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-violet-100 to-purple-200 flex items-center justify-center">
                          <Ticket className="w-16 h-16 text-violet-300" aria-hidden="true" />
                        </div>
                      )}

                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white rounded-xl shadow-lg px-3 py-2">
                        <div className="text-center">
                          <div className="font-display text-2xl text-violet-950 leading-none">
                            {(() => {
                              const [year, month, day] = event.date.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.getDate();
                            })()}
                          </div>
                          <div className="text-xs text-slate-500 uppercase mt-1 font-semibold">
                            {(() => {
                              const [year, month, day] = event.date.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-violet-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                        {event.category}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-violet-950 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-slate-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1 text-violet-400" aria-hidden="true" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-violet-400" aria-hidden="true" />
                          <EventAttendanceDisplay event={event} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-lg font-bold text-orange-600">
                          {event.price === 0 ? 'Gratis' : `$${event.price.toLocaleString()} COP`}
                        </div>
                        <button
                          onClick={() => handleEventClick(event.id)}
                          className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors duration-200 shadow-md shadow-violet-600/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // Sin eventos
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-violet-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-violet-950 mb-2">No hay eventos disponibles</h3>
                  <p className="text-slate-600 mb-4">Pronto tendremos eventos increíbles para ti</p>
                </div>
              )}
            </div>

            {displayedEvents.length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleExploreEvents}
                  className="inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-orange-500/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
                >
                  Ver Todos los Eventos
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-purple-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-14">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-violet-950 mb-4">
                Historias que conectan
              </h2>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
                Organizadores de todo el país ya confían en EventHub para hacer crecer sus eventos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((testimonial) => (
                <figure
                  key={testimonial.name}
                  className="bg-white rounded-3xl border-2 border-violet-100 p-8 flex flex-col hover:border-violet-300 hover:shadow-xl hover:shadow-violet-200/50 transition-all duration-200"
                >
                  <Quote className="w-8 h-8 text-violet-300 mb-4" aria-hidden="true" />
                  <div className="flex gap-1 mb-4" aria-label="Calificación: 5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-slate-600 leading-relaxed italic mb-6 flex-grow">
                    "{testimonial.quote}"
                  </blockquote>
                  <figcaption className="flex items-center gap-3">
                    <img
                      src={testimonial.image}
                      alt={`Foto de ${testimonial.name}`}
                      loading="lazy"
                      className="w-12 h-12 rounded-full bg-violet-100 border-2 border-violet-200"
                    />
                    <div>
                      <div className="font-semibold text-violet-950">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role}</div>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-20 md:py-24 bg-gradient-to-br from-violet-950 via-purple-950 to-slate-950 relative overflow-hidden" style={{ isolation: 'isolate' }}>
          {/* Liquid Ether Background Effect */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            {prefersReducedMotion ? (
              <div className="absolute inset-0 bg-gradient-to-br from-violet-800/40 via-transparent to-orange-900/30" />
            ) : (
              <LiquidEther {...liquidEtherProps} />
            )}
          </div>

          <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{ zIndex: 1 }}></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none" style={{ zIndex: 2 }}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-white mb-6">
              Conectando a Colombia a través de eventos
            </h2>
            <p className="text-lg sm:text-xl text-violet-100 mb-8 leading-relaxed">
              EventHub es la plataforma que une a las comunidades de todo el país.
              Desde conciertos masivos hasta festivales culturales,
              aquí encuentras todos los eventos que hacen vibrar a Colombia.
            </p>

            <button
              onClick={handleCreateAccount}
              className="pointer-events-auto inline-flex items-center px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors duration-200 shadow-lg shadow-orange-500/40 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              Comienza gratis hoy
              <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 pointer-events-auto">
              <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-colors duration-200">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Descubre Eventos</h3>
                <p className="text-violet-100 text-sm">
                  Encuentra eventos increíbles en todo Colombia, desde Bogotá hasta la Costa
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-colors duration-200">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Crea Eventos</h3>
                <p className="text-violet-100 text-sm">
                  Organiza y gestiona tus propios eventos de manera profesional
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 hover:bg-white/20 transition-colors duration-200">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Compra Segura</h3>
                <p className="text-violet-100 text-sm">
                  Transacciones protegidas y boletas digitales seguras
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-violet-950 text-violet-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
              {/* Brand column */}
              <div className="col-span-2">
                <a href="/" className="flex items-center gap-2.5 cursor-pointer w-fit" aria-label="EventHub - Inicio">
                  <img src="/Logo-sin-texto.png" alt="" className="h-11 w-auto" />
                  <span className="font-display text-2xl leading-none">
                    <span className="text-white">Event</span><span className="text-orange-400">Hub</span>
                  </span>
                </a>
                <p className="mt-4 text-sm text-violet-300 leading-relaxed max-w-xs">
                  La plataforma nacional para descubrir, crear y vivir los mejores eventos de Colombia.
                  Entradas seguras, organizadores verificados.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {[
                    { icon: Instagram, label: 'Instagram' },
                    { icon: Facebook, label: 'Facebook' },
                    { icon: Twitter, label: 'Twitter' },
                    { icon: Youtube, label: 'YouTube' },
                  ].map((social) => (
                    <a
                      key={social.label}
                      href="#"
                      aria-label={social.label}
                      className="flex w-10 h-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-violet-200 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-950"
                    >
                      <social.icon className="w-5 h-5" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Explorar */}
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-white mb-4">Explorar</h3>
                <ul className="space-y-3 text-sm">
                  {['Eventos', 'Categorías', 'Conciertos', 'Festivales', 'Deportes'].map((item) => (
                    <li key={item}>
                      <button
                        onClick={handleExploreEvents}
                        className="text-violet-300 hover:text-orange-400 transition-colors duration-200 cursor-pointer text-left"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Empresa */}
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-white mb-4">Empresa</h3>
                <ul className="space-y-3 text-sm">
                  {['Sobre nosotros', 'Cómo funciona', 'Crea tu evento', 'Organizadores', 'Blog'].map((item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-violet-300 hover:text-orange-400 transition-colors duration-200 cursor-pointer"
                      >
                        {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contacto */}
              <div>
                <h3 className="font-display text-sm uppercase tracking-wider text-white mb-4">Contacto</h3>
                <ul className="space-y-3 text-sm">
                  <li>
                    <a href="mailto:hola@eventhub.com" className="flex items-center gap-2.5 text-violet-300 hover:text-orange-400 transition-colors duration-200 cursor-pointer">
                      <Mail className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      hola@eventhub.com
                    </a>
                  </li>
                  <li>
                    <a href="tel:+576011234567" className="flex items-center gap-2.5 text-violet-300 hover:text-orange-400 transition-colors duration-200 cursor-pointer">
                      <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                      +57 601 123 4567
                    </a>
                  </li>
                  <li className="flex items-center gap-2.5 text-violet-300">
                    <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                    Bogotá, Colombia
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-violet-400 text-center sm:text-left">
                © {new Date().getFullYear()} EventHub · Conectando a Colombia a través de eventos
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className="text-violet-400 hover:text-white transition-colors duration-200 cursor-pointer">Términos</a>
                <a href="#" className="text-violet-400 hover:text-white transition-colors duration-200 cursor-pointer">Privacidad</a>
                <a href="#" className="text-violet-400 hover:text-white transition-colors duration-200 cursor-pointer">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Login Required Modal */}
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        action={modalConfig.action}
      />

      {/* Register Modal */}
      <LoginRequiredModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        title="Crear Cuenta Gratis"
        message="Únete a la comunidad de EventHub y descubre eventos increíbles en toda Colombia"
        action="Crear cuenta"
        defaultToRegister={true}
      />
    </AuthRedirect>
  );
}
