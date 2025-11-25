import { X, User, Mail, Phone, Calendar, MapPin, Ticket, DollarSign, CheckCircle, Clock, QrCode, Package, Hash, CreditCard } from 'lucide-react';
import { formatPrice } from '@shared/lib/utils/Currency.utils';
import { useEffect, useState } from 'react';
// Eliminamos fetch directo vía RPC de usuarios y usamos información del ticket (consultTicketInfo)
import { QRCodeService } from '@shared/lib/services/QRCode.service';

interface AttendeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendee: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string | null;
    userRole?: string | null;
    eventTitle: string;
    ticketType: string;
    ticketPrice: number;
    purchaseDate: string;
    purchaseOrderNumber?: string | null;
    purchaseQuantity?: number | null;
    purchaseTotalPaid?: number | null;
    checkInStatus: 'pending' | 'checked-in' | 'no-show';
    checkInTime?: string;
    qrCode: string;
  } | null;
}

export function AttendeeDetailsModal({ isOpen, onClose, attendee }: AttendeeDetailsModalProps) {
  // Estados locales para datos enriquecidos (evita depender sólo del fallback del servicio)
  const [loadingUser, setLoadingUser] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Efecto: usar información pública del ticket para enriquecer (aprovecha RPC consultar_ticket_qr ya existente)
  useEffect(() => {
    const enrichFromTicket = async () => {
      if (!isOpen || !attendee) return;
      // Evitar consultas para códigos manuales/fallback
      if (!attendee.qrCode || attendee.qrCode.startsWith('MANUAL-') || attendee.qrCode.startsWith('PENDING-')) return;
      const nameAlready = attendee.name && attendee.name.toLowerCase() !== 'asistente';
      const emailAlready = attendee.email && attendee.email.trim() !== '';
      if (nameAlready && emailAlready) return; // Ya tenemos datos decentes
      try {
        setLoadingUser(true);
        setFetchError(null);
        const result = await QRCodeService.consultTicketInfo(attendee.qrCode);
        if (!result.exists) {
          setFetchError('Ticket no encontrado');
          return;
        }
        const info = result.ticketInfo;
        if (info?.user_name && info.user_name.trim() !== '' && info.user_name.toLowerCase() !== 'usuario') {
          setUserName(info.user_name.trim());
        }
        if (info?.user_email && info.user_email.trim() !== '') {
          setUserEmail(info.user_email.trim());
        }
      } catch (e:any) {
        setFetchError(e.message || 'Error consultando ticket');
      } finally {
        setLoadingUser(false);
      }
    };
    enrichFromTicket();
  }, [isOpen, attendee?.qrCode]);

  // Evitar scroll de fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isOpen]);

  // Guard moved after hooks to mantener orden consistente
  if (!isOpen || !attendee) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'no-show':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'checked-in':
        return 'Registrado';
      case 'pending':
        return 'Pendiente';
      case 'no-show':
        return 'No asistió';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Capa de desenfoque fija que cubre completamente hasta arriba */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm will-change-transform"
        onClick={onClose}
      />
      {/* Contenedor centrado */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[1000]">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Detalles del Asistente</h2>
              <p className="text-sm text-white/80">Información completa del participante</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <span className="text-sm font-medium text-gray-600">Estado de Asistencia</span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(attendee.checkInStatus)}`}>
              {getStatusText(attendee.checkInStatus)}
            </span>
          </div>

          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Información Personal
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                {attendee.avatar ? (
                  <img 
                    src={attendee.avatar} 
                    alt={attendee.name}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Nombre Completo</p>
                  <p className="font-medium text-gray-900">{userName || attendee.name || 'Sin nombre'}</p>
                  {attendee.userRole && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                      {attendee.userRole}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Correo Electrónico</p>
                  <p className="font-medium text-gray-900">{userEmail || attendee.email || 'Sin correo'}</p>
                  {loadingUser && <p className="text-xs text-blue-600 mt-1">Consultando ticket…</p>}
                  {fetchError && <p className="text-xs text-red-600 mt-1">{fetchError}</p>}
                </div>
              </div>

              {attendee.phone && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium text-gray-900">{attendee.phone}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del Evento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Información del Evento
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Evento</p>
                  <p className="font-medium text-gray-900">{attendee.eventTitle}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Entrada */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Ticket className="w-5 h-5 mr-2 text-blue-600" />
              Información de Entrada
            </h3>
            <div className="space-y-3">


              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Ticket className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tipo de Entrada</p>
                  <p className="font-medium text-gray-900">{attendee.ticketType}</p>
                  {attendee.purchaseQuantity && attendee.purchaseQuantity > 1 && (
                    <p className="text-xs text-gray-600 mt-1">Cantidad: {attendee.purchaseQuantity}</p>
                  )}
                </div>
              </div>

              {attendee.purchaseTotalPaid ? (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Pagado</p>
                    <p className="font-medium text-gray-900">{formatPrice(attendee.purchaseTotalPaid)}</p>
                    <p className="text-xs text-gray-600 mt-1">Precio unitario: {formatPrice(attendee.ticketPrice)}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="font-medium text-gray-900">{formatPrice(attendee.ticketPrice)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fecha de Compra</p>
                  <p className="font-medium text-gray-900">
                    {new Date(attendee.purchaseDate).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {attendee.checkInTime && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hora de Registro</p>
                    <p className="font-medium text-gray-900">
                      {new Date(attendee.checkInTime).toLocaleDateString('es-ES', {
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

              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <QrCode className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Código QR</p>
                  <p className="font-mono text-xs text-gray-600 break-all">{attendee.qrCode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl flex justify-end space-x-3 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all duration-200"
          >
            Cerrar
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
