import { Package, Answer, UserProfile } from '../types';
import { PHASE_THRESHOLDS, PACKAGES } from '../constants';

/**
 * Service de calcul de la progression du bilan
 * Basé sur le nombre de questions répondues vs estimées
 * Prend en compte le profil utilisateur (CV) pour ajuster les estimations
 */

export type BilanPhase = 'phase1' | 'phase2' | 'phase3';

export interface ProgressionInfo {
  // Progression globale (0-100%)
  globalProgress: number;
  
  // Progression par phase
  phaseProgress: {
    phase1: number;
    phase2: number;
    phase3: number;
  };
  
  // Phase actuelle
  currentPhase: BilanPhase;
  
  // Nombre de questions
  questionsAnswered: number;
  questionsTarget: number;
  questionsInCurrentPhase: number;
  targetInCurrentPhase: number;
  
  // Seuils atteints
  thresholds: {
    minimumReached: boolean;  // 90% - Peut proposer de passer
    optimalReached: boolean;  // 100% - Devrait proposer de passer
    maximumReached: boolean;  // 130% - Doit clôturer la phase
  };
  
  // Réduction due au CV
  cvReductionApplied: number; // Pourcentage de réduction (0-30%)
}

/**
 * Calcule le facteur de réduction basé sur la richesse du profil utilisateur (CV)
 * Un CV détaillé peut réduire le nombre de questions de 10-30%
 */
export const calculateCvReductionFactor = (userProfile: UserProfile | null): number => {
  if (!userProfile) return 0;
  
  let reductionScore = 0;
  
  // Vérifier la présence et la richesse des informations du CV
  if (userProfile.cvText) {
    const cvLength = userProfile.cvText.length;
    
    // CV court (< 500 caractères) : pas de réduction
    // CV moyen (500-2000) : 5-15% de réduction
    // CV détaillé (> 2000) : 15-25% de réduction
    if (cvLength > 2000) {
      reductionScore += 15;
    } else if (cvLength > 500) {
      reductionScore += 5 + Math.min(10, (cvLength - 500) / 150);
    }
    
    // Bonus si le CV contient des mots-clés importants
    const keywords = ['compétences', 'expérience', 'formation', 'projet', 'management', 'responsable'];
    const cvLower = userProfile.cvText.toLowerCase();
    const keywordsFound = keywords.filter(k => cvLower.includes(k)).length;
    reductionScore += Math.min(5, keywordsFound);
  }
  
  // Vérifier les autres informations du profil
  if (userProfile.profession) reductionScore += 2;
  if (userProfile.yearsExperience && userProfile.yearsExperience > 0) reductionScore += 2;
  if (userProfile.education) reductionScore += 2;
  if (userProfile.skills && userProfile.skills.length > 0) reductionScore += Math.min(4, userProfile.skills.length);
  
  // Plafonner la réduction à 30%
  return Math.min(30, reductionScore);
};

/**
 * Détermine la phase actuelle basée sur le nombre de réponses
 */
export const determineCurrentPhase = (
  answersCount: number,
  pkg: Package,
  cvReduction: number
): BilanPhase => {
  if (!pkg.questionEstimates) return 'phase1';
  
  const reductionFactor = 1 - (cvReduction / 100);
  
  const phase1Target = Math.round(pkg.questionEstimates.phase1.target * reductionFactor);
  const phase2Target = Math.round(pkg.questionEstimates.phase2.target * reductionFactor);
  
  // Utiliser le seuil optimal (100%) pour déterminer le passage de phase
  const phase1Threshold = Math.round(phase1Target * PHASE_THRESHOLDS.optimal);
  const phase2Threshold = Math.round((phase1Target + phase2Target) * PHASE_THRESHOLDS.optimal);
  
  if (answersCount < phase1Threshold) {
    return 'phase1';
  } else if (answersCount < phase2Threshold) {
    return 'phase2';
  } else {
    return 'phase3';
  }
};

/**
 * Compte les réponses par phase (basé sur les timestamps ou l'ordre)
 */
export const countAnswersByPhase = (
  answers: Answer[],
  pkg: Package,
  cvReduction: number
): { phase1: number; phase2: number; phase3: number } => {
  if (!pkg.questionEstimates) {
    return { phase1: answers.length, phase2: 0, phase3: 0 };
  }
  
  const reductionFactor = 1 - (cvReduction / 100);
  const phase1Target = Math.round(pkg.questionEstimates.phase1.target * reductionFactor);
  const phase2Target = Math.round(pkg.questionEstimates.phase2.target * reductionFactor);
  
  const totalAnswers = answers.length;
  
  // Répartir les réponses entre les phases
  const phase1Answers = Math.min(totalAnswers, phase1Target);
  const phase2Answers = Math.min(Math.max(0, totalAnswers - phase1Target), phase2Target);
  const phase3Answers = Math.max(0, totalAnswers - phase1Target - phase2Target);
  
  return {
    phase1: phase1Answers,
    phase2: phase2Answers,
    phase3: phase3Answers
  };
};

/**
 * Calcule la progression complète du bilan
 */
