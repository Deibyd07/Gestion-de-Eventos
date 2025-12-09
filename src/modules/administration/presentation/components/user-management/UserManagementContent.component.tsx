import React from 'react';
import { UserFilters } from './UserFilters.component';
import { UserList } from './UserList.component';
import { UserGrid } from './UserGrid.component';
import { UserModal } from './UserModal.component';
import { RoleUpdateModal } from './RoleUpdateModal.component';

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

interface UserManagementContentProps {
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterRole: string;
  setFilterRole: (role: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  selectedUsers: string[];
  setSelectedUsers: (users: string[]) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  showUserModal: boolean;
  setShowUserModal: (show: boolean) => void;
  userToUpdateRole: User | null;
  setUserToUpdateRole: (user: User | null) => void;
  showRoleModal: boolean;
  setShowRoleModal: (show: boolean) => void;
  newRole: string;
  setNewRole: (role: string) => void;
  onViewOrganizerProfile?: (user: User) => void;
  onSelectUser: (userId: string) => void;
  onSelectAllUsers: () => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onUpdateUserRole: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
  onConfirmRoleUpdate: () => void;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string) => string;
  currentUserRole: string;
}

export const UserManagementContent: React.FC<UserManagementContentProps> = ({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  selectedUsers,
  setSelectedUsers,
  selectedUser,
  setSelectedUser,
  showUserModal,
  setShowUserModal,
  userToUpdateRole,
  setUserToUpdateRole,
  showRoleModal,
  setShowRoleModal,
  newRole,
  setNewRole,
  onViewOrganizerProfile,
  onSelectUser,
  onSelectAllUsers,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onUpdateUserRole,
  onToggleUserStatus,
  onConfirmRoleUpdate,
  formatCurrency,
  formatDate,
  currentUserRole
}) => {
  // Función para filtrar usuarios según el rol del usuario actual
  const getFilteredUsersByRole = (users: User[], userRole: string) => {
    switch (userRole) {
      case 'admin':
        return users; // Admin ve todos los usuarios
      case 'organizador':
        return users.filter(user => user.rol === 'asistente'); // Organizador solo ve asistentes
      case 'asistente':
        return users.filter(user => user.rol === 'organizador'); // Asistente solo ve organizadores
      default:
        return users;
    }
  };

  // Función para aplicar filtros de búsqueda, rol y estado
  const applyFilters = (users: User[]) => {
    let filtered = [...users];

    // Filtro por búsqueda (nombre o email)
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.nombre_completo.toLowerCase().includes(search) ||
        user.correo_electronico.toLowerCase().includes(search)
      );
    }

    // Filtro por rol (case-insensitive)
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.rol.toLowerCase() === filterRole.toLowerCase());
    }

    // Filtro por estado
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.estado === filterStatus);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'nombre_completo':
          return a.nombre_completo.localeCompare(b.nombre_completo);
        case 'ultima_actividad':
          return new Date(b.ultima_actividad).getTime() - new Date(a.ultima_actividad).getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'fecha_registro':
        default:
          return new Date(b.fecha_registro).getTime() - new Date(a.fecha_registro).getTime();
      }
    });

    return filtered;
  };

  const roleFilteredUsers = getFilteredUsersByRole(users, currentUserRole);
  const filteredUsers = applyFilters(roleFilteredUsers);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters con panel glassmorphism */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-4 md:p-6">
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterRole={filterRole}
          setFilterRole={setFilterRole}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Filtros activos */}
        {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchTerm && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Búsqueda: "{searchTerm}"
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterRole !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Rol: {filterRole}
                <button
                  onClick={() => setFilterRole('all')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
                >
                  ×
                </button>
              </span>
            )}
            {filterStatus !== 'all' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Estado: {filterStatus}
                <button
                  onClick={() => setFilterStatus('all')}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-yellow-200"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterStatus('all');
              }}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
            >
              Limpiar todos
            </button>
          </div>
        )}

        {/* View Mode Toggle y Contador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm text-gray-600">Vista:</span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Vista de cuadrícula"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`hidden sm:flex p-2 rounded-xl transition-all duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title="Vista de lista"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
          <div className="text-xs md:text-sm text-gray-600 flex items-center">
            <span className="hidden sm:inline">
              {filteredUsers.length} de {roleFilteredUsers.length} usuarios
              {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') ? ' (filtrados)' : ''}
            </span>
            <span className="sm:hidden">{filteredUsers.length}</span>
          </div>
        </div>
      </div>

      {/* Users Display */}
      {filteredUsers.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl md:rounded-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                ? 'No hay usuarios que coincidan con los filtros aplicados.'
                : 'No hay usuarios registrados en el sistema.'
              }
            </p>
            {(searchTerm || filterRole !== 'all' || filterStatus !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterRole('all');
                  setFilterStatus('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        <UserList
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectUser={onSelectUser}
          onSelectAllUsers={onSelectAllUsers}
          onViewUser={onViewUser}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
          onUpdateUserRole={onUpdateUserRole}
          onToggleUserStatus={onToggleUserStatus}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      ) : (
        <UserGrid
          users={filteredUsers}
          selectedUsers={selectedUsers}
          onSelectUser={onSelectUser}
          onViewUser={onViewUser}
          onEditUser={onEditUser}
          onDeleteUser={onDeleteUser}
          onUpdateUserRole={onUpdateUserRole}
          onToggleUserStatus={onToggleUserStatus}
          onViewOrganizerProfile={onViewOrganizerProfile}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      {/* Modals */}
      <UserModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />

      <RoleUpdateModal
        user={userToUpdateRole}
        isOpen={showRoleModal}
        newRole={newRole}
        setNewRole={setNewRole}
        onClose={() => setShowRoleModal(false)}
        onConfirm={onConfirmRoleUpdate}
      />
    </div>
  );
};
