import React from 'react';
import { Download, Calendar, MapPin, Clock, User, Ticket, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QRTicketDisplayProps {
  ticket: {
    id: string;
    codigo_qr: string;
    datos_qr: {
      qr_image: string;
      event_title: string;
      user_name: string;
      user_email: string;
      ticket_type: string;
      price: number;
      event_date: string;
      event_time: string;
      event_location: string;
      purchase_date: string;
    };
    estado: 'activo' | 'usado' | 'cancelado' | 'expirado';
    numero_entrada: number;
    fecha_escaneado?: string | null;
    escaneado_por_nombre?: string | null;
  };
  compact?: boolean;
}

export const QRTicketDisplay: React.FC<QRTicketDisplayProps> = ({ ticket, compact = false }) => {
  const { datos_qr, estado, numero_entrada, fecha_escaneado, escaneado_por_nombre } = ticket;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'activo':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-700',
          icon: CheckCircle2,
          label: 'Válido'
        };
      case 'usado':
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-300',
          text: 'text-gray-700',
          icon: CheckCircle2,
          label: 'Utilizado'
        };
      case 'cancelado':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-700',
          icon: XCircle,
          label: 'Cancelado'
        };
      case 'expirado':
        return {
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          text: 'text-orange-700',
          icon: AlertCircle,
          label: 'Expirado'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-700',
          icon: Ticket,
          label: status
        };
    }
  };

  const statusConfig = getStatusConfig(estado);
  const StatusIcon = statusConfig.icon;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = datos_qr.qr_image;
    link.download = `ticket-${ticket.codigo_qr.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (compact) {
    return (
      <div className={`rounded-xl border-2 ${statusConfig.border} ${statusConfig.bg} p-4 transition-all duration-200`}>
        <div className="flex items-start gap-4">
          {/* QR Code */}
          <div className="flex-shrink-0">
            <img
              src={datos_qr.qr_image}
              alt="Código QR"
              className="w-24 h-24 rounded-lg border-2 border-white shadow-sm"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 truncate">{datos_qr.event_title}</h4>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Entrada #{numero_entrada} - {datos_qr.ticket_type}</p>
            <p className="text-xs text-gray-500">Código: {ticket.codigo_qr.substring(0, 16)}...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border-2 ${statusConfig.border} ${statusConfig.bg} overflow-hidden transition-all duration-200 hover:shadow-lg`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{datos_qr.event_title}</h3>
              <p className="text-blue-100 mt-1">Entrada #{numero_entrada}</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/20 backdrop-blur-sm border-2 border-white/30`}>
            <StatusIcon className="w-4 h-4" />
            {statusConfig.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(datos_qr.event_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{datos_qr.event_time}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 bg-white">
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <img
                src={datos_qr.qr_image}
                alt="Código QR de entrada"
                className="w-64 h-64 rounded-2xl border-4 border-gray-200 shadow-lg"
              />
              {estado !== 'activo' && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-white">
                    <StatusIcon className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-bold text-lg">{statusConfig.label}</p>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleDownload}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Download className="w-4 h-4" />
              Descargar QR
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center max-w-xs">
              Presenta este código en la entrada del evento para validar tu acceso
            </p>
          </div>

          {/* Ticket Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-500 uppercase mb-3">Detalles del Ticket</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{datos_qr.user_name}</p>
                    <p className="text-xs text-gray-600 truncate">{datos_qr.user_email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{datos_qr.event_location}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tipo de Entrada</span>
                  <span className="text-sm font-semibold text-gray-900">{datos_qr.ticket_type}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Precio</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(datos_qr.price)}</span>
                </div>
              </div>
            </div>

            {estado === 'usado' && fecha_escaneado && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-500 uppercase mb-2">Información de Uso</h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    Escaneado el {new Date(fecha_escaneado).toLocaleString('es-ES')}
                  </p>
                  {escaneado_por_nombre && (
                    <p className="text-xs text-gray-600 mt-1">
                      Por: {escaneado_por_nombre}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <span className="font-semibold">Código de verificación:</span>
                <br />
                <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block break-all">
                  {ticket.codigo_qr}
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Comprado el {new Date(datos_qr.purchase_date).toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};
