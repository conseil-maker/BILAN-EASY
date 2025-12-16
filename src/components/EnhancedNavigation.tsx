import React from 'react';

export type BilanPhase = 
  | 'welcome'
  | 'package-selection'
  | 'preliminary-phase'
  | 'personalization-step'
  | 'questionnaire'
  | 'completion'
  | 'summary'
  | 'history';

interface PhaseInfo {
  id: BilanPhase;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  qualiopi?: string;
}

const PHASES: PhaseInfo[] = [
  {
    id: 'welcome',
    label: 'Accueil',
    shortLabel: 'Accueil',
    description: 'Bienvenue sur votre espace',
    icon: '👋',
  },
  {
    id: 'package-selection',
    label: 'Choix du forfait',
    shortLabel: 'Forfait',
    description: 'Sélectionnez votre parcours',
    icon: '📦',
  },
  {
    id: 'preliminary-phase',
    label: 'Phase préliminaire',
    shortLabel: 'Préliminaire',
    description: 'Objectifs et consentement',
    icon: '📋',
    qualiopi: 'Art. L.6313-4',
  },
  {
    id: 'personalization-step',
    label: 'Personnalisation',
    shortLabel: 'Profil',
    description: 'Adaptez votre parcours',
    icon: '🎯',
  },
  {
    id: 'questionnaire',
    label: 'Phase d\'investigation',
    shortLabel: 'Investigation',
    description: 'Exploration approfondie',
    icon: '🔍',
    qualiopi: 'Art. R.6313-4',
  },
  {
    id: 'completion',
    label: 'Phase de conclusion',
    shortLabel: 'Conclusion',
    description: 'Synthèse et documents',
    icon: '📄',
    qualiopi: 'Art. R.6313-8',
  },
];

interface EnhancedNavigationProps {
  currentPhase: BilanPhase;
  userName?: string;
  packageName?: string;
  progress?: number;
  timeSpent?: number;
  totalTime?: number;
}

export const EnhancedNavigation: React.FC<EnhancedNavigationProps> = ({
  currentPhase,
  userName,
  packageName,
  progress = 0,
  timeSpent = 0,
  totalTime = 120,
}) => {
  const currentIndex = PHASES.findIndex(p => p.id === currentPhase);
  const currentPhaseInfo = PHASES[currentIndex];

  // Ne pas afficher sur l'écran d'accueil
  if (currentPhase === 'welcome' || currentPhase === 'history') {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Barre de progression globale */}
      <div className="h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Fil d'Ariane */}
          <nav className="flex items-center space-x-2 text-sm overflow-x-auto">
            {PHASES.slice(0, currentIndex + 1).map((phase, index) => (
              <React.Fragment key={phase.id}>
                {index > 0 && (
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                <span
                  className={`flex items-center gap-1 whitespace-nowrap ${
                    index === currentIndex
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span className="hidden sm:inline">{phase.icon}</span>
                  <span className="hidden md:inline">{phase.label}</span>
                  <span className="md:hidden">{phase.shortLabel}</span>
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Informations contextuelles */}
          <div className="flex items-center gap-4 text-sm">
            {userName && (
              <span className="hidden lg:flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {userName}
              </span>
            )}
            
            {packageName && (
              <span className="hidden md:flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-medium">
                {packageName}
              </span>
            )}

            {/* Timer */}
            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono">{timeSpent} / {totalTime} min</span>
            </span>

            {/* Progression */}
            <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Info Qualiopi si applicable */}
        {currentPhaseInfo?.qualiopi && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
              Qualiopi
            </span>
            <span>{currentPhaseInfo.qualiopi} - {currentPhaseInfo.description}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant de progression détaillée pour le questionnaire
interface QuestionnaireProgressProps {
  currentPhase: string;
  totalPhases: number;
  currentQuestion: number;
  totalQuestions: number;
  timeSpent: number;
  estimatedTimeRemaining: number;
  themes: string[];
}

export const QuestionnaireProgress: React.FC<QuestionnaireProgressProps> = ({
  currentPhase,
  totalPhases,
  currentQuestion,
  totalQuestions,
  timeSpent,
  estimatedTimeRemaining,
  themes,
}) => {
  const phaseProgress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-4">
      {/* Phase actuelle */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentPhase}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentQuestion}/{totalQuestions}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
      </div>

      {/* Temps */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Temps écoulé: {Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
        </div>
        <div className="text-indigo-600 dark:text-indigo-400">
          ~{estimatedTimeRemaining} min restantes
        </div>
      </div>

      {/* Thèmes détectés */}
      {themes.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Thèmes émergents</p>
          <div className="flex flex-wrap gap-1">
            {themes.slice(0, 5).map((theme, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-xs"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedNavigation;
