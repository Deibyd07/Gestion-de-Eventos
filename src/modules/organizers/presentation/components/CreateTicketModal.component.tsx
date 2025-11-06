import React, { useState } from 'react';
import { Modal, ModalFooter } from '@shared/ui';
import { Input } from '@shared/ui';
import { 
  Ticket,
  DollarSign,
  FileText,
  X,
  Check,
  Plus,
  Star,
  Clock,
  Users,
  Calendar,
  Tag
} from 'lucide-react';

export interface CreateTicketFormData {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  available: number;
  type: 'general' | 'vip' | 'early_bird' | 'student' | 'group';
  features: string[];
  salesStartDate?: string;
  salesEndDate?: string;
  maxPerUser?: number;
}

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CreateTicketFormData) => void;
  isLoading?: boolean;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<CreateTicketFormData>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    available: 0,
    type: 'general',
    features: [],
    salesStartDate: undefined,
    salesEndDate: undefined,
    maxPerUser: undefined
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateTicketFormData, string>>>({});
  const [newFeature, setNewFeature] = useState('');

  const handleInputChange = (field: keyof CreateTicketFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      handleInputChange('features', [...formData.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    handleInputChange('features', formData.features.filter(f => f !== feature));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddFeature();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTicketFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.originalPrice && formData.originalPrice <= formData.price) {
      newErrors.originalPrice = 'El precio original debe ser mayor al precio de venta';
    }

    if (!formData.available || formData.available <= 0) {
      newErrors.available = 'Debe especificar un número válido de entradas disponibles';
    }

    if (formData.salesStartDate && formData.salesEndDate) {
      const startDate = new Date(formData.salesStartDate);
      const endDate = new Date(formData.salesEndDate);
      if (endDate < startDate) {
        newErrors.salesEndDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (formData.maxPerUser && formData.maxPerUser <= 0) {
      newErrors.maxPerUser = 'El límite por usuario debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      available: 0,
      type: 'general',
      features: [],
      salesStartDate: undefined,
      salesEndDate: undefined,
      maxPerUser: undefined
    });
    setErrors({});
    setNewFeature('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const ticketTypes = [
    { value: 'general', label: 'General', icon: Ticket },
    { value: 'vip', label: 'VIP', icon: Star },
    { value: 'early_bird', label: 'Early Bird', icon: Clock },
    { value: 'student', label: 'Estudiante', icon: Users },
    { value: 'group', label: 'Grupo', icon: Users }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Tipo de Entrada"
      description="Configura un nuevo tipo de entrada para tu evento"
      size="xl"
      closeOnOverlayClick={!isLoading}
      closeOnEscape={!isLoading}
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Básica */}
        <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 backdrop-blur-sm border border-blue-200/50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Información Básica</span>
          </h3>
          
          <Input
            label="Nombre de la Entrada"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            placeholder="Ej: Entrada VIP"
            leftIcon={<Ticket className="w-4 h-4" />}
            disabled={isLoading}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe los beneficios y características de esta entrada..."
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none min-h-[100px] ${
                errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              } ${isLoading ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}`}
              disabled={isLoading}
              required
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Tipo de Entrada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Entrada
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {ticketTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('type', type.value)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                    } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Precio y Disponibilidad */}
        <div className="bg-gradient-to-br from-green-50/50 to-emerald-50/50 backdrop-blur-sm border border-green-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span>Precio y Disponibilidad</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Precio de Venta (COP)"
              type="number"
              min="1"
              step="1000"
              value={formData.price || ''}
              onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
              error={errors.price}
              placeholder="Ej: 150000"
              leftIcon={<DollarSign className="w-4 h-4" />}
              disabled={isLoading}
              required
            />

            <Input
              label="Precio Original (COP)"
              type="number"
              min="1"
              step="1000"
              value={formData.originalPrice || ''}
              onChange={(e) => handleInputChange('originalPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              error={errors.originalPrice}
              placeholder="Ej: 200000 (opcional)"
              leftIcon={<DollarSign className="w-4 h-4" />}
              disabled={isLoading}
              helperText="Para mostrar descuento"
            />

            <Input
              label="Entradas Disponibles"
              type="number"
              min="1"
              value={formData.available || ''}
              onChange={(e) => handleInputChange('available', parseInt(e.target.value) || 0)}
              error={errors.available}
              placeholder="Ej: 100"
              leftIcon={<Ticket className="w-4 h-4" />}
              disabled={isLoading}
              required
            />

            <Input
              label="Límite por Usuario"
              type="number"
              min="1"
              value={formData.maxPerUser || ''}
              onChange={(e) => handleInputChange('maxPerUser', e.target.value ? parseInt(e.target.value) : undefined)}
              error={errors.maxPerUser}
              placeholder="Ej: 5 (opcional)"
              leftIcon={<Users className="w-4 h-4" />}
              disabled={isLoading}
              helperText="Máximo de entradas por compra"
            />
          </div>
        </div>

        {/* Características/Servicios Incluidos */}
        <div className="bg-gradient-to-br from-purple-50/50 to-pink-50/50 backdrop-blur-sm border border-purple-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Tag className="w-5 h-5 text-purple-600" />
            <span>Servicios Incluidos</span>
          </h3>
          
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ej: Catering premium, Parking reservado, WiFi gratuito..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                disabled={isLoading || !newFeature.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {formData.features.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full border border-purple-200"
                  >
                    <Check className="w-3 h-3" />
                    <span className="text-sm font-medium">{feature}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      disabled={isLoading}
                      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors duration-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {formData.features.length === 0 && (
              <p className="text-sm text-gray-500 italic">
                No hay servicios incluidos. Agrega características que hacen especial esta entrada.
              </p>
            )}
          </div>
        </div>

        {/* Período de Venta */}
        <div className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 backdrop-blur-sm border border-orange-200/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <span>Período de Venta (Opcional)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio de Ventas"
              type="date"
              value={formData.salesStartDate || ''}
              onChange={(e) => handleInputChange('salesStartDate', e.target.value || undefined)}
              error={errors.salesStartDate}
              leftIcon={<Calendar className="w-4 h-4" />}
              disabled={isLoading}
              helperText="Cuándo comenzar a vender"
            />

            <Input
              label="Fecha de Fin de Ventas"
              type="date"
              value={formData.salesEndDate || ''}
              onChange={(e) => handleInputChange('salesEndDate', e.target.value || undefined)}
              error={errors.salesEndDate}
              leftIcon={<Calendar className="w-4 h-4" />}
              disabled={isLoading}
              helperText="Cuándo dejar de vender"
            />
          </div>
        </div>

        {/* Preview */}
        {formData.name && formData.price > 0 && (
          <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 backdrop-blur-sm border border-indigo-200/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                <span className="text-2xl font-bold text-gray-900">
                  ${formData.price.toLocaleString('es-CO')}
                </span>
              </div>
              {formData.originalPrice && formData.originalPrice > formData.price && (
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm text-gray-500 line-through">
                    ${formData.originalPrice.toLocaleString('es-CO')}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    -{Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-600 mb-3">{formData.description}</p>
              {formData.features.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Incluye:</p>
                  <div className="flex flex-wrap gap-1">
                    {formData.features.map((feature, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      <ModalFooter>
        <button
          type="button"
          onClick={handleClose}
          disabled={isLoading}
          className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creando...</span>
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              <span>Crear Entrada</span>
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};
