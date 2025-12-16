/**
 * Service d'amélioration de l'expérience IA
 * 
 * Ce service ajoute des fonctionnalités avancées pour personnaliser
 * les interactions avec l'IA et améliorer la qualité des réponses.
 */

import { Answer, CoachingStyle, UserProfile } from '../types';
import { organizationConfig } from '../config/organization';

// Types pour les réponses enrichies
export interface EnrichedResponse {
  mainResponse: string;
  encouragement: string;
  nextStepHint: string;
  relevantInsight?: string;
  progressFeedback: string;
}

export interface PersonalizedContext {
  userName: string;
  coachingStyle: CoachingStyle;
  currentPhase: string;
  answersCount: number;
  identifiedStrengths: string[];
  areasToExplore: string[];
  emotionalTone: 'positive' | 'neutral' | 'supportive';
}

// Messages d'encouragement personnalisés par style de coaching
const encouragementsByStyle: Record<CoachingStyle, string[]> = {
  collaborative: [
    "C'est une excellente réflexion ! Continuons ensemble à explorer cette piste.",
    "Merci pour ce partage sincère. Votre authenticité est précieuse.",
    "Je sens que vous avez beaucoup à offrir. Approfondissons cela.",
    "Votre réponse montre une belle lucidité sur vous-même.",
    "Nous avançons bien ensemble. Votre implication fait la différence.",
  ],
  analytic: [
    "Analyse pertinente. Examinons maintenant les implications concrètes.",
    "Point bien structuré. Passons à l'étape suivante de notre analyse.",
    "Données intéressantes. Voyons comment les exploiter stratégiquement.",
    "Votre raisonnement est clair. Continuons à décortiquer les éléments.",
    "Bonne identification des facteurs clés. Approfondissons.",
  ],
  creative: [
    "Quelle perspective originale ! Laissez-vous porter par cette idée.",
    "J'aime cette façon de voir les choses. Et si on allait plus loin ?",
    "Votre créativité transparaît. Explorons d'autres possibilités.",
    "Belle intuition ! Voyons où elle nous mène.",
    "Vous ouvrez des portes intéressantes. Continuons l'exploration.",
  ],
};

// Insights contextuels basés sur les thèmes détectés
const themeInsights: Record<string, string[]> = {
  'reconversion': [
    "La reconversion est un voyage, pas une destination. Chaque étape compte.",
    "80% des personnes en reconversion trouvent plus de sens dans leur nouveau métier.",
    "Vos compétences transférables sont votre plus grand atout.",
  ],
  'management': [
    "Le leadership moderne repose sur l'écoute et l'empathie.",
    "Les meilleurs managers sont ceux qui développent leurs équipes.",
    "Votre expérience managériale est un capital précieux.",
  ],
  'entrepreneuriat': [
    "L'entrepreneuriat commence par une vision claire de sa valeur ajoutée.",
    "Les entrepreneurs qui réussissent sont ceux qui apprennent de leurs échecs.",
    "Votre projet mérite d'être exploré en profondeur.",
  ],
  'équilibre': [
    "L'équilibre vie pro/perso est un facteur clé de performance durable.",
    "Définir ses priorités est le premier pas vers l'harmonie.",
    "Votre bien-être est essentiel à votre réussite professionnelle.",
  ],
  'compétences': [
    "Vos compétences sont le reflet de votre parcours unique.",
    "Chaque expérience a développé des savoir-faire précieux.",
    "La conscience de ses forces est le socle de la confiance.",
  ],
};

// Feedback de progression
const progressFeedbacks: Record<number, string[]> = {
  25: [
    "Nous avons bien démarré ! Continuons sur cette lancée.",
    "Premier quart du parcours accompli. Vous êtes sur la bonne voie.",
  ],
  50: [
    "Mi-parcours atteint ! Vos réponses dessinent déjà un profil intéressant.",
    "Nous sommes à mi-chemin. Les éléments clés commencent à émerger.",
  ],
  75: [
    "Dernière ligne droite ! Votre profil se précise remarquablement.",
    "Presque terminé. Vos réponses forment un ensemble cohérent.",
  ],
  100: [
    "Félicitations ! Vous avez complété cette phase avec brio.",
    "Bravo pour votre engagement tout au long de ce parcours.",
  ],
};

