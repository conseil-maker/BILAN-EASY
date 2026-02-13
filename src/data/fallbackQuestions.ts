/**
 * Questions de fallback pour garantir le fonctionnement de l'application
 * même si l'API Gemini échoue
 * 
 * VERSION ENRICHIE - 50+ questions couvrant toutes les phases et catégories
 * Conformité Qualiopi - Articles R.6313-4 et R.6313-7
 */

import { Question, QuestionType } from '../types-ai-studio';
import { FALLBACK_TRANSLATIONS_TR } from './fallbackQuestions-tr';
import { getCurrentLanguage } from '../services/aiTranslationHelper';

// Type interne pour les questions de fallback avec champs additionnels
interface FallbackQuestion extends Question {
  category: string;
  phase: number;
  expectedDuration: number;
  followUp: string[];
}

export const FALLBACK_QUESTIONS: Record<string, FallbackQuestion[]> = {
  // ============================================
  // PHASE 1 - PRÉLIMINAIRE (~17% du temps)
  // ============================================

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
    },
    {
      id: 'fallback_parcours_4',
      title: "Quelles ont été les transitions importantes dans votre carrière ?",
      description: "Décrivez les moments charnières où vous avez changé de direction, d'entreprise ou de secteur.",
      type: QuestionType.PARAGRAPH,
      theme: "Parcours professionnel",
      required: true,
      category: "Parcours professionnel",
      phase: 1,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_parcours_5',
      title: "Quelle formation initiale avez-vous suivie et comment a-t-elle influencé votre parcours ?",
      description: "Parlez-moi de vos études et de leur impact sur vos choix professionnels.",
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
    },
    {
      id: 'fallback_competences_3',
      title: "Quels outils ou logiciels maîtrisez-vous dans votre domaine ?",
      description: "Listez les outils numériques, logiciels ou technologies que vous utilisez quotidiennement.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences techniques",
      required: true,
      category: "Compétences techniques",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_competences_4',
      title: "Avez-vous des certifications ou formations complémentaires ?",
      description: "Parlez-moi des formations continues, certifications ou diplômes que vous avez obtenus.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences techniques",
      required: true,
      category: "Compétences techniques",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_competences_5',
      title: "Comment évaluez-vous votre niveau de maîtrise dans votre domaine d'expertise ?",
      description: "Sur une échelle de débutant à expert, où vous situez-vous et pourquoi ?",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences techniques",
      required: true,
      category: "Compétences techniques",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    }
  ],

  // Phase Préliminaire - Attentes du bilan
  attentes_bilan: [
    {
      id: 'fallback_attentes_1',
      title: "Qu'attendez-vous de ce bilan de compétences ?",
      description: "Décrivez vos objectifs et ce que vous espérez obtenir à l'issue de ce bilan.",
      type: QuestionType.PARAGRAPH,
      theme: "Attentes",
      required: true,
      category: "Attentes du bilan",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_attentes_2',
      title: "Qu'est-ce qui vous a motivé à entreprendre ce bilan maintenant ?",
      description: "Parlez-moi du contexte et des raisons qui vous ont poussé à démarrer cette démarche.",
      type: QuestionType.PARAGRAPH,
      theme: "Attentes",
      required: true,
      category: "Attentes du bilan",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_attentes_3',
      title: "Y a-t-il des aspects particuliers de votre situation professionnelle que vous souhaitez explorer ?",
      description: "Identifiez les thèmes ou questions qui vous préoccupent particulièrement.",
      type: QuestionType.PARAGRAPH,
      theme: "Attentes",
      required: true,
      category: "Attentes du bilan",
      phase: 1,
      expectedDuration: 3,
      followUp: []
    }
  ],

  // ============================================
  // PHASE 2 - INVESTIGATION (~50% du temps)
  // ============================================

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
    },
    {
      id: 'fallback_motivations_3',
      title: "Qu'est-ce qui vous démotive ou vous frustre dans votre travail actuel ?",
      description: "Identifiez les aspects de votre situation professionnelle qui vous pèsent ou vous freinent.",
      type: QuestionType.PARAGRAPH,
      theme: "Motivations",
      required: true,
      category: "Motivations",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_motivations_4',
      title: "Quel type d'environnement de travail vous convient le mieux ?",
      description: "Décrivez l'ambiance, la culture d'entreprise et les conditions de travail idéales pour vous.",
      type: QuestionType.PARAGRAPH,
      theme: "Motivations",
      required: true,
      category: "Motivations",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_motivations_5',
      title: "Préférez-vous travailler en équipe ou de manière autonome ?",
      description: "Expliquez votre mode de fonctionnement préféré et donnez des exemples.",
      type: QuestionType.PARAGRAPH,
      theme: "Motivations",
      required: true,
      category: "Motivations",
      phase: 2,
      expectedDuration: 3,
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
    },
    {
      id: 'fallback_valeurs_3',
      title: "Y a-t-il des valeurs que vous aimeriez davantage exprimer dans votre vie professionnelle ?",
      description: "Identifiez les valeurs que vous ne pouvez pas pleinement vivre actuellement.",
      type: QuestionType.PARAGRAPH,
      theme: "Valeurs",
      required: true,
      category: "Valeurs",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_valeurs_4',
      title: "Quelle importance accordez-vous à l'équilibre vie professionnelle / vie personnelle ?",
      description: "Décrivez comment vous gérez cet équilibre et ce que vous souhaiteriez améliorer.",
      type: QuestionType.PARAGRAPH,
      theme: "Valeurs",
      required: true,
      category: "Valeurs",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_valeurs_5',
      title: "L'éthique et la responsabilité sociale sont-elles importantes pour vous dans le choix d'un employeur ?",
      description: "Expliquez votre position sur ces sujets et leur impact sur vos choix professionnels.",
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
    },
    {
      id: 'fallback_realisations_3',
      title: "Pouvez-vous me décrire un projet que vous avez mené de A à Z ?",
      description: "Détaillez les étapes, les difficultés rencontrées et les résultats obtenus.",
      type: QuestionType.PARAGRAPH,
      theme: "Réalisations",
      required: true,
      category: "Réalisations",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_realisations_4',
      title: "Avez-vous déjà eu à gérer une situation de crise ou d'urgence ? Comment l'avez-vous gérée ?",
      description: "Décrivez une situation difficile et les actions que vous avez entreprises.",
      type: QuestionType.PARAGRAPH,
      theme: "Réalisations",
      required: true,
      category: "Réalisations",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_realisations_5',
      title: "Quelle contribution avez-vous apportée à votre équipe ou entreprise dont vous êtes particulièrement satisfait ?",
      description: "Parlez-moi d'un impact positif que vous avez eu sur votre environnement de travail.",
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
    },
    {
      id: 'fallback_projet_3',
      title: "Avez-vous envisagé une reconversion professionnelle ? Si oui, vers quel domaine ?",
      description: "Parlez-moi de vos réflexions sur un éventuel changement de carrière.",
      type: QuestionType.PARAGRAPH,
      theme: "Projet professionnel",
      required: true,
      category: "Projet professionnel",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_projet_4',
      title: "Quelles sont les ressources dont vous disposez pour réaliser votre projet ?",
      description: "Identifiez vos atouts : réseau, compétences, finances, temps, soutien familial...",
      type: QuestionType.PARAGRAPH,
      theme: "Projet professionnel",
      required: true,
      category: "Projet professionnel",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_projet_5',
      title: "Quel serait votre métier idéal si vous n'aviez aucune contrainte ?",
      description: "Laissez libre cours à votre imagination et décrivez votre travail de rêve.",
      type: QuestionType.PARAGRAPH,
      theme: "Projet professionnel",
      required: true,
      category: "Projet professionnel",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    }
  ],

  // Phase Investigation - Compétences transversales
  competences_transversales: [
    {
      id: 'fallback_transversales_1',
      title: "Comment décririez-vous votre capacité à communiquer avec différents types d'interlocuteurs ?",
      description: "Donnez des exemples de situations où vous avez dû adapter votre communication.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences transversales",
      required: true,
      category: "Compétences transversales",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_transversales_2',
      title: "Comment gérez-vous le stress et la pression au travail ?",
      description: "Décrivez vos stratégies pour rester efficace dans les moments difficiles.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences transversales",
      required: true,
      category: "Compétences transversales",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_transversales_3',
      title: "Avez-vous déjà eu à manager une équipe ? Comment décririez-vous votre style de management ?",
      description: "Parlez-moi de votre expérience en leadership et de votre approche.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences transversales",
      required: true,
      category: "Compétences transversales",
      phase: 2,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_transversales_4',
      title: "Comment vous adaptez-vous aux changements dans votre environnement de travail ?",
      description: "Donnez des exemples de situations où vous avez dû vous adapter rapidement.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences transversales",
      required: true,
      category: "Compétences transversales",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_transversales_5',
      title: "Comment organisez-vous votre travail et gérez-vous vos priorités ?",
      description: "Décrivez vos méthodes d'organisation et de gestion du temps.",
      type: QuestionType.PARAGRAPH,
      theme: "Compétences transversales",
      required: true,
      category: "Compétences transversales",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // Phase Investigation - Intérêts et passions
  interets_passions: [
    {
      id: 'fallback_interets_1',
      title: "Quels sont vos centres d'intérêt en dehors du travail ?",
      description: "Parlez-moi de vos hobbies, passions et activités de loisirs.",
      type: QuestionType.PARAGRAPH,
      theme: "Intérêts",
      required: true,
      category: "Intérêts et passions",
      phase: 2,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_interets_2',
      title: "Y a-t-il des compétences développées dans vos loisirs qui pourraient être utiles professionnellement ?",
      description: "Identifiez les liens entre vos passions et votre vie professionnelle.",
      type: QuestionType.PARAGRAPH,
      theme: "Intérêts",
      required: true,
      category: "Intérêts et passions",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_interets_3',
      title: "Quels sujets ou domaines vous passionnent et sur lesquels vous aimez vous former ?",
      description: "Parlez-moi de votre curiosité intellectuelle et de vos apprentissages récents.",
      type: QuestionType.PARAGRAPH,
      theme: "Intérêts",
      required: true,
      category: "Intérêts et passions",
      phase: 2,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // ============================================
  // PHASE 3 - CONCLUSION (~17% du temps)
  // ============================================

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
    },
    {
      id: 'fallback_synthese_3',
      title: "Quels sont les points forts que vous avez identifiés et que vous souhaitez mettre en avant ?",
      description: "Listez vos atouts principaux qui constituent votre valeur ajoutée.",
      type: QuestionType.PARAGRAPH,
      theme: "Synthèse",
      required: true,
      category: "Synthèse",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_synthese_4',
      title: "Quels sont les axes de développement sur lesquels vous souhaitez travailler ?",
      description: "Identifiez les compétences ou aspects à améliorer pour atteindre vos objectifs.",
      type: QuestionType.PARAGRAPH,
      theme: "Synthèse",
      required: true,
      category: "Synthèse",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_synthese_5',
      title: "Comment allez-vous mesurer votre progression vers vos objectifs ?",
      description: "Définissez des indicateurs concrets pour suivre votre avancement.",
      type: QuestionType.PARAGRAPH,
      theme: "Synthèse",
      required: true,
      category: "Synthèse",
      phase: 3,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // Phase Conclusion - Plan d'action
  plan_action: [
    {
      id: 'fallback_plan_1',
      title: "Quelles sont les trois premières actions que vous allez entreprendre dans le mois à venir ?",
      description: "Définissez des actions concrètes et réalisables à court terme.",
      type: QuestionType.PARAGRAPH,
      theme: "Plan d'action",
      required: true,
      category: "Plan d'action",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_plan_2',
      title: "De quel soutien ou accompagnement auriez-vous besoin pour réussir votre projet ?",
      description: "Identifiez les ressources externes qui pourraient vous aider.",
      type: QuestionType.PARAGRAPH,
      theme: "Plan d'action",
      required: true,
      category: "Plan d'action",
      phase: 3,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_plan_3',
      title: "Quels sont les risques potentiels et comment comptez-vous les anticiper ?",
      description: "Identifiez les obstacles possibles et vos stratégies pour les surmonter.",
      type: QuestionType.PARAGRAPH,
      theme: "Plan d'action",
      required: true,
      category: "Plan d'action",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_plan_4',
      title: "Quel est votre calendrier prévisionnel pour les 6 prochains mois ?",
      description: "Établissez un planning avec les grandes étapes de votre projet.",
      type: QuestionType.PARAGRAPH,
      theme: "Plan d'action",
      required: true,
      category: "Plan d'action",
      phase: 3,
      expectedDuration: 5,
      followUp: []
    },
    {
      id: 'fallback_plan_5',
      title: "Comment allez-vous maintenir votre motivation tout au long de ce parcours ?",
      description: "Identifiez vos sources de motivation et vos stratégies pour rester engagé.",
      type: QuestionType.PARAGRAPH,
      theme: "Plan d'action",
      required: true,
      category: "Plan d'action",
      phase: 3,
      expectedDuration: 4,
      followUp: []
    }
  ],

  // Phase Conclusion - Bilan final
  bilan_final: [
    {
      id: 'fallback_bilan_1',
      title: "En une phrase, comment résumeriez-vous votre projet professionnel ?",
      description: "Formulez votre objectif de manière claire et concise.",
      type: QuestionType.PARAGRAPH,
      theme: "Bilan final",
      required: true,
      category: "Bilan final",
      phase: 3,
      expectedDuration: 3,
      followUp: []
    },
    {
      id: 'fallback_bilan_2',
      title: "Qu'avez-vous appris de nouveau sur vous-même grâce à ce bilan ?",
      description: "Partagez les découvertes ou prises de conscience importantes.",
      type: QuestionType.PARAGRAPH,
      theme: "Bilan final",
      required: true,
      category: "Bilan final",
      phase: 3,
      expectedDuration: 4,
      followUp: []
    },
    {
      id: 'fallback_bilan_3',
      title: "Quels conseils donneriez-vous à quelqu'un qui démarre un bilan de compétences ?",
      description: "Partagez votre expérience et vos recommandations.",
      type: QuestionType.PARAGRAPH,
      theme: "Bilan final",
      required: true,
      category: "Bilan final",
      phase: 3,
      expectedDuration: 4,
      followUp: []
    }
  ]
};

/**
 * Compte le nombre total de questions de fallback disponibles
 */
export function countFallbackQuestions(): number {
  return Object.values(FALLBACK_QUESTIONS).flat().length;
}

/**
 * Traduit une question de fallback selon la langue courante
 */
function translateFallbackQuestion(question: FallbackQuestion): FallbackQuestion {
  const lang = getCurrentLanguage();
  if (lang === 'fr') return question; // Déjà en français
  
  if (lang === 'tr') {
    const translation = FALLBACK_TRANSLATIONS_TR[question.id];
    if (translation) {
      return {
        ...question,
        title: translation.title,
        description: translation.description,
        theme: translation.theme || question.theme,
        category: translation.category || question.category,
      };
    }
  }
  
  return question; // Fallback: retourner la version française
}

/**
 * Sélectionne une question de fallback appropriée selon le contexte
 * Supporte le multilangue via les fichiers de traduction
 */
export function selectFallbackQuestion(
  categoryId: string,
  phase: number,
  previousQuestionIds: string[]
): Question | null {
  console.log(`[selectFallbackQuestion] Recherche question pour catégorie: ${categoryId}, phase: ${phase}`);
  console.log(`[selectFallbackQuestion] Questions déjà posées: ${previousQuestionIds.length}`);
  
  // Chercher les questions de la catégorie
  const categoryQuestions = FALLBACK_QUESTIONS[categoryId];
  
  if (!categoryQuestions || categoryQuestions.length === 0) {
    console.log(`[selectFallbackQuestion] Pas de questions pour la catégorie ${categoryId}, recherche dans la phase ${phase}`);
    
    // Si pas de questions pour cette catégorie, chercher dans toutes les questions de la phase
    const allQuestions = Object.values(FALLBACK_QUESTIONS).flat();
    const phaseQuestions = allQuestions.filter(q => q.phase === phase);
    
    console.log(`[selectFallbackQuestion] ${phaseQuestions.length} questions trouvées pour la phase ${phase}`);
    
    if (phaseQuestions.length === 0) {
      console.warn('[selectFallbackQuestion] Aucune question de fallback disponible');
      return null;
    }
    
    // Sélectionner une question non encore posée
    const availableQuestions = phaseQuestions.filter(
      q => !previousQuestionIds.includes(q.id)
    );
    
    console.log(`[selectFallbackQuestion] ${availableQuestions.length} questions disponibles (non posées)`);
    
    if (availableQuestions.length === 0) {
      // Si toutes les questions ont été posées, en sélectionner une au hasard
      const randomQuestion = phaseQuestions[Math.floor(Math.random() * phaseQuestions.length)];
      if (!randomQuestion) return null;
      console.log(`[selectFallbackQuestion] Toutes les questions posées, sélection aléatoire: ${randomQuestion.id}`);
      return translateFallbackQuestion(randomQuestion);
    }
    
    const firstAvailable = availableQuestions[0];
    if (!firstAvailable) return null;
    console.log(`[selectFallbackQuestion] Question sélectionnée: ${firstAvailable.id}`);
    return translateFallbackQuestion(firstAvailable);
  }
  
  // Sélectionner une question de la catégorie non encore posée
  const availableQuestions = categoryQuestions.filter(
    q => !previousQuestionIds.includes(q.id)
  );
  
  console.log(`[selectFallbackQuestion] ${availableQuestions.length}/${categoryQuestions.length} questions disponibles pour ${categoryId}`);
  
  if (availableQuestions.length === 0) {
    // Si toutes les questions de la catégorie ont été posées, en sélectionner une au hasard
    const randomQuestion = categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
    if (!randomQuestion) return null;
    console.log(`[selectFallbackQuestion] Toutes les questions de la catégorie posées, sélection aléatoire: ${randomQuestion.id}`);
    return translateFallbackQuestion(randomQuestion);
  }
  
  const firstCategoryAvailable = availableQuestions[0];
  if (!firstCategoryAvailable) return null;
  console.log(`[selectFallbackQuestion] Question sélectionnée: ${firstCategoryAvailable.id}`);
  return translateFallbackQuestion(firstCategoryAvailable);
}
