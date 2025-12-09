import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface AddUserPayload {
  nombre_completo: string;
  correo_electronico: string;
  password: string;
  telefono?: string;
  ubicacion?: string;
  rol: 'administrador' | 'organizador' | 'asistente';
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente';
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: AddUserPayload) => Promise<void>;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState<AddUserPayload>({
    nombre_completo: '',
    correo_electronico: '',
    password: '',
    telefono: '',
    ubicacion: '',
    rol: 'asistente',
    estado: 'activo'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre_completo: '',
        correo_electronico: '',
        password: '',
        telefono: '',
        ubicacion: '',
        rol: 'asistente',
        estado: 'activo'
      });
      setConfirmPassword('');
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre_completo.trim()) newErrors.nombre_completo = 'El nombre es requerido';
    if (!formData.correo_electronico.trim()) newErrors.correo_electronico = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo_electronico)) newErrors.correo_electronico = 'Correo inválido';
    if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (formData.password !== confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onCreate(formData);
    } catch (err) {
      // onCreate already notifies
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Agregar usuario</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
            <input
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nombre_completo ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Ej: Ana Gómez"
              disabled={isSubmitting}
            />
            {errors.nombre_completo && <p className="text-sm text-red-600 mt-1">{errors.nombre_completo}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input
                type="email"
                name="correo_electronico"
                value={formData.correo_electronico}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.correo_electronico ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="correo@ejemplo.com"
                disabled={isSubmitting}
              />
              {errors.correo_electronico && <p className="text-sm text-red-600 mt-1">{errors.correo_electronico}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+57 300 123 4567"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
              <input
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ciudad, País"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="administrador">Administrador</option>
                <option value="organizador">Organizador</option>
                <option value="asistente">Asistente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isSubmitting}
                />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Repite la contraseña"
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
