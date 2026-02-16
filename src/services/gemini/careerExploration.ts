/**
 * Module d'exploration de carrière
 * Gère la détection des besoins d'exploration et la génération de pistes métiers
 */

import { Answer } from '../../types';
import { geminiProxy } from '../geminiServiceProxy';
import { parseJsonResponse, getCurrentLanguage, getLangInstruction } from './utils';
import { Type } from './schemas';

const ai = geminiProxy;

/**
 * Interface pour une piste métier proposée
 */
export interface CareerPath {
  title: string;
  description: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  requiredSkills: string[];
  skillsToAcquire: string[];
  marketTrend: 'en_croissance' | 'stable' | 'en_declin';
  salaryRange: string;
  trainingPath: string[];
  nextSteps: string[];
}

/**
 * Interface pour le résultat de détection du besoin d'exploration
 */
export interface ExplorationNeedResult {
  needsExploration: boolean;
  confidence: number; // 0-100
  reason: string;
  suggestedApproach: 'full_exploration' | 'validation' | 'refinement' | 'none';
}

/**
 * Interface pour le résultat de l'exploration de métiers
 */
export interface CareerExplorationResult {
  careerPaths: CareerPath[];
  profileSummary: string;
  keyStrengths: string[];
  explorationQuestions: string[];
}

// Schéma pour la détection du besoin d'exploration
const explorationNeedSchema = {
  type: Type.OBJECT,
  properties: {
    needsExploration: { 
      type: Type.BOOLEAN, 
      description: "True si le bénéficiaire a besoin d'explorer des pistes métiers (projet flou, hésitations, reconversion)" 
    },
    confidence: { 
      type: Type.NUMBER, 
      description: "Niveau de confiance de 0 à 100" 
    },
    reason: { 
      type: Type.STRING, 
      description: "Explication de pourquoi l'exploration est ou n'est pas nécessaire" 
    },
    suggestedApproach: { 
      type: Type.STRING, 
      enum: ["full_exploration", "validation", "refinement", "none"],
      description: "Type d'exploration suggéré"
    }
  },
  required: ["needsExploration", "confidence", "reason", "suggestedApproach"]
};

// Schéma pour une piste métier
const careerPathSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Intitulé du métier" },
    description: { type: Type.STRING, description: "Description courte du métier (2-3 phrases)" },
    matchScore: { type: Type.NUMBER, description: "Score de correspondance avec le profil (0-100)" },
    matchReasons: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 raisons pour lesquelles ce métier correspond au profil" },
    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Compétences clés requises" },
    skillsToAcquire: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Compétences à développer pour ce métier" },
    marketTrend: { type: Type.STRING, enum: ["en_croissance", "stable", "en_declin"], description: "Tendance du marché pour ce métier" },
    salaryRange: { type: Type.STRING, description: "Fourchette salariale indicative (ex: '35 000 - 50 000 €')" },
    trainingPath: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Formations ou certifications recommandées" },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 actions concrètes pour explorer cette piste" }
  },
  required: ["title", "description", "matchScore", "matchReasons", "requiredSkills", "skillsToAcquire", "marketTrend", "salaryRange", "trainingPath", "nextSteps"]
};

// Schéma pour le résultat complet de l'exploration
const careerExplorationSchema = {
  type: Type.OBJECT,
  properties: {
    careerPaths: { 
      type: Type.ARRAY, 
      items: careerPathSchema, 
      description: "3-5 pistes métiers personnalisées, classées par pertinence" 
    },
    profileSummary: { 
      type: Type.STRING, 
      description: "Résumé du profil professionnel en 2-3 phrases" 
    },
    keyStrengths: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "3-5 points forts identifiés" 
    },
    explorationQuestions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING }, 
      description: "2-3 questions pour approfondir la réflexion du bénéficiaire" 
    }
  },
  required: ["careerPaths", "profileSummary", "keyStrengths", "explorationQuestions"]
};

/**
 * Détecte si le bénéficiaire a besoin d'explorer des pistes métiers
 */
