import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { OrganizerFollowService } from '@shared/lib/api/services/OrganizerFollow.service';
import { FollowOrganizerButton } from '@shared/ui/components/FollowOrganizerButton/FollowOrganizerButton.component';
import { Users, Building2, MapPin, Calendar, Search, Loader2 } from 'lucide-react';

interface FollowedOrganizer {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  url_avatar: string | null;
  ubicacion: string | null;
  rol: string;
  fecha_creacion: string;
  preferencias: any;
}

export function FollowedOrganizersPage() {
  const { user } = useAuthStore();
  const [organizers, setOrganizers] = useState<FollowedOrganizer[]>([]);
  const [filteredOrganizers, setFilteredOrganizers] = useState<FollowedOrganizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFollowedOrganizers();
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrganizers(organizers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = organizers.filter(org =>
        org.nombre_completo.toLowerCase().includes(query) ||
        org.ubicacion?.toLowerCase().includes(query) ||
        org.correo_electronico.toLowerCase().includes(query)
      );
      setFilteredOrganizers(filtered);
    }
  }, [searchQuery, organizers]);

  const loadFollowedOrganizers = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await OrganizerFollowService.listarOrganizadoresSeguidos(user.id);
      setOrganizers(data);
      setFilteredOrganizers(data);
    } catch (error) {
      console.error('Error cargando organizadores seguidos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = () => {
    // Recargar lista después de dejar de seguir
    loadFollowedOrganizers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Cargando organizadores seguidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-4 sm:py-8 px-4 sm:px-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Organizadores Seguidos</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {organizers.length} {organizers.length === 1 ? 'organizador' : 'organizadores'} que sigues
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {organizers.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>
        )}

        {/* Lista de organizadores */}
        {filteredOrganizers.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No se encontraron resultados' : 'Aún no sigues a ningún organizador'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Intenta con otra búsqueda'
                : 'Explora eventos y sigue a organizadores para recibir notificaciones de sus nuevos eventos'}
            </p>
            {!searchQuery && (
              <Link
                to="/events"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
              >
                Explorar Eventos
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredOrganizers.map((organizer) => (
              <div
                key={organizer.id}
                className="bg-white rounded-xl border border-gray-200/70 hover:border-blue-300/60 shadow-sm hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group"
              >
                <Link to={`/organizers/${organizer.id}`} className="flex-shrink-0">
                  <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 ring-1 ring-gray-100 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform duration-200">
                    {organizer.url_avatar ? (
                      <img
                        src={organizer.url_avatar}
                        alt={organizer.nombre_completo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 sm:w-6 sm:h-6 text-purple-600" />
                    )}
                  </div>
                </Link>

                <div className="flex-1 min-w-0 w-full sm:w-auto">
                  <Link to={`/organizers/${organizer.id}`} className="block">
                    <h3 className="text-lg sm:text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 truncate">
                      {organizer.nombre_completo}
                    </h3>
                  </Link>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600 mt-1">
                    {organizer.ubicacion && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{organizer.ubicacion}</span>
                      </span>
                    )}
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="hidden sm:inline">Miembro desde</span>
                      <span className="sm:hidden">Desde</span> {new Date(organizer.fecha_creacion).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="mt-2">
                    <Link
                      to={`/organizers/${organizer.id}`}
                      className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Ver perfil
                    </Link>
                  </div>
                </div>

                <div className="flex-shrink-0 w-full sm:w-auto">
                  <FollowOrganizerButton
                    organizerId={organizer.id}
                    organizerName={organizer.nombre_completo}
                    currentUserId={user?.id || ''}
                    variant="compact"
                    showName={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
