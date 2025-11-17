import { useState, useEffect } from 'react';
import { QrCode, Ticket, ArrowLeft } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { TicketViewerModal } from '@shared/ui/components/TicketViewer/TicketViewerModal.component';

export function TicketConsultPage() {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const qrCodeFromUrl = searchParams.get('code');

  // Si viene un código en la URL, abrir el modal automáticamente
  useEffect(() => {
    if (qrCodeFromUrl) {
      setIsViewerOpen(true);
    }
  }, [qrCodeFromUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al Inicio</span>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                EventHub
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-xl mb-6">
            <QrCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Consulta tu Entrada
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Verifica la información de tu ticket ingresando el código QR que recibiste al comprar tu entrada
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Verifica tu Ticket</h3>
            <p className="text-sm text-gray-600">
              Consulta el estado y detalles de tu entrada de forma rápida y segura
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Ticket className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Información Completa</h3>
            <p className="text-sm text-gray-600">
              Ve todos los detalles del evento, ubicación, fecha, hora y más
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-6 border border-white/20 shadow-lg">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Seguro y Privado</h3>
            <p className="text-sm text-gray-600">
              Tu consulta no registra asistencia, solo muestra información
            </p>
          </div>
        </div>

        {/* CTA Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl shadow-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">¿Tienes tu código QR?</h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            Haz clic en el botón de abajo para ingresar el código de tu entrada y ver toda la información
          </p>
          <button
            onClick={() => setIsViewerOpen(true)}
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <QrCode className="w-5 h-5" />
            <span>Consultar mi Entrada</span>
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-lg rounded-xl border border-white/20">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Información Importante</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>Esta consulta <strong>NO registra tu asistencia</strong> al evento. Es solo para verificar información.</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>El código QR se encuentra en el correo que recibiste después de tu compra.</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>El registro de asistencia se realiza en la puerta del evento por parte de los organizadores.</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>Si tu entrada aparece como "Ya Utilizada", significa que ya ingresaste al evento.</span>
            </li>
          </ul>
        </div>
      </main>

      {/* Ticket Viewer Modal */}
      <TicketViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        initialCode={qrCodeFromUrl || undefined}
      />
    </div>
  );
}
