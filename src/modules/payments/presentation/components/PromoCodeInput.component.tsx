import { useState } from 'react';
import { Tag, X, Check, Loader } from 'lucide-react';
import { useCartStore } from '../../infrastructure/store/Cart.store';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';

interface PromoCodeInputProps {
  eventId: string;
}

export function PromoCodeInput({ eventId }: PromoCodeInputProps) {
  const { promoCode, discount, applyPromoCode, removePromoCode } = useCartStore();
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApply = async () => {
    if (!codigo.trim()) {
      setMessage({ type: 'error', text: 'Ingresa un código promocional' });
      return;
    }

    setLoading(true);
    setMessage(null);

    const result = await applyPromoCode(codigo.trim(), eventId);

    setLoading(false);

    if (result.success) {
      setMessage({ type: 'success', text: result.message });
      setCodigo('');
    } else {
      setMessage({ type: 'error', text: result.message });
    }

    // Limpiar mensaje después de 5 segundos
    setTimeout(() => {
      setMessage(null);
    }, 5000);
  };

  const handleRemove = () => {
    removePromoCode();
    setMessage(null);
    setCodigo('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApply();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input para código promocional */}
      {!promoCode && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Código promocional"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleApply}
            disabled={loading || !codigo.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Validando...
              </>
            ) : (
              'Aplicar'
            )}
          </button>
        </div>
      )}

      {/* Código aplicado */}
      {promoCode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="bg-green-100 rounded-full p-2">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-900">{promoCode.codigo}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                    {promoCode.tipo_descuento === 'porcentaje' 
                      ? `-${promoCode.valor_descuento}%` 
                      : `-${formatPriceDisplay(promoCode.valor_descuento)}`}
                  </span>
                </div>
                {promoCode.descripcion && (
                  <p className="text-sm text-green-700 mt-1">{promoCode.descripcion}</p>
                )}
                <p className="text-sm font-semibold text-green-900 mt-2">
                  Descuento: {formatPriceDisplay(discount)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="ml-2 p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
              title="Eliminar código"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de error o éxito */}
      {message && (
        <div 
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
