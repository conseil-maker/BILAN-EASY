/**
 * Helper pour récupérer les traductions IA depuis i18n
 * Permet aux services backend (non-React) d'accéder aux traductions
 * en fonction de la langue courante de l'utilisateur.
 */

import i18n from '../i18n';

/**
 * Récupère la langue courante de l'utilisateur
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'fr';
};

/**
 * Récupère une traduction IA par clé
 * @param key - Clé de traduction dans le namespace 'ai'
 * @param params - Paramètres d'interpolation optionnels
 */
export const getAITranslation = (key: string, params?: Record<string, string>): string => {
  return i18n.t(key, { ns: 'ai', ...params });
};

/**
 * Récupère un objet de traduction IA (pour les objets imbriqués)
 * @param key - Clé de traduction dans le namespace 'ai'
 */
export const getAITranslationObject = <T = unknown>(key: string): T => {
  return i18n.t(key, { ns: 'ai', returnObjects: true }) as T;
};

/**
 * Récupère les informations de contexte pour la langue courante
 */
export const getLanguageContext = () => {
  const lang = getCurrentLanguage();
  return {
    language: getAITranslation('language'),
    languageInstruction: getAITranslation('languageInstruction'),
    country: getAITranslation('country'),
    marketContext: getAITranslation('marketContext'),
    marketYear: getAITranslation('marketYear'),
    currency: getAITranslation('currency'),
    certificationFramework: getAITranslation('certificationFramework'),
    jobCodeSystem: getAITranslation('jobCodeSystem'),
    orientationResources: getAITranslation('orientationResources'),
    locale: getAITranslation('locale'),
    langCode: lang,
  };
};

/**
 * Récupère les prompts de coaching style traduits
 */
export const getCoachingStylePrompt = (style: string): string => {
  return getAITranslation(`prompts.coachingStyles.${style}`) || 
         getAITranslation('prompts.coachingStyles.collaborative');
};

/**
 * Récupère les textes de fallback traduits
 */
export const getFallbackText = (key: string): string => {
  return getAITranslation(`fallback.${key}`);
};

/**
 * Récupère les textes de fallback sous forme de tableau
 */
export const getFallbackArray = (key: string): string[] => {
  return getAITranslationObject<string[]>(`fallback.${key}`);
};

/**
 * Récupère les questions d'ouverture traduites pour un style de coaching
 */
export const getOpeningQuestions = (style: string): string[] => {
  return getAITranslationObject<string[]>(`smartQuestions.openingQuestions.${style}`) ||
         getAITranslationObject<string[]>('smartQuestions.openingQuestions.collaborative');
};

/**
 * Récupère les touches personnelles traduites
 */
export const getPersonalTouches = (): string[] => {
  return getAITranslationObject<string[]>('smartQuestions.personalTouches');
};

/**
 * Récupère le nom de thème traduit
 */
export const getThemeName = (themeKey: string): string => {
  return getAITranslation(`smartQuestions.themes.${themeKey}`) || themeKey;
};

/**
 * Génère l'instruction de langue pour les prompts IA
 * Adapte le prompt en fonction de la langue courante
 */
export const getLanguagePromptInstruction = (): string => {
  const ctx = getLanguageContext();
  return `La question doit être en ${ctx.languageInstruction}`;
};

/**
 * Génère le contexte marché pour les prompts IA
 */
export const getMarketContextPrompt = (): string => {
  const ctx = getLanguageContext();
  return `Tenir compte des tendances actuelles du ${ctx.marketContext} (${ctx.marketYear})`;
};
