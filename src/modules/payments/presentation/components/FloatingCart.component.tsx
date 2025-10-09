import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../../payments/infrastructure/store/Cart.store';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';

interface FloatingCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingCart({ isOpen, onClose }: FloatingCartProps) {
  const { items, total, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-t-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Carrito de Compras</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-500 mb-4">Agrega algunos eventos para comenzar</p>
              <Link
                to="/events"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Explorar Eventos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{item.eventTitle}</h4>
                    <p className="text-gray-600 text-xs">{item.ticketTypeName}</p>
                    <p className="text-blue-600 font-semibold text-sm">
                      {formatPriceDisplay(item.price)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-blue-600">
                {formatPriceDisplay(total)}
              </span>
            </div>
            
            <div className="space-y-2">
              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 text-center block"
              >
                Proceder al Pago
              </Link>
              
              <Link
                to="/events"
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-center block"
              >
                Seguir Comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


