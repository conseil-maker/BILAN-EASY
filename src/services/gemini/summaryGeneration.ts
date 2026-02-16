/**
 * Module de génération de synthèse
 * Génère les synthèses et rapports du bilan de compétences
 */

import { Answer, Summary, UserProfile, DashboardData, Package } from '../../types';
import { geminiProxy } from '../geminiServiceProxy';
import { parseJsonResponse, getCoachingStyleInstruction, getCurrentLanguage, getLangInstruction, getDocLangInstruction } from './utils';
import { summarySchema, dashboardDataSchema, userProfileSchema, Type } from './schemas';

const ai = geminiProxy;

/**
 * Analyse le profil utilisateur à partir d'un CV
 */
export const analyzeUserProfile = async (cvText: string): Promise<UserProfile> => {
  const prompt = `Analyze the following professional profile text (likely from a CV) and extract key information. The response MUST be a valid JSON object conforming to the specified schema. Text to analyze: --- ${cvText} ---`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: userProfileSchema },
  });
  
  return parseJsonResponse<UserProfile>(response.text ?? '', 'analyzeUserProfile');
};

/**
 * Analyse les thèmes et compétences à partir des réponses
 */
export const analyzeThemesAndSkills = async (answers: Answer[]): Promise<DashboardData> => {
  const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
  
  const prompt = `Analyze the following answers from a skills assessment. Identify the main themes and assess 5 core skills. The response MUST be a valid JSON object conforming to the schema, including all 5 specified skills. Answers: --- ${history} ---`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: prompt,
    config: { responseMimeType: "application/json", responseSchema: dashboardDataSchema },
  });
  
  return parseJsonResponse<DashboardData>(response.text ?? '', 'analyzeThemesAndSkills');
};

/**
 * Génère une synthèse complète du bilan de compétences
 */
