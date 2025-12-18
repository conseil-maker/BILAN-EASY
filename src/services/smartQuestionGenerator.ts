/**
 * Générateur de questions intelligentes côté client
 * Utilisé comme fallback quand l'API Gemini échoue
 * Analyse la dernière réponse et génère une question personnalisée
 */

import { Question, QuestionType, Answer, CoachingStyle } from '../types';

interface KeywordPattern {
  patterns: RegExp[];
  questions: string[];
  theme: string;
}

// Patterns de détection et questions associées
const KEYWORD_PATTERNS: KeywordPattern[] = [
  // Évolution de carrière
  {
    patterns: [/évolu[ée]/i, /progression/i, /gravi/i, /mont[ée]/i, /promu/i, /promotion/i],
    questions: [
      "Vous mentionnez une évolution dans votre parcours. Quel a été le moment décisif qui a marqué cette progression ?",
      "Cette évolution que vous décrivez, qu'est-ce qui l'a rendue possible selon vous ?",
      "Votre progression est intéressante. Quelles compétences avez-vous dû développer pour y arriver ?"
    ],
    theme: "Évolution professionnelle"
  },
  // Management / équipe
  {
    patterns: [/équipe/i, /manag/i, /gérer?\s+\d+/i, /collaborateurs?/i, /diriger/i, /encadrer/i],
    questions: [
      "Vous parlez de gestion d'équipe. Qu'est-ce qui vous plaît le plus dans le management, et qu'est-ce qui vous pèse ?",
      "Manager une équipe demande beaucoup d'énergie. Comment décririez-vous votre style de management ?",
      "Vous mentionnez votre équipe. Quelle est la plus grande fierté que vous avez eue en tant que manager ?"
    ],
    theme: "Management"
  },
  // Lassitude / ennui / routine
  {
    patterns: [/lassitude/i, /ennui/i, /routine/i, /monoton/i, /répétiti/i, /usure/i, /fatigue/i],
    questions: [
      "Vous exprimez une certaine lassitude. Si vous pouviez changer une seule chose dans votre quotidien professionnel, ce serait quoi ?",
      "Cette sensation que vous décrivez, depuis quand la ressentez-vous ? Y a-t-il eu un déclencheur ?",
      "La routine peut être pesante. Qu'est-ce qui vous manque le plus par rapport à vos débuts ?"
    ],
    theme: "Bien-être au travail"
  },
  // Passion / motivation
  {
    patterns: [/passion/i, /motiv/i, /enthousiasm/i, /épanoui/i, /plaisir/i, /aime/i, /adore/i],
    questions: [
      "Vous parlez de ce qui vous passionne. Pouvez-vous me décrire un moment récent où vous avez ressenti cette passion au travail ?",
      "Cette motivation que vous décrivez, comment pourriez-vous la cultiver davantage dans votre quotidien ?",
      "Qu'est-ce qui fait que cette activité vous passionne autant ? Quelles valeurs cela touche-t-il chez vous ?"
    ],
    theme: "Motivations"
  },
  // Reconversion / changement
  {
    patterns: [/reconversi/i, /changer/i, /réorient/i, /nouveau métier/i, /autre domaine/i, /bifurquer/i],
    questions: [
      "Vous évoquez une possible reconversion. Qu'est-ce qui vous attire dans cette nouvelle direction ?",
      "Ce désir de changement, est-il récent ou y pensez-vous depuis longtemps ?",
      "Si vous vous reconvertissiez, qu'est-ce que vous aimeriez absolument conserver de votre expérience actuelle ?"
    ],
    theme: "Projet professionnel"
  },
  // Création d'entreprise
  {
    patterns: [/créer/i, /entreprendre/i, /propre structure/i, /indépendant/i, /freelance/i, /mon entreprise/i],
    questions: [
      "L'idée de créer votre propre structure vous attire. Qu'est-ce qui vous motive le plus dans l'entrepreneuriat ?",
      "Vous mentionnez l'envie d'entreprendre. Avez-vous déjà une idée précise de ce que vous aimeriez créer ?",
      "L'indépendance professionnelle vous tente. Quels seraient selon vous les plus grands défis à relever ?"
    ],
    theme: "Entrepreneuriat"
  },
  // Compétences techniques
  {
    patterns: [/technique/i, /développ/i, /code/i, /programm/i, /technolog/i, /innovation/i],
    questions: [
      "Vous mentionnez l'aspect technique. Quelles sont les compétences techniques dont vous êtes le plus fier ?",
      "La technique semble importante pour vous. Comment voyez-vous l'évolution de ces compétences dans les prochaines années ?",
      "Vous parlez d'innovation technique. Pouvez-vous me donner un exemple concret d'innovation que vous avez portée ?"
    ],
    theme: "Compétences techniques"
  },
  // Conseil / accompagnement
  {
    patterns: [/conseil/i, /accompagn/i, /consultant/i, /aider/i, /transmettre/i, /former/i],
    questions: [
      "Le conseil vous attire. Qu'est-ce qui vous plaît dans l'idée d'accompagner d'autres personnes ou entreprises ?",
      "Vous mentionnez la transmission. Avez-vous déjà eu des expériences de mentorat ou de formation ?",
      "L'accompagnement semble vous intéresser. Quel type de problématiques aimeriez-vous aider à résoudre ?"
    ],
    theme: "Conseil et accompagnement"
  },
  // Stress / pression
  {
    patterns: [/stress/i, /pression/i, /charge/i, /surcharge/i, /burn/i, /épuis/i],
    questions: [
      "Vous évoquez une certaine pression. Comment gérez-vous le stress au quotidien ?",
      "Cette charge que vous décrivez, qu'est-ce qui pourrait l'alléger selon vous ?",
      "Le stress fait partie de votre quotidien. Qu'est-ce qui vous aide à décompresser ?"
    ],
    theme: "Équilibre vie pro/perso"
  },
  // Valeurs / sens
  {
    patterns: [/sens/i, /valeur/i, /impact/i, /utilité/i, /contribu/i, /mission/i],
    questions: [
      "Vous parlez de sens dans votre travail. Qu'est-ce qui donne du sens à votre activité professionnelle ?",
      "Les valeurs semblent importantes pour vous. Quelles sont celles qui guident vos choix de carrière ?",
      "Vous mentionnez l'impact. Quel impact aimeriez-vous avoir à travers votre travail ?"
    ],
    theme: "Valeurs et sens"
  }
];

