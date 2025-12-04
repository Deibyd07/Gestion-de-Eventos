import React, { useState } from 'react';
import { UserPlus, CalendarPlus, CreditCard, AlertTriangle } from 'lucide-react';
import { AllActivitiesModal } from './AllActivitiesModal.component';

interface ActivityItem {
  id: string;
  type: 'user_registration' | 'event_created' | 'payment_received' | 'system_alert';
  description: string;
  timestamp: string;
  severity?: 'low' | 'medium' | 'high';
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
          >
            Ver todas
          </button>
        </div>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No hay actividad reciente</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                  {activity.type === 'user_registration' && <UserPlus className="w-4 h-4" />}
                  {activity.type === 'event_created' && <CalendarPlus className="w-4 h-4" />}
                  {activity.type === 'payment_received' && <CreditCard className="w-4 h-4" />}
                  {activity.type === 'system_alert' && <AlertTriangle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AllActivitiesModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
