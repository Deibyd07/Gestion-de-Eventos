import React from 'react';
import { Modal } from '@shared/ui';

export const ViewTicketModal = ({ isOpen, onClose, ticket }: { isOpen: boolean; onClose: () => void; ticket: any }) => {
  if (!ticket) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false} className="animate-fade-in">
      <div className="flex items-start space-x-4 mb-6">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 shadow-lg flex-shrink-0">
          <svg className="w-7 h-7 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-label="Ticket icon"><path d="M4 8V6a2 2 0 012-2h12a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" /><circle cx="8" cy="12" r="1" /><circle cx="16" cy="12" r="1" /></svg>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">Detalles de la Entrada</h2>
          <p className="text-sm text-gray-500 mt-1">Consulta toda la información relevante de la entrada seleccionada.</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400" aria-label="Cerrar modal">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-blue-100 shadow-sm">
        <h3 className="font-bold text-blue-900 mb-1 text-lg">{ticket.nombre_tipo}</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Evento:</span>
            <span>{ticket.nombre_evento}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Precio:</span>
            <span className="font-semibold">${ticket.precio}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="font-medium text-blue-700">Disponibles:</span>
            <span>{ticket.cantidad_disponible} / {ticket.cantidad_maxima}</span>
          </span>
        </div>
        <div className="text-sm text-gray-800 mb-2">
          <span className="font-medium text-blue-700">Descripción:</span> {ticket.descripcion || <span className="italic text-gray-400">Sin descripción</span>}
        </div>
      </div>
      <div className="flex justify-end">
        <button className="px-5 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
};