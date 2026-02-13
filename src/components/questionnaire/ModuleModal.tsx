/**
 * ModuleModal - Modal de proposition d'approfondissement
 * 
 * Propose à l'utilisateur d'explorer un sujet avec des questions supplémentaires.
 * Utilisé pour les modules optionnels d'approfondissement.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface ModuleModalProps {
  reason: string;
  onAccept: () => void;
  onDecline: () => void;
}

const ModuleModal: React.FC<ModuleModalProps> = ({ reason, onAccept, onDecline }) => {
  const { t } = useTranslation('questionnaire');
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold font-display text-primary-800 mb-2">
          {t('modals.module.title')}
        </h2>
        <p className="text-slate-600 mb-4">{reason}</p>
        <p className="text-sm text-slate-500 mb-6">
          {t('modals.module.description')}
        </p>
        <div className="flex gap-4">
          <button 
            onClick={onAccept} 
            className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700"
          >
            {t('modals.module.accept')}
          </button>
          <button 
            onClick={onDecline} 
            className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300"
          >
            {t('modals.module.decline')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
