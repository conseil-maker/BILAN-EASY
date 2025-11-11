import { z } from 'zod';

// Schema pour créer un assessment
export const createAssessmentSchema = z.object({
  userName: z.string().min(1, 'User name is required').max(255),
  packageId: z.enum(['decouverte', 'approfondi', 'strategique']),
  packageName: z.string().min(1).max(255),
  coachingStyle: z.enum(['collaborative', 'analytic', 'creative']),
  totalQuestions: z.number().int().positive(),
  userProfile: z.object({
    fullName: z.string().optional(),
    currentRole: z.string(),
    keySkills: z.array(z.string()),
    pastExperiences: z.array(z.string()),
  }).optional(),
});

// Schema pour mettre à jour un assessment
export const updateAssessmentSchema = z.object({
  status: z.enum(['in_progress', 'completed', 'abandoned']).optional(),
  currentQuestionIndex: z.number().int().min(0).optional(),
  lastActivityAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  dashboardData: z.object({
    themes: z.array(z.object({
      text: z.string(),
      weight: z.number(),
    })),
    skills: z.array(z.object({
      label: z.string(),
      score: z.number(),
    })),
  }).optional(),
});

// Schema pour créer une answer
export const createAnswerSchema = z.object({
  questionId: z.string().min(1).max(255),
  questionTitle: z.string().min(1),
  questionDescription: z.string().optional(), // Soru açıklaması
  questionType: z.enum(['PARAGRAPH', 'MULTIPLE_CHOICE']),
  questionTheme: z.string().optional(),
  questionChoices: z.array(z.string()).optional(), // Multiple choice seçenekleri
  value: z.string().min(1),
});

// Schema pour créer une summary
export const createSummarySchema = z.object({
  profileType: z.string().min(1).max(255),
  priorityThemes: z.array(z.string()),
  maturityLevel: z.string().min(1),
  keyStrengths: z.array(z.object({
    text: z.string(),
    sources: z.array(z.string()),
  })),
  areasForDevelopment: z.array(z.object({
    text: z.string(),
    sources: z.array(z.string()),
  })),
  recommendations: z.array(z.string()),
  actionPlan: z.object({
    shortTerm: z.array(z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean().optional(),
    })),
    mediumTerm: z.array(z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean().optional(),
    })),
  }),
});

// Schema pour satisfaction rating
export const createSatisfactionSchema = z.object({
  phaseName: z.string().min(1).max(255),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

// Schema pour module
export const createModuleSchema = z.object({
  moduleId: z.enum(['transition-management', 'self-confidence', 'work-life-balance']),
  reason: z.string().min(1),
  accepted: z.boolean(),
});
