import { GoogleGenAI, Type } from "@google/genai";
import { Answer, Package, Question, QuestionType, Summary, UserProfile, DashboardData, ActionPlanItem, CoachingStyle } from '../types';
import { QUESTION_CATEGORIES } from "../constants";

// Vite'da environment variables için process.env.API_KEY kullanılıyor (vite.config.ts'de define edilmiş)
// Eğer undefined ise, import.meta.env'den de deneyelim
const apiKey = (process.env.API_KEY || process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY) as string;

if (!apiKey || apiKey === 'undefined' || apiKey === '') {
  console.error('❌ GEMINI_API_KEY bulunamadı!');
  console.error('📝 .env.local dosyasında şu şekilde tanımlayın:');
  console.error('   GEMINI_API_KEY=your_api_key_here');
  console.error('   VEYA');
  console.error('   VITE_GEMINI_API_KEY=your_api_key_here');
  
  // Kullanıcıya görünür hata mesajı göster
  if (typeof window !== 'undefined') {
    alert('⚠️ Erreur de configuration: Clé API Gemini manquante.\n\nVérifiez votre fichier .env.local et redémarrez le serveur de développement.');
  }
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// --- SCHEMAS ---

const questionSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier for the question (e.g., 'motivation-01')." },
        title: { type: Type.STRING, description: "The main question text in French." },
        description: { type: Type.STRING, description: "Optional: additional context or explanation for the question in French." },
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
                    label: { type: Type.STRING, enum: ["Communication", "Leadership", "Analyse", "Adaptabilité", "Collaboration"] },
                    score: { type: Type.NUMBER, description: "A score from 1 to 5." }
                },
                required: ["label", "score"]
            }
        }
    },
    required: ["themes", "skills"]
};

const resourceLeadsSchema = {
    type: Type.OBJECT,
    properties: {
        searchKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        resourceTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
        platformExamples: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["searchKeywords", "resourceTypes", "platformExamples"]
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

const getSystemInstruction = (style: CoachingStyle): string => {
    switch (style) {
        case 'analytic':
            return "You are an analytical and structured career coach. Your approach is methodical and data-driven. You ask precise questions to deconstruct problems logically. Language: French.";
        case 'creative':
            return "You are a creative and inspiring career coach. Your approach is to open new perspectives and encourage out-of-the-box thinking. You use metaphors and ask stimulating questions. Language: French.";
        case 'collaborative':
        default:
            return "You are a collaborative and encouraging career coach. Your tone is warm, supportive, and empathetic. You focus on the user's strengths and build their confidence. Language: French.";
    }
}

export const analyzeUserProfile = async (cvText: string): Promise<UserProfile> => {
    const prompt = `Analyze the following professional profile text (likely from a CV) and extract key information. The response MUST be a valid JSON object conforming to the specified schema. Text to analyze: --- ${cvText} ---`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: userProfileSchema },
    });
    return parseJsonResponse<UserProfile>(response.text, 'analyzeUserProfile');
};

