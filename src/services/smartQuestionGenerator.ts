/**
 * Générateur de questions intelligentes côté client
 * Utilisé comme fallback quand l'API Gemini échoue
 * Analyse la dernière réponse et génère une question personnalisée
 * 
 * VERSION i18n - Support multilingue FR/TR
 */

import { Question, QuestionType, Answer, CoachingStyle } from '../types';
import { getAITranslationObject, getOpeningQuestions, getPersonalTouches, getThemeName, getFallbackText, getCurrentLanguage } from './aiTranslationHelper';

interface KeywordPattern {
  patterns: RegExp[];
  questionsKey: string; // clé i18n au lieu de questions hardcodées
  themeKey: string;
  // Questions de fallback en dur pour le cas où i18n n'est pas disponible
  fallbackQuestions: Record<string, string[]>;
}

// Patterns de détection et clés de questions associées
// Les regex fonctionnent pour FR et TR
const KEYWORD_PATTERNS: KeywordPattern[] = [
  // Évolution de carrière
  {
    patterns: [/évolu[ée]/i, /progression/i, /gravi/i, /mont[ée]/i, /promu/i, /promotion/i, /gelişim/i, /ilerleme/i, /terfi/i, /yüksel/i],
    questionsKey: 'smartQuestions.keywordQuestions.evolution',
    themeKey: 'evolution',
    fallbackQuestions: {
      fr: [
        "Vous mentionnez une évolution dans votre parcours. Quel a été le moment décisif qui a marqué cette progression ?",
        "Cette évolution que vous décrivez, qu'est-ce qui l'a rendue possible selon vous ?",
        "Votre progression est intéressante. Quelles compétences avez-vous dû développer pour y arriver ?"
      ],
      tr: [
        "Kariyerinizde bir gelişimden bahsediyorsunuz. Bu ilerlemeyi belirleyen karar anı ne oldu?",
        "Anlattığınız bu gelişimi sizce ne mümkün kıldı?",
        "İlerlemeniz ilginç. Bunu başarmak için hangi yetkinlikleri geliştirmeniz gerekti?"
      ]
    }
  },
  // Management / équipe
  {
    patterns: [/équipe/i, /manag/i, /gérer?\s+\d+/i, /collaborateurs?/i, /diriger/i, /encadrer/i, /ekip/i, /yönet/i, /lider/i, /çalışan/i],
    questionsKey: 'smartQuestions.keywordQuestions.management',
    themeKey: 'management',
    fallbackQuestions: {
      fr: [
        "Vous parlez de gestion d'équipe. Qu'est-ce qui vous plaît le plus dans le management, et qu'est-ce qui vous pèse ?",
        "Manager une équipe demande beaucoup d'énergie. Comment décririez-vous votre style de management ?",
        "Vous mentionnez votre équipe. Quelle est la plus grande fierté que vous avez eue en tant que manager ?"
      ],
      tr: [
        "Ekip yönetiminden bahsediyorsunuz. Yöneticilikte en çok neyi seviyorsunuz ve neyi zor buluyorsunuz?",
        "Bir ekibi yönetmek çok enerji gerektirir. Yönetim tarzınızı nasıl tanımlarsınız?",
        "Ekibinizden bahsediyorsunuz. Bir yönetici olarak en büyük gurur kaynağınız ne oldu?"
      ]
    }
  },
  // Lassitude / ennui / routine
  {
    patterns: [/lassitude/i, /ennui/i, /routine/i, /monoton/i, /répétiti/i, /usure/i, /fatigue/i, /bıkkınlık/i, /sıkıntı/i, /rutin/i, /tekrar/i, /yorgunluk/i],
    questionsKey: 'smartQuestions.keywordQuestions.wellbeing',
    themeKey: 'wellbeing',
    fallbackQuestions: {
      fr: [
        "Vous exprimez une certaine lassitude. Si vous pouviez changer une seule chose dans votre quotidien professionnel, ce serait quoi ?",
        "Cette sensation que vous décrivez, depuis quand la ressentez-vous ? Y a-t-il eu un déclencheur ?",
        "La routine peut être pesante. Qu'est-ce qui vous manque le plus par rapport à vos débuts ?"
      ],
      tr: [
        "Bir tür bıkkınlık ifade ediyorsunuz. İş hayatınızda tek bir şeyi değiştirebilseydiniz, ne olurdu?",
        "Anlattığınız bu duyguyu ne zamandır hissediyorsunuz? Tetikleyici bir olay oldu mu?",
        "Rutin ağır olabilir. Başlangıçlarınıza kıyasla en çok neyi özlüyorsunuz?"
      ]
    }
  },
  // Passion / motivation
  {
    patterns: [/passion/i, /motiv/i, /enthousiasm/i, /épanoui/i, /plaisir/i, /aime/i, /adore/i, /tutku/i, /heves/i, /mutlu/i, /zevk/i, /sev/i],
    questionsKey: 'smartQuestions.keywordQuestions.motivations',
    themeKey: 'motivations',
    fallbackQuestions: {
      fr: [
        "Vous parlez de ce qui vous passionne. Pouvez-vous me décrire un moment récent où vous avez ressenti cette passion au travail ?",
        "Cette motivation que vous décrivez, comment pourriez-vous la cultiver davantage dans votre quotidien ?",
        "Qu'est-ce qui fait que cette activité vous passionne autant ? Quelles valeurs cela touche-t-il chez vous ?"
      ],
      tr: [
        "Sizi tutkuyla bağlayan şeylerden bahsediyorsunuz. İşte bu tutkuyu hissettiğiniz yakın zamandaki bir anı anlatabilir misiniz?",
        "Anlattığınız bu motivasyonu günlük hayatınızda nasıl daha fazla besleyebilirsiniz?",
        "Bu aktiviteyi bu kadar tutkuyla yapmanızı sağlayan ne? Sizde hangi değerlere dokunuyor?"
      ]
    }
  },
  // Reconversion / changement
  {
    patterns: [/reconversi/i, /changer/i, /réorient/i, /nouveau métier/i, /autre domaine/i, /bifurquer/i, /kariyer değişikliği/i, /yeni meslek/i, /farklı alan/i, /dönüşüm/i],
    questionsKey: 'smartQuestions.keywordQuestions.project',
    themeKey: 'project',
    fallbackQuestions: {
      fr: [
        "Vous évoquez une possible reconversion. Qu'est-ce qui vous attire dans cette nouvelle direction ?",
        "Ce désir de changement, est-il récent ou y pensez-vous depuis longtemps ?",
        "Si vous vous reconvertissiez, qu'est-ce que vous aimeriez absolument conserver de votre expérience actuelle ?"
      ],
      tr: [
        "Olası bir kariyer değişikliğinden bahsediyorsunuz. Bu yeni yönde sizi çeken ne?",
        "Bu değişim arzusu yeni mi yoksa uzun süredir mi düşünüyorsunuz?",
        "Kariyer değiştirseniz, mevcut deneyiminizden kesinlikle korumak istediğiniz şey ne olurdu?"
      ]
    }
  },
  // Création d'entreprise
  {
    patterns: [/créer/i, /entreprendre/i, /propre structure/i, /indépendant/i, /freelance/i, /mon entreprise/i, /girişim/i, /kendi iş/i, /bağımsız/i, /serbest/i],
    questionsKey: 'smartQuestions.keywordQuestions.entrepreneurship',
    themeKey: 'entrepreneurship',
    fallbackQuestions: {
      fr: [
        "L'idée de créer votre propre structure vous attire. Qu'est-ce qui vous motive le plus dans l'entrepreneuriat ?",
        "Vous mentionnez l'envie d'entreprendre. Avez-vous déjà une idée précise de ce que vous aimeriez créer ?",
        "L'indépendance professionnelle vous tente. Quels seraient selon vous les plus grands défis à relever ?"
      ],
      tr: [
        "Kendi yapınızı kurma fikri sizi çekiyor. Girişimcilikte sizi en çok motive eden ne?",
        "Girişimcilik isteğinden bahsediyorsunuz. Ne yaratmak istediğinize dair net bir fikriniz var mı?",
        "Mesleki bağımsızlık sizi cezbediyor. Sizce karşılaşılacak en büyük zorluklar neler olurdu?"
      ]
    }
  },
  // Compétences techniques
  {
    patterns: [/technique/i, /développ/i, /code/i, /programm/i, /technolog/i, /innovation/i, /teknik/i, /geliştir/i, /yazılım/i, /teknoloji/i, /inovasyon/i],
    questionsKey: 'smartQuestions.keywordQuestions.technical',
    themeKey: 'technical',
    fallbackQuestions: {
      fr: [
        "Vous mentionnez l'aspect technique. Quelles sont les compétences techniques dont vous êtes le plus fier ?",
        "La technique semble importante pour vous. Comment voyez-vous l'évolution de ces compétences dans les prochaines années ?",
        "Vous parlez d'innovation technique. Pouvez-vous me donner un exemple concret d'innovation que vous avez portée ?"
      ],
      tr: [
        "Teknik yönden bahsediyorsunuz. En çok gurur duyduğunuz teknik yetkinlikler hangileri?",
        "Teknik sizin için önemli görünüyor. Bu yetkinliklerin önümüzdeki yıllarda nasıl gelişeceğini öngörüyorsunuz?",
        "Teknik inovasyondan bahsediyorsunuz. Taşıdığınız somut bir inovasyon örneği verebilir misiniz?"
      ]
    }
  },
  // Conseil / accompagnement
  {
    patterns: [/conseil/i, /accompagn/i, /consultant/i, /aider/i, /transmettre/i, /former/i, /danışman/i, /eşlik/i, /yardım/i, /aktarma/i, /eğitim/i],
    questionsKey: 'smartQuestions.keywordQuestions.consulting',
    themeKey: 'consulting',
    fallbackQuestions: {
      fr: [
        "Le conseil vous attire. Qu'est-ce qui vous plaît dans l'idée d'accompagner d'autres personnes ou entreprises ?",
        "Vous mentionnez la transmission. Avez-vous déjà eu des expériences de mentorat ou de formation ?",
        "L'accompagnement semble vous intéresser. Quel type de problématiques aimeriez-vous aider à résoudre ?"
      ],
      tr: [
        "Danışmanlık sizi çekiyor. Diğer kişilere veya şirketlere eşlik etme fikrinde sizi çeken ne?",
        "Bilgi aktarımından bahsediyorsunuz. Daha önce mentorluk veya eğitim deneyiminiz oldu mu?",
        "Eşlik etme sizi ilgilendiriyor gibi görünüyor. Ne tür sorunları çözmeye yardımcı olmak istersiniz?"
      ]
    }
  },
  // Stress / pression
  {
    patterns: [/stress/i, /pression/i, /charge/i, /surcharge/i, /burn/i, /épuis/i, /stres/i, /baskı/i, /yük/i, /tükenmiş/i],
    questionsKey: 'smartQuestions.keywordQuestions.balance',
    themeKey: 'balance',
    fallbackQuestions: {
      fr: [
        "Vous évoquez une certaine pression. Comment gérez-vous le stress au quotidien ?",
        "Cette charge que vous décrivez, qu'est-ce qui pourrait l'alléger selon vous ?",
        "Le stress fait partie de votre quotidien. Qu'est-ce qui vous aide à décompresser ?"
      ],
      tr: [
        "Bir tür baskıdan bahsediyorsunuz. Günlük stresi nasıl yönetiyorsunuz?",
        "Anlattığınız bu yükü sizce ne hafifletebilir?",
        "Stres günlük hayatınızın bir parçası. Rahatlamanıza ne yardımcı oluyor?"
      ]
    }
  },
  // Valeurs / sens
  {
    patterns: [/sens/i, /valeur/i, /impact/i, /utilité/i, /contribu/i, /mission/i, /anlam/i, /değer/i, /etki/i, /fayda/i, /katkı/i, /misyon/i],
    questionsKey: 'smartQuestions.keywordQuestions.values',
    themeKey: 'values',
    fallbackQuestions: {
      fr: [
        "Vous parlez de sens dans votre travail. Qu'est-ce qui donne du sens à votre activité professionnelle ?",
        "Les valeurs semblent importantes pour vous. Quelles sont celles qui guident vos choix de carrière ?",
        "Vous mentionnez l'impact. Quel impact aimeriez-vous avoir à travers votre travail ?"
      ],
      tr: [
        "İşinizde anlam arayışından bahsediyorsunuz. Mesleki faaliyetinize anlam veren ne?",
        "Değerler sizin için önemli görünüyor. Kariyer tercihlerinizi yönlendiren değerler hangileri?",
        "Etkiden bahsediyorsunuz. İşiniz aracılığıyla nasıl bir etki yaratmak istersiniz?"
      ]
    }
  }
];

