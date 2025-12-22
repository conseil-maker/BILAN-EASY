import { GoogleGenAI, Type } from '@google/genai';
import { Answer, Package, Question, QuestionType, Summary, UserProfile, DashboardData, ActionPlanItem, CoachingStyle } from '../types';
import { QUESTION_CATEGORIES } from "../constants";
import { selectFallbackQuestion } from '../data/fallbackQuestions';
import { generateSmartQuestion, generateOpeningQuestion } from './smartQuestionGenerator';

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
    const baseInstruction = `🛑🛑🛑 RÈGLE ABSOLUE #1 - LIRE EN PREMIER 🛑🛑🛑
Tu ne dois JAMAIS poser de question de VALIDATION ou de SYNTHÈSE.
Ces questions sont INTERDITES et INUTILES car elles ne font pas avancer le bilan.

EXEMPLES DE QUESTIONS INTERDITES (NE JAMAIS GÉNÉRER) :
❌ "Est-ce que cette synthèse capture bien...?"
❌ "Si je comprends bien, vous...?"
❌ "Ai-je bien saisi que...?"
❌ "Cette analyse vous semble-t-elle juste ?"
❌ "Vous reconnaissez-vous dans cette description ?"
❌ "Diriez-vous que cette interprétation reflète...?"
❌ "Ce portrait correspond-il à votre ressenti ?"
❌ Toute question demandant de CONFIRMER ou VALIDER

AU LIEU DE VALIDER, TU DOIS TOUJOURS :
✅ Explorer un NOUVEL aspect pas encore abordé
✅ Creuser une émotion ou motivation profonde
✅ Projeter vers l'avenir ou l'action concrète
✅ Identifier des ressources ou forces cachées

=== QUI TU ES ===
Tu es le meilleur consultant en bilan de compétences au monde. Tu as 25 ans d'expérience et tu es reconnu pour ta capacité exceptionnelle à créer des déclics chez tes clients.

=== TON APPROCHE ===
Chaque question est un bijou ciselé spécifiquement pour cette personne. Tu rebondis TOUJOURS sur des éléments précis de la réponse précédente.

=== RÈGLES ===
1. LANGUE: Toujours en FRANÇAIS
2. PERSONNALISATION: Chaque question DOIT citer un élément de la dernière réponse
3. VALORISATION: Commence par reconnaître ce que la personne a partagé
4. PROFONDEUR: Creuse les émotions, motivations, valeurs
5. PROGRESSION: Chaque question doit faire AVANCER la réflexion

=== STRUCTURE ===
1. ACCROCHE: Valorise un élément précis de la réponse
2. QUESTION: Pose une question ouverte qui explore quelque chose de NOUVEAU

=== EXEMPLES DE BONNES QUESTIONS ===
- "Vous mentionnez avoir ressenti de la fierté quand votre équipe a livré ce projet. Cette fierté, qu'est-ce qu'elle vous dit sur ce qui compte vraiment pour vous ?"
- "Je note que vous parlez de 'routine' avec une certaine lassitude. Si vous pouviez transformer cette routine en quelque chose de stimulant, à quoi cela ressemblerait-il ?"
- "Votre parcours montre une vraie évolution. Quel a été le moment déclic où vous avez réalisé que cette direction vous attirait ?"

=== MODÈLE OSKAR - FRAMEWORK DE QUESTIONNEMENT ===
Utilise le modèle OSKAR pour structurer ta progression :

**O - OUTCOME (Objectifs)** : Explorer les aspirations
- "Si le succès était garanti, que tenteriez-vous ?"
- "À quoi ressemblerait une journée idéale pour vous dans 5 ans ?"

**S - SCALE (Échelle)** : Évaluer la situation actuelle
- "Sur une échelle de 1 à 10, où vous situez-vous par rapport à cet objectif ?"
- "Qu'est-ce qui fonctionne bien pour vous en ce moment ?"

**K - KNOW-HOW (Ressources)** : Identifier les compétences et ressources
- "Quelles ressources avez-vous déjà pour avancer ?"
- "Qu'est-ce qui vous a permis de réussir par le passé ?"

**A - AFFIRM (Forces)** : Valoriser et renforcer
- "Qu'est-ce que cette expérience révèle de vos forces ?"
- "Comment avez-vous surmonté des défis similaires avant ?"

**R - REVIEW/ACTION (Action)** : Engager vers l'action
- "Quelle est la plus petite action que vous pourriez faire dès demain ?"
- "Quel serait votre premier pas concret ?"

=== TYPES DE QUESTIONS À ALTERNER ===
Varie OBLIGATOIREMENT entre ces types (ne jamais poser 2 questions du même type consécutives) :
1. EXPLORATION : Découvrir de nouveaux aspects ("Qu'est-ce qui...?", "Comment avez-vous...?")
2. APPROFONDISSEMENT : Creuser un élément précis ("Pouvez-vous me décrire plus précisément...?")
3. PROJECTION : Imaginer l'avenir ("Si le succès était garanti...?", "Dans l'idéal...?")
4. ÉMOTION : Explorer les ressentis ("Qu'avez-vous ressenti quand...?", "Comment vivez-vous...?")
5. VALEURS : Identifier ce qui compte ("Qu'est-ce qui est important pour vous dans...?")
6. RESSOURCES : Identifier les forces ("Qu'est-ce qui vous a permis de...?", "Quelles ressources avez-vous...?")
7. ACTION : Engager vers le concret ("Quelle serait la plus petite action...?", "Quel premier pas...?")

=== GESTION DES DIGRESSIONS ===
Si le client s'éloigne du sujet, utilise la technique de redirection douce :
"Je comprends, c'est intéressant. Comment cela se rapporte-t-il à votre réflexion sur [thème principal] ?"
Cela valide le propos tout en recentrant la conversation.`;

    switch (style) {
        case 'analytic':
            return `${baseInstruction}

=== STYLE ANALYTIQUE ===
Tu es le consultant qui aide à décortiquer et comprendre. Ton approche:
- Décompose les situations complexes en éléments analysables
- Identifie les patterns, les causes et les conséquences
- Pose des questions qui amènent à structurer sa pensée
- Creuse les détails concrets et les méthodes utilisées

EXEMPLE STYLE ANALYTIQUE:
"Vous indiquez avoir géré une équipe de 8 développeurs pendant 3 ans. Quand vous analysez cette expérience, quels ont été les 2 ou 3 défis majeurs que vous avez dû résoudre, et quelle méthode avez-vous utilisée pour chacun ?"`;
        
        case 'creative':
            return `${baseInstruction}

=== STYLE CRÉATIF ===
Tu es le consultant qui ouvre les possibles. Ton approche:
- Invite à imaginer, rêver, projeter
- Utilise des métaphores et des angles inattendus
- Pose des questions qui libèrent la créativité
- Encourage à explorer des chemins non conventionnels

EXEMPLE STYLE CRÉATIF:
"Vous décrivez votre quotidien comme une 'routine'. Imaginons que demain matin, en arrivant au bureau, tout soit possible - aucune contrainte. Quelle serait la première chose que vous changeriez dans votre journée type ?"`;
        
        case 'collaborative':
        default:
            return `${baseInstruction}

=== STYLE COLLABORATIF ===
Tu es le consultant qui accompagne avec bienveillance. Ton approche:
- Crée un espace de confiance et de sécurité
- Valorise systématiquement les forces et réussites
- Accompagne avec empathie et encouragement
- Pose des questions qui renforcent la confiance en soi

EXEMPLE STYLE COLLABORATIF:
"Ce que vous partagez sur votre évolution est vraiment inspirant - passer de développeur à directeur technique en 5 ans, c'est une belle progression ! Qu'est-ce qui, selon vous, a fait la différence dans votre parcours ?"`;
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
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: userProfileSchema },
    });
    return parseJsonResponse<UserProfile>(response.text, 'analyzeUserProfile');
};

