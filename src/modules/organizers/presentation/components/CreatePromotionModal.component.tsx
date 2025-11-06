import { useState } from 'react';
import { X, Percent, DollarSign, Clock, Calendar, Shield, Users, AlertCircle } from 'lucide-react';

export interface CreatePromotionFormData {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'early_bird';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  applicableEvents: string[];
  applicableTicketTypes: string[];
  maxUsesPerUser?: number;
  isPublic: boolean;
}

interface CreatePromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CreatePromotionFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CreatePromotionModal({ isOpen, onClose, onSave, isLoading = false }: CreatePromotionModalProps) {
  const [formData, setFormData] = useState<CreatePromotionFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: 20,
    minOrderAmount: 100000,
    isActive: true,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicableEvents: [],
    applicableTicketTypes: ['general', 'vip'],
    maxUsesPerUser: 2,
    isPublic: true,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePromotionFormData, string>>>({});

  if (!isOpen) return null;

  const handleChange = (field: keyof CreatePromotionFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePromotionFormData, string>> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (formData.code.length < 3) {
      newErrors.code = 'El código debe tener al menos 3 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.value <= 0) {
      newErrors.value = 'El valor debe ser mayor a 0';
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      newErrors.value = 'El porcentaje no puede ser mayor a 100';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    try {
      await onSave(formData);
      // Resetear formulario
      setFormData({
        code: '',
        name: '',
        description: '',
        type: 'percentage',
        value: 20,
        minOrderAmount: 100000,
        isActive: true,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        applicableEvents: [],
        applicableTicketTypes: ['general', 'vip'],
        maxUsesPerUser: 2,
        isPublic: true,
      });
      setErrors({});
    } catch (error) {
      console.error('Error al crear promoción:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed': return DollarSign;
      case 'early_bird': return Clock;
      default: return Percent;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
  <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-6 flex justify-between items-center rounded-t-2xl border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Percent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Crear Código de Descuento</h2>
              <p className="text-blue-100 text-sm">Configure su nueva promoción</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
  <form onSubmit={handleSubmit} className="p-6 pt-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Descuento *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="Ej: DESCUENTO20"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Promoción *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Descuento del 20%"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción detallada del descuento..."
                rows={3}
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Discount Type and Value */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              {(() => {
                const Icon = getTypeIcon(formData.type);
                return <Icon className="w-5 h-5 mr-2 text-blue-600" />;
              })()}
              Tipo y Valor del Descuento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleChange('type', 'percentage')}
                className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.type === 'percentage'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
                disabled={isLoading}
              >
                <Percent className={`w-8 h-8 mx-auto mb-2 ${
                  formData.type === 'percentage' ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900">Porcentaje</p>
                <p className="text-xs text-gray-500">Descuento en %</p>
              </button>

              <button
                type="button"
                onClick={() => handleChange('type', 'fixed')}
                className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.type === 'fixed'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-green-300'
                }`}
                disabled={isLoading}
              >
                <DollarSign className={`w-8 h-8 mx-auto mb-2 ${
                  formData.type === 'fixed' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900">Cantidad Fija</p>
                <p className="text-xs text-gray-500">Monto específico</p>
              </button>

              <button
                type="button"
                onClick={() => handleChange('type', 'early_bird')}
                className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                  formData.type === 'early_bird'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-300 hover:border-orange-300'
                }`}
                disabled={isLoading}
              >
                <Clock className={`w-8 h-8 mx-auto mb-2 ${
                  formData.type === 'early_bird' ? 'text-orange-600' : 'text-gray-400'
                }`} />
                <p className="font-medium text-gray-900">Early Bird</p>
                <p className="text-xs text-gray-500">Compra anticipada</p>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor del Descuento *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => handleChange('value', Number(e.target.value))}
                    min="0"
                    max={formData.type === 'percentage' ? "100" : undefined}
                    step={formData.type === 'percentage' ? "1" : "1000"}
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.value ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {formData.type === 'percentage' ? '%' : 'COP'}
                  </span>
                </div>
                {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Mínimo de Compra
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount || ''}
                  onChange={(e) => handleChange('minOrderAmount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Opcional"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Validity Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Período de Validez
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-blue-600" />
              Límites de Uso
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite Total de Usos
                </label>
                <input
                  type="number"
                  value={formData.usageLimit || ''}
                  onChange={(e) => handleChange('usageLimit', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ilimitado"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usos por Usuario
                </label>
                <input
                  type="number"
                  value={formData.maxUsesPerUser || ''}
                  onChange={(e) => handleChange('maxUsesPerUser', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Ilimitado"
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Configuración
            </h3>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-900">Activar promoción inmediatamente</p>
                  <p className="text-sm text-gray-500">El descuento estará disponible para su uso</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => handleChange('isPublic', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-900">Descuento público</p>
                  <p className="text-sm text-gray-500">Visible para todos los usuarios</p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900">{formData.name || 'Nombre de la promoción'}</h4>
                <code className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded font-mono">
                  {formData.code || 'CODIGO'}
                </code>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {formData.description || 'Descripción del descuento'}
              </p>
              <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {formData.type === 'percentage' ? `${formData.value}%` : formatCurrency(formData.value)}
                </p>
                <p className="text-xs text-gray-500">de descuento</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Percent className="w-5 h-5" />
                  <span>Crear Descuento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
