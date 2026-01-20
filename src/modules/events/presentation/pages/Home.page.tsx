import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Shield, Star, ArrowRight, Play, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
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
      <span className="text-sm text-gray-600">...</span>
    );
  }

  return (
    <span className="text-sm text-gray-600">
      <span className="font-semibold text-blue-600">{occupiedTickets}</span>
      {' / '}{totalCapacity} cupos
    </span>
  );
}

export function HomePage() {
  const { featuredEvents, recommendedEvents, loadFeaturedEvents, loadRecommendedEvents, loading, error } = useEventStore();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: ''
  });

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

  const handleCreateAccount = () => {
    if (isAuthenticated) {
      // Si ya está autenticado, redirigir según su rol
      const { user } = useAuthStore.getState();
      if (user?.role === 'admin') {
        navigate('/admin', { state: { fromNavigation: true } });
      } else if (user?.role === 'organizer') {
        navigate('/organizer/dashboard', { state: { fromNavigation: true } });
      } else {
        navigate('/events', { state: { fromNavigation: true } });
      }
    } else {
      // Si no está autenticado, abrir modal de registro
      setShowRegisterModal(true);
    }
  };

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

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900" style={{ isolation: 'isolate' }}>
          {/* Liquid Ether Background Effect */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <LiquidEther
              colors={['#5227FF', '#FF9FFE', '#B19EEF']}
              mouseForce={19}
              cursorSize={100}
              isViscous={true}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              dt={0.014}
              BFECC={true}
              isBounce={false}
              autoDemo={false}
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={1000}
              autoRampDuration={0.6}
            />
          </div>

          <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{ zIndex: 1 }}></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-32 pb-40 sm:pb-28 md:pb-36 pointer-events-none" style={{ zIndex: 2 }}>
            <div className="text-center space-y-4 sm:space-y-6 md:space-y-8 pointer-events-none">
              <h1 className="text-5xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight px-2">
                Eventos en
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-500 bg-clip-text text-transparent mt-1">
                  Colombia
                </span>
              </h1>

              <p className="text-lg sm:text-lg md:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed px-4 sm:px-2">
                La plataforma nacional para eventos en todo Colombia.
                <span className="hidden sm:inline"> Conecta con comunidades de todo el país y descubre eventos únicos.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-16 sm:pt-20 md:pt-24 pointer-events-auto px-4">
                <button
                  onClick={handleExploreEvents}
                  className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base min-w-[170px] sm:w-auto justify-center"
                >
                  Explorar Eventos
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>

                <button
                  onClick={handleCreateAccount}
                  className="group inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base min-w-[170px] sm:w-auto justify-center"
                >
                  Crear Cuenta
                  <Play className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Credentials Section */}
        <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                🎯 Prueba el Proyecto
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Usa estas credenciales para explorar diferentes perfiles y funcionalidades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Admin Demo */}
              <div className="bg-gradient-to-br from-white to-red-50 backdrop-blur-lg shadow-lg border-2 border-red-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Administrador</h3>
                <p className="text-sm text-gray-600 text-center mb-4">Panel completo de administración</p>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 space-y-2 font-mono text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Email:</span>
                    <span className="text-gray-900 font-semibold break-all">admin@eventhub.com</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Contraseña:</span>
                    <span className="text-gray-900 font-semibold">admin123</span>
                  </div>
                </div>
              </div>

              {/* Organizer Demo */}
              <div className="bg-gradient-to-br from-white to-purple-50 backdrop-blur-lg shadow-lg border-2 border-purple-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Organizador</h3>
                <p className="text-sm text-gray-600 text-center mb-4">Crea y gestiona eventos</p>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 space-y-2 font-mono text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Email:</span>
                    <span className="text-gray-900 font-semibold break-all">organizador1@eventhub.com</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Contraseña:</span>
                    <span className="text-gray-900 font-semibold">organizador123</span>
                  </div>
                </div>
              </div>

              {/* Attendee Demo */}
              <div className="bg-gradient-to-br from-white to-blue-50 backdrop-blur-lg shadow-lg border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Asistente</h3>
                <p className="text-sm text-gray-600 text-center mb-4">Explora y compra entradas</p>
                <div className="bg-white/80 backdrop-blur rounded-lg p-4 space-y-2 font-mono text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Email:</span>
                    <span className="text-gray-900 font-semibold break-all">bayfrox@gmail.com</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 mb-1">Contraseña:</span>
                    <span className="text-gray-900 font-semibold">usuario123</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500 italic">
                💡 Estas son cuentas de demostración. Siéntete libre de explorar todas las funcionalidades del sistema.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 sm:py-12 md:py-20 bg-gradient-to-br from-gray-50/80 to-blue-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1 sm:mb-2">1000+</div>
                <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Eventos</div>
              </div>
              <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-1 sm:mb-2">50K+</div>
                <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Usuarios</div>
              </div>
              <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1 sm:mb-2">95%</div>
                <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Satisfacción</div>
              </div>
              <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-1 sm:mb-2">24/7</div>
                <div className="text-gray-700 font-semibold text-xs sm:text-sm md:text-base">Soporte</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 md:py-24 bg-gradient-to-br from-gray-50/80 to-blue-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 md:mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
                Todo lo que necesitas
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                Desde la creación hasta el control de asistencia, EventHub te ofrece todas las herramientas
                para hacer de tu evento un éxito rotundo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group p-8 bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Preview */}
        <section className="py-24 bg-gradient-to-br from-gray-50/80 to-blue-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {user?.id && recommendedEvents.length > 0 ? 'Eventos Recomendados Para Ti' : 'Eventos Destacados'}
              </h2>
              <p className="text-xl text-gray-600">
                {user?.id && recommendedEvents.length > 0 
                  ? 'Basados en tus intereses y organizadores que sigues'
                  : 'Descubre algunos de los eventos más populares de nuestra plataforma'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
              {loading ? (
                // Estados de carga
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-6">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : error ? (
                // Estado de error
                <div className="w-full text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar eventos</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={() => loadFeaturedEvents()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              ) : (user?.id && recommendedEvents.length > 0 ? recommendedEvents.slice(0, 3) : featuredEvents).length > 0 ? (
                // Eventos destacados o recomendados
                (user?.id && recommendedEvents.length > 0 ? recommendedEvents.slice(0, 3) : featuredEvents).map((event) => (
                  <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1 flex flex-col w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.5rem)] max-w-md">
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      {event.image ? (
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      {/* Date Badge */}
                      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900 leading-none">
                            {(() => {
                              const [year, month, day] = event.date.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.getDate();
                            })()}
                          </div>
                          <div className="text-xs text-gray-600 uppercase mt-1">
                            {(() => {
                              const [year, month, day] = event.date.split('-').map(Number);
                              const date = new Date(year, month - 1, day);
                              return date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
                            })()}
                          </div>
                        </div>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg">
                        {event.category}
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1 text-gray-400" />
                          <EventAttendanceDisplay event={event} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="text-right">
                          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {event.price === 0 ? 'Gratis' : `$${event.price.toLocaleString()} COP`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEventClick(event.id)}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
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
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay eventos disponibles</h3>
                  <p className="text-gray-600 mb-4">Pronto tendremos eventos increíbles para ti</p>
                </div>
              )}
            </div>

            {(user?.id && recommendedEvents.length > 0 ? recommendedEvents.slice(0, 3) : featuredEvents).length > 0 && (
              <div className="text-center">
                <button
                  onClick={handleExploreEvents}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Ver Todos los Eventos
                  <ArrowRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 relative overflow-hidden" style={{ isolation: 'isolate' }}>
          {/* Liquid Ether Background Effect */}
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <LiquidEther
              colors={['#5227FF', '#FF9FFE', '#B19EEF']}
              mouseForce={19}
              cursorSize={100}
              isViscous={true}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              dt={0.014}
              BFECC={true}
              isBounce={false}
              autoDemo={false}
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={1000}
              autoRampDuration={0.6}
            />
          </div>

          <div className="absolute inset-0 bg-black/30 pointer-events-none" style={{ zIndex: 1 }}></div>
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pointer-events-none" style={{ zIndex: 2 }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Conectando a Colombia a través de eventos
            </h2>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              EventHub es la plataforma que une a las comunidades de todo el país.
              Desde conciertos masivos hasta festivales culturales,
              aquí encuentras todos los eventos que hacen vibrar a Colombia.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 pointer-events-auto">
              <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 pointer-events-auto">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Descubre Eventos</h3>
                <p className="text-blue-100 text-sm">
                  Encuentra eventos increíbles en todo Colombia, desde Bogotá hasta la Costa
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 pointer-events-auto">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Crea Eventos</h3>
                <p className="text-blue-100 text-sm">
                  Organiza y gestiona tus propios eventos de manera profesional
                </p>
              </div>

              <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 pointer-events-auto">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Compra Segura</h3>
                <p className="text-blue-100 text-sm">
                  Transacciones protegidas y boletas digitales seguras
                </p>
              </div>
            </div>
          </div>
        </section>
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