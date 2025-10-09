import React from 'react';
import { ArrowLeft, Save, Eye } from 'lucide-react';

interface FormNavigationProps {
  activeStep: 'basic' | 'tickets' | 'customization';
  setActiveStep: (step: 'basic' | 'tickets' | 'customization') => void;
  onBack: () => void;
  onSubmit: () => void;
  onPreview: () => void;
  isSubmitting: boolean;
}

export const FormNavigation: React.FC<FormNavigationProps> = ({
  activeStep,
  setActiveStep,
  onBack,
  onSubmit,
  onPreview,
  isSubmitting
}) => {
  const getNextStep = () => {
    switch (activeStep) {
      case 'basic': return 'tickets';
      case 'tickets': return 'customization';
      case 'customization': return 'customization';
      default: return 'basic';
    }
  };

  const getPrevStep = () => {
    switch (activeStep) {
      case 'tickets': return 'basic';
      case 'customization': return 'tickets';
      case 'basic': return 'basic';
      default: return 'basic';
    }
  };

  const handleNext = () => {
    const nextStep = getNextStep();
    if (nextStep !== activeStep) {
      setActiveStep(nextStep);
    }
  };

  const handlePrev = () => {
    const prevStep = getPrevStep();
    if (prevStep !== activeStep) {
      setActiveStep(prevStep);
    }
  };

  const isLastStep = activeStep === 'customization';
  const isFirstStep = activeStep === 'basic';

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Vista Previa
        </button>

        {!isFirstStep && (
          <button
            type="button"
            onClick={handlePrev}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Anterior
          </button>
        )}

        {!isLastStep ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Creando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Crear Evento
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
