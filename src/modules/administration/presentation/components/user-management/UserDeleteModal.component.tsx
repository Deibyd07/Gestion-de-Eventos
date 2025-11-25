import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

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

interface UserDeleteModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (userId: string) => void;
}

export const UserDeleteModal: React.FC<UserDeleteModalProps> = ({
  user,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleConfirm = () => {
    if (confirmText.trim().toUpperCase() === 'ELIMINAR') {
      onConfirm(user.id);
      onClose();
    } else {
      setError('Debes escribir exactamente "ELIMINAR" para confirmar');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmText(e.target.value);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Confirmar Eliminación</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              ¿Estás seguro de que deseas eliminar al usuario?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="font-semibold text-gray-900">{user.nombre_completo}</p>
              <p className="text-sm text-gray-600">{user.correo_electronico}</p>
              <p className="text-sm text-gray-600 capitalize">Rol: {user.rol}</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800 font-medium mb-2">
              ⚠️ Esta acción no se puede deshacer
            </p>
            <p className="text-sm text-red-700">
              Se eliminarán permanentemente todos los datos asociados a este usuario.
            </p>
          </div>

          <div>
            <label htmlFor="confirmText" className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, escribe <span className="font-bold text-red-600">ELIMINAR</span>
            </label>
            <input
              type="text"
              id="confirmText"
              value={confirmText}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Escribe ELIMINAR"
              autoComplete="off"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmText.trim().toUpperCase() !== 'ELIMINAR'}
            className={`px-4 py-2 rounded-lg text-white transition-all duration-200 ${
              confirmText.trim().toUpperCase() === 'ELIMINAR'
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-sm'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Eliminar Usuario
          </button>
        </div>
      </div>
    </div>
  );
};
