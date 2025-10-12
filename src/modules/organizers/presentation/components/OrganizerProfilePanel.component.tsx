import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Camera, 
  Save, 
  Settings, 
  Calendar as CalendarIcon,
  Bell,
  Download,
  CreditCard,
  Edit3,
  QrCode,
  Shield,
  CheckCircle,
  Building,
  Users,
  TrendingUp,
  FileText,
  Award
} from 'lucide-react';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';

export const OrganizerProfilePanel: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    location: user?.preferences?.location || '',
    organization: user?.preferences?.organization || '',
    bio: user?.preferences?.bio || '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProfile({
      name: formData.name,
      email: formData.email,
      preferences: {
        location: formData.location,
        organization: formData.organization,
        bio: formData.bio,
        categories: []
      }
    });
    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  const analytics = {
    totalEvents: 12,
    totalAttendees: 1250,
    totalRevenue: 125000000,
    avgRating: 4.8
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mi Perfil de Organizador</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Gestiona tu información y métricas como organizador</p>
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 sm:px-6 py-6 sm:py-8">
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
                        <Building className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-purple-500 text-white rounded-full flex items-center justify-center hover:bg-purple-600 transition-all duration-200 shadow-lg border-2 border-white">
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="text-white flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold">{user?.name}</h2>
                    <p className="text-purple-100 mt-1 flex items-center text-sm sm:text-base">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="truncate">{user?.email}</span>
                    </p>
                    <div className="flex items-center mt-2 text-purple-100">
                      <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="text-xs sm:text-sm">Organizador desde marzo 2024</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400 shadow-lg" />
                <span className="text-sm text-white font-medium">Organizador Activo</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="px-4 sm:px-6 py-4 sm:py-6 bg-gray-50/50 border-b border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Eventos</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{analytics.totalEvents}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-500 rounded-lg">
                    <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium">Asistentes</p>
                    <p className="text-lg sm:text-2xl font-bold text-green-600">{analytics.totalAttendees}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-green-500 rounded-lg">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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
                    className={`tab-button flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">
                      {tab.label === 'Mi Perfil' ? 'Mi' :
                       tab.label === 'Configuración' ? 'Config' : tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base">{user?.name}</p>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base break-all">{user?.email}</p>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base">
                          {user?.preferences?.location || 'No especificada'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organización
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData(prev => ({ ...prev, organization: e.target.value }))}
                          placeholder="Nombre de tu organización"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base">
                          {user?.preferences?.organization || 'No especificada'}
                        </p>
                      )}
                    </div>

                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Biografía
                      </label>
                      {isEditing ? (
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                          placeholder="Cuéntanos sobre ti como organizador..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm sm:text-base"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium px-3 py-2 bg-gray-50 rounded-lg text-sm sm:text-base">
                          {user?.preferences?.bio || 'No especificada'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <div className="px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                          Organizador
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Notificaciones</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { label: 'Notificaciones por Email', enabled: true },
                      { label: 'Notificaciones Push', enabled: true },
                      { label: 'Recordatorios de Eventos', enabled: true },
                      { label: 'Actualizaciones de Asistentes', enabled: true },
                      { label: 'Reportes de Ingresos', enabled: true },
                      { label: 'Ofertas y Promociones', enabled: false }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <span className="text-xs sm:text-sm font-medium text-gray-700">{setting.label}</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                          <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 sm:p-6">
                  <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Seguridad</h2>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button className="w-full text-left p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm sm:text-base">Cambiar Contraseña</p>
                          <p className="text-xs sm:text-sm text-gray-500">Última actualización hace 2 meses</p>
                        </div>
                        <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfilePanel;
