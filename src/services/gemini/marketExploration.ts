/**
 * Module d'exploration du marché de l'emploi
 * Conformité Qualiopi - Article R.6313-4 : Vérifier la pertinence du projet
 */

import { Answer } from '../../types';
import { geminiProxy } from '../geminiServiceProxy';
import { Type } from './schemas';
import { getCurrentLanguage, getLangInstruction } from './utils';

const ai = geminiProxy;

/**
 * Interface pour le résultat de l'exploration du marché
 */
export interface MarketExplorationResult {
  targetJob: {
    title: string;
    romeCode?: string;
    description: string;
    mainActivities: string[];
    requiredSkills: string[];
    softSkills: string[];
  };
  marketAnalysis: {
    demandLevel: 'très_forte' | 'forte' | 'moyenne' | 'faible';
    demandTrend: 'hausse' | 'stable' | 'baisse';
    salaryRange: string;
    geographicOpportunities: string[];
    sectors: string[];
    marketInsights: string;
  };
  feasibilityAnalysis: {
    overallScore: number;
    matchingSkills: string[];
    skillGaps: string[];
    strengthsForRole: string[];
    challenges: string[];
    feasibilityComment: string;
  };
  trainingRecommendations: Array<{
    title: string;
    type: string;
    duration: string;
    priority: 'essentielle' | 'recommandée' | 'optionnelle';
    description?: string;
  }>;
  alternativePaths: Array<{
    jobTitle: string;
    relevance: string;
    transitionEase: 'facile' | 'modérée' | 'difficile';
  }>;
}

/**
 * Interface pour le résultat de l'enquête métier simulée
 */
export interface JobInterviewResult {
  professionalPersona: {
    name: string;
    currentRole: string;
    yearsExperience: number;
    company: string;
    background: string;
  };
  dailyReality: {
    typicalDay: string;
    mainChallenges: string[];
    satisfactions: string[];
    frustrations: string[];
  };
  careerAdvice: {
    entryTips: string;
    mustHaveSkills: string[];
    commonMistakes: string[];
    successFactors: string[];
  };
  honestOpinion: {
    prosOfJob: string[];
    consOfJob: string[];
    whoShouldApply: string;
    whoShouldAvoid: string;
    futureOutlook: string;
  };
  interactiveQuestions: Array<{
    question: string;
    purpose: string;
  }>;
}

// Schéma pour l'exploration du marché
const marketExplorationSchema = {
  type: Type.OBJECT,
  properties: {
    targetJob: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        romeCode: { type: Type.STRING },
        description: { type: Type.STRING },
        mainActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
        requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        softSkills: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["title", "description", "mainActivities", "requiredSkills", "softSkills"]
    },
    marketAnalysis: {
      type: Type.OBJECT,
      properties: {
        demandLevel: { type: Type.STRING, enum: ["très_forte", "forte", "moyenne", "faible"] },
        demandTrend: { type: Type.STRING, enum: ["hausse", "stable", "baisse"] },
        salaryRange: { type: Type.STRING },
        geographicOpportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        sectors: { type: Type.ARRAY, items: { type: Type.STRING } },
        marketInsights: { type: Type.STRING }
      },
      required: ["demandLevel", "demandTrend", "salaryRange", "geographicOpportunities", "sectors", "marketInsights"]
    },
    feasibilityAnalysis: {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER },
        matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        skillGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        strengthsForRole: { type: Type.ARRAY, items: { type: Type.STRING } },
        challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
        feasibilityComment: { type: Type.STRING }
      },
      required: ["overallScore", "matchingSkills", "skillGaps", "strengthsForRole", "challenges", "feasibilityComment"]
    },
    trainingRecommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          type: { type: Type.STRING },
          duration: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["essentielle", "recommandée", "optionnelle"] },
          description: { type: Type.STRING }
        },
        required: ["title", "type", "duration", "priority"]
      }
    },
    alternativePaths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          relevance: { type: Type.STRING },
          transitionEase: { type: Type.STRING, enum: ["facile", "modérée", "difficile"] }
        },
        required: ["jobTitle", "relevance", "transitionEase"]
      }
    }
  },
  required: ["targetJob", "marketAnalysis", "feasibilityAnalysis", "trainingRecommendations", "alternativePaths"]
};

