import { Package } from './types';

// ============================================
// COMPLEXITÉ DES QUESTIONS (Temps de réponse)
// ============================================

export type QuestionComplexity = 'simple' | 'moyenne' | 'complexe' | 'reflexion';

export const QUESTION_COMPLEXITY_TIME: Record<QuestionComplexity, { min: number; max: number; avg: number }> = {
  simple: { min: 1, max: 2, avg: 1.5 },      // 1-2 min : Questions factuelles
  moyenne: { min: 3, max: 5, avg: 4 },       // 3-5 min : Questions descriptives
  complexe: { min: 5, max: 10, avg: 7.5 },   // 5-10 min : Questions analytiques
  reflexion: { min: 10, max: 15, avg: 12.5 } // 10-15 min : Questions de projection
};

// ============================================
// CONFIGURATION DES 4 FORFAITS
// ============================================

export const PACKAGES: Package[] = [
  {
    id: 'test',
    name: "Forfait Test",
    totalHours: 2,
    totalQuestionnaires: 3,
    description: "Forfait de test pour développer et tester l'application. Parcours court et complet.",
    features: [
      "Parcours complet condensé",
      "Toutes les phases en version courte",
      "Idéal pour tester l'application",
      "Environ 10-15 questions"
    ],
    phases: {
      phase1: { questionnaires: 1, duration_min: 30, name: "Phase Préliminaire" },
      phase2: { questionnaires: 1, duration_min: 60, name: "Phase d'Investigation" },
      phase3: { questionnaires: 1, duration_min: 30, name: "Phase de Conclusion" }
    },
    timeBudget: {
      total: 120,      // 2h = 120 min
      phase1: 30,      // 25%
      phase2: 60,      // 50%
      phase3: 30       // 25%
    }
  },
  {
    id: 'essentiel',
    name: "Bilan Essentiel",
    totalHours: 12,
    totalQuestionnaires: 3,
    description: "Un bilan complet pour faire le point sur vos compétences et définir votre projet professionnel.",
    features: [
      "Analyse approfondie de vos compétences",
      "Identification de vos motivations",
      "Exploration de pistes professionnelles",
      "Plan d'action personnalisé",
      "Environ 30-40 questions"
    ],
    phases: {
      phase1: { questionnaires: 1, duration_min: 120, name: "Phase Préliminaire" },
      phase2: { questionnaires: 1, duration_min: 360, name: "Phase d'Investigation" },
      phase3: { questionnaires: 1, duration_min: 120, name: "Phase de Conclusion" }
    },
    timeBudget: {
      total: 720,      // 12h = 720 min
      phase1: 120,     // ~17%
      phase2: 360,     // ~50%
      phase3: 120      // ~17%
    }
  },
  {
    id: 'approfondi',
    name: "Bilan Approfondi",
    totalHours: 18,
    totalQuestionnaires: 5,
    description: "Une exploration complète avec approfondissement des thématiques clés pour votre évolution professionnelle.",
    features: [
      "Tout du Bilan Essentiel",
      "Approfondissement des compétences transversales",
      "Analyse du marché du travail",
      "Stratégie de recherche d'emploi",
      "Développement du réseau professionnel",
      "Environ 45-60 questions"
    ],
    phases: {
      phase1: { questionnaires: 2, duration_min: 180, name: "Phase Préliminaire" },
      phase2: { questionnaires: 2, duration_min: 540, name: "Phase d'Investigation" },
      phase3: { questionnaires: 1, duration_min: 180, name: "Phase de Conclusion" }
    },
    timeBudget: {
      total: 1080,     // 18h = 1080 min
      phase1: 180,     // ~17%
      phase2: 540,     // ~50%
      phase3: 180      // ~17%
    }
  },
  {
    id: 'strategique',
    name: "Accompagnement Stratégique",
    totalHours: 24,
    totalQuestionnaires: 7,
    description: "Un accompagnement premium pour les professionnels visant une transition de carrière majeure ou un poste à haute responsabilité.",
    features: [
      "Tout du Bilan Approfondi",
      "Coaching personnalisé approfondi",
      "Développement du leadership",
      "Stratégie de personal branding",
      "Préparation aux entretiens de haut niveau",
      "Accompagnement sur la durée",
      "Environ 60-80 questions"
    ],
    phases: {
      phase1: { questionnaires: 2, duration_min: 240, name: "Phase Préliminaire" },
      phase2: { questionnaires: 3, duration_min: 720, name: "Phase d'Investigation" },
      phase3: { questionnaires: 2, duration_min: 240, name: "Phase de Conclusion" }
    },
    timeBudget: {
      total: 1440,     // 24h = 1440 min
      phase1: 240,     // ~17%
      phase2: 720,     // ~50%
      phase3: 240      // ~17%
    }
  }
];

