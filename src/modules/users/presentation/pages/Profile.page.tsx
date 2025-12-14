import { useEffect, useMemo, useState } from 'react';
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Camera,
  Save,
  Settings,
  Ticket,
  Bell,
  Download,
  CreditCard,
  Edit3,
  QrCode,
  Shield,
  CheckCircle,
  Search,
  X,
  Heart,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { UserService } from '@shared/lib/api/services/User.service';
import { PurchaseService } from '@shared/lib/api/services/Purchase.service';
import { QRCodeService } from '@shared/lib/services/QRCode.service';
import { OrganizerFollowService } from '@shared/lib/api/services/OrganizerFollow.service';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';
import { supabase } from '@shared/lib/api/supabase';

export function ProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [followedOrganizers, setFollowedOrganizers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [purchaseQuery, setPurchaseQuery] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.preferences?.location || '',
    phone: '',
    organization: '',
    bio: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const [dbUser, userPurchases, userTickets, organizers] = await Promise.all([
          UserService.obtenerUsuarioPorId(user.id),
          PurchaseService.obtenerComprasUsuario(user.id).catch((err) => {
            console.error('Error cargando compras:', err);
            return [];
          }),
          QRCodeService.getQRsByUser(user.id).catch((err) => {
            console.error('Error cargando tickets:', err);
            return [];
          }),
          OrganizerFollowService.listarOrganizadoresSeguidos(user.id).catch((err) => {
            console.error('Error cargando organizadores seguidos:', err);
            return [];
          })
        ]);

        if (dbUser) {
          setProfileData(dbUser);
          setFormData({
            name: (dbUser as any).nombre_completo || user.name || '',
            email: (dbUser as any).correo_electronico || user.email || '',
            location: (dbUser as any).ubicacion || user.preferences?.location || '',
            phone: (dbUser as any).telefono || '',
            organization: (dbUser as any).organizacion || '',
            bio: (dbUser as any).bio || ''
          });
        }

        console.log('✅ Compras cargadas:', userPurchases?.length || 0, userPurchases);
        console.log('✅ Tickets cargados:', userTickets?.length || 0);
        console.log('✅ Organizadores seguidos:', organizers?.length || 0, organizers);
        setPurchases(userPurchases || []);
        setTickets(userTickets || []);
        setFollowedOrganizers(organizers || []);
      } catch (e: any) {
        console.error('Error cargando perfil:', e);
        setError('No se pudo cargar tu perfil.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);


  const handleSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    setError(null);
    try {
      const trimmedEmail = formData.email.trim();
      if (!trimmedEmail) {
        setError('El correo no puede estar vacío.');
        setIsSaving(false);
        return;
      }

      let emailUpdatePendingConfirmation = false;
      // Primero intentamos actualizar el email en Supabase Auth; si requiere confirmación, no mostrar error de inmediato
      if (trimmedEmail !== user.email) {
        const { data: authData, error: authUpdateError } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (authUpdateError) {
          console.warn('No se pudo actualizar email en auth:', authUpdateError.message);
          setError(authUpdateError.message || 'No se pudo actualizar el email en auth');
          setIsSaving(false);
          return;
        }
        // Si no hay email_confirmed_at en la respuesta, asumimos que espera confirmación por correo
        emailUpdatePendingConfirmation = !authData?.user?.email_confirmed_at;
      }

      const payload: any = {
        nombre_completo: formData.name,
        correo_electronico: trimmedEmail,
        bio: formData.bio
      };

      if (formData.location) payload.ubicacion = formData.location;
      if (formData.phone) payload.telefono = formData.phone;

      const updated = await UserService.actualizarUsuario(user.id, payload);

      if (updated) {
        updateProfile({
          name: (updated as any).nombre_completo || formData.name,
          email: (updated as any).correo_electronico || trimmedEmail,
          preferences: {
            location: (updated as any).ubicacion || formData.location,
            categories: []
          }
        });
        setProfileData(updated);
        // Normalizar email en el formulario tras guardado
        setFormData((prev) => ({ ...prev, email: trimmedEmail }));
        if (emailUpdatePendingConfirmation) {
          setShowSuccess(true);
        }
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setIsEditing(false);
    } catch (e: any) {
      console.error('Error guardando perfil:', e);
      setError('No se pudo guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };


  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'purchases', label: 'Compras', icon: CreditCard },
    { id: 'followed', label: 'Organizadores Seguidos', icon: Heart }
  ];

  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const totalPurchases = purchases.length;
    const totalSpent = purchases.reduce((sum, p: any) => sum + Number(p.total_pagado || 0), 0);
    const totalFollowed = followedOrganizers.length;
    return { totalTickets, totalPurchases, totalSpent, totalFollowed };
  }, [tickets, purchases, followedOrganizers]);

  const filteredPurchases = useMemo(() => {
    const query = purchaseQuery.trim().toLowerCase();
    if (!query) return purchases;
    return purchases.filter((purchase) => {
      const eventTitle = purchase.eventos?.titulo || purchase.nombre_evento || purchase.evento_nombre || purchase.descripcion || '';
      return eventTitle.toLowerCase().includes(query);
    });
  }, [purchases, purchaseQuery]);

  const handleViewDetails = (purchase: any) => {
    setSelectedPurchase(purchase);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);

    // Validations
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
      // First, verify current password by attempting to sign in
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

      // Now update to new password
      console.log('🔄 Actualizando contraseña...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) throw updateError;

      console.log('✅ Contraseña actualizada exitosamente');

      // Success
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const memberSince = useMemo(() => {
    const raw = (profileData as any)?.fecha_creacion || (profileData as any)?.created_at || (user as any)?.created_at;
    return raw ? formatDate(raw) : 'Fecha no disponible';
  }, [profileData, user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="w-full">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Gestiona tu información personal y preferencias</p>
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

        {/* Main Panel */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
          {/* Header del Panel con Avatar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-lg">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-all duration-200 shadow-lg border-2 border-white">
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>

                  <div className="text-white flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold">{user?.name}</h2>
                    <p className="text-blue-100 mt-1 flex items-center text-sm sm:text-base">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="truncate">{user?.email}</span>
                    </p>
                    <div className="flex items-center mt-2 text-blue-100">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Miembro desde {memberSince}</span>
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

          {/* Stats Cards */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Compras</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalPurchases}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-lg">
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Tickets</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.totalTickets}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500 rounded-lg">
                    <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Total Gastado</p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-600">
                      {stats.totalSpent > 0 ? formatPriceDisplay(stats.totalSpent) : '$0'}
                    </p>
                  </div>
                  <div className="p-2 sm:p-3 bg-purple-500 rounded-lg">
                    <Save className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 px-4 sm:px-6">
            <nav className="-mb-px flex overflow-x-auto space-x-1 sm:space-x-8 scrollbar-hide tabs-scroll">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`tab-button flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.label === 'Mi Perfil' ? 'Mi' :
                        tab.label === 'Mis Tickets' ? 'Tickets' :
                          tab.label === 'Compras' ? 'Compras' :
                            tab.label === 'Actividad' ? 'Actividad' :
                              tab.label === 'Configuración' ? 'Config' : tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {loading && (
              <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                Cargando tu información...
              </div>
            )}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Información Personal</h2>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base">{formData.name || user?.name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base break-all">{formData.email || user?.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Tu ciudad o región"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base">
                          {formData.location || user?.preferences?.location || 'No especificada'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${user?.role === 'organizer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-green-100 text-green-800'
                          }`}>
                          {user?.role === 'organizer' ? 'Organizador' : 'Asistente'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 sm:p-6">
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

            {/* Purchases Tab */}
            {activeTab === 'purchases' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Historial de Compras</h3>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      value={purchaseQuery}
                      onChange={(e) => setPurchaseQuery(e.target.value)}
                      type="text"
                      placeholder="Buscar compra o evento"
                      className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                {filteredPurchases.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">No hay compras registradas</p>
                    <p className="text-sm text-gray-500 mt-1">Tus compras aparecerán aquí</p>
                  </div>
                )}

                {/* Mobile Cards View */}
                {filteredPurchases.length > 0 && (
                  <div className="block sm:hidden space-y-3">
                    {filteredPurchases.map((purchase) => {
                      const eventTitle = purchase.eventos?.titulo || purchase.nombre_evento || purchase.evento_nombre || purchase.descripcion || 'Evento';
                      const purchaseDateRaw = purchase.fecha_creacion || purchase.fecha_compra || purchase.created_at;
                      const purchaseDate = purchaseDateRaw ? formatDate(purchaseDateRaw) : 'Fecha no disponible';
                      const ticketsCount = purchase.cantidad_tickets || purchase.total_tickets || purchase.cantidad || 0;
                      const total = purchase.total_pagado || purchase.total || 0;
                      return (
                        <div key={purchase.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">{eventTitle}</h4>
                              <p className="text-xs text-gray-600 mt-1">{purchaseDate}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex space-x-4 text-xs text-gray-600">
                                <span>{ticketsCount} tickets</span>
                                <span className="font-semibold text-gray-900">{formatPriceDisplay(total)}</span>
                              </div>
                              <button
                                onClick={() => handleViewDetails(purchase)}
                                className="text-blue-600 hover:text-blue-900 font-medium text-xs"
                              >
                                Ver Detalles
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Desktop Table View */}
                {filteredPurchases.length > 0 && (
                  <div className="hidden sm:block bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/80">
                          <tr>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Evento
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha de Compra
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tickets
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total
                            </th>
                            <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Acción
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white/50 divide-y divide-gray-200">
                          {filteredPurchases.map((purchase) => {
                            const eventTitle = purchase.eventos?.titulo || purchase.nombre_evento || purchase.evento_nombre || purchase.descripcion || 'Evento';
                            const purchaseDateRaw = purchase.fecha_creacion || purchase.fecha_compra || purchase.created_at;
                            const purchaseDate = purchaseDateRaw ? formatDate(purchaseDateRaw) : 'Fecha no disponible';
                            const ticketsCount = purchase.cantidad_tickets || purchase.total_tickets || purchase.cantidad || 0;
                            const total = purchase.total_pagado || purchase.total || 0;
                            return (
                              <tr key={purchase.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{eventTitle}</div>
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {purchaseDate}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {ticketsCount}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  {formatPriceDisplay(total)}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                                  <button
                                    onClick={() => handleViewDetails(purchase)}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                  >
                                    Ver Detalles
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Followed Organizers Tab */}
            {activeTab === 'followed' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-pink-600" />
                    Organizadores Seguidos
                  </h2>
                  <span className="text-sm text-gray-600">
                    {followedOrganizers.length} organizador{followedOrganizers.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                {followedOrganizers.length === 0 ? (
                  <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sigues a ningún organizador</h3>
                    <p className="text-gray-600 text-sm">Explora eventos y sigue a tus organizadores favoritos para recibir notificaciones.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followedOrganizers.map((organizer) => (
                      <div key={organizer.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-200">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {organizer.url_avatar ? (
                              <img
                                src={organizer.url_avatar}
                                alt={organizer.nombre_completo}
                                className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate text-lg">
                              {organizer.nombre_completo || 'Organizador'}
                            </h3>
                            {organizer.correo_electronico && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{organizer.correo_electronico}</span>
                              </div>
                            )}
                            {organizer.ubicacion && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{organizer.ubicacion}</span>
                              </div>
                            )}
                            {organizer.organizacion && (
                              <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                                <UserCheck className="w-3 h-3" />
                                <span className="truncate">{organizer.organizacion}</span>
                              </div>
                            )}
                            {organizer.fecha_seguimiento && (
                              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-2">
                                <Calendar className="w-3 h-3" />
                                <span>Siguiendo desde {formatDate(organizer.fecha_seguimiento)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {organizer.bio && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{organizer.bio}</p>
                        )}
                        <button
                          onClick={async () => {
                            try {
                              await OrganizerFollowService.dejarDeSeguir(user!.id, organizer.id);
                              setFollowedOrganizers(prev => prev.filter(o => o.id !== organizer.id));
                              setShowSuccess(true);
                              setTimeout(() => setShowSuccess(false), 3000);
                            } catch (error) {
                              console.error('Error al dejar de seguir:', error);
                            }
                          }}
                          className="mt-4 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-200 text-sm font-medium"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                          <span>Dejar de Seguir</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPurchase(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Detalles de la Compra</h2>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Info */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 text-lg mb-3">
                  {selectedPurchase.eventos?.titulo || selectedPurchase.nombre_evento || selectedPurchase.evento_nombre || selectedPurchase.descripcion || 'Evento'}
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Comprado el:</span>
                    <span className="text-gray-900">{formatDate(selectedPurchase.fecha_creacion || selectedPurchase.fecha_compra || selectedPurchase.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">ID de compra:</span>
                    <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded">{selectedPurchase.id}</span>
                  </div>
                  {selectedPurchase.id_evento && (
                    <div className="flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">ID del evento:</span>
                      <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded">{selectedPurchase.id_evento}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 flex items-center">
                    <Ticket className="w-3 h-3 mr-1" />
                    Tickets
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{selectedPurchase.cantidad_tickets || selectedPurchase.total_tickets || selectedPurchase.cantidad || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-xs text-gray-500 mb-1">Total Pagado</p>
                  <p className="text-2xl font-bold text-green-600">{formatPriceDisplay(selectedPurchase.total_pagado || selectedPurchase.total || 0)}</p>
                </div>
                {selectedPurchase.descuento_aplicado > 0 && (
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs text-gray-500 mb-1">Descuento</p>
                    <p className="text-2xl font-bold text-orange-600">{formatPriceDisplay(selectedPurchase.descuento_aplicado)}</p>
                  </div>
                )}
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                  Información de Pago
                </h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-medium">Método:</span>
                    <span className="text-gray-900 capitalize">{selectedPurchase.metodo_pago_nombre || selectedPurchase.metodo_pago || 'No especificado'}</span>
                  </div>
                  {selectedPurchase.estado_pago && (
                    <div className="flex justify-between">
                      <span className="font-medium">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedPurchase.estado_pago === 'completado' || selectedPurchase.estado_pago === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : selectedPurchase.estado_pago === 'pendiente'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                        {selectedPurchase.estado_pago}
                      </span>
                    </div>
                  )}
                  {selectedPurchase.id_transaccion && (
                    <div className="flex justify-between">
                      <span className="font-medium">ID Transacción:</span>
                      <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded">{selectedPurchase.id_transaccion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Discount Code */}
              {selectedPurchase.codigo_descuento && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <QrCode className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-700">Código de descuento:</span>
                    </div>
                    <span className="font-mono font-bold text-green-700 bg-white px-3 py-1 rounded">{selectedPurchase.codigo_descuento}</span>
                  </div>
                  {selectedPurchase.descuento_aplicado > 0 && (
                    <p className="text-sm text-green-700 mt-2">Ahorraste {formatPriceDisplay(selectedPurchase.descuento_aplicado)}</p>
                  )}
                </div>
              )}

              {/* QR codes for each ticket */}
              {(selectedPurchase.codigos_qr?.length || selectedPurchase.codigo_qr) && (
                <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <QrCode className="w-5 h-5 mr-2 text-indigo-600" />
                    Códigos QR de tus entradas
                  </h4>
                  <div className="space-y-2 text-sm text-gray-800">
                    {(selectedPurchase.codigos_qr || [selectedPurchase.codigo_qr]).filter(Boolean).map((code: string, idx: number) => (
                      <div key={code + idx} className="flex items-center justify-between bg-white border border-indigo-100 rounded-lg px-3 py-2">
                        <span className="text-gray-600">Entrada {idx + 1}</span>
                        <span className="font-mono text-xs text-gray-900 break-all">{code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Info */}
              {(selectedPurchase.id_usuario || selectedPurchase.correo_usuario) && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Información del Comprador
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {(selectedPurchase.nombre_usuario || selectedPurchase.correo_usuario) && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Nombre:</span>
                        <span className="text-gray-900">{selectedPurchase.nombre_usuario || selectedPurchase.correo_usuario?.split('@')[0]}</span>
                      </div>
                    )}
                    {selectedPurchase.correo_usuario && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span>{selectedPurchase.correo_usuario}</span>
                      </div>
                    )}
                    {selectedPurchase.id_usuario && (
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">ID Usuario:</span>
                        <span className="font-mono text-xs text-gray-900 bg-white px-2 py-1 rounded">{selectedPurchase.id_usuario}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Event Details */}
              {(selectedPurchase.eventos || selectedPurchase.evento_fecha || selectedPurchase.evento_ubicacion || selectedPurchase.evento_descripcion) && (
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Ticket className="w-5 h-5 mr-2 text-purple-600" />
                    Detalles del Evento
                  </h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    {(selectedPurchase.eventos?.fecha_evento || selectedPurchase.evento_fecha) && (
                      <div className="flex items-start space-x-2">
                        <Calendar className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Fecha del evento:</span>
                          <span className="text-gray-900 ml-2">{formatDate(selectedPurchase.eventos?.fecha_evento || selectedPurchase.evento_fecha)}</span>
                        </div>
                      </div>
                    )}
                    {(selectedPurchase.eventos?.ubicacion || selectedPurchase.evento_ubicacion) && (
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                        <div>
                          <span className="font-medium">Ubicación:</span>
                          <span className="text-gray-900 ml-2">{selectedPurchase.eventos?.ubicacion || selectedPurchase.evento_ubicacion}</span>
                        </div>
                      </div>
                    )}
                    {(selectedPurchase.eventos?.descripcion || selectedPurchase.evento_descripcion) && (
                      <div className="mt-2 pt-2 border-t border-purple-200">
                        <p className="text-gray-700">{selectedPurchase.eventos?.descripcion || selectedPurchase.evento_descripcion}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Cerrar
              </button>
            </div>
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
  );
}