// Questions génériques de relance par thème
const GENERIC_FOLLOWUPS: Record<string, string[]> = {
  default: [
    "Ce que vous partagez est très intéressant. Pouvez-vous m'en dire plus sur ce qui vous a marqué dans cette expérience ?",
    "J'aimerais creuser un peu plus. Qu'est-ce qui vous a le plus surpris dans cette situation ?",
    "Votre témoignage est riche. Quel apprentissage en avez-vous tiré ?",
    "C'est passionnant. Comment cette expérience a-t-elle influencé votre vision de votre carrière ?"
  ],
  parcours: [
    "Votre parcours est riche. Quelle étape a été la plus formatrice selon vous ?",
    "En regardant en arrière, y a-t-il des choix que vous feriez différemment ?",
    "Qu'est-ce qui vous rend le plus fier dans votre parcours jusqu'ici ?"
  ],
  futur: [
    "En vous projetant dans l'avenir, qu'est-ce qui vous enthousiasme le plus ?",
    "Quel serait votre scénario idéal pour les 2-3 prochaines années ?",
    "Qu'est-ce qui vous manque aujourd'hui pour atteindre vos objectifs ?"
  ]
};

/**
 * Analyse une réponse et extrait les éléments clés
 */
function analyzeAnswer(answer: string): { keywords: string[], detectedPatterns: KeywordPattern[] } {
  const keywords: string[] = [];
  const detectedPatterns: KeywordPattern[] = [];
  
  for (const pattern of KEYWORD_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(answer)) {
        detectedPatterns.push(pattern);
        const matches = answer.match(regex);
        if (matches) keywords.push(...matches);
        break; // Une seule correspondance par pattern suffit
      }
    }
  }
  
  return { keywords: [...new Set(keywords)], detectedPatterns };
}

/**
 * Génère une question personnalisée basée sur la dernière réponse
 */
