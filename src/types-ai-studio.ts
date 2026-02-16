import type { ReactNode } from 'react';

export enum QuestionType {
  PARAGRAPH = 'PARAGRAPH',
  MULTIPLE_CHOICE = 'multiple_choice',
}

export type CoachingStyle = 'collaborative' | 'analytic' | 'creative';

export interface Question {
  id: string;
  title: string;
  description?: string;
  type: QuestionType;
  theme: string;
  choices?: string[];
  options?: string[];
  category?: string;
  phase?: string;
  isRequired?: boolean;
  order?: number;
  required: boolean;
}

export interface Answer {
  questionId: string;
  questionTitle?: string; // Titre de la question pour éviter les répétitions
  value: string;
  text?: string; // Alias de value pour compatibilité
  complexity?: QuestionComplexity;
  categoryId?: string;
  timestamp?: number;
  question?: string; // Texte de la question (utilisé dans syntheseServiceEnriched)
}

export interface Phase {
  questionnaires: number;
  duration_min: number;
  name: string;
}

export type QuestionComplexity = 'simple' | 'moyenne' | 'complexe' | 'reflexion';

export interface CategoryProgress {
  categoryId: string;
  questionsAsked: number;
  timeSpent: number;
}

export interface QuestionEstimate {
  min: number;
  target: number;
  max: number;
}

export interface Package {
  id: string;
  name: string;
  totalHours: number;
  totalQuestionnaires: number;
  description: string;
  features: string[];
  phases: {
    phase1: Phase;
    phase2: Phase;
    phase3: Phase;
  };
  timeBudget: {
    total: number;
    phase1: number;
    phase2: number;
    phase3: number;
  };
  questionEstimates?: {
    phase1: QuestionEstimate;
    phase2: QuestionEstimate;
    phase3: QuestionEstimate;
    total: QuestionEstimate;
  };
  price?: number;
  priceLabel?: string;
}

export interface Message {
  sender: 'user' | 'ai';
  text: string | ReactNode;
  question?: Question;
  isSynthesis?: boolean;
  isLoading?: boolean;
  isError?: boolean;
}

export interface CurrentPhaseInfo {
  phase: number;
  name: string;
  positionInPhase: number;
  totalInPhase: number;
  satisfactionActive: boolean;
}

export interface SummaryPoint {
  text: string;
  sources: string[];
}

export interface ActionPlanItem {
  id: string;
  text: string;
  completed: boolean;
  findLeadsLabel?: string;
  priority?: string;
  deadline?: string;
}

export interface Summary {
  profileType: string;
  priorityThemes: string[];
  maturityLevel: string;
  keyStrengths: SummaryPoint[];
  areasForDevelopment: SummaryPoint[];
  recommendations: string[];
  // Champs enrichis pour la synthèse Qualiopi
  strengths?: string[]; // Liste simple des forces
  skills?: string[]; // Compétences professionnelles
  motivations?: string[]; // Motivations principales
  values?: string[]; // Valeurs professionnelles
  areasToImprove?: string[]; // Axes de développement (liste simple)
  projectProfessionnel?: string; // Description du projet professionnel
  transferableSkills?: string[]; // Compétences transférables
  actionPlan: {
    shortTerm: ActionPlanItem[];
    mediumTerm: ActionPlanItem[];
    longTerm?: ActionPlanItem[]; // Actions à long terme (optionnel)
  };
  competences?: string[]; // Compétences identifiées
}

export interface HistoryItem {
  id: string;
  date: string;
  userName: string;
  packageName: string;
  summary: Summary;
  answers: Answer[];
  status?: 'in_progress' | 'completed' | 'draft';
}

export interface WordCloudItem {
  text: string;
  weight: number;
  name?: string; // Nom du thème (utilisé dans pdfGenerator)
  description?: string; // Description du thème
  keywords?: string[]; // Mots-clés associés
}

export interface RadarSkill {
  label: string;
  score: number;
  name?: string; // Nom de la compétence (utilisé dans pdfGenerator)
  level?: number; // Niveau (alias de score)
  description?: string; // Description de la compétence
}

export interface DashboardData {
  themes: WordCloudItem[];
  skills: RadarSkill[];
  summary?: Summary | null;
  wordCloud?: WordCloudItem[];
  radarData?: RadarSkill[];
}

export interface UserProfile {
  fullName: string;
  currentRole: string;
  keySkills: string[];
  pastExperiences: string[];
  cvText?: string;
  profession?: string;
  yearsExperience?: number;
  education?: string;
  skills?: string[];
}
