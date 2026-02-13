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
import frSatisfaction from './locales/fr/satisfaction.json';
import frSummary from './locales/fr/summary.json';
import frAbout from './locales/fr/about.json';
import frProfile from './locales/fr/profile.json';
import frPreliminary from './locales/fr/preliminary.json';
import frFollowup from './locales/fr/followup.json';
import frAppointments from './locales/fr/appointments.json';
import frAdmin from './locales/fr/admin.json';
import frConsultant from './locales/fr/consultant.json';
import frCareer from './locales/fr/career.json';

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
import trSatisfaction from './locales/tr/satisfaction.json';
import trSummary from './locales/tr/summary.json';
import trAbout from './locales/tr/about.json';
import trProfile from './locales/tr/profile.json';
import trPreliminary from './locales/tr/preliminary.json';
import trFollowup from './locales/tr/followup.json';
import trAppointments from './locales/tr/appointments.json';
import trAdmin from './locales/tr/admin.json';
import trConsultant from './locales/tr/consultant.json';
import trCareer from './locales/tr/career.json';

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
    satisfaction: frSatisfaction,
    summary: frSummary,
    about: frAbout,
    profile: frProfile,
    preliminary: frPreliminary,
    followup: frFollowup,
    appointments: frAppointments,
    admin: frAdmin,
    consultant: frConsultant,
    career: frCareer,
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
    satisfaction: trSatisfaction,
    summary: trSummary,
    about: trAbout,
    profile: trProfile,
    preliminary: trPreliminary,
    followup: trFollowup,
    appointments: trAppointments,
    admin: trAdmin,
    consultant: trConsultant,
    career: trCareer,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: [
      'common', 'auth', 'dashboard', 'questionnaire', 'documents', 'packages',
      'completion', 'legal', 'emails', 'ai', 'satisfaction', 'summary', 'about',
      'profile', 'preliminary', 'followup', 'appointments', 'admin', 'consultant', 'career'
    ],
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
