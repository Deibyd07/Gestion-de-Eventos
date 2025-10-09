import React, { useState, useEffect } from 'react';
import { UserManagementContent } from './user-management/UserManagementContent.component';

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
      eventos_asistidos: 25,
      ingresos_generados: 0,
      rating: 4.7,
      verificacion: false
    },
    {
      id: '4',
      nombre_completo: 'María García',
      correo_electronico: 'maria.garcia@email.com',
      rol: 'admin',
      estado: 'activo',
      fecha_registro: '2024-01-05',
      ultima_actividad: '2024-11-28',
      telefono: '+57 300 456 7890',
      ubicacion: 'Bogotá, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      eventos_creados: 0,
      eventos_asistidos: 5,
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
      fecha_registro: '2024-04-15',
      ultima_actividad: '2024-11-20',
      telefono: '+57 300 567 8901',
      ubicacion: 'Barranquilla, Colombia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
      eventos_creados: 3,
      eventos_asistidos: 12,
      ingresos_generados: 5000000,
      rating: 3.2,
      verificacion: false
    }
  ];

  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    // Implementar edición de usuario
    console.log('Edit user:', user);
  };

  const handleDeleteUser = (user: User) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${user.nombre_completo}?`)) {
      setUsers(prev => prev.filter(u => u.id !== user.id));
    }
  };

  const handleUpdateUserRole = (user: User) => {
    setUserToUpdateRole(user);
    setNewRole(user.rol);
    setShowRoleModal(true);
  };

  const handleToggleUserStatus = (user: User) => {
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, estado: u.estado === 'activo' ? 'suspendido' : 'activo' }
        : u
    ));
  };

  const handleExportUsers = () => {
    // Implementar exportación
    console.log('Export users');
  };

  const handleImportUsers = () => {
    // Implementar importación
    console.log('Import users');
  };

  const handleConfirmRoleUpdate = () => {
    if (userToUpdateRole && newRole) {
      setUsers(prev => prev.map(user => 
        user.id === userToUpdateRole.id 
          ? { ...user, rol: newRole }
          : user
      ));
      setShowRoleModal(false);
      setUserToUpdateRole(null);
      setNewRole('');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
        <p className="text-gray-600 mt-2">Administra todos los usuarios del sistema</p>
      </div>

      <UserManagementContent
        users={users}
        loading={loading}
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
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        showUserModal={showUserModal}
        setShowUserModal={setShowUserModal}
        userToUpdateRole={userToUpdateRole}
        setUserToUpdateRole={setUserToUpdateRole}
        showRoleModal={showRoleModal}
        setShowRoleModal={setShowRoleModal}
        newRole={newRole}
        setNewRole={setNewRole}
        onSelectUser={handleSelectUser}
        onSelectAllUsers={handleSelectAllUsers}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onUpdateUserRole={handleUpdateUserRole}
        onToggleUserStatus={handleToggleUserStatus}
        onExportUsers={handleExportUsers}
        onImportUsers={handleImportUsers}
        onConfirmRoleUpdate={handleConfirmRoleUpdate}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
};