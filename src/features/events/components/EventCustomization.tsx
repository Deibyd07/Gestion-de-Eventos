import React, { useState } from 'react';
import { Palette, Image, Type, Layout, Eye } from 'lucide-react';

interface EventCustomizationProps {
  onCustomizationChange: (customization: EventCustomizationData) => void;
  initialData?: EventCustomizationData;
}

export interface EventCustomizationData {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layout: 'modern' | 'classic' | 'minimal';
  showSocialLinks: boolean;
  customCSS?: string;
}

const colorPresets = [
  { name: 'Azul Profesional', primary: '#3B82F6', secondary: '#1E40AF' },
  { name: 'Verde Naturaleza', primary: '#10B981', secondary: '#047857' },
  { name: 'Púrpura Creativo', primary: '#8B5CF6', secondary: '#5B21B6' },
  { name: 'Rojo Pasión', primary: '#EF4444', secondary: '#B91C1C' },
  { name: 'Naranja Energía', primary: '#F59E0B', secondary: '#D97706' },
  { name: 'Rosa Elegante', primary: '#EC4899', secondary: '#BE185D' },
];

const fontFamilies = [
  { name: 'Inter (Moderno)', value: 'Inter, sans-serif' },
  { name: 'Roboto (Limpio)', value: 'Roboto, sans-serif' },
  { name: 'Poppins (Amigable)', value: 'Poppins, sans-serif' },
  { name: 'Open Sans (Profesional)', value: 'Open Sans, sans-serif' },
  { name: 'Lato (Elegante)', value: 'Lato, sans-serif' },
];

const layouts = [
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño limpio con gradientes y sombras',
    preview: 'bg-gradient-to-r from-blue-500 to-purple-600'
  },
  {
    id: 'classic',
    name: 'Clásico',
    description: 'Diseño tradicional y profesional',
    preview: 'bg-gray-800'
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Diseño simple y enfocado en el contenido',
    preview: 'bg-white border-2 border-gray-300'
  }
];

export const EventCustomization: React.FC<EventCustomizationProps> = ({
  onCustomizationChange,
  initialData
}) => {
  const [customization, setCustomization] = useState<EventCustomizationData>({
    primaryColor: initialData?.primaryColor || '#3B82F6',
    secondaryColor: initialData?.secondaryColor || '#1E40AF',
    fontFamily: initialData?.fontFamily || 'Inter, sans-serif',
    layout: initialData?.layout || 'modern',
    showSocialLinks: initialData?.showSocialLinks || true,
    customCSS: initialData?.customCSS || ''
  });

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'advanced'>('colors');

  const updateCustomization = (updates: Partial<EventCustomizationData>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    updateCustomization({
      primaryColor: preset.primary,
      secondaryColor: preset.secondary
    });
  };

  const tabs = [
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'typography', label: 'Tipografía', icon: Type },
    { id: 'layout', label: 'Diseño', icon: Layout },
    { id: 'advanced', label: 'Avanzado', icon: Image }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Palette className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Personalización del Evento</h3>
          <p className="text-sm text-gray-500">Personaliza la apariencia de tu página de evento</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            {/* Color Presets */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Paletas Predefinidas</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyColorPreset(preset)}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                  >
                    <div className="flex space-x-2 mb-2">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Principal
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.primaryColor}
                    onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Secundario
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={customization.secondaryColor}
                    onChange={(e) => updateCustomization({ secondaryColor: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customization.secondaryColor}
                    onChange={(e) => updateCustomization({ secondaryColor: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Typography Tab */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuente Principal
              </label>
              <select
                value={customization.fontFamily}
                onChange={(e) => updateCustomization({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Preview */}
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Vista Previa</h4>
              <div
                className="text-2xl font-bold"
                style={{ fontFamily: customization.fontFamily }}
              >
                Título del Evento
              </div>
              <div
                className="text-base mt-2"
                style={{ fontFamily: customization.fontFamily }}
              >
                Descripción del evento con la fuente seleccionada
              </div>
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => updateCustomization({ layout: layout.id as any })}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    customization.layout === layout.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`w-full h-16 rounded mb-3 ${layout.preview}`} />
                  <h4 className="font-medium text-gray-900">{layout.name}</h4>
                  <p className="text-sm text-gray-500">{layout.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={customization.showSocialLinks}
                  onChange={(e) => updateCustomization({ showSocialLinks: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Mostrar enlaces a redes sociales
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSS Personalizado (Opcional)
              </label>
              <textarea
                value={customization.customCSS}
                onChange={(e) => updateCustomization({ customCSS: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="/* Tu CSS personalizado aquí */"
              />
              <p className="mt-1 text-xs text-gray-500">
                Añade estilos CSS personalizados para mayor control
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Vista Previa
        </h4>
        <div
          className="p-6 rounded-lg border border-gray-200"
          style={{
            backgroundColor: customization.primaryColor,
            fontFamily: customization.fontFamily,
            color: 'white'
          }}
        >
          <h3 className="text-xl font-bold mb-2">Mi Evento Personalizado</h3>
          <p className="text-sm opacity-90">
            Esta es una vista previa de cómo se verá tu evento con la personalización seleccionada.
          </p>
        </div>
      </div>
    </div>
  );
};
