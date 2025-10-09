import React from 'react';
import { TrendingUp, Calendar, Users, DollarSign, Eye, Target } from 'lucide-react';
import { formatRevenue } from '@shared/lib/utils/Currency.utils';

export function TrendsDashboardSimple() {
  console.log('TrendsDashboardSimple se está renderizando');
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Análisis de Tendencias</h2>
          <p className="text-gray-600 mt-1">
            Visualiza el rendimiento de tus eventos a lo largo del tiempo
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Eventos</p>
              <p className="text-2xl font-bold text-blue-900">12</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-900">{formatRevenue(45650000)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-sm">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-700">Total Asistentes</p>
              <p className="text-2xl font-bold text-orange-900">1,250</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Visualizaciones</p>
              <p className="text-2xl font-bold text-purple-900">2,450</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Eye className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-700">Conversión</p>
              <p className="text-2xl font-bold text-red-900">24.8%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico simple */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl border border-white/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencia de Ingresos</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Gráfico de tendencias</p>
            <p className="text-sm text-gray-500">Datos en tiempo real</p>
          </div>
        </div>
      </div>

      {/* Mensaje de debug */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          ✅ TrendsDashboard se está renderizando correctamente
        </p>
      </div>
    </div>
  );
}
