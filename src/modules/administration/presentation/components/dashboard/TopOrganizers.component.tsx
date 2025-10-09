import React from 'react';
import { Star } from 'lucide-react';

interface Organizer {
  id: string;
  name: string;
  events: number;
  revenue: number;
  rating: number;
}

interface TopOrganizersProps {
  organizers: Organizer[];
  formatCurrency: (amount: number) => string;
}

export const TopOrganizers: React.FC<TopOrganizersProps> = ({
  organizers,
  formatCurrency
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-indigo-100/98 backdrop-blur-lg shadow-xl rounded-xl shadow-sm border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Organizadores</h3>
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Ver ranking
        </button>
      </div>
      <div className="space-y-4">
        {organizers.map((organizer, index) => (
          <div key={organizer.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{organizer.name}</p>
                <p className="text-xs text-gray-500">{organizer.events} eventos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{formatCurrency(organizer.revenue)}</p>
              <div className="flex items-center">
                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                <span className="text-xs text-gray-500">{organizer.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
