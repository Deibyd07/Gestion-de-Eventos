import React, { useState, useEffect } from 'react';
import { Modal } from '@shared/ui';
import { PromotionService } from '@shared/lib/api/services/Promotion.service';

export const EditPromotionModal = ({ isOpen, onClose, promotion, onSave }: { isOpen: boolean; onClose: () => void; promotion: any; onSave: () => void }) => {
  const [form, setForm] = useState({
    codigo: '',
    descripcion: '',
    tipo_descuento: 'porcentaje',
    valor_descuento: 0,
    fecha_inicio: '',
    fecha_fin: '',
    uso_maximo: 1,
    activo: true,
  });
  const [loading, setLoading] = useState(false);

  // Actualizar formulario cuando cambia la promoción
  useEffect(() => {
    if (promotion && isOpen) {
      setForm({
        codigo: promotion.codigo || '',
        descripcion: promotion.descripcion || '',
        tipo_descuento: promotion.tipo_descuento || 'porcentaje',
        valor_descuento: Number(promotion.valor_descuento) || 0,
        fecha_inicio: promotion.fecha_inicio ? promotion.fecha_inicio.split('T')[0] : '',
        fecha_fin: promotion.fecha_fin ? promotion.fecha_fin.split('T')[0] : '',
        uso_maximo: Number(promotion.uso_maximo) || 1,
        activo: promotion.activo !== undefined ? promotion.activo : true,
      });
    }
  }, [promotion, isOpen]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const parsedValue = type === 'number' ? Number(value) : type === 'checkbox' ? checked : value;
    setForm({ ...form, [name]: parsedValue });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToUpdate = {
        codigo: form.codigo,
        descripcion: form.descripcion,
        tipo_descuento: form.tipo_descuento,
        valor_descuento: Number(form.valor_descuento),
        fecha_inicio: new Date(form.fecha_inicio).toISOString(),
        fecha_fin: new Date(form.fecha_fin).toISOString(),
        uso_maximo: Number(form.uso_maximo),
        activo: form.activo,
      };
      
      console.log('📝 Datos a actualizar:', dataToUpdate);
      console.log('🎟️ ID de la promoción:', promotion.id);
      
      await PromotionService.actualizarPromocion(promotion.id, dataToUpdate);
      
      console.log('✅ Promoción actualizada exitosamente');
      onSave();
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!promotion) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-300 shadow-lg flex-shrink-0">
            <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Editar promoción">
              <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Editar Código Promocional</h2>
            <p className="text-sm text-gray-500 mt-1">Modifica los datos del código y guarda los cambios.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-orange-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400" aria-label="Cerrar modal">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tarjeta de información actual */}
        <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-4 mb-6 border border-orange-100 shadow-sm">
          <h3 className="font-bold text-orange-900 mb-1 text-lg">{promotion.codigo}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-orange-700">Tipo:</span>
              <span>{promotion.tipo_descuento === 'porcentaje' ? 'Porcentaje' : 'Monto Fijo'}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-orange-700">Descuento:</span>
              <span className="font-semibold">{promotion.tipo_descuento === 'porcentaje' ? `${promotion.valor_descuento}%` : `$${promotion.valor_descuento}`}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-orange-700">Usos:</span>
              <span>{promotion.usos_actuales} / {promotion.uso_maximo}</span>
            </span>
          </div>
          <div className="text-sm text-gray-800">
            <span className="font-medium text-orange-700">Descripción:</span> {promotion.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
            <input name="codigo" value={form.codigo} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Código" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Descuento</label>
            <select name="tipo_descuento" value={form.tipo_descuento} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" required>
              <option value="porcentaje">Porcentaje</option>
              <option value="monto_fijo">Monto Fijo</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Descripción" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor del Descuento</label>
            <input name="valor_descuento" type="number" value={form.valor_descuento} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Valor" min="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uso Máximo</label>
            <input name="uso_maximo" type="number" value={form.uso_maximo} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Uso máximo" min="1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input name="fecha_fin" type="date" value={form.fecha_fin} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" required />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input name="activo" type="checkbox" checked={form.activo} onChange={handleChange} className="rounded focus:ring-2 focus:ring-orange-400" />
              <span className="text-sm font-medium text-gray-700">Activo</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button type="button" className="px-4 py-2 bg-gray-200 rounded font-medium text-gray-700 hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-orange-400" onClick={onClose}>Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded font-medium hover:bg-orange-700 transition focus:outline-none focus:ring-2 focus:ring-orange-400" disabled={loading}>{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
};