export const generateSummary = async (
  answers: Answer[], 
  pkg: Package, 
  userName: string
): Promise<Summary> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();

  const systemInstruction = lang === 'tr'
    ? `Sen Qualiopi sertifikalı bir yetkinlik değerlendirme uzmanısın.
Profesyonel, yapılandırılmış ve kişiselleştirilmiş sentezler yazıyorsun.
Her nokta, yararlanıcının yanıtlarından somut unsurlarla desteklenmelidir.`
    : `Tu es un expert en bilan de compétences certifié Qualiopi. 
Tu rédiges des synthèses professionnelles, structurées et personnalisées.
Chaque point doit être étayé par des éléments concrets issus des réponses du bénéficiaire.`;

  // Construire la transcription complète
  const fullTranscript = answers.map((a, i) => 
    `[Q${i + 1}] ${a.questionTitle || a.questionId}\n[R${i + 1}] ${a.value}`
  ).join('\n\n---\n\n');

  const prompt = lang === 'tr'
    ? `Sen bir yetkinlik değerlendirme uzmanısın. Kapsamlı ve profesyonel bir sentez oluştur.

Bağlam:
- Yararlanıcı: ${userName}
- Paket: ${pkg.name}
- Yanıt sayısı: ${answers.length}

Değerlendirmenin tam transkripsiyonu:
${fullTranscript}

MİSYON: Qualiopi gereksinimlerine uygun kapsamlı ve profesyonel bir sentez oluştur.

DURUŞ KURALLARI:
- Profesyonel ve ölçülü bir ton kullan, abartılı övgülerden kaçın
- Her iddia yanıtlardan somut unsurlarla desteklenmeli
- Güçlü yönleri VE sınırları dengeli bir şekilde sun

ÖNEMLİ TALİMATLAR:
1. 'keyStrengths' ve 'areasForDevelopment': Her nokta, yararlanıcının yanıtlarından 1-3 doğrudan alıntı içeren bir 'sources' dizisi İÇERMELİDİR.

2. 'strengths' ve 'skills': Basit metin dizisi (her biri 3-5 öğe) - bunlar belirlenen MESLEKİ yetkinliklerdir.

3. 'motivations' ve 'values': İçsel motivasyonları ve mesleki değerleri belirle (her biri 3-5 öğe).

4. 'areasToImprove': Gelişim eksenleri listesi (2-4 öğe).

5. 'projectProfessionnel': 
   - Belirlenen mesleki projeyi tanımlayan 3-5 cümlelik bir paragraf yaz
   - ZORUNLU: Tek bir yön değil, 2-4 ALTERNATİF MESLEKİ YOL sun
   - Her yol için: hedef pozisyon, aktarılabilir yetkinlikler, geliştirilecek yetkinlikler
   - Her yol için piyasa gerçeklerini belirt (büyüyen sektörler, tahmini maaş seviyeleri, beklentiler)

6. 'actionPlan': SOMUT ve GERÇEKÇİ bir eylem planı oluştur:
   - shortTerm (1-3 ay): 2-3 acil ve spesifik eylem
   - mediumTerm (3-6 ay): 2-3 gelişim eylemi
   - longTerm (6+ ay): 1-2 uzun vadeli hedef (isteğe bağlı)

7. 'recommendations': 3-4 kişiselleştirilmiş ve eyleme dönüştürülebilir öneri.

Yanıt, sağlanan şemaya uygun geçerli bir JSON nesnesi OLMALIDIR.
${langInstruction}`
    : `Tu es un expert en bilan de compétences. Génère une synthèse complète et professionnelle.

Contexte:
- Bénéficiaire: ${userName}
- Parcours: ${pkg.name}
- Nombre de réponses: ${answers.length}

Transcription complète du bilan:
${fullTranscript}

MISSION: Génère une synthèse complète et professionnelle conforme aux exigences Qualiopi.

RÈGLES DE POSTURE :
- Adopte un ton professionnel et mesuré, sans superlatifs flatteurs
- Chaque affirmation doit être étayée par des éléments concrets des réponses
- Présente les forces ET les limites de manière équilibrée

INSTRUCTIONS IMPORTANTES:
1. Pour 'keyStrengths' et 'areasForDevelopment': Chaque point DOIT inclure un tableau 'sources' avec 1-3 citations directes des réponses du bénéficiaire.

2. Pour 'strengths' et 'skills': Liste simple de chaînes de caractères (3-5 éléments chacun) - ce sont les compétences PROFESSIONNELLES identifiées.

3. Pour 'motivations' et 'values': Identifie les motivations intrinsèques et les valeurs professionnelles (3-5 éléments chacun).

4. Pour 'areasToImprove': Liste simple des axes de développement (2-4 éléments).

5. Pour 'projectProfessionnel': 
   - Rédige un paragraphe de 3-5 phrases décrivant le projet professionnel identifié
   - OBLIGATOIRE : Présente 2 à 4 PISTES PROFESSIONNELLES alternatives, pas une seule direction
   - Pour chaque piste, indique : le poste cible, les compétences transférables, les compétences à développer
   - Mentionne les réalités du marché pour chaque piste (secteurs porteurs, niveaux de rémunération indicatifs, perspectives)
   - Précise que ces informations marché sont des estimations que le bénéficiaire doit valider par ses propres recherches

6. Pour 'actionPlan': Crée un plan d'action CONCRET et RÉALISTE:
   - shortTerm (1-3 mois): 2-3 actions immédiates et spécifiques
   - mediumTerm (3-6 mois): 2-3 actions de développement
   - longTerm (6+ mois): 1-2 objectifs à long terme (optionnel)
   - Chaque action doit être concrète, mesurable et réaliste

7. Pour 'recommendations': 3-4 recommandations personnalisées et actionables.
   - Inclure au moins une recommandation de validation marché (enquête métier, réseau professionnel, sites d'emploi)
   - Inclure au moins une recommandation qui adresse un risque ou une limite identifiée

La réponse DOIT être un objet JSON valide en français, conforme au schéma fourni.
${langInstruction}`;

  const response = await ai.models.generateContent({ 
    model: 'gemini-2.5-pro', 
    contents: prompt, 
    config: { 
      systemInstruction, 
      responseMimeType: "application/json", 
      responseSchema: summarySchema 
    } 
  });
  
  return parseJsonResponse<Summary>(response.text ?? '', 'generateSummary');
};

/**
 * Trouve des ressources et pistes pour un point de développement
 */
