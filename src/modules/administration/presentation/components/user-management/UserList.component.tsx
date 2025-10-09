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

interface UserListProps {
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAllUsers: () => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onUpdateUserRole: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  selectedUsers,
  onSelectUser,
  onSelectAllUsers,
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={onSelectAllUsers}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actividad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.nombre_completo}&background=random`}
                        alt={user.nombre_completo}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.nombre_completo}
                        {user.verificacion && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Verificado
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.correo_electronico}</div>
                      {user.telefono && (
                        <div className="text-sm text-gray-500">{user.telefono}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getRoleIcon(user.rol)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                      {user.rol}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                    {user.estado}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Registro: {formatDate(user.fecha_registro)}</div>
                  <div>Última: {formatDate(user.ultima_actividad)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Eventos: {user.eventos_creados || 0}</div>
                  <div>Ingresos: {formatCurrency(user.ingresos_generados || 0)}</div>
                  {user.rating && (
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span>{user.rating}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewUser(user)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleUserStatus(user)}
                      className={user.estado === 'activo' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {user.estado === 'activo' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onDeleteUser(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
