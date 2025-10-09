import React from 'react';
import { Eye, Edit, Trash2, MoreVertical, Star, Shield, Ban, Unlock, Crown } from 'lucide-react';

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
  onUpdateUserRole: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
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
  onUpdateUserRole,
  onToggleUserStatus,
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {users.map((user) => (
        <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => onSelectUser(user.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <img
                  className="h-12 w-12 rounded-full"
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.nombre_completo}&background=random`}
                  alt={user.nombre_completo}
                />
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onViewUser(user)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEditUser(user)}
                  className="p-1 text-gray-400 hover:text-indigo-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleUserStatus(user)}
                  className={`p-1 ${user.estado === 'activo' ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                >
                  {user.estado === 'activo' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDeleteUser(user)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {user.nombre_completo}
                {user.verificacion && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verificado
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{user.correo_electronico}</p>
              {user.telefono && (
                <p className="text-sm text-gray-500">{user.telefono}</p>
              )}
            </div>

            {/* Role and Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getRoleIcon(user.rol)}
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                  {user.rol}
                </span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                {user.estado}
              </span>
            </div>

            {/* Statistics */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Eventos creados:</span>
                <span className="font-medium">{user.eventos_creados || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ingresos:</span>
                <span className="font-medium">{formatCurrency(user.ingresos_generados || 0)}</span>
              </div>
              {user.rating && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Rating:</span>
                  <div className="flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1" />
                    <span className="font-medium">{user.rating}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Activity */}
            <div className="text-xs text-gray-500">
              <div>Registro: {formatDate(user.fecha_registro)}</div>
              <div>Última actividad: {formatDate(user.ultima_actividad)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
