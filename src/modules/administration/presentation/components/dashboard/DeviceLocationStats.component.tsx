import React, { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { AllLocationsModal } from './AllLocationsModal.component';

interface DeviceLocationStatsProps {
  deviceStats: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  locationStats: Record<string, number>;
}

export const DeviceLocationStats: React.FC<DeviceLocationStatsProps> = ({
  deviceStats,
  locationStats
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Device Statistics */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispositivos</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700">Desktop</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${deviceStats.desktop}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{deviceStats.desktop}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-700">Mobile</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: `${deviceStats.mobile}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{deviceStats.mobile}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-700">Tablet</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${deviceStats.tablet}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900">{deviceStats.tablet}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Statistics */}
      <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Ubicaciones</h3>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all"
          >
            Ver todas
          </button>
        </div>
        <div className="space-y-4">
          {Object.keys(locationStats).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-gray-500">No hay datos de ubicaciones</p>
            </div>
          ) : (
            Object.entries(locationStats).map(([location, percentage]) => (
              <div key={location} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{location}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{percentage}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    <AllLocationsModal 
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  </>
  );
};
