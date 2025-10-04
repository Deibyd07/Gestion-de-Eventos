import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../../core/stores/cartStore';

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const { items } = useCartStore();
  const [isVisible, setIsVisible] = useState(false);

  const cartItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // Mostrar el botón después de un pequeño delay para evitar que aparezca inmediatamente
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-110 group"
      title="Ver carrito de compras"
    >
      <ShoppingCart className="w-6 h-6" />
      {cartItemsCount > 0 && (
        <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
          {cartItemsCount}
        </span>
      )}
      
      {/* Tooltip */}
      <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Carrito de Compras
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
      </div>
    </button>
  );
}


