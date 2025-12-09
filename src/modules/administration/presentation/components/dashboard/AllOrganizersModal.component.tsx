import React, { useState, useEffect } from 'react';
import { X, Star, Trophy, RefreshCw, TrendingUp } from 'lucide-react';
import { TopOrganizersService, TopOrganizer } from '@shared/lib/api/services/TopOrganizers.service';

interface AllOrganizersModalProps {
  isOpen: boolean;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
}

export const AllOrganizersModal: React.FC<AllOrganizersModalProps> = ({ 
  isOpen, 
  onClose,
  formatCurrency 
}) => {
  const [organizers, setOrganizers] = useState<TopOrganizer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (isOpen) {
      loadOrganizers();
    }
  }, [isOpen, limit]);

  const loadOrganizers = async () => {
    setIsLoading(true);
    try {
      const data = await TopOrganizersService.getAllOrganizersRanking(limit);
      setOrganizers(data);
    } catch (error) {
      console.error('Error al cargar organizadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'; // Oro
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'; // Plata
      case 2:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white'; // Bronce
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ranking de Organizadores</h2>
                <p className="text-sm text-gray-600 mt-1">Ordenados por ingresos generados</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadOrganizers}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                title="Actualizar"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/50 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : organizers.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay organizadores registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {organizers.map((organizer, index) => (
                  <div
                    key={organizer.id}
                    className={`group flex items-center justify-between p-5 rounded-2xl transition-all duration-200 border ${
                      index < 3
                        ? 'bg-white/80 backdrop-blur-sm border-white/40 shadow-lg hover:shadow-xl'
                        : 'bg-white/60 backdrop-blur-sm hover:bg-white/80 border-white/30 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${getMedalColor(index)} text-white rounded-2xl flex items-center justify-center font-bold text-base shadow-lg`}>
                        {index < 3 ? <Trophy className="w-6 h-6" /> : index + 1}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{organizer.name}</p>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                            {organizer.events} {organizer.events === 1 ? 'evento' : 'eventos'}
                          </span>
                          {!!organizer.rating && organizer.rating > 0 && (
                            <div className="flex items-center bg-yellow-50 px-2.5 py-0.5 rounded-lg">
                              <Star className="w-3.5 h-3.5 text-yellow-500 mr-1 fill-yellow-500" />
                              <span className="text-xs font-semibold text-yellow-700">{organizer.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(organizer.revenue)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-medium">Ingresos totales</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <p className="text-sm text-gray-600">
              Mostrando {organizers.length} {organizers.length === 1 ? 'organizador' : 'organizadores'}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLimit(20)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  limit === 20
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Top 20
              </button>
              <button
                onClick={() => setLimit(50)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  limit === 50
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Top 50
              </button>
              <button
                onClick={() => setLimit(100)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  limit === 100
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Top 100
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
