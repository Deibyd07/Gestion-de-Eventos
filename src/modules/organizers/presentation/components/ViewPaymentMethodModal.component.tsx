import { X, CreditCard, Wallet, Building, Receipt, Shield, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface ViewPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: any | null;
}

export function ViewPaymentMethodModal({ isOpen, onClose, paymentMethod }: ViewPaymentMethodModalProps) {
  if (!isOpen || !paymentMethod) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return CreditCard;
      case 'digital_wallet':
        return Wallet;
      case 'bank_transfer':
        return Building;
      case 'cash':
        return DollarSign;
      case 'crypto':
        return Shield;
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
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const Icon = getTypeIcon(paymentMethod.tipo);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center rounded-t-2xl border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Detalles del Método de Pago</h2>
              <p className="text-blue-100 text-sm">{paymentMethod.nombre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              paymentMethod.activo 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}>
              {paymentMethod.activo ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              {paymentMethod.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
              Información General
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-900 font-medium">{paymentMethod.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Tipo</label>
                <p className="text-gray-900 font-medium">{getTypeLabel(paymentMethod.tipo)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Proveedor</label>
                <p className="text-gray-900 font-medium">{paymentMethod.proveedor}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Tiempo de Procesamiento</label>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <p className="text-gray-900 font-medium">{paymentMethod.tiempo_procesamiento}</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">Descripción</label>
              <p className="text-gray-900 bg-white p-3 rounded-lg border">{paymentMethod.descripcion}</p>
            </div>
          </div>

          {/* Fees and Limits */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Comisiones y Límites
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Comisión Porcentual</label>
                <p className="text-gray-900 font-medium text-lg">{paymentMethod.comision_porcentaje}%</p>
              </div>
              {paymentMethod.comision_fija && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Comisión Fija</label>
                  <p className="text-gray-900 font-medium text-lg">{formatCurrency(paymentMethod.comision_fija)}</p>
                </div>
              )}
              {paymentMethod.monto_minimo && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Monto Mínimo</label>
                  <p className="text-gray-900 font-medium text-lg">{formatCurrency(paymentMethod.monto_minimo)}</p>
                </div>
              )}
              {paymentMethod.monto_maximo && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Monto Máximo</label>
                  <p className="text-gray-900 font-medium text-lg">{formatCurrency(paymentMethod.monto_maximo)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Configuración Adicional
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Requiere Verificación</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  paymentMethod.requiere_verificacion 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {paymentMethod.requiere_verificacion ? 'Sí' : 'No'}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Monedas Soportadas</label>
                <div className="flex flex-wrap gap-2">
                  {paymentMethod.monedas_soportadas?.map((currency: string) => (
                    <span key={currency} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {currency}
                    </span>
                  ))}
                </div>
              </div>
              {paymentMethod.configuracion?.sandboxMode !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-700">Modo Sandbox</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    paymentMethod.configuracion.sandboxMode 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {paymentMethod.configuracion.sandboxMode ? 'Activado' : 'Producción'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-600">Fecha de Creación</label>
                <p className="text-gray-900">{formatDate(paymentMethod.fecha_creacion)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Última Actualización</label>
                <p className="text-gray-900">{formatDate(paymentMethod.fecha_actualizacion)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-200 font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}