export function generateSmartQuestion(
  previousAnswers: Answer[],
  userName: string,
  coachingStyle: CoachingStyle
): Question | null {
  if (previousAnswers.length === 0) {
    // Première question - retourner null pour utiliser le fallback standard
    return null;
  }
  
  const lastAnswer = previousAnswers[previousAnswers.length - 1];
  const { detectedPatterns } = analyzeAnswer(lastAnswer.value);
  
  // Trouver les questions déjà posées pour éviter les répétitions
  const askedQuestionTitles = previousAnswers
    .filter(a => a.questionTitle)
    .map(a => a.questionTitle!.toLowerCase());
  
  let selectedQuestion: string | null = null;
  let selectedTheme = "Exploration";
  
  // Chercher une question basée sur les patterns détectés
  if (detectedPatterns.length > 0) {
    // Prioriser les patterns dans l'ordre de détection
    for (const pattern of detectedPatterns) {
      // Filtrer les questions non encore posées
      const availableQuestions = pattern.questions.filter(
        q => !askedQuestionTitles.some(asked => 
          asked.includes(q.substring(0, 30).toLowerCase())
        )
      );
      
      if (availableQuestions.length > 0) {
        // Sélectionner une question au hasard parmi les disponibles
        selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        selectedTheme = pattern.theme;
        break;
      }
    }
  }
  
  // Si aucune question spécifique trouvée, utiliser une question générique
  if (!selectedQuestion) {
    const genericQuestions = [
      ...GENERIC_FOLLOWUPS.default,
      ...(previousAnswers.length < 3 ? GENERIC_FOLLOWUPS.parcours : GENERIC_FOLLOWUPS.futur)
    ];
    
    const availableGeneric = genericQuestions.filter(
      q => !askedQuestionTitles.some(asked => 
        asked.includes(q.substring(0, 30).toLowerCase())
      )
    );
    
    if (availableGeneric.length > 0) {
      selectedQuestion = availableGeneric[Math.floor(Math.random() * availableGeneric.length)];
    }
  }
  
  if (!selectedQuestion) {
    return null; // Laisser le fallback standard prendre le relais
  }
  
  // Personnaliser la question avec le prénom si le style est collaboratif
  let finalQuestion = selectedQuestion;
  if (coachingStyle === 'collaborative' && !selectedQuestion.includes(userName)) {
    // Ajouter une touche personnelle
    const personalTouches = [
      `${userName}, `,
      `Je vous écoute ${userName}. `,
      `C'est passionnant ${userName}. `
    ];
    const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
    finalQuestion = touch + selectedQuestion.charAt(0).toLowerCase() + selectedQuestion.slice(1);
  }
  
  // Créer la question avec un ID unique
  const question: Question = {
    id: `smart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: finalQuestion,
    description: "Question générée en fonction de votre réponse précédente.",
    type: QuestionType.PARAGRAPH,
    theme: selectedTheme,
    required: true
  };
  
  console.log('[SmartQuestionGenerator] Question générée:', question.title.substring(0, 50));
  return question;
}

/**
 * Génère une question d'ouverture personnalisée
 */
export function generateOpeningQuestion(userName: string, coachingStyle: CoachingStyle): Question {
  const openingQuestions: Record<CoachingStyle, string[]> = {
    collaborative: [
      `${userName}, pour commencer notre échange, j'aimerais vous connaître un peu mieux. Pouvez-vous me raconter votre parcours professionnel et ce qui vous amène à faire ce bilan aujourd'hui ?`,
      `${userName}, bienvenue dans cet espace d'échange. Pour démarrer, parlez-moi de vous : votre parcours, vos expériences, et ce qui vous motive à entreprendre ce bilan de compétences.`,
      `${userName}, je suis ravi de vous accompagner. Pour commencer, pouvez-vous me présenter votre parcours professionnel et me dire ce qui vous a conduit jusqu'ici ?`
    ],
    analytic: [
      `${userName}, pour structurer notre échange, commençons par les faits. Pouvez-vous me décrire chronologiquement les grandes étapes de votre parcours professionnel ?`,
      `${userName}, pour bien comprendre votre situation, j'aimerais que vous me présentiez votre parcours : les postes occupés, les durées, et les transitions clés.`,
      `${userName}, démarrons par un état des lieux. Décrivez-moi votre parcours professionnel en mettant en avant les compétences acquises à chaque étape.`
    ],
    creative: [
      `${userName}, imaginons que votre parcours professionnel soit un livre. Quels en seraient les chapitres principaux, et où en êtes-vous dans l'histoire ?`,
      `${userName}, si vous deviez résumer votre parcours en une métaphore ou une image, ce serait quoi ? Racontez-moi votre histoire professionnelle.`,
      `${userName}, votre parcours est unique. Racontez-le moi comme une aventure, avec ses découvertes, ses défis et ses moments de transformation.`
    ]
  };
  
  const questions = openingQuestions[coachingStyle] || openingQuestions.collaborative;
  const selectedQuestion = questions[Math.floor(Math.random() * questions.length)];
  
  return {
    id: `opening_${Date.now()}`,
    title: selectedQuestion,
    description: "Prenez le temps de vous présenter librement.",
    type: QuestionType.PARAGRAPH,
    theme: "Présentation",
    required: true
  };
}
