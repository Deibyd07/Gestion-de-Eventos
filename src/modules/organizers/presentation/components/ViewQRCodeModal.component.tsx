import { X, Download, CheckCircle, Clock, XCircle, QrCode as QrCodeIcon, User, Mail, Phone, Hash, CreditCard, Calendar, Tag, MapPin, Ticket, DollarSign } from 'lucide-react';
import { formatPrice } from '@shared/lib/utils/Currency.utils';
import QRCodeSVG from 'react-qr-code';
import { useRef, useEffect, useState } from 'react';
import { QRCodeService } from '../../../../shared/lib/services/QRCode.service';

interface ViewQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: {
    id: string;
    name: string;
    email: string;
    eventTitle: string;
    ticketType: string;
    qrCode: string;
    checkInStatus: 'pending' | 'checked-in' | 'no-show';
    checkInDate?: string;
    avatar?: string;
    userRole?: string;
    phone?: string;
    purchaseOrderNumber?: string;
    purchaseQuantity?: number;
    purchaseTotalPaid?: number;
    purchaseDate?: string;
    price?: number;
  } | null;
}

export function ViewQRCodeModal({ isOpen, onClose, attendee }: ViewQRCodeModalProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'checked-in':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Registrado',
          textColor: 'text-green-700',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200'
        };
      case 'pending':
        return {
          icon: <Clock className="w-5 h-5" />,
          text: 'Activo',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200'
        };
      case 'no-show':
        return {
          icon: <XCircle className="w-5 h-5" />,
          text: 'No asistió',
          textColor: 'text-red-700',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5" />,
          text: 'Desconocido',
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-100',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Usar optional chaining y valor por defecto para evitar errores cuando attendee es null en primer render
  const statusConfig = getStatusConfig(attendee?.checkInStatus || 'pending');

  // Auto consulta pública del ticket
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    if (!isOpen || !attendee?.qrCode) return;
    let active = true;
        // Usar estado por defecto si todavía no hay attendee para evitar acceso null antes del guard
        const derivedStatus = attendee?.checkInStatus || 'pending';
    setTicketLoading(true);
    setTicketError(null);
    (async () => {
      const result = await QRCodeService.consultTicketInfo(attendee.qrCode);
      if (!active) return;
      if (!result.exists) {
        setTicketError(result.message || 'No se encontró información del ticket');
        setTicketData(null);
      } else {
        console.log('📋 ticketData recibido:', result.ticketInfo);
        setTicketData(result.ticketInfo);
      }
      setTicketLoading(false);
    })();
    return () => { active = false; };
  }, [isOpen, attendee?.qrCode]);

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current.querySelector('svg');
    if (!svg) return;

    // Convert SVG to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = `qr-${attendee.name.replace(/\s+/g, '-')}-${attendee.id}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Se elimina el flujo manual de abrir vista pública: ahora se consulta automáticamente.

  // Bloquear scroll durante apertura
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Guard después de declarar todos los hooks para evitar cambio en orden de hooks
  if (!isOpen || !attendee) return null;

  // Construir URL pública del ticket como en el perfil de usuario (igual que QRCodeService)
  const appBaseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  const qrUrl = `${appBaseUrl}/consultar-entrada?code=${attendee.qrCode}`;

  return (
    <div className="fixed inset-0 z-[999]">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm will-change-transform" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[1000]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between z-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <QrCodeIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Código QR del Asistente</h2>
              <p className="text-indigo-100 text-sm">{attendee.eventTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* QR Code Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex flex-col items-center space-y-4">
              <div
                ref={qrRef}
                className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-200"
              >
                <QRCodeSVG value={qrUrl} size={256} level="H" />
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <div
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  {statusConfig.icon}
                  <span className="font-semibold">{statusConfig.text}</span>
                </div>
              </div>

              {attendee.checkInDate && (
                <p className="text-sm text-gray-600">
                  Registrado: {new Date(attendee.checkInDate).toLocaleString('es-ES')}
                </p>
              )}
            </div>
          </div>

          {/* Información de Compra */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Información de Compra
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <Tag className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Entrada</p>
                  <p className="text-sm text-gray-800 font-medium">{attendee.ticketType}</p>
                </div>
              </div>

              {attendee.purchaseOrderNumber && (
                <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Número de Orden</p>
                    <p className="text-sm text-gray-800 font-medium">{attendee.purchaseOrderNumber}</p>
                  </div>
                </div>
              )}

              {attendee.purchaseQuantity && (
                <div className="flex items-start space-x-3">
                  <Hash className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Cantidad de Entradas</p>
                    <p className="text-sm text-gray-800 font-medium">{attendee.purchaseQuantity}</p>
                  </div>
                </div>
              )}

              {attendee.purchaseTotalPaid && (
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Pagado</p>
                    <p className="text-sm text-gray-800 font-medium">{formatPrice(attendee.purchaseTotalPaid)}</p>
                    {attendee.price && attendee.purchaseQuantity && (
                      <p className="text-xs text-gray-500 mt-1">
                        ({formatPrice(attendee.price)} × {attendee.purchaseQuantity})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {attendee.purchaseDate && (
                <div className="flex items-start space-x-3 col-span-full">
                  <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha de Compra</p>
                    <p className="text-sm text-gray-800 font-medium">
                      {new Date(attendee.purchaseDate).toLocaleString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información en tiempo real del ticket consultado */}
        <div className="px-6 pb-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-purple-600" />
              Verificación en Tiempo Real
            </h3>
            {ticketLoading && (
              <p className="text-sm text-purple-700">Consultando información del ticket...</p>
            )}
            {!ticketLoading && ticketError && (
              <p className="text-sm text-red-600">{ticketError}</p>
            )}
            {!ticketLoading && ticketData && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  {ticketData.status === 'usado' ? (
                    <div className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Entrada Usada</span>
                    </div>
                  ) : (
                    <div className="px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Entrada Activa</span>
                    </div>
                  )}
                </div>
                
                {/* Titular del Ticket */}
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide mb-3">Titular del Ticket</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <User className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
                        <p className="text-sm font-medium text-gray-800">{ticketData.user_name || attendee.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                        <p className="text-sm font-medium text-gray-800 break-all">{ticketData.user_email || attendee.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalles del Evento y Ticket */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Ubicación</p>
                      <p className="text-sm font-medium text-gray-800">{ticketData.event_location}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Ticket className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo de Entrada</p>
                      <p className="text-sm font-medium text-gray-800">{ticketData.ticket_type} #{ticketData.ticket_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <DollarSign className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Precio</p>
                      <p className="text-sm font-medium text-gray-800">${ticketData.price}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha Compra</p>
                      <p className="text-sm font-medium text-gray-800">{new Date(ticketData.purchase_date).toLocaleDateString('es-ES')}</p>
                    </div>
                  </div>
                  {ticketData.scanned_date && (
                    <div className="flex items-start space-x-3 md:col-span-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Fecha Uso</p>
                        <p className="text-sm font-medium text-gray-800">{new Date(ticketData.scanned_date).toLocaleString('es-ES')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl flex items-center justify-between border-t border-gray-200 gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Descargar QR</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
          >
            Cerrar
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
