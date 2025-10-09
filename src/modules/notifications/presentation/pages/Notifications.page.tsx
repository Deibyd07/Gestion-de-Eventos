import { useState } from 'react';
import { Bell, Mail, Settings, Send, Users, Calendar } from 'lucide-react';
import { useNotificationStore } from '../../../notifications/infrastructure/store/Notification.store';
import { useAuthStore } from '../../../authentication/infrastructure/store/Auth.store';
import { EmailTemplateManager } from '../../../events/presentation/components/EmailTemplateManager.component';
import { NotificationCenter } from '../../../events/presentation/components/NotificationCenter.component';

export function NotificationsPage() {
  const { user } = useAuthStore();
  const { getUserNotifications, sendEmail, emailTemplates } = useNotificationStore();
  const [activeTab, setActiveTab] = useState('notifications');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [recipientEmail, setRecientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const notifications = user ? getUserNotifications(user.id) : [];

  const handleSendEmail = async () => {
    if (!selectedTemplate || !recipientEmail) return;

    setIsSending(true);
    try {
      const success = await sendEmail(selectedTemplate, recipientEmail, {
        name: user?.name || 'Usuario',
        eventTitle: 'Evento de Prueba',
        eventDate: new Date().toLocaleDateString('es-ES'),
        eventTime: '19:00',
        eventLocation: 'Madrid, España',
        ticketType: 'General',
        total: '50'
      });

      if (success) {
        alert('Email enviado correctamente');
        setRecientEmail('');
        setSelectedTemplate('');
      } else {
        alert('Error al enviar el email');
      }
    } catch (error) {
      alert('Error al enviar el email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Centro de Notificaciones
        </h1>
        <p className="text-gray-600">
          Gestiona tus notificaciones y plantillas de email
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4 mr-2 inline" />
              Notificaciones
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4 mr-2 inline" />
              Plantillas de Email
            </button>
            <button
              onClick={() => setActiveTab('send')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'send'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Send className="w-4 h-4 mr-2 inline" />
              Enviar Email
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Tus Notificaciones</h2>
                <NotificationCenter />
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read 
                          ? 'bg-white border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes notificaciones
                  </h3>
                  <p className="text-gray-600">
                    Te notificaremos cuando tengas actualizaciones importantes.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'templates' && (
            <EmailTemplateManager />
          )}

          {activeTab === 'send' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Enviar Email de Prueba</h2>
                <p className="text-gray-600 mb-6">
                  Envía un email de prueba usando una de tus plantillas para verificar que todo funciona correctamente.
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plantilla de Email
                    </label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Selecciona una plantilla</option>
                      {emailTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Destino
                    </label>
                    <input
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecientEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="usuario@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleSendEmail}
                    disabled={!selectedTemplate || !recipientEmail || isSending}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Email de Prueba
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Users className="w-8 h-8 mr-3" />
                    <h3 className="text-lg font-semibold">Notificar Asistentes</h3>
                  </div>
                  <p className="text-blue-100 mb-4">
                    Envía notificaciones masivas a todos los asistentes de un evento.
                  </p>
                  <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200">
                    Configurar
                  </button>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Calendar className="w-8 h-8 mr-3" />
                    <h3 className="text-lg font-semibold">Recordatorios Automáticos</h3>
                  </div>
                  <p className="text-green-100 mb-4">
                    Programa recordatorios automáticos para tus eventos.
                  </p>
                  <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200">
                    Configurar
                  </button>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Settings className="w-8 h-8 mr-3" />
                    <h3 className="text-lg font-semibold">Configuración</h3>
                  </div>
                  <p className="text-purple-100 mb-4">
                    Personaliza las preferencias de notificaciones.
                  </p>
                  <button className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200">
                    Configurar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