// Questions génériques de relance par thème
const GENERIC_FOLLOWUPS: Record<string, Record<string, string[]>> = {
  default: {
    fr: [
      "Ce que vous partagez est très intéressant. Pouvez-vous m'en dire plus sur ce qui vous a marqué dans cette expérience ?",
      "J'aimerais creuser un peu plus. Qu'est-ce qui vous a le plus surpris dans cette situation ?",
      "Votre témoignage est riche. Quel apprentissage en avez-vous tiré ?",
      "C'est passionnant. Comment cette expérience a-t-elle influencé votre vision de votre carrière ?"
    ],
    tr: [
      "Paylaştıklarınız çok ilginç. Bu deneyimde sizi en çok etkileyen şey hakkında daha fazla bilgi verebilir misiniz?",
      "Biraz daha derinleşmek istiyorum. Bu durumda sizi en çok şaşırtan ne oldu?",
      "Tanıklığınız zengin. Bundan ne öğrendiniz?",
      "Bu çok ilginç. Bu deneyim kariyer vizyonunuzu nasıl etkiledi?"
    ]
  },
  parcours: {
    fr: [
      "Votre parcours est riche. Quelle étape a été la plus formatrice selon vous ?",
      "En regardant en arrière, y a-t-il des choix que vous feriez différemment ?",
      "Qu'est-ce qui vous rend le plus fier dans votre parcours jusqu'ici ?"
    ],
    tr: [
      "Kariyeriniz zengin. Sizce en öğretici aşama hangisiydi?",
      "Geriye baktığınızda, farklı yapacağınız tercihler var mı?",
      "Şu ana kadarki kariyerinizde sizi en çok gururlandıran ne?"
    ]
  },
  futur: {
    fr: [
      "En vous projetant dans l'avenir, qu'est-ce qui vous enthousiasme le plus ?",
      "Quel serait votre scénario idéal pour les 2-3 prochaines années ?",
      "Qu'est-ce qui vous manque aujourd'hui pour atteindre vos objectifs ?"
    ],
    tr: [
      "Geleceğe baktığınızda, sizi en çok heyecanlandıran ne?",
      "Önümüzdeki 2-3 yıl için ideal senaryonuz ne olurdu?",
      "Hedeflerinize ulaşmak için bugün size eksik olan ne?"
    ]
  }
};

