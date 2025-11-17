import { useState } from 'react';
import { X, Trash2, CreditCard, Wallet, Building, Shield, AlertTriangle, Info } from 'lucide-react';

interface DeletePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => Promise<void>;
  paymentMethod: any | null;
}

export function DeletePaymentMethodModal({ isOpen, onClose, onDelete, paymentMethod }: DeletePaymentMethodModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  console.log('🗑️ MODAL DELETE: Renderizando con props:', { isOpen, paymentMethod: paymentMethod?.nombre });

  if (!isOpen || !paymentMethod) {
    console.log('🚫 MODAL DELETE: No renderizando - isOpen:', isOpen, 'paymentMethod:', !!paymentMethod);
    return null;
  }

  console.log('✅ MODAL DELETE: Renderizando modal de eliminación para:', paymentMethod.nombre);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return CreditCard;
      case 'digital_wallet':
        return Wallet;
      case 'bank_transfer':
        return Building;
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

  const expectedConfirmText = 'ELIMINAR';
  const isConfirmValid = confirmText.trim().toUpperCase() === expectedConfirmText;

  const handleDelete = async () => {
    if (!isConfirmValid) return;
    
    setIsDeleting(true);
    try {
      await onDelete();
      setConfirmText('');
    } catch (error) {
      console.error('Error al eliminar método de pago:', error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('');
      onClose();
    }
  };

  const Icon = getTypeIcon(paymentMethod.tipo);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Eliminar Método de Pago</h2>
              <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Critical Warning */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-red-800 text-sm">¡ACCIÓN IRREVERSIBLE!</h4>
                <p className="text-xs text-red-700 mt-1">
                  Una vez eliminado, este método de pago no se podrá recuperar. Se perderán todos los datos y configuraciones asociadas.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Method Info */}
          <div className="bg-gray-50 rounded-xl p-3">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
              <Icon className="w-4 h-4 mr-2 text-red-600" />
              Método a Eliminar
            </h3>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-bold text-gray-900">{paymentMethod.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-900">{getTypeLabel(paymentMethod.tipo)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Proveedor:</span>
                <span className="font-medium text-gray-900">{paymentMethod.proveedor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  paymentMethod.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {paymentMethod.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          {/* Impact Information */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-orange-800 text-sm">Impacto de la eliminación</h4>
                <ul className="text-xs text-orange-700 mt-1 space-y-0.5">
                  <li>• Se eliminará toda la configuración del método</li>
                  <li>• Se perderán las credenciales y configuraciones de API</li>
                  <li>• Los eventos que usen este método podrían verse afectados</li>
                  <li>• Los historiales de pago se mantendrán por auditoría</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Para confirmar, escribe "{expectedConfirmText}" en el campo de abajo:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Escribir "${expectedConfirmText}" para confirmar`}
              className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:outline-none transition-all duration-200 ${
                confirmText && !isConfirmValid
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
                  : confirmText && isConfirmValid
                  ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                  : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
              }`}
              disabled={isDeleting}
              autoComplete="off"
            />
            {confirmText && !isConfirmValid && (
              <p className="text-xs text-red-600 mt-1">
                El texto debe coincidir exactamente con "{expectedConfirmText}"
              </p>
            )}
            {confirmText && isConfirmValid && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Confirmación válida
              </p>
            )}
          </div>

          {/* Final Warning */}
          <div className="bg-gray-900 text-white rounded-xl p-3 text-center">
            <p className="text-xs font-medium">
              Esta es la última oportunidad para cancelar la operación
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0 flex justify-end space-x-3 p-6 pt-0 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>ELIMINAR DEFINITIVAMENTE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}