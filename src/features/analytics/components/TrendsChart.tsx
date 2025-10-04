import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  PieChart,
  Download,
  Maximize2,
  Calendar,
  Filter,
  RefreshCw,
  Activity,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: {
    events?: number;
    revenue?: number;
    attendees?: number;
    conversion?: number;
  };
}

interface TrendsChartProps {
  title: string;
  data: TrendDataPoint[];
  type?: 'line' | 'bar' | 'area';
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  color?: string;
  gradient?: boolean;
  animated?: boolean;
  interactive?: boolean;
  onDataPointClick?: (point: TrendDataPoint) => void;
  className?: string;
}

export function TrendsChart({
  title,
  data,
  type = 'line',
  height = 300,
  showGrid = true,
  showTooltip = true,
  showLegend = true,
  color = '#3B82F6',
  gradient = true,
  animated = true,
  interactive = true,
  onDataPointClick,
  className = ''
}: TrendsChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<TrendDataPoint | null>(null);
  const [chartType, setChartType] = useState(type);

  // Calcular métricas de tendencia
  const trendMetrics = useMemo(() => {
    if (data.length < 2) return null;
    
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const change = lastValue - firstValue;
    const changePercent = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    const avgValue = data.reduce((sum, point) => sum + point.value, 0) / data.length;
    const maxValue = Math.max(...data.map(point => point.value));
    const minValue = Math.min(...data.map(point => point.value));
    
    return {
      change,
      changePercent,
      avgValue,
      maxValue,
      minValue,
      isPositive: change >= 0,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }, [data]);

  // Calcular puntos del gráfico
  const chartPoints = useMemo(() => {
    if (data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(point => point.value));
    const minValue = Math.min(...data.map(point => point.value));
    const range = maxValue - minValue || 1;
    
    return data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 80;
      return {
        ...point,
        x,
        y,
        normalizedValue: (point.value - minValue) / range
      };
    });
  }, [data]);

  // Generar path para línea
  const linePath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    
    const path = chartPoints.map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    }).join(' ');
    
    return path;
  }, [chartPoints]);

  // Generar path para área
  const areaPath = useMemo(() => {
    if (chartPoints.length < 2) return '';
    
    const linePath = chartPoints.map((point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${command} ${point.x} ${point.y}`;
    }).join(' ');
    
    const bottomLine = `L ${chartPoints[chartPoints.length - 1].x} 100 L ${chartPoints[0].x} 100 Z`;
    
    return `${linePath} ${bottomLine}`;
  }, [chartPoints]);

  const handlePointHover = (point: TrendDataPoint) => {
    if (interactive) {
      setHoveredPoint(point);
    }
  };

  const handlePointClick = (point: TrendDataPoint) => {
    if (interactive) {
      setSelectedPoint(point);
      onDataPointClick?.(point);
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {trendMetrics && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    trendMetrics.isPositive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {trendMetrics.isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    <span>{Math.abs(trendMetrics.changePercent).toFixed(1)}%</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {trendMetrics.isPositive ? 'Crecimiento' : 'Descenso'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Tipo de gráfico */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  chartType === 'line' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  chartType === 'bar' 
                    ? 'bg-white shadow-sm text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
            
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200">
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Métricas rápidas */}
        {trendMetrics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(trendMetrics.maxValue)}
              </div>
              <div className="text-sm text-gray-500">Máximo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(trendMetrics.avgValue)}
              </div>
              <div className="text-sm text-gray-500">Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatValue(trendMetrics.minValue)}
              </div>
              <div className="text-sm text-gray-500">Mínimo</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                trendMetrics.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trendMetrics.isPositive ? '+' : ''}{formatValue(trendMetrics.change)}
              </div>
              <div className="text-sm text-gray-500">Cambio</div>
            </div>
          </div>
        )}
      </div>

      {/* Gráfico */}
      <div className="p-6">
        <div className="relative" style={{ height: `${height}px` }}>
          <svg 
            width="100%" 
            height="100%" 
            className="overflow-visible"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Grid */}
            {showGrid && (
              <g className="opacity-30">
                {[0, 20, 40, 60, 80, 100].map((y, index) => (
                  <line
                    key={index}
                    x1="0"
                    y1={y}
                    x2="100"
                    y2={y}
                    stroke="#E5E7EB"
                    strokeWidth="0.5"
                  />
                ))}
                {[0, 25, 50, 75, 100].map((x, index) => (
                  <line
                    key={index}
                    x1={x}
                    y1="0"
                    x2={x}
                    y2="100"
                    stroke="#E5E7EB"
                    strokeWidth="0.5"
                  />
                ))}
              </g>
            )}

            {/* Área (solo para línea) */}
            {chartType === 'line' && gradient && (
              <defs>
                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
              </defs>
            )}

            {chartType === 'line' && (
              <path
                d={areaPath}
                fill="url(#areaGradient)"
                className={animated ? 'animate-pulse' : ''}
              />
            )}

            {/* Línea */}
            {chartType === 'line' && (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={animated ? 'animate-pulse' : ''}
              />
            )}

            {/* Barras */}
            {chartType === 'bar' && chartPoints.map((point, index) => (
              <rect
                key={index}
                x={point.x - 2}
                y={point.y}
                width="4"
                height={100 - point.y}
                fill={color}
                className={`hover:opacity-80 transition-all duration-200 ${
                  animated ? 'animate-pulse' : ''
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              />
            ))}

            {/* Puntos de datos */}
            {chartPoints.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="3"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className={`cursor-pointer transition-all duration-200 hover:r-5 ${
                  hoveredPoint === point ? 'r-5 opacity-80' : ''
                } ${selectedPoint === point ? 'r-5' : ''}`}
                onMouseEnter={() => handlePointHover(point)}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={() => handlePointClick(point)}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              />
            ))}
          </svg>

          {/* Tooltip */}
          {showTooltip && hoveredPoint && (
            <div className="absolute bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg text-sm pointer-events-none z-10"
                 style={{
                   left: `${hoveredPoint.x}%`,
                   top: `${hoveredPoint.y}%`,
                   transform: 'translate(-50%, -100%)'
                 }}>
              <div className="font-medium">{formatValue(hoveredPoint.value)}</div>
              <div className="text-gray-300 text-xs">
                {formatDate(hoveredPoint.date)}
              </div>
              {hoveredPoint.metadata && (
                <div className="mt-1 space-y-1">
                  {hoveredPoint.metadata.events && (
                    <div className="text-xs">Eventos: {hoveredPoint.metadata.events}</div>
                  )}
                  {hoveredPoint.metadata.revenue && (
                    <div className="text-xs">Ingresos: €{hoveredPoint.metadata.revenue}</div>
                  )}
                  {hoveredPoint.metadata.attendees && (
                    <div className="text-xs">Asistentes: {hoveredPoint.metadata.attendees}</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ejes y etiquetas */}
        <div className="flex justify-between mt-4 text-xs text-gray-500">
          {data.map((point, index) => (
            <span key={index} className="text-center">
              {formatDate(point.date)}
            </span>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm text-gray-600">Tendencia</span>
            </div>
            <div className="text-sm text-gray-500">
              {data.length} puntos de datos
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