export const detectCareerExplorationNeed = async (answers: Answer[]): Promise<ExplorationNeedResult> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();
  const history = answers.map(a => `Q: ${a.questionTitle || a.questionId}\nR: ${a.value}`).join('\n\n');
  
  const prompt = lang === 'tr'
    ? `Sen bir mesleki yönlendirme uzmanısın. Yetkinlik değerlendirmesindeki bir yararlanıcının aşağıdaki yanıtlarını analiz et.

YARARLANICININ YANITLARI:
${history}

GÖREV:
Bu yararlanıcının mesleki yol keşfine ihtiyacı olup olmadığını belirle:
1. Net ve tanımlanmış bir mesleki projesi var mı?
2. Geleceği hakkında tereddüt veya belirsizlik ifade ediyor mu?
3. Nereye gideceğini bilmeden yön değiştirmek istediğinden bahsediyor mu?
4. Yeni olasılıklar keşfetmeye ihtiyacı var gibi görünüyor mu?

YAKLAŞIM TÜRLERİ:
- "full_exploration": Net bir fikir yok, yollar keşfetmesi gerekiyor
- "validation": Bir fikri var ama doğrulamak/onaylamak istiyor
- "refinement": Birkaç seçenek arasında kararsız, netleştirmesi gerekiyor
- "none": Net ve tanımlanmış proje, keşfe gerek yok

JSON olarak yanıtla.
${langInstruction}`
    : `Tu es un expert en orientation professionnelle. Analyse les réponses suivantes d'un bénéficiaire en bilan de compétences.

RÉPONSES DU BÉNÉFICIAIRE:
${history}

TÂCHE:
Détermine si ce bénéficiaire a besoin d'une exploration de pistes métiers basée sur:
1. A-t-il un projet professionnel clair et défini ?
2. Exprime-t-il des hésitations ou incertitudes sur son avenir ?
3. Mentionne-t-il vouloir changer de voie sans savoir vers quoi ?
4. Semble-t-il avoir besoin de découvrir de nouvelles possibilités ?

TYPES D'APPROCHE:
- "full_exploration": Aucune idée claire, besoin de découvrir des pistes
- "validation": A une idée mais veut la confirmer/valider
- "refinement": Hésite entre plusieurs options, besoin d'affiner
- "none": Projet clair et défini, pas besoin d'exploration

Réponds en JSON.
${langInstruction}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: explorationNeedSchema },
    });
    return parseJsonResponse<ExplorationNeedResult>(response.text ?? '', 'detectCareerExplorationNeed');
  } catch (error) {
    console.error('[detectCareerExplorationNeed] Error:', error);
    return {
      needsExploration: false,
      confidence: 0,
      reason: lang === 'tr' ? "Analiz sırasında hata oluştu" : "Erreur lors de l'analyse",
      suggestedApproach: 'none'
    };
  }
};

/**
 * Explore et propose des pistes métiers personnalisées
 */
export const exploreCareerPaths = async (
  answers: Answer[], 
  userName: string,
  additionalContext?: string
): Promise<CareerExplorationResult> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();
  const history = answers.map(a => `Q: ${a.questionTitle || a.questionId}\nR: ${a.value}`).join('\n\n');
  
  const prompt = lang === 'tr'
    ? `Sen mesleki yönlendirme ve Fransız iş piyasası uzmanısın.

YARARLANICININ PROFİLİ (${userName}):
${history}

${additionalContext ? `EK BAĞLAM:\n${additionalContext}\n` : ''}

GÖREV:
Bu yararlanıcı için 3 ila 5 kişiselleştirilmiş ve gerçekçi mesleki yol öner.

ÖNEMLİ KRİTERLER:
1. Meslekler ifade edilen yetkinliklere ve isteklere uygun olmalı
2. Hızlı erişilebilir meslekler ve eğitim gerektiren mesleklerin bir karışımını dahil et
3. Fransa'daki mevcut iş piyasası eğilimlerini dikkate al (2024-2025)
4. Maaşlar ve perspektifler konusunda gerçekçi ol
5. Profille tutarlı ancak çeşitli meslekler öner

HER MESLEK İÇİN:
- Profile neden uygun olduğunu açıkça açıkla
- Geliştirilecek yetkinlikleri belirle
- Piyasa hakkında somut bilgiler ver
- Bu yolu keşfetmek için somut eylemler öner

JSON olarak yanıtla.
${langInstruction}`
    : `Tu es un expert en orientation professionnelle et en marché du travail français.

PROFIL DU BÉNÉFICIAIRE (${userName}):
${history}

${additionalContext ? `CONTEXTE ADDITIONNEL:\n${additionalContext}\n` : ''}

TÂCHE:
Propose 3 à 5 pistes métiers personnalisées et réalistes pour ce bénéficiaire.

