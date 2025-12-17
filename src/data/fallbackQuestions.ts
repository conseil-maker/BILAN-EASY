/**
 * Questions de fallback pour garantir le fonctionnement de l'application
 * même si l'API Gemini échoue
 */

import { Question, QuestionType } from '../types-ai-studio';

// Type interne pour les questions de fallback avec champs additionnels
interface FallbackQuestion extends Question {
  category: string;
  phase: number;
  expectedDuration: number;
  followUp: string[];
}

export const FALLBACK_QUESTIONS: Record<string, FallbackQuestion[]> = {
  // Phase Préliminaire - Parcours professionnel
  parcours_professionnel: [
    {
      id: 'fallback_parcours_1',
      title: "Pouvez-vous me décrire votre parcours professionnel en quelques mots ?",
      description: "Parlez-moi de votre parcours, des étapes clés de votre carrière, et de ce qui vous a amené jusqu'ici.",
      type: QuestionType.PARAGRAPH,
      theme: "Parcours professionnel",
      required: true,
      category: "Parcours professionnel",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_parcours_2',
      title: "Quel est votre poste actuel et quelles sont vos principales responsabilités ?",
      description: "Décrivez votre rôle actuel, vos missions quotidiennes, et les projets sur lesquels vous travaillez.",
      type: QuestionType.PARAGRAPH,
      theme: "Parcours professionnel",
      required: true,
      category: "Parcours professionnel",
      phase: 1,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_parcours_3',
      title: "Qu'est-ce qui vous a attiré vers votre domaine d'activité actuel ?",
      description: "Parlez-moi de ce qui vous passionne dans votre métier et de ce qui vous a motivé à choisir cette voie.",
      type: QuestionType.PARAGRAPH,
      theme: "Parcours professionnel",
      required: true,
      category: "Parcours professionnel",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    }
  ],

  // Phase Préliminaire - Compétences techniques
  competences_techniques: [
    {
      id: 'fallback_competences_1',
      title: "Quelles sont vos compétences techniques principales ?",
      description: "Listez les compétences techniques que vous maîtrisez le mieux et que vous utilisez régulièrement.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences techniques",
      required: true,
      category: "Compétences techniques",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_competences_2',
      title: "Parmi vos compétences, lesquelles souhaiteriez-vous développer davantage ?",
      description: "Identifiez les compétences que vous aimeriez approfondir ou acquérir pour votre évolution professionnelle.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences techniques",
      required: true,
      category: "Compétences techniques",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    }
  ],

  // Phase Investigation - Motivations
  motivations: [
    {
      id: 'fallback_motivations_1',
      title: "Qu'est-ce qui vous motive le plus dans votre travail au quotidien ?",
      description: "Parlez-moi des aspects de votre travail qui vous donnent de l'énergie et vous épanouissent.",
      type: QuestionType.PARAGRAPH,
      theme: "Motivations",
      required: true,
      category: "Motivations",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_motivations_2',
      title: "Quels sont vos critères essentiels pour un poste idéal ?",
      description: "Décrivez les éléments non négociables que vous recherchez dans votre prochain poste ou projet professionnel.",
      type: QuestionType.PARAGRAPH,
      theme: "Motivations",
      required: true,
      category: "Motivations",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // Phase Investigation - Valeurs
  valeurs: [
    {
      id: 'fallback_valeurs_1',
      title: "Quelles sont les valeurs professionnelles qui vous tiennent le plus à cœur ?",
      description: "Identifiez les valeurs qui guident vos choix professionnels et votre manière de travailler.",
      type: QuestionType.PARAGRAPH,
      theme: "Valeurs",
      required: true,
      category: "Valeurs",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_valeurs_2',
      title: "Comment ces valeurs se reflètent-elles dans votre travail actuel ?",
      description: "Donnez des exemples concrets de situations où vos valeurs ont guidé vos décisions ou actions.",
      type: QuestionType.PARAGRAPH,
      theme: "Valeurs",
      required: true,
      category: "Valeurs",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // Phase Investigation - Réalisations
  realisations: [
    {
      id: 'fallback_realisations_1',
      title: "Quelle est la réalisation professionnelle dont vous êtes le plus fier ?",
      description: "Décrivez un projet ou une réussite qui vous a particulièrement marqué et dont vous tirez de la fierté.",
      type: QuestionType.PARAGRAPH,
      theme: "Réalisations",
      required: true,
      category: "Réalisations",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_realisations_2',
      title: "Quels défis avez-vous surmontés dans votre carrière ?",
      description: "Parlez-moi des obstacles que vous avez rencontrés et comment vous les avez dépassés.",
      type: QuestionType.PARAGRAPH,
      theme: "Réalisations",
      required: true,
      category: "Réalisations",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    }
  ],

  // Phase Investigation - Projet professionnel
  projet_professionnel: [
    {
      id: 'fallback_projet_1',
      title: "Où vous voyez-vous professionnellement dans 2-3 ans ?",
      description: "Décrivez votre vision de votre évolution professionnelle à moyen terme.",
      type: QuestionType.PARAGRAPH,
      theme: "Projet professionnel",
      required: true,
      category: "Projet professionnel",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_projet_2',
      title: "Quels sont les obstacles potentiels à la réalisation de votre projet professionnel ?",
      description: "Identifiez les freins ou difficultés que vous pourriez rencontrer dans votre évolution.",
      type: QuestionType.PARAGRAPH,
      theme: "Projet professionnel",
      required: true,
      category: "Projet professionnel",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // Phase Conclusion - Synthèse
  synthese: [
    {
      id: 'fallback_synthese_1',
      title: "Quels sont les principaux enseignements que vous tirez de ce bilan jusqu'à présent ?",
      description: "Faites le point sur ce que vous avez découvert ou confirmé sur vous-même.",
      type: QuestionType.PARAGRAPH,
      theme: "Synthèse",
      required: true,
      category: "Synthèse",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_synthese_2',
      title: "Quelles actions concrètes envisagez-vous de mettre en place suite à ce bilan ?",
      description: "Identifiez les premières étapes que vous souhaitez entreprendre pour concrétiser votre projet.",
      type: QuestionType.PARAGRAPH,
      theme: "Synthèse",
      required: true,
      category: "Synthèse",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    }
  ]
};

/**
 * Sélectionne une question de fallback appropriée selon le contexte
 */
export function selectFallbackQuestion(
  categoryId: string,
  phase: number,
  previousQuestionIds: string[]
): Question | null {
  // Chercher les questions de la catégorie
  const categoryQuestions = FALLBACK_QUESTIONS[categoryId];
  
  if (!categoryQuestions || categoryQuestions.length === 0) {
    // Si pas de questions pour cette catégorie, chercher dans toutes les questions de la phase
    const allQuestions = Object.values(FALLBACK_QUESTIONS).flat();
    const phaseQuestions = allQuestions.filter(q => q.phase === phase);
    
    if (phaseQuestions.length === 0) return null;
    
    // Sélectionner une question non encore posée
    const availableQuestions = phaseQuestions.filter(
      q => !previousQuestionIds.includes(q.id)
    );
    
    if (availableQuestions.length === 0) {
      // Si toutes les questions ont été posées, en sélectionner une au hasard
      return phaseQuestions[Math.floor(Math.random() * phaseQuestions.length)];
    }
    
    return availableQuestions[0];
  }
  
  // Sélectionner une question de la catégorie non encore posée
  const availableQuestions = categoryQuestions.filter(
    q => !previousQuestionIds.includes(q.id)
  );
  
  if (availableQuestions.length === 0) {
    // Si toutes les questions de la catégorie ont été posées, en sélectionner une au hasard
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
  }
  
  return availableQuestions[0];
}
