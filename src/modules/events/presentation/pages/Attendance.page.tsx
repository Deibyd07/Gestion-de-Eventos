import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { AttendanceScanner } from '../components/AttendanceScanner';
import { ServicioEventos } from '@shared/lib/api/Supabase.service';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

interface Event {
  id: string;
  titulo: string;
  fecha_evento: string;
  ubicacion: string;
  estado: string;
}

export function AttendancePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const { user } = useAuthStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const eventData = await ServicioEventos.obtenerEventoPorId(eventId!);
      
      if (!eventData) {
        setError('Evento no encontrado');
        return;
      }

      // Verificar que el usuario es el organizador del evento
      if (user?.role !== 'admin' && eventData.id_organizador !== user?.id) {
        setError('No tienes permisos para acceder al control de asistencia de este evento');
        return;
      }

      setEvent(eventData);
    } catch (error) {
      console.error('Error loading event:', error);
      setError('Error al cargar el evento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Evento no encontrado</h2>
          <p className="text-gray-600">El evento solicitado no existe o no tienes permisos para acceder a él.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <AttendanceScanner
        eventId={event.id}
        eventTitle={event.titulo}
        eventDate={new Date(event.fecha_evento).toLocaleDateString('es-ES')}
        eventLocation={event.ubicacion}
      /> */}
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Scanner de Asistencia</h1>
        <p className="text-gray-600">Funcionalidad en desarrollo</p>
      </div>
    </div>
  );
}



