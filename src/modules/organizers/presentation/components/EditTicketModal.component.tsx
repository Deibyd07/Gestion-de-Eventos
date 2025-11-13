import React, { useState, useEffect } from 'react';
import { Modal } from '@shared/ui';
import { TicketTypeService } from '@shared/lib/api/services/TicketType.service';

export const EditTicketModal = ({ isOpen, onClose, ticket, onSave }: { isOpen: boolean; onClose: () => void; ticket: any; onSave: () => void }) => {
  const [form, setForm] = useState({
    nombre_tipo: '',
    precio: 0,
    descripcion: '',
    cantidad_maxima: 0,
    cantidad_disponible: 0,
  });
  const [loading, setLoading] = useState(false);

  // Actualizar formulario cuando cambia el ticket
  useEffect(() => {
    if (ticket && isOpen) {
      setForm({
        nombre_tipo: ticket.nombre_tipo || '',
        precio: Number(ticket.precio) || 0,
        descripcion: ticket.descripcion || '',
        cantidad_maxima: Number(ticket.cantidad_maxima) || 0,
        cantidad_disponible: Number(ticket.cantidad_disponible) || 0,
      });
    }
  }, [ticket, isOpen]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    // Convertir valores numéricos correctamente
    const parsedValue = type === 'number' ? Number(value) : value;
    setForm({ ...form, [name]: parsedValue });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Asegurar que todos los valores numéricos sean números
      const dataToUpdate = {
        nombre_tipo: form.nombre_tipo,
        precio: Number(form.precio),
        descripcion: form.descripcion,
        cantidad_maxima: Number(form.cantidad_maxima),
        cantidad_disponible: Number(form.cantidad_disponible),
      };
      
      console.log('📝 Datos a actualizar:', dataToUpdate);
      console.log('🎫 ID del ticket:', ticket.id);
      
      await TicketTypeService.actualizarTipoEntrada(ticket.id, dataToUpdate);
      
      console.log('✅ Tipo de entrada actualizado exitosamente');
      onSave();
      onClose();
    } catch (err) {
      console.error('❌ Error al guardar:', err);
      alert('Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <form className="space-y-6 animate-fade-in" onSubmit={handleSubmit}>
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-300 shadow-lg flex-shrink-0">
            <svg className="w-7 h-7 text-orange-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Editar ticket"><path d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /><circle cx="8" cy="12" r="1" /><circle cx="16" cy="12" r="1" /></svg>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Editar Entrada</h2>
            <p className="text-sm text-gray-500 mt-1">Modifica los datos de la entrada y guarda los cambios.</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-orange-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400" aria-label="Cerrar modal">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tarjeta de información actual */}
        <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-xl p-4 mb-6 border border-orange-100 shadow-sm">
          <h3 className="font-bold text-orange-900 mb-1 text-lg">{ticket.nombre_tipo}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-orange-700">Evento:</span>
              <span>{ticket.nombre_evento}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-orange-700">Precio:</span>
              <span className="font-semibold">${ticket.precio}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-orange-700">Disponibles:</span>
              <span>{ticket.cantidad_disponible} / {ticket.cantidad_maxima}</span>
            </span>
          </div>
          <div className="text-sm text-gray-800">
            <span className="font-medium text-orange-700">Descripción:</span> {ticket.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input name="nombre_tipo" value={form.nombre_tipo} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Nombre" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input name="precio" type="number" value={form.precio} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Precio" min="0" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Descripción" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad máxima</label>
            <input name="cantidad_maxima" type="number" value={form.cantidad_maxima} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Cantidad máxima" min="1" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad disponible</label>
            <input name="cantidad_disponible" type="number" value={form.cantidad_disponible} onChange={handleChange} className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-orange-400" placeholder="Cantidad disponible" min="0" required />
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