import { GoogleGenAI, Type } from '@google/genai';
import { Answer, Package, Question, QuestionType, Summary, UserProfile, DashboardData, ActionPlanItem, CoachingStyle } from '../types';
import { QUESTION_CATEGORIES } from "../constants";
import { selectFallbackQuestion } from '../data/fallbackQuestions';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY! });

// --- SCHEMAS ---

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the question (e.g., 'motivation-01')." },
        title: { type: Type.STRING, description: "The main question text in French. Must be personalized and engaging." },
        description: { type: Type.STRING, description: "Optional: additional context or explanation for the question in French. Can include encouragement or connection to previous answers." },
        type: { type: Type.STRING, enum: ['PARAGRAPH', 'MULTIPLE_CHOICE'], description: "The type of answer expected." },
        theme: { type: Type.STRING, description: "The main theme of the question (e.g., 'Motivations', 'Compétences Techniques')." },
        choices: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of choices, only if type is MULTIPLE_CHOICE." },
        required: { type: Type.BOOLEAN, description: "Whether the question is mandatory." }
    },
    required: ["id", "title", "type", "theme", "required"]
};

const synthesisSchema = {
    type: Type.OBJECT,
    properties: {
        synthesis: { type: Type.STRING, description: "A concise, one-sentence summary of the user's last answers in French." },
        confirmationRequest: { type: Type.STRING, description: "A polite question to confirm if the summary is correct in French." }
    },
    required: ["synthesis", "confirmationRequest"]
};

const summaryPointSchema = {
    type: Type.OBJECT,
    properties: {
        text: { type: Type.STRING, description: "The summarized point (strength or area for development) in French." },
        sources: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 1 to 3 direct quotes from the user's answers that justify this point." }
    },
    required: ["text", "sources"]
};

const actionPlanItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the action item (e.g., 'short-term-1')." },
        text: { type: Type.STRING, description: "The specific action item text in French." }
    },
    required: ["id", "text"]
};

const summarySchema = {
    type: Type.OBJECT,
    properties: {
        profileType: { type: Type.STRING, description: "A descriptive title for the user's professional profile in French (e.g., 'Le Spécialiste en Transition', 'Le Leader Créatif')." },
        priorityThemes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 main themes that emerged during the assessment." },
        maturityLevel: { type: Type.STRING, description: "A sentence describing the user's level of clarity regarding their career project in French." },
        keyStrengths: { type: Type.ARRAY, items: summaryPointSchema, description: "A list of key strengths identified." },
        areasForDevelopment: { type: Type.ARRAY, items: summaryPointSchema, description: "A list of areas for development." },
        recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 general recommendations in French." },
        actionPlan: {
            type: Type.OBJECT,
            properties: {
                shortTerm: { type: Type.ARRAY, items: actionPlanItemSchema, description: "Action items for the next 1-3 months." },
                mediumTerm: { type: Type.ARRAY, items: actionPlanItemSchema, description: "Action items for the next 3-6 months." }
            },
            required: ["shortTerm", "mediumTerm"]
        }
    },
    required: ["profileType", "priorityThemes", "maturityLevel", "keyStrengths", "areasForDevelopment", "recommendations", "actionPlan"]
};

const userProfileSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "The user's full name, if available." },
        currentRole: { type: Type.STRING, description: "The user's most recent or current job title." },
        keySkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the most prominent skills mentioned." },
        pastExperiences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A brief summary of key past experiences or companies." }
    },
    required: ["currentRole", "keySkills", "pastExperiences"]
};

const dashboardDataSchema = {
    type: Type.OBJECT,
    properties: {
        themes: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING },
                    weight: { type: Type.NUMBER, description: "A value from 1 to 10 representing importance." }
                },
                required: ["text", "weight"]
            }
        },
        skills: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, enum: ["Communication", "Leadership", "Adaptabilité", "Résolution de problèmes", "Travail d'équipe"] },
                    level: { type: Type.NUMBER, description: "A value from 1 to 10." }
                },
                required: ["name", "level"]
            }
        }
    },
    required: ["themes", "skills"]
};

const optionalModuleSchema = {
    type: Type.OBJECT,
    properties: {
        isNeeded: { type: Type.BOOLEAN, description: "Set to true only if a strong, specific user need is detected." },
        moduleId: { type: Type.STRING, enum: ["transition-management", "self-confidence", "work-life-balance"], description: "The ID of the suggested module if needed." },
        reason: { type: Type.STRING, description: "A short, polite sentence in French explaining why this module is suggested." }
    },
    required: ["isNeeded"],
};

