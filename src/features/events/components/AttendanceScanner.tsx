import { useState, useEffect } from 'react';
import { QrCode, CheckCircle, XCircle, Users, Clock, MapPin } from 'lucide-react';
import { QRService } from '../../../../core/services/qrService';

interface AttendanceScannerProps {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

interface ScanResult {
  success: boolean;
  message: string;
  attendeeInfo?: {
    name: string;
    ticketType: string;
    checkInTime: string;
  };
}

export function AttendanceScanner({ eventId, eventTitle, eventDate, eventLocation }: AttendanceScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [attendanceStats, setAttendanceStats] = useState({
    totalAttendees: 0,
    checkedIn: 0,
    noShow: 0,
    attendanceRate: 0
  });

  useEffect(() => {
    loadAttendanceStats();
    loadRecentScans();
  }, [eventId]);

  const loadAttendanceStats = async () => {
    try {
      const stats = await QRService.getEventAttendanceStats(eventId);
      setAttendanceStats(stats);
    } catch (error) {
      console.error('Error loading attendance stats:', error);
    }
  };

  const loadRecentScans = async () => {
    try {
      const attendees = await QRService.getEventAttendees(eventId);
      setRecentScans(attendees.slice(0, 10)); // Últimos 10 asistentes
    } catch (error) {
      console.error('Error loading recent scans:', error);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await QRService.validateAndCheckIn(qrCode, eventId);
      setScanResult(result);

      if (result.success) {
        // Recargar estadísticas y escaneos recientes
        await loadAttendanceStats();
        await loadRecentScans();
      }
    } catch (error) {
      console.error('Error scanning QR:', error);
      setScanResult({
        success: false,
        message: 'Error al procesar el código QR'
      });
    } finally {
      setIsScanning(false);
    }
  };

  const simulateQRScan = () => {
    // Simular escaneo de QR para pruebas
    const mockQRCode = JSON.stringify({
      ticketId: `ticket_${Date.now()}`,
      eventId: eventId,
      userId: `user_${Date.now()}`,
      ticketType: 'General',
      purchaseDate: new Date().toISOString(),
      eventTitle: eventTitle,
      eventDate: eventDate,
      eventLocation: eventLocation
    });
    
    handleQRScan(mockQRCode);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Control de Asistencia</h1>
            <p className="text-gray-600 mt-1">{eventTitle}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {eventDate}
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {eventLocation}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{attendanceStats.checkedIn}</div>
            <div className="text-sm text-gray-500">Asistentes confirmados</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Escanear Código QR</h2>
              <p className="text-gray-600 mb-6">
                Escanea el código QR de la entrada para registrar la asistencia
              </p>

              {/* Simulated Scanner */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Área de escaneo</p>
                  <button
                    onClick={simulateQRScan}
                    disabled={isScanning}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isScanning ? 'Escaneando...' : 'Simular Escaneo'}
                  </button>
                </div>
              </div>

              {/* Scan Result */}
              {scanResult && (
                <div className={`p-4 rounded-lg ${
                  scanResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center">
                    {scanResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    )}
                    <span className={`font-medium ${
                      scanResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {scanResult.message}
                    </span>
                  </div>
                  {scanResult.attendeeInfo && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Nombre:</strong> {scanResult.attendeeInfo.name}</p>
                      <p><strong>Tipo de entrada:</strong> {scanResult.attendeeInfo.ticketType}</p>
                      <p><strong>Hora de llegada:</strong> {new Date(scanResult.attendeeInfo.checkInTime).toLocaleTimeString('es-ES')}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats and Recent Scans */}
        <div className="space-y-6">
          {/* Attendance Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Asistentes</span>
                <span className="font-semibold">{attendanceStats.totalAttendees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Confirmados</span>
                <span className="font-semibold text-green-600">{attendanceStats.checkedIn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">No Show</span>
                <span className="font-semibold text-red-600">{attendanceStats.noShow}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tasa de Asistencia</span>
                <span className="font-semibold">{attendanceStats.attendanceRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Recent Scans */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimos Escaneos</h3>
            <div className="space-y-3">
              {recentScans.length > 0 ? (
                recentScans.map((scan, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{scan.usuarios?.nombre_completo || 'Usuario'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(scan.fecha_checkin).toLocaleTimeString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {scan.entradas?.tipos_entrada?.nombre || 'General'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No hay escaneos recientes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



