import React from 'react';
import { Eye, Edit, Trash2, Star, Shield, Ban, Unlock, Crown } from 'lucide-react';

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
  rating?: number;
  verificacion?: boolean;
}

interface UserGridProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
  onViewOrganizerProfile?: (user: User) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const UserGrid: React.FC<UserGridProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  onViewOrganizerProfile,
  formatCurrency,
  formatDate
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-gray-100 text-gray-800';
      case 'suspendido': return 'bg-red-100 text-red-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-purple-600" />;
      case 'organizador': return <Shield className="w-4 h-4 text-blue-600" />;
      case 'asistente': return <Star className="w-4 h-4 text-green-600" />;
      default: return <Star className="w-4 h-4 text-gray-600" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'organizador': return 'bg-blue-100 text-blue-800';
      case 'asistente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUserStatistics = (user: User) => {
    switch (user.rol) {
      case 'organizador':
        return (
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Eventos:</span>
              <span className="font-medium">{user.eventos_creados || 0}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Ingresos:</span>
              <span className="font-medium text-xs md:text-sm">{formatCurrency(user.ingresos_generados || 0)}</span>
            </div>
            {user.rating && (
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-500">Rating:</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="font-medium">{user.rating}</span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'asistente':
        return (
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Eventos asistidos:</span>
              <span className="font-medium">{user.eventos_asistidos || 0}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Participaciones:</span>
              <span className="font-medium">{user.eventos_asistidos || 0}</span>
            </div>
            {user.rating && (
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-500">Rating:</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="font-medium">{user.rating}</span>
                </div>
              </div>
            )}
          </div>
        );
      
      case 'admin':
        return (
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Sistema:</span>
              <span className="font-medium text-green-600">Activo</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Permisos:</span>
              <span className="font-medium text-blue-600">Completo</span>
            </div>
            {user.rating && (
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-500">Rating:</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="font-medium">{user.rating}</span>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Eventos:</span>
              <span className="font-medium">{user.eventos_creados || 0}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm">
              <span className="text-gray-500">Actividad:</span>
              <span className="font-medium">{user.estado}</span>
            </div>
            {user.rating && (
              <div className="flex justify-between text-xs md:text-sm">
                <span className="text-gray-500">Rating:</span>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 mr-1" />
                  <span className="font-medium">{user.rating}</span>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {users.map((user) => (
        <div key={user.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-200 hover:scale-105">
          <div className="p-4 md:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex items-center space-x-2 md:space-x-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onSelectUser(user.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <img
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full"
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.nombre_completo}&background=random`}
                  alt={user.nombre_completo}
                />
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onViewUser(user)}
                  className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm text-blue-700 rounded-lg hover:from-blue-500/30 hover:to-blue-600/30 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200/50"
                  title="Ver"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {user.rol === 'organizador' && onViewOrganizerProfile && (
                  <button
                    onClick={() => onViewOrganizerProfile(user)}
                    className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 backdrop-blur-sm text-purple-700 rounded-lg hover:from-purple-500/30 hover:to-purple-600/30 hover:text-purple-800 transition-all duration-200 shadow-sm hover:shadow-md border border-purple-200/50"
                    title="Ver Perfil de Organizador"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => onEditUser(user)}
                  className="p-2 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 backdrop-blur-sm text-indigo-700 rounded-lg hover:from-indigo-500/30 hover:to-indigo-600/30 hover:text-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md border border-indigo-200/50"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleUserStatus(user)}
                  className={`p-2 backdrop-blur-sm rounded-lg transition-all duration-200 shadow-sm hover:shadow-md border ${
                    user.estado === 'activo' 
                      ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-700 hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 border-red-200/50' 
                      : 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-700 hover:from-green-500/30 hover:to-green-600/30 hover:text-green-800 border-green-200/50'
                  }`}
                  title={user.estado === 'activo' ? 'Suspender' : 'Activar'}
                >
                  {user.estado === 'activo' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDeleteUser(user)}
                  className="p-2 bg-gradient-to-r from-red-500/20 to-red-600/20 backdrop-blur-sm text-red-700 rounded-lg hover:from-red-500/30 hover:to-red-600/30 hover:text-red-800 transition-all duration-200 shadow-sm hover:shadow-md border border-red-200/50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-3 md:mb-4">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1 truncate">
                {user.nombre_completo}
                {user.verificacion && (
                  <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 md:px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓
                  </span>
                )}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 mb-1 md:mb-2 truncate">{user.correo_electronico}</p>
              {user.telefono && (
                <p className="text-xs text-gray-500 truncate">{user.telefono}</p>
              )}
            </div>

            {/* Role and Status */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="flex items-center">
                {getRoleIcon(user.rol)}
                <span className={`ml-1 md:ml-2 inline-flex items-center px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                  {user.rol}
                </span>
              </div>
              <span className={`inline-flex items-center px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                {user.estado}
              </span>
            </div>

            {/* Statistics */}
            <div className="mb-3 md:mb-4">
              {renderUserStatistics(user)}
            </div>

            {/* Activity */}
            <div className="text-xs text-gray-500">
              <div className="truncate">Registro: {formatDate(user.fecha_registro)}</div>
              <div className="truncate">Última: {formatDate(user.ultima_actividad)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
