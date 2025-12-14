import React from 'react';
import { Modal } from '@shared/ui';
import {
  Percent,
  X,
  Calendar,
  Tag,
  Repeat,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import { formatFullRevenue } from '@shared/lib/utils/Currency.utils';

// Función para formatear fechas sin conversión de timezone
const formatDateLocal = (isoDate: string) => {
  if (!isoDate) return '';
  const datePart = isoDate.split('T')[0];
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return isoDate;

  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const ViewPromotionModal = ({ isOpen, onClose, promotion }: { isOpen: boolean; onClose: () => void; promotion: any }) => {
  if (!promotion) return null;

  const isPercentage = promotion.tipo_descuento === 'porcentaje';
  const valorDisplay = isPercentage
    ? `${promotion.valor_descuento}%`
    : formatFullRevenue(promotion.valor_descuento);

  const usos = promotion.usos_actuales || 0;
  const maxUsos = promotion.uso_maximo || 0;
  const porcentajeUso = maxUsos > 0 ? (usos / maxUsos) * 100 : 0;

  const isActive = promotion.activo;
  const today = new Date();
  const endDate = new Date(promotion.fecha_fin);
  const isExpired = endDate < today;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
            <Percent className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{promotion.codigo}</h2>
            <p className="text-sm text-gray-500 font-mono hidden sm:block">
              {promotion.id}
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
        {/* Banner de Estado */}
        <div className={`p-4 rounded-xl border ${isActive && !isExpired
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
          } flex items-center gap-3`}>
          {isActive && !isExpired ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <div>
            <h4 className="font-bold text-sm">
              {isActive && !isExpired ? 'Descuento Activo' : 'Descuento Inactivo'}
            </h4>
            <p className="text-xs opacity-90">
              {isActive
                ? (isExpired ? 'Este código ha expirado.' : 'Este código está disponible para su uso.')
                : 'Este código ha sido desactivado manualmente.'}
            </p>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className={`flex items-center gap-2 mb-2 text-green-700`}>
              <Tag className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Valor</span>
            </div>
            <p className={`text-xl font-bold text-green-900`}>
              {valorDisplay}
            </p>
            <p className="text-xs text-green-600 mt-1">
              {isPercentage ? 'Descuento porcentual' : 'Monto fijo descontado'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center gap-2 mb-2 text-blue-700">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Uso</span>
            </div>
            <p className="text-xl font-bold text-blue-900">{usos} <span className="text-sm font-normal text-blue-600">/ {maxUsos}</span></p>
            <div className="w-full bg-blue-200/50 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full"
                style={{ width: `${Math.min(porcentajeUso, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center gap-2 mb-2 text-purple-700">
              <Percent className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Tipo</span>
            </div>
            <p className="text-xl font-bold text-purple-900 capitalize">
              {promotion.tipo_descuento?.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-purple-600 mt-1">Aplicado al total</p>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Vigencia
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Inicio</p>
                <p className="text-sm font-semibold text-gray-900">{formatDateLocal(promotion.fecha_inicio)}</p>
              </div>
              <div className="h-px bg-gray-200" />
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Fin</p>
                <p className="text-sm font-semibold text-gray-900">{formatDateLocal(promotion.fecha_fin)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Detalles
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 h-full">
              <p className="text-sm text-gray-600 leading-relaxed">
                {promotion.descripcion || <span className="italic text-gray-400">Sin descripción proporcionada.</span>}
              </p>
              {promotion.evento_nombre && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Asociado al evento</p>
                  <p className="text-sm font-bold text-purple-700">{promotion.evento_nombre}</p>
                </div>
              )}
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
