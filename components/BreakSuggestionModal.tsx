import React from 'react';

interface BreakSuggestionModalProps {
  isOpen: boolean;
  onContinue: () => void;
  onTakeBreak: () => void;
  questionsCompleted: number;
  totalQuestions: number;
}

const BreakSuggestionModal: React.FC<BreakSuggestionModalProps> = ({
  isOpen,
  onContinue,
  onTakeBreak,
  questionsCompleted,
  totalQuestions,
}) => {
  if (!isOpen) return null;

  const progress = Math.round((questionsCompleted / totalQuestions) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-4">☕</div>
          <h2 className="text-2xl font-bold text-primary-800 dark:text-primary-200 mb-2">
            Prenez une pause ?
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Vous avez complété <strong>{questionsCompleted}</strong> sur <strong>{totalQuestions}</strong> questions ({progress}%).
          </p>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Une petite pause peut vous aider à rester concentré et à donner de meilleures réponses.
          </p>
        </div>

        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            <strong>💾 Votre progression est sauvegardée automatiquement.</strong> Vous pouvez reprendre exactement où vous vous êtes arrêté.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
          >
            Continuer
          </button>
          <button
            onClick={onTakeBreak}
            className="flex-1 bg-primary-600 dark:bg-primary-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors"
          >
            Prendre une pause
          </button>
        </div>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Vous pouvez également revenir plus tard depuis l'historique.
        </p>
      </div>
    </div>
  );
};

export default BreakSuggestionModal;