// Schéma pour l'enquête métier simulée
const jobInterviewSchema = {
  type: Type.OBJECT,
  properties: {
    professionalPersona: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        currentRole: { type: Type.STRING },
        yearsExperience: { type: Type.NUMBER },
        company: { type: Type.STRING },
        background: { type: Type.STRING }
      },
      required: ["name", "currentRole", "yearsExperience", "company", "background"]
    },
    dailyReality: {
      type: Type.OBJECT,
      properties: {
        typicalDay: { type: Type.STRING },
        mainChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
        satisfactions: { type: Type.ARRAY, items: { type: Type.STRING } },
        frustrations: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["typicalDay", "mainChallenges", "satisfactions", "frustrations"]
    },
    careerAdvice: {
      type: Type.OBJECT,
      properties: {
        entryTips: { type: Type.STRING },
        mustHaveSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        commonMistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
        successFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["entryTips", "mustHaveSkills", "commonMistakes", "successFactors"]
    },
    honestOpinion: {
      type: Type.OBJECT,
      properties: {
        prosOfJob: { type: Type.ARRAY, items: { type: Type.STRING } },
        consOfJob: { type: Type.ARRAY, items: { type: Type.STRING } },
        whoShouldApply: { type: Type.STRING },
        whoShouldAvoid: { type: Type.STRING },
        futureOutlook: { type: Type.STRING }
      },
      required: ["prosOfJob", "consOfJob", "whoShouldApply", "whoShouldAvoid", "futureOutlook"]
    },
    interactiveQuestions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          purpose: { type: Type.STRING }
        },
        required: ["question", "purpose"]
      }
    }
  },
  required: ["professionalPersona", "dailyReality", "careerAdvice", "honestOpinion", "interactiveQuestions"]
};

/**
 * Explore le marché de l'emploi pour un métier ciblé
 */
