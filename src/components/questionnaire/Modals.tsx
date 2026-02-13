/**
 * Modales du Questionnaire
 * Regroupe les modales de confirmation, aide et déconnexion
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('questionnaire');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.logout.title')}>
      <p className="text-slate-600 dark:text-slate-300 mb-6">
        {hasUnsavedChanges 
          ? t('modals.logout.unsavedWarning')
          : t('modals.logout.confirmMessage')
        }
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          {t('modals.logout.cancel')}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t('modals.logout.confirm')}
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
  const { t } = useTranslation('questionnaire');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.help.title')}>
      <div className="space-y-4 text-slate-600 dark:text-slate-300">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {t('modals.help.howToAnswer')}
          </h3>
          <p className="text-sm">
            {t('modals.help.howToAnswerDesc')}
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {t('modals.help.jokerButton')}
          </h3>
          <p className="text-sm">
            {t('modals.help.jokerButtonDesc')}
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {t('modals.help.progressSaved')}
          </h3>
          <p className="text-sm">
            {t('modals.help.progressSavedDesc')}
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {t('modals.help.speechSynthesis')}
          </h3>
          <p className="text-sm">
            {t('modals.help.speechSynthesisDesc')}
          </p>
        </div>
      </div>
      
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t('modals.help.understood')}
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
  const { t } = useTranslation('questionnaire');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.endConfirmation.title')}>
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{
          __html: t('modals.endConfirmation.progress', { percent: progressPercentage })
        }} />
        
        <p className="text-slate-600 dark:text-slate-300">
          {t('modals.endConfirmation.question')}
        </p>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            💡 {t('modals.endConfirmation.hint')}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 mt-6">
        <button
          onClick={onDeepen}
          className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {t('modals.endConfirmation.deepen')}
        </button>
        <button
          onClick={onConfirm}
          className="w-full px-4 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
        >
          {t('modals.endConfirmation.generate')}
        </button>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors text-sm"
        >
          {t('modals.endConfirmation.continue')}
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
  const { t } = useTranslation('questionnaire');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.endWarning.title')}>
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{
          __html: t('modals.endWarning.remaining', { count: remainingQuestions })
        }} />
        
        <p className="text-slate-600 dark:text-slate-300">
          {t('modals.endWarning.advice')}
        </p>
      </div>
      
      <button
        onClick={onClose}
        className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
      >
        {t('modals.endWarning.continue')}
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
  const { t } = useTranslation('questionnaire');
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modals.outOfScope.title')}>
      <div className="space-y-4">
        <p className="text-slate-600 dark:text-slate-300">{message}</p>
        
        {alternativeResources && alternativeResources.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
              {t('modals.outOfScope.alternativeResources')}
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
            {t('modals.outOfScope.continueAssessment')}
          </button>
        )}
        <button
          onClick={onClose}
          className={`${onContinue ? 'flex-1' : 'w-full'} px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
        >
          {t('modals.outOfScope.close')}
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