// ============================================
// CATÉGORIES DE QUESTIONS PAR PHASE
// ============================================

export const QUESTION_CATEGORIES = {
  phase1: {
    name: "Phase Préliminaire",
    objective: "Accueil, information, définition des besoins",
    categories: [
      {
        id: 'accueil_presentation',
        name: 'Accueil et Présentation',
        defaultComplexity: 'simple' as QuestionComplexity,
        priority: 'high',
        minQuestions: 1,
        maxQuestions: 3
      },
      {
        id: 'definition_besoins',
        name: 'Définition des Besoins',
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 5
      },
      {
        id: 'exploration_initiale',
        name: 'Exploration Initiale',
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'medium',
        minQuestions: 1,
        maxQuestions: 3
      },
      {
        id: 'motivations_bilan',
        name: 'Motivations pour le Bilan',
        defaultComplexity: 'complexe' as QuestionComplexity,
        priority: 'high',
        minQuestions: 1,
        maxQuestions: 3
      },
      {
        id: 'attentes_parcours',
        name: 'Attentes du Parcours',
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'medium',
        minQuestions: 1,
        maxQuestions: 2
      }
    ],
    satisfactionActive: false
  },
  
  phase2: {
    name: "Phase d'Investigation",
    objective: "Analyse des motivations, compétences, possibilités d'évolution",
    categories: [
      {
        id: 'competences_techniques',
        name: 'Compétences Techniques',
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 6
      },
      {
        id: 'competences_transversales',
        name: 'Compétences Transversales',
        defaultComplexity: 'complexe' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 6
      },
      {
        id: 'motivations_valeurs',
        name: 'Motivations et Valeurs',
        defaultComplexity: 'reflexion' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 5
      },
      {
        id: 'environnement_travail',
        name: 'Environnement de Travail Idéal',
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'medium',
        minQuestions: 1,
        maxQuestions: 4
      },
      {
        id: 'exploration_possibilites',
        name: 'Exploration des Possibilités',
        defaultComplexity: 'complexe' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 5
      },
      {
        id: 'secteurs_interet',
        name: "Secteurs d'Intérêt",
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'medium',
        minQuestions: 1,
        maxQuestions: 4
      },
      {
        id: 'projets_professionnels',
        name: 'Projets Professionnels',
        defaultComplexity: 'reflexion' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 6
      },
      {
        id: 'contraintes_opportunites',
        name: 'Contraintes et Opportunités',
        defaultComplexity: 'complexe' as QuestionComplexity,
        priority: 'medium',
        minQuestions: 1,
        maxQuestions: 4
      }
    ],
    satisfactionActive: true
  },
  
  phase3: {
    name: "Phase de Conclusion",
    objective: "Synthèse, plan d'action, suivi",
    categories: [
      {
        id: 'validation_projet',
        name: 'Validation du Projet',
        defaultComplexity: 'reflexion' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 5
      },
      {
        id: 'plan_action_concret',
        name: 'Plan d\'Action Concret',
        defaultComplexity: 'complexe' as QuestionComplexity,
        priority: 'high',
        minQuestions: 2,
        maxQuestions: 6
      },
      {
        id: 'projection_avenir',
        name: 'Projection dans l\'Avenir',
        defaultComplexity: 'reflexion' as QuestionComplexity,
        priority: 'medium',
        minQuestions: 1,
        maxQuestions: 4
      },
      {
        id: 'engagement_demarche',
        name: 'Engagement dans la Démarche',
        defaultComplexity: 'moyenne' as QuestionComplexity,
        priority: 'high',
        minQuestions: 1,
        maxQuestions: 3
      }
    ],
    satisfactionActive: false
  }
};

