import React, { useState, useEffect } from 'react';
import { Modal } from '@shared/ui';
import { PromotionService } from '@shared/lib/api/services/Promotion.service';

export const DuplicatePromotionModal = ({ isOpen, onClose, promotion, onDuplicate }: { isOpen: boolean; onClose: () => void; promotion: any; onDuplicate: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    tipo_descuento: 'porcentaje',
    valor_descuento: 0,
    fecha_inicio: '',
    fecha_fin: '',
    uso_maximo: 1,
    activo: true,
  });

  // Actualizar formulario cuando cambia la promoción
  useEffect(() => {
    if (promotion && isOpen) {
      setFormData({
        codigo: `${promotion.codigo}_COPIA`,
        descripcion: promotion.descripcion || '',
        tipo_descuento: promotion.tipo_descuento || 'porcentaje',
        valor_descuento: Number(promotion.valor_descuento) || 0,
        fecha_inicio: promotion.fecha_inicio ? promotion.fecha_inicio.split('T')[0] : '',
        fecha_fin: promotion.fecha_fin ? promotion.fecha_fin.split('T')[0] : '',
        uso_maximo: Number(promotion.uso_maximo) || 1,
        activo: true,
      });
    }
  }, [promotion, isOpen]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const parsedValue = type === 'number' ? Number(value) : type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      const newPromotionData = {
        codigo: formData.codigo,
        descripcion: formData.descripcion,
        tipo_descuento: formData.tipo_descuento,
        valor_descuento: Number(formData.valor_descuento),
        fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
        fecha_fin: new Date(formData.fecha_fin).toISOString(),
        uso_maximo: Number(formData.uso_maximo),
        usos_actuales: 0, // Reset usage count
        id_evento: promotion.id_evento,
        id_organizador: promotion.id_organizador,
        activo: formData.activo,
      };
      
      console.log('📋 Duplicando promoción:', newPromotionData);
      
      await PromotionService.crearPromocion(newPromotionData);
      
      console.log('✅ Promoción duplicada exitosamente');
      onDuplicate();
      onClose();
    } catch (err) {
      console.error('❌ Error al duplicar:', err);
      alert('Error al duplicar la promoción');
    } finally {
      setLoading(false);
    }
  };

  if (!promotion) return null;
  
  const tipoDescuentoText = promotion.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo';
  const valorText = promotion.tipo_descuento === 'porcentaje' 
    ? `${promotion.valor_descuento}%` 
    : `$${promotion.valor_descuento}`;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-300 shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Duplicar promoción">
            <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Duplicar Código Promocional</h2>
          <p className="text-sm text-gray-500 mt-1">Ajusta los datos y confirma para crear una copia.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Cerrar modal">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Tarjeta de información del original */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-blue-100 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-1 text-sm">Original: {promotion.codigo}</h3>
        <div className="flex flex-wrap gap-4 text-xs text-gray-700">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Tipo:</span>
            <span>{tipoDescuentoText}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Descuento:</span>
            <span className="font-semibold">{valorText}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Usos Máximo:</span>
            <span>{promotion.uso_maximo}</span>
          </span>
        </div>
      </div>

      {/* Formulario editable */}
      <form className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input
              name="codigo"
              value={formData.codigo}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Código"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento</label>
            <select
              name="tipo_descuento"
              value={formData.tipo_descuento}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              required
            >
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto Fijo</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Descripción"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor del Descuento</label>
            <input
              name="valor_descuento"
              type="number"
              value={formData.valor_descuento}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Valor"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uso Máximo</label>
            <input
              name="uso_maximo"
              type="number"
              value={formData.uso_maximo}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Uso máximo"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              name="fecha_inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              name="fecha_fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                name="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={handleChange}
                className="rounded focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
          </div>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-800">
            <p className="font-medium">Los usos se reiniciarán a 0 en la copia.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button className="px-5 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={onClose}>Cancelar</button>
        <button className="px-5 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleDuplicate} disabled={loading}>{loading ? 'Duplicando...' : 'Duplicar'}</button>
      </div>
    </Modal>
  );
};
