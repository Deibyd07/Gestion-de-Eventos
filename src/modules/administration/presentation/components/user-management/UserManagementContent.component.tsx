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
  formatDate
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
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
        onExportUsers={onExportUsers}
        onImportUsers={onImportUsers}
      />

      {/* Users Display */}
      {viewMode === 'list' ? (
        <UserList
          users={users}
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
          users={users}
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
