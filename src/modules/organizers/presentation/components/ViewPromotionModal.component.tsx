import React from 'react';
import { Modal } from '@shared/ui';

export const ViewPromotionModal = ({ isOpen, onClose, promotion }: { isOpen: boolean; onClose: () => void; promotion: any }) => {
  if (!promotion) return null;
  
  const tipoDescuentoText = promotion.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo';
  const valorText = promotion.tipo_descuento === 'porcentaje' 
    ? `${promotion.valor_descuento}%` 
    : `$${promotion.valor_descuento}`;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-purple-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Promotion icon">
            <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Detalles del Código Promocional</h2>
          <p className="text-sm text-gray-500 mt-1">Consulta toda la información del código de descuento seleccionado.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Cerrar modal">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl p-4 mb-6 border border-purple-100 shadow-sm">
        <h3 className="font-bold text-purple-900 mb-1 text-lg">{promotion.codigo}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-purple-700">Tipo:</span>
            <span>{tipoDescuentoText}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-purple-700">Descuento:</span>
            <span className="font-semibold">{valorText}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-purple-700">Usos:</span>
            <span>{promotion.usos_actuales} / {promotion.uso_maximo}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-purple-700">Estado:</span>
            <span className={promotion.activo ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {promotion.activo ? 'Activo' : 'Inactivo'}
            </span>
          </span>
        </div>
        <div className="text-sm text-gray-800 mb-2">
          <span className="font-medium text-purple-700">Descripción:</span> {promotion.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-purple-700">Válido desde:</span>
            <span>{new Date(promotion.fecha_inicio).toLocaleDateString('es-ES')}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-purple-700">Válido hasta:</span>
            <span>{new Date(promotion.fecha_fin).toLocaleDateString('es-ES')}</span>
          </span>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-5 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-400" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
};