const parseJsonResponse = <T>(jsonString: string, functionName: string): T => {
    try {
        return JSON.parse(jsonString.trim()) as T;
    } catch (error) {
        console.error(`Error parsing JSON from ${functionName}:`, error);
        console.error("Received text:", jsonString);
        throw new Error(`Failed to parse JSON response in ${functionName}.`);
    }
};

/**
 * Génère l'instruction système selon le style de coaching
 * Optimisé pour créer une connexion émotionnelle et encourager l'engagement
 */
const getSystemInstruction = (style: CoachingStyle): string => {
    const baseInstruction = `Tu es un coach de carrière expert et bienveillant qui accompagne des personnes dans leur bilan de compétences.

RÈGLES FONDAMENTALES:
1. TOUJOURS répondre en FRANÇAIS
2. Créer une connexion authentique avec la personne
3. Montrer que tu as VRAIMENT lu et compris ses réponses précédentes
4. Poser des questions qui font réfléchir et motivent
5. Valoriser ce que la personne partage avant de poser une nouvelle question

STYLE DE QUESTIONS:
- Commence souvent par une observation ou un reflet de ce que la personne a dit
- Utilise le prénom de la personne naturellement
- Pose des questions ouvertes qui invitent à l'introspection
- Évite les questions fermées (oui/non)
- Fais des liens entre les différentes réponses

EXEMPLES DE BONNES TRANSITIONS:
- "Ce que vous décrivez sur [X] est vraiment intéressant. J'aimerais creuser..."
- "Je remarque que vous avez mentionné [X]. Cela m'interpelle..."
- "Votre parcours de [X] à [Y] montre une belle évolution. Qu'est-ce qui..."
- "C'est passionnant de voir comment [X]. Dites-moi..."`;

    switch (style) {
        case 'analytic':
            return `${baseInstruction}

STYLE ANALYTIQUE:
- Approche méthodique et structurée
- Questions précises pour déconstruire les situations
- Aide à identifier des patterns et des connexions logiques
- Utilise des reformulations pour clarifier
- Exemple: "Vous mentionnez avoir géré 8 développeurs. Concrètement, quels défis de coordination avez-vous rencontrés et comment les avez-vous résolus ?"`;
        
        case 'creative':
            return `${baseInstruction}

STYLE CRÉATIF:
- Approche inspirante et ouverte
- Questions qui stimulent l'imagination et les possibilités
- Utilise des métaphores et des perspectives nouvelles
- Encourage à sortir des sentiers battus
- Exemple: "Si vous pouviez redessiner complètement votre rôle idéal, en gardant ce qui vous passionne dans le management, à quoi ressemblerait-il ?"`;
        
        case 'collaborative':
        default:
            return `${baseInstruction}

STYLE COLLABORATIF:
- Approche chaleureuse et encourageante
- Valorise les forces et les réussites
- Crée un espace de confiance pour l'expression
- Accompagne avec empathie
- Exemple: "Votre évolution de développeur à directeur technique est impressionnante ! Qu'est-ce qui vous a donné l'élan pour franchir chaque étape ?"`;
    }
};

/**
 * Extrait les éléments clés d'une réponse pour personnaliser la question suivante
 */
const extractKeyElements = (answer: string): string[] => {
    const elements: string[] = [];
    
    // Détecter les métiers/rôles mentionnés
    const rolePatterns = /(?:développeur|chef de projet|directeur|manager|consultant|ingénieur|responsable|technicien|commercial|designer|analyste|architecte)/gi;
    const roles = answer.match(rolePatterns);
    if (roles) elements.push(...roles.map(r => r.toLowerCase()));
    
    // Détecter les durées/expériences
    const durationPatterns = /(\d+)\s*(?:ans?|années?|mois)/gi;
    const durations = answer.match(durationPatterns);
    if (durations) elements.push(...durations);
    
    // Détecter les secteurs
    const sectorPatterns = /(?:numérique|tech|digital|finance|santé|industrie|commerce|marketing|RH|IT|web|mobile|data|cloud)/gi;
    const sectors = answer.match(sectorPatterns);
    if (sectors) elements.push(...sectors.map(s => s.toLowerCase()));
    
    // Détecter les aspirations
    const aspirationPatterns = /(?:souhaite|veux|aimerais|envisage|rêve de|aspire à|objectif|ambition)/gi;
    if (aspirationPatterns.test(answer)) elements.push('aspiration_detected');
    
    // Détecter les émotions/sentiments
    const emotionPatterns = /(?:passionné|motivé|frustré|ennuyé|épanoui|stressé|satisfait|inquiet|confiant|hésitant)/gi;
    const emotions = answer.match(emotionPatterns);
    if (emotions) elements.push(...emotions.map(e => e.toLowerCase()));
    
    return [...new Set(elements)];
};

