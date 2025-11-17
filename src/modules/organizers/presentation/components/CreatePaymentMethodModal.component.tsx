import { useState } from 'react';
import { X, CreditCard, Wallet, Smartphone, Building, Shield, AlertCircle, Check } from 'lucide-react';

export interface CreatePaymentMethodFormData {
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

interface CreatePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: CreatePaymentMethodFormData) => Promise<void>;
  isLoading?: boolean;
}

export function CreatePaymentMethodModal({ isOpen, onClose, onSave, isLoading = false }: CreatePaymentMethodModalProps) {
  const [formData, setFormData] = useState<CreatePaymentMethodFormData>({
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

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePaymentMethodFormData, string>>>({});
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const handleChange = (field: keyof CreatePaymentMethodFormData, value: any) => {
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

  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePaymentMethodFormData, string>> = {};

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

  const validate = (): boolean => {
    return validateStep1();
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (validateStep1()) {
      setActiveStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Solo procesar el submit si estamos en el paso 2
    if (activeStep !== 2) {
      return;
    }
    
    if (!validate()) {
      return;
    }

    try {
      await onSave(formData);
      // Resetear formulario
      setFormData({
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
      setErrors({});
      setActiveStep(1);
    } catch (error) {
      console.error('Error al crear método de pago:', error);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      setActiveStep(1);
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'credit_card': return 'Tarjeta de Crédito';
      case 'debit_card': return 'Tarjeta de Débito';
      case 'digital_wallet': return 'Billetera Digital';
      case 'bank_transfer': return 'Transferencia Bancaria';
      case 'cash': return 'Efectivo';
      case 'crypto': return 'Criptomonedas';
      default: return 'Tarjeta de Crédito';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
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
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-emerald-500 text-white p-6 flex justify-between items-center rounded-t-2xl border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Agregar Método de Pago</h2>
              <p className="text-green-100 text-sm">Configure un nuevo método de pago para su evento</p>
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

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className={`flex items-center space-x-2 ${activeStep >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Información Básica</span>
            </div>
            <div className={`w-16 h-0.5 ${activeStep >= 2 ? 'bg-green-600' : 'bg-gray-300'}`} />
            <div className={`flex items-center space-x-2 ${activeStep >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <span className="text-sm font-medium">Configuración</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-6 space-y-6">
          {activeStep === 1 && (
            <>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-green-600" />
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
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                    className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                  <CreditCard className="w-5 h-5 mr-2 text-green-600" />
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
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                        errors.maxAmount ? 'border-red-500' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.maxAmount && <p className="text-red-500 text-xs mt-1">{errors.maxAmount}</p>}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeStep === 2 && (
            <>
              {/* Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  Configuración del Proveedor
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={formData.configuration.apiKey || ''}
                      onChange={(e) => handleConfigurationChange('apiKey', e.target.value)}
                      placeholder="Clave API del proveedor"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      value={formData.configuration.merchantId || ''}
                      onChange={(e) => handleConfigurationChange('merchantId', e.target.value)}
                      placeholder="ID del comercio"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Public Key
                    </label>
                    <input
                      type="text"
                      value={formData.configuration.publicKey || ''}
                      onChange={(e) => handleConfigurationChange('publicKey', e.target.value)}
                      placeholder="Clave pública"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Webhook URL
                    </label>
                    <input
                      type="url"
                      value={formData.configuration.webhookUrl || ''}
                      onChange={(e) => handleConfigurationChange('webhookUrl', e.target.value)}
                      placeholder="https://tu-sitio.com/webhook"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={isLoading}
                    />
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                      disabled={isLoading}
                    />
                    <div>
                      <p className="font-medium text-gray-900">Activar método de pago</p>
                      <p className="text-sm text-gray-500">Disponible para uso inmediato</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.requiresVerification}
                      onChange={(e) => handleChange('requiresVerification', e.target.checked)}
                      className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
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
            </>
          )}

          {/* Preview */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {(() => {
                    const Icon = getTypeIcon(formData.type);
                    return <Icon className="w-6 h-6 text-green-600" />;
                  })()}
                  <div>
                    <h4 className="font-bold text-gray-900">{formData.name || 'Nombre del método'}</h4>
                    <p className="text-sm text-gray-600">{formData.provider || 'Proveedor'}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  formData.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {formData.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {formData.description || 'Descripción del método de pago'}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Comisión:</p>
                  <p className="font-semibold">{formData.processingFee}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Procesamiento:</p>
                  <p className="font-semibold">{formData.processingTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            <div className="flex space-x-3">
              {activeStep === 2 && (
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  disabled={isLoading}
                  className="px-6 py-2.5 border border-green-300 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
              )}
              
              {activeStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Crear Método de Pago</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}