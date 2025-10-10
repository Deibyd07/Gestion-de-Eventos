import React, { useState, useEffect } from 'react';
import { Download, Upload } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [userToUpdateRole, setUserToUpdateRole] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  // Función para obtener estadísticas basadas en el rol del usuario
  const getStatsByRole = (userRole: string) => {
    const allUsers = users;
    const filteredUsers = filterRole === 'all' ? allUsers : allUsers.filter(u => u.rol === filterRole);
    
    switch (userRole) {
      case 'admin':
        return {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.estado === 'activo').length,
          organizers: allUsers.filter(u => u.rol === 'organizador').length,
          verifiedUsers: allUsers.filter(u => u.verificacion).length
        };
      case 'organizador':
        return {
          totalUsers: filteredUsers.length,
          activeUsers: filteredUsers.filter(u => u.estado === 'activo').length,
          attendees: filteredUsers.filter(u => u.rol === 'asistente').length,
          verifiedUsers: filteredUsers.filter(u => u.verificacion).length
        };
      case 'asistente':
        return {
          totalUsers: filteredUsers.length,
          activeUsers: filteredUsers.filter(u => u.estado === 'activo').length,
          organizers: filteredUsers.filter(u => u.rol === 'organizador').length,
          verifiedUsers: filteredUsers.filter(u => u.verificacion).length
        };
      default:
        return {
          totalUsers: allUsers.length,
          activeUsers: allUsers.filter(u => u.estado === 'activo').length,
          organizers: allUsers.filter(u => u.rol === 'organizador').length,
          verifiedUsers: allUsers.filter(u => u.verificacion).length
        };
    }
  };

  // Obtener el rol del usuario actual (simulado)
  // En una aplicación real, esto vendría del contexto de autenticación
  const currentUserRole = 'admin';
  const stats = getStatsByRole(currentUserRole);

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
    <div className="space-y-4 md:space-y-6 w-full max-w-full">

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row justify-end items-start sm:items-center gap-2 sm:gap-3">
        <div className="flex flex-row-reverse sm:flex-row flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          <button
            onClick={handleImportUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </button>
          <button
            onClick={handleExportUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {/* Total Usuarios */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Usuarios</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        {/* Activos */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Activos</p>
              <p className="text-2xl font-bold text-green-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        {/* Organizadores/Asistentes */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-700">
                {currentUserRole === 'organizador' ? 'Asistentes' : 'Organizadores'}
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {currentUserRole === 'organizador' ? stats.attendees : stats.organizers}
              </p>
            </div>
          </div>
        </div>

        {/* Verificados */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl md:rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">Verificados</p>
              <p className="text-2xl font-bold text-orange-900">{stats.verifiedUsers}</p>
            </div>
          </div>
        </div>
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
        currentUserRole={currentUserRole}
      />
    </div>
  );
};