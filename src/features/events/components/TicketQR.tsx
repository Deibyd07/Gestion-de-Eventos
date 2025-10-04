import QRCodeSVG from 'react-qr-code';
import { Download, Calendar, MapPin, Clock, User, Ticket } from 'lucide-react';
import { Purchase } from '../../../core/stores/purchaseStore';
import { formatPriceDisplay } from '../../../shared/utils/currency';

interface TicketQRProps {
  purchase: Purchase;
  eventDetails?: {
    title: string;
    date: string;
    time: string;
    location: string;
    image: string;
  };
}

export function TicketQR({ purchase, eventDetails }: TicketQRProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    // Create a printable version of the ticket
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket - ${purchase.eventTitle}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
              .ticket { border: 2px solid #000; padding: 20px; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; }
              .qr-code { text-align: center; margin: 20px 0; }
              .details { margin: 20px 0; }
              .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <h1>${purchase.eventTitle}</h1>
                <p>${purchase.ticketTypeName}</p>
              </div>
              <div class="qr-code">
                <svg viewBox="0 0 200 200" width="200" height="200">
                  ${document.querySelector('#qr-code svg')?.innerHTML || ''}
                </svg>
              </div>
              <div class="details">
                <div class="detail-row">
                  <span>Fecha:</span>
                  <span>${eventDetails?.date || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span>Hora:</span>
                  <span>${eventDetails?.time || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span>Ubicación:</span>
                  <span>${eventDetails?.location || 'N/A'}</span>
                </div>
                <div class="detail-row">
                  <span>Cantidad:</span>
                  <span>${purchase.quantity}</span>
                </div>
                <div class="detail-row">
                  <span>Total:</span>
                  <span>${formatPriceDisplay(purchase.total)}</span>
                </div>
              </div>
              <div class="footer">
                <p>Presenta este código QR en la entrada del evento</p>
                <p>ID: ${purchase.id}</p>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{purchase.eventTitle}</h2>
            <p className="text-blue-100 mt-1">{purchase.ticketTypeName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{formatPriceDisplay(purchase.total)}</div>
            <div className="text-blue-100 text-sm">Total</div>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="p-6 text-center">
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          <QRCodeSVG
            id="qr-code"
            value={purchase.qrCode}
            size={200}
            level="M"
          />
        </div>
        <p className="text-sm text-gray-600 mt-4">
          Presenta este código QR en la entrada
        </p>
      </div>

      {/* Event Details */}
      {eventDetails && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{formatDate(eventDetails.date)}</div>
                <div className="text-sm text-gray-500">Fecha del evento</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-700">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="font-medium">{eventDetails.time}</div>
                <div className="text-sm text-gray-500">Hora de inicio</div>
              </div>
            </div>

            <div className="flex items-center space-x-3 text-gray-700 md:col-span-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="font-medium">{eventDetails.location}</div>
                <div className="text-sm text-gray-500">Ubicación</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Details */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <Ticket className="w-4 h-4" />
            <span>Cantidad: {purchase.quantity}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>ID: {purchase.id.slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar Ticket
          </button>
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Imprimir Ticket
          </button>
        </div>
      </div>
    </div>
  );
}
