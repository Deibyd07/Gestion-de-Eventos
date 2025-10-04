import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Shield, Star, ArrowRight, Play, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useEventStore } from '../../../core/stores/eventStore';
import { useAuthStore } from '../../../core/stores/authStore';
import { AuthRedirect } from '../../auth/components/AuthRedirect';
import { LoginRequiredModal } from '../../auth/components/LoginRequiredModal';
import { formatEventDate } from '../../../shared/utils/date';

export function HomePage() {
  const { featuredEvents, loadFeaturedEvents, loading, error } = useEventStore();
  const { isAuthenticated } = useAuthStore();
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
  }, [loadFeaturedEvents]);

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
        navigate('/dashboard', { state: { fromNavigation: true } });
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
      description: 'Crea, edita y gestiona todos tus eventos en Zarzal y el Valle del Cauca desde una sola plataforma intuitiva.'
    },
    {
      icon: Users,
      title: 'Conexión Local',
      description: 'Conecta con la comunidad zarzaleña y descubre eventos increíbles en tu región.'
    },
    {
      icon: Shield,
      title: 'Pagos Seguros',
      description: 'Transacciones protegidas con la más alta seguridad y múltiples métodos de pago en pesos colombianos.'
    },
    {
      icon: Star,
      title: 'Experiencias Únicas',
      description: 'Desde ferias agropecuarias hasta festivales de música vallenata, encuentra tu próxima aventura en Zarzal.'
    }
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Organizadora de eventos en Zarzal',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
      quote: 'EventHub transformó completamente la forma en que gestiono mis eventos en Zarzal. ¡Increíble!'
    },
    {
      name: 'Carlos Ruiz',
      role: 'Agricultor del Valle del Cauca',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      quote: 'La mejor plataforma para encontrar ferias agropecuarias en la región. La interfaz es perfecta.'
    },
    {
      name: 'Ana López',
      role: 'Productora de eventos culturales',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
      quote: 'Organicé el Festival de Música Vallenata de Zarzal usando EventHub. Los resultados superaron todas mis expectativas.'
    }
  ];

  return (
    <AuthRedirect>
      <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
          <div className="text-center space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Eventos en
                <span className="block bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Zarzal
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              La plataforma para eventos locales en Zarzal, Valle del Cauca. 
              Conecta con tu comunidad y descubre eventos únicos en tu región.
            </p>
            
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                <button 
                  onClick={handleExploreEvents}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Explorar Eventos
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </button>
                
                <button 
                  onClick={handleCreateAccount}
                  className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Crear Cuenta Gratis
                  <Play className="ml-2 w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-blue-400/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50/80 to-blue-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">50+</div>
              <div className="text-gray-700 font-semibold">Eventos Locales</div>
            </div>
            <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">500+</div>
              <div className="text-gray-700 font-semibold">Zarzaleños</div>
            </div>
            <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">95%</div>
              <div className="text-gray-700 font-semibold">Satisfacción</div>
            </div>
            <div className="text-center bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">Local</div>
              <div className="text-gray-700 font-semibold">Soporte</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50/80 to-blue-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Todo lo que necesitas en un solo lugar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Desde la creación hasta el control de asistencia, EventHub te ofrece todas las herramientas 
              para hacer de tu evento un éxito rotundo.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
              Eventos Destacados
            </h2>
            <p className="text-xl text-gray-600">
              Descubre algunos de los eventos más populares de nuestra plataforma
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {loading ? (
              // Estados de carga
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
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
              <div className="col-span-full text-center py-12">
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
            ) : featuredEvents.length > 0 ? (
              // Eventos destacados
              featuredEvents.map((event) => (
                <div key={event.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 group transform hover:-translate-y-1 flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 leading-none">
                          {new Date(event.date).getDate()}
                        </div>
                        <div className="text-xs text-gray-600 uppercase mt-1">
                          {new Date(event.date).toLocaleDateString('es-ES', { month: 'short' }).replace('.', '')}
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
                        <span className="text-sm text-gray-600">
                          {event.currentAttendees} / {event.maxAttendees}
                        </span>
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
          
          {featuredEvents.length > 0 && (
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

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50/80 to-blue-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-gray-600">
              Miles de organizadores y asistentes confían en EventHub
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-14 h-14 rounded-full mr-4 ring-4 ring-white shadow-lg"
                    />
                    <div className="absolute -bottom-1 -right-2 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white">
                      <Star className="w-3 h-3 text-white fill-current" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic leading-relaxed mb-4">"{testimonial.quote}"</p>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Conectando Zarzal a través de eventos
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            EventHub es la plataforma que une a la comunidad zarzaleña. 
            Desde ferias agropecuarias hasta festivales culturales, 
            aquí encuentras todos los eventos que hacen vibrar nuestro municipio.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Descubre Eventos</h3>
              <p className="text-blue-100 text-sm">
                Encuentra eventos increíbles en Zarzal y el Valle del Cauca
              </p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Crea Eventos</h3>
              <p className="text-blue-100 text-sm">
                Organiza y gestiona tus propios eventos de manera profesional
              </p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
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
        message="Únete a la comunidad de EventHub y descubre eventos increíbles en Zarzal"
        action="Crear cuenta"
        defaultToRegister={true}
      />
    </AuthRedirect>
  );
}