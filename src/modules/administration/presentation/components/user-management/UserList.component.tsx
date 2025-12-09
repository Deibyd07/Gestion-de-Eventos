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

  const renderUserStatistics = (user: User) => {
    switch (user.rol) {
      case 'organizador':
        return (
          <div>
            <div className="text-xs">Eventos: {user.eventos_creados || 0}</div>
            <div className="text-xs">Ingresos: {formatCurrency(user.ingresos_generados || 0)}</div>
            {!!user.rating && user.rating > 0 && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs">{user.rating}</span>
              </div>
            )}
          </div>
        );
      
      case 'asistente':
        return (
          <div>
            <div className="text-xs">Compras: {user.compras_realizadas || 0}</div>
            <div className="text-xs">Entradas: {user.total_entradas || 0}</div>
            {!!user.rating && user.rating > 0 && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs">{user.rating}</span>
              </div>
            )}
          </div>
        );
      
      case 'admin':
        return (
          <div>
            <div className="text-xs">Acceso: Total</div>
            <div className="text-xs">Privilegios: Máximo</div>
            <div className="text-xs">Gestión: Completa</div>
          </div>
        );
      
      default:
        return (
          <div>
            <div className="text-xs">Eventos: {user.eventos_creados || 0}</div>
            <div className="text-xs">Actividad: {user.estado}</div>
            {!!user.rating && user.rating > 0 && (
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs">{user.rating}</span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gradient-to-r from-gray-50/80 to-blue-50/80 backdrop-blur-sm">
            <tr>
              <th className="px-3 md:px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={onSelectAllUsers}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Rol
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Estado
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Actividad
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                Estadísticas
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200/50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/80 hover:backdrop-blur-sm transition-all duration-200">
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => onSelectUser(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 md:h-10 md:w-10">
                      <img
                        className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                        src={user.avatar || `https://ui-avatars.com/api/?name=${user.nombre_completo}&background=random`}
                        alt={user.nombre_completo}
                      />
                    </div>
                    <div className="ml-3 md:ml-4 min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.nombre_completo}
                        {user.verificacion && (
                          <span className="ml-1 md:ml-2 inline-flex items-center px-1.5 md:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="text-xs md:text-sm text-gray-500 truncate">{user.correo_electronico}</div>
                      {user.telefono && (
                        <div className="text-xs text-gray-500 truncate">{user.telefono}</div>
                      )}
                      {/* Mobile: Show role and status inline */}
                      <div className="sm:hidden flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {getRoleIcon(user.rol)}
                          <span className={`ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                            {user.rol}
                          </span>
                        </div>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                          {user.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                  <div className="flex items-center">
                    {getRoleIcon(user.rol)}
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                      {user.rol}
                    </span>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                    {user.estado}
                  </span>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                  <div className="text-xs">Registro: {formatDate(user.fecha_registro)}</div>
                  <div className="text-xs">Última: {formatDate(user.ultima_actividad)}</div>
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                  {renderUserStatistics(user)}
                </td>
                <td className="px-3 md:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <button
                      onClick={() => onViewUser(user)}
                      className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm text-blue-700 rounded-lg hover:from-blue-500/30 hover:to-blue-600/30 hover:text-blue-800 transition-all duration-200 shadow-sm hover:shadow-md border border-blue-200/50"
                      title="Ver"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
