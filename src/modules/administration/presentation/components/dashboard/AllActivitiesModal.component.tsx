import React, { useState, useEffect } from 'react';
import { X, UserPlus, CalendarPlus, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { RecentActivityService, RecentActivityItem } from '@shared/lib/api/services/RecentActivity.service';

interface AllActivitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AllActivitiesModal: React.FC<AllActivitiesModalProps> = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [limit, setLimit] = useState(50);

  useEffect(() => {
    if (isOpen) {
      loadActivities();
    }
  }, [isOpen, limit]);

  const loadActivities = async () => {
    setIsLoading(true);
    try {
      const data = await RecentActivityService.getRecentActivities(limit);
      const formattedActivities = data.map(activity => ({
        ...activity,
        timestamp: RecentActivityService.formatTimestamp(activity.timestamp)
      }));
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="w-4 h-4" />;
      case 'event_created':
        return <CalendarPlus className="w-4 h-4" />;
      case 'payment_received':
        return <CreditCard className="w-4 h-4" />;
      case 'system_alert':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
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
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Toda la Actividad</h2>
              <p className="text-sm text-gray-600 mt-1">Historial completo de actividades del sistema</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadActivities}
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
            ) : activities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay actividades registradas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className={`p-2 rounded-lg flex-shrink-0 ${getSeverityColor(activity.severity)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <p className="text-sm text-gray-600">
              Mostrando {activities.length} {activities.length === 1 ? 'actividad' : 'actividades'}
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLimit(50)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  limit === 50
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Últimas 50
              </button>
              <button
                onClick={() => setLimit(100)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  limit === 100
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Últimas 100
              </button>
              <button
                onClick={() => setLimit(200)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  limit === 200
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Últimas 200
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