export const exploreJobMarket = async (
  answers: Answer[],
  targetJobTitle: string,
  userName: string
): Promise<MarketExplorationResult> => {
  console.log('[exploreJobMarket] Starting market exploration for:', targetJobTitle);
  const lang = getCurrentLanguage();
  
  const profileSummary = answers.slice(-20).map(a => 
    `Q: ${a.questionTitle}\nR: ${a.text}`
  ).join('\n\n');
  
  const prompt = lang === 'tr'
    ? `Sen bir kariyer danışmanlığı ve iş piyasası analizi uzmanısın.

YARARLANICI PROFİLİ (${userName}):
${profileSummary}

HEDEFLENMİŞ MESLEK: ${targetJobTitle}

GÖREV:
Bu meslek için iş piyasasının kapsamlı bir analizini yap, yararlanıcının profilini dikkate alarak.

TALİMATLAR:
1. **Meslek Kartı**: Mesleği faaliyetleri ve gerekli yetkinlikleriyle tanımla
2. **Piyasa Analizi**: Talebi, eğilimleri, maaşları ve coğrafi fırsatları değerlendir
3. **Fizibilite Analizi**: Yararlanıcının profilini mesleğin gereksinimleriyle karşılaştır
   - 1'den 10'a kadar puan (10 = mükemmel uyum)
   - Eşleşen yetkinlikleri VE kapatılması gereken açıkları belirle
4. **Önerilen Eğitimler**: Açıkları kapatmak için eğitimler öner
5. **Alternatifler**: Ana meslek zor görünüyorsa 2-3 alternatif meslek öner

ÖNEMLİ:
- Analizini güncel iş piyasası gerçeklerine dayandır
- Dürüst ve gerçekçi ol, aşırı iyimser olma
- Analizi yararlanıcının özel profiline göre kişiselleştir

${getLangInstruction()}`
    : `Tu es un expert en orientation professionnelle et en analyse du marché de l'emploi français.

PROFIL DU BÉNÉFICIAIRE (${userName}):
${profileSummary}

MÉTIER CIBLÉ: ${targetJobTitle}

TÂCHE:
Réalise une analyse complète du marché de l'emploi pour ce métier en France, en tenant compte du profil du bénéficiaire.

INSTRUCTIONS:
1. **Fiche métier** : Décris le métier avec ses activités et compétences requises
2. **Analyse du marché** : Évalue la demande, les tendances, les salaires et les opportunités géographiques
3. **Analyse de faisabilité** : Compare le profil du bénéficiaire avec les exigences du métier
   - Score de 1 à 10 (10 = parfaitement adapté)
   - Identifie les compétences qui correspondent ET les écarts à combler
4. **Formations recommandées** : Propose des formations pour combler les écarts
5. **Alternatives** : Suggère 2-3 métiers alternatifs si le métier principal semble difficile d'accès

IMPORTANT:
- Base ton analyse sur les réalités du marché français actuel (2024-2025)
- Sois honnête et réaliste, pas excessivement optimiste
- Personnalise l'analyse en fonction du profil spécifique du bénéficiaire
- Les formations doivent être concrètes et accessibles en France

${getLangInstruction()}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: marketExplorationSchema
      }
    });
    
    const result = JSON.parse(response.text ?? '{}') as MarketExplorationResult;
    console.log('[exploreJobMarket] Market exploration completed, feasibility score:', result.feasibilityAnalysis?.overallScore);
    return result;
  } catch (error) {
    console.error('[exploreJobMarket] Error:', error);
    throw error;
  }
};

/**
 * Simule une enquête métier avec un professionnel virtuel
 */
export const simulateJobInterview = async (
  answers: Answer[],
  targetJobTitle: string,
  userName: string
): Promise<JobInterviewResult> => {
  console.log('[simulateJobInterview] Starting simulated interview for:', targetJobTitle);
  const lang = getCurrentLanguage();
  
  const profileSummary = answers.slice(-15).map(a => 
    `Q: ${a.questionTitle}\nR: ${a.text}`
  ).join('\n\n');
  
  const prompt = lang === 'tr'
    ? `Sen bir kariyer danışmanlığı uzmanısın. Hedeflenen meslekte deneyimli bir profesyonelle simüle edilmiş bir görüşme oluşturacaksın.

YARARLANICI PROFİLİ (${userName}):
${profileSummary}

HEDEFLENMİŞ MESLEK: ${targetJobTitle}

GÖREV:
Bu mesleği yıllardır yapan gerçekçi ama kurgusal bir profesyonel oluştur ve dürüst deneyimini paylaştır.

TALİMATLAR:
1. **Persona**: Gerçekçi bir geçmişe sahip inandırıcı bir profesyonel oluştur
2. **Günlük Gerçeklik**: İyi ve kötü yanlarıyla tipik bir günü anlat
3. **Kariyer Tavsiyeleri**: Mesleğe girmek için pratik tavsiyeler paylaş
4. **Dürüst Görüş**: Mesleğin gerçek avantajlarını VE dezavantajlarını ver
5. **İnteraktif Sorular**: Yararlanıcının düşünmesine yardımcı olacak sorular sor

ÖNEMLİ:
- Profesyonel otantik ve dengeli olmalı (ne çok pozitif ne çok negatif)
- İş ilanlarının bahsetmediği yönleri de dahil et
- Sorular yararlanıcının bu mesleğin kendisine uygun olup olmadığını doğrulamasına yardımcı olmalı

${getLangInstruction()}`
    : `Tu es un expert en orientation professionnelle. Tu vas créer une simulation d'entretien avec un professionnel expérimenté du métier ciblé.

PROFIL DU BÉNÉFICIAIRE (${userName}):
${profileSummary}

MÉTIER CIBLÉ: ${targetJobTitle}

TÂCHE:
Crée un professionnel fictif mais réaliste qui exerce ce métier depuis plusieurs années, et fais-le partager son expérience honnête du métier.

INSTRUCTIONS:
1. **Persona** : Crée un professionnel crédible avec un parcours réaliste
2. **Réalité quotidienne** : Décris une journée type avec ses hauts et ses bas
3. **Conseils de carrière** : Partage des conseils pratiques pour entrer dans le métier
4. **Opinion honnête** : Donne les vrais avantages ET inconvénients du métier
5. **Questions interactives** : Pose des questions au bénéficiaire pour l'aider à réfléchir

IMPORTANT:
- Le professionnel doit être authentique et nuancé (pas trop positif ni négatif)
- Inclure des aspects que les descriptions de poste ne mentionnent pas
- Les questions doivent aider le bénéficiaire à vérifier si ce métier lui correspond vraiment

${getLangInstruction()}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: jobInterviewSchema
      }
    });
    
    const result = JSON.parse(response.text ?? '{}') as JobInterviewResult;
    console.log('[simulateJobInterview] Interview simulation completed with:', result.professionalPersona?.name);
    return result;
  } catch (error) {
    console.error('[simulateJobInterview] Error:', error);
    throw error;
  }
};

/**
 * Génère une question de suivi basée sur la réponse du bénéficiaire
 */
