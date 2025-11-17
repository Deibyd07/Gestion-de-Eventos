import { useState, useEffect } from 'react';
import { X, QrCode, CheckCircle, XCircle, AlertTriangle, User, Calendar, MapPin, Ticket, Clock, DollarSign, Scan } from 'lucide-react';
import { QRCodeService } from '@shared/lib/services/QRCode.service';

interface TicketViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string; // Código QR desde URL
}

interface TicketResult {
  exists: boolean;
  message: string;
  ticketInfo: any;
  timestamp: Date;
}

export function TicketViewerModal({ isOpen, onClose, initialCode }: TicketViewerModalProps) {
  const [ticketResult, setTicketResult] = useState<TicketResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');

  // Si viene un código inicial desde la URL, consultarlo automáticamente
  useEffect(() => {
    if (initialCode && !ticketResult && !isLoading) {
      setQrCode(initialCode);
      handleConsultTicket(initialCode);
    }
  }, [initialCode]);

  const handleConsultTicket = async (code: string) => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await QRCodeService.consultTicketInfo(code.trim());
      
      setTicketResult({
        exists: result.exists,
        message: result.message,
        ticketInfo: result.ticketInfo,
        timestamp: new Date()
      });
    } catch (err: any) {
      setTicketResult({
        exists: false,
        message: err?.message || 'Error al consultar el código QR',
        ticketInfo: null,
        timestamp: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetViewer = () => {
    setTicketResult(null);
    setQrCode('');
  };

  const handleClose = () => {
    resetViewer();
    onClose();
  };

  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string; icon: any }> = {
      'activo': { color: 'bg-green-100 text-green-800 border-green-200', text: 'Activo', icon: CheckCircle },
      'usado': { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Ya Utilizado', icon: CheckCircle },
      'cancelado': { color: 'bg-red-100 text-red-800 border-red-200', text: 'Cancelado', icon: XCircle },
      'expirado': { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Expirado', icon: AlertTriangle }
    };

    const badge = badges[status] || badges['activo'];
    const Icon = badge.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border ${badge.color}`}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{badge.text}</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Consultar Entrada</h2>
              <p className="text-sm text-white/80">Ver información de tu ticket</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Input Section */}
          {!ticketResult && (
            <div className="space-y-4">
              <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Scan className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Ingresa tu código QR</h4>
                    <p className="text-sm text-gray-600">Pega el código de tu entrada aquí</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={qrCode}
                    onChange={(e) => setQrCode(e.target.value)}
                    placeholder="Ej: EVT-2024-ABC123..."
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleConsultTicket(qrCode);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleConsultTicket(qrCode)}
                    disabled={isLoading || !qrCode.trim()}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Consultando...
                      </>
                    ) : (
                      <>
                        <QrCode className="w-5 h-5 mr-2" />
                        Consultar Entrada
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>💡 Nota:</strong> Esta consulta solo muestra la información de tu entrada. 
                  No registra tu asistencia al evento. El registro de asistencia se hace en la puerta del evento por parte de los organizadores.
                </p>
              </div>
            </div>
          )}

          {/* Result Section */}
          {ticketResult && (
            <div className="space-y-6">
              {/* Result Status */}
              <div className={`p-6 rounded-xl border-2 ${
                ticketResult.exists
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    ticketResult.exists ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {ticketResult.exists ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-lg font-bold ${
                      ticketResult.exists ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {ticketResult.exists ? '✓ Entrada Encontrada' : '✗ Entrada No Encontrada'}
                    </h3>
                    <p className={`text-sm mt-1 ${
                      ticketResult.exists ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {ticketResult.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Consultado: {ticketResult.timestamp.toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ticket Info */}
              {ticketResult.ticketInfo && (
                <>
                  {/* Status Badge */}
                  <div className="flex justify-center">
                    {getStatusBadge(ticketResult.ticketInfo.status)}
                  </div>

                  <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl border-2 border-purple-200 overflow-hidden">
                    {/* Ticket Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                      <h3 className="text-2xl font-bold mb-2">{ticketResult.ticketInfo.event_title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-white/90">
                        <Calendar className="w-4 h-4" />
                        <span>{ticketResult.ticketInfo.event_date} • {ticketResult.ticketInfo.event_time}</span>
                      </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Titular</p>
                            <p className="font-medium text-gray-900">{ticketResult.ticketInfo.user_name}</p>
                            <p className="text-sm text-gray-600">{ticketResult.ticketInfo.user_email}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Ubicación</p>
                            <p className="font-medium text-gray-900">{ticketResult.ticketInfo.event_location}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Ticket className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tipo de Entrada</p>
                            <p className="font-medium text-gray-900">{ticketResult.ticketInfo.ticket_type}</p>
                            <p className="text-sm text-gray-600">Entrada #{ticketResult.ticketInfo.ticket_number}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Precio</p>
                            <p className="font-medium text-gray-900">${ticketResult.ticketInfo.price}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-pink-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Fecha de Compra</p>
                            <p className="font-medium text-gray-900">
                              {new Date(ticketResult.ticketInfo.purchase_date).toLocaleDateString('es-ES')}
                            </p>
                          </div>
                        </div>

                        {ticketResult.ticketInfo.scanned_date && (
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <CheckCircle className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Fecha de Uso</p>
                              <p className="font-medium text-gray-900">
                                {new Date(ticketResult.ticketInfo.scanned_date).toLocaleString('es-ES')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {ticketResult.ticketInfo.status === 'usado' && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ℹ️ Esta entrada ya fue utilizada y registrada el{' '}
                        <strong>{new Date(ticketResult.ticketInfo.scanned_date).toLocaleDateString('es-ES')}</strong>
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetViewer}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-200"
                >
                  Consultar Otra Entrada
                </button>
                <button
                  onClick={handleClose}
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
