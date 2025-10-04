import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPrice } from '../../../../shared/utils/currency';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  subtitle?: string;
  format?: 'number' | 'currency' | 'percentage';
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  subtitle,
  format = 'number' 
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return formatPrice(val);
      case 'percentage':
        return `${val}%`;
      default:
        return val.toLocaleString('es-CO');
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-200 backdrop-blur-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-700 mb-1">{title}</p>
          <p className="text-2xl font-bold text-blue-900 mb-2">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-sm text-blue-600">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">
                {change > 0 ? '+' : ''}{change}%
              </span>
              <span className="text-blue-500 ml-1">vs mes anterior</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


