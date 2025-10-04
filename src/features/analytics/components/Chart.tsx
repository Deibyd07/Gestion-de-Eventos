import { useState } from 'react';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'pie';
  height?: number;
}

export function Chart({ title, data, type = 'bar', height = 200 }: ChartProps) {
  const [activeTab, setActiveTab] = useState(type);

  const maxValue = Math.max(...data.map(d => d.value));

  const getBarHeight = (value: number) => {
    return (value / maxValue) * (height - 40);
  };

  const getPieSlice = (value: number, index: number) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const percentage = (value / total) * 100;
    const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
    const endAngle = startAngle + (value / total) * 360;
    
    return {
      percentage,
      startAngle,
      endAngle
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('bar')}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              activeTab === 'bar' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('line')}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              activeTab === 'line' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('pie')}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              activeTab === 'pie' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="h-64">
        {activeTab === 'bar' && (
          <div className="flex items-end justify-between h-full space-x-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: `${getBarHeight(item.value)}px` }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-t-lg transition-all duration-500 hover:bg-blue-600"
                    style={{ height: '100%' }}
                  />
                </div>
                <div className="mt-2 text-center">
                  <div className="text-xs font-medium text-gray-900">{item.value}</div>
                  <div className="text-xs text-gray-500 truncate max-w-16">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'line' && (
          <div className="relative h-full">
            <svg width="100%" height="100%" className="overflow-visible">
              <polyline
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2"
                points={data.map((item, index) => {
                  const x = (index / (data.length - 1)) * 100;
                  const y = 100 - (item.value / maxValue) * 80;
                  return `${x},${y}`;
                }).join(' ')}
              />
              {data.map((item, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - (item.value / maxValue) * 80;
                return (
                  <circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#3B82F6"
                    className="hover:r-6 transition-all duration-200"
                  />
                );
              })}
            </svg>
            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
              {data.map((item, index) => (
                <span key={index} className="truncate max-w-16">{item.label}</span>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pie' && (
          <div className="flex items-center justify-center h-full">
            <div className="relative w-48 h-48">
              <svg width="100%" height="100%" viewBox="0 0 200 200" className="transform -rotate-90">
                {data.map((item, index) => {
                  const slice = getPieSlice(item.value, index);
                  const radius = 80;
                  const centerX = 100;
                  const centerY = 100;
                  
                  const startAngleRad = (slice.startAngle * Math.PI) / 180;
                  const endAngleRad = (slice.endAngle * Math.PI) / 180;
                  
                  const x1 = centerX + radius * Math.cos(startAngleRad);
                  const y1 = centerY + radius * Math.sin(startAngleRad);
                  const x2 = centerX + radius * Math.cos(endAngleRad);
                  const y2 = centerY + radius * Math.sin(endAngleRad);
                  
                  const largeArcFlag = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      className="hover:opacity-80 transition-opacity duration-200"
                    />
                  );
                })}
              </svg>
            </div>
            <div className="ml-6 space-y-2">
              {data.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)` }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


