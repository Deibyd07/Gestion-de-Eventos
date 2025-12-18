import { useState, useEffect, useRef } from 'react';
import { X, QrCode, CheckCircle, XCircle, AlertTriangle, Camera, CameraOff, User, Calendar, MapPin, Ticket, Clock, DollarSign } from 'lucide-react';
import { QRCodeService } from '@shared/lib/services/QRCode.service';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import jsQR from 'jsqr';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
}

interface ScanResult {
  valid: boolean;
  message: string;
  ticketInfo: any;
  timestamp: Date;
}

export function QRScannerModal({ isOpen, onClose, eventId }: QRScannerModalProps) {
  const { user } = useAuthStore();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, isScanning]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code && code.data) {
          handleQRCodeDetected(code.data);
          return;
        }
      }
      animationFrameRef.current = requestAnimationFrame(scan);
    };

    scan();
  };

  const handleQRCodeDetected = async (qrData: string) => {
    setIsScanning(false);
    stopCamera();

    try {
      // Extraer código del QR (puede ser URL, JSON o código directo)
      let qrCode: string = qrData.trim();

      console.log('📷 Dato escaneado:', qrData);

      // Si contiene una URL con el parámetro 'code'
      if (qrCode.includes('code=')) {
        try {
          // Intentar parsear como URL
          const url = new URL(qrCode);
          const extractedCode = url.searchParams.get('code');
          if (extractedCode) {
            qrCode = extractedCode;
            console.log('🔗 URL detectada, código extraído:', qrCode);
          }
        } catch {
          // Si falla el parse de URL, intentar extracción manual con regex
          const match = qrCode.match(/code=([a-fA-F0-9]+)/);
          if (match && match[1]) {
            qrCode = match[1];
            console.log('🔗 Código extraído manualmente:', qrCode);
          }
        }
      }
      // Si parece ser JSON
      else if (qrCode.startsWith('{')) {
        try {
          const parsed = JSON.parse(qrCode);
          if (parsed.code) {
            qrCode = parsed.code;
            console.log('📦 JSON detectado, código extraído:', qrCode);
          }
        } catch (e) {
          console.log('⚠️ No se pudo parsear como JSON, usando dato directo');
        }
      }

      console.log('🔍 Código final a validar:', qrCode);

      // Validar el QR con el backend
      const result = await QRCodeService.validateQRCode(qrCode, user!.id);

      console.log('✅ Resultado de validación:', result);

      setScanResult({
        valid: result.valid,
        message: result.message,
        ticketInfo: result.ticketInfo,
        timestamp: new Date()
      });
    } catch (err: any) {
      console.error('❌ Error validating QR:', err);
      setScanResult({
        valid: false,
        message: err?.message || 'Error al validar el código QR',
        ticketInfo: null,
        timestamp: new Date()
      });
    }
  };

  const handleManualInput = async (code: string) => {
    if (!code.trim()) return;

    setIsScanning(false);
    stopCamera();

    try {
      // Extraer código si es una URL
      let qrCode = code.trim();
      if (qrCode.includes('consultar-entrada?code=')) {
        try {
          const url = new URL(qrCode);
          qrCode = url.searchParams.get('code') || qrCode;
          console.log('🔗 URL ingresada, código extraído:', qrCode);
        } catch {
          // Si falla el parse de URL, intentar extracción manual
          const match = qrCode.match(/code=([^&]+)/);
          if (match) {
            qrCode = match[1];
          }
        }
      }

      console.log('🔍 Código a validar:', qrCode);

      const result = await QRCodeService.validateQRCode(qrCode, user!.id);

      setScanResult({
        valid: result.valid,
        message: result.message,
        ticketInfo: result.ticketInfo,
        timestamp: new Date()
      });
    } catch (err: any) {
      setScanResult({
        valid: false,
        message: err?.message || 'Error al validar el código QR',
        ticketInfo: null,
        timestamp: new Date()
      });
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Escáner de Entradas</h2>
              <p className="text-sm text-white/80">Valida y registra la asistencia al evento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Scanner or Result */}
          {!scanResult ? (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden" style={{ height: '400px' }}>
                {isScanning ? (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 border-4 border-blue-500 animate-pulse"></div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm">
                      Apunta la cámara al código QR
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-4">
                    <CameraOff className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-400">Cámara desactivada</p>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${isScanning
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    }`}
                >
                  {isScanning ? (
                    <>
                      <CameraOff className="w-5 h-5" />
                      <span>Detener Cámara</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      <span>Activar Cámara</span>
                    </>
                  )}
                </button>
              </div>

              {/* Manual Input */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900 mb-3">Ingreso Manual</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingresa el código QR manualmente"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleManualInput((e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = (e.currentTarget.previousSibling as HTMLInputElement);
                      handleManualInput(input.value);
                    }}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Validar
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ Esta acción <strong>registrará la asistencia</strong> del titular al evento
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Result Status */}
              <div className={`p-6 rounded-xl border-2 ${scanResult.valid
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${scanResult.valid ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                    {scanResult.valid ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${scanResult.valid ? 'text-green-900' : 'text-red-900'
                      }`}>
                      {scanResult.valid ? '✓ Entrada Válida' : '✗ Entrada No Válida'}
                    </h3>
                    <p className={`text-sm mt-1 ${scanResult.valid ? 'text-green-700' : 'text-red-700'
                      }`}>
                      {scanResult.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Escaneado: {scanResult.timestamp.toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              {scanResult.ticketInfo && (
                <div className="bg-gradient-to-br from-white to-indigo-50 rounded-xl border border-gray-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Ticket className="w-5 h-5 mr-2 text-blue-600" />
                    Información de la Entrada
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Asistente</p>
                        <p className="font-medium text-gray-900">{scanResult.ticketInfo.user_name}</p>
                        <p className="text-sm text-gray-600">{scanResult.ticketInfo.user_email}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Evento</p>
                        <p className="font-medium text-gray-900">{scanResult.ticketInfo.event_title}</p>
                        <p className="text-sm text-gray-600">{scanResult.ticketInfo.event_date}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ubicación</p>
                        <p className="font-medium text-gray-900">{scanResult.ticketInfo.event_location}</p>
                        <p className="text-sm text-gray-600">{scanResult.ticketInfo.event_time}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Ticket className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Tipo de Entrada</p>
                        <p className="font-medium text-gray-900">{scanResult.ticketInfo.ticket_type}</p>
                        <p className="text-sm text-gray-600">${scanResult.ticketInfo.price}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fecha de Compra</p>
                        <p className="font-medium text-gray-900">
                          {new Date(scanResult.ticketInfo.purchase_date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetScanner}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Escanear Otra Entrada
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
