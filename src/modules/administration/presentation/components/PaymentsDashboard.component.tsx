import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  RefreshCw,
  Filter,
  Search,
  Eye,
  MoreVertical,
  Activity,
  Shield,
  Target,
  BarChart3,
  Globe,
  Copy,
  Check,
  X,
  User,
  Calendar
} from 'lucide-react';
import { FinanceService, PaymentMethod, Transaction } from '@shared/lib/api/services/Finance.service';

export const PaymentsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'methods'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [isEditMethodModalOpen, setIsEditMethodModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [paymentsData, setPaymentsData] = useState({
    overview: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      pendingPayments: 0,
      failedPayments: 0,
      avgTransactionValue: 0,
      totalTransactions: 0,
      successRate: 0,
      growth: {
        revenue: 0,
        transactions: 0,
        successRate: 0
      }
    }
  });


  // Cargar datos al montar el componente
  useEffect(() => {
    loadFinanceData();
  }, []);

  // Manejar tecla Escape para cerrar modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeTransactionModal();
      }
      if (event.key === 'Escape' && isEditMethodModalOpen) {
        closeEditMethodModal();
      }
      if (event.key === 'Escape' && isDeleteConfirmOpen) {
        closeDeleteConfirm();
      }
    };

    if (isModalOpen || isEditMethodModalOpen || isDeleteConfirmOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, isEditMethodModalOpen, isDeleteConfirmOpen]);

  const loadFinanceData = async () => {
    try {
      setIsLoading(true);
      const [financeData, methods, transactionsList] = await Promise.all([
        FinanceService.getFinanceOverview(),
        FinanceService.getPaymentMethods(),
        FinanceService.getTransactions(100, 0)
      ]);
      
      setPaymentsData(prev => ({
        ...prev,
        overview: financeData
      }));
      
      setPaymentMethods(methods);
      setTransactions(transactionsList);
    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadFinanceData();
  };

  const getPaymentMethodIcon = (tipo: string) => {
    const lowerTipo = tipo.toLowerCase();
    if (lowerTipo.includes('tarjeta') || lowerTipo.includes('card') || lowerTipo.includes('credito') || lowerTipo.includes('debito')) {
      return { icon: CreditCard, color: 'text-blue-600 bg-blue-100' };
    } else if (lowerTipo.includes('transferencia') || lowerTipo.includes('transfer') || lowerTipo.includes('bancari')) {
      return { icon: Activity, color: 'text-green-600 bg-green-100' };
    } else if (lowerTipo.includes('paypal')) {
      return { icon: Globe, color: 'text-purple-600 bg-purple-100' };
    } else if (lowerTipo.includes('pse')) {
      return { icon: Shield, color: 'text-orange-600 bg-orange-100' };
    } else if (lowerTipo.includes('efectivo') || lowerTipo.includes('cash')) {
      return { icon: DollarSign, color: 'text-emerald-600 bg-emerald-100' };
    } else {
      return { icon: CreditCard, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const formatOrderNumber = (orderNumber: string) => {
    if (!orderNumber) return 'N/A';
    return orderNumber.substring(0, 5);
  };

  const copyToClipboard = async (text: string, orderId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOrderId(orderId);
      setTimeout(() => setCopiedOrderId(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const openTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeTransactionModal = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  const openEditMethodModal = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setIsEditMethodModalOpen(true);
  };

  const closeEditMethodModal = () => {
    setSelectedMethod(null);
    setIsEditMethodModalOpen(false);
  };

  const openDeleteConfirm = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setMethodToDelete(null);
    setIsDeleteConfirmOpen(false);
  };

  const handleUpdateMethod = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedMethod) return;

    const formData = new FormData(event.currentTarget);
    const data = {
      nombre: formData.get('nombre') as string,
      tipo: formData.get('tipo') as string,
      activo: formData.get('activo') === 'true'
    };

    const success = await FinanceService.updatePaymentMethod(selectedMethod.id, data);
    
    if (success) {
      await loadFinanceData();
      closeEditMethodModal();
    } else {
      alert('Error al actualizar el método de pago');
    }
  };

  const handleDeleteMethod = async () => {
    if (!methodToDelete) return;

    const result = await FinanceService.deletePaymentMethod(methodToDelete.id);
    
    if (result.success) {
      await loadFinanceData();
      closeDeleteConfirm();
    } else {
      alert(result.message);
      closeDeleteConfirm();
    }
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
      case 'completada': return 'text-green-600 bg-green-100';
      case 'pendiente': return 'text-yellow-600 bg-yellow-100';
      case 'fallida': return 'text-red-600 bg-red-100';
      case 'cancelada': return 'text-gray-600 bg-gray-100';
      case 'procesando': return 'text-blue-600 bg-blue-100';
      case 'reembolsada': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completada': return 'Completada';
      case 'pendiente': return 'Pendiente';
      case 'fallida': return 'Fallida';
      case 'cancelada': return 'Cancelada';
      case 'procesando': return 'Procesando';
      case 'reembolsada': return 'Reembolsada';
      default: return status;
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

  const filterTransactions = (transactions: Transaction[]) => {
    return transactions.filter(transaction => {
      // Filtro por estado
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
      
      // Filtro por búsqueda
      const matchesSearch = !searchQuery || 
        transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: BarChart3 },
    { id: 'transactions', label: 'Transacciones', icon: CreditCard },
    { id: 'methods', label: 'Métodos', icon: Activity },
  ];

  return (
    <div className="space-y-4 md:space-y-6 w-full max-w-full">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600">Cargando datos financieros...</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-end items-center">
        <div className="flex flex-row-reverse sm:flex-row gap-2 sm:gap-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-green-700 truncate">Ingresos Totales</p>
              <p className="text-lg md:text-2xl font-bold text-green-900">{formatCurrency(paymentsData.overview.totalRevenue)}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className={`w-3 h-3 mr-1 ${paymentsData.overview.growth.revenue >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium ${
                  paymentsData.overview.growth.revenue >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {paymentsData.overview.growth.revenue >= 0 ? '+' : ''}{paymentsData.overview.growth.revenue}%
                </span>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-sm flex-shrink-0">
              <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-blue-700 truncate">Transacciones</p>
              <p className="text-lg md:text-2xl font-bold text-blue-900">{paymentsData.overview.totalTransactions.toLocaleString()}</p>
              <div className="flex items-center mt-1">
                <TrendingUp className={`w-3 h-3 mr-1 ${paymentsData.overview.growth.transactions >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium ${
                  paymentsData.overview.growth.transactions >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {paymentsData.overview.growth.transactions >= 0 ? '+' : ''}{paymentsData.overview.growth.transactions}%
                </span>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm flex-shrink-0">
              <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-purple-700 truncate">Tasa de Éxito</p>
              <p className="text-lg md:text-2xl font-bold text-purple-900">{paymentsData.overview.successRate}%</p>
              <div className="flex items-center mt-1">
                <TrendingUp className={`w-3 h-3 mr-1 ${paymentsData.overview.growth.successRate >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`text-xs font-medium ${
                  paymentsData.overview.growth.successRate >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  {paymentsData.overview.growth.successRate >= 0 ? '+' : ''}{paymentsData.overview.growth.successRate}%
                </span>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-sm flex-shrink-0">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg p-3 sm:p-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm font-medium text-emerald-700 truncate">Valor Promedio</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-900">{formatCurrency(paymentsData.overview.avgTransactionValue)}</p>
              <div className="flex items-center mt-1">
                <Target className="w-3 h-3 text-blue-500 mr-1" />
                <span className="text-xs text-blue-600 font-medium">Por transacción</span>
              </div>
            </div>
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-sm flex-shrink-0">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-2xl p-2">
        <nav className="grid grid-cols-3 sm:flex sm:space-x-1 sm:space-x-2 gap-1 sm:gap-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method, index) => {
                    const { icon: Icon, color } = getPaymentMethodIcon(method.tipo);
                    return (
                      <div key={method.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{method.nombre}</p>
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
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hay métodos de pago registrados</p>
                )}
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
                {paymentMethods.length > 0 ? (
                  paymentMethods.map((method, index) => {
                    const { icon: Icon, color } = getPaymentMethodIcon(method.tipo);
                    const revenuePercentage = paymentsData.overview.totalRevenue > 0 
                      ? (method.revenue / paymentsData.overview.totalRevenue) * 100 
                      : 0;
                    return (
                      <div key={method.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{method.nombre}</p>
                            <p className="text-xs text-gray-500">{method.transactions} transacciones</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${revenuePercentage}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(method.revenue)}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No hay métodos de pago registrados</p>
                )}
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
                  placeholder="Buscar por orden, cliente, evento, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-transparent focus:bg-white/80 transition-all duration-200 shadow-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="completada">Completadas</option>
                <option value="pendiente">Pendientes</option>
                <option value="procesando">Procesando</option>
                <option value="fallida">Fallidas</option>
                <option value="cancelada">Canceladas</option>
                <option value="reembolsada">Reembolsadas</option>
              </select>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                disabled={!searchQuery && statusFilter === 'all'}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                <span>Limpiar</span>
              </button>
            </div>
            {(searchQuery || statusFilter !== 'all') && (
              <div className="mt-3 text-sm text-gray-600">
                Mostrando {filterTransactions(transactions).length} de {transactions.length} transacciones
                {searchQuery && <span className="ml-2 font-medium">· Búsqueda: "{searchQuery}"</span>}
                {statusFilter !== 'all' && <span className="ml-2 font-medium">· Estado: {getStatusText(statusFilter)}</span>}
              </div>
            )}
          </div>

          {/* Transactions List */}
          <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl overflow-hidden">
            {/* Mobile Grid View */}
            <div className="block md:hidden p-4">
              <div className="grid grid-cols-1 gap-3">
                {transactions.length > 0 ? (
                  filterTransactions(transactions).map((transaction) => (
                    <div key={transaction.id} className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:bg-white/70 transition-all duration-200">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-medium text-gray-900">{formatOrderNumber(transaction.reference)}</span>
                              <button 
                                onClick={() => copyToClipboard(transaction.reference, transaction.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Copiar número completo"
                              >
                                {copiedOrderId === transaction.id ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mb-1">ID: {transaction.id.substring(0, 8)}...</div>
                          <div className="text-xs text-gray-600 mb-1">{transaction.customer}</div>
                          <div className="text-xs text-gray-500 truncate mb-2">{transaction.event}</div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                              <div className="text-xs text-gray-500">Método: {transaction.paymentMethod}</div>
                            </div>
                            <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                          </div>
                        </div>
                        <button 
                          onClick={() => openTransactionModal(transaction)}
                          className="px-3 py-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">
                      {transactions.length === 0 
                        ? 'No hay transacciones registradas' 
                        : 'No se encontraron transacciones con los filtros aplicados'}
                    </p>
                    {(searchQuery || statusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setStatusFilter('all');
                        }}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-white/50 backdrop-blur-sm border-b border-white/20">
                  <tr>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transacción</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions.length > 0 ? (
                    filterTransactions(transactions).map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{formatOrderNumber(transaction.reference)}</span>
                              <button 
                                onClick={() => copyToClipboard(transaction.reference, transaction.id)}
                                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                title="Copiar número completo"
                              >
                                {copiedOrderId === transaction.id ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                            <div className="text-xs text-gray-500">ID: {transaction.id.substring(0, 8)}...</div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{transaction.customer}</div>
                            <div className="text-xs text-gray-500">{transaction.customerEmail}</div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm text-gray-900">{transaction.event}</td>
                        <td className="px-3 md:px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                            <div className="text-xs text-gray-500">{transaction.quantity} x {formatCurrency(transaction.unitPrice)}</div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm text-gray-900">{transaction.paymentMethod}</td>
                        <td className="px-3 md:px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {getStatusText(transaction.status)}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm text-gray-900">{formatDate(transaction.date)}</td>
                        <td className="px-3 md:px-6 py-4">
                          <button 
                            onClick={() => openTransactionModal(transaction)}
                            className="px-3 py-1.5 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-3 md:px-6 py-8 text-center">
                        <p className="text-sm text-gray-500">
                          {transactions.length === 0 
                            ? 'No hay transacciones registradas' 
                            : 'No se encontraron transacciones con los filtros aplicados'}
                        </p>
                        {(searchQuery || statusFilter !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setStatusFilter('all');
                            }}
                            className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
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
            {paymentMethods.length > 0 ? (
              paymentMethods.map((method) => {
                const { icon: Icon, color } = getPaymentMethodIcon(method.tipo);
                return (
                  <div key={method.id} className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{method.percentage}%</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.nombre}</h3>
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
                    
                    {/* Botones de acción */}
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => openEditMethodModal(method)}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(method)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <p className="text-sm text-gray-500 text-center py-8">No hay métodos de pago registrados</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Detalle de Transacción */}
      {isModalOpen && selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Detalles de Transacción</h3>
              <button
                onClick={closeTransactionModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Estado y Número de Orden */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Número de Orden</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-lg font-bold text-gray-900">{selectedTransaction.reference}</p>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction.reference, selectedTransaction.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {copiedOrderId === selectedTransaction.id ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedTransaction.status)}`}>
                  {getStatusText(selectedTransaction.status)}
                </span>
              </div>

              {/* Grid de Información */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Información del Cliente */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Información del Cliente
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Nombre</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTransaction.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Correo Electrónico</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTransaction.customerEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Evento */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Información del Evento
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Evento</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTransaction.event}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">ID del Evento</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-mono text-gray-900 break-all">{selectedTransaction.eventId}</p>
                        <button
                          onClick={() => copyToClipboard(selectedTransaction.eventId, `${selectedTransaction.id}-event`)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                        >
                          {copiedOrderId === `${selectedTransaction.id}-event` ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalles de Pago */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Detalles de Pago
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Cantidad</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedTransaction.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Precio Unitario</p>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(selectedTransaction.unitPrice)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Total Pagado</p>
                    <p className="text-xl font-bold text-purple-600">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Método de Pago</p>
                    <p className="text-sm font-medium text-gray-900">{selectedTransaction.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-500">ID de Transacción</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-900">{selectedTransaction.id.substring(0, 16)}...</p>
                    <button
                      onClick={() => copyToClipboard(selectedTransaction.id, `${selectedTransaction.id}-full`)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      {copiedOrderId === `${selectedTransaction.id}-full` ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-500">Fecha de Compra</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeTransactionModal}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición de Método de Pago */}
      {isEditMethodModalOpen && selectedMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Editar Método de Pago</h3>
              <button
                onClick={closeEditMethodModal}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateMethod} className="p-6">
              <div className="space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Método
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={selectedMethod.nombre}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    name="tipo"
                    defaultValue={selectedMethod.tipo}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="credit_card">Tarjeta de Crédito</option>
                    <option value="debit_card">Tarjeta de Débito</option>
                    <option value="digital_wallet">Billetera Digital</option>
                    <option value="bank_transfer">Transferencia Bancaria</option>
                    <option value="cash">Efectivo</option>
                    <option value="crypto">Criptomoneda</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="activo"
                    defaultValue={selectedMethod.activo ? 'true' : 'false'}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeEditMethodModal}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteConfirmOpen && methodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Confirmar Eliminación</h3>
              <button
                onClick={closeDeleteConfirm}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              </div>
              
              <p className="text-center text-gray-700 mb-2">
                ¿Estás seguro de que deseas eliminar el método de pago
              </p>
              <p className="text-center text-lg font-bold text-gray-900 mb-4">
                "{methodToDelete.nombre}"?
              </p>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Solo se puede eliminar si no tiene transacciones asociadas.
                </p>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Transacciones:</p>
                    <p className="font-semibold text-gray-900">{methodToDelete.transactions}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ingresos:</p>
                    <p className="font-semibold text-gray-900">{formatCurrency(methodToDelete.revenue)}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteConfirm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteMethod}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentsDashboard;