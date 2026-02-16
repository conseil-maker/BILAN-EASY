import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CoachingStyle, Answer } from '../types';
import { 
  getPersonalizedEncouragement, 
  detectThemes, 
  getContextualInsight,
  getProgressFeedback 
} from '../services/enhancedAIService';

interface AIFeedbackProps {
  answers: Answer[];
  coachingStyle: CoachingStyle;
  currentQuestion: number;
  totalQuestions: number;
  isVisible: boolean;
}

export const AIFeedback: React.FC<AIFeedbackProps> = ({
  answers,
  coachingStyle,
  currentQuestion,
  totalQuestions,
  isVisible
}) => {
  const { t } = useTranslation('questionnaire');
  const [encouragement, setEncouragement] = useState('');
  const [insight, setInsight] = useState<string | undefined>();
  const [progressFeedback, setProgressFeedback] = useState('');
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    if (answers.length > 0) {
      setEncouragement(getPersonalizedEncouragement(coachingStyle, answers.length));
      const detectedThemes = detectThemes(answers);
      setThemes(detectedThemes);
      setInsight(getContextualInsight(detectedThemes));
      setProgressFeedback(getProgressFeedback(currentQuestion, totalQuestions));
    }
  }, [answers, coachingStyle, currentQuestion, totalQuestions]);

  if (!isVisible || answers.length === 0) return null;

  const progress = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-4 border border-indigo-100 dark:border-indigo-800">
      {/* Barre de progression visuelle */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-indigo-600 dark:text-indigo-400 mb-1">
          <span>{t('aiFeedback.progress', 'Progression')}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Message d'encouragement */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm">💬</span>
        </div>
        <div>
          <p className="text-sm text-indigo-800 dark:text-indigo-200 font-medium">
            {encouragement}
          </p>
        </div>
      </div>

      {/* Insight contextuel */}
      {insight && (
        <div className="bg-white/50 dark:bg-white/5 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-amber-500">💡</span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              {t('aiFeedback.didYouKnow', 'Le saviez-vous ?')}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 italic">
            {insight}
          </p>
        </div>
      )}

      {/* Thèmes détectés */}
      {themes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{t('aiFeedback.identifiedThemes', 'Thèmes identifiés')} :</span>
          {themes.map((theme, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full text-xs"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Feedback de progression */}
      <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {progressFeedback}
        </p>
      </div>
    </div>
  );
};

// Composant de transition entre phases
interface PhaseTransitionProps {
  fromPhase: string;
  toPhase: string;
  userName: string;
  onContinue: () => void;
}

export const PhaseTransition: React.FC<PhaseTransitionProps> = ({
  fromPhase,
  toPhase,
  userName,
  onContinue
}) => {
  const { t } = useTranslation('questionnaire');
  const phaseNames: Record<string, string> = {
    'phase1': t('aiFeedback.phaseNames.phase1'),
    'phase2': t('aiFeedback.phaseNames.phase2'),
    'phase3': t('aiFeedback.phaseNames.phase3'),
  };

  const phaseIcons: Record<string, string> = {
    'phase1': '🔍',
    'phase2': '💪',
    'phase3': '🎯',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {t('aiFeedback.phaseCompleted', 'Phase terminée !')}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {t('aiFeedback.bravo', { name: userName, phase: phaseNames[fromPhase] })}
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-1">
              <span className="text-xl">{phaseIcons[fromPhase]}</span>
            </div>
            <span className="text-xs text-gray-500">{phaseNames[fromPhase]}</span>
          </div>
          <div className="text-2xl text-gray-400">→</div>
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-1 ring-2 ring-indigo-500">
              <span className="text-xl">{phaseIcons[toPhase]}</span>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {phaseNames[toPhase]}
            </span>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all"
        >
          {t('aiFeedback.continueToPhase', { phase: phaseNames[toPhase] })}
        </button>
      </div>
    </div>
  );
};

// Composant de tips contextuels
interface ContextualTipProps {
  tip: string;
  type: 'info' | 'success' | 'warning';
  onDismiss: () => void;
}

export const ContextualTip: React.FC<ContextualTipProps> = ({
  tip,
  type,
  onDismiss
}) => {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
  };

  const icons = {
    info: '💡',
    success: '✅',
    warning: '⚠️',
  };

  return (
    <div className={`${styles[type]} border rounded-lg p-3 flex items-start gap-3 animate-fade-in`}>
      <span className="text-lg">{icons[type]}</span>
      <p className="flex-1 text-sm">{tip}</p>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};

export default AIFeedback;
