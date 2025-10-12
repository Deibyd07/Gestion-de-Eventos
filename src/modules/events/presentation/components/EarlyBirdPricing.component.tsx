import React, { useState } from 'react';
import { Clock, Calendar, Percent, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface EarlyBirdPricing {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  originalPrice: number;
  earlyBirdPrice: number;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
  maxQuantity?: number;
  description: string;
  isActive: boolean;
}

interface EarlyBirdPricingProps {
  eventId: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  onPricingChange?: (pricing: EarlyBirdPricing[]) => void;
}

export const EarlyBirdPricing: React.FC<EarlyBirdPricingProps> = ({
  eventId,
  ticketTypes,
  onPricingChange
}) => {
  const [pricing, setPricing] = useState<EarlyBirdPricing[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState<EarlyBirdPricing | null>(null);

  const [newPricing, setNewPricing] = useState({
    ticketTypeId: '',
    originalPrice: 0,
    earlyBirdPrice: 0,
    validFrom: '',
    validUntil: '',
    maxQuantity: 0,
    description: '',
    isActive: true
  });

  const calculateDiscountPercentage = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100);
  };

  const createPricing = () => {
    if (!newPricing.ticketTypeId || !newPricing.validFrom || !newPricing.validUntil) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (newPricing.earlyBirdPrice >= newPricing.originalPrice) {
      alert('El precio Early Bird debe ser menor al precio original');
      return;
    }

    const selectedTicketType = ticketTypes.find(t => t.id === newPricing.ticketTypeId);
    if (!selectedTicketType) return;

    const pricingItem: EarlyBirdPricing = {
      id: Date.now().toString(),
      ticketTypeId: newPricing.ticketTypeId,
      ticketTypeName: selectedTicketType.name,
      originalPrice: newPricing.originalPrice,
      earlyBirdPrice: newPricing.earlyBirdPrice,
      discountPercentage: calculateDiscountPercentage(newPricing.originalPrice, newPricing.earlyBirdPrice),
      validFrom: newPricing.validFrom,
      validUntil: newPricing.validUntil,
      maxQuantity: newPricing.maxQuantity || undefined,
      description: newPricing.description,
      isActive: newPricing.isActive
    };

    setPricing([...pricing, pricingItem]);
    setNewPricing({
      ticketTypeId: '',
      originalPrice: 0,
      earlyBirdPrice: 0,
      validFrom: '',
      validUntil: '',
      maxQuantity: 0,
      description: '',
      isActive: true
    });
    setShowCreateForm(false);
    onPricingChange?.([...pricing, pricingItem]);
  };

  const updatePricing = (id: string, updates: Partial<EarlyBirdPricing>) => {
    const updatedPricing = pricing.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setPricing(updatedPricing);
    onPricingChange?.(updatedPricing);
  };

  const deletePricing = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este precio Early Bird?')) {
      const updatedPricing = pricing.filter(item => item.id !== id);
      setPricing(updatedPricing);
      onPricingChange?.(updatedPricing);
    }
  };

  const isPricingActive = (item: EarlyBirdPricing) => {
    const now = new Date();
    const validFrom = new Date(item.validFrom);
    const validUntil = new Date(item.validUntil);
    return item.isActive && now >= validFrom && now <= validUntil;
  };

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const until = new Date(validUntil);
    const diff = until.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Precios Early Bird</h3>
          <p className="text-sm text-gray-500">Ofrece descuentos por tiempo limitado para impulsar las ventas tempranas</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Clock className="w-4 h-4 mr-2" />
          Crear Precio Early Bird
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Crear Precio Early Bird</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrada *
              </label>
              <select
                value={newPricing.ticketTypeId}
                onChange={(e) => {
                  const selectedTicket = ticketTypes.find(t => t.id === e.target.value);
                  setNewPricing({
                    ...newPricing,
                    ticketTypeId: e.target.value,
                    originalPrice: selectedTicket?.price || 0
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Selecciona un tipo de entrada</option>
                {ticketTypes.map((ticketType) => (
                  <option key={ticketType.id} value={ticketType.id}>
                    {ticketType.name} - ${ticketType.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Original *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={newPricing.originalPrice}
                    onChange={(e) => setNewPricing({ ...newPricing, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="100000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Early Bird *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={newPricing.earlyBirdPrice}
                    onChange={(e) => setNewPricing({ ...newPricing, earlyBirdPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="80000"
                  />
                </div>
                {newPricing.originalPrice > 0 && newPricing.earlyBirdPrice > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Descuento: {calculateDiscountPercentage(newPricing.originalPrice, newPricing.earlyBirdPrice)}%
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válido Desde *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={newPricing.validFrom}
                    onChange={(e) => setNewPricing({ ...newPricing, validFrom: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Válido Hasta *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={newPricing.validUntil}
                    onChange={(e) => setNewPricing({ ...newPricing, validUntil: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad Máxima (Opcional)
              </label>
              <input
                type="number"
                value={newPricing.maxQuantity}
                onChange={(e) => setNewPricing({ ...newPricing, maxQuantity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deja en 0 para cantidad ilimitada
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <input
                type="text"
                value={newPricing.description}
                onChange={(e) => setNewPricing({ ...newPricing, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="¡Oferta especial por tiempo limitado!"
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
              onClick={createPricing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Crear Precio Early Bird
            </button>
          </div>
        </div>
      )}

      {/* Pricing List */}
      <div className="space-y-4">
        {pricing.map((item) => (
          <div
            key={item.id}
            className={`border rounded-lg p-4 ${
              isPricingActive(item) ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{item.ticketTypeName}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    isPricingActive(item)
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isPricingActive(item) ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                {isPricingActive(item) && (
                  <div className="flex items-center text-sm text-green-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{getTimeRemaining(item.validUntil)} restante</span>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingPricing(item)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => deletePricing(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Precio Original:</span>
                <p className="font-medium">${item.originalPrice.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Precio Early Bird:</span>
                <p className="font-medium text-green-600">${item.earlyBirdPrice.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Descuento:</span>
                <p className="font-medium text-green-600">{item.discountPercentage}%</p>
              </div>
              <div>
                <span className="text-gray-500">Ahorro:</span>
                <p className="font-medium text-green-600">
                  ${(item.originalPrice - item.earlyBirdPrice).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <span className="text-gray-500">Válido desde:</span>
                <p className="font-medium">
                  {new Date(item.validFrom).toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Válido hasta:</span>
                <p className="font-medium">
                  {new Date(item.validUntil).toLocaleString('es-ES')}
                </p>
              </div>
            </div>

            {item.description && (
              <p className="text-sm text-gray-600 mt-2">{item.description}</p>
            )}

            {item.maxQuantity && item.maxQuantity > 0 && (
              <div className="mt-2">
                <span className="text-sm text-gray-500">Cantidad máxima: </span>
                <span className="text-sm font-medium">{item.maxQuantity} entradas</span>
              </div>
            )}
          </div>
        ))}

        {pricing.length === 0 && (
          <div className="text-center py-8">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay precios Early Bird</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crea ofertas especiales por tiempo limitado para impulsar las ventas tempranas.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {pricing.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <h4 className="font-medium text-green-900">Resumen de Precios Early Bird</h4>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Has configurado {pricing.length} precio{pricing.length > 1 ? 's' : ''} Early Bird.
            {pricing.filter(isPricingActive).length > 0 && (
              <span className="font-medium">
                {' '}{pricing.filter(isPricingActive).length} está{pricing.filter(isPricingActive).length > 1 ? 'n' : ''} activo{pricing.filter(isPricingActive).length > 1 ? 's' : ''} actualmente.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
