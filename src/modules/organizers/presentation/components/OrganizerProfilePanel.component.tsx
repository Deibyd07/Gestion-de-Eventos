import React, { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  MapPin,
  Save,
  Edit3,
  CheckCircle,
  Building,
  Users,
  Calendar,
  Heart,
  Shield,
  X
} from 'lucide-react';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { UserService } from '@shared/lib/api/services/User.service';
import { EventService } from '@shared/lib/api/services/Event.service';
import { OrganizerFollowService } from '@shared/lib/api/services/OrganizerFollow.service';
import { supabase } from '@shared/lib/api/supabase';

interface FollowerDetail {
  id: string;
  nombre?: string;
  correo?: string;
  fecha?: string;
}

export const OrganizerProfilePanel: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'followers' | 'events'>('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [followers, setFollowers] = useState<FollowerDetail[]>([]);
  const [eventsCount, setEventsCount] = useState(0);
  const [events, setEvents] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.preferences?.location || '',
    organization: user?.preferences?.organization || '',
    bio: user?.preferences?.bio || '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const [dbUser, organizerEvents, rawFollowers] = await Promise.all([
          UserService.obtenerUsuarioPorId(user.id),
          EventService.obtenerEventosUsuario(user.id).catch(() => []),
          OrganizerFollowService.listarSeguidoresOrganizador(user.id).catch(() => [])
        ]);

        setEventsCount(organizerEvents?.length || 0);
        setEvents(organizerEvents || []);

        const followerDetails: FollowerDetail[] = [];
        for (const f of rawFollowers || []) {
          if (!f?.id_usuario_seguidor) continue;
          const detail = await UserService.obtenerUsuarioPorId(f.id_usuario_seguidor).catch(() => null as any);
          followerDetails.push({
            id: f.id_usuario_seguidor,
            nombre: detail?.nombre_completo || 'Usuario',
            correo: detail?.correo_electronico,
            fecha: f.fecha_creacion
          });
        }
        setFollowers(followerDetails);

        if (dbUser) {
          setProfileData(dbUser);
          setFormData({
            name: dbUser.nombre_completo || user.name || '',
            email: dbUser.correo_electronico || user.email || '',
            location: dbUser.ubicacion || user.preferences?.location || '',
            organization: dbUser.organizacion || '',
            bio: dbUser.bio || ''
          });
        }
      } catch (e) {
        console.error('Error cargando perfil de organizador:', e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const updated = await UserService.actualizarUsuario(user.id, {
        nombre_completo: formData.name,
        correo_electronico: formData.email,
        ubicacion: formData.location,
        organizacion: formData.organization,
        bio: formData.bio
      } as any);

      if (updated) {
        updateProfile({
          name: updated.nombre_completo || formData.name,
          email: updated.correo_electronico || formData.email,
          preferences: {
            location: updated.ubicacion || formData.location,
            organization: updated.organizacion || formData.organization,
            bio: updated.bio || formData.bio,
            categories: []
          }
        });
        setProfileData(updated);
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setIsEditing(false);
    } catch (e) {
      console.error('Error guardando perfil de organizador:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('La contraseña nueva debe ser diferente a la actual');
      return;
    }
    
    if (!user?.email) {
      setPasswordError('No se pudo verificar tu email');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      console.log('🔐 Verificando contraseña actual...');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword
      });
      
      if (signInError) {
        console.error('❌ Contraseña actual incorrecta:', signInError);
        setPasswordError('La contraseña actual es incorrecta');
        return;
      }
      
      console.log('✅ Contraseña actual verificada');
      
      console.log('🔄 Actualizando contraseña...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (updateError) throw updateError;
      
      console.log('✅ Contraseña actualizada exitosamente');
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('❌ Error cambiando contraseña:', err);
      setPasswordError(err.message || 'No se pudo cambiar la contraseña');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const stats = useMemo(() => ({
    totalEvents: eventsCount,
    totalFollowers: followers.length
  }), [eventsCount, followers.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="w-full">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Perfil de Organizador</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Gestiona tu información y conoce a tus seguidores.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {showSuccess && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 sm:px-4 py-2 rounded-lg border border-green-200 shadow-sm text-sm">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-medium">Perfil actualizado</span>
                </div>
              )}
              {!isEditing && activeTab === 'profile' && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar Perfil</span>
                  <span className="sm:hidden">Editar</span>
                </button>
              )}
              {isEditing && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm sm:text-base"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Guardando...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline">Guardar</span>
                        <span className="sm:hidden">Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover" />
                      ) : (
                        <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      )}
                    </div>
                  </div>

                  <div className="text-white flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold">{profileData?.nombre_completo || user?.name || 'Organizador'}</h2>
                    <p className="text-blue-100 mt-1 flex items-center text-sm sm:text-base">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="truncate">{profileData?.correo_electronico || user?.email}</span>
                    </p>
                    <div className="flex items-center mt-2 text-blue-100">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">{profileData?.ubicacion || 'Colombia'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg" />
                <span className="text-sm text-white font-medium">Activo</span>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Eventos</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalEvents}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-lg">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Seguidores</p>
                    <p className="text-lg sm:text-2xl font-bold text-pink-600">{stats.totalFollowers}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-pink-500 rounded-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-200 px-4 sm:px-6">
            <nav className="-mb-px flex overflow-x-auto space-x-1 sm:space-x-8 scrollbar-hide">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Mi Perfil</span>
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'events'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Mis Eventos</span>
              </button>
              <button
                onClick={() => setActiveTab('followers')}
                className={`flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === 'followers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Seguidores</span>
              </button>
            </nav>
          </div>

          <div className="p-4 sm:p-6 bg-white/70 backdrop-blur">
            {activeTab === 'profile' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nombre completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' : 'border-transparent bg-gray-50'} transition`}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Correo electrónico</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-transparent bg-gray-50 text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Ubicación</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' : 'border-transparent bg-gray-50'} transition`}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Organización</label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      disabled={!isEditing}
                      className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' : 'border-transparent bg-gray-50'} transition`}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Biografía</label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!isEditing}
                    className={`mt-1 w-full px-3 py-2 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' : 'border-transparent bg-gray-50'} transition`}
                  />
                </div>

                {/* Security Section */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 sm:p-6 mt-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Seguridad</h2>
                  </div>

                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full text-left p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm sm:text-base flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-gray-600" />
                          Cambiar Contraseña
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">Actualiza tu contraseña de acceso</p>
                      </div>
                      <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'events' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-blue-500" /> Mis Eventos: {events.length}
                </div>
                {events.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">
                    No tienes eventos creados aún.
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-base">{event.titulo}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.descripcion}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{event.fecha_evento ? new Date(event.fecha_evento).toLocaleDateString() : 'Fecha no disponible'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.ubicacion || 'Ubicación no especificada'}</span>
                              </div>
                            </div>
                          </div>
                          {event.imagen_portada && (
                            <img 
                              src={event.imagen_portada} 
                              alt={event.titulo}
                              className="w-20 h-20 rounded-lg object-cover ml-4"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Heart className="w-4 h-4 text-pink-500" /> Seguidores: {followers.length}
                </div>
                {followers.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 border border-dashed border-gray-200 rounded-xl">Aún no tienes seguidores.</div>
                ) : (
                  <div className="grid gap-3">
                    {followers.map((f) => (
                      <div key={f.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">{f.nombre}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail className="w-4 h-4" /> {f.correo || 'correo no disponible'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> {f.fecha ? new Date(f.fecha).toLocaleDateString() : '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white px-5 py-4 rounded-xl shadow-lg border border-gray-200 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-700">Cargando perfil...</span>
            </div>
          </div>
        )}

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Shield className="w-6 h-6 mr-2" />
                    Cambiar Contraseña
                  </h3>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError(null);
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

          <div className="p-6 space-y-4 overflow-y-auto">
            {passwordError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {passwordError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Ingresa tu contraseña actual"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium mb-1">Requisitos de seguridad:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Mínimo 6 caracteres</li>
                <li>Las contraseñas deben coincidir</li>
              </ul>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex space-x-3">
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setPasswordError(null);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              disabled={isChangingPassword}
            >
              Cancelar
            </button>
            <button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </div>
      </div>
    )}
      </div>
    </div>
  );
};
