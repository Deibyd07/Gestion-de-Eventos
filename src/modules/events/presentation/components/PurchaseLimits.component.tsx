import React, { useState } from 'react';
import { Shield, Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface PurchaseLimit {
  id: string;
  ticketTypeId: string;
  ticketTypeName: string;
  maxPerUser: number;
  maxPerOrder: number;
  timeLimit?: string; // Time limit for purchase (e.g., "24h", "1w")
  restrictions: {
    newUsersOnly: boolean;
    verifiedUsersOnly: boolean;
    locationRestricted: boolean;
    allowedLocations?: string[];
  };
}

interface PurchaseLimitsProps {
  eventId: string;
  ticketTypes: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  onLimitsChange?: (limits: PurchaseLimit[]) => void;
}

export const PurchaseLimits: React.FC<PurchaseLimitsProps> = ({
  eventId,
  ticketTypes,
  onLimitsChange
}) => {
  const [limits, setLimits] = useState<PurchaseLimit[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLimit, setEditingLimit] = useState<PurchaseLimit | null>(null);

  const [newLimit, setNewLimit] = useState({
    ticketTypeId: '',
    maxPerUser: 1,
    maxPerOrder: 1,
    timeLimit: '',
    restrictions: {
      newUsersOnly: false,
      verifiedUsersOnly: false,
      locationRestricted: false,
      allowedLocations: [] as string[]
    }
  });

  const createLimit = () => {
    if (!newLimit.ticketTypeId) {
      alert('Por favor selecciona un tipo de entrada');
      return;
    }

    const selectedTicketType = ticketTypes.find(t => t.id === newLimit.ticketTypeId);
    if (!selectedTicketType) return;

    const limit: PurchaseLimit = {
      id: Date.now().toString(),
      ticketTypeId: newLimit.ticketTypeId,
      ticketTypeName: selectedTicketType.name,
      maxPerUser: newLimit.maxPerUser,
      maxPerOrder: newLimit.maxPerOrder,
      timeLimit: newLimit.timeLimit || undefined,
      restrictions: { ...newLimit.restrictions }
    };

    setLimits([...limits, limit]);
    setNewLimit({
      ticketTypeId: '',
      maxPerUser: 1,
      maxPerOrder: 1,
      timeLimit: '',
      restrictions: {
        newUsersOnly: false,
        verifiedUsersOnly: false,
        locationRestricted: false,
        allowedLocations: []
      }
    });
    setShowCreateForm(false);
    onLimitsChange?.([...limits, limit]);
  };

  const updateLimit = (id: string, updates: Partial<PurchaseLimit>) => {
    const updatedLimits = limits.map(limit =>
      limit.id === id ? { ...limit, ...updates } : limit
    );
    setLimits(updatedLimits);
    onLimitsChange?.(updatedLimits);
  };

  const deleteLimit = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este límite?')) {
      const updatedLimits = limits.filter(limit => limit.id !== id);
      setLimits(updatedLimits);
      onLimitsChange?.(updatedLimits);
    }
  };

  const getRestrictionIcon = (restriction: string) => {
    switch (restriction) {
      case 'newUsersOnly':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'verifiedUsersOnly':
        return <Shield className="w-4 h-4 text-green-500" />;
      case 'locationRestricted':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRestrictionLabel = (restriction: string) => {
    switch (restriction) {
      case 'newUsersOnly':
        return 'Solo usuarios nuevos';
      case 'verifiedUsersOnly':
        return 'Solo usuarios verificados';
      case 'locationRestricted':
        return 'Restricción de ubicación';
      default:
        return restriction;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Límites de Compra</h3>
          <p className="text-sm text-gray-500">Controla cuántas entradas puede comprar cada usuario</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Shield className="w-4 h-4 mr-2" />
          Crear Límite
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Crear Límite de Compra</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Entrada *
              </label>
              <select
                value={newLimit.ticketTypeId}
                onChange={(e) => setNewLimit({ ...newLimit, ticketTypeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un tipo de entrada</option>
                {ticketTypes.map((ticketType) => (
                  <option key={ticketType.id} value={ticketType.id}>
                    {ticketType.name} - ${ticketType.price.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo por Usuario
                </label>
                <input
                  type="number"
                  value={newLimit.maxPerUser}
                  onChange={(e) => setNewLimit({ ...newLimit, maxPerUser: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número máximo de entradas que un usuario puede comprar en total
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo por Orden
                </label>
                <input
                  type="number"
                  value={newLimit.maxPerOrder}
                  onChange={(e) => setNewLimit({ ...newLimit, maxPerOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Número máximo de entradas por transacción
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Límite de Tiempo (Opcional)
              </label>
              <select
                value={newLimit.timeLimit}
                onChange={(e) => setNewLimit({ ...newLimit, timeLimit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sin límite de tiempo</option>
                <option value="1h">1 hora</option>
                <option value="24h">24 horas</option>
                <option value="3d">3 días</option>
                <option value="1w">1 semana</option>
                <option value="2w">2 semanas</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Tiempo máximo para completar la compra una vez iniciada
              </p>
            </div>

            {/* Restrictions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Restricciones Adicionales
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLimit.restrictions.newUsersOnly}
                    onChange={(e) => setNewLimit({
                      ...newLimit,
                      restrictions: { ...newLimit.restrictions, newUsersOnly: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo usuarios nuevos (registrados en los últimos 30 días)</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLimit.restrictions.verifiedUsersOnly}
                    onChange={(e) => setNewLimit({
                      ...newLimit,
                      restrictions: { ...newLimit.restrictions, verifiedUsersOnly: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Solo usuarios verificados</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newLimit.restrictions.locationRestricted}
                    onChange={(e) => setNewLimit({
                      ...newLimit,
                      restrictions: { ...newLimit.restrictions, locationRestricted: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Restricción por ubicación</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={createLimit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Límite
            </button>
          </div>
        </div>
      )}

      {/* Limits List */}
      <div className="space-y-4">
        {limits.map((limit) => (
          <div key={limit.id} className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{limit.ticketTypeName}</h4>
                <p className="text-sm text-gray-500">Límites de compra configurados</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingLimit(limit)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => deleteLimit(limit.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Por Usuario:</span>
                <p className="font-medium">{limit.maxPerUser} entradas</p>
              </div>
              <div>
                <span className="text-gray-500">Por Orden:</span>
                <p className="font-medium">{limit.maxPerOrder} entradas</p>
              </div>
              <div>
                <span className="text-gray-500">Tiempo:</span>
                <p className="font-medium">{limit.timeLimit || 'Sin límite'}</p>
              </div>
              <div>
                <span className="text-gray-500">Restricciones:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {Object.entries(limit.restrictions)
                    .filter(([_, value]) => value === true)
                    .map(([key, _]) => (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                      >
                        {getRestrictionIcon(key)}
                        <span className="ml-1">{getRestrictionLabel(key)}</span>
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {limits.length === 0 && (
          <div className="text-center py-8">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay límites configurados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Crea límites de compra para controlar el acceso a tus entradas.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      {limits.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-blue-500 mr-2" />
            <h4 className="font-medium text-blue-900">Resumen de Límites</h4>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Has configurado {limits.length} límite{limits.length > 1 ? 's' : ''} de compra para {limits.length} tipo{limits.length > 1 ? 's' : ''} de entrada.
            Estos límites ayudarán a prevenir el acaparamiento y asegurar un acceso justo a tus eventos.
          </p>
        </div>
      )}
    </div>
  );
};