export const analyzeThemesAndSkills = async (answers: Answer[]): Promise<DashboardData> => {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the following answers from a skills assessment. Identify the main themes and assess 5 core skills. The response MUST be a valid JSON object conforming to the schema, including all 5 specified skills. Answers: --- ${history} ---`;
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
  options: { useJoker?: boolean, useGoogleSearch?: boolean, searchTopic?: string, isModuleQuestion?: { moduleId: string, questionNum: number } } = {}
): Promise<Question> => {
    // API key kontrolü
    if (!apiKey || apiKey === '') {
        throw new Error('GEMINI_API_KEY bulunamadı! Lütfen .env.local dosyasında GEMINI_API_KEY tanımlı olduğundan emin olun ve sunucuyu yeniden başlatın.');
    }

    const systemInstruction = getSystemInstruction(coachingStyle);
    const history = previousAnswers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');

    let taskDescription = "";
    if (options.isModuleQuestion) {
        taskDescription = `This is question ${options.isModuleQuestion.questionNum}/3 for the optional module on '${options.isModuleQuestion.moduleId}'. Ask a focused question on this topic.`
    } else {
        const phaseInfo = QUESTION_CATEGORIES[phaseKey];
        const category = phaseInfo.categories[categoryIndex];
        taskDescription = `This is the main assessment. Phase: ${phaseInfo.name}, Current Category: ${category}. Generate the next question.`
    }

    let profileContext = "";
    if (userProfile && previousAnswers.length === 0) {
        profileContext = `We have some initial information from the user's profile: Role: ${userProfile.currentRole}, Key Skills: ${userProfile.keySkills.join(', ')}, Past Experiences: ${userProfile.pastExperiences.join(', ')}. Use this to ask a personalized FIRST question.`;
    }
    
    let specialInstruction = "";
    if (options.useJoker) {
        specialInstruction = "CRITICAL INSTRUCTION: The user is stuck on the previous question. Your task is to reformulate it from a completely different angle or ask a much simpler, related question to help them unlock their thoughts. Acknowledge their request for help subtly. Example: 'Pas de souci, explorons cela différemment. Plutôt que de parler de vos plus grandes réussites, pourriez-vous me raconter un moment au travail où vous vous êtes senti particulièrement fier de vous ?'";
    } else if (options.useGoogleSearch && options.searchTopic) {
        specialInstruction = `CRITICAL INSTRUCTION: The user mentioned an interest in '${options.searchTopic}'. Use the provided Google Search results to ask an enriched follow-up question that connects their interest to the current reality of the job market. Example: 'Intéressant, le métier de ${options.searchTopic}. Je vois que les offres d'emploi actuelles insistent beaucoup sur la compétence [Compétence trouvée via recherche]. Est-ce un domaine qui vous attire ?'`;
    }

    const prompt = `Context: User Name: ${userName}. ${profileContext} Previous Q&A: ${history || "None."} ${specialInstruction} Task: ${taskDescription} The response MUST be a valid JSON object. Do not repeat questions.`;

    const config: any = { 
        systemInstruction,
        responseMimeType: "application/json", 
        responseSchema: questionSchema,
    };

    if (options.useGoogleSearch) {
        config.tools = [{googleSearch: {}}];
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: config,
    });

    const questionData = parseJsonResponse<any>(response.text, 'generateQuestion');
    const type = questionData.type?.toUpperCase() === 'MULTIPLE_CHOICE' ? QuestionType.MULTIPLE_CHOICE : QuestionType.PARAGRAPH;
    return { ...questionData, type, choices: type === QuestionType.MULTIPLE_CHOICE ? questionData.choices : undefined } as Question;
};

export const suggestOptionalModule = async (answers: Answer[]): Promise<{ isNeeded: boolean, moduleId?: string, reason?: string }> => {
    const history = answers.map(a => `Q: ${a.questionId}\nA: ${a.value}`).join('\n\n');
    const prompt = `Analyze the user's answers. Determine if they exhibit a strong need for a specific, short optional module on one of these topics: 'transition-management' (fear of change, uncertainty), 'self-confidence' (self-doubt, impostor syndrome), or 'work-life-balance' (stress, burnout, desire for better balance). Only set isNeeded to true if the signal is clear and strong. The response must be a valid JSON object. Answers: --- ${history} ---`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json", responseSchema: optionalModuleSchema },
    });
    return parseJsonResponse<any>(response.text, 'suggestOptionalModule');
};

export const generateSynthesis = async (lastAnswers: Answer[], userName: string, coachingStyle: CoachingStyle): Promise<{ synthesis: string; confirmationRequest: string }> => {
    const systemInstruction = getSystemInstruction(coachingStyle);
    const history = lastAnswers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    const prompt = `Context: User Name: ${userName}. Task: Act as an attentive coach. Based on the user's last few answers, create a concise, one-sentence summary and formulate a polite question to confirm if your summary is correct. The response MUST be a valid JSON object. Language: French. Last answers: ${history}`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { systemInstruction, responseMimeType: "application/json", responseSchema: synthesisSchema } });
    return parseJsonResponse<{ synthesis: string; confirmationRequest: string }>(response.text, 'generateSynthesis');
};