// ============================================
// SYSTÈME ADAPTATIF INTELLIGENT
// ============================================

/**
 * Calcule le temps total consommé basé sur les réponses
 */
export const calculateTimeSpent = (answers: Array<{ complexity?: QuestionComplexity }>): number => {
  return answers.reduce((total, answer) => {
    const complexity = answer.complexity || 'moyenne';
    return total + QUESTION_COMPLEXITY_TIME[complexity].avg;
  }, 0);
};

/**
 * Calcule le budget temps restant
 * @param packageId - ID du package
 * @param answers - Réponses de l'utilisateur
 * @param bilanStartTime - Timestamp de début du bilan (optionnel, pour calcul temps réel)
 */
export const getTimeBudget = (
  packageId: string,
  answers: Array<{ complexity?: QuestionComplexity }>,
  bilanStartTime?: number
): { 
  spent: number; 
  total: number; 
  remaining: number; 
  percentage: number;
  phase1Remaining: number;
  phase2Remaining: number;
  phase3Remaining: number;
} => {
  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) return { 
    spent: 0, 
    total: 0, 
    remaining: 0, 
    percentage: 0,
    phase1Remaining: 0,
    phase2Remaining: 0,
    phase3Remaining: 0
  };
  
  // Utiliser le temps réel si disponible, sinon l'estimation
  const spent = bilanStartTime 
    ? Math.floor((Date.now() - bilanStartTime) / 60000) 
    : calculateTimeSpent(answers);
  const total = pkg.timeBudget.total;
  const remaining = total - spent;
  const percentage = (spent / total) * 100;
  
  // Calcul du temps restant par phase (approximatif)
  const currentPhase = getCurrentPhase(packageId, answers);
  const phase1Remaining = currentPhase.phase === 'phase1' ? pkg.timeBudget.phase1 - spent : 0;
  const phase2Remaining = currentPhase.phase === 'phase2' ? pkg.timeBudget.phase2 - (spent - pkg.timeBudget.phase1) : pkg.timeBudget.phase2;
  const phase3Remaining = currentPhase.phase === 'phase3' ? pkg.timeBudget.phase3 - (spent - pkg.timeBudget.phase1 - pkg.timeBudget.phase2) : pkg.timeBudget.phase3;
  
  return { 
    spent, 
    total, 
    remaining, 
    percentage,
    phase1Remaining,
    phase2Remaining,
    phase3Remaining
  };
};

/**
 * Détermine la complexité optimale de la prochaine question
 * Basé sur le budget temps restant et la catégorie
 */
export const determineQuestionComplexity = (
  categoryId: string,
  phase: 'phase1' | 'phase2' | 'phase3',
  timeRemainingInPhase: number,
  questionsAskedInCategory: number
): QuestionComplexity => {
  const phaseCategories = QUESTION_CATEGORIES[phase].categories;
  const category = phaseCategories.find(c => c.id === categoryId);
  
  if (!category) return 'moyenne';
  
  const defaultComplexity = category.defaultComplexity;
  
  // Si temps très limité (< 10 min), questions simples
  if (timeRemainingInPhase < 10) return 'simple';
  
  // Si temps limité (< 30 min), éviter les questions de réflexion
  if (timeRemainingInPhase < 30 && defaultComplexity === 'reflexion') return 'complexe';
  
  // Si première question de la catégorie, commencer simple
  if (questionsAskedInCategory === 0 && defaultComplexity !== 'simple') {
    return defaultComplexity === 'reflexion' ? 'complexe' : 'moyenne';
  }
  
  // Sinon, utiliser la complexité par défaut
  return defaultComplexity;
};

