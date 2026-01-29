/**
 * Utilitaires pour le service Gemini
 */

import { CoachingStyle } from '../../types';

/**
 * Parse une réponse JSON de l'API Gemini
 */
export const parseJsonResponse = <T>(jsonString: string, functionName: string): T => {
  try {
    return JSON.parse(jsonString.trim()) as T;
  } catch (error) {
    console.error(`Error parsing JSON from ${functionName}:`, error);
    console.error("Received text:", jsonString);
    throw new Error(`Failed to parse JSON response in ${functionName}.`);
  }
};

/**
 * Génère l'instruction système selon le style de coaching
 */
export const getCoachingStyleInstruction = (style: CoachingStyle): string => {
  switch (style) {
    case 'empathetic':
      return `Tu es un coach bienveillant et empathique. Tu utilises un ton chaleureux et encourageant.
Tu valides les émotions de l'utilisateur et tu montres de la compréhension.
Tu poses des questions ouvertes qui invitent à la réflexion personnelle.
Tu célèbres les petites victoires et tu encourages la progression.`;
    
    case 'directive':
      return `Tu es un coach direct et orienté résultats. Tu vas droit au but.
Tu poses des questions précises qui demandent des réponses concrètes.
Tu challenges l'utilisateur de manière constructive.
Tu proposes des actions claires et mesurables.`;
    
    case 'analytical':
      return `Tu es un coach analytique et méthodique. Tu structures tes questions de manière logique.
Tu aides l'utilisateur à analyser ses expériences de manière objective.
Tu poses des questions qui invitent à la réflexion approfondie.
Tu utilises des frameworks et des grilles d'analyse quand c'est pertinent.`;
    
    case 'creative':
      return `Tu es un coach créatif et inspirant. Tu encourages la pensée divergente.
Tu poses des questions qui ouvrent de nouvelles perspectives.
Tu utilises des métaphores et des analogies pour stimuler la réflexion.
Tu invites l'utilisateur à imaginer des possibilités nouvelles.`;
    
    default:
      return `Tu es un coach professionnel équilibré. Tu adaptes ton approche selon les besoins.
Tu combines empathie et pragmatisme.
Tu poses des questions variées qui couvrent différents aspects.`;
  }
};

/**
 * Formate les réponses précédentes pour le contexte
 */
export const formatAnswersForContext = (
  answers: { question: string; answer: string; theme?: string }[],
  maxAnswers: number = 10
): string => {
  const recentAnswers = answers.slice(-maxAnswers);
  return recentAnswers
    .map((a, i) => `Q${i + 1}: ${a.question}\nR${i + 1}: ${a.answer}${a.theme ? ` [Thème: ${a.theme}]` : ''}`)
    .join('\n\n');
};

/**
 * Génère un ID unique pour une question
 */
export const generateQuestionId = (theme: string, index: number): string => {
  const sanitizedTheme = theme
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20);
  return `${sanitizedTheme}-${String(index).padStart(2, '0')}`;
};

/**
 * Valide qu'une réponse n'est pas vide ou trop courte
 */
export const isValidResponse = (response: string, minLength: number = 10): boolean => {
  if (!response) return false;
  const trimmed = response.trim();
  return trimmed.length >= minLength;
};

/**
 * Extrait les thèmes principaux des réponses
 */
export const extractMainThemes = (answers: { theme?: string }[]): string[] => {
  const themeCounts = new Map<string, number>();
  
  answers.forEach(a => {
    if (a.theme) {
      themeCounts.set(a.theme, (themeCounts.get(a.theme) || 0) + 1);
    }
  });
  
  return Array.from(themeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
};

/**
 * Calcule le score de progression du bilan
 */
export const calculateProgressScore = (
  answeredQuestions: number,
  totalQuestions: number,
  themesExplored: number,
  targetThemes: number = 5
): number => {
  const questionProgress = (answeredQuestions / totalQuestions) * 70;
  const themeProgress = Math.min((themesExplored / targetThemes) * 30, 30);
  return Math.round(questionProgress + themeProgress);
};
