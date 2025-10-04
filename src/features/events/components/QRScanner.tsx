import React, { useState, useEffect, useRef } from 'react';
import { QrCode, CheckCircle, XCircle, AlertTriangle, Users, Clock, MapPin } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  qrCode: string;
  purchaseDate: string;
  isCheckedIn: boolean;
  checkInTime?: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
}

interface QRScannerProps {
  eventId: string;
  onAttendeeCheckIn: (attendee: Attendee) => void;
  onError: (error: string) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  eventId,
  onAttendeeCheckIn,
  onError,
  isScanning,
  onScanningChange
}) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [attendee, setAttendee] = useState<Attendee | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [scanHistory, setScanHistory] = useState<Attendee[]>([]);
  const [stats, setStats] = useState({
    totalScanned: 0,
    successfulCheckIns: 0,
    failedScans: 0
  });
  
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isScanning && videoRef.current) {
      initializeScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [isScanning]);

  const initializeScanner = () => {
    if (scannerRef.current) return;

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        (error) => {
          // Handle scan errors silently
          console.log('QR scan error:', error);
        }
      );
    } catch (error) {
      console.error('Error initializing QR scanner:', error);
      onError('Error al inicializar el escáner QR');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
  };

  const handleQRCodeScanned = async (qrCode: string) => {
    if (scannedCode === qrCode) return; // Prevent duplicate scans
    
    setScannedCode(qrCode);
    setIsValidating(true);

    try {
      // Simulate API call to validate QR code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock attendee data - in real app, this would come from API
      const mockAttendee: Attendee = {
        id: `attendee-${Date.now()}`,
        name: 'Juan Pérez',
        email: 'juan.perez@email.com',
        ticketType: 'General',
        qrCode: qrCode,
        purchaseDate: '2024-01-15',
        isCheckedIn: false,
        eventId: eventId,
        eventTitle: 'Conferencia Tech 2024',
        eventDate: '2024-03-15',
        eventLocation: 'Centro de Convenciones'
      };

      setAttendee(mockAttendee);
      setStats(prev => ({ ...prev, totalScanned: prev.totalScanned + 1 }));
      
    } catch (error) {
      console.error('Error validating QR code:', error);
      onError('Error al validar el código QR');
      setStats(prev => ({ ...prev, failedScans: prev.failedScans + 1 }));
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckIn = () => {
    if (!attendee) return;

    const checkedInAttendee = {
      ...attendee,
      isCheckedIn: true,
      checkInTime: new Date().toISOString()
    };

    onAttendeeCheckIn(checkedInAttendee);
    setScanHistory(prev => [checkedInAttendee, ...prev]);
    setStats(prev => ({ ...prev, successfulCheckIns: prev.successfulCheckIns + 1 }));
    
    // Reset for next scan
    setAttendee(null);
    setScannedCode(null);
  };

  const handleReject = () => {
    setAttendee(null);
    setScannedCode(null);
    setStats(prev => ({ ...prev, failedScans: prev.failedScans + 1 }));
  };

  const startScanning = () => {
    onScanningChange(true);
  };

  const stopScanning = () => {
    onScanningChange(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Control de Asistencia</h2>
        <p className="text-gray-600">Escanea los códigos QR de las entradas para registrar asistencia</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <QrCode className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Total Escaneados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalScanned}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Check-ins Exitosos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successfulCheckIns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-500">Escaneos Fallidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedScans}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Escáner QR</h3>
          <div className="flex space-x-2">
            {!isScanning ? (
              <button
                onClick={startScanning}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Iniciar Escaneo
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Detener Escaneo
              </button>
            )}
          </div>
        </div>

        {/* QR Scanner */}
        {isScanning ? (
          <div className="text-center">
            <div id="qr-reader" ref={videoRef} className="mx-auto max-w-md"></div>
            <p className="text-sm text-gray-500 mt-2">
              Apunta la cámara hacia el código QR de la entrada
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <QrCode className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Escáner Inactivo</h3>
            <p className="mt-1 text-sm text-gray-500">
              Haz clic en "Iniciar Escaneo" para comenzar a registrar asistentes
            </p>
          </div>
        )}
      </div>

      {/* Attendee Validation */}
      {attendee && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Validar Asistente</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="font-medium text-blue-900">Información del Asistente</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <p className="text-sm text-gray-900">{attendee.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-sm text-gray-900">{attendee.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entrada</label>
              <p className="text-sm text-gray-900">{attendee.ticketType}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Compra</label>
              <p className="text-sm text-gray-900">{new Date(attendee.purchaseDate).toLocaleDateString('es-ES')}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="font-medium text-gray-900 mb-2">Detalles del Evento</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{attendee.eventTitle}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{new Date(attendee.eventDate).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{attendee.eventLocation}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Rechazar
            </button>
            <button
              onClick={handleCheckIn}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2 inline" />
              Confirmar Check-in
            </button>
          </div>
        </div>
      )}

      {/* Validation Status */}
      {isValidating && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-yellow-800">Validando código QR...</span>
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Check-ins Recientes</h3>
          <div className="space-y-2">
            {scanHistory.slice(0, 5).map((attendee, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-900">{attendee.name}</p>
                    <p className="text-sm text-green-700">{attendee.ticketType}</p>
                  </div>
                </div>
                <div className="text-sm text-green-600">
                  {new Date(attendee.checkInTime!).toLocaleTimeString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
