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
  onSelectUser: (userId: string) => void;
  onSelectAllUsers: () => void;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onUpdateUserRole: (user: User) => void;
  onToggleUserStatus: (user: User) => void;
  onExportUsers: () => void;
  onImportUsers: () => void;
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
  onSelectUser,
  onSelectAllUsers,
  onViewUser,
  onEditUser,
  onDeleteUser,
  onUpdateUserRole,
  onToggleUserStatus,
  onExportUsers,
  onImportUsers,
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

  const filteredUsers = getFilteredUsersByRole(users, currentUserRole);

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

        {/* View Mode Toggle y Contador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs md:text-sm text-gray-600">Vista:</span>
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
              className={`p-2 rounded-xl transition-all duration-200 ${
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
          <div className="text-xs md:text-sm text-gray-600">
            {filteredUsers.length} usuarios encontrados
          </div>
        </div>
      </div>

      {/* Users Display */}
      {viewMode === 'list' ? (
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
