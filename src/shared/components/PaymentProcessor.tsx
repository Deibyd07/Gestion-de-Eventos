import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react';

interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
  customerName: string;
  eventId: string;
  eventTitle: string;
}

interface PaymentMethod {
  type: 'card' | 'wallet' | 'bank_transfer';
  name: string;
  icon: string;
  isEnabled: boolean;
}

interface PaymentProcessorProps {
  paymentData: PaymentData;
  availableMethods: PaymentMethod[];
  onPaymentSuccess: (paymentResult: PaymentResult) => void;
  onPaymentError: (error: string) => void;
}

interface PaymentResult {
  transactionId: string;
  status: 'success' | 'pending' | 'failed';
  amount: number;
  currency: string;
  paymentMethod: string;
  timestamp: string;
}

export const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentData,
  availableMethods,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [walletData, setWalletData] = useState({
    phone: '',
    pin: ''
  });
  const [bankData, setBankData] = useState({
    accountNumber: '',
    bankCode: ''
  });

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

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

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validateCardData = () => {
    if (!cardData.number || cardData.number.replace(/\s/g, '').length < 16) {
      return 'Número de tarjeta inválido';
    }
    if (!cardData.expiry || cardData.expiry.length < 5) {
      return 'Fecha de vencimiento inválida';
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      return 'CVV inválido';
    }
    if (!cardData.name.trim()) {
      return 'Nombre en la tarjeta es requerido';
    }
    return null;
  };

  const validateWalletData = () => {
    if (!walletData.phone || walletData.phone.length < 10) {
      return 'Número de teléfono inválido';
    }
    if (!walletData.pin || walletData.pin.length < 4) {
      return 'PIN inválido';
    }
    return null;
  };

  const validateBankData = () => {
    if (!bankData.accountNumber || bankData.accountNumber.length < 8) {
      return 'Número de cuenta inválido';
    }
    if (!bankData.bankCode) {
      return 'Código de banco es requerido';
    }
    return null;
  };

  const processPayment = async () => {
    if (!selectedMethod) return;

    setIsProcessing(true);

    try {
      // Validate payment data based on selected method
      let validationError = null;
      switch (selectedMethod.type) {
        case 'card':
          validationError = validateCardData();
          break;
        case 'wallet':
          validationError = validateWalletData();
          break;
        case 'bank_transfer':
          validationError = validateBankData();
          break;
      }

      if (validationError) {
        onPaymentError(validationError);
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Simulate payment result
      const paymentResult: PaymentResult = {
        transactionId: `TXN-${Date.now()}`,
        status: 'success',
        amount: paymentData.amount,
        currency: paymentData.currency,
        paymentMethod: selectedMethod.name,
        timestamp: new Date().toISOString()
      };

      onPaymentSuccess(paymentResult);
    } catch (error) {
      onPaymentError('Error procesando el pago. Por favor, intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod.type) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Tarjeta
              </label>
              <input
                type="text"
                value={cardData.number}
                onChange={(e) => setCardData({ ...cardData, number: formatCardNumber(e.target.value) })}
                placeholder="1234 5678 9012 3456"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="text"
                  value={cardData.expiry}
                  onChange={(e) => setCardData({ ...cardData, expiry: formatExpiry(e.target.value) })}
                  placeholder="MM/AA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre en la Tarjeta
              </label>
              <input
                type="text"
                value={cardData.name}
                onChange={(e) => setCardData({ ...cardData, name: e.target.value.toUpperCase() })}
                placeholder="JUAN PÉREZ"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Teléfono
              </label>
              <input
                type="tel"
                value={walletData.phone}
                onChange={(e) => setWalletData({ ...walletData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="3001234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIN
              </label>
              <input
                type="password"
                value={walletData.pin}
                onChange={(e) => setWalletData({ ...walletData, pin: e.target.value })}
                placeholder="••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>
          </div>
        );

      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Cuenta
              </label>
              <input
                type="text"
                value={bankData.accountNumber}
                onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value.replace(/\D/g, '') })}
                placeholder="1234567890"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banco
              </label>
              <select
                value={bankData.bankCode}
                onChange={(e) => setBankData({ ...bankData, bankCode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un banco</option>
                <option value="001">Bancolombia</option>
                <option value="002">Banco de Bogotá</option>
                <option value="003">BBVA Colombia</option>
                <option value="004">Scotiabank Colpatria</option>
                <option value="005">Citibank Colombia</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Payment Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pago</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">{paymentData.description}</span>
            <span className="font-medium">{formatPrice(paymentData.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Evento</span>
            <span className="font-medium">{paymentData.eventTitle}</span>
          </div>
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">{formatPrice(paymentData.amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Método de Pago</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {availableMethods.filter(method => method.isEnabled).map((method) => (
            <button
              key={method.name}
              onClick={() => setSelectedMethod(method)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedMethod?.name === method.name
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{method.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">Método seguro</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Payment Form */}
        {selectedMethod && renderPaymentForm()}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-blue-500 mr-2" />
          <h4 className="font-medium text-blue-900">Pago Seguro</h4>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Tu información está protegida con encriptación SSL de 256 bits y cumplimiento PCI DSS.
        </p>
      </div>

      {/* Process Payment Button */}
      <button
        onClick={processPayment}
        disabled={!selectedMethod || isProcessing}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Procesando Pago...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 mr-2" />
            Pagar {formatPrice(paymentData.amount)}
          </>
        )}
      </button>
    </div>
  );
};
