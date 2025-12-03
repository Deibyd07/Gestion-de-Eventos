import React, { useState, useEffect } from 'react';
import { X, MapPin, RefreshCw, TrendingUp } from 'lucide-react';
import { LocationStatsService, LocationStat } from '@shared/lib/api/services/LocationStats.service';

interface AllLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AllLocationsModal: React.FC<AllLocationsModalProps> = ({ 
  isOpen, 
  onClose
}) => {
  const [locations, setLocations] = useState<LocationStat[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLocations();
    }
  }, [isOpen]);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const data = await LocationStatsService.getAllLocationStats();
      setLocations(data);
    } catch (error) {
      console.error('Error al cargar ubicaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getColorByRank = (index: number, total: number) => {
    const percentage = (index / total) * 100;
    if (percentage < 20) return 'from-green-500 to-emerald-600';
    if (percentage < 40) return 'from-blue-500 to-cyan-600';
    if (percentage < 60) return 'from-purple-500 to-violet-600';
    if (percentage < 80) return 'from-orange-500 to-amber-600';
    return 'from-gray-500 to-slate-600';
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <MapPin className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Estadísticas de Ubicaciones</h2>
                <p className="text-sm text-gray-600 mt-1">Distribución de eventos por ubicación</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadLocations}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay ubicaciones registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((location, index) => (
                  <div
                    key={location.location}
                    className="flex items-center justify-between p-4 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={`w-10 h-10 bg-gradient-to-r ${getColorByRank(index, locations.length)} rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate">{location.location}</p>
                        <p className="text-sm text-gray-600">{location.count} {location.count === 1 ? 'evento' : 'eventos'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-48 bg-gray-200 rounded-full h-3">
                        <div 
                          className={`bg-gradient-to-r ${getColorByRank(index, locations.length)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${location.percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-lg font-bold text-blue-600">{location.percentage}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <p className="text-sm text-gray-600">
              {locations.length > 0 ? (
                <>
                  Mostrando {locations.length} {locations.length === 1 ? 'ubicación' : 'ubicaciones'} • 
                  Total de eventos: {locations.reduce((sum, loc) => sum + loc.count, 0)}
                </>
              ) : (
                'No hay datos disponibles'
              )}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