export const analyzeUserProfile = async (cvText: string): Promise<UserProfile> => {
    const prompt = `Analyze the following professional profile text (likely from a CV) and extract key information. The response MUST be a valid JSON object conforming to the specified schema. Text to analyze: --- ${cvText} ---`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: userProfileSchema },
    });
    return parseJsonResponse<UserProfile>(response.text, 'analyzeUserProfile');
};

export const analyzeThemesAndSkills = async (answers: Answer[]): Promise<DashboardData> => {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the following answers from a skills assessment. Identify the main themes and assess 5 core skills. The response MUST be a valid JSON object conforming to the schema, including all 5 specified skills. Answers: --- ${history} ---`;
     const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: dashboardDataSchema },
    });
    return parseJsonResponse<DashboardData>(response.text, 'analyzeThemesAndSkills');
};

export const generateQuestion = async (
  phaseKey: 'phase1' | 'phase2' | 'phase3',
  categoryIndex: number,
  previousAnswers: Answer[],
  userName: string,
  coachingStyle: CoachingStyle,
  userProfile: UserProfile | null = null,
  options: { useJoker?: boolean, useGoogleSearch?: boolean, searchTopic?: string, isModuleQuestion?: { moduleId: string, questionNum: number }, targetComplexity?: 'simple' | 'moyenne' | 'complexe' | 'reflexion', categoryId?: string } = {}
): Promise<Question> => {
    console.log('[generateQuestion] START - Phase:', phaseKey, 'Category:', options.categoryId, 'Answers:', previousAnswers.length);
    const systemInstruction = getSystemInstruction(coachingStyle);
    
    // Construire l'historique de conversation de manière plus riche
    let conversationContext = "";
    if (previousAnswers.length > 0) {
        const lastAnswer = previousAnswers[previousAnswers.length - 1];
        const keyElements = extractKeyElements(lastAnswer.value);
        
        conversationContext = `
=== CONTEXTE DE LA CONVERSATION ===
Nombre de questions déjà posées: ${previousAnswers.length}

DERNIÈRE RÉPONSE DE ${userName.toUpperCase()} (la plus importante pour personnaliser):
Question: "${lastAnswer.questionTitle || lastAnswer.questionId}"
Réponse: "${lastAnswer.value}"
Éléments clés détectés: ${keyElements.join(', ') || 'aucun élément spécifique'}

${previousAnswers.length > 1 ? `RÉSUMÉ DES RÉPONSES PRÉCÉDENTES:
${previousAnswers.slice(0, -1).map((a, i) => `${i + 1}. Q: "${a.questionTitle || a.questionId}" → R: "${a.value.substring(0, 150)}${a.value.length > 150 ? '...' : ''}"`).join('\n')}` : ''}

=== INSTRUCTION CRITIQUE ===
Ta prochaine question DOIT:
1. REBONDIR directement sur ce que ${userName} vient de dire
2. Montrer que tu as COMPRIS et VALORISÉ sa réponse
3. Approfondir un aspect spécifique mentionné
4. Créer une connexion émotionnelle et intellectuelle
5. Être formulée de manière engageante et motivante

EXEMPLES DE MAUVAISES QUESTIONS (à éviter):
- Questions génériques qui ignorent la réponse précédente
- Questions qui répètent ce qui a déjà été demandé
- Questions fermées (oui/non)

EXEMPLES DE BONNES QUESTIONS (à imiter):
- "Vous mentionnez votre évolution vers le management. Qu'est-ce qui vous a le plus surpris dans cette transition ?"
- "Je trouve fascinant votre parcours de développeur à directeur technique. Quel moment a été le plus décisif ?"
- "Vous parlez de nouvelles opportunités dans le conseil. Qu'est-ce qui vous attire particulièrement dans ce domaine ?"
===================================`;
    } else {
        // Première question - personnaliser avec le profil si disponible
        if (userProfile) {
            conversationContext = `
=== PREMIÈRE QUESTION ===
C'est la première question du bilan pour ${userName}.
Profil connu: ${userProfile.currentRole}, compétences: ${userProfile.keySkills.join(', ')}

Commence par une question d'accueil chaleureuse qui:
1. Utilise le prénom de la personne
2. Fait référence à son profil si pertinent
3. Met à l'aise et invite au partage
4. Est ouverte et engageante
===================================`;
        } else {
            conversationContext = `
=== PREMIÈRE QUESTION ===
C'est la première question du bilan pour ${userName}.
Aucun profil préalable disponible.

Commence par une question d'accueil chaleureuse qui:
1. Utilise le prénom de la personne
2. Invite à se présenter de manière libre
3. Met à l'aise et crée un climat de confiance
4. Est ouverte et non intimidante
===================================`;
        }
    }

    // Construire la description de la tâche
    let taskDescription = "";
    if (options.isModuleQuestion) {
        taskDescription = `Module optionnel: ${options.isModuleQuestion.moduleId} (question ${options.isModuleQuestion.questionNum}/3). Pose une question ciblée sur ce thème tout en restant connecté au contexte de la conversation.`;
    } else {
        const phaseInfo = QUESTION_CATEGORIES[phaseKey];
        const category = phaseInfo.categories[categoryIndex];
        
        let complexityGuidance = "";
        if (options.targetComplexity) {
            switch (options.targetComplexity) {
                case 'simple':
                    complexityGuidance = "Question SIMPLE (1-2 min): factuelle, directe, facile à répondre.";
                    break;
                case 'moyenne':
                    complexityGuidance = "Question MOYENNE (3-5 min): invite à la réflexion, demande des exemples.";
                    break;
                case 'complexe':
                    complexityGuidance = "Question COMPLEXE (5-10 min): analyse approfondie, mise en perspective.";
                    break;
                case 'reflexion':
                    complexityGuidance = "Question de RÉFLEXION PROFONDE (10-15 min): introspection, projection, vision.";
                    break;
            }
        }
        
        taskDescription = `Phase: ${phaseInfo.name} | Catégorie: ${category.name}
${complexityGuidance}
Génère une question qui explore cette catégorie tout en rebondissant sur les réponses précédentes.`;
    }

    // Instructions spéciales
    let specialInstruction = "";
    if (options.useJoker) {
        specialInstruction = `
=== MODE JOKER ACTIVÉ ===
${userName} a besoin d'aide pour répondre. Reformule la question précédente de manière:
- Plus simple et accessible
- Sous un angle différent
- Avec un exemple concret pour guider
Commence par une phrase rassurante comme "Pas de souci, explorons cela autrement..."
===========================`;
    } else if (options.useGoogleSearch && options.searchTopic) {
        specialInstruction = `
=== ENRICHISSEMENT CONTEXTUEL ===
${userName} a mentionné un intérêt pour "${options.searchTopic}".
Utilise les résultats de recherche pour poser une question enrichie qui connecte cet intérêt aux réalités du marché.
===========================`;
    }

    const prompt = `${conversationContext}

${specialInstruction}

TÂCHE: ${taskDescription}

RAPPEL: La question doit être en FRANÇAIS, personnalisée pour ${userName}, et créer un vrai dialogue engageant.
Le champ "description" peut contenir une phrase d'accroche ou de transition qui valorise la réponse précédente.

Génère la question au format JSON.`;

    const config: any = { 
        systemInstruction,
        responseMimeType: "application/json", 
        responseSchema: questionSchema,
    };

    if (options.useGoogleSearch) {
        config.tools = [{googleSearch: {}}];
    }

    // Timeout et retry pour éviter les blocages
    const generateWithTimeout = async (timeoutMs: number = 30000) => {
        return Promise.race([
            ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: prompt,
                config: config,
            }),
            new Promise<never>((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout après ${timeoutMs/1000}s`)), timeoutMs)
            )
        ]);
    };

    let response;
    try {
        console.log('[generateQuestion] Tentative 1: gemini-2.0-flash 30s');
        response = await generateWithTimeout(30000);
    } catch (error) {
        console.warn('[generateQuestion] Échec tentative 1:', error);
        try {
            console.log('[generateQuestion] Tentative 2: gemini-2.0-flash 20s');
            response = await generateWithTimeout(20000);
        } catch (error2) {
            console.error('[generateQuestion] Échec tentative 2:', error2);
            console.warn('[generateQuestion] Fallback: utilisation de questions pré-générées');
            
            // Fallback avec questions pré-générées
            const fallbackQuestion = selectFallbackQuestion(
                options.categoryId || 'parcours_professionnel',
                options.isModuleQuestion ? 2 : 1,
                previousAnswers.map(a => a.questionId)
            );
            
            if (fallbackQuestion) {
                console.log('[generateQuestion] Question de fallback sélectionnée:', fallbackQuestion.id);
                return fallbackQuestion;
            }
            
            // Si même le fallback échoue, lever l'erreur
            throw new Error('Impossible de générer la question après 2 tentatives. Veuillez réessayer.');
        }
    }

    const questionData = parseJsonResponse<any>(response.text, 'generateQuestion');
    const type = questionData.type?.toUpperCase() === 'MULTIPLE_CHOICE' ? QuestionType.MULTIPLE_CHOICE : QuestionType.PARAGRAPH;
    
    // Générer un ID unique côté client pour éviter les doublons
    const uniqueId = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('[generateQuestion] Question générée avec succès:', questionData.title?.substring(0, 60));
    
    return { 
        ...questionData, 
        id: uniqueId, // Forcer un ID unique
        type, 
        choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined 
    } as Question;
};

