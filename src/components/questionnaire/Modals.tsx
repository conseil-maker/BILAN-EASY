/**
 * Modales du Questionnaire
 * Regroupe les modales de confirmation, aide et déconnexion
 */

import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

/**
 * Composant de base pour les modales
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <h2 id="modal-title" className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

/**
 * Modal de confirmation de déconnexion
 */
interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hasUnsavedChanges?: boolean;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  hasUnsavedChanges = false 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Déconnexion">
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        {hasUnsavedChanges 
          ? "Attention : Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir vous déconnecter ?"
          : "Êtes-vous sûr de vouloir vous déconnecter ? Votre progression est automatiquement sauvegardée."
        }
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Se déconnecter
        </button>
      </div>
    </Modal>
  );
};

/**
 * Modal d'aide et FAQ
 */
interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aide">
      <div className="space-y-4 text-slate-600 dark:text-slate-300">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Comment répondre aux questions ?
          </h3>
          <p className="text-sm">
            Répondez de manière authentique et détaillée. Plus vos réponses sont complètes, 
            plus la synthèse sera pertinente.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Que fait le bouton "J'ai besoin d'aide" ?
          </h3>
          <p className="text-sm">
            Il reformule la question de manière plus simple ou propose un exemple 
            pour vous guider dans votre réflexion.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Ma progression est-elle sauvegardée ?
          </h3>
          <p className="text-sm">
            Oui, votre progression est automatiquement sauvegardée. Vous pouvez 
            reprendre à tout moment là où vous vous êtes arrêté.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            Comment fonctionne la synthèse vocale ?
          </h3>
          <p className="text-sm">
            Cliquez sur l'icône de haut-parleur pour activer/désactiver la lecture 
            vocale des questions. Vous pouvez personnaliser la voix dans les paramètres.
          </p>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Compris
      </button>
    </Modal>
  );
};

/**
 * Modal de confirmation de fin de bilan
 */
interface EndConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDeepen: () => void;
  progressPercentage: number;
}

export const EndConfirmationModal: React.FC<EndConfirmationModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  onDeepen,
  progressPercentage 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Terminer le bilan ?">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Vous avez complété <span className="font-bold text-primary-600">{progressPercentage}%</span> du questionnaire.
        </p>
        
        <p className="text-slate-600 dark:text-slate-300">
          Souhaitez-vous générer votre synthèse maintenant ou approfondir certains aspects ?
        </p>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 Plus vous approfondissez, plus votre synthèse sera riche et personnalisée.
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={onDeepen}
          className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Approfondir encore
        </button>
        <button
          onClick={onConfirm}
          className="w-full px-4 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          Générer ma synthèse
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm"
        >
          Continuer le questionnaire
        </button>
      </div>
    </Modal>
  );
};

/**
 * Modal d'avertissement de fin imminente
 */
interface EndWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingQuestions: number;
}

export const EndWarningModal: React.FC<EndWarningModalProps> = ({ 
  isOpen, 
  onClose, 
  remainingQuestions 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bientôt terminé !">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">
          Il vous reste environ <span className="font-bold text-primary-600">{remainingQuestions} questions</span> avant 
          la fin du questionnaire.
        </p>
        
        <p className="text-slate-600 dark:text-slate-300">
          Prenez le temps de bien répondre à ces dernières questions, elles sont importantes 
          pour finaliser votre profil.
        </p>
      </div>
      
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        Continuer
      </button>
    </Modal>
  );
};

/**
 * Modal de réponse hors-cadre
 */
interface OutOfScopeModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  alternativeResources?: string[];
  onContinue?: () => void;
}

export const OutOfScopeModal: React.FC<OutOfScopeModalProps> = ({ 
  isOpen, 
  onClose, 
  message,
  alternativeResources,
  onContinue 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Information importante">
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">{message}</p>
        
        {alternativeResources && alternativeResources.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Ressources alternatives :
            </p>
            <ul className="text-sm text-blue-700 dark:text-blue-300 list-disc list-inside space-y-1">
              {alternativeResources.map((resource, index) => (
                <li key={index}>{resource}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-6">
        {onContinue && (
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Continuer le bilan
          </button>
        )}
        <button
          onClick={onClose}
          className={`${onContinue ? 'flex-1' : 'w-full'} px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
        >
          Fermer
        </button>
      </div>
    </Modal>
  );
};

export default {
  Modal,
  LogoutModal,
  HelpModal,
  EndConfirmationModal,
  EndWarningModal,
  OutOfScopeModal,
};
