import { useState, useEffect } from 'react';
import { X, CreditCard, Wallet, Smartphone, Building, Shield, AlertCircle, Save } from 'lucide-react';

export interface EditPaymentMethodFormData {
  name: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'cash' | 'crypto';
  provider: string;
  description: string;
  isActive: boolean;
  processingFee: number;
  fixedFee?: number;
  minAmount?: number;
  maxAmount?: number;
  supportedCurrencies: string[];
  requiresVerification: boolean;
  processingTime: string;
  configuration: {
    apiKey?: string;
    merchantId?: string;
    publicKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    sandboxMode: boolean;
  };
}

interface EditPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: EditPaymentMethodFormData) => Promise<void>;
  paymentMethod: any | null;
  isLoading?: boolean;
}

export function EditPaymentMethodModal({ isOpen, onClose, onSave, paymentMethod, isLoading = false }: EditPaymentMethodModalProps) {
  const [formData, setFormData] = useState<EditPaymentMethodFormData>({
    name: '',
    type: 'credit_card',
    provider: '',
    description: '',
    isActive: true,
    processingFee: 2.9,
    supportedCurrencies: ['COP'],
    requiresVerification: false,
    processingTime: 'Inmediato',
    configuration: {
      sandboxMode: true
    }
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EditPaymentMethodFormData, string>>>({});

  // Cargar datos del método de pago cuando se abre el modal
  useEffect(() => {
    if (isOpen && paymentMethod) {
      setFormData({
        name: paymentMethod.nombre || '',
        type: paymentMethod.tipo || 'credit_card',
        provider: paymentMethod.proveedor || '',
        description: paymentMethod.descripcion || '',
        isActive: paymentMethod.activo !== undefined ? paymentMethod.activo : true,
        processingFee: paymentMethod.comision_porcentaje || 2.9,
        fixedFee: paymentMethod.comision_fija,
        minAmount: paymentMethod.monto_minimo,
        maxAmount: paymentMethod.monto_maximo,
        supportedCurrencies: paymentMethod.monedas_soportadas || ['COP'],
        requiresVerification: paymentMethod.requiere_verificacion || false,
        processingTime: paymentMethod.tiempo_procesamiento || 'Inmediato',
        configuration: {
          apiKey: paymentMethod.configuracion?.apiKey || '',
          merchantId: paymentMethod.configuracion?.merchantId || '',
          publicKey: paymentMethod.configuracion?.publicKey || '',
          secretKey: paymentMethod.configuracion?.secretKey || '',
          webhookUrl: paymentMethod.configuracion?.webhookUrl || '',
          sandboxMode: paymentMethod.configuracion?.sandboxMode !== undefined ? paymentMethod.configuracion.sandboxMode : true
        }
      });
      setErrors({});
    }
  }, [isOpen, paymentMethod]);

  if (!isOpen) return null;

  const handleChange = (field: keyof EditPaymentMethodFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleConfigurationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      configuration: {
        ...prev.configuration,
        [field]: value
      }
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditPaymentMethodFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'El proveedor es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.processingFee < 0 || formData.processingFee > 100) {
      newErrors.processingFee = 'La comisión debe estar entre 0% y 100%';
    }

    if (formData.minAmount && formData.maxAmount && formData.minAmount >= formData.maxAmount) {
      newErrors.maxAmount = 'El monto máximo debe ser mayor al mínimo';
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
    } catch (error) {
      console.error('Error al actualizar método de pago:', error);
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
      case 'credit_card':
      case 'debit_card':
        return CreditCard;
      case 'digital_wallet':
        return Wallet;
      case 'bank_transfer':
        return Building;
      default:
        return CreditCard;
    }
  };

  const paymentTypes = [
    { id: 'credit_card', label: 'Tarjeta de Crédito', icon: CreditCard, color: 'blue' },
    { id: 'debit_card', label: 'Tarjeta de Débito', icon: CreditCard, color: 'green' },
    { id: 'digital_wallet', label: 'Billetera Digital', icon: Wallet, color: 'purple' },
    { id: 'bank_transfer', label: 'Transferencia Bancaria', icon: Building, color: 'orange' },
    { id: 'cash', label: 'Efectivo', icon: Smartphone, color: 'gray' },
    { id: 'crypto', label: 'Criptomonedas', icon: Shield, color: 'yellow' }
  ];

  const currencies = [
    { code: 'COP', name: 'Peso Colombiano' },
    { code: 'USD', name: 'Dólar Americano' },
    { code: 'EUR', name: 'Euro' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-amber-600 to-orange-500 text-white p-6 flex justify-between items-center rounded-t-2xl border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Editar Método de Pago</h2>
              <p className="text-amber-100 text-sm">Modificar configuración del método de pago</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Método *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Tarjetas Visa/Mastercard"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor *
                </label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => handleChange('provider', e.target.value)}
                  placeholder="Ej: Stripe, PayPal, PSE"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.provider ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.provider && <p className="text-red-500 text-xs mt-1">{errors.provider}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción del método de pago y sus características..."
                rows={3}
                className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
          </div>

          {/* Payment Type Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-amber-600" />
              Tipo de Método de Pago
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {paymentTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.type === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleChange('type', type.id)}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isLoading}
                  >
                    <Icon className={`w-8 h-8 mx-auto mb-2 ${
                      isSelected ? `text-${type.color}-600` : 'text-gray-400'
                    }`} />
                    <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fees and Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Comisiones y Límites</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión por Transacción (%)
                </label>
                <input
                  type="number"
                  value={formData.processingFee}
                  onChange={(e) => handleChange('processingFee', Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.processingFee ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.processingFee && <p className="text-red-500 text-xs mt-1">{errors.processingFee}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión Fija (COP)
                </label>
                <input
                  type="number"
                  value={formData.fixedFee || ''}
                  onChange={(e) => handleChange('fixedFee', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Opcional"
                  min="0"
                  step="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Mínimo (COP)
                </label>
                <input
                  type="number"
                  value={formData.minAmount || ''}
                  onChange={(e) => handleChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Sin límite"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto Máximo (COP)
                </label>
                <input
                  type="number"
                  value={formData.maxAmount || ''}
                  onChange={(e) => handleChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="Sin límite"
                  min="0"
                  step="1000"
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
                    errors.maxAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.maxAmount && <p className="text-red-500 text-xs mt-1">{errors.maxAmount}</p>}
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Configuración Adicional</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Procesamiento
                </label>
                <select
                  value={formData.processingTime}
                  onChange={(e) => handleChange('processingTime', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  disabled={isLoading}
                >
                  <option value="Inmediato">Inmediato</option>
                  <option value="1-3 días">1-3 días</option>
                  <option value="3-5 días">3-5 días</option>
                  <option value="5-10 días">5-10 días</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monedas Soportadas
                </label>
                <select
                  multiple
                  value={formData.supportedCurrencies}
                  onChange={(e) => handleChange('supportedCurrencies', Array.from(e.target.selectedOptions, option => option.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  disabled={isLoading}
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Mantén Ctrl/Cmd para seleccionar múltiples</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-900">Método de pago activo</p>
                  <p className="text-sm text-gray-500">Disponible para uso inmediato</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.requiresVerification}
                  onChange={(e) => handleChange('requiresVerification', e.target.checked)}
                  className="w-5 h-5 text-amber-600 rounded focus:ring-2 focus:ring-amber-500"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-900">Requiere verificación</p>
                  <p className="text-sm text-gray-500">Los pagos necesitan confirmación manual</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-xl cursor-pointer hover:bg-yellow-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.configuration.sandboxMode}
                  onChange={(e) => handleConfigurationChange('sandboxMode', e.target.checked)}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-2 focus:ring-yellow-500"
                  disabled={isLoading}
                />
                <div>
                  <p className="font-medium text-gray-900">Modo Sandbox/Pruebas</p>
                  <p className="text-sm text-gray-500">Para testing - no procesa pagos reales</p>
                </div>
              </label>
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex justify-between p-6 pt-4 border-t">
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
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Cambios</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}