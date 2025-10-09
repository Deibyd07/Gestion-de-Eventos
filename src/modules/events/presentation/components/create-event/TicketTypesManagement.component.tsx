import React from 'react';
import { Plus, Minus, X, DollarSign } from 'lucide-react';
import { formatPriceDisplay } from '@shared/lib/utils/Currency.utils';

interface TicketTypeForm {
  name: string;
  price: number;
  description: string;
  maxQuantity: number;
}

interface TicketTypesManagementProps {
  ticketTypes: TicketTypeForm[];
  setTicketTypes: (types: TicketTypeForm[]) => void;
  addTicketType: () => void;
  removeTicketType: (index: number) => void;
  updateTicketType: (index: number, field: keyof TicketTypeForm, value: string | number) => void;
  errors: any;
}

export const TicketTypesManagement: React.FC<TicketTypesManagementProps> = ({
  ticketTypes,
  setTicketTypes,
  addTicketType,
  removeTicketType,
  updateTicketType,
  errors
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Tipos de Entrada</h3>
        <button
          type="button"
          onClick={addTicketType}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Tipo
        </button>
      </div>

      {errors.ticketTypes && (
        <p className="text-sm text-red-600">{errors.ticketTypes.message}</p>
      )}

      <div className="space-y-4">
        {ticketTypes.map((ticketType, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-900">
                Tipo de Entrada #{index + 1}
              </h4>
              {ticketTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeTicketType(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre del Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Tipo *
                </label>
                <input
                  type="text"
                  value={ticketType.name}
                  onChange={(e) => updateTicketType(index, 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: General, VIP, Early Bird"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="inline w-4 h-4 mr-2" />
                  Precio (COP) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={ticketType.price}
                  onChange={(e) => updateTicketType(index, 'price', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
                {ticketType.price > 0 && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatPriceDisplay(ticketType.price)}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={ticketType.description}
                  onChange={(e) => updateTicketType(index, 'description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Incluye acceso a todas las actividades"
                />
              </div>

              {/* Cantidad Máxima */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Máxima *
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => updateTicketType(index, 'maxQuantity', Math.max(1, ticketType.maxQuantity - 1))}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={ticketType.maxQuantity}
                    onChange={(e) => updateTicketType(index, 'maxQuantity', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  />
                  <button
                    type="button"
                    onClick={() => updateTicketType(index, 'maxQuantity', ticketType.maxQuantity + 1)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de Tipos de Entrada */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-md font-medium text-blue-900 mb-2">Resumen de Entradas</h4>
        <div className="space-y-2">
          {ticketTypes.map((ticketType, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-blue-800">
                {ticketType.name || `Tipo ${index + 1}`}
              </span>
              <span className="text-blue-900 font-medium">
                {formatPriceDisplay(ticketType.price)} x {ticketType.maxQuantity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
