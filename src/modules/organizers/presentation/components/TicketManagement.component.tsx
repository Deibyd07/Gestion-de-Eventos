import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  Star,
  Clock,
  DollarSign,
  Users,
  Percent,
  Shield,
  AlertCircle,
  CheckCircle,
  Copy as CopyIcon,
  Settings,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  available: number;
  sold: number;
  type: 'general' | 'vip' | 'early_bird' | 'student' | 'group';
  isActive: boolean;
  salesStartDate?: string;
  salesEndDate?: string;
  maxPerUser?: number;
  features: string[];
  eventId: string;
}

interface TicketManagementProps {
  tickets: TicketType[];
  onCreateTicket: () => void;
  onEditTicket: (ticketId: string) => void;
  onDeleteTicket: (ticketId: string) => void;
  onDuplicateTicket: (ticketId: string) => void;
  onToggleTicket: (ticketId: string) => void;
  onViewAnalytics: (ticketId: string) => void;
}

export const TicketManagement: React.FC<TicketManagementProps> = ({
  tickets,
  onCreateTicket,
  onEditTicket,
  onDeleteTicket,
  onDuplicateTicket,
  onToggleTicket,
  onViewAnalytics
}) => {
  const [filterType, setFilterType] = useState<'all' | 'general' | 'vip' | 'early_bird' | 'student' | 'group'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vip': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'early_bird': return 'bg-green-100 text-green-800 border-green-200';
      case 'student': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'group': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vip': return Star;
      case 'early_bird': return Clock;
      case 'student': return Users;
      case 'group': return Users;
      default: return Ticket;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'vip': return 'VIP';
      case 'early_bird': return 'Early Bird';
      case 'student': return 'Estudiante';
      case 'group': return 'Grupo';
      default: return 'General';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesType = filterType === 'all' || ticket.type === filterType;
    const matchesSearch = ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalRevenue = tickets.reduce((sum, ticket) => {
    const ticketRevenue = (ticket as any).revenue ?? (ticket.price * ticket.sold);
    return sum + ticketRevenue;
  }, 0);
  const totalSold = tickets.reduce((sum, ticket) => sum + ticket.sold, 0);
  const totalAvailable = tickets.reduce((sum, ticket) => sum + ticket.available, 0);

  // Contar tipos de entrada únicos (general, VIP, estudiante, etc.)
  const uniqueTicketTypes = new Set(tickets.map(t => t.type || 'general')).size;
  const activeUniqueTypes = new Set(tickets.filter(t => t.isActive).map(t => t.type || 'general')).size;

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* Header removed - using parent header */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vendidas</p>
              <p className="text-2xl font-bold text-gray-900">{totalSold}</p>
              <p className="text-sm text-blue-600">{totalAvailable} disponibles</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tipos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{activeUniqueTypes}</p>
              <p className="text-sm text-purple-600">de {uniqueTicketTypes} totales</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Buscar Entradas</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="general">General</option>
              <option value="vip">VIP</option>
              <option value="early_bird">Early Bird</option>
              <option value="student">Estudiante</option>
              <option value="group">Grupo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {filteredTickets.map((ticket) => {
          const TypeIcon = getTypeIcon(ticket.type);
          const salesPercentage = ticket.available > 0 ? (ticket.sold / (ticket.available + ticket.sold)) * 100 : 0;

          return (
            <div key={ticket.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl hover:shadow-2xl transition-all duration-200">
              {/* Ticket Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(ticket.type)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(ticket.type)}`}>
                        {getTypeText(ticket.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onToggleTicket(ticket.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${ticket.isActive
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      title={ticket.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {ticket.isActive ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{ticket.description}</p>

                {/* Price and Discount */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(ticket.price)}</span>
                    {ticket.originalPrice && ticket.originalPrice > ticket.price && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 line-through">{formatCurrency(ticket.originalPrice)}</span>
                        <span className="text-sm text-green-600 font-medium">
                          -{Math.round(((ticket.originalPrice - ticket.price) / ticket.originalPrice) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  {ticket.maxPerUser && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Límite por usuario</p>
                      <p className="text-sm font-medium text-gray-900">{ticket.maxPerUser}</p>
                    </div>
                  )}
                </div>

                {/* Sales Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Vendidas: {ticket.sold}</span>
                    <span>{salesPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(salesPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Features */}
                {ticket.features && ticket.features.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Incluye:</h5>
                    <div className="flex flex-wrap gap-1">
                      {ticket.features.slice(0, 3).map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {feature}
                        </span>
                      ))}
                      {ticket.features.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{ticket.features.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Sales Dates */}
                {(ticket.salesStartDate || ticket.salesEndDate) && (
                  <div className="mb-4 text-xs text-gray-500">
                    {ticket.salesStartDate && (
                      <p>Ventas desde: {new Date(ticket.salesStartDate).toLocaleDateString('es-ES')}</p>
                    )}
                    {ticket.salesEndDate && (
                      <p>Ventas hasta: {new Date(ticket.salesEndDate).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{ticket.sold}</p>
                    <p className="text-xs text-gray-600">Vendidas</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency((ticket as any).revenue ?? (ticket.price * ticket.sold))}</p>
                    <p className="text-xs text-gray-600">Ingresos</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewAnalytics(ticket.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs md:text-sm rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Ver
                  </button>
                  <button
                    onClick={() => onEditTicket(ticket.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDuplicateTicket(ticket.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs md:text-sm rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                    title="Duplicar entrada"
                  >
                    <CopyIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Duplicar</span>
                  </button>
                  <button
                    onClick={() => onDeleteTicket(ticket.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    title="Eliminar entrada"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tipos de entrada</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all'
              ? 'No se encontraron entradas que coincidan con los filtros aplicados.'
              : 'Comienza creando tu primer tipo de entrada.'
            }
          </p>
          <button
            onClick={onCreateTicket}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Tipo de Entrada
          </button>
        </div>
      )}
    </div>
  );
};