export const generateSummary = async (answers: Answer[], pkg: Package, userName: string, coachingStyle: CoachingStyle): Promise<Summary> => {
    console.log(`📝 Summary oluşturuluyor: ${answers.length} cevap, ${pkg.name}`);
    const systemInstruction = getSystemInstruction(coachingStyle);
    const fullTranscript = answers.map(a => `Question ID: ${a.questionId}\nAnswer: ${a.value}`).join('\n\n');
    
    // Transcript çok uzunsa kısalt (max 10000 karakter)
    const maxTranscriptLength = 10000;
    const truncatedTranscript = fullTranscript.length > maxTranscriptLength 
        ? fullTranscript.substring(0, maxTranscriptLength) + '\n\n[... transcript tronqué pour optimiser la génération ...]'
        : fullTranscript;
    
    const prompt = `Context: User Name: ${userName}, Package: ${pkg.name}, Transcript: ${truncatedTranscript}. Task: Analyze the transcript and generate a comprehensive summary in French. The response MUST be a valid JSON object conforming to the schema. For 'keyStrengths' and 'areasForDevelopment', each point MUST include a 'sources' array with 1-3 direct quotes from the user's answers that justify this point. For 'actionPlan', each item must have a unique 'id' and 'text'.`;
    
    try {
        console.log('🤖 Gemini API çağrılıyor (gemini-2.5-pro)...');
        
        // Retry mekanizması: 503 (overload) ve 429 (quota) hatalarında retry
        let lastError: any = null;
        let retries = 3;
        let response: any = null;
        
        while (retries > 0) {
            try {
                response = await ai.models.generateContent({ 
                    model: 'gemini-2.5-pro', 
                    contents: prompt, 
                    config: { 
                        systemInstruction, 
                        responseMimeType: "application/json", 
                        responseSchema: summarySchema 
                    } 
                });
                break; // Başarılı, döngüden çık
            } catch (error: any) {
                lastError = error;
                const errorCode = error?.error?.code || error?.code;
                const errorStatus = error?.error?.status || error?.status;
                
                // 503 (overload) veya 429 (quota) hatası ise retry
                if ((errorCode === 503 || errorStatus === 'UNAVAILABLE' || errorCode === 429 || errorStatus === 'RESOURCE_EXHAUSTED') && retries > 1) {
                    const retryDelay = error?.error?.details?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay || '30s';
                    const delayMs = parseInt(retryDelay.replace('s', '')) * 1000 || 30000;
                    
                    console.log(`⚠️ Gemini API hatası (${errorCode}), ${retries - 1} retry kaldı. ${delayMs}ms bekleniyor...`);
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                    retries--;
                } else {
                    // Retry edilemeyecek hata veya retry bitti
                    throw error;
                }
            }
        }
        
        if (!response) {
            throw lastError || new Error('Gemini API yanıt alamadı');
        }
        
        console.log('✅ Gemini API yanıt aldı, parsing...');
        const summaryData = parseJsonResponse<any>(response.text, 'generateSummary');
        const processActionPlan = (items: any[]): ActionPlanItem[] => items.map(item => ({...item, completed: false}));
        
        // Ensure actionPlan exists and has the correct structure before processing
        if (summaryData.actionPlan && summaryData.actionPlan.shortTerm && summaryData.actionPlan.mediumTerm) {
            console.log('✅ Summary başarıyla oluşturuldu');
            return { ...summaryData, actionPlan: { shortTerm: processActionPlan(summaryData.actionPlan.shortTerm), mediumTerm: processActionPlan(summaryData.actionPlan.mediumTerm) } };
        }
        // Fallback if the AI fails to generate the action plan correctly
        console.warn('⚠️ Action plan eksik, fallback kullanılıyor');
        return { ...summaryData, actionPlan: { shortTerm: [], mediumTerm: [] } };
    } catch (error) {
        console.error('❌ generateSummary hatası:', error);
        throw error;
    }
};

export const findResourceLeads = async (actionItemText: string): Promise<{ searchKeywords: string[], resourceTypes: string[], platformExamples: string[] }> => {
    const prompt = `Context: A user has the following action item in their career plan: "${actionItemText}". Task: Your role is to be a helpful guide, not to do the work for them. To empower their research, provide a list of research leads. The response must be in French and be a valid JSON object conforming to the schema.
    1.  searchKeywords: Suggest 3-5 precise keywords they should use for searching.
    2.  resourceTypes: Suggest 2-4 types of resources to look for (e.g., 'MOOCs', 'Livres blancs', 'Podcasts spécialisés').
    3.  platformExamples: Suggest 2-3 example platforms where these resources can be found.
    This helps the user to start their own research effectively.`;
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: resourceLeadsSchema } });
    return parseJsonResponse<any>(response.text, 'findResourceLeads');
};