/**
 * Détermine si on doit approfondir une catégorie
 */
export const shouldDeepenCategory = (
  categoryId: string,
  phase: 'phase1' | 'phase2' | 'phase3',
  questionsAskedInCategory: number,
  timeRemainingInPhase: number,
  responseQuality: 'low' | 'medium' | 'high' = 'medium'
): boolean => {
  const phaseCategories = QUESTION_CATEGORIES[phase].categories;
  const category = phaseCategories.find(c => c.id === categoryId);
  
  if (!category) return false;
  
  // Si on a déjà atteint le max, ne pas approfondir
  if (questionsAskedInCategory >= category.maxQuestions) return false;
  
  // Si on n'a pas atteint le min, approfondir
  if (questionsAskedInCategory < category.minQuestions) return true;
  
  // Si temps très limité (< 15 min), ne pas approfondir sauf si priorité haute et min non atteint
  if (timeRemainingInPhase < 15) {
    return category.priority === 'high' && questionsAskedInCategory < category.minQuestions;
  }
  
  // Si réponse de faible qualité et priorité haute, approfondir
  if (responseQuality === 'low' && category.priority === 'high') return true;
  
  // Si réponse de haute qualité, ne pas approfondir sauf si priorité haute
  if (responseQuality === 'high' && category.priority !== 'high') return false;
  
  // Par défaut, approfondir si temps disponible (> 30 min) et priorité moyenne/haute
  return timeRemainingInPhase > 30 && category.priority !== 'low';
};

/**
 * Obtient la phase actuelle basée sur le temps consommé
 */
export const getCurrentPhase = (
  packageId: string,
  answers: Array<{ complexity?: QuestionComplexity }>
): { phase: 'phase1' | 'phase2' | 'phase3'; questionnaire: number; name: string } => {
  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) return { phase: 'phase1', questionnaire: 1, name: 'Phase Préliminaire' };
  
  const timeSpent = calculateTimeSpent(answers);
  const { phase1, phase2, phase3 } = pkg.phases;
  const { timeBudget } = pkg;
  
  // Déterminer la phase basée sur le temps consommé
  if (timeSpent < timeBudget.phase1) {
    const questionnaire = Math.floor((timeSpent / timeBudget.phase1) * phase1.questionnaires) + 1;
    return { phase: 'phase1', questionnaire: Math.min(questionnaire, phase1.questionnaires), name: phase1.name };
  }
  
  if (timeSpent < timeBudget.phase1 + timeBudget.phase2) {
    const timeInPhase2 = timeSpent - timeBudget.phase1;
    const questionnaire = Math.floor((timeInPhase2 / timeBudget.phase2) * phase2.questionnaires) + 1;
    return { phase: 'phase2', questionnaire: Math.min(questionnaire, phase2.questionnaires), name: phase2.name };
  }
  
  const timeInPhase3 = timeSpent - timeBudget.phase1 - timeBudget.phase2;
  const questionnaire = Math.floor((timeInPhase3 / timeBudget.phase3) * phase3.questionnaires) + 1;
  return { phase: 'phase3', questionnaire: Math.min(questionnaire, phase3.questionnaires), name: phase3.name };
};

/**
 * Vérifie si le parcours est terminé
 */
export const isJourneyComplete = (
  packageId: string,
  answers: Array<{ complexity?: QuestionComplexity }>
): boolean => {
  const pkg = PACKAGES.find(p => p.id === packageId);
  if (!pkg) return false;
  
  const timeSpent = calculateTimeSpent(answers);
  const totalTime = pkg.timeBudget.total;
  
  // Le parcours est terminé si on a consommé au moins 90% du temps
  // (on laisse une marge pour éviter de dépasser)
  return timeSpent >= totalTime * 0.9;
};
