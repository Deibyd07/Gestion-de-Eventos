import React, { useState } from 'react';
import { Download, FileText, Users, CheckCircle, XCircle, Clock, TrendingUp, Calendar } from 'lucide-react';

interface AttendanceData {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  totalTickets: number;
  checkedIn: number;
  notCheckedIn: number;
  attendanceRate: number;
  checkInTimes: string[];
  attendees: Array<{
    id: string;
    name: string;
    email: string;
    ticketType: string;
    purchaseDate: string;
    checkInTime?: string;
    isCheckedIn: boolean;
  }>;
}

interface AttendanceReportsProps {
  attendanceData: AttendanceData;
  onExportReport: (format: 'csv' | 'excel' | 'pdf') => void;
  onFilterChange: (filters: AttendanceFilters) => void;
}

interface AttendanceFilters {
  ticketType: string;
  checkInStatus: string;
  dateFrom: string;
  dateTo: string;
}

export const AttendanceReports: React.FC<AttendanceReportsProps> = ({
  attendanceData,
  onExportReport,
  onFilterChange
}) => {
  const [filters, setFilters] = useState<AttendanceFilters>({
    ticketType: '',
    checkInStatus: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const filteredAttendees = attendanceData.attendees.filter(attendee => {
    if (filters.ticketType && attendee.ticketType !== filters.ticketType) return false;
    if (filters.checkInStatus === 'checked-in' && !attendee.isCheckedIn) return false;
    if (filters.checkInStatus === 'not-checked-in' && attendee.isCheckedIn) return false;
    if (filters.datefrom.*Date.utilsFrom)) return false;
    if (filters.dateTo && new Date(attendee.purchaseDate) > new Date(filters.dateTo)) return false;
    return true;
  });

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('es-ES');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceRateIcon = (rate: number) => {
    if (rate >= 90) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (rate >= 70) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const updateFilter = (key: keyof AttendanceFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSelectAttendee = (attendeeId: string) => {
    setSelectedAttendees(prev =>
      prev.includes(attendeeId)
        ? prev.filter(id => id !== attendeeId)
        : [...prev, attendeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      setSelectedAttendees([]);
    } else {
      setSelectedAttendees(filteredAttendees.map(a => a.id));
    }
  };

  const getCheckInPeakHours = () => {
    const hours = attendanceData.checkInTimes.map(time => new Date(time).getHours());
    const hourCounts = hours.reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const peakHour = Object.entries(hourCounts).reduce((a, b) => 
      hourCounts[parseInt(a[0])] > hourCounts[parseInt(b[0])] ? a : b
    );
    
    return `${peakHour[0]}:00 - ${parseInt(peakHour[0]) + 1}:00`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Reporte de Asistencia</h3>
          <p className="text-sm text-gray-500">{attendanceData.eventTitle}</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <div className="relative">
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={() => onExportReport('csv')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar CSV
              </button>
              <button
                onClick={() => onExportReport('excel')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar Excel
              </button>
              <button
                onClick={() => onExportReport('pdf')}
                className="w-full text-left px-4 py-2 hover:bg-gray-50"
              >
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Entradas</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Check-ins</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.checkedIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">No Asistieron</p>
              <p className="text-2xl font-bold text-gray-900">{attendanceData.notCheckedIn}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Tasa de Asistencia</p>
              <p className={`text-2xl font-bold ${getAttendanceRateColor(attendanceData.attendanceRate)}`}>
                {attendanceData.attendanceRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Rate Analysis */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Análisis de Asistencia</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Tasa de Asistencia</span>
              <span className={`text-sm font-bold ${getAttendanceRateColor(attendanceData.attendanceRate)}`}>
                {attendanceData.attendanceRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  attendanceData.attendanceRate >= 90 ? 'bg-green-500' :
                  attendanceData.attendanceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${attendanceData.attendanceRate}%` }}
              />
            </div>
            <div className="flex items-center mt-2">
              {getAttendanceRateIcon(attendanceData.attendanceRate)}
              <span className="ml-2 text-sm text-gray-600">
                {attendanceData.attendanceRate >= 90 ? 'Excelente asistencia' :
                 attendanceData.attendanceRate >= 70 ? 'Buena asistencia' : 'Asistencia baja'}
              </span>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-2">Hora pico de check-ins</div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <span className="font-medium">{getCheckInPeakHours()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Filtros</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Entrada</label>
              <select
                value={filters.ticketType}
                onChange={(e) => updateFilter('ticketType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="General">General</option>
                <option value="VIP">VIP</option>
                <option value="Early Bird">Early Bird</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Check-in</label>
              <select
                value={filters.checkInStatus}
                onChange={(e) => updateFilter('checkInStatus', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="checked-in">Check-in realizado</option>
                <option value="not-checked-in">Sin check-in</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Compra</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Attendees List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Lista de Asistentes</h4>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedAttendees.length === filteredAttendees.length && filteredAttendees.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-500">
                {selectedAttendees.length} seleccionados
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asistente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo de Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Compra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check-in
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.map((attendee) => (
                <tr key={attendee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedAttendees.includes(attendee.id)}
                      onChange={() => handleSelectAttendee(attendee.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{attendee.name}</div>
                      <div className="text-sm text-gray-500">{attendee.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{attendee.ticketType}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(attendee.purchaseDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      attendee.isCheckedIn
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {attendee.isCheckedIn ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Asistió
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          No asistió
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.checkInTime ? formatTime(attendee.checkInTime) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
