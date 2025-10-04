import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CreditCard, Lock, Calendar, User, Shield } from 'lucide-react';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
  saveCard: boolean;
}

const paymentSchema = yup.object({
  cardNumber: yup.string()
    .required('El número de tarjeta es obligatorio')
    .matches(/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/, 'Formato de tarjeta inválido'),
  expiryDate: yup.string()
    .required('La fecha de vencimiento es obligatoria')
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Formato MM/YY'),
  cvv: yup.string()
    .required('El CVV es obligatorio')
    .matches(/^\d{3,4}$/, 'CVV inválido'),
  cardholderName: yup.string()
    .required('El nombre del titular es obligatorio')
    .min(2, 'Mínimo 2 caracteres'),
  saveCard: yup.boolean()
});

interface PaymentFormProps {
  total: number;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  isLoading: boolean;
}

export function PaymentForm({ total, onPaymentSuccess, onPaymentError, isLoading }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<PaymentFormData>({
    resolver: yupResolver(paymentSchema)
  });

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate payment success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        onPaymentSuccess({
          transactionId: `TXN-${Date.now()}`,
          amount: total,
          method: paymentMethod,
          timestamp: new Date().toISOString()
        });
      } else {
        onPaymentError('El pago fue rechazado. Por favor, verifica tus datos o intenta con otra tarjeta.');
      }
    } catch (error) {
      onPaymentError('Error procesando el pago. Inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setValue('cardNumber', formatted);
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    setValue('expiryDate', formatted);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span className="font-medium">Tarjeta</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${
              paymentMethod === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-xs text-white font-bold">P</span>
              </div>
              <span className="font-medium">PayPal</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setPaymentMethod('bank')}
            className={`p-4 border-2 rounded-lg transition-all duration-200 ${
              paymentMethod === 'bank'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Transferencia</span>
            </div>
          </button>
        </div>
      </div>

      {/* Payment Form */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Tarjeta *
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('cardNumber')}
                onChange={handleCardNumberChange}
                type="text"
                maxLength={19}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            {errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Vencimiento *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register('expiryDate')}
                  onChange={handleExpiryDateChange}
                  type="text"
                  maxLength={5}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                />
              </div>
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV *
              </label>
              <input
                {...register('cvv')}
                type="text"
                maxLength={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123"
              />
              {errors.cvv && (
                <p className="mt-1 text-sm text-red-600">{errors.cvv.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Titular *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                {...register('cardholderName')}
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre como aparece en la tarjeta"
              />
            </div>
            {errors.cardholderName && (
              <p className="mt-1 text-sm text-red-600">{errors.cardholderName.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('saveCard')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Guardar tarjeta para futuras compras
            </label>
          </div>

          {/* Security Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Pago 100% Seguro
                </p>
                <p className="text-xs text-green-700">
                  Tus datos están protegidos con encriptación SSL de 256 bits
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || isLoading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Procesando Pago...
              </span>
            ) : (
              `Pagar $${total.toLocaleString('es-CO')} COP`
            )}
          </button>
        </form>
      )}

      {paymentMethod === 'paypal' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-white font-bold">P</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagar con PayPal</h3>
          <p className="text-gray-600 mb-6">
            Serás redirigido a PayPal para completar tu pago de forma segura
          </p>
          <button
            onClick={() => onPaymentSuccess({ method: 'paypal', amount: total })}
            disabled={isLoading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            Continuar con PayPal
          </button>
        </div>
      )}

      {paymentMethod === 'bank' && (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferencia Bancaria</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Banco:</span>
                <span className="font-medium">Banco Santander</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IBAN:</span>
                <span className="font-medium">ES91 2100 0418 4502 0005 1332</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Concepto:</span>
                <span className="font-medium">Entradas Evento - {Date.now()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Importe:</span>
                <span className="font-medium text-lg">€{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Las entradas se activarán una vez confirmado el pago por transferencia (1-2 días laborables).
            </p>
          </div>
          
          <button
            onClick={() => onPaymentSuccess({ method: 'bank', amount: total })}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            Confirmar Transferencia
          </button>
        </div>
      )}
    </div>
  );
}


