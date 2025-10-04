import React, { useState } from 'react';
import { Mail, Plus, Edit, Trash2, Eye, Save, X, Code, Palette, Type } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'welcome' | 'reminder' | 'confirmation' | 'cancellation' | 'survey';
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmailTemplateManagerProps {
  templates: EmailTemplate[];
  onSaveTemplate: (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateTemplate: (id: string, template: Partial<EmailTemplate>) => void;
  onDeleteTemplate: (id: string) => void;
  onPreviewTemplate: (template: EmailTemplate) => void;
}

const templateTypes = [
  { value: 'welcome', label: 'Bienvenida', description: 'Email de bienvenida para nuevos usuarios' },
  { value: 'reminder', label: 'Recordatorio', description: 'Recordatorio de evento próximo' },
  { value: 'confirmation', label: 'Confirmación', description: 'Confirmación de compra de entrada' },
  { value: 'cancellation', label: 'Cancelación', description: 'Notificación de evento cancelado' },
  { value: 'survey', label: 'Encuesta', description: 'Solicitud de feedback post-evento' }
];

const availableVariables = [
  { name: '{{nombre}}', description: 'Nombre del usuario' },
  { name: '{{email}}', description: 'Email del usuario' },
  { name: '{{titulo_evento}}', description: 'Título del evento' },
  { name: '{{fecha_evento}}', description: 'Fecha del evento' },
  { name: '{{hora_evento}}', description: 'Hora del evento' },
  { name: '{{ubicacion}}', description: 'Ubicación del evento' },
  { name: '{{tipo_entrada}}', description: 'Tipo de entrada comprada' },
  { name: '{{precio}}', description: 'Precio pagado' },
  { name: '{{codigo_qr}}', description: 'Código QR de la entrada' },
  { name: '{{enlace_evento}}', description: 'Enlace al evento' }
];

export const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({
  templates,
  onSaveTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onPreviewTemplate
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'visual' | 'html'>('visual');

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
    type: 'welcome' as EmailTemplate['type'],
    variables: [] as string[],
    isActive: true
  });

  const getTypeLabel = (type: string) => {
    return templateTypes.find(t => t.value === type)?.label || type;
  };

  const getTypeDescription = (type: string) => {
    return templateTypes.find(t => t.value === type)?.description || '';
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    onSaveTemplate(newTemplate);
    setNewTemplate({
      name: '',
      subject: '',
      content: '',
      type: 'welcome',
      variables: [],
      isActive: true
    });
    setShowCreateForm(false);
  };

  const handleUpdateTemplate = () => {
    if (!editingTemplate) return;

    onUpdateTemplate(editingTemplate.id, editingTemplate);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta plantilla?')) {
      onDeleteTemplate(id);
    }
  };

  const insertVariable = (variable: string) => {
    if (editingTemplate) {
      const updatedTemplate = {
        ...editingTemplate,
        content: editingTemplate.content + variable
      };
      setEditingTemplate(updatedTemplate);
    } else {
      setNewTemplate({
        ...newTemplate,
        content: newTemplate.content + variable
      });
    }
  };

  const generatePreview = (template: EmailTemplate) => {
    let preview = template.content;
    
    // Replace variables with sample data
    preview = preview.replace(/\{\{nombre\}\}/g, 'Juan Pérez');
    preview = preview.replace(/\{\{email\}\}/g, 'juan.perez@email.com');
    preview = preview.replace(/\{\{titulo_evento\}\}/g, 'Conferencia Tech 2024');
    preview = preview.replace(/\{\{fecha_evento\}\}/g, '15 de marzo de 2024');
    preview = preview.replace(/\{\{hora_evento\}\}/g, '09:00 AM');
    preview = preview.replace(/\{\{ubicacion\}\}/g, 'Centro de Convenciones, Madrid');
    preview = preview.replace(/\{\{tipo_entrada\}\}/g, 'General');
    preview = preview.replace(/\{\{precio\}\}/g, '$50.000 COP');
    preview = preview.replace(/\{\{codigo_qr\}\}/g, 'QR-123456789');
    preview = preview.replace(/\{\{enlace_evento\}\}/g, 'https://eventhub.com/event/123');
    
    return preview;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Gestor de Plantillas de Email</h3>
          <p className="text-sm text-gray-500">Crea y gestiona plantillas de email para tus eventos</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Plantilla
        </button>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-500">{getTypeLabel(template.type)}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPreviewTemplate(template)}
                  className="p-1 text-gray-400 hover:text-blue-600"
                  title="Vista previa"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingTemplate(template)}
                  className="p-1 text-gray-400 hover:text-green-600"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-gray-500">Asunto:</span>
                <p className="text-sm text-gray-900 truncate">{template.subject}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  template.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(template.updatedAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Template Form */}
      {showCreateForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Crear Nueva Plantilla</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Plantilla *
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Bienvenida a EventHub"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Plantilla *
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as EmailTemplate['type'] })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {templateTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {getTypeDescription(newTemplate.type)}
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asunto del Email *
              </label>
              <input
                type="text"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="¡Bienvenido a EventHub!"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Email *
              </label>
              <div className="border border-gray-300 rounded-lg">
                <div className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-300">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setActiveTab('visual')}
                      className={`flex items-center px-3 py-1 text-sm rounded ${
                        activeTab === 'visual' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      <Type className="w-4 h-4 mr-1" />
                      Visual
                    </button>
                    <button
                      onClick={() => setActiveTab('html')}
                      className={`flex items-center px-3 py-1 text-sm rounded ${
                        activeTab === 'html' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      <Code className="w-4 h-4 mr-1" />
                      HTML
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  {activeTab === 'visual' ? (
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Escribe el contenido del email aquí..."
                    />
                  ) : (
                    <textarea
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                      rows={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="<html><body>...</body></html>"
                    />
                  )}
                </div>
              </div>
            </div>
            
            {/* Variables */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variables Disponibles
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableVariables.map((variable) => (
                  <button
                    key={variable.name}
                    onClick={() => insertVariable(variable.name)}
                    className="p-2 text-left border border-gray-200 rounded-lg hover:bg-gray-50 text-sm"
                    title={variable.description}
                  >
                    <code className="text-blue-600">{variable.name}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateTemplate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2 inline" />
              Crear Plantilla
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Vista Previa</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">Asunto:</h4>
                <p className="text-gray-600">{previewTemplate.subject}</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-2">Contenido:</h4>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: generatePreview(previewTemplate) }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};