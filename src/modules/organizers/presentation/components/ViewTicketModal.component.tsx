import React from 'react';
import { Modal } from '@shared/ui';
import {
  Ticket,
  X,
  Calendar,
  DollarSign,
  Users,
  Tag,
  FileText,
  Percent,
  Info
} from 'lucide-react';
import { formatFullRevenue } from '@shared/lib/utils/Currency.utils';

interface ViewTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: any;
}

export const ViewTicketModal: React.FC<ViewTicketModalProps> = ({ isOpen, onClose, ticket }) => {
  if (!ticket) return null;

  // Normalizar datos para soportar estructura de BD y del Store
  const price = ticket.precio ?? ticket.price ?? 0;
  const available = ticket.cantidad_disponible ?? ticket.available ?? 0;
  // Si no tenemos vendidos explícitos, intentamos calcularlo o usar la propiedad sold
  const sold = ticket.cantidad_vendida ?? ticket.sold ?? 0;
  // Si no tenemos máximo explícito, lo inferimos de disponibles + vendidos
  const maximos = ticket.cantidad_maxima ?? (available + sold);

  const disponibles = available;
  const vendidos = sold;

  const porcentajeVendido = maximos > 0 ? ((vendidos / maximos) * 100).toFixed(1) : '0';

  // Usar ingresos reales si existen (calculados en backend/dashboard considerando descuentos), sino estimar con el precio normalizado
  const ingresosReales = ticket.revenue !== undefined ? ticket.revenue : (vendidos * price);
  const potencialTotal = maximos * price;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{ticket.nombre_tipo}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {ticket.nombre_evento || 'Evento asociado'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-6 space-y-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 mb-2 text-green-700">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Precio</span>
            </div>
            <p className="text-xl font-bold text-green-900">{formatFullRevenue(price)}</p>
            <p className="text-xs text-green-600 mt-1">por entrada</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2 text-blue-700">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Vendidas</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{vendidos} <span className="text-sm font-normal text-blue-600">/ {maximos}</span></p>
            <p className="text-xs text-blue-600 mt-1">{porcentajeVendido}% ocupación</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2 text-purple-700">
              <Tag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Ingresos</span>
            </div>
            <p className="text-xl font-bold text-purple-900">{formatFullRevenue(ingresosReales)}</p>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Percent className="w-4 h-4 text-gray-400" />
              Progreso de Ventas
            </span>
            <span className={`text-sm ${disponibles === 0 ? 'text-red-600 font-bold' : 'text-blue-600'
              }`}>
              {disponibles === 0 ? 'AGOTADO' : `${disponibles} disponibles`}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${Number(porcentajeVendido) >= 100 ? 'bg-red-500' :
                Number(porcentajeVendido) > 75 ? 'bg-orange-500' :
                  'bg-blue-500'
                }`}
              style={{ width: `${porcentajeVendido}%` }}
            />
          </div>
        </div>

        {/* Detalles Adicionales */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-500" />
            Descripción e Información
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {ticket.descripcion || ticket.description || <span className="italic text-gray-400">Sin descripción proporcionada para este tipo de entrada.</span>}
          </p>

          {/* Etiquetas / Características */}
          {(ticket.features?.length > 0 || ticket.etiquetas?.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Tag className="w-3 h-3" />
                Características
              </h4>
              <div className="flex flex-wrap gap-2">
                {(ticket.features || ticket.etiquetas || []).map((feature: string, idx: number) => (
                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-500 font-medium mb-1">ID de Entrada</p>
              <p className="font-mono text-gray-700 bg-white px-2 py-1 rounded border border-gray-200 inline-block">
                {ticket.id || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500 font-medium mb-1">Estado</p>
              <span className={`inline-flex px-2 py-1 rounded-md font-medium ${disponibles > 0
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                {disponibles > 0 ? 'Activo' : 'Agotado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
};