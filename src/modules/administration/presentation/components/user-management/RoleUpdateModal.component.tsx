import React from 'react';
import { X, Crown, Shield, Star } from 'lucide-react';

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

interface RoleUpdateModalProps {
  user: User | null;
  isOpen: boolean;
  newRole: string;
  setNewRole: (role: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const RoleUpdateModal: React.FC<RoleUpdateModalProps> = ({
  user,
  isOpen,
  newRole,
  setNewRole,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !user) return null;

  const roles = [
    { value: 'admin', label: 'Administrador', icon: Crown, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { value: 'organizador', label: 'Organizador', icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { value: 'asistente', label: 'Asistente', icon: Star, color: 'text-green-600', bgColor: 'bg-green-100' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Actualizar Rol</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cambiar rol de {user.nombre_completo}
            </h3>
            <p className="text-sm text-gray-600">
              Selecciona el nuevo rol para este usuario.
            </p>
          </div>

          <div className="space-y-3">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <label
                  key={role.value}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    newRole === role.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={newRole === role.value}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${role.bgColor} mr-3`}>
                      <IconComponent className={`w-5 h-5 ${role.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{role.label}</p>
                      <p className="text-sm text-gray-600">
                        {role.value === 'admin' && 'Acceso completo al sistema'}
                        {role.value === 'organizador' && 'Puede crear y gestionar eventos'}
                        {role.value === 'asistente' && 'Puede asistir a eventos'}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!newRole || newRole === user.rol}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Actualizar Rol
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