/**
 * Génère un message d'encouragement personnalisé
 */
export const getPersonalizedEncouragement = (
  style: CoachingStyle,
  answersCount: number
): string => {
  const encouragements = encouragementsByStyle[style];
  const index = answersCount % encouragements.length;
  return encouragements[index];
};

/**
 * Détecte les thèmes principaux dans les réponses
 */
export const detectThemes = (answers: Answer[]): string[] => {
  const themes: string[] = [];
  const allText = answers.map(a => a.value.toLowerCase()).join(' ');
  
  const themeKeywords: Record<string, string[]> = {
    'reconversion': ['reconversion', 'changer', 'nouveau métier', 'transition', 'réorientation'],
    'management': ['manager', 'équipe', 'leadership', 'diriger', 'encadrer', 'collaborateurs'],
    'entrepreneuriat': ['entreprendre', 'créer', 'indépendant', 'freelance', 'startup', 'projet'],
    'équilibre': ['équilibre', 'vie personnelle', 'stress', 'bien-être', 'temps', 'famille'],
    'compétences': ['compétences', 'savoir-faire', 'expertise', 'formation', 'apprentissage'],
  };
  
  for (const [theme, keywords] of Object.entries(themeKeywords)) {
    if (keywords.some(keyword => allText.includes(keyword))) {
      themes.push(theme);
    }
  }
  
  return themes;
};

/**
 * Génère un insight contextuel basé sur les thèmes détectés
 */
export const getContextualInsight = (themes: string[]): string | undefined => {
  if (themes.length === 0) return undefined;
  
  const primaryTheme = themes[0];
  const insights = themeInsights[primaryTheme];
  
  if (!insights) return undefined;
  
  return insights[Math.floor(Math.random() * insights.length)];
};

/**
 * Génère un feedback de progression
 */
export const getProgressFeedback = (
  currentQuestion: number,
  totalQuestions: number
): string => {
  const progress = Math.round((currentQuestion / totalQuestions) * 100);
  
  let feedbackLevel = 25;
  if (progress >= 75) feedbackLevel = 75;
  else if (progress >= 50) feedbackLevel = 50;
  else if (progress >= 25) feedbackLevel = 25;
  else return "C'est parti ! Prenez le temps de bien réfléchir à chaque question.";
  
  const feedbacks = progressFeedbacks[feedbackLevel];
  return feedbacks[Math.floor(Math.random() * feedbacks.length)];
};

/**
 * Génère une réponse enrichie avec contexte personnalisé
 */
export const generateEnrichedResponse = (
  context: PersonalizedContext,
  answers: Answer[]
): EnrichedResponse => {
  const themes = detectThemes(answers);
  
  return {
    mainResponse: '',
    encouragement: getPersonalizedEncouragement(context.coachingStyle, context.answersCount),
    nextStepHint: getNextStepHint(context.currentPhase, context.answersCount),
    relevantInsight: getContextualInsight(themes),
    progressFeedback: getProgressFeedback(context.answersCount, 20),
  };
};

/**
 * Génère un indice sur la prochaine étape
 */
const getNextStepHint = (currentPhase: string, answersCount: number): string => {
  const hints: Record<string, string[]> = {
    'phase1': [
      "Nous allons maintenant explorer vos motivations profondes.",
      "La prochaine question portera sur votre parcours.",
      "Continuons à découvrir ce qui vous anime.",
    ],
    'phase2': [
      "Passons à l'analyse de vos compétences clés.",
      "Explorons maintenant vos savoir-faire.",
      "Voyons comment valoriser votre expérience.",
    ],
    'phase3': [
      "Construisons ensemble votre projet professionnel.",
      "Définissons les prochaines étapes concrètes.",
      "Finalisons votre plan d'action.",
    ],
  };
  
  const phaseHints = hints[currentPhase] || hints['phase1'];
  return phaseHints[answersCount % phaseHints.length];
};

/**
 * Génère un message de bienvenue personnalisé
 */
