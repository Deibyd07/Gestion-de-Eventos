import React, { useEffect, useState } from 'react';
import { OrganizerFollowService } from '@shared/lib/api/services/OrganizerFollow.service';
import { EventService } from '@shared/lib/api/services/Event.service';

interface FollowedOrganizersFeedProps {
  currentUserId: string;
  limitEventsPerOrganizer?: number;
  className?: string;
}

interface FeedEvent {
  id: string;
  titulo: string;
  fecha_evento: string;
  hora_evento: string;
  url_imagen?: string;
  id_organizador: string;
  nombre_organizador: string;
}

export const FollowedOrganizersFeed: React.FC<FollowedOrganizersFeedProps> = ({
  currentUserId,
  limitEventsPerOrganizer = 3,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadFeed = async () => {
      if (!currentUserId) return;
      setLoading(true);
      setError(null);
      try {
        const followed = await OrganizerFollowService.listarOrganizadoresSeguidos(currentUserId);
        if (!followed || followed.length === 0) {
          if (mounted) {
            setEmpty(true);
            setEvents([]);
          }
          return;
        }
        const organizerIds = followed.map(f => f.id_organizador);
        const allEvents: FeedEvent[] = [];
        for (const organizerId of organizerIds) {
          const organizerEvents = await EventService.obtenerEventosUsuario(organizerId);
          organizerEvents.slice(0, limitEventsPerOrganizer).forEach((ev: any) => {
            allEvents.push({
              id: ev.id,
              titulo: ev.titulo,
              fecha_evento: ev.fecha_evento,
              hora_evento: ev.hora_evento,
              url_imagen: ev.url_imagen,
              id_organizador: ev.id_organizador,
              nombre_organizador: ev.nombre_organizador
            });
          });
        }
        // Ordenar por fecha creación descendente si existe, fallback a fecha_evento
        allEvents.sort((a, b) => new Date(a.fecha_evento).getTime() < new Date(b.fecha_evento).getTime() ? 1 : -1);
        if (mounted) {
          setEvents(allEvents);
          setEmpty(allEvents.length === 0);
        }
      } catch (e: any) {
        console.error('Error cargando feed de organizadores seguidos:', e);
        if (mounted) setError(e.message || 'Error al cargar el feed');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadFeed();
    return () => { mounted = false; };
  }, [currentUserId, limitEventsPerOrganizer]);

  if (!currentUserId) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Eventos de tus organizadores favoritos</h3>
        {loading && <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />}
      </div>
      {error && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          {error}
        </div>
      )}
      {empty && !loading && !error && (
        <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600">
          Aún no sigues a ningún organizador. Busca eventos y comienza a seguirlos para ver aquí sus próximos eventos.
        </div>
      )}
      {!empty && events.length > 0 && (
        <ul className="space-y-3">
          {events.map(ev => (
            <li key={ev.id} className="p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-500 mb-1">{ev.nombre_organizador}</p>
                  <h4 className="text-base font-semibold text-gray-900 truncate">{ev.titulo}</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(ev.fecha_evento).toLocaleDateString('es-ES')} • {ev.hora_evento}
                  </p>
                </div>
                {ev.url_imagen && (
                  <img
                    src={ev.url_imagen}
                    alt={ev.titulo}
                    className="w-16 h-16 object-cover rounded-lg ml-3 flex-shrink-0"
                  />
                )}
              </div>
              <div className="mt-3 flex space-x-2">
                <a
                  href={`/eventos/${ev.id}`}
                  className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Ver evento
                </a>
                <a
                  href={`/organizadores/${ev.id_organizador}`}
                  className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
                >
                  Perfil
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
