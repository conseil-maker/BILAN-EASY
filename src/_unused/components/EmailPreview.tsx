import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { emailTemplates } from '../services/emailService';
import { gmailTemplates } from '../services/gmailService';

interface EmailPreviewProps {
  onClose: () => void;
}

type EmailType = 'welcome' | 'appointmentConfirmation' | 'appointmentReminder' | 'bilanCompleted' | 'followUp6Months';

const emailTypeLabels: Record<EmailType, string> = {
  welcome: 'Email de bienvenue',
  appointmentConfirmation: 'Confirmation de rendez-vous',
  appointmentReminder: 'Rappel de rendez-vous',
  bilanCompleted: 'Bilan terminé',
  followUp6Months: 'Suivi à 6 mois',
};

export const EmailPreview: React.FC<EmailPreviewProps> = ({ onClose }) => {
  const { t } = useTranslation('admin');
  const [selectedType, setSelectedType] = useState<EmailType>('welcome');
  const [viewMode, setViewMode] = useState<'html' | 'text'>('html');

  // Données de test
  const testData = {
    userName: 'Jean Dupont',
    packageName: 'Premium',
    date: '20 décembre 2025',
    time: '10:00',
    type: 'Entretien initial',
    consultantName: 'Mikail LEKESIZ',
  };

  const getTemplate = () => {
    switch (selectedType) {
      case 'welcome':
        return emailTemplates.welcome(testData.userName, testData.packageName);
      case 'appointmentConfirmation':
        return emailTemplates.appointmentConfirmation(
          testData.userName,
          testData.date,
          testData.time,
          testData.type,
          testData.consultantName
        );
      case 'appointmentReminder':
        return emailTemplates.appointmentReminder(
          testData.userName,
          testData.date,
          testData.time,
          testData.type
        );
      case 'bilanCompleted':
        return emailTemplates.bilanCompleted(testData.userName);
      case 'followUp6Months':
        return emailTemplates.followUp6Months(testData.userName);
      default:
        return emailTemplates.welcome(testData.userName, testData.packageName);
    }
  };

  const template = getTemplate();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{t('emails.preview', '📧 Prévisualisation des emails')}</h2>
            <p className="text-sm opacity-80">{t('emails.templates', 'Templates automatiques')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b dark:border-gray-700 flex flex-wrap gap-4">
          {/* Type selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('emails.type', "Type d'email")}
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as EmailType)}
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            >
              {Object.entries(emailTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* View mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Format
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('html')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'html'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                HTML
              </button>
              <button
                onClick={() => setViewMode('text')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  viewMode === 'text'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {t('emails.text', 'Texte')}
              </button>
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">{t('emails.subject', 'Objet')} : </span>
          <span className="font-medium text-gray-800 dark:text-white">{template.subject}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {viewMode === 'html' ? (
            <div 
              className="bg-white rounded-lg shadow-inner"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.html) }}
            />
          ) : (
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              {template.text}
            </pre>
          )}
        </div>

        {/* Gmail Preview */}
        <div className="p-4 border-t dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📧</span>
            <span className="font-medium text-blue-800 dark:text-blue-300">{t('emails.gmailVersion', 'Version Gmail (texte brut)')}</span>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-3 rounded-lg max-h-32 overflow-auto">
            {(() => {
              const gmailMsg = selectedType === 'welcome' 
                ? gmailTemplates.welcome(testData.userName, testData.packageName)
                : selectedType === 'appointmentConfirmation'
                ? gmailTemplates.appointmentConfirmation(testData.userName, testData.date, testData.time, testData.type, testData.consultantName)
                : selectedType === 'appointmentReminder'
                ? gmailTemplates.appointmentReminder(testData.userName, testData.date, testData.time, testData.type)
                : selectedType === 'bilanCompleted'
                ? gmailTemplates.bilanCompleted(testData.userName)
                : gmailTemplates.followUp6Months(testData.userName);
              return gmailMsg.content;
            })()}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 {t('emails.sentVia', 'Emails envoyés via Gmail / Google Workspace')}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('emails.close', 'Fermer')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailPreview;
