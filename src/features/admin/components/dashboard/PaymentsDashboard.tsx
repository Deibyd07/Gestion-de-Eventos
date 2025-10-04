import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  MoreVertical,
  Calendar,
  Users,
  Activity,
  Shield,
  Zap,
  Target,
  Award,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

export const PaymentsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'methods'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Datos de ejemplo
  const paymentsData = {
    overview: {
      totalRevenue: 125000000,
      monthlyRevenue: 15000000,
      pendingPayments: 2500000,
      failedPayments: 500000,
      avgTransactionValue: 45000,
      totalTransactions: 3247,
      successRate: 96.5,
      growth: {
        revenue: 15.2,
        transactions: 8.7,
        successRate: 2.1
      }
    },
    transactions: [
      {
        id: '1',
        amount: 150000,
        currency: 'COP',
        status: 'completed',
        method: 'credit_card',
        customer: 'Juan Pérez',
        event: 'Feria Agropecuaria Zarzal 2024',
        date: '2024-11-28T10:30:00Z',
        fee: 4500,
        netAmount: 145500,
        reference: 'TXN-001234'
      },
      {
        id: '2',
        amount: 75000,
        currency: 'COP',
        status: 'pending',
        method: 'bank_transfer',
        customer: 'Ana López',
        event: 'Workshop de React Avanzado',
        date: '2024-11-28T09:15:00Z',
        fee: 2250,
        netAmount: 72750,
        reference: 'TXN-001235'
      },
      {
        id: '3',
        amount: 50000,
        currency: 'COP',
        status: 'failed',
        method: 'credit_card',
        customer: 'Carlos Ruiz',
        event: 'Festival de Música Vallenata',
        date: '2024-11-28T08:45:00Z',
        fee: 1500,
        netAmount: 0,
        reference: 'TXN-001236'
      },
      {
        id: '4',
        amount: 200000,
        currency: 'COP',
        status: 'completed',
        method: 'paypal',
        customer: 'María García',
        event: 'Conferencia de Emprendimiento',
        date: '2024-11-27T16:20:00Z',
        fee: 6000,
        netAmount: 194000,
        reference: 'TXN-001237'
      },
      {
        id: '5',
        amount: 300000,
        currency: 'COP',
        status: 'completed',
        method: 'credit_card',
        customer: 'Pedro Martínez',
        event: 'Evento Premium 2024',
        date: '2024-11-27T14:30:00Z',
        fee: 9000,
        netAmount: 291000,
        reference: 'TXN-001238'
      }
    ],
    paymentMethods: [
      {
        name: 'Tarjeta de Crédito',
        percentage: 65,
        transactions: 2109,
        revenue: 81250000,
        icon: CreditCard,
        color: 'text-blue-600 bg-blue-100'
      },
      {
        name: 'Transferencia Bancaria',
        percentage: 25,
        transactions: 812,
        revenue: 31250000,
        icon: Activity,
        color: 'text-green-600 bg-green-100'
      },
      {
        name: 'PayPal',
        percentage: 8,
        transactions: 260,
        revenue: 10000000,
        icon: Globe,
        color: 'text-purple-600 bg-purple-100'
      },
      {
        name: 'PSE',
        percentage: 2,
        transactions: 66,
        revenue: 2500000,
        icon: Shield,
        color: 'text-orange-600 bg-orange-100'
      }
    ]
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'pending': return 'Pendiente';
      case 'failed': return 'Fallido';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Tarjeta de Crédito';
      case 'bank_transfer': return 'Transferencia Bancaria';
      case 'paypal': return 'PayPal';
      case 'pse': return 'PSE';
      default: return 'Desconocido';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'transactions', label: 'Transacciones', icon: CreditCard },
    { id: 'methods', label: 'Métodos', icon: Activity },
  ];

  return (
    <div className="p-4 space-y-2">
      {/* Controls */}
      <div className="flex justify-end items-center">
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm">
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Ingresos Totales</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(paymentsData.overview.totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-sm text-green-700 font-medium">+{paymentsData.overview.growth.revenue}%</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-sm">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Transacciones</p>
              <p className="text-3xl font-bold text-blue-900">{paymentsData.overview.totalTransactions.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-sm text-blue-700 font-medium">+{paymentsData.overview.growth.transactions}%</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Tasa de Éxito</p>
              <p className="text-3xl font-bold text-purple-900">{paymentsData.overview.successRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">+{paymentsData.overview.growth.successRate}%</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-sm">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700">Valor Promedio</p>
              <p className="text-3xl font-bold text-emerald-900">{formatCurrency(paymentsData.overview.avgTransactionValue)}</p>
              <div className="flex items-center mt-2">
                <Target className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600 font-medium">Por transacción</span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-2">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Pagos Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatCurrency(paymentsData.overview.pendingPayments)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl shadow-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">Pagos Fallidos</p>
                  <p className="text-2xl font-bold text-red-900">{formatCurrency(paymentsData.overview.failedPayments)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-sm">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Ingresos Mensuales</p>
                  <p className="text-2xl font-bold text-emerald-900">{formatCurrency(paymentsData.overview.monthlyRevenue)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-sm">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">Métodos de Pago</h3>
              </div>
              <div className="space-y-4">
                {paymentsData.paymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${method.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.transactions} transacciones</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${method.percentage}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{method.percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-blue-200 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">Ingresos por Método</h3>
              </div>
              <div className="space-y-4">
                {paymentsData.paymentMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${method.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{method.name}</p>
                          <p className="text-xs text-gray-500">{method.transactions} transacciones</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${(method.revenue / paymentsData.overview.totalRevenue) * 100}%` }}></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(method.revenue)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar transacciones..."
                  className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="completed">Completadas</option>
                <option value="pending">Pendientes</option>
                <option value="failed">Fallidas</option>
                <option value="cancelled">Canceladas</option>
              </select>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
                <Filter className="w-4 h-4" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paymentsData.transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{transaction.reference}</div>
                          <div className="text-xs text-gray-500">ID: {transaction.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.customer}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.event}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                          {transaction.fee > 0 && (
                            <div className="text-xs text-gray-500">Comisión: {formatCurrency(transaction.fee)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{getMethodText(transaction.method)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusText(transaction.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{formatDate(transaction.date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Methods Tab */}
      {activeTab === 'methods' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {paymentsData.paymentMethods.map((method, index) => {
              const Icon = method.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${method.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{method.percentage}%</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transacciones:</span>
                      <span className="font-medium">{method.transactions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ingresos:</span>
                      <span className="font-medium">{formatCurrency(method.revenue)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${method.percentage}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentsDashboard;