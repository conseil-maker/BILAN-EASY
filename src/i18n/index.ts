import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Imports FR
import frCommon from './locales/fr/common.json';
import frAuth from './locales/fr/auth.json';
import frDashboard from './locales/fr/dashboard.json';
import frQuestionnaire from './locales/fr/questionnaire.json';
import frDocuments from './locales/fr/documents.json';
import frPackages from './locales/fr/packages.json';
import frCompletion from './locales/fr/completion.json';
import frLegal from './locales/fr/legal.json';
import frEmails from './locales/fr/emails.json';
import frAi from './locales/fr/ai.json';

// Imports TR
import trCommon from './locales/tr/common.json';
import trAuth from './locales/tr/auth.json';
import trDashboard from './locales/tr/dashboard.json';
import trQuestionnaire from './locales/tr/questionnaire.json';
import trDocuments from './locales/tr/documents.json';
import trPackages from './locales/tr/packages.json';
import trCompletion from './locales/tr/completion.json';
import trLegal from './locales/tr/legal.json';
import trEmails from './locales/tr/emails.json';
import trAi from './locales/tr/ai.json';

export const supportedLanguages = {
  fr: { name: 'Français', flag: '🇫🇷' },
  tr: { name: 'Türkçe', flag: '🇹🇷' },
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

const resources = {
  fr: {
    common: frCommon,
    auth: frAuth,
    dashboard: frDashboard,
    questionnaire: frQuestionnaire,
    documents: frDocuments,
    packages: frPackages,
    completion: frCompletion,
    legal: frLegal,
    emails: frEmails,
    ai: frAi,
  },
  tr: {
    common: trCommon,
    auth: trAuth,
    dashboard: trDashboard,
    questionnaire: trQuestionnaire,
    documents: trDocuments,
    packages: trPackages,
    completion: trCompletion,
    legal: trLegal,
    emails: trEmails,
    ai: trAi,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'auth', 'dashboard', 'questionnaire', 'documents', 'packages', 'completion', 'legal', 'emails', 'ai'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'bilan-easy-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