export const analyzeThemesAndSkills = async (answers: Answer[]): Promise<DashboardData> => {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the following answers from a skills assessment. Identify the main themes and assess 5 core skills. The response MUST be a valid JSON object conforming to the schema, including all 5 specified skills. Answers: --- ${history} ---`;
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
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
    // console.log('[generateQuestion] START - Phase:', phaseKey, 'Category:', options.categoryId, 'Answers:', previousAnswers.length);
    const systemInstruction = getSystemInstruction(coachingStyle);
    
    // Construire l'historique de conversation de manière plus riche
    let conversationContext = "";
    if (previousAnswers.length > 0) {
        const lastAnswer = previousAnswers[previousAnswers.length - 1];
        const keyElements = extractKeyElements(lastAnswer.value);
        
        // Extraire des citations spécifiques de la dernière réponse pour forcer la personnalisation
        const lastAnswerWords = lastAnswer.value.split(' ');
        const significantPhrases = [];
        if (lastAnswer.value.length > 50) {
            // Extraire 2-3 phrases ou segments significatifs
            const sentences = lastAnswer.value.split(/[.!?]+/).filter(s => s.trim().length > 20);
            significantPhrases.push(...sentences.slice(0, 2));
        }
        
        conversationContext = `
=== ATTENTION: PERSONNALISATION OBLIGATOIRE ===

Voici ce que ${userName} vient de te confier. Tu DOIS rebondir dessus:

"""
${lastAnswer.value}
"""

🎯 ÉLÉMENTS CLÉS À EXPLOITER:
${keyElements.length > 0 ? keyElements.map(e => `- ${e}`).join('\n') : '- Analyse le contenu pour trouver un angle personnel'}

${significantPhrases.length > 0 ? `💬 PHRASES IMPORTANTES À REPRENDRE:
${significantPhrases.map(p => `"${p.trim()}"`).join('\n')}` : ''}

${previousAnswers.length > 1 ? `📝 QUESTIONS DÉJÀ POSÉES (NE PAS RÉPÉTER NI REFORMULER):
${previousAnswers.slice(0, -1).map((a, i) => `${i + 1}. "${a.questionTitle || a.questionId}"`).join('\n')}` : ''}

🚨 ALERTE ANTI-RÉPÉTITION 🚨
Nombre de questions déjà posées: ${previousAnswers.length}
Tu DOIS poser une question COMPLÈTEMENT DIFFÉRENTE des précédentes.
Si tu as déjà posé une question sur un thème, explore un AUTRE thème.

=== CONSIGNE ABSOLUE ===
Ta question DOIT:
✅ Commencer par une référence EXPLICITE à ce que ${userName} vient de dire
✅ Citer ou paraphraser un élément spécifique de sa réponse
✅ Montrer que tu as VRAIMENT écouté et compris
✅ Creuser un aspect précis, pas généraliser
✅ Être d'un TYPE DIFFÉRENT de la question précédente (exploration/approfondissement/projection/émotion/valeurs)

❌ STRICTEMENT INTERDIT (VIOLATION = ÉCHEC TOTAL):
- "Parlez-moi de..." (trop générique)
- "Quelles sont vos compétences..." (déjà couvert ou trop vague)
- "Je vous écoute" (trop passif, ne pose pas de vraie question)
- "C'est passionnant" ou "C'est intéressant" seuls (commentaires vides)
- Toute question qui pourrait être posée sans avoir lu la réponse précédente

🛑🛑🛑 INTERDICTION ABSOLUE - PHRASES INUTILES 🛑🛑🛑
NE GÉNÈRE JAMAIS ces phrases dans le champ "description" :
- "Question générée en fonction de votre réponse précédente" (ÉVIDENT ET INUTILE)
- "Question générée en fonction de..." (INUTILE)
- "Cette question fait suite à..." (INUTILE)
- Toute méta-explication sur pourquoi tu poses cette question

Le champ "description" doit contenir UNIQUEMENT:
- Une valorisation sincère de ce que la personne a partagé
- Un lien émotionnel avec la question
- PAS de méta-commentaire technique

🛑🛑🛑 INTERDICTION ABSOLUE - QUESTIONS DE VALIDATION 🛑🛑🛑
NE GÉNÈRE JAMAIS une question contenant ces patterns :
- "Est-ce que cette synthèse..."
- "Si je résume..."
- "Si je comprends bien..."
- "Ai-je bien saisi..."
- "Cette analyse vous semble..."
- "Vous reconnaissez-vous dans..."
- "Ce portrait correspond-il..."
- "Diriez-vous que..."
- Toute demande de CONFIRMER ou VALIDER

🎯 MAINTENIR LA PROFONDEUR (APRÈS Q8+)
Même après plusieurs questions, chaque question doit être PROFONDE et PERCUTANTE :
- Creuser les CONTRADICTIONS détectées
- Explorer les PEURS sous-jacentes
- Questionner les CROYANCES limitantes
- Projeter vers des SCÉNARIOS concrets
- Demander des EXEMPLES précis et des MOMENTS clés

Éviter les questions "light" comme :
- "Comment cette expérience a-t-elle influencé..." (trop vague)
- "Qu'est-ce qui l'a rendu possible..." (trop simple)

Préférer des questions PROFONDES comme :
- "Si vous deviez revivre ce moment de fierté avec Sophie, qu'est-ce que vous feriez différemment avec le recul ?"
- "Qu'est-ce qui vous empêche VRAIMENT de devenir coach aujourd'hui ? Quelle est la peur derrière ?"
- "Si votre mari vous disait demain 'Lance-toi, je te soutiens', que feriez-vous concrètement dans les 48h ?"

Ces questions sont INTERDITES car elles ne font pas avancer le bilan.
Pose plutôt une question qui EXPLORE quelque chose de NOUVEAU et PROFOND.
===================================`;
    } else {
        // Première question - personnaliser avec le profil si disponible
        if (userProfile) {
            conversationContext = `
=== PREMIÈRE QUESTION DU BILAN ===

Tu démarres le bilan avec ${userName}.
Profil: ${userProfile.currentRole}
Compétences identifiées: ${userProfile.keySkills.join(', ')}

Crée une question d'ouverture PERSONNALISÉE qui:
1. Utilise le prénom "${userName}" naturellement
2. Fait référence à son rôle de ${userProfile.currentRole}
3. Invite à partager son parcours de manière engageante
4. Crée immédiatement un climat de confiance

Exemple: "${userName}, en tant que ${userProfile.currentRole}, vous avez certainement un parcours riche. Qu'est-ce qui vous a amené jusqu'à ce rôle aujourd'hui ?"
===================================`;
        } else {
            conversationContext = `
=== PREMIÈRE QUESTION DU BILAN ===

Tu démarres le bilan avec ${userName}.
Aucun profil préalable - c'est l'occasion de faire connaissance !

Crée une question d'ouverture CHALEUREUSE qui:
1. Utilise le prénom "${userName}" naturellement
2. Invite à se présenter librement
3. Met immédiatement à l'aise
4. Donne envie de se confier

Exemple: "${userName}, avant de plonger dans le bilan, j'aimerais vous connaître un peu mieux. Pouvez-vous me raconter votre parcours professionnel et ce qui vous amène ici aujourd'hui ?"
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
                model: 'gemini-2.5-pro',
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
        // console.log('[generateQuestion] Tentative 1: gemini-2.5-pro 30s');
        response = await generateWithTimeout(30000);
    } catch (error) {
        console.warn('[generateQuestion] Échec tentative 1:', error);
        try {
            // console.log('[generateQuestion] Tentative 2: gemini-2.5-pro 20s');
            response = await generateWithTimeout(20000);
        } catch (error2) {
            console.error('[generateQuestion] Échec tentative 2:', error2);
            console.warn('[generateQuestion] Fallback: utilisation de questions pré-générées');
            
            // Fallback intelligent: générer une question personnalisée côté client
            // console.log('[generateQuestion] Tentative de génération intelligente côté client');
            
            // Si c'est la première question, utiliser la question d'ouverture personnalisée
            if (previousAnswers.length === 0) {
                const openingQuestion = generateOpeningQuestion(userName, coachingStyle);
                // console.log('[generateQuestion] Question d\'ouverture générée:', openingQuestion.title.substring(0, 50));
                return openingQuestion;
            }
            
            // Sinon, générer une question basée sur la dernière réponse
            const smartQuestion = generateSmartQuestion(previousAnswers, userName, coachingStyle);
            if (smartQuestion) {
                // console.log('[generateQuestion] Question intelligente générée:', smartQuestion.title.substring(0, 50));
                return smartQuestion;
            }
            
            // Dernier recours: questions de fallback statiques
            // console.log('[generateQuestion] Fallback statique utilisé');
            const fallbackQuestion = selectFallbackQuestion(
                options.categoryId || 'parcours_professionnel',
                options.isModuleQuestion ? 2 : 1,
                previousAnswers.map(a => a.questionId)
            );
            
            if (fallbackQuestion) {
                // console.log('[generateQuestion] Question de fallback sélectionnée:', fallbackQuestion.id);
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
    
    // === VALIDATION POST-GÉNÉRATION : REJETER LES QUESTIONS DE VALIDATION ===
    const questionTitle = (questionData.title || '').toLowerCase();
    const forbiddenPatterns = [
        'est-ce que cette synthèse',
        'si je résume',
        'si je comprends bien',
        'ai-je bien saisi',
        'cette analyse vous semble',
        'vous reconnaissez-vous dans',
        'ce portrait correspond',
        'diriez-vous que',
        'est-ce exact',
        'est-ce correct',
        'confirmer',
        'valider ma compréhension',
        'capture bien',
        'reflète bien'
    ];
    
    const isValidationQuestion = forbiddenPatterns.some(pattern => questionTitle.includes(pattern));
    
    if (isValidationQuestion && previousAnswers.length > 0) {
        console.warn('[generateQuestion] Question de validation détectée et rejetée:', questionData.title?.substring(0, 60));
        // Générer une question alternative via le système intelligent
        const smartQuestion = generateSmartQuestion(previousAnswers, userName, coachingStyle);
        if (smartQuestion) {
            // console.log('[generateQuestion] Question alternative générée:', smartQuestion.title.substring(0, 50));
            return smartQuestion;
        }
    }
    
    // console.log('[generateQuestion] Question générée avec succès:', questionData.title?.substring(0, 60));
    
    // === FILTRE POST-GÉNÉRATION : SUPPRIMER LES PHRASES TECHNIQUES INUTILES ===
    const technicalPhrases = [
        // Patterns spécifiques
        /question générée en fonction de votre réponse précédente\.?/gi,
        /question générée en fonction de[^.]*\.?/gi,
        /question basée sur votre réponse[^.]*\.?/gi,
        /cette question fait suite à[^.]*\.?/gi,
        /cette question est basée sur[^.]*\.?/gi,
        /cette question est générée[^.]*\.?/gi,
        /en réponse à ce que vous avez partagé\.?/gi,
        /générée? en fonction de[^.]*\.?/gi,
        /suite à votre réponse[^.]*\.?/gi,
        /en lien avec votre réponse[^.]*\.?/gi,
        /basée? sur vos réponses[^.]*\.?/gi,
        // Patterns ultra-génériques (dernière ligne de défense)
        /\bquestion\s+générée\b[^.]*\.?/gi,
        /\bgénérée?\s+automatiquement\b[^.]*\.?/gi
    ];
    
    // Nettoyer le champ description
    let cleanDescription = questionData.description || '';
    for (const pattern of technicalPhrases) {
        cleanDescription = cleanDescription.replace(pattern, '').trim();
    }
    cleanDescription = cleanDescription.replace(/\s{2,}/g, ' ').trim();
    
    // Nettoyer aussi le champ title (au cas où)
    let cleanTitle = questionData.title || '';
    for (const pattern of technicalPhrases) {
        cleanTitle = cleanTitle.replace(pattern, '').trim();
    }
    cleanTitle = cleanTitle.replace(/\s{2,}/g, ' ').trim();
    
    if (cleanDescription !== questionData.description || cleanTitle !== questionData.title) {
        // console.log('[generateQuestion] Phrase technique supprimée');
    }
    
    return { 
        ...questionData, 
        id: uniqueId, // Forcer un ID unique
        title: cleanTitle,
        description: cleanDescription || undefined,
        type, 
        choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined 
    } as Question;
};

export const suggestOptionalModule = async (answers: Answer[]): Promise<{ isNeeded: boolean, moduleId?: string, reason?: string }> => {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the user's answers. Determine if they exhibit a strong need for a specific, short optional module on one of these topics: 'transition-management' (fear of change, uncertainty), 'self-confidence' (self-doubt, impostor syndrome), or 'work-life-balance' (stress, burnout, desire for better balance). Only set isNeeded to true if the signal is clear and strong. The response must be a valid JSON object. Answers: --- ${history} ---`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: optionalModuleSchema },
    });
    return parseJsonResponse<any>(response.text, 'suggestOptionalModule');
};