export const generateInterviewFollowUp = async (
  professionalName: string,
  jobTitle: string,
  previousQuestion: string,
  beneficiaryAnswer: string,
  context: string
): Promise<string> => {
  const lang = getCurrentLanguage();
  
  const prompt = lang === 'tr'
    ? `Sen ${professionalName}, ${jobTitle} olarak deneyimli bir profesyonelsin.

Yararlanıcı sorunuza yanıt verdi:
Soru: "${previousQuestion}"
Yanıt: "${beneficiaryAnswer}"

Görüşme bağlamı: ${context}

GÖREV:
${professionalName} olarak, bu yanıta tepki ver ve şunlar için uygun bir takip sorusu sor:
- Yararlanıcının düşüncesini derinleştirmek
- Mesleğe somut olarak kendini yansıtmasına yardımcı olmak
- Beklentilerinin gerçeklikle uyuşup uyuşmadığını doğrulamak

Doğal ve destekleyici bir şekilde yanıt ver, gerçek bir sohbet gibi.
${getLangInstruction()}`
    : `Tu es ${professionalName}, un(e) professionnel(le) expérimenté(e) en tant que ${jobTitle}.

Le bénéficiaire vient de répondre à ta question :
Question : "${previousQuestion}"
Réponse : "${beneficiaryAnswer}"

Contexte de l'échange : ${context}

TÂCHE:
En tant que ${professionalName}, réagis à cette réponse et pose une question de suivi pertinente pour :
- Approfondir la réflexion du bénéficiaire
- L'aider à se projeter concrètement dans le métier
- Vérifier si ses attentes correspondent à la réalité

Réponds de manière naturelle et bienveillante, comme dans une vraie conversation.
${getLangInstruction()}`;

  const fallbackMsg = lang === 'tr'
    ? "Bu meslekte sizi en çok ne çekiyor?"
    : "Qu'est-ce qui vous attire le plus dans ce métier ?";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() ?? fallbackMsg;
  } catch (error) {
    console.error('[generateInterviewFollowUp] Error:', error);
    return fallbackMsg;
  }
};

/**
 * Génère un rapport de faisabilité complet
 */
export const generateFeasibilityReport = async (
  marketResult: MarketExplorationResult,
  interviewResult: JobInterviewResult,
  userName: string
): Promise<string> => {
  const lang = getCurrentLanguage();
  
  const prompt = lang === 'tr'
    ? `Sen bir kariyer danışmanlığı uzmanısın. Kısa ve eyleme dönüştürülebilir bir fizibilite raporu oluştur.

ANALİZ VERİLERİ:
Hedeflenen meslek: ${marketResult.targetJob.title}
Fizibilite puanı: ${marketResult.feasibilityAnalysis.overallScore}/10
Eşleşen yetkinlikler: ${marketResult.feasibilityAnalysis.matchingSkills.join(', ')}
Kapatılması gereken açıklar: ${marketResult.feasibilityAnalysis.skillGaps.join(', ')}
Talep düzeyi: ${marketResult.marketAnalysis.demandLevel}
Eğilim: ${marketResult.marketAnalysis.demandTrend}

PROFESYONELİN GERİ BİLDİRİMİ (${interviewResult.professionalPersona.name}):
Olumlu noktalar: ${interviewResult.honestOpinion.prosOfJob.join(', ')}
Olumsuz noktalar: ${interviewResult.honestOpinion.consOfJob.join(', ')}
Ana tavsiye: ${interviewResult.careerAdvice.entryTips}

GÖREV:
${userName} için 300-400 kelimelik bir fizibilite raporu oluştur:
1. Bu meslekteki başarı şansını özetle
2. Yapılması gereken 3 öncelikli eylemi belirle
3. Gerçekçi bir geçiş takvimi öner
4. Proje çok zor görünüyorsa alternatifleri belirt

Ton cesaretlendirici ama gerçekçi olmalı.
${getLangInstruction()}`
    : `Tu es un expert en orientation professionnelle. Génère un rapport de faisabilité synthétique et actionnable.

DONNÉES D'ANALYSE:
Métier ciblé: ${marketResult.targetJob.title}
Score de faisabilité: ${marketResult.feasibilityAnalysis.overallScore}/10
Compétences correspondantes: ${marketResult.feasibilityAnalysis.matchingSkills.join(', ')}
Écarts à combler: ${marketResult.feasibilityAnalysis.skillGaps.join(', ')}
Niveau de demande: ${marketResult.marketAnalysis.demandLevel}
Tendance: ${marketResult.marketAnalysis.demandTrend}

RETOUR DU PROFESSIONNEL (${interviewResult.professionalPersona.name}):
Points positifs: ${interviewResult.honestOpinion.prosOfJob.join(', ')}
Points négatifs: ${interviewResult.honestOpinion.consOfJob.join(', ')}
Conseil principal: ${interviewResult.careerAdvice.entryTips}

TÂCHE:
Génère un rapport de faisabilité de 300-400 mots pour ${userName} qui :
1. Synthétise les chances de réussite dans ce métier
2. Identifie les 3 actions prioritaires à entreprendre
3. Propose un calendrier réaliste de transition
4. Mentionne les alternatives si le projet s'avère trop difficile

Le ton doit être encourageant mais réaliste.
${getLangInstruction()}`;

  const fallbackMsg = lang === 'tr'
    ? "Fizibilite raporu oluşturulamadı."
    : "Rapport de faisabilité non disponible.";
  const errorMsg = lang === 'tr'
    ? "Fizibilite raporu oluşturulurken hata oluştu."
    : "Erreur lors de la génération du rapport de faisabilité.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() ?? fallbackMsg;
  } catch (error) {
    console.error('[generateFeasibilityReport] Error:', error);
    return errorMsg;
  }
};
