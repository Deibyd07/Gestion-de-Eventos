/**
 * Attendance Control Page
 * 
 * Página para control de asistencia de eventos.
 * Muestra lista de asistentes con estado en tiempo real.
 */

import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { AttendeeManagement } from '../components/AttendeeManagement.component';
import { ServicioEventos } from '@shared/lib/api/Supabase.service';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { formatDate } from '@shared/lib/utils/Date.utils';

interface Event {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_evento: string;
  hora_evento: string;
  ubicacion: string;
  estado: string;
  id_organizador: string;
  imagen_url?: string;
}

export const AttendanceControlPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;
      
      try {
        setLoading(true);
        setError(null);

        const eventData = await ServicioEventos.obtenerEventoPorId(eventId);
        
        if (!eventData) {
          setError('Evento no encontrado');
          return;
        }

        // Verificar que el usuario es el organizador del evento
        if (user?.role !== 'admin' && (eventData as any).id_organizador !== user?.id) {
          setError('No tienes permisos para acceder al control de asistencia de este evento');
          return;
        }

        setEvent(eventData as any);
      } catch (error) {
        console.error('Error cargando evento:', error);
        setError('Error al cargar el evento');
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, [eventId, user]);

  const getEventStatus = (estado: string) => {
    switch (estado) {
      case 'activo':
      case 'en_curso':
        return { text: 'En Curso', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'proximo':
        return { text: 'Próximo', color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'finalizado':
        return { text: 'Finalizado', color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
      case 'cancelado':
        return { text: 'Cancelado', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
      default:
        return { text: estado, color: 'bg-gray-100 text-gray-800', icon: AlertTriangle };
    }
  };

  if (!eventId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ID de evento no válido</h2>
          <p className="text-gray-600 mb-6">No se proporcionó un identificador de evento válido.</p>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error ? 'Error' : 'Evento no encontrado'}
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'El evento solicitado no existe o no tienes permisos para acceder a él.'}
          </p>
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const status = getEventStatus(event.estado);
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate('/organizer/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </button>

          {/* Event Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Event Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Users className="w-7 h-7 text-blue-600" />
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Control de Asistencia
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.text}
                </span>
              </div>
              
              <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-4">
                {event.titulo}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Fecha del Evento</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDate(new Date(event.fecha_evento))}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Hora</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {event.hora_evento || 'Por confirmar'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Ubicación</p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {event.ubicacion}
                    </p>
                  </div>
                </div>
              </div>

              {/* Info Alert */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>📊 Vista en tiempo real:</strong> Los cambios en el estado de asistencia se actualizan automáticamente sin necesidad de recargar la página.
                </p>
              </div>
            </div>

            {/* Event Image */}
            {event.imagen_url && (
              <div className="lg:w-64 lg:flex-shrink-0">
                <img
                  src={event.imagen_url}
                  alt={event.titulo}
                  className="w-full h-48 lg:h-40 object-cover rounded-xl shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attendee Management Component */}
        <AttendeeManagement 
          eventId={eventId} 
          eventTitle={event.titulo}
          onRefreshRequest={() => {
            console.log('Refresh requested from parent');
          }}
        />
      </div>
    </div>
  );
};
