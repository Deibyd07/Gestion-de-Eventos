import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserService } from '@shared/lib/api/services/User.service';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { FollowOrganizerButton } from '@shared/ui/components/FollowOrganizerButton/FollowOrganizerButton.component';
import { MapPin, Calendar, Award, Users, Building2, Mail, Globe } from 'lucide-react';
import { EventService } from '@shared/lib/api/services/Event.service';
import type { Event } from '../../../events/infrastructure/store/Event.store';
import { EventCard } from '../../../events/presentation/components/EventCard.component';

export const OrganizerPublicPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [organizer, setOrganizer] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'undefined') {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await UserService.obtenerUsuarioPorId(id);
        setOrganizer(data);
      } catch (e) {
        console.error('Error cargando organizador:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const loadEvents = async () => {
      if (!id || id === 'undefined') return;
      setLoadingEvents(true);
      try {
        const supabaseEvents = await EventService.obtenerEventosUsuario(id);
        const converted: Event[] = (supabaseEvents || [])
          .map((e: any) => {
            const tipos = e.tipos_entrada || [];
            const entradaGeneral = tipos.find((t: any) =>
              (t.nombre_tipo || '').toLowerCase().includes('general') ||
              (t.nombre_tipo || '').toLowerCase().includes('entrada general') ||
              (t.nombre_tipo || '').toLowerCase().includes('acceso general')
            );
            const entradaPorDefecto = entradaGeneral || (tipos.length ? tipos.reduce((min: any, t: any) => (t.precio || 0) < (min.precio || 0) ? t : min, tipos[0]) : null);
            const precio = entradaPorDefecto?.precio || 0;
            const mapped: Event = {
              id: e.id,
              title: e.titulo,
              description: e.descripcion,
              image: e.imagen || e.url_imagen || 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800',
              date: e.fecha_evento,
              time: e.hora_evento,
              location: e.ubicacion,
              category: e.categoria,
              price: precio,
              maxAttendees: e.capacidad_maxima || e.maximo_asistentes || 100,
              currentAttendees: e.asistentes_actuales || 0,
              organizerId: e.id_organizador,
              organizerName: e.nombre_organizador || organizer?.nombre_completo || 'Organizador',
              status: (e.estado as any) || 'upcoming',
              tags: e.tags || e.etiquetas || [],
              ticketTypes: tipos
            };
            return mapped;
          })
          // Solo próximos (fecha futura o estado no finalizado/cancelado)
          .filter(ev => {
            const hoy = new Date();
            const fecha = ev.date ? new Date(ev.date) : hoy;
            return (ev.status !== 'cancelled' && ev.status !== 'completed') || fecha >= hoy;
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setEvents(converted);
      } catch (e) {
        console.error('Error cargando eventos del organizador:', e);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };
    loadEvents();
  }, [id, organizer?.nombre_completo]);

  if (loading) return (
    <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Cargando perfil del organizador...</p>
      </div>
    </div>
  );

  if (!organizer) return (
    <div className="min-h-[60vh] bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Organizador no encontrado</h2>
        <p className="text-gray-600">El perfil que buscas no existe o ha sido eliminado.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header con imagen de fondo */}
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 h-64">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMTBjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTI2IDM0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDEwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        </div>

        {/* Contenido principal */}
        <div className="w-full px-6 -mt-32 relative z-10 pb-12">
          {/* Card principal del perfil */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header del card con avatar y botón seguir */}
            <div className="px-6 sm:px-8 pt-8 pb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-white">
                    {organizer.url_avatar ? (
                      <img src={organizer.url_avatar} alt={organizer.nombre_completo} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-16 h-16 text-purple-600" />
                    )}
                  </div>
                  {organizer.rol === 'organizador' && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white p-2 rounded-xl shadow-lg">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Info y botón */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        {organizer.nombre_completo}
                      </h1>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-600">
                        {organizer.ubicacion && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{organizer.ubicacion}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">Miembro desde {new Date(organizer.fecha_creacion).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center sm:justify-end">
                      <FollowOrganizerButton
                        organizerId={organizer.id}
                        organizerName={organizer.nombre_completo || 'Organizador'}
                        currentUserId={currentUser?.id || ''}
                        className="transform hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="px-6 sm:px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-b border-gray-100">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">12</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Eventos</div>
                </div>
                <div className="text-center border-x border-gray-200">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-600">1.2K</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">4.8</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Rating</div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="px-6 sm:px-8 py-8 space-y-8">
              {/* Biografía */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Acerca de</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {organizer.preferencias?.bio || organizer.descripcion || 'Este organizador aún no ha agregado una biografía.'}
                </p>
              </div>

              {/* Información de contacto */}
              {(organizer.correo_electronico || organizer.preferencias?.website) && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Contacto</h2>
                  </div>
                  <div className="space-y-3">
                    {organizer.correo_electronico && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${organizer.correo_electronico}`} className="text-blue-600 hover:underline">
                          {organizer.correo_electronico}
                        </a>
                      </div>
                    )}
                    {organizer.preferencias?.website && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={organizer.preferencias.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {organizer.preferencias.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Organización */}
              {organizer.preferencias?.organization && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Organización</h2>
                  </div>
                  <p className="text-gray-700">{organizer.preferencias.organization}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de eventos próximos */}
          <div className="mt-8 bg-white rounded-3xl shadow-lg p-6 sm:p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximos Eventos</h2>
            {loadingEvents ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                Cargando eventos...
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Este organizador no tiene eventos próximos programados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
                {events.map(ev => (
                  <div key={ev.id} className="h-full w-full">
                    <EventCard event={ev} viewMode="grid" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default OrganizerPublicPage;
