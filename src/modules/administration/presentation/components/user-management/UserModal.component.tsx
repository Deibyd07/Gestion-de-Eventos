import React from 'react';
import { X, Star, Shield, Crown, Calendar, DollarSign, Users, UserCheck, Activity } from 'lucide-react';

interface User {
  id: string;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
  estado: string;
  fecha_registro: string;
  ultima_actividad: string;
  telefono?: string;
  ubicacion?: string;
  avatar?: string;
  eventos_creados?: number;
  eventos_asistidos?: number;
  ingresos_generados?: number;
  compras_realizadas?: number;
  rating?: number;
  verificacion?: boolean;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  formatCurrency,
  formatDate
}) => {
  if (!isOpen || !user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-5 h-5 text-purple-600" />;
      case 'organizador': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'asistente': return <Star className="w-5 h-5 text-green-600" />;
      default: return <Star className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'suspendido': return 'bg-red-100 text-red-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Usuario</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="flex items-start space-x-4 mb-6">
            <img
              className="h-20 w-20 rounded-full"
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.nombre_completo}&background=random`}
              alt={user.nombre_completo}
            />
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {user.nombre_completo}
                {user.verificacion && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verificado
                  </span>
                )}
              </h3>
              <p className="text-gray-600 mb-2">{user.correo_electronico}</p>
              {user.telefono && (
                <p className="text-gray-600 mb-2">{user.telefono}</p>
              )}
              {user.ubicacion && (
                <p className="text-gray-600">{user.ubicacion}</p>
              )}
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                {getRoleIcon(user.rol)}
                <span className="ml-2 text-sm font-medium text-gray-700">Rol</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 capitalize">{user.rol}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">Estado</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(user.estado)}`}>
                {user.estado}
              </span>
            </div>
          </div>

          {/* Statistics - Mostrar según el rol */}
          {user.rol === 'organizador' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Eventos Asignados</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{user.eventos_creados || 0}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Ingresos Generados</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{formatCurrency(user.ingresos_generados || 0)}</p>
                </div>
              </div>

              {/* Rating - Solo para organizadores */}
              {!!user.rating && user.rating > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center mb-2">
                    <Star className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Rating Promedio</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(user.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-lg font-semibold text-gray-900">{user.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </>
          )}

          {user.rol === 'asistente' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Eventos Asistidos</span>
                </div>
                <p className="text-2xl font-bold text-green-900">{user.eventos_asistidos || 0}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Compras Realizadas</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{user.compras_realizadas || 0}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-indigo-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Total Gastado</span>
                </div>
                <p className="text-2xl font-bold text-indigo-900">{formatCurrency(user.ingresos_generados || 0)}</p>
              </div>
            </div>
          )}

          {user.rol === 'administrador' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Permisos</span>
                  </div>
                  <p className="text-lg font-bold text-purple-900">Acceso Total</p>
                  <p className="text-xs text-gray-600 mt-1">Administrador del sistema</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Activity className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Estado del Sistema</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">Operativo</p>
                  <p className="text-xs text-gray-600 mt-1">Todos los servicios activos</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <UserCheck className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Gestión de Usuarios</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900">Completo</p>
                  <p className="text-xs text-gray-600 mt-1">CRUD total</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Gestión de Eventos</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-900">Completo</p>
                  <p className="text-xs text-gray-600 mt-1">Control total</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="w-5 h-5 text-cyan-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Reportes Financieros</span>
                  </div>
                  <p className="text-2xl font-bold text-cyan-900">Acceso</p>
                  <p className="text-xs text-gray-600 mt-1">Vista completa</p>
                </div>
              </div>
            </>
          )}

          {/* Activity Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Fecha de Registro</h4>
              <p className="text-lg text-gray-900">{formatDate(user.fecha_registro)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Última Actividad</h4>
              <p className="text-lg text-gray-900">{formatDate(user.ultima_actividad)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
