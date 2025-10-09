import React from 'react';
import { Check } from 'lucide-react';

interface FormStepsProps {
  activeStep: 'basic' | 'tickets' | 'customization';
  setActiveStep: (step: 'basic' | 'tickets' | 'customization') => void;
}

export const FormSteps: React.FC<FormStepsProps> = ({
  activeStep,
  setActiveStep
}) => {
  const steps = [
    { id: 'basic', name: 'Información Básica', description: 'Datos principales del evento' },
    { id: 'tickets', name: 'Tipos de Entrada', description: 'Configurar entradas y precios' },
    { id: 'customization', name: 'Personalización', description: 'Diseño y configuración avanzada' }
  ];

  const getStepStatus = (stepId: string) => {
    if (stepId === activeStep) return 'current';
    if (steps.findIndex(s => s.id === stepId) < steps.findIndex(s => s.id === activeStep)) return 'completed';
    return 'upcoming';
  };

  return (
    <div className="mb-8">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(step.id);
            return (
              <li key={step.id} className={`flex items-center ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center">
                  <button
                    onClick={() => setActiveStep(step.id as any)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      status === 'completed'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : status === 'current'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-500'
                    }`}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{stepIdx + 1}</span>
                    )}
                  </button>
                  <div className="ml-4 min-w-0">
                    <p className={`text-sm font-medium ${
                      status === 'current' ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="flex-1 ml-8">
                    <div className={`h-0.5 ${
                      status === 'completed' ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