CRITÈRES IMPORTANTS:
1. Les métiers doivent correspondre aux compétences et aspirations exprimées
2. Inclure un mix de métiers accessibles rapidement et de métiers nécessitant une formation
3. Tenir compte des tendances actuelles du marché du travail en France (2024-2025)
4. Être réaliste sur les salaires et les perspectives
5. Proposer des métiers variés mais cohérents avec le profil

POUR CHAQUE MÉTIER:
- Explique clairement pourquoi il correspond au profil
- Identifie les compétences à développer
- Donne des informations concrètes sur le marché
- Propose des actions concrètes pour explorer cette piste

Réponds en JSON.
${langInstruction}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: careerExplorationSchema },
    });
    return parseJsonResponse<CareerExplorationResult>(response.text ?? '', 'exploreCareerPaths');
  } catch (error) {
    console.error('[exploreCareerPaths] Error:', error);
    return {
      careerPaths: [],
      profileSummary: lang === 'tr' ? "Profil analizi sırasında hata oluştu" : "Erreur lors de l'analyse du profil",
      keyStrengths: [],
      explorationQuestions: []
    };
  }
};

/**
 * Génère une question de suivi pour approfondir une piste métier
 */
export const generateCareerFollowUpQuestion = async (
  careerPath: CareerPath,
  userReaction: 'interested' | 'not_interested' | 'need_more_info',
  previousAnswers: Answer[]
): Promise<string> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();
  
  const reactionContext: Record<string, Record<string, string>> = {
    'interested': {
      fr: "Le bénéficiaire est intéressé par cette piste",
      tr: "Yararlanıcı bu yolla ilgileniyor"
    },
    'not_interested': {
      fr: "Le bénéficiaire n'est pas intéressé par cette piste",
      tr: "Yararlanıcı bu yolla ilgilenmiyor"
    },
    'need_more_info': {
      fr: "Le bénéficiaire souhaite plus d'informations",
      tr: "Yararlanıcı daha fazla bilgi istiyor"
    }
  };

  const prompt = lang === 'tr'
    ? `Sen bir mesleki yönlendirme danışmanısın.

SUNULAN MESLEKİ YOL:
- Başlık: ${careerPath.title}
- Açıklama: ${careerPath.description}
- Uyum puanı: ${careerPath.matchScore}%

YARARLANICININ TEPKİSİ: ${reactionContext[userReaction]?.tr}

GÖREV:
Şunlar için uygun ve yardımsever BİR takip sorusu oluştur:
${userReaction === 'interested' ? '- İlgisini derinleştir ve somut sonraki adımları belirle' : ''}
${userReaction === 'not_interested' ? '- Neyin uygun olmadığını anla ve önerileri iyileştir' : ''}
${userReaction === 'need_more_info' ? '- Hangi ek bilgilerin faydalı olacağını belirle' : ''}

Soru açık uçlu ve cesaretlendirici olmalı.
Sadece soruyla yanıtla, JSON formatı olmadan.
${langInstruction}`
    : `Tu es un conseiller en orientation professionnelle.

PISTE MÉTIER PRÉSENTÉE:
- Titre: ${careerPath.title}
- Description: ${careerPath.description}
- Score de correspondance: ${careerPath.matchScore}%

RÉACTION DU BÉNÉFICIAIRE: ${reactionContext[userReaction]?.fr}

TÂCHE:
Génère UNE question de suivi pertinente et bienveillante pour:
${userReaction === 'interested' ? '- Approfondir son intérêt et identifier les prochaines étapes concrètes' : ''}
${userReaction === 'not_interested' ? '- Comprendre ce qui ne lui convient pas pour affiner les suggestions' : ''}
${userReaction === 'need_more_info' ? '- Identifier quelles informations supplémentaires seraient utiles' : ''}

La question doit être ouverte et encourageante.
Réponds uniquement avec la question, sans formatage JSON.
${langInstruction}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() ?? (lang === 'tr' 
      ? "Bu yolda sizi çeken veya durduran ne?"
      : "Qu'est-ce qui vous attire ou vous freine dans cette piste ?");
  } catch (error) {
    console.error('[generateCareerFollowUpQuestion] Error:', error);
    return lang === 'tr'
      ? "Bu yolda sizi çeken veya durduran ne?"
      : "Qu'est-ce qui vous attire ou vous freine dans cette piste ?";
  }
};
