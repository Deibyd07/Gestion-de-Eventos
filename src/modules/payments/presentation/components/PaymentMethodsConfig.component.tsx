import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Shield, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'wallet' | 'bank_transfer';
  name: string;
  description: string;
  isEnabled: boolean;
  processingFee: number;
  minAmount: number;
  maxAmount: number;
  supportedCurrencies: string[];
  requiresVerification: boolean;
  icon: string;
  color: string;
}

interface PaymentMethodsConfigProps {
  onMethodsChange: (methods: PaymentMethod[]) => void;
  initialMethods?: PaymentMethod[];
}

const availableMethods: Omit<PaymentMethod, 'id' | 'isEnabled'>[] = [
  {
    type: 'card',
    name: 'Tarjetas de Crédito/Débito',
    description: 'Visa, Mastercard, American Express',
    processingFee: 3.5,
    minAmount: 1000,
    maxAmount: 50000000,
    supportedCurrencies: ['COP'],
    requiresVerification: true,
    icon: '💳',
    color: 'blue'
  },
  {
    type: 'wallet',
    name: 'Nequi',
    description: 'Billetera digital de Bancolombia',
    processingFee: 2.9,
    minAmount: 1000,
    maxAmount: 20000000,
    supportedCurrencies: ['COP'],
    requiresVerification: true,
    icon: '📱',
    color: 'green'
  },
  {
    type: 'wallet',
    name: 'Daviplata',
    description: 'Billetera digital de Davivienda',
    processingFee: 2.9,
    minAmount: 1000,
    maxAmount: 20000000,
    supportedCurrencies: ['COP'],
    requiresVerification: true,
    icon: '📱',
    color: 'purple'
  },
  {
    type: 'bank_transfer',
    name: 'Transferencia Bancaria',
    description: 'PSE, Transferencia directa',
    processingFee: 0,
    minAmount: 10000,
    maxAmount: 100000000,
    supportedCurrencies: ['COP'],
    requiresVerification: true,
    icon: '🏦',
    color: 'gray'
  }
];

export const PaymentMethodsConfig: React.FC<PaymentMethodsConfigProps> = ({
  onMethodsChange,
  initialMethods = []
}) => {
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const addMethod = (methodData: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...methodData,
      id: Date.now().toString()
    };
    const updatedMethods = [...methods, newMethod];
    setMethods(updatedMethods);
    onMethodsChange(updatedMethods);
    setShowAddForm(false);
  };

  const updateMethod = (id: string, updates: Partial<PaymentMethod>) => {
    const updatedMethods = methods.map(method =>
      method.id === id ? { ...method, ...updates } : method
    );
    setMethods(updatedMethods);
    onMethodsChange(updatedMethods);
  };

  const deleteMethod = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este método de pago?')) {
      const updatedMethods = methods.filter(method => method.id !== id);
      setMethods(updatedMethods);
      onMethodsChange(updatedMethods);
    }
  };

  const toggleMethod = (id: string) => {
    updateMethod(id, { isEnabled: !methods.find(m => m.id === id)?.isEnabled });
  };

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'wallet':
        return <Smartphone className="w-5 h-5" />;
      case 'bank_transfer':
        return <Building className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getMethodColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'gray':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Métodos de Pago</h3>
          <p className="text-sm text-gray-500">Configura los métodos de pago disponibles para tus eventos</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Método
        </button>
      </div>

      {/* Add Method Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Agregar Método de Pago</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMethods.map((method) => (
              <button
                key={`${method.type}-${method.name}`}
                onClick={() => addMethod({ ...method, isEnabled: true })}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{method.icon}</span>
                  <div>
                    <h5 className="font-medium text-gray-900">{method.name}</h5>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  <p>Comisión: {method.processingFee.toFixed(1)}%</p>
                  <p>Rango: ${method.minAmount.toLocaleString()} - ${method.maxAmount.toLocaleString()}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Methods List */}
      <div className="space-y-4">
        {methods.map((method) => (
          <div
            key={method.id}
            className={`border rounded-lg p-4 ${
              method.isEnabled ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${getMethodColor(method.color)}`}>
                  {getMethodIcon(method.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    method.isEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {method.isEnabled ? 'Activo' : 'Inactivo'}
                  </span>
                  {method.requiresVerification && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      <Shield className="w-3 h-3 mr-1" />
                      Verificación requerida
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleMethod(method.id)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    method.isEnabled
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {method.isEnabled ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => setEditingMethod(method)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMethod(method.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Comisión:</span>
                <p className="font-medium">{method.processingFee.toFixed(1)}%</p>
              </div>
              <div>
                <span className="text-gray-500">Monto mínimo:</span>
                <p className="font-medium">${method.minAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Monto máximo:</span>
                <p className="font-medium">${method.maxAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Monedas:</span>
                <p className="font-medium">{method.supportedCurrencies.join(', ')}</p>
              </div>
            </div>
          </div>
        ))}

        {methods.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay métodos de pago configurados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega métodos de pago para que tus asistentes puedan comprar entradas.
            </p>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Shield className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Seguridad de Pagos</h4>
            <p className="text-sm text-blue-700 mt-1">
              Todos los pagos son procesados de forma segura con encriptación SSL y cumplimiento PCI DSS.
              Los datos de tarjetas nunca se almacenan en nuestros servidores.
            </p>
          </div>
        </div>
      </div>

      {/* PCI DSS Compliance */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <h4 className="font-medium text-green-900">Cumplimiento PCI DSS</h4>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Nuestra plataforma cumple con los estándares PCI DSS para el procesamiento seguro de pagos con tarjetas.
        </p>
      </div>
    </div>
  );
};
