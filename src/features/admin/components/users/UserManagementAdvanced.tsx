import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2, 
  Shield, 
  UserCheck, 
  X,
  Download,
  Upload,
  MoreVertical,
  Star,
  AlertTriangle,
  Ban,
  Unlock,
  Crown,
  UserCog
} from 'lucide-react';

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

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('fecha_registro');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  // Datos de ejemplo más realistas
  const mockUsers: User[] = [
    {
      id: '1',
      nombre_completo: 'Juan Pérez',
      correo_electronico: 'juan.perez@email.com',
      rol: 'organizador',
      estado: 'activo',
      fecha_registro: '2024-01-15',
      ultima_actividad: '2024-11-28',
      telefono: '+57 300 123 4567',
      ubicacion: 'Bogotá, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
      eventos_creados: 12,
      eventos_asistidos: 8,
      ingresos_generados: 15000000,
      rating: 4.8,
      verificacion: true
    },
    {
      id: '2',
      nombre_completo: 'Ana López',
      correo_electronico: 'ana.lopez@email.com',
      rol: 'organizador',
      estado: 'activo',
      fecha_registro: '2024-02-20',
      ultima_actividad: '2024-11-27',
      telefono: '+57 300 234 5678',
      ubicacion: 'Medellín, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      eventos_creados: 8,
      eventos_asistidos: 15,
      ingresos_generados: 12000000,
      rating: 4.9,
      verificacion: true
    },
    {
      id: '3',
      nombre_completo: 'Carlos Ruiz',
      correo_electronico: 'carlos.ruiz@email.com',
      rol: 'asistente',
      estado: 'activo',
      fecha_registro: '2024-03-10',
      ultima_actividad: '2024-11-26',
      telefono: '+57 300 345 6789',
      ubicacion: 'Cali, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      eventos_creados: 0,
      eventos_asistidos: 6,
      ingresos_generados: 0,
      rating: 4.7,
      verificacion: false
    },
    {
      id: '4',
      nombre_completo: 'María García',
      correo_electronico: 'maria.garcia@email.com',
      rol: 'administrador',
      estado: 'activo',
      fecha_registro: '2024-01-01',
      ultima_actividad: '2024-11-28',
      telefono: '+57 300 456 7890',
      ubicacion: 'Barranquilla, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      eventos_creados: 0,
      eventos_asistidos: 3,
      ingresos_generados: 0,
      rating: 5.0,
      verificacion: true
    },
    {
      id: '5',
      nombre_completo: 'Pedro Martínez',
      correo_electronico: 'pedro.martinez@email.com',
      rol: 'organizador',
      estado: 'suspendido',
      fecha_registro: '2024-04-05',
      ultima_actividad: '2024-11-20',
      telefono: '+57 300 567 8901',
      ubicacion: 'Cartagena, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      eventos_creados: 3,
      eventos_asistidos: 2,
      ingresos_generados: 5000000,
      rating: 3.2,
      verificacion: false
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.correo_electronico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.rol === filterRole;
    const matchesStatus = filterStatus === 'all' || user.estado === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'activo': return 'text-green-600 bg-green-100';
      case 'suspendido': return 'text-red-600 bg-red-100';
      case 'inactivo': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'activo': return 'Activo';
      case 'suspendido': return 'Suspendido';
      case 'inactivo': return 'Inactivo';
      default: return 'Desconocido';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'administrador': return 'text-red-600 bg-red-100';
      case 'organizador': return 'text-blue-600 bg-blue-100';
      case 'asistente': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'administrador': return 'Administrador';
      case 'organizador': return 'Organizador';
      case 'asistente': return 'Asistente';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'view':
          const user = users.find(u => u.id === userId);
          if (user) {
            setSelectedUser(user);
            setShowUserModal(true);
          }
          break;
        case 'edit':
          // Implementar edición
          console.log('Editar usuario:', userId);
          break;
        case 'changeRole':
          const userToChange = users.find(u => u.id === userId);
          if (userToChange) {
            setUserToUpdateRole(userToChange);
            setNewRole(userToChange.rol);
            setShowRoleModal(true);
          }
          break;
        case 'delete':
          if (confirm('¿Estás seguro de eliminar este usuario?')) {
            setUsers(users.filter(u => u.id !== userId));
          }
          break;
        case 'suspend':
          setUsers(users.map(u => 
            u.id === userId ? { ...u, estado: 'suspendido' } : u
          ));
          break;
        case 'activate':
          setUsers(users.map(u => 
            u.id === userId ? { ...u, estado: 'activo' } : u
          ));
          break;
        case 'verify':
          setUsers(users.map(u => 
            u.id === userId ? { ...u, verificacion: true } : u
          ));
          break;
      }
    } catch (error) {
      console.error('Error en acción de usuario:', error);
    }
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'activate':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, estado: 'activo' } : u
        ));
        break;
      case 'suspend':
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? { ...u, estado: 'suspendido' } : u
        ));
        break;
      case 'delete':
        if (confirm(`¿Estás seguro de eliminar ${selectedUsers.length} usuarios?`)) {
          setUsers(users.filter(u => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
        }
        break;
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(filteredUsers.map(u => u.id));
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  const handleUpdateRole = async () => {
    if (!userToUpdateRole || !newRole) return;

    try {
      // Importar el servicio de usuarios
        const { ServicioUsuarios } = await import('../../../../core/services/supabaseServiceEspanol');
      
      // Actualizar en la base de datos
      await ServicioUsuarios.actualizarUsuario(userToUpdateRole.id, {
        rol: newRole as 'organizador' | 'asistente' | 'administrador'
      });

      // Actualizar en el estado local
      setUsers(users.map(u => 
        u.id === userToUpdateRole.id ? { ...u, rol: newRole } : u
      ));

      // Cerrar modal y limpiar estado
      setShowRoleModal(false);
      setUserToUpdateRole(null);
      setNewRole('');

      alert('Rol actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando rol:', error);
      alert('Error al actualizar el rol. Inténtalo de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2 admin-panel panel-consistent-width">
      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm">
          <Upload className="w-4 h-4" />
          <span>Importar</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
          <Download className="w-4 h-4" />
          <span>Exportar</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm">
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 metrics-container grid-consistent">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Usuarios</p>
              <p className="text-2xl font-bold text-blue-900">{users.length}</p>
              <p className="text-sm text-blue-600 font-medium">Registrados</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Usuarios Activos</p>
              <p className="text-2xl font-bold text-green-900">
                {users.filter(u => u.estado === 'activo').length}
              </p>
              <p className="text-sm text-green-600 font-medium">En línea</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">Organizadores</p>
              <p className="text-2xl font-bold text-purple-900">
                {users.filter(u => u.rol === 'organizador').length}
              </p>
              <p className="text-sm text-purple-600 font-medium">Verificados</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl shadow-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-amber-700">Verificados</p>
              <p className="text-2xl font-bold text-amber-900">
                {users.filter(u => u.verificacion).length}
              </p>
              <p className="text-sm text-yellow-600 font-medium">Confirmados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
            />
          </div>

          {/* Role Filter */}
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
          >
            <option value="all">Todos los roles</option>
            <option value="administrador">Administradores</option>
            <option value="organizador">Organizadores</option>
            <option value="asistente">Asistentes</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="suspendido">Suspendidos</option>
            <option value="inactivo">Inactivos</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
          >
            <option value="fecha_registro">Fecha de registro</option>
            <option value="nombre_completo">Nombre</option>
            <option value="ultima_actividad">Última actividad</option>
            <option value="rating">Rating</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Vista:</span>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-blue-700">
                  {selectedUsers.length} usuarios seleccionados
                </span>
                <button
                  onClick={clearSelection}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Limpiar selección
                </button>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Activar
                </button>
                <button
                  onClick={() => handleBulkAction('suspend')}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Suspender
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users List/Grid */}
      {viewMode === 'list' ? (
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden">
          <div className="overflow-x-auto admin-table">
            <table className="w-full">
              <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={selectedUsers.length === filteredUsers.length ? clearSelection : selectAllUsers}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actividad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <img
                          src={user.avatar}
                          alt={user.nombre_completo}
                          className="w-10 h-10 rounded-full mr-4"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.nombre_completo}</div>
                          <div className="text-sm text-gray-500">{user.correo_electronico}</div>
                          {user.verificacion && (
                            <div className="flex items-center mt-1">
                              <Shield className="w-3 h-3 text-green-500 mr-1" />
                              <span className="text-xs text-green-600">Verificado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                        {getRoleText(user.rol)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                        {getStatusText(user.estado)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(user.ultima_actividad)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-sm font-medium">{user.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUserAction(user.id, 'view')}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'edit')}
                          className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'changeRole')}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Cambiar rol"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, user.estado === 'activo' ? 'suspend' : 'activate')}
                          className={`p-2 transition-colors ${
                            user.estado === 'activo' 
                              ? 'text-gray-400 hover:text-yellow-600' 
                              : 'text-gray-400 hover:text-green-600'
                          }`}
                        >
                          {user.estado === 'activo' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleUserAction(user.id, 'delete')}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 grid-scrollable grid-consistent">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-6 hover:shadow-2xl transition-all duration-200 card-scrollable card-consistent">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={user.avatar}
                    alt={user.nombre_completo}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.nombre_completo}</h3>
                    <p className="text-sm text-gray-500">{user.correo_electronico}</p>
                    {user.verificacion && (
                      <div className="flex items-center mt-1">
                        <Shield className="w-3 h-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-600">Verificado</span>
                      </div>
                    )}
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rol:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.rol)}`}>
                    {getRoleText(user.rol)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.estado)}`}>
                    {getStatusText(user.estado)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{user.rating}</span>
                  </div>
                </div>
                {user.eventos_creados && user.eventos_creados > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Eventos creados:</span>
                    <span className="text-sm font-medium">{user.eventos_creados}</span>
                  </div>
                )}
                {user.ingresos_generados && user.ingresos_generados > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ingresos:</span>
                    <span className="text-sm font-medium">{formatCurrency(user.ingresos_generados)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Última actividad: {formatDate(user.ultima_actividad)}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUserAction(user.id, 'view')}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'edit')}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, 'changeRole')}
                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                    title="Cambiar rol"
                  >
                    <UserCog className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUserAction(user.id, user.estado === 'activo' ? 'suspend' : 'activate')}
                    className={`p-2 transition-colors ${
                      user.estado === 'activo' 
                        ? 'text-gray-400 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-green-600'
                    }`}
                  >
                    {user.estado === 'activo' ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-scrollable">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Detalles del Usuario</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.nombre_completo}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedUser.nombre_completo}</h4>
                    <p className="text-gray-600">{selectedUser.correo_electronico}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.rol)}`}>
                        {getRoleText(selectedUser.rol)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.estado)}`}>
                        {getStatusText(selectedUser.estado)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Teléfono</label>
                    <p className="text-sm text-gray-900">{selectedUser.telefono || 'No disponible'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ubicación</label>
                    <p className="text-sm text-gray-900">{selectedUser.ubicacion || 'No disponible'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha de Registro</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedUser.fecha_registro)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Última Actividad</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedUser.ultima_actividad)}</p>
                  </div>
                </div>

                {selectedUser.eventos_creados && selectedUser.eventos_creados > 0 && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedUser.eventos_creados}</div>
                      <div className="text-sm text-blue-600">Eventos Creados</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedUser.eventos_asistidos}</div>
                      <div className="text-sm text-green-600">Eventos Asistidos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{selectedUser.rating}</div>
                      <div className="text-sm text-purple-600">Rating</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => handleUserAction(selectedUser.id, 'edit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Editar Usuario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && userToUpdateRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Cambiar Rol de Usuario</h3>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={userToUpdateRole.avatar}
                    alt={userToUpdateRole.nombre_completo}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{userToUpdateRole.nombre_completo}</h4>
                    <p className="text-sm text-gray-500">{userToUpdateRole.correo_electronico}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol Actual
                  </label>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userToUpdateRole.rol)}`}>
                    {getRoleText(userToUpdateRole.rol)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo Rol
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="asistente">Asistente</option>
                    <option value="organizador">Organizador</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">Advertencia:</p>
                      <p>Cambiar el rol del usuario afectará sus permisos de acceso al sistema.</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdateRole}
                    disabled={newRole === userToUpdateRole.rol}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Actualizar Rol
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};