/**
 * Hook personnalisé pour la gestion d'état du questionnaire
 * Centralise la logique d'état complexe du composant Questionnaire
 */

import React, { useState, useCallback } from 'react';
import { 
  Answer, 
  Question, 
  Message, 
  CurrentPhaseInfo, 
  DashboardData,
  CoachingStyle 
} from '../types';
import { CareerPath, ExplorationNeedResult, ResponseAnalysisResult } from '../services/geminiService';

export interface QuestionnaireState {
  // États de base
  messages: Message[];
  answers: Answer[];
  currentQuestion: Question | null;
  isLoading: boolean;
  isSummarizing: boolean;
  currentPhaseInfo: CurrentPhaseInfo | null;
  textInput: string;
  
  // États UI
  showSettings: boolean;
  showSaveNotification: boolean;
  showSatisfactionModal: boolean;
  showLogoutModal: boolean;
  showHelpModal: boolean;
  showSidePanel: boolean;
  
  // États de synthèse
  satisfactionPhaseInfo: CurrentPhaseInfo | null;
  isAwaitingSynthesisConfirmation: boolean;
  synthesisConfirmed: boolean | null;
  
  // États du dashboard
  dashboardData: DashboardData | null;
  isDashboardLoading: boolean;
  
  // États des modules et badges
  unlockedBadge: string | null;
  suggestedModule: { id: string; reason: string } | null;
  activeModule: string | null;
  moduleQuestionCount: number;
  declinedModules: Set<string>;
  satisfactionSubmittedPhases: Set<number>;
  
  // États de progression
  lastSaveTime: Date | null;
  categoryProgress: Map<string, number>;
  currentCategoryId: string | null;
  bilanStartTime: number;
  
  // États d'exploration de carrière
  showCareerExploration: boolean;
  careerExplorationOffered: boolean;
  showCareerExplorationProposal: boolean;
  explorationNeedResult: ExplorationNeedResult | null;
  validatedCareerPaths: CareerPath[];
  
  // États de fin de bilan
  showEndWarning: boolean;
  endWarningShown: boolean;
  showEndConfirmation: boolean;
  userWantsToDeepen: boolean;
  
  // États hors-cadre
  showOutOfScopeModal: boolean;
  outOfScopeAnalysis: ResponseAnalysisResult | null;
  
  // États d'exploration du marché
  showMarketExploration: boolean;
  marketExplorationData: unknown | null;
  showJobInterview: boolean;
  jobInterviewData: unknown | null;
}

export interface QuestionnaireActions {
  // Actions de base
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setAnswers: React.Dispatch<React.SetStateAction<Answer[]>>;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<Question | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSummarizing: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentPhaseInfo: React.Dispatch<React.SetStateAction<CurrentPhaseInfo | null>>;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  
  // Actions UI
  toggleSettings: () => void;
  toggleSidePanel: () => void;
  showNotification: (type: 'save' | 'badge', data?: string) => void;
  
  // Actions de module
  acceptModule: (moduleId: string) => void;
  declineModule: (moduleId: string) => void;
  
  // Actions de carrière
  startCareerExploration: () => void;
  validateCareerPath: (path: CareerPath) => void;
  
  // Actions de fin
  confirmEndBilan: () => void;
  requestDeepening: () => void;
  
  // Reset
  resetState: () => void;
}

const initialState: QuestionnaireState = {
  messages: [],
  answers: [],
  currentQuestion: null,
  isLoading: true,
  isSummarizing: false,
  currentPhaseInfo: null,
  textInput: '',
  
  showSettings: false,
  showSaveNotification: false,
  showSatisfactionModal: false,
  showLogoutModal: false,
  showHelpModal: false,
  showSidePanel: true,
  
  satisfactionPhaseInfo: null,
  isAwaitingSynthesisConfirmation: false,
  synthesisConfirmed: null,
  
  dashboardData: null,
  isDashboardLoading: false,
  
  unlockedBadge: null,
  suggestedModule: null,
  activeModule: null,
  moduleQuestionCount: 0,
  declinedModules: new Set(),
  satisfactionSubmittedPhases: new Set(),
  
  lastSaveTime: null,
  categoryProgress: new Map(),
  currentCategoryId: null,
  bilanStartTime: Date.now(),
  
  showCareerExploration: false,
  careerExplorationOffered: false,
  showCareerExplorationProposal: false,
  explorationNeedResult: null,
  validatedCareerPaths: [],
  
  showEndWarning: false,
  endWarningShown: false,
  showEndConfirmation: false,
  userWantsToDeepen: false,
  
  showOutOfScopeModal: false,
  outOfScopeAnalysis: null,
  
  showMarketExploration: false,
  marketExplorationData: null,
  showJobInterview: false,
  jobInterviewData: null,
};

