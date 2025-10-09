import React from 'react';
import { BasicEventInfo } from './BasicEventInfo.component';
import { TicketTypesManagement } from './TicketTypesManagement.component';
import { FormSteps } from './FormSteps.component';
import { FormNavigation } from './FormNavigation.component';
import { EventPreview } from './EventPreview.component';
import { ImageUpload } from '../ImageUpload.component';
import { EventCustomization } from '../EventCustomization.component';

interface TicketTypeForm {
  name: string;
  price: number;
  description: string;
  maxQuantity: number;
}

interface EventFormData {
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  category: string;
  maxAttendees: number;
  ticketTypes: TicketTypeForm[];
  tags: string;
  customization?: any;
}

interface CreateEventFormProps {
  activeStep: 'basic' | 'tickets' | 'customization';
  setActiveStep: (step: 'basic' | 'tickets' | 'customization') => void;
  ticketTypes: TicketTypeForm[];
  setTicketTypes: (types: TicketTypeForm[]) => void;
  customization: any;
  setCustomization: (customization: any) => void;
  isSubmitting: boolean;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  register: any;
  errors: any;
  watch: any;
  categories: string[];
  addTicketType: () => void;
  removeTicketType: (index: number) => void;
  updateTicketType: (index: number, field: keyof TicketTypeForm, value: string | number) => void;
  onBack: () => void;
  onSubmit: () => void;
  onPreview: () => void;
}

export const CreateEventForm: React.FC<CreateEventFormProps> = ({
  activeStep,
  setActiveStep,
  ticketTypes,
  setTicketTypes,
  customization,
  setCustomization,
  isSubmitting,
  showPreview,
  setShowPreview,
  register,
  errors,
  watch,
  categories,
  addTicketType,
  removeTicketType,
  updateTicketType,
  onBack,
  onSubmit,
  onPreview
}) => {
  const watchedData = watch();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Steps */}
      <FormSteps activeStep={activeStep} setActiveStep={setActiveStep} />

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeStep === 'basic' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Información Básica del Evento</h2>
            
            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen del Evento *
              </label>
              <ImageUpload
                onImageSelect={(imageUrl) => register('image').onChange({ target: { value: imageUrl } })}
                currentImage={watchedData.image}
              />
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
              )}
            </div>

            <BasicEventInfo
              register={register}
              errors={errors}
              categories={categories}
            />
          </div>
        )}

        {activeStep === 'tickets' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Configuración de Entradas</h2>
            <TicketTypesManagement
              ticketTypes={ticketTypes}
              setTicketTypes={setTicketTypes}
              addTicketType={addTicketType}
              removeTicketType={removeTicketType}
              updateTicketType={updateTicketType}
              errors={errors}
            />
          </div>
        )}

        {activeStep === 'customization' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Personalización del Evento</h2>
            <EventCustomization
              customization={customization}
              onCustomizationChange={setCustomization}
            />
          </div>
        )}

        {/* Navigation */}
        <FormNavigation
          activeStep={activeStep}
          setActiveStep={setActiveStep}
          onBack={onBack}
          onSubmit={onSubmit}
          onPreview={onPreview}
          isSubmitting={isSubmitting}
        />
      </div>

      {/* Preview Modal */}
      <EventPreview
        eventData={watchedData}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
};