export const generateSynthesis = async (lastAnswers: Answer[], userName: string, coachingStyle: CoachingStyle): Promise<{ synthesis: string; confirmationRequest: string }> => {
    const systemInstruction = getSystemInstruction(coachingStyle);
    const history = lastAnswers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    const prompt = `Context: User Name: ${userName}. Task: Act as an attentive coach. Based on the user's last few answers, create a concise, one-sentence summary and formulate a polite question to confirm if your summary is correct. The response MUST be a valid JSON object. Language: French. Last answers: ${history}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema: synthesisSchema } });
    return parseJsonResponse<{ synthesis: string; confirmationRequest: string }>(response.text, 'generateSynthesis');
};

export const generateSummary = async (answers: Answer[], pkg: Package, userName: string, coachingStyle: CoachingStyle): Promise<Summary> => {
    const systemInstruction = getSystemInstruction(coachingStyle);
    const fullTranscript = answers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    const prompt = `Context: User Name: ${userName}, Package: ${pkg.name}, Transcript: ${fullTranscript}. Task: Analyze the transcript and generate a comprehensive summary in French. The response MUST be a valid JSON object conforming to the schema. For 'keyStrengths' and 'areasForDevelopment', each point MUST include a 'sources' array with 1-3 direct quotes from the user's answers that justify this point. For 'actionPlan', each item must have a unique 'id' and 'text'.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema: summarySchema } });
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
            model: 'gemini-2.5-pro',
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