export function useQuestionnaireState(
  initialAnswers?: Answer[]
): [QuestionnaireState, QuestionnaireActions] {
  // États de base
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers || []);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [currentPhaseInfo, setCurrentPhaseInfo] = useState<CurrentPhaseInfo | null>(null);
  const [textInput, setTextInput] = useState('');
  
  // États UI
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  
  // États de synthèse
  const [satisfactionPhaseInfo, setSatisfactionPhaseInfo] = useState<CurrentPhaseInfo | null>(null);
  const [isAwaitingSynthesisConfirmation, setIsAwaitingSynthesisConfirmation] = useState(false);
  const [synthesisConfirmed, setSynthesisConfirmed] = useState<boolean | null>(null);
  
  // États du dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(false);
  
  // États des modules et badges
  const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
  const [suggestedModule, setSuggestedModule] = useState<{ id: string; reason: string } | null>(null);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [moduleQuestionCount, setModuleQuestionCount] = useState(0);
  const [declinedModules, setDeclinedModules] = useState<Set<string>>(new Set());
  const [satisfactionSubmittedPhases, setSatisfactionSubmittedPhases] = useState<Set<number>>(new Set());
  
  // États de progression
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [categoryProgress, setCategoryProgress] = useState<Map<string, number>>(new Map());
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
  const [bilanStartTime] = useState<number>(Date.now());
  
  // États d'exploration de carrière
  const [showCareerExploration, setShowCareerExploration] = useState(false);
  const [careerExplorationOffered, setCareerExplorationOffered] = useState(false);
  const [showCareerExplorationProposal, setShowCareerExplorationProposal] = useState(false);
  const [explorationNeedResult, setExplorationNeedResult] = useState<ExplorationNeedResult | null>(null);
  const [validatedCareerPaths, setValidatedCareerPaths] = useState<CareerPath[]>([]);
  
  // États de fin de bilan
  const [showEndWarning, setShowEndWarning] = useState(false);
  const [endWarningShown, setEndWarningShown] = useState(false);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [userWantsToDeepen, setUserWantsToDeepen] = useState(false);
  
  // États hors-cadre
  const [showOutOfScopeModal, setShowOutOfScopeModal] = useState(false);
  const [outOfScopeAnalysis, setOutOfScopeAnalysis] = useState<ResponseAnalysisResult | null>(null);
  
  // États d'exploration du marché
  const [showMarketExploration, setShowMarketExploration] = useState(false);
  const [marketExplorationData, setMarketExplorationData] = useState<unknown | null>(null);
  const [showJobInterview, setShowJobInterview] = useState(false);
  const [jobInterviewData, setJobInterviewData] = useState<unknown | null>(null);

  // Actions
  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const toggleSidePanel = useCallback(() => {
    setShowSidePanel(prev => !prev);
  }, []);

  const showNotification = useCallback((type: 'save' | 'badge', data?: string) => {
    if (type === 'save') {
      setShowSaveNotification(true);
      setLastSaveTime(new Date());
      setTimeout(() => setShowSaveNotification(false), 3000);
    } else if (type === 'badge' && data) {
      setUnlockedBadge(data);
      setTimeout(() => setUnlockedBadge(null), 5000);
    }
  }, []);

  const acceptModule = useCallback((moduleId: string) => {
    setActiveModule(moduleId);
    setModuleQuestionCount(0);
    setSuggestedModule(null);
  }, []);

  const declineModule = useCallback((moduleId: string) => {
    setDeclinedModules(prev => new Set(prev).add(moduleId));
    setSuggestedModule(null);
  }, []);

  const startCareerExploration = useCallback(() => {
    setShowCareerExploration(true);
    setShowCareerExplorationProposal(false);
  }, []);

  const validateCareerPath = useCallback((path: CareerPath) => {
    setValidatedCareerPaths(prev => [...prev, path]);
  }, []);

  const confirmEndBilan = useCallback(() => {
    setShowEndConfirmation(false);
    setIsSummarizing(true);
  }, []);

  const requestDeepening = useCallback(() => {
    setShowEndConfirmation(false);
    setUserWantsToDeepen(true);
  }, []);

  const resetState = useCallback(() => {
    setMessages([]);
    setAnswers([]);
    setCurrentQuestion(null);
    setIsLoading(true);
    setTextInput('');
    setDashboardData(null);
    setValidatedCareerPaths([]);
  }, []);

  const state: QuestionnaireState = {
    messages,
    answers,
    currentQuestion,
    isLoading,
    isSummarizing,
    currentPhaseInfo,
    textInput,
    showSettings,
    showSaveNotification,
    showSatisfactionModal,
    showLogoutModal,
    showHelpModal,
    showSidePanel,
    satisfactionPhaseInfo,
    isAwaitingSynthesisConfirmation,
    synthesisConfirmed,
    dashboardData,
    isDashboardLoading,
    unlockedBadge,
    suggestedModule,
    activeModule,
    moduleQuestionCount,
    declinedModules,
    satisfactionSubmittedPhases,
    lastSaveTime,
    categoryProgress,
    currentCategoryId,
    bilanStartTime,
    showCareerExploration,
    careerExplorationOffered,
    showCareerExplorationProposal,
    explorationNeedResult,
    validatedCareerPaths,
    showEndWarning,
    endWarningShown,
    showEndConfirmation,
    userWantsToDeepen,
    showOutOfScopeModal,
    outOfScopeAnalysis,
    showMarketExploration,
    marketExplorationData,
    showJobInterview,
    jobInterviewData,
  };

  const actions: QuestionnaireActions = {
    setMessages,
    setAnswers,
    setCurrentQuestion,
    setIsLoading,
    setIsSummarizing,
    setCurrentPhaseInfo,
    setTextInput,
    toggleSettings,
    toggleSidePanel,
    showNotification,
    acceptModule,
    declineModule,
    startCareerExploration,
    validateCareerPath,
    confirmEndBilan,
    requestDeepening,
    resetState,
  };

  return [state, actions];
}

export default useQuestionnaireState;
