import React, { useState } from 'react';
import { Modal } from '@shared/ui';
import { TicketTypeService } from '@shared/lib/api/services/TicketType.service';

export const DeleteTicketModal = ({ isOpen, onClose, ticket, onDelete }: { isOpen: boolean; onClose: () => void; ticket: any; onDelete: () => void }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await TicketTypeService.eliminarTipoEntrada(ticket.id);
      onDelete();
      onClose();
    } catch (err) {
      alert('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };

  if (!ticket) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="flex items-start space-x-4 mb-6 animate-fade-in">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-red-100 to-red-300 shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-red-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Eliminar ticket"><path d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /><circle cx="8" cy="12" r="1" /><circle cx="16" cy="12" r="1" /></svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">¿Eliminar Entrada?</h2>
          <p className="text-sm text-gray-500 mt-1">Esta acción no se puede deshacer.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400" aria-label="Cerrar modal">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-red-50 rounded-xl p-4 mb-6 border border-red-100 shadow-sm">
        <h3 className="font-bold text-red-900 mb-1 text-lg">{ticket.nombre_tipo}</h3>
        <div className="text-sm text-gray-800 mb-2">{ticket.descripcion}</div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
          <span className="font-medium text-red-700">Precio:</span> <span className="font-semibold">${ticket.precio}</span>
          <span className="font-medium text-red-700">Disponibles:</span> <span>{ticket.cantidad_disponible} / {ticket.cantidad_maxima}</span>
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <button className="px-4 py-2 bg-gray-200 rounded font-medium text-gray-700 hover:bg-gray-300 transition focus:outline-none focus:ring-2 focus:ring-red-400" onClick={onClose}>Cancelar</button>
        <button className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400" onClick={handleDelete} disabled={loading}>{loading ? 'Eliminando...' : 'Eliminar'}</button>
      </div>
    </Modal>
  );
};