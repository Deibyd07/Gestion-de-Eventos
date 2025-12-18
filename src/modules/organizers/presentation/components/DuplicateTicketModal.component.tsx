import React, { useState, useEffect } from 'react';
import { Modal } from '@shared/ui';
import { TicketTypeService } from '@shared/lib/api/services/TicketType.service';

export const DuplicateTicketModal = ({ isOpen, onClose, ticket, onDuplicate }: { isOpen: boolean; onClose: () => void; ticket: any; onDuplicate: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_tipo: '',
    precio: 0,
    descripcion: '',
    cantidad_maxima: 0,
    cantidad_disponible: 0,
  });

  // Actualizar formulario cuando cambia el ticket
  useEffect(() => {
    if (ticket && isOpen) {
      // Calcular cantidad máxima usando available + sold si no viene explícito
      // El dashboard envía 'available' y 'sold'.
      const maxQuantity = ticket.cantidad_maxima ??
        ((ticket.available ?? 0) + (ticket.sold ?? 0));

      setFormData({
        nombre_tipo: `${ticket.nombre_tipo || ticket.name} (Copia)`,
        precio: Number(ticket.precio ?? ticket.price ?? 0),
        descripcion: ticket.descripcion || ticket.description || '',
        cantidad_maxima: Number(maxQuantity) || 0,
        cantidad_disponible: Number(ticket.cantidad_disponible ?? ticket.available ?? 0),
      });
    }
  }, [ticket, isOpen]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'number' ? Number(value) : value;
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleDuplicate = async () => {
    setLoading(true);
    try {
      await TicketTypeService.crearTipoEntrada({
        id_evento: ticket.id_evento,
        nombre_tipo: formData.nombre_tipo,
        precio: Number(formData.precio),
        descripcion: formData.descripcion,
        cantidad_maxima: Number(formData.cantidad_maxima),
        cantidad_disponible: Number(formData.cantidad_disponible),
      });
      onDuplicate();
      onClose();
    } catch (err) {
      alert('Error al duplicar');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-100 shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Duplicar ticket"><path d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /><circle cx="8" cy="12" r="1" /><circle cx="16" cy="12" r="1" /></svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Duplicar Tipo de Entrada</h2>
          <p className="text-sm text-gray-500 mt-1">Ajusta los datos y confirma para crear una copia.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Cerrar modal">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Tarjeta de información del original */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-blue-100 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-1 text-sm">Original: {ticket.nombre_tipo || ticket.name}</h3>
        <div className="flex flex-wrap gap-4 text-xs text-gray-700">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Precio:</span>
            <span className="font-semibold">${ticket.precio ?? ticket.price}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Disponibles:</span>
            <span>
              {ticket.cantidad_disponible ?? ticket.available} / {ticket.cantidad_maxima ?? ((ticket.available ?? 0) + (ticket.sold ?? 0))}
            </span>
          </span>
        </div>
      </div>

      {/* Formulario editable */}
      <form className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Tipo de Entrada</label>
            <input
              name="nombre_tipo"
              value={formData.nombre_tipo}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Nombre"
              required
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
            <input
              name="precio"
              type="number"
              value={formData.precio}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Precio"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Máxima</label>
            <input
              name="cantidad_maxima"
              type="number"
              value={formData.cantidad_maxima}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Cantidad máxima"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Disponible</label>
            <input
              name="cantidad_disponible"
              type="number"
              value={formData.cantidad_disponible}
              onChange={handleChange}
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-blue-400"
              placeholder="Cantidad disponible"
              min="0"
              required
            />
          </div>
        </div>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-800">
            <p className="font-medium">Se creará un nuevo tipo de entrada con estos datos.</p>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 bg-gray-200 rounded font-medium text-gray-700 hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={onClose}>Cancelar</button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleDuplicate} disabled={loading}>{loading ? 'Duplicando...' : 'Duplicar'}</button>
      </div>
    </Modal>
  );
};