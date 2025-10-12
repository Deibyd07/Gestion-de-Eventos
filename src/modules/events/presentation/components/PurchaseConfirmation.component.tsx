import React, { useState } from 'react';
import { CheckCircle, Download, QrCode, Mail, Calendar, MapPin, Clock, User, CreditCard, Share2 } from 'lucide-react';
// import { QRCodeSVG } from 'qrcode.react';

interface PurchaseConfirmationProps {
  purchase: {
    id: string;
    orderNumber: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    eventImage: string;
    tickets: Array<{
      id: string;
      ticketTypeName: string;
      quantity: number;
      price: number;
      qrCode: string;
    }>;
    totalAmount: number;
    paymentMethod: string;
    purchaseDate: string;
    customerName: string;
    customerEmail: string;
  };
  onDownloadTickets: () => void;
  onEmailTickets: () => void;
  onShareEvent: () => void;
}

export const PurchaseConfirmation: React.FC<PurchaseConfirmationProps> = ({
  purchase,
  onDownloadTickets,
  onEmailTickets,
  onShareEvent
}) => {
  const [selectedTicket, setSelectedTicket] = useState(purchase.tickets[0]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEmailing, setIsEmailing] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownloadTickets();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = async () => {
    setIsEmailing(true);
    try {
      await onEmailTickets();
    } finally {
      setIsEmailing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¡Compra Exitosa!
        </h1>
        <p className="text-lg text-gray-600">
          Tu pedido #{purchase.orderNumber} ha sido confirmado
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Hemos enviado la confirmación a {purchase.customerEmail}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Info */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start space-x-4">
              <img
                src={purchase.eventImage}
                alt={purchase.eventTitle}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {purchase.eventTitle}
                </h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(purchase.eventDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(purchase.eventTime)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{purchase.eventLocation}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tus Entradas</h3>
            <div className="space-y-3">
              {purchase.tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTicket.id === ticket.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{ticket.ticketTypeName}</h4>
                      <p className="text-sm text-gray-600">
                        {ticket.quantity} {ticket.quantity === 1 ? 'entrada' : 'entradas'} × {formatPrice(ticket.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(ticket.price * ticket.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Purchase Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Compra</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Número de orden</span>
                <span className="font-medium">{purchase.orderNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fecha de compra</span>
                <span className="font-medium">{formatDate(purchase.purchaseDate)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Método de pago</span>
                <span className="font-medium">{purchase.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cliente</span>
                <span className="font-medium">{purchase.customerName}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-semibold text-gray-900">Total pagado</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(purchase.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code and Actions */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Código QR de Entrada
            </h3>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                {/* <QRCodeSVG
                  value={selectedTicket.qrCode}
                  size={200}
                  level="M"
                  includeMargin={true}
                /> */}
                <div className="w-[200px] h-[200px] bg-gray-200 flex items-center justify-center text-gray-500">
                  QR Code
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Muestra este código QR en la entrada del evento
            </p>
            <div className="text-xs text-gray-500">
              <p className="font-medium">{selectedTicket.ticketTypeName}</p>
              <p>Entrada #{selectedTicket.id}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? 'Descargando...' : 'Descargar Entradas'}
            </button>

            <button
              onClick={handleEmail}
              disabled={isEmailing}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isEmailing ? 'Enviando...' : 'Enviar por Email'}
            </button>

            <button
              onClick={onShareEvent}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartir Evento
            </button>
          </div>

          {/* Important Notes */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Información Importante</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Guarda este código QR en tu dispositivo</li>
              <li>• Llega 15 minutos antes del evento</li>
              <li>• Presenta una identificación válida</li>
              <li>• Las entradas no son transferibles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
