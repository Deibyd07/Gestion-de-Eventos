import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { UserManagementContent } from './user-management/UserManagementContent.component';
import { UserEditModal } from './user-management/UserEditModal.component';
import { UserDeleteModal } from './user-management/UserDeleteModal.component';
import { UserService } from '@shared/lib/api/services/User.service';
import { AddUserModal } from './user-management/AddUserModal.component';
import { supabase } from '@shared/lib/api/supabase';
import { Alert } from '@shared/ui/components/Alert/Alert.component';

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
  compras_realizadas?: number;
  total_entradas?: number;
  rating?: number;
  verificacion?: boolean;
}

interface UserManagementProps {
  onViewOrganizerProfile?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onViewOrganizerProfile, onRefresh, isRefreshing = false }) => {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

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

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔄 Cargando usuarios desde Supabase...');
      const usuariosDB = await UserService.obtenerTodosUsuarios();
      
      // Obtener estadísticas reales para cada usuario según su rol
      const usuariosMapeados: User[] = await Promise.all(usuariosDB.map(async (usuario) => {
        let eventos_creados = 0;
        let eventos_asistidos = 0;
        let ingresos_generados = 0;
        let compras_realizadas = 0;
        let total_entradas = 0;
        let rating = 0;

        try {
          if (usuario.rol === 'organizador' || usuario.rol === 'administrador') {
            // Contar eventos creados por el organizador
            const { data: eventos, error: eventosError } = await supabase
              .from('eventos')
              .select('id')
              .eq('id_organizador', usuario.id);
            
            if (eventosError) {
              console.error(`Error eventos para ${usuario.id}:`, eventosError);
            }
            eventos_creados = eventos?.length || 0;
            console.log(`👤 ${usuario.nombre_completo} (organizador): ${eventos_creados} eventos`);

            // Calcular ingresos de sus eventos (compras completadas)
            // Primero obtener los IDs de eventos del organizador
            if (eventos && eventos.length > 0) {
              const eventosIds = eventos.map(e => e.id);
              const { data: compras, error: comprasError } = await supabase
                .from('compras')
                .select('total_pagado')
                .in('id_evento', eventosIds)
                .eq('estado', 'completada');
              
              if (comprasError) {
                console.error(`Error compras para ${usuario.id}:`, comprasError);
              } else {
                ingresos_generados = compras?.reduce((sum, c) => sum + (c.total_pagado || 0), 0) || 0;
                console.log(`💰 ${usuario.nombre_completo}: ${compras?.length || 0} compras, $${ingresos_generados} ingresos totales`);
              }
            }
          }

          if (usuario.rol === 'asistente' || usuario.rol === 'administrador') {
            // Contar eventos a los que ha asistido
            const { data: asistencias, error: asistError } = await supabase
              .from('asistencia_eventos')
              .select('id')
              .eq('id_usuario', usuario.id);
            
            if (asistError) {
              console.error(`Error asistencias para ${usuario.id}:`, asistError);
            }
            eventos_asistidos = asistencias?.length || 0;
            console.log(`🎟️ ${usuario.nombre_completo} (asistente): ${eventos_asistidos} asistencias`);

            // Contar compras realizadas por el asistente y sumar total de entradas
            const { data: compras, error: comprasError } = await supabase
              .from('compras')
              .select('id, total_pagado, cantidad')
              .eq('id_usuario', usuario.id)
              .eq('estado', 'completada');
            
            if (comprasError) {
              console.error(`Error compras asistente ${usuario.id}:`, comprasError);
            }
            compras_realizadas = compras?.length || 0;
            total_entradas = compras?.reduce((sum, c) => sum + (c.cantidad || 0), 0) || 0;
            ingresos_generados = compras?.reduce((sum, c) => sum + (c.total_pagado || 0), 0) || 0;
            console.log(`🛒 ${usuario.nombre_completo}: ${compras_realizadas} compras, ${total_entradas} entradas, $${ingresos_generados} gastado`);
          }

          // Obtener rating promedio (si es organizador)
          if (usuario.rol === 'organizador') {
            const { data: ratings } = await supabase
              .from('calificaciones_eventos')
              .select('calificacion, eventos!inner(id_organizador)')
              .eq('eventos.id_organizador', usuario.id);
            if (ratings && ratings.length > 0) {
              rating = ratings.reduce((sum, r) => sum + r.calificacion, 0) / ratings.length;
            }
          }
        } catch (err) {
          console.warn(`Error cargando stats para usuario ${usuario.id}:`, err);
        }

        return {
          id: usuario.id,
          nombre_completo: usuario.nombre_completo,
          correo_electronico: usuario.correo_electronico,
          rol: usuario.rol,
          estado: usuario.estado || 'activo',
          fecha_registro: usuario.fecha_creacion,
          ultima_actividad: usuario.fecha_actualizacion || usuario.fecha_creacion,
          telefono: usuario.telefono,
          ubicacion: usuario.ubicacion,
          avatar: usuario.url_avatar,
          eventos_creados,
          eventos_asistidos,
          ingresos_generados,
          compras_realizadas,
          total_entradas,
          rating: Math.round(rating * 10) / 10,
          verificacion: usuario.verificacion || false
        };
      }));

      console.log('✅ Usuarios cargados:', usuariosMapeados.length);
      setUsers(usuariosMapeados);
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      alert('Error al cargar usuarios desde la base de datos');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios desde Supabase
  useEffect(() => {
    loadUsers();
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
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const handleSaveUserEdit = async (userId: string, updates: Partial<User>) => {
    try {
      console.log('💾 Guardando cambios de usuario:', userId, updates);
      await UserService.actualizarUsuario(userId, {
        nombre_completo: updates.nombre_completo,
        correo_electronico: updates.correo_electronico,
        telefono: updates.telefono,
        ubicacion: updates.ubicacion,
        rol: updates.rol as 'administrador' | 'organizador' | 'asistente',
        // estado y verificacion se manejan por separado si es necesario
      });
      
      // Si el estado cambió, actualizarlo
      if (updates.estado) {
        await UserService.actualizarEstadoUsuario(userId, updates.estado);
      }
      
      console.log('✅ Usuario actualizado exitosamente');
      
      // Actualizar el estado local
      setUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, ...updates }
          : u
      ));
      
      setShowEditModal(false);
      setUserToEdit(null);
      alert('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      alert('Error al actualizar el usuario');
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (userId: string) => {
    try {
      console.log('🗑️ Eliminando usuario:', userId);
      await UserService.eliminarUsuario(userId);
      console.log('✅ Usuario eliminado exitosamente');
      setUsers(prev => prev.filter(u => u.id !== userId));
      setShowDeleteModal(false);
      setUserToDelete(null);
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const handleUpdateUserRole = (user: User) => {
    setUserToUpdateRole(user);
    setNewRole(user.rol);
    setShowRoleModal(true);
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      const nuevoEstado = user.estado === 'activo' ? 'suspendido' : 'activo';
      console.log('🔄 Cambiando estado de usuario:', user.id, 'de', user.estado, 'a', nuevoEstado);
      
      await UserService.actualizarEstadoUsuario(user.id, nuevoEstado);
      console.log('✅ Estado actualizado exitosamente');
      
      setUsers(prev => prev.map(u => 
        u.id === user.id 
          ? { ...u, estado: nuevoEstado }
          : u
      ));
    } catch (error) {
      console.error('❌ Error al cambiar estado:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const handleCreateUser = async (payload: {
    nombre_completo: string;
    correo_electronico: string;
    password: string;
    telefono?: string;
    ubicacion?: string;
    rol: 'administrador' | 'organizador' | 'asistente';
    estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
  }) => {
    try {
      console.log('➕ Creando usuario:', payload.correo_electronico, payload.rol);
      const result = await UserService.registrarse(
        payload.correo_electronico,
        payload.password,
        {
          nombre: payload.nombre_completo,
          telefono: payload.telefono,
          ubicacion: payload.ubicacion,
          rol: payload.rol
        }
      );

      const userId = result?.user?.id;
      if (userId) {
        await UserService.actualizarUsuario(userId, {
          nombre_completo: payload.nombre_completo,
          correo_electronico: payload.correo_electronico,
          telefono: payload.telefono,
          ubicacion: payload.ubicacion,
          rol: payload.rol,
          estado: payload.estado
        } as any);
      }

      await loadUsers();
      setShowAddModal(false);
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (error: any) {
      console.error('❌ Error al crear usuario:', error);
      alert(error?.message || 'Error al crear el usuario');
      throw error;
    }
  };

  const handleConfirmRoleUpdate = async () => {
    if (userToUpdateRole && newRole) {
      try {
        console.log('🔄 Actualizando rol de usuario:', userToUpdateRole.id, 'a', newRole);
        await UserService.actualizarUsuario(userToUpdateRole.id, {
          rol: newRole as 'administrador' | 'organizador' | 'asistente'
        });
        console.log('✅ Rol actualizado exitosamente');
        setUsers(prev => prev.map(user => 
          user.id === userToUpdateRole.id 
            ? { ...user, rol: newRole }
            : user
        ));
        setShowRoleModal(false);
        setUserToUpdateRole(null);
        setNewRole('');
        alert('Rol de usuario actualizado exitosamente');
      } catch (error) {
        console.error('❌ Error al actualizar rol:', error);
        alert('Error al actualizar el rol del usuario');
      }
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">

      {/* Alerta de éxito */}
      {showSuccessAlert && (
        <Alert variant="success" title="¡Usuario creado exitosamente!" onClose={() => setShowSuccessAlert(false)}>
          El usuario ha sido agregado correctamente al sistema.
        </Alert>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        )}
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar usuario</span>
        </button>
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
                Organizadores
              </p>
              <p className="text-2xl font-bold text-purple-900">
                {stats.organizers}
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
        onViewOrganizerProfile={onViewOrganizerProfile}
        onConfirmRoleUpdate={handleConfirmRoleUpdate}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        currentUserRole={currentUserRole}
      />

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleCreateUser}
      />

      {/* Modal de edición */}
      <UserEditModal
        user={userToEdit}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setUserToEdit(null);
        }}
        onSave={handleSaveUserEdit}
      />

      {/* Modal de eliminación */}
      <UserDeleteModal
        user={userToDelete}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};