export const suggestOptionalModule = async (answers: Answer[]): Promise<{ isNeeded: boolean, moduleId?: string, reason?: string }> => {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the user's answers. Determine if they exhibit a strong need for a specific, short optional module on one of these topics: 'transition-management' (fear of change, uncertainty), 'self-confidence' (self-doubt, impostor syndrome), or 'work-life-balance' (stress, burnout, desire for better balance). Only set isNeeded to true if the signal is clear and strong. The response must be a valid JSON object. Answers: --- ${history} ---`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: optionalModuleSchema },
    });
    return parseJsonResponse<any>(response.text, 'suggestOptionalModule');
};

export const generateSynthesis = async (lastAnswers: Answer[], userName: string, coachingStyle: CoachingStyle): Promise<{ synthesis: string; confirmationRequest: string }> => {
    const systemInstruction = getSystemInstruction(coachingStyle);
    const history = lastAnswers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    const prompt = `Context: User Name: ${userName}. Task: Act as an attentive coach. Based on the user's last few answers, create a concise, one-sentence summary and formulate a polite question to confirm if your summary is correct. The response MUST be a valid JSON object. Language: French. Last answers: ${history}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema: synthesisSchema } });
    return parseJsonResponse<{ synthesis: string; confirmationRequest: string }>(response.text, 'generateSynthesis');
};

export const generateSummary = async (answers: Answer[], pkg: Package, userName: string, coachingStyle: CoachingStyle): Promise<Summary> => {
    const systemInstruction = getSystemInstruction(coachingStyle);
    const fullTranscript = answers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    const prompt = `Context: User Name: ${userName}, Package: ${pkg.name}, Transcript: ${fullTranscript}. Task: Analyze the transcript and generate a comprehensive summary in French. The response MUST be a valid JSON object conforming to the schema. For 'keyStrengths' and 'areasForDevelopment', each point MUST include a 'sources' array with 1-3 direct quotes from the user's answers that justify this point. For 'actionPlan', each item must have a unique 'id' and 'text'.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema: summarySchema } });
    return parseJsonResponse<Summary>(response.text, 'generateSummary');
};


/**
 * Trouve des ressources et pistes pour un point de développement
 */
export const findResourceLeads = async (developmentPoint: string): Promise<{ resources: string[], actions: string[] }> => {
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
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema },
        });
        return parseJsonResponse<{ resources: string[], actions: string[] }>(response.text, 'findResourceLeads');
    } catch (error) {
        console.error('[findResourceLeads] Error:', error);
        return {
            resources: ["Formation en ligne recommandée", "Livre de référence sur le sujet"],
            actions: ["Identifier un mentor", "Pratiquer régulièrement"]
        };
    }
};