export const calculateProgression = (
  answers: Answer[],
  packageId: string,
  userProfile: UserProfile | null
): ProgressionInfo => {
  const pkg = PACKAGES.find(p => p.id === packageId);
  
  // Valeurs par défaut si package non trouvé
  if (!pkg || !pkg.questionEstimates) {
    return {
      globalProgress: 0,
      phaseProgress: { phase1: 0, phase2: 0, phase3: 0 },
      currentPhase: 'phase1',
      questionsAnswered: answers.length,
      questionsTarget: 30,
      questionsInCurrentPhase: answers.length,
      targetInCurrentPhase: 10,
      thresholds: {
        minimumReached: false,
        optimalReached: false,
        maximumReached: false
      },
      cvReductionApplied: 0
    };
  }
  
  // Calculer la réduction due au CV
  const cvReduction = calculateCvReductionFactor(userProfile);
  const reductionFactor = 1 - (cvReduction / 100);
  
  // Calculer les cibles ajustées
  const adjustedTargets = {
    phase1: Math.round(pkg.questionEstimates.phase1.target * reductionFactor),
    phase2: Math.round(pkg.questionEstimates.phase2.target * reductionFactor),
    phase3: Math.round(pkg.questionEstimates.phase3.target * reductionFactor),
    total: Math.round(pkg.questionEstimates.total.target * reductionFactor)
  };
  
  // Déterminer la phase actuelle
  const currentPhase = determineCurrentPhase(answers.length, pkg, cvReduction);
  
  // Compter les réponses par phase
  const answersByPhase = countAnswersByPhase(answers, pkg, cvReduction);
  
  // Calculer la progression par phase (en %)
  const phaseProgress = {
    phase1: Math.min(100, Math.round((answersByPhase.phase1 / adjustedTargets.phase1) * 100)),
    phase2: adjustedTargets.phase2 > 0 
      ? Math.min(100, Math.round((answersByPhase.phase2 / adjustedTargets.phase2) * 100))
      : 0,
    phase3: adjustedTargets.phase3 > 0 
      ? Math.min(100, Math.round((answersByPhase.phase3 / adjustedTargets.phase3) * 100))
      : 0
  };
  
  // Calculer la progression globale
  // Phase 1 = 0-20%, Phase 2 = 20-80%, Phase 3 = 80-100%
  const phase1Weight = 0.20;
  const phase2Weight = 0.60;
  const phase3Weight = 0.20;
  
  const globalProgress = Math.min(100, Math.round(
    (phaseProgress.phase1 / 100) * phase1Weight * 100 +
    (phaseProgress.phase2 / 100) * phase2Weight * 100 +
    (phaseProgress.phase3 / 100) * phase3Weight * 100
  ));
  
  // Déterminer les questions dans la phase actuelle
  const questionsInCurrentPhase = answersByPhase[currentPhase];
  const targetInCurrentPhase = adjustedTargets[currentPhase];
  
  // Calculer les seuils pour la phase actuelle
  const currentPhaseRatio = questionsInCurrentPhase / targetInCurrentPhase;
  
  return {
    globalProgress,
    phaseProgress,
    currentPhase,
    questionsAnswered: answers.length,
    questionsTarget: adjustedTargets.total,
    questionsInCurrentPhase,
    targetInCurrentPhase,
    thresholds: {
      minimumReached: currentPhaseRatio >= PHASE_THRESHOLDS.minimum,
      optimalReached: currentPhaseRatio >= PHASE_THRESHOLDS.optimal,
      maximumReached: currentPhaseRatio >= PHASE_THRESHOLDS.maximum
    },
    cvReductionApplied: cvReduction
  };
};

/**
 * Vérifie si on devrait proposer de passer à la phase suivante
 */
export const shouldProposePhaseTransition = (progressionInfo: ProgressionInfo): boolean => {
  return progressionInfo.thresholds.minimumReached && !progressionInfo.thresholds.maximumReached;
};

/**
 * Vérifie si on doit forcer le passage à la phase suivante
 */
export const shouldForcePhaseTransition = (progressionInfo: ProgressionInfo): boolean => {
  return progressionInfo.thresholds.maximumReached;
};

/**
 * Obtient un message de statut pour l'utilisateur
 */
export const getProgressionStatusMessage = (progressionInfo: ProgressionInfo): string => {
  const { currentPhase, questionsInCurrentPhase, targetInCurrentPhase, thresholds } = progressionInfo;
  
  const phaseNames: Record<BilanPhase, string> = {
    phase1: 'Phase Préliminaire',
    phase2: "Phase d'Investigation",
    phase3: 'Phase de Conclusion'
  };
  
  const phaseName = phaseNames[currentPhase];
  const remaining = Math.max(0, targetInCurrentPhase - questionsInCurrentPhase);
  
  if (thresholds.maximumReached) {
    return `${phaseName} terminée. Passage à la phase suivante.`;
  } else if (thresholds.optimalReached) {
    return `${phaseName} complète. Vous pouvez passer à la suite ou approfondir.`;
  } else if (thresholds.minimumReached) {
    return `${phaseName} bientôt terminée. Encore quelques questions pour approfondir.`;
  } else {
    return `${phaseName} en cours. Environ ${remaining} questions restantes.`;
  }
};