export const generateWelcomeMessage = (
  userName: string,
  style: CoachingStyle,
  packageName: string
): string => {
  const consultant = organizationConfig.defaultConsultant.name;
  
  const welcomeByStyle: Record<CoachingStyle, string> = {
    collaborative: `Bonjour ${userName} ! Je suis ravi de vous accompagner dans ce bilan de compétences. Ensemble, nous allons explorer votre parcours et construire votre projet professionnel. N'hésitez pas à prendre votre temps pour répondre, chaque réflexion compte.`,
    analytic: `Bonjour ${userName}. Bienvenue dans votre bilan de compétences. Notre approche structurée va nous permettre d'analyser méthodiquement votre profil et d'identifier les opportunités qui s'offrent à vous. Commençons par les fondamentaux.`,
    creative: `Bonjour ${userName} ! Prêt(e) pour un voyage de découverte ? Ce bilan est une invitation à explorer de nouvelles perspectives et à imaginer votre avenir professionnel. Laissez-vous guider par votre intuition et vos aspirations profondes.`,
  };
  
  return welcomeByStyle[style];
};

/**
 * Génère un message de transition entre phases
 */
export const generatePhaseTransitionMessage = (
  fromPhase: string,
  toPhase: string,
  userName: string,
  style: CoachingStyle
): string => {
  const transitions: Record<string, Record<CoachingStyle, string>> = {
    'phase1-phase2': {
      collaborative: `Excellent travail ${userName} ! Nous avons bien exploré votre parcours et vos motivations. Passons maintenant à l'analyse de vos compétences. Cette étape est essentielle pour identifier vos atouts.`,
      analytic: `Phase d'investigation terminée. Les données recueillies sont riches. Passons à l'analyse des compétences pour affiner notre diagnostic.`,
      creative: `Belle exploration ${userName} ! Vous avez ouvert de nombreuses portes. Maintenant, découvrons les trésors que vous portez en vous : vos compétences uniques.`,
    },
    'phase2-phase3': {
      collaborative: `Formidable ${userName} ! Vos compétences sont maintenant clairement identifiées. Construisons ensemble votre projet professionnel et votre plan d'action.`,
      analytic: `Analyse des compétences complète. Nous disposons de tous les éléments pour élaborer un plan d'action stratégique et réaliste.`,
      creative: `Vos talents sont révélés ${userName} ! Il est temps de dessiner l'avenir que vous méritez. Laissez libre cours à vos ambitions.`,
    },
  };
  
  const key = `${fromPhase}-${toPhase}`;
  return transitions[key]?.[style] || `Passons à la phase suivante, ${userName}.`;
};

/**
 * Génère un message de conclusion personnalisé
 */
export const generateConclusionMessage = (
  userName: string,
  style: CoachingStyle,
  strengths: string[],
  projectType: string
): string => {
  const strengthsList = strengths.slice(0, 3).join(', ');
  
  const conclusions: Record<CoachingStyle, string> = {
    collaborative: `Félicitations ${userName} ! Nous avons accompli un beau travail ensemble. Vos forces (${strengthsList}) sont de véritables atouts pour votre projet de ${projectType}. Je suis confiant(e) dans votre capacité à réussir. L'équipe de ${organizationConfig.name} reste à votre disposition pour vous accompagner.`,
    analytic: `Bilan terminé ${userName}. L'analyse révèle un profil solide avec des compétences clés en ${strengthsList}. Votre projet de ${projectType} est cohérent avec votre profil. Les prochaines étapes sont clairement définies.`,
    creative: `Quel voyage ${userName} ! Vous avez découvert des facettes insoupçonnées de vous-même. Vos talents en ${strengthsList} sont prêts à s'épanouir dans votre projet de ${projectType}. L'avenir vous appartient !`,
  };
  
  return conclusions[style];
};

export default {
  getPersonalizedEncouragement,
  detectThemes,
  getContextualInsight,
  getProgressFeedback,
  generateEnrichedResponse,
  generateWelcomeMessage,
  generatePhaseTransitionMessage,
  generateConclusionMessage,
};