/**
 * Récupère les questions pour un pattern donné dans la langue courante
 */
function getPatternQuestions(pattern: KeywordPattern): string[] {
  const lang = getCurrentLanguage();
  
  // Essayer d'abord les traductions i18n
  try {
    const translated = getAITranslationObject<string[]>(pattern.questionsKey);
    if (Array.isArray(translated) && translated.length > 0) {
      return translated;
    }
  } catch {
    // Fallback sur les questions hardcodées
  }
  
  // Utiliser les questions hardcodées pour la langue courante
  return pattern.fallbackQuestions[lang] ?? pattern.fallbackQuestions['fr'] ?? [];
}

/**
 * Récupère les questions génériques pour un thème dans la langue courante
 */
function getGenericQuestions(theme: string): string[] {
  const lang = getCurrentLanguage();
  const themeData = GENERIC_FOLLOWUPS[theme] ?? GENERIC_FOLLOWUPS['default'];
  if (!themeData) return [];
  return themeData[lang] ?? themeData['fr'] ?? [];
}

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
  if (!lastAnswer) return null;
  const { detectedPatterns } = analyzeAnswer(lastAnswer.value);
  
  // Trouver les questions déjà posées pour éviter les répétitions
  const askedQuestionTitles = previousAnswers
    .filter(a => a.questionTitle)
    .map(a => a.questionTitle!.toLowerCase());
  
  let selectedQuestion: string | null = null;
  let selectedThemeKey = "exploration";
  
  // Chercher une question basée sur les patterns détectés
  if (detectedPatterns.length > 0) {
    // Prioriser les patterns dans l'ordre de détection
    for (const pattern of detectedPatterns) {
      const questions = getPatternQuestions(pattern);
      
      // Filtrer les questions non encore posées
      const availableQuestions = questions.filter(
        q => !askedQuestionTitles.some(asked => 
          asked.includes(q.substring(0, 30).toLowerCase())
        )
      );
      
      if (availableQuestions.length > 0) {
        // Sélectionner une question au hasard parmi les disponibles
        selectedQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)] ?? null;
        selectedThemeKey = pattern.themeKey;
        break;
      }
    }
  }
  
  // Si aucune question spécifique trouvée, utiliser une question générique
  if (!selectedQuestion) {
    const genericQuestions = [
      ...getGenericQuestions('default'),
      ...(previousAnswers.length < 3 ? getGenericQuestions('parcours') : getGenericQuestions('futur'))
    ];
    
    const availableGeneric = genericQuestions.filter(
      q => !askedQuestionTitles.some(asked => 
        asked.includes(q.substring(0, 30).toLowerCase())
      )
    );
    
    if (availableGeneric.length > 0) {
      selectedQuestion = availableGeneric[Math.floor(Math.random() * availableGeneric.length)] ?? null;
    }
  }
  
  if (!selectedQuestion) {
    return null; // Laisser le fallback standard prendre le relais
  }
  
  // Personnaliser la question avec le prénom si le style est collaboratif
  let finalQuestion = selectedQuestion;
  if (coachingStyle === 'collaborative' && !selectedQuestion.includes(userName)) {
    // Récupérer les touches personnelles traduites
    let personalTouches: string[];
    try {
      personalTouches = getPersonalTouches();
      if (!Array.isArray(personalTouches) || personalTouches.length === 0) {
        throw new Error('empty');
      }
      // Remplacer {{userName}} par le vrai nom
      personalTouches = personalTouches.map(t => t.replace('{{userName}}', userName));
    } catch {
      personalTouches = [
        `${userName}, `,
        `${userName}, `
      ];
    }
    const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
    finalQuestion = touch + selectedQuestion.charAt(0).toLowerCase() + selectedQuestion.slice(1);
  }
  
  // Créer la question avec un ID unique
  const question: Question = {
    id: `smart_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: finalQuestion,
    description: undefined,
    type: QuestionType.PARAGRAPH,
    theme: getThemeName(selectedThemeKey),
    required: true
  };
  
  // Question générée avec succès
  return question;
}

/**
 * Génère une question d'ouverture personnalisée
 */
export function generateOpeningQuestion(userName: string, coachingStyle: CoachingStyle): Question {
  // Essayer de récupérer les questions d'ouverture traduites
  let questions: string[];
  try {
    questions = getOpeningQuestions(coachingStyle);
    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('empty');
    }
    // Remplacer {{userName}} par le vrai nom
    questions = questions.map(q => q.replace(/\{\{userName\}\}/g, userName));
  } catch {
    // Fallback hardcodé
    const lang = getCurrentLanguage();
    if (lang === 'tr') {
      questions = [
        `${userName}, sohbetimize başlamak için sizi biraz daha yakından tanımak istiyorum. Kariyer yolculuğunuzu ve bugün bu değerlendirmeyi yapmaya sizi neyin yönlendirdiğini anlatabilir misiniz?`,
        `${userName}, bu paylaşım alanına hoş geldiniz. Başlamak için bana kendinizden bahsedin: kariyeriniz, deneyimleriniz ve bu yetkinlik değerlendirmesini yapmaya sizi motive eden şey.`
      ];
    } else {
      questions = [
        `${userName}, pour commencer notre échange, j'aimerais vous connaître un peu mieux. Pouvez-vous me raconter votre parcours professionnel et ce qui vous amène à faire ce bilan aujourd'hui ?`,
        `${userName}, bienvenue dans cet espace d'échange. Pour démarrer, parlez-moi de vous : votre parcours, vos expériences, et ce qui vous motive à entreprendre ce bilan de compétences.`
      ];
    }
  }
  
  const selectedQuestion = questions[Math.floor(Math.random() * questions.length)] ?? questions[0] ?? '';
  
  return {
    id: `opening_${Date.now()}`,
    title: selectedQuestion,
    description: getFallbackText('openingDescription') || "Prenez le temps de vous présenter librement.",
    type: QuestionType.PARAGRAPH,
    theme: getFallbackText('openingTheme') || "Présentation",
    required: true
  };
}
