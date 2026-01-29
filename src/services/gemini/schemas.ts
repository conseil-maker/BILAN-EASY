/**
 * Schémas JSON pour les réponses de l'API Gemini
 * Ces schémas définissent la structure attendue des réponses générées
 */

// Type helper pour les schémas (compatible avec @google/genai)
const Type = {
  STRING: 'STRING' as const,
  NUMBER: 'NUMBER' as const,
  BOOLEAN: 'BOOLEAN' as const,
  OBJECT: 'OBJECT' as const,
  ARRAY: 'ARRAY' as const,
};

export { Type };

export const questionSchema = {
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

export const synthesisSchema = {
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

export const summarySchema = {
  type: Type.OBJECT,
  properties: {
    profileType: { type: Type.STRING, description: "A descriptive title for the user's professional profile in French (e.g., 'Le Spécialiste en Transition', 'Le Leader Créatif')." },
    priorityThemes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An array of 3-5 main themes that emerged during the assessment." },
    maturityLevel: { type: Type.STRING, description: "A sentence describing the user's level of clarity regarding their career project in French." },
    keyStrengths: { type: Type.ARRAY, items: summaryPointSchema, description: "A list of 3-5 key strengths identified with sources." },
    areasForDevelopment: { type: Type.ARRAY, items: summaryPointSchema, description: "A list of 2-4 areas for development with sources." },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 3-4 general recommendations in French." },
    // Champs enrichis pour la synthèse Qualiopi
    strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Simple list of 3-5 key strengths as strings for PDF synthesis." },
    skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 4-6 professional skills identified during the assessment." },
    motivations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 main professional motivations identified." },
    values: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3-5 professional values important to the user." },
    areasToImprove: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Simple list of 2-4 areas to improve as strings for PDF synthesis." },
    projectProfessionnel: { type: Type.STRING, description: "A 2-3 sentence description of the user's professional project based on the assessment." },
    actionPlan: {
      type: Type.OBJECT,
      properties: {
        shortTerm: { type: Type.ARRAY, items: actionPlanItemSchema, description: "2-3 concrete action items for the next 1-3 months." },
        mediumTerm: { type: Type.ARRAY, items: actionPlanItemSchema, description: "2-3 action items for the next 3-6 months." },
        longTerm: { type: Type.ARRAY, items: actionPlanItemSchema, description: "1-2 action items for 6+ months." }
      },
      required: ["shortTerm", "mediumTerm"]
    }
  },
  required: ["profileType", "priorityThemes", "maturityLevel", "keyStrengths", "areasForDevelopment", "recommendations", "actionPlan", "strengths", "skills", "motivations", "values", "areasToImprove", "projectProfessionnel"]
};

export const userProfileSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING, description: "The user's full name, if available." },
    currentRole: { type: Type.STRING, description: "The user's most recent or current job title." },
    keySkills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of the most prominent skills mentioned." },
    pastExperiences: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A brief summary of key past experiences or companies." }
  },
  required: ["currentRole", "keySkills", "pastExperiences"]
};

export const dashboardDataSchema = {
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

export const optionalModuleSchema = {
  type: Type.OBJECT,
  properties: {
    isNeeded: { type: Type.BOOLEAN, description: "Set to true only if a strong, specific user need is detected." },
    moduleId: { type: Type.STRING, enum: ["transition-management", "self-confidence", "work-life-balance"], description: "The ID of the suggested module if needed." },
    reason: { type: Type.STRING, description: "A short, polite sentence in French explaining why this module is suggested." }
  },
  required: ["isNeeded"],
};

// Schémas pour l'exploration de carrière
export const careerExplorationSchema = {
  type: Type.OBJECT,
  properties: {
    paths: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          matchScore: { type: Type.NUMBER },
          transitionDifficulty: { type: Type.STRING, enum: ['Facile', 'Modérée', 'Difficile'] },
          timeToTransition: { type: Type.STRING }
        },
        required: ["title", "description", "requiredSkills", "matchScore", "transitionDifficulty", "timeToTransition"]
      }
    },
    summary: { type: Type.STRING },
    nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["paths", "summary", "nextSteps"]
};

export const responseAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    isOffTopic: { type: Type.BOOLEAN },
    needsRedirection: { type: Type.BOOLEAN },
    suggestedAction: { type: Type.STRING, enum: ['continue', 'redirect', 'clarify', 'acknowledge'] },
    reason: { type: Type.STRING }
  },
  required: ["isOffTopic", "needsRedirection", "suggestedAction"]
};
