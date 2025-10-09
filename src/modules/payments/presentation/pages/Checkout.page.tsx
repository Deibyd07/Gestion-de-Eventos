import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, CreditCard, Shield, ArrowLeft, Lock, CheckCircle, Loader2 } from 'lucide-react';
import { useCartStore } from '../../../payments/infrastructure/store/Cart.store';
import { useNotificationStore } from '../../../notifications/infrastructure/store/Notification.store';
import { apiService } from '@shared/lib/api/api';
import { formatPriceDisplay, formatPrice } from '@shared/lib/utils/Currency.utils';

export function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useCartStore();
  const { addNotification } = useNotificationStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const navigate = useNavigate();

  const handleQuantityChange = (eventId: string, ticketTypeId: string, newQuantity: number) => {
    updateQuantity(eventId, ticketTypeId, newQuantity);
  };

  const handleRemoveItem = (eventId: string, ticketTypeId: string) => {
    removeItem(eventId, ticketTypeId);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart and show success notification
      clearCart();
      addNotification({
        type: 'success',
        title: '¡Compra exitosa!',
        message: 'Tu compra se realizó correctamente. Recibirás tus entradas por email.',
        duration: 6000
      });
      navigate('/events');
    } catch (error) {
      console.error('Error processing payment:', error);
      addNotification({
        type: 'error',
        title: 'Error en el pago',
        message: 'Hubo un problema procesando tu pago. Inténtalo de nuevo.',
        duration: 5000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Tu carrito está vacío
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Explora nuestros eventos y añade las entradas que más te interesen.
            </p>
            <Link 
              to="/events"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Explorar Eventos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50/80 to-blue-50/80 backdrop-blur-sm p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 mb-8">
          <Link 
            to="/events"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continuar comprando
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finalizar Compra</h1>
              <p className="text-gray-600 mt-1">
                Revisa tu pedido y completa la compra de tus entradas
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Entradas Seleccionadas ({items.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
              </div>
            
            <div className="divide-y divide-gray-200">
              {items.map((item, index) => (
                <div key={`${item.eventId}-${item.ticketTypeId}`} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {item.eventTitle}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {item.ticketTypeName}
                      </p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleQuantityChange(item.eventId, item.ticketTypeId, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 text-white flex items-center justify-center hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-sm"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.eventId, item.ticketTypeId, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center justify-center hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.eventId, item.ticketTypeId)}
                          className="flex items-center space-x-1 text-red-600 hover:text-red-700 transition-colors duration-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-sm font-medium">Eliminar</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        {formatPriceDisplay(item.price * item.quantity)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPriceDisplay(item.price)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-6 sticky top-24">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Resumen del Pedido</h3>
              </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPriceDisplay(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tasas de servicio</span>
                <span>{formatPriceDisplay(total * 0.05)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>{formatPriceDisplay(total + total * 0.05)}</span>
                </div>
              </div>
            </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="text-base md:text-lg font-medium text-gray-900 mb-3 md:mb-4 flex items-center">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
                  Método de Pago
                </h4>
                <div className="space-y-2 md:space-y-3">
                  <label className="flex items-center p-3 md:p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg md:rounded-xl cursor-pointer hover:from-blue-100 hover:to-blue-200 transition-all duration-200">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 flex-shrink-0"
                    />
                    <div className="ml-3 flex items-center min-w-0 flex-1">
                      <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mr-2 flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium text-gray-900 truncate">Tarjeta de Crédito/Débito</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 md:p-4 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg md:rounded-xl cursor-pointer hover:from-orange-100 hover:to-orange-200 transition-all duration-200">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500 flex-shrink-0"
                    />
                    <div className="ml-3 flex items-center min-w-0 flex-1">
                      <div className="w-4 h-4 md:w-5 md:h-5 bg-orange-600 rounded mr-2 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-white font-bold">P</span>
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900 truncate">PayPal</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 font-medium">
                    Compra 100% segura y protegida
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Procesando...
                  </span>
                ) : (
                  `Pagar ${formatPriceDisplay(total + total * 0.05)}`
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al hacer clic en "Pagar", aceptas nuestros{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                  términos y condiciones
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}