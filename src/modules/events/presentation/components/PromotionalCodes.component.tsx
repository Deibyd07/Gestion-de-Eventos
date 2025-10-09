import React, { useState } from 'react';
import { Percent, Tag, Clock, Users, Plus, X, Copy, Check } from 'lucide-react';

interface PromotionalCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  maxUses: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  isActive: boolean;
}

interface PromotionalCodesProps {
  eventId: string;
  onCodeChange?: (codes: PromotionalCode[]) => void;
}

export const PromotionalCodes: React.FC<PromotionalCodesProps> = ({
  eventId,
  onCodeChange
}) => {
  const [codes, setCodes] = useState<PromotionalCode[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCode, setEditingCode] = useState<PromotionalCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [newCode, setNewCode] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    description: '',
    maxUses: 100,
    validFrom: '',
    validUntil: '',
    minOrderAmount: 0,
    maxDiscountAmount: 0,
    isActive: true
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createCode = () => {
    if (!newCode.code || !newCode.validFrom || !newCode.validUntil) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const code: PromotionalCode = {
      id: Date.now().toString(),
      ...newCode,
      usedCount: 0
    };

    setCodes([...codes, code]);
    setNewCode({
      code: '',
      type: 'percentage',
      value: 0,
      description: '',
      maxUses: 100,
      validFrom: '',
      validUntil: '',
      minOrderAmount: 0,
      maxDiscountAmount: 0,
      isActive: true
    });
    setShowCreateForm(false);
    onCodeChange?.([...codes, code]);
  };

  const updateCode = (id: string, updates: Partial<PromotionalCode>) => {
    const updatedCodes = codes.map(code =>
      code.id === id ? { ...code, ...updates } : code
    );
    setCodes(updatedCodes);
    onCodeChange?.(updatedCodes);
  };

  const deleteCode = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este código promocional?')) {
      const updatedCodes = codes.filter(code => code.id !== id);
      setCodes(updatedCodes);
      onCodeChange?.(updatedCodes);
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  const getUsagePercentage = (code: PromotionalCode) => {
    return (code.usedCount / code.maxUses) * 100;
  };

  const isCodeExpired = (code: PromotionalCode) => {
    const now = new Date();
    const validUntil = new Date(code.validUntil);
    return now > validUntil;
  };

  const isCodeActive = (code: PromotionalCode) => {
    const now = new Date();
    const validfrom.*Date.utils(code.validFrom);
    const validUntil = new Date(code.validUntil);
    return code.isActive && now >= validFrom && now <= validUntil && code.usedCount < code.maxUses;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Códigos Promocionales</h3>
          <p className="text-sm text-gray-500">Gestiona descuentos y promociones para tu evento</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Crear Código
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Crear Código Promocional</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCode.code}
                  onChange={(e) => setNewCode({ ...newCode, code: e.target.value.toUpperCase() })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="DESCUENTO20"
                />
                <button
                  type="button"
                  onClick={() => setNewCode({ ...newCode, code: generateRandomCode() })}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Generar
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Descuento *
              </label>
              <select
                value={newCode.type}
                onChange={(e) => setNewCode({ ...newCode, type: e.target.value as 'percentage' | 'fixed' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="percentage">Porcentaje</option>
                <option value="fixed">Cantidad Fija</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor del Descuento *
              </label>
              <div className="relative">
                {newCode.type === 'percentage' ? (
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                ) : (
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
                <input
                  type="number"
                  value={newCode.value}
                  onChange={(e) => setNewCode({ ...newCode, value: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={newCode.type === 'percentage' ? '20' : '50000'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usos Máximos *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={newCode.maxUses}
                  onChange={(e) => setNewCode({ ...newCode, maxUses: parseInt(e.target.value) || 0 })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido Desde *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={newCode.validFrom}
                  onChange={(e) => setNewCode({ ...newCode, validFrom: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Válido Hasta *
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="datetime-local"
                  value={newCode.validUntil}
                  onChange={(e) => setNewCode({ ...newCode, validUntil: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={newCode.description}
                onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descuento especial para estudiantes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={createCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Código
            </button>
          </div>
        </div>
      )}

      {/* Codes List */}
      <div className="space-y-4">
        {codes.map((code) => (
          <div
            key={code.id}
            className={`border rounded-lg p-4 ${
              isCodeActive(code) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-lg font-bold text-gray-900">{code.code}</span>
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {copiedCode === code.code ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  isCodeActive(code)
                    ? 'bg-green-100 text-green-800'
                    : isCodeExpired(code)
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isCodeActive(code) ? 'Activo' : isCodeExpired(code) ? 'Expirado' : 'Inactivo'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingCode(code)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteCode(code.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Descuento:</span>
                <p className="font-medium">
                  {code.type === 'percentage' ? `${code.value}%` : `$${code.value.toLocaleString()}`}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Usos:</span>
                <p className="font-medium">{code.usedCount} / {code.maxUses}</p>
              </div>
              <div>
                <span className="text-gray-500">Válido hasta:</span>
                <p className="font-medium">
                  {new Date(code.validUntil).toLocaleDateString('es-ES')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Progreso:</span>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${getUsagePercentage(code)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {Math.round(getUsagePercentage(code))}%
                  </span>
                </div>
              </div>
            </div>

            {code.description && (
              <p className="text-sm text-gray-600 mt-2">{code.description}</p>
            )}
          </div>
        ))}

        {codes.length === 0 && (
          <div className="text-center py-8">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay códigos promocionales</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crea tu primer código promocional para ofrecer descuentos a tus asistentes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
