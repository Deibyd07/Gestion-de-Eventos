import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  Edit3, 
  Save, 
  Camera,
  CheckCircle,
  Key,
  Bell,
  Eye,
  Download,
  Lock,
  Activity,
  TrendingUp,
  Clock,
  Award,
  Database,
  Server,
  Globe
} from 'lucide-react';

export const AdminProfilePanel: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'activity', label: 'Actividad', icon: Activity },
    { id: 'settings', label: 'Configuración', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600 mt-2">Gestiona tu información personal y configuración</p>
            </div>
            <div className="flex items-center space-x-3">
              {showSuccess && (
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Perfil actualizado</span>
                </div>
              )}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel Principal Organizado */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
          {/* Header del Panel */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Panel de Administración</h2>
                  <p className="text-blue-100">Gestiona tu perfil y configuración del sistema</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-sm text-white font-medium">Sistema Activo</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
            {/* Sidebar de Navegación */}
            <div className="lg:col-span-1 bg-gray-50/50 border-r border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Módulos</h3>
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? 'bg-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Avatar y Estado */}
              <div className="p-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="relative inline-block mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-lg">
                        <Camera className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  
                  <h3 className="text-sm font-semibold text-gray-900">Administrador</h3>
                  <p className="text-xs text-gray-600">Super Admin</p>
                  
                  <div className="mt-3 flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-xs font-medium text-green-600">Activo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido Principal */}
            <div className="lg:col-span-3 p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {/* Información Personal */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue="Administrador del Sistema"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">Administrador del Sistema</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          defaultValue="admin@sistema.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">admin@sistema.com</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          defaultValue="+57 300 123 4567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">+57 300 123 4567</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue="Bogotá, Colombia"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">Bogotá, Colombia</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información Profesional */}
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Información Profesional</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <p className="text-gray-900 font-medium">Super Administrador</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Departamento
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue="Tecnología"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      ) : (
                        <p className="text-gray-900 font-medium">Tecnología</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Configuración de Seguridad</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">Autenticación de Dos Factores</p>
                          <p className="text-sm text-green-600">Activa desde el 15 de enero de 2024</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                        Activo
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">Sesiones Activas</p>
                          <p className="text-sm text-blue-600">3 dispositivos conectados</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                        Ver Detalles
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <Key className="w-5 h-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">Último Cambio de Contraseña</p>
                          <p className="text-sm text-yellow-600">Hace 30 días</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium">
                        Cambiar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="w-5 h-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
                  </div>

                  <div className="space-y-4">
                    {[
                      { action: 'Inició sesión', time: 'Hace 2 horas', icon: Clock, color: 'green' },
                      { action: 'Modificó configuración del sistema', time: 'Hace 4 horas', icon: Settings, color: 'blue' },
                      { action: 'Aprobó 3 eventos nuevos', time: 'Hace 6 horas', icon: CheckCircle, color: 'purple' },
                      { action: 'Generó reporte financiero', time: 'Ayer', icon: Download, color: 'orange' },
                      { action: 'Actualizó permisos de usuario', time: 'Hace 2 días', icon: Shield, color: 'red' }
                    ].map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-lg bg-${activity.color}-100`}>
                            <Icon className={`w-4 h-4 text-${activity.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">Configuración General</h2>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
                      <div className="space-y-3">
                        {[
                          { label: 'Notificaciones por Email', enabled: true },
                          { label: 'Notificaciones Push', enabled: true },
                          { label: 'Alertas de Sistema', enabled: true },
                          { label: 'Reportes Semanales', enabled: false }
                        ].map((setting, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">{setting.label}</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" defaultChecked={setting.enabled} className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Preferencias de Interfaz</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Tema Oscuro</span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Idioma</span>
                          <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
                            <option>Español</option>
                            <option>English</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePanel;
