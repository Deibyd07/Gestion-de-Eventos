import React, { useState } from 'react';
import { Modal } from '@shared/ui';
import { PromotionService } from '@shared/lib/api/services/Promotion.service';

export const DeletePromotionModal = ({ isOpen, onClose, promotion, onDelete }: { isOpen: boolean; onClose: () => void; promotion: any; onDelete: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      console.log('🗑️ Eliminando promoción:', promotion.id);
      
      await PromotionService.eliminarPromocion(promotion.id);
      
      console.log('✅ Promoción eliminada exitosamente');
      onDelete();
      onClose();
    } catch (err) {
      console.error('❌ Error al eliminar:', err);
      alert('Error al eliminar la promoción');
    } finally {
      setLoading(false);
    }
  };

  if (!promotion) return null;
  
  const hasUsage = promotion.usos_actuales > 0;
  const tipoDescuentoText = promotion.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo';
  const valorText = promotion.tipo_descuento === 'porcentaje' 
    ? `${promotion.valor_descuento}%` 
    : `$${promotion.valor_descuento}`;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300 shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Eliminar promoción">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Eliminar Código Promocional</h2>
          <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Cerrar modal">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4 mb-6 border border-red-100 shadow-sm">
        <h3 className="font-bold text-red-900 mb-1 text-lg">{promotion.codigo}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-red-700">Tipo:</span>
            <span>{tipoDescuentoText}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-red-700">Descuento:</span>
            <span className="font-semibold">{valorText}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-red-700">Usos:</span>
            <span className={hasUsage ? 'font-bold text-red-600' : ''}>{promotion.usos_actuales} / {promotion.uso_maximo}</span>
          </span>
        </div>
        <div className="text-sm text-gray-800">
          <span className="font-medium text-red-700">Descripción:</span> {promotion.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm text-red-800">
            <p className="font-medium mb-1">⚠️ Advertencia</p>
            <p>¿Estás seguro de que deseas eliminar este código promocional?</p>
            {hasUsage && (
              <p className="mt-2 font-bold">Este código ya ha sido usado {promotion.usos_actuales} {promotion.usos_actuales === 1 ? 'vez' : 'veces'}.</p>
            )}
            <p className="mt-2">Esta acción es permanente y no se puede revertir.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-red-400" onClick={onClose}>Cancelar</button>
        <button className="px-5 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400" onClick={handleDelete} disabled={loading}>{loading ? 'Eliminando...' : 'Eliminar'}</button>
      </div>
    </Modal>
  );
};
