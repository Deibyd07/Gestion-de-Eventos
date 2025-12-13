import React, { useState } from 'react';
import { 
  Percent, 
  Plus, 
  Edit, 
  Trash2, 
  Copy as CopyIcon, 
  Eye, 
  Clock, 
  Shield, 
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Calendar,
  Settings,
  Download,
  Filter,
  Search,
  Timer,
  Target,
  Zap
} from 'lucide-react';

// Función para formatear fechas sin conversión de timezone
const formatDateLocal = (isoDate: string) => {
  if (!isoDate) return '';
  // Extraer solo la parte de fecha si viene con timestamp
  const datePart = isoDate.split('T')[0];
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}/${m}/${y}`;
};

interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed' | 'early_bird';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  applicableEvents: string[];
  applicableTicketTypes: string[];
  maxUsesPerUser?: number;
  isPublic: boolean;
  createdDate: string;
}

interface PromotionManagementProps {
  promotions: Promotion[];
  onCreatePromotion: () => void;
  onEditPromotion: (promotionId: string) => void;
  onDeletePromotion: (promotionId: string) => void;
  onDuplicatePromotion: (promotionId: string) => void;
  onTogglePromotion: (promotionId: string) => void;
  onViewAnalytics: (promotionId: string) => void;
}

export const PromotionManagement: React.FC<PromotionManagementProps> = ({
  promotions,
  onCreatePromotion,
  onEditPromotion,
  onDeletePromotion,
  onDuplicatePromotion,
  onTogglePromotion,
  onViewAnalytics
}) => {
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed' | 'early_bird'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'percentage': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fixed': return 'bg-green-100 text-green-800 border-green-200';
      case 'early_bird': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed': return DollarSign;
      case 'early_bird': return Clock;
      default: return Percent;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'percentage': return 'Porcentaje';
      case 'fixed': return 'Cantidad Fija';
      case 'early_bird': return 'Early Bird';
      default: return 'Descuento';
    }
  };

  const getStatusColor = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) return 'bg-gray-100 text-gray-800 border-gray-200';
    if (now < startDate) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (now > endDate) return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) return 'Inactivo';
    if (now < startDate) return 'Programado';
    if (now > endDate) return 'Expirado';
    return 'Activo';
  };

  const getStatusIcon = (promotion: Promotion) => {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    
    if (!promotion.isActive) return XCircle;
    if (now < startDate) return Clock;
    if (now > endDate) return AlertCircle;
    return CheckCircle;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDiscount = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'percentage':
        return `${promotion.value}%`;
      case 'fixed':
        return formatCurrency(promotion.value);
      case 'early_bird':
        return `${promotion.value}% Early Bird`;
      default:
        return `${promotion.value}%`;
    }
  };

  const filteredPromotions = promotions.filter(promotion => {
    const matchesType = filterType === 'all' || promotion.type === filterType;
    const matchesSearch = promotion.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promotion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus !== 'all') {
      const now = new Date();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      
      switch (filterStatus) {
        case 'active':
          matchesStatus = promotion.isActive && now >= startDate && now <= endDate;
          break;
        case 'inactive':
          matchesStatus = !promotion.isActive;
          break;
        case 'expired':
          matchesStatus = now > endDate;
          break;
      }
    }
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const totalPromotions = promotions.length;
  const activePromotions = promotions.filter(p => {
    const now = new Date();
    const startDate = new Date(p.startDate);
    const endDate = new Date(p.endDate);
    return p.isActive && now >= startDate && now <= endDate;
  }).length;
  const totalUsage = promotions.reduce((sum, p) => sum + p.usedCount, 0);
  
  // Calcular tasa de conversión real basada en límites vs usos
  const totalLimit = promotions.reduce((sum, p) => sum + (p.usageLimit || 0), 0);
  const conversionRate = totalLimit > 0 ? ((totalUsage / totalLimit) * 100).toFixed(1) : '0.0';
  const conversionText = totalLimit > 0 
    ? `${totalUsage} usos de ${totalLimit} disponibles`
    : totalUsage > 0 
      ? `${totalUsage} usos (sin límite)`
      : 'Sin usos registrados';

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* Header removed - using parent header */}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Descuentos</p>
              <p className="text-2xl font-bold text-gray-900">{totalPromotions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Conversión</p>
              <p className="text-2xl font-bold text-gray-900">{conversionRate}%</p>
              <p className="text-sm text-purple-600">{conversionText}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Buscar Descuentos</label>
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
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Fija</option>
              <option value="early_bird">Early Bird</option>
            </select>
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              <option value="expired">Expirados</option>
            </select>
          </div>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {filteredPromotions.map((promotion) => {
          const TypeIcon = getTypeIcon(promotion.type);
          const StatusIcon = getStatusIcon(promotion);
          const usagePercentage = promotion.usageLimit ? (promotion.usedCount / promotion.usageLimit) * 100 : 0;
          
          return (
            <div key={promotion.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl hover:shadow-2xl transition-all duration-200">
              {/* Promotion Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(promotion.type)}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{promotion.name}</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(promotion.type)}">
                        {getTypeText(promotion.type)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(promotion)}`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {getStatusText(promotion)}
                    </span>
                    <button
                      onClick={() => onTogglePromotion(promotion.id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        promotion.isActive 
                          ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={promotion.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {promotion.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Código:</span>
                    <div className="flex items-center space-x-2">
                      <code className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded font-mono">
                        {promotion.code}
                      </code>
                      <button
                        onClick={() => navigator.clipboard.writeText(promotion.code)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                        title="Copiar código"
                      >
                        <CopyIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{promotion.description}</p>
                </div>

                {/* Discount Value */}
                <div className="mb-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Descuento</p>
                    <p className="text-3xl font-bold text-gray-900">{formatDiscount(promotion)}</p>
                    {promotion.minOrderAmount && (
                      <p className="text-xs text-gray-500 mt-1">
                        Mínimo: {formatCurrency(promotion.minOrderAmount)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{promotion.usedCount}</p>
                    <p className="text-xs text-gray-600">Usos</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">
                      {promotion.usageLimit ? `${promotion.usageLimit}` : '∞'}
                    </p>
                    <p className="text-xs text-gray-600">Límite</p>
                  </div>
                </div>

                {/* Usage Progress */}
                {promotion.usageLimit && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Uso</span>
                      <span>{usagePercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Validity Period */}
                <div className="mb-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Válido desde: {formatDateLocal(promotion.startDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4" />
                    <span>Válido hasta: {formatDateLocal(promotion.endDate)}</span>
                  </div>
                </div>

                {/* Limits */}
                {promotion.maxUsesPerUser && (
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Máximo {promotion.maxUsesPerUser} usos por usuario
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onViewAnalytics(promotion.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs md:text-sm rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Ver
                  </button>
                  <button
                    onClick={() => onEditPromotion(promotion.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    Editar
                  </button>
                  <button
                    onClick={() => onDuplicatePromotion(promotion.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-xs md:text-sm rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                    title="Duplicar descuento"
                  >
                    <CopyIcon className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                    <span className="hidden sm:inline">Duplicar</span>
                  </button>
                  <button
                    onClick={() => onDeletePromotion(promotion.id)}
                    className="inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs md:text-sm rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    title="Eliminar descuento"
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
      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <Percent className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay descuentos</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'No se encontraron descuentos que coincidan con los filtros aplicados.'
              : 'Comienza creando tu primer descuento promocional.'
            }
          </p>
          <button
            onClick={onCreatePromotion}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Crear Primer Descuento
          </button>
        </div>
      )}
    </div>
  );
};
