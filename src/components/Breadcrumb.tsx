import React from 'react';
import { ChevronRight, Home, CheckCircle, Circle, Clock } from 'lucide-react';

export interface BreadcrumbStep {
  id: string;
  label: string;
  status: 'completed' | 'current' | 'upcoming';
  duration?: number; // en minutes
}

interface BreadcrumbProps {
  steps: BreadcrumbStep[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  showDuration?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  steps,
  currentStepId,
  onStepClick,
  showDuration = false
}) => {
  const getStepIcon = (status: BreadcrumbStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={18} className="text-green-500" />;
      case 'current':
        return <div className="w-4 h-4 rounded-full bg-indigo-600 animate-pulse" />;
      case 'upcoming':
        return <Circle size={18} className="text-gray-300 dark:text-gray-600" />;
    }
  };

  const getStepStyle = (status: BreadcrumbStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400';
      case 'current':
        return 'text-indigo-600 dark:text-indigo-400 font-semibold';
      case 'upcoming':
        return 'text-gray-400 dark:text-gray-500';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center flex-wrap gap-2">
          <li className="flex items-center">
            <Home size={18} className="text-gray-400" />
          </li>
          
          {steps.map((step, index) => (
            <li key={step.id} className="flex items-center">
              <ChevronRight size={16} className="text-gray-300 dark:text-gray-600 mx-2" />
              
              <button
                onClick={() => step.status === 'completed' && onStepClick?.(step.id)}
                disabled={step.status === 'upcoming'}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                  step.status === 'completed' && onStepClick
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                    : step.status === 'upcoming'
                    ? 'cursor-not-allowed'
                    : ''
                } ${getStepStyle(step.status)}`}
              >
                {getStepIcon(step.status)}
                <span className="text-sm">{step.label}</span>
                {showDuration && step.duration && (
                  <span className="flex items-center text-xs text-gray-400 ml-1">
                    <Clock size={12} className="mr-1" />
                    {step.duration}min
                  </span>
                )}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

// Version compacte pour mobile
export const BreadcrumbCompact: React.FC<BreadcrumbProps> = ({
  steps,
  currentStepId
}) => {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  const currentStep = steps[currentIndex];
  const completedCount = steps.filter(s => s.status === 'completed').length;
  
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'current'
                    ? 'bg-indigo-600 w-3 h-3'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            {completedCount}/{steps.length}
          </span>
        </div>
        
        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {currentStep?.label}
        </span>
      </div>
    </div>
  );
};

// Fil d'Ariane spécifique au bilan de compétences
export const BilanBreadcrumb: React.FC<{
  currentPhase: 'preliminary' | 'investigation' | 'conclusion' | 'satisfaction';
  currentCategory?: string;
  progress: number; // 0-100
}> = ({ currentPhase, currentCategory, progress }) => {
  const phases = [
    { id: 'preliminary', label: 'Phase préliminaire', percentage: 17 },
    { id: 'investigation', label: 'Phase d\'investigation', percentage: 50 },
    { id: 'conclusion', label: 'Phase de conclusion', percentage: 17 },
    { id: 'satisfaction', label: 'Évaluation', percentage: 16 }
  ];

  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Barre de progression globale */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="px-4 py-3">
        <div className="max-w-7xl mx-auto">
          {/* Phases */}
          <div className="flex items-center justify-between mb-2">
            {phases.map((phase, index) => (
              <React.Fragment key={phase.id}>
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    index < currentPhaseIndex
                      ? 'bg-green-500 text-white'
                      : index === currentPhaseIndex
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {index < currentPhaseIndex ? (
                      <CheckCircle size={18} />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`text-xs mt-1 text-center hidden sm:block ${
                    index === currentPhaseIndex
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {phase.label}
                  </span>
                </div>
                
                {index < phases.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    index < currentPhaseIndex
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Catégorie actuelle */}
          {currentCategory && (
            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Catégorie actuelle : 
              </span>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 ml-1">
                {currentCategory}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