export const findResourceLeads = async (
  developmentPoint: string
): Promise<{ resources: string[]; actions: string[] }> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();

  const prompt = lang === 'tr'
    ? `Şu gelişim noktası için: "${developmentPoint}"
    
Öner:
1. 3-5 somut kaynak (eğitimler, kitaplar, online kurslar, sertifikalar)
2. 3-5 uygulanabilir pratik eylem

"resources" (metin dizisi) ve "actions" (metin dizisi) alanlarıyla JSON olarak yanıtla.
${langInstruction}`
    : `Pour le point de développement suivant: "${developmentPoint}"
    
Suggère:
1. 3-5 ressources concrètes (formations, livres, MOOCs, certifications)
2. 3-5 actions pratiques à mettre en place

Réponds en JSON avec les champs "resources" (array de strings) et "actions" (array de strings).
${langInstruction}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      resources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste de ressources recommandées" },
      actions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste d'actions pratiques" }
    },
    required: ["resources", "actions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    return parseJsonResponse<{ resources: string[]; actions: string[] }>(response.text ?? '', 'findResourceLeads');
  } catch (error) {
    console.error('[findResourceLeads] Error:', error);
    const fallback = lang === 'tr'
      ? { resources: ["Önerilen online eğitim", "Konuyla ilgili referans kitap"], actions: ["Bir mentor bul", "Düzenli olarak pratik yap"] }
      : { resources: ["Formation en ligne recommandée", "Livre de référence sur le sujet"], actions: ["Identifier un mentor", "Pratiquer régulièrement"] };
    return fallback;
  }
};

/**
 * Génère un résumé intermédiaire pour le dashboard
 */
export const generateIntermediateSummary = async (
  answers: Answer[],
  userName: string
): Promise<{ themes: string[]; insights: string[]; progress: number }> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();
  const history = answers.map(a => `Q: ${a.questionTitle}\nR: ${a.value}`).join('\n\n');
  
  const prompt = lang === 'tr'
    ? `${userName} için devam eden yetkinlik değerlendirmesinin aşağıdaki yanıtlarını analiz et.

${history}

Oluştur:
1. themes: Ortaya çıkan 3-5 ana tema
2. insights: Profil hakkında 2-3 temel gözlem
3. progress: Değerlendirmenin tamamlanma yüzdesi tahmini (0-100)

JSON olarak yanıtla.
${langInstruction}`
    : `Analyse les réponses suivantes d'un bilan de compétences en cours pour ${userName}.

${history}

Génère:
1. themes: 3-5 thèmes principaux qui émergent
2. insights: 2-3 observations clés sur le profil
3. progress: estimation du pourcentage de complétion du bilan (0-100)

Réponds en JSON.
${langInstruction}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      themes: { type: Type.ARRAY, items: { type: Type.STRING } },
      insights: { type: Type.ARRAY, items: { type: Type.STRING } },
      progress: { type: Type.NUMBER }
    },
    required: ["themes", "insights", "progress"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    return parseJsonResponse(response.text ?? '', 'generateIntermediateSummary');
  } catch (error) {
    console.error('[generateIntermediateSummary] Error:', error);
    const fallback = lang === 'tr'
      ? { themes: ["Mesleki geçmiş", "Yetkinlikler", "Hedefler"], insights: ["Analiz devam ediyor..."], progress: Math.min(90, Math.round((answers.length / 30) * 100)) }
      : { themes: ["Parcours professionnel", "Compétences", "Aspirations"], insights: ["Analyse en cours..."], progress: Math.min(90, Math.round((answers.length / 30) * 100)) };
    return fallback;
  }
};

/**
 * Génère des recommandations personnalisées
 */
export const generatePersonalizedRecommendations = async (
  summary: Summary,
  userName: string
): Promise<string[]> => {
  const lang = getCurrentLanguage();
  const langInstruction = getLangInstruction();

  const prompt = lang === 'tr'
    ? `${userName} için bu yetkinlik değerlendirmesi sentezine dayanarak:

Güçlü yönler: ${summary.strengths?.join(', ')}
Yetkinlikler: ${summary.skills?.join(', ')}
Gelişim eksenleri: ${summary.areasToImprove?.join(', ')}
Mesleki proje: ${summary.projectProfessionnel}

${userName}'ın hedeflerine ulaşmasına yardımcı olacak 5 kişiselleştirilmiş ve somut öneri oluştur.
Her öneri eyleme dönüştürülebilir ve spesifik olmalı.

"recommendations" metin dizisi içeren JSON olarak yanıtla.
${langInstruction}`
    : `Basé sur cette synthèse de bilan de compétences pour ${userName}:

Points forts: ${summary.strengths?.join(', ')}
Compétences: ${summary.skills?.join(', ')}
Axes d'amélioration: ${summary.areasToImprove?.join(', ')}
Projet professionnel: ${summary.projectProfessionnel}

Génère 5 recommandations personnalisées et concrètes pour aider ${userName} à atteindre ses objectifs.
Chaque recommandation doit être actionnable et spécifique.

Réponds en JSON avec un tableau "recommendations" de strings.
${langInstruction}`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["recommendations"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json", responseSchema: schema },
    });
    const result = parseJsonResponse<{ recommendations: string[] }>(response.text ?? '', 'generatePersonalizedRecommendations');
    return result.recommendations;
  } catch (error) {
    console.error('[generatePersonalizedRecommendations] Error:', error);
    return summary.recommendations || [];
  }
};
