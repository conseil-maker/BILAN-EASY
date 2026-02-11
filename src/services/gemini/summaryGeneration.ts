/**
 * Module de génération de synthèse
 * Génère les synthèses et rapports du bilan de compétences
 */

import { Answer, Summary, UserProfile, DashboardData, Package } from '../../types';
import { geminiProxy } from '../geminiServiceProxy';
import { parseJsonResponse, getCoachingStyleInstruction } from './utils';
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
  const systemInstruction = `Tu es un expert en bilan de compétences certifié Qualiopi. 
Tu rédiges des synthèses professionnelles, structurées et personnalisées.
Chaque point doit être étayé par des éléments concrets issus des réponses du bénéficiaire.`;

  // Construire la transcription complète
  const fullTranscript = answers.map((a, i) => 
    `[Q${i + 1}] ${a.questionTitle || a.questionId}\n[R${i + 1}] ${a.value}`
  ).join('\n\n---\n\n');

  const prompt = `Tu es un expert en bilan de compétences. Génère une synthèse complète et professionnelle.

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

La réponse DOIT être un objet JSON valide en français, conforme au schéma fourni.`;

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
  const prompt = `Pour le point de développement suivant: "${developmentPoint}"
    
Suggère:
1. 3-5 ressources concrètes (formations, livres, MOOCs, certifications)
2. 3-5 actions pratiques à mettre en place

Réponds en JSON avec les champs "resources" (array de strings) et "actions" (array de strings).
Langue: Français.`;

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
    return {
      resources: ["Formation en ligne recommandée", "Livre de référence sur le sujet"],
      actions: ["Identifier un mentor", "Pratiquer régulièrement"]
    };
  }
};

/**
 * Génère un résumé intermédiaire pour le dashboard
 */
export const generateIntermediateSummary = async (
  answers: Answer[],
  userName: string
): Promise<{ themes: string[]; insights: string[]; progress: number }> => {
  const history = answers.map(a => `Q: ${a.questionTitle}\nR: ${a.value}`).join('\n\n');
  
  const prompt = `Analyse les réponses suivantes d'un bilan de compétences en cours pour ${userName}.

${history}

Génère:
1. themes: 3-5 thèmes principaux qui émergent
2. insights: 2-3 observations clés sur le profil
3. progress: estimation du pourcentage de complétion du bilan (0-100)

Réponds en JSON. Langue: Français.`;

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
    return {
      themes: ["Parcours professionnel", "Compétences", "Aspirations"],
      insights: ["Analyse en cours..."],
      progress: Math.min(90, Math.round((answers.length / 30) * 100))
    };
  }
};

/**
 * Génère des recommandations personnalisées
 */
export const generatePersonalizedRecommendations = async (
  summary: Summary,
  userName: string
): Promise<string[]> => {
  const prompt = `Basé sur cette synthèse de bilan de compétences pour ${userName}:

Points forts: ${summary.strengths?.join(', ')}
Compétences: ${summary.skills?.join(', ')}
Axes d'amélioration: ${summary.areasToImprove?.join(', ')}
Projet professionnel: ${summary.projectProfessionnel}

Génère 5 recommandations personnalisées et concrètes pour aider ${userName} à atteindre ses objectifs.
Chaque recommandation doit être actionnable et spécifique.

Réponds en JSON avec un tableau "recommendations" de strings.
Langue: Français.`;

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
