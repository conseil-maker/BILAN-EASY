import React from 'react';
import { useTranslation } from 'react-i18next';

const CoachChat: React.FC = () => {
  const { t } = useTranslation('common');
  return (
    <div className="flex items-center justify-center h-screen bg-slate-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-primary-800 mb-4">Coach Chat</h1>
        <p className="text-slate-600">{t('featureInDevelopment', 'Cette fonctionnalité est en cours de développement.')}</p>
      </div>
    </div>
  );
};

export default CoachChat;
