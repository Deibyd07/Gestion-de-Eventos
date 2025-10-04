import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Tag, Clock, Shield, CreditCard, QrCode } from 'lucide-react';

interface CartItem {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  eventImage: string;
  ticketTypeId: string;
  ticketTypeName: string;
  price: number;
  quantity: number;
  maxQuantity: number;
  isEarlyBird?: boolean;
  earlyBirdPrice?: number;
  earlyBirdValidUntil?: string;
}

interface PromotionalCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  isValid: boolean;
  appliedAmount: number;
}

interface EnhancedCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onApplyPromoCode: (code: string) => Promise<PromotionalCode | null>;
  onRemovePromoCode: () => void;
  onCheckout: () => void;
  isLoading?: boolean;
}

export const EnhancedCart: React.FC<EnhancedCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onApplyPromoCode,
  onRemovePromoCode,
  onCheckout,
  isLoading = false
}) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromotionalCode | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [showPromoForm, setShowPromoForm] = useState(false);

  const subtotal = items.reduce((sum, item) => {
    const price = item.isEarlyBird && item.earlyBirdPrice ? item.earlyBirdPrice : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const discountAmount = appliedPromoCode?.appliedAmount || 0;
  const total = subtotal - discountAmount;

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    try {
      const result = await onApplyPromoCode(promoCode.trim());
      if (result) {
        setAppliedPromoCode(result);
        setPromoCode('');
        setShowPromoForm(false);
      } else {
        alert('Código promocional no válido o expirado');
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      alert('Error al aplicar el código promocional');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setAppliedPromoCode(null);
    onRemovePromoCode();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getTimeRemaining = (validUntil: string) => {
    const now = new Date();
    const until = new Date(validUntil);
    const diff = until.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Tu carrito está vacío</h3>
        <p className="mt-1 text-sm text-gray-500">
          Agrega algunos eventos para comenzar tu compra
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Carrito de Compras ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Shield className="w-4 h-4" />
          <span>Compra segura</span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <img
                src={item.eventImage}
                alt={item.eventTitle}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{item.eventTitle}</h3>
                <p className="text-sm text-gray-500">{item.eventDate}</p>
                <p className="text-sm text-gray-500">{item.eventLocation}</p>
                
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{item.ticketTypeName}</span>
                  {item.isEarlyBird && item.earlyBirdValidUntil && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      <Clock className="w-3 h-3 mr-1" />
                      Early Bird - {getTimeRemaining(item.earlyBirdValidUntil)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                    disabled={item.quantity <= 1}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.min(item.maxQuantity, item.quantity + 1))}
                    disabled={item.quantity >= item.maxQuantity}
                    className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {formatPrice((item.isEarlyBird && item.earlyBirdPrice ? item.earlyBirdPrice : item.price) * item.quantity)}
                  </div>
                  {item.isEarlyBird && item.earlyBirdPrice && (
                    <div className="text-sm text-green-600">
                      Ahorras {formatPrice((item.price - item.earlyBirdPrice) * item.quantity)}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Code Section */}
      <div className="border-t border-gray-200 pt-4">
        {!appliedPromoCode ? (
          <div>
            {!showPromoForm ? (
              <button
                onClick={() => setShowPromoForm(true)}
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Tag className="w-4 h-4 mr-1" />
                ¿Tienes un código promocional?
              </button>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Ingresa tu código"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleApplyPromoCode}
                  disabled={!promoCode.trim() || isApplyingPromo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplyingPromo ? 'Aplicando...' : 'Aplicar'}
                </button>
                <button
                  onClick={() => setShowPromoForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {appliedPromoCode.code} - {appliedPromoCode.description}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-800">
                -{formatPrice(appliedPromoCode.appliedAmount)}
              </span>
              <button
                onClick={handleRemovePromoCode}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          
          {appliedPromoCode && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Descuento ({appliedPromoCode.code})</span>
              <span className="font-medium text-green-600">-{formatPrice(discountAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Impuestos</span>
            <span className="font-medium">Incluidos</span>
          </div>
          
          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-bold text-gray-900">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Procesando...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4 mr-2" />
            Proceder al Pago
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
        <Shield className="w-3 h-3" />
        <span>Pago seguro y encriptado</span>
        <span>•</span>
        <span>Garantía de reembolso</span>
      </div>
    </div>
  );
};
