/**
 * SessionContext - Contexte React pour centraliser l'état de session du bilan
 * 
 * Ce contexte remplace la gestion d'état dispersée entre ClientApp, Questionnaire et les services.
 * Il fournit un accès unifié à l'état de la session et aux actions pour le modifier.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { Package, Answer, Summary, CoachingStyle, UserProfile, Message } from '../types';
import { loadSession, saveSession, clearSession, SessionData, QuestionData } from '../services/sessionService';
import { PACKAGES } from '../constants';

// ============================================
// TYPES
// ============================================

/**
 * États possibles de l'application bilan
 */
export type AppState = 
  | 'loading'           // Chargement initial
  | 'package-selection' // Sélection du forfait
  | 'preliminary'       // Phase préliminaire Qualiopi
  | 'personalization'   // Personnalisation (CV/LinkedIn)
  | 'questionnaire'     // Questionnaire IA
  | 'completion'        // Bilan terminé
  | 'satisfaction';     // Questionnaire de satisfaction

/**
 * Données de consentement Qualiopi
 */
export interface ConsentData {
  objectivesAccepted: boolean;
  methodologyAccepted: boolean;
  consentGiven: boolean;
  voluntaryParticipation: boolean;
  confidentialityUnderstood: boolean;
  dataProcessingAccepted: boolean;
  signatureDate: string;
}

/**
 * État complet de la session
 */
export interface SessionState {
  // État de l'application
  appState: AppState;
  isLoading: boolean;
  error: string | null;
  
  // Utilisateur
  user: User | null;
  userName: string;
  
  // Configuration du bilan
  selectedPackage: Package | null;
  coachingStyle: CoachingStyle;
  userProfile: UserProfile | null;
  consentData: ConsentData | null;
  
  // Progression du questionnaire
  answers: Answer[];
  questions: QuestionData[];
  messages: Message[];
  currentPhase: string;
  progress: number;
  timeSpent: number;
  startDate: string;
  lastAiMessage: string;
  
  // Résultats
  summary: Summary | null;
}

/**
 * Actions disponibles pour modifier l'état
 */
export interface SessionActions {
  // Navigation
  setAppState: (state: AppState) => void;
  goToPackageSelection: () => void;
  goToPreliminary: () => void;
  goToPersonalization: () => void;
  goToQuestionnaire: () => void;
  goToCompletion: () => void;
  
  // Configuration
  selectPackage: (pkg: Package) => void;
  setCoachingStyle: (style: CoachingStyle) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setConsentData: (consent: ConsentData) => void;
  
  // Questionnaire
  addAnswer: (answer: Answer) => void;
  addQuestion: (question: QuestionData) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateProgress: (progress: number, phase: string, timeSpent: number) => void;
  setLastAiMessage: (message: string) => void;
  
  // Résultats
  completeBilan: (summary: Summary) => void;
  
  // Session
  startNewBilan: () => Promise<void>;
  saveCurrentSession: () => Promise<void>;
  clearError: () => void;
}

/**
 * Type complet du contexte
 */
export interface SessionContextType extends SessionState, SessionActions {}

// ============================================
// CONTEXTE
// ============================================

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface SessionProviderProps {
  user: User;
  children: ReactNode;
}

/**
 * Provider du contexte de session
 * Gère l'état global de la session de bilan et la synchronisation avec Supabase
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({ user, children }) => {
  // État initial
  const [state, setState] = useState<SessionState>({
    appState: 'loading',
    isLoading: true,
    error: null,
    user,
    userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
    selectedPackage: null,
    coachingStyle: 'collaborative',
    userProfile: null,
    consentData: null,
    answers: [],
    questions: [],
    messages: [],
    currentPhase: 'preliminary',
    progress: 0,
    timeSpent: 0,
    startDate: new Date().toISOString(),
    lastAiMessage: '',
    summary: null,
  });

  // ============================================
  // CHARGEMENT INITIAL DE LA SESSION
  // ============================================
  
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = await loadSession(user.id);
        
        if (session) {
          // Session existante trouvée - restaurer l'état
          const pkg = session.selected_package_id 
            ? PACKAGES.find(p => p.id === session.selected_package_id) || null
            : null;
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            appState: (session.app_state as AppState) || 'package-selection',
            userName: session.user_name || prev.userName,
            selectedPackage: pkg,
            coachingStyle: session.coaching_style || 'collaborative',
            userProfile: session.user_profile || null,
            consentData: session.consent_data || null,
            answers: session.current_answers || [],
            questions: session.current_questions || [],
            currentPhase: session.current_phase || 'preliminary',
            progress: session.progress || 0,
            timeSpent: session.time_spent || 0,
            startDate: session.start_date || new Date().toISOString(),
            lastAiMessage: session.last_ai_message || '',
          }));
        } else {
          // Pas de session - démarrer à la sélection du forfait
          setState(prev => ({
            ...prev,
            isLoading: false,
            appState: 'package-selection',
          }));
        }
      } catch (error) {
        console.error('[SessionContext] Erreur chargement session:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          appState: 'package-selection',
          error: 'Erreur lors du chargement de la session',
        }));
      }
    };

    initSession();
  }, [user.id, user.user_metadata?.full_name, user.email]);

  // ============================================
  // SAUVEGARDE AUTOMATIQUE
  // ============================================
  
  // Sauvegarder la session à chaque changement significatif
  useEffect(() => {
    if (state.appState !== 'loading' && !state.isLoading) {
      const saveDebounced = setTimeout(() => {
        saveSession(user.id, {
          app_state: state.appState,
          user_name: state.userName,
          selected_package_id: state.selectedPackage?.id || null,
          coaching_style: state.coachingStyle,
          current_answers: state.answers,
          current_questions: state.questions,
          last_ai_message: state.lastAiMessage,
          current_phase: state.currentPhase,
          progress: state.progress,
          start_date: state.startDate,
          time_spent: state.timeSpent,
          consent_data: state.consentData,
          user_profile: state.userProfile,
        });
      }, 1000); // Debounce de 1 seconde

      return () => clearTimeout(saveDebounced);
    }
  }, [
    user.id,
    state.appState,
    state.userName,
    state.selectedPackage,
    state.coachingStyle,
    state.answers,
    state.questions,
    state.lastAiMessage,
    state.currentPhase,
    state.progress,
    state.timeSpent,
    state.consentData,
    state.userProfile,
    state.isLoading,
  ]);

  // ============================================
  // ACTIONS - NAVIGATION
  // ============================================
  
  const setAppState = useCallback((appState: AppState) => {
    setState(prev => ({ ...prev, appState }));
  }, []);

  const goToPackageSelection = useCallback(() => {
    setState(prev => ({ ...prev, appState: 'package-selection' }));
  }, []);

  const goToPreliminary = useCallback(() => {
    setState(prev => ({ ...prev, appState: 'preliminary' }));
  }, []);

  const goToPersonalization = useCallback(() => {
    setState(prev => ({ ...prev, appState: 'personalization' }));
  }, []);

  const goToQuestionnaire = useCallback(() => {
    setState(prev => ({ ...prev, appState: 'questionnaire' }));
  }, []);

  const goToCompletion = useCallback(() => {
    setState(prev => ({ ...prev, appState: 'completion' }));
  }, []);

  // ============================================
  // ACTIONS - CONFIGURATION
  // ============================================
  
  const selectPackage = useCallback((pkg: Package) => {
    setState(prev => ({ 
      ...prev, 
      selectedPackage: pkg, 
      appState: 'preliminary' 
    }));
  }, []);

  const setCoachingStyle = useCallback((coachingStyle: CoachingStyle) => {
    setState(prev => ({ ...prev, coachingStyle }));
  }, []);

  const setUserProfile = useCallback((userProfile: UserProfile | null) => {
    setState(prev => ({ ...prev, userProfile }));
  }, []);

  const setConsentData = useCallback((consentData: ConsentData) => {
    setState(prev => ({ ...prev, consentData }));
  }, []);

  // ============================================
  // ACTIONS - QUESTIONNAIRE
  // ============================================
  
  const addAnswer = useCallback((answer: Answer) => {
    setState(prev => ({ 
      ...prev, 
      answers: [...prev.answers, answer] 
    }));
  }, []);

  const addQuestion = useCallback((question: QuestionData) => {
    setState(prev => ({ 
      ...prev, 
      questions: [...prev.questions, question] 
    }));
  }, []);

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, message] 
    }));
  }, []);

  const setMessages = useCallback((messages: Message[]) => {
    setState(prev => ({ ...prev, messages }));
  }, []);

  const updateProgress = useCallback((progress: number, currentPhase: string, timeSpent: number) => {
    setState(prev => ({ 
      ...prev, 
      progress, 
      currentPhase, 
      timeSpent 
    }));
  }, []);

  const setLastAiMessage = useCallback((lastAiMessage: string) => {
    setState(prev => ({ ...prev, lastAiMessage }));
  }, []);

  // ============================================
  // ACTIONS - RÉSULTATS
  // ============================================
  
  const completeBilan = useCallback((summary: Summary) => {
    setState(prev => ({ 
      ...prev, 
      summary, 
      appState: 'completion' 
    }));
  }, []);

  // ============================================
  // ACTIONS - SESSION
  // ============================================
  
  const startNewBilan = useCallback(async () => {
    try {
      await clearSession(user.id);
      setState(prev => ({
        ...prev,
        appState: 'package-selection',
        selectedPackage: null,
        coachingStyle: 'collaborative',
        userProfile: null,
        consentData: null,
        answers: [],
        questions: [],
        messages: [],
        currentPhase: 'preliminary',
        progress: 0,
        timeSpent: 0,
        startDate: new Date().toISOString(),
        lastAiMessage: '',
        summary: null,
        error: null,
      }));
    } catch (error) {
      console.error('[SessionContext] Erreur démarrage nouveau bilan:', error);
      setState(prev => ({
        ...prev,
        error: 'Erreur lors du démarrage d\'un nouveau bilan',
      }));
    }
  }, [user.id]);

  const saveCurrentSession = useCallback(async () => {
    try {
      await saveSession(user.id, {
        app_state: state.appState,
        user_name: state.userName,
        selected_package_id: state.selectedPackage?.id || null,
        coaching_style: state.coachingStyle,
        current_answers: state.answers,
        current_questions: state.questions,
        last_ai_message: state.lastAiMessage,
        current_phase: state.currentPhase,
        progress: state.progress,
        start_date: state.startDate,
        time_spent: state.timeSpent,
        consent_data: state.consentData,
        user_profile: state.userProfile,
      });
    } catch (error) {
      console.error('[SessionContext] Erreur sauvegarde session:', error);
    }
  }, [user.id, state]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // ============================================
  // VALEUR DU CONTEXTE
  // ============================================
  
  const value = useMemo<SessionContextType>(() => ({
    // État
    ...state,
    
    // Actions - Navigation
    setAppState,
    goToPackageSelection,
    goToPreliminary,
    goToPersonalization,
    goToQuestionnaire,
    goToCompletion,
    
    // Actions - Configuration
    selectPackage,
    setCoachingStyle,
    setUserProfile,
    setConsentData,
    
    // Actions - Questionnaire
    addAnswer,
    addQuestion,
    addMessage,
    setMessages,
    updateProgress,
    setLastAiMessage,
    
    // Actions - Résultats
    completeBilan,
    
    // Actions - Session
    startNewBilan,
    saveCurrentSession,
    clearError,
  }), [
    state,
    setAppState,
    goToPackageSelection,
    goToPreliminary,
    goToPersonalization,
    goToQuestionnaire,
    goToCompletion,
    selectPackage,
    setCoachingStyle,
    setUserProfile,
    setConsentData,
    addAnswer,
    addQuestion,
    addMessage,
    setMessages,
    updateProgress,
    setLastAiMessage,
    completeBilan,
    startNewBilan,
    saveCurrentSession,
    clearError,
  ]);

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
};

// ============================================
// HOOK PERSONNALISÉ
// ============================================

/**
 * Hook pour accéder au contexte de session
 * @throws Error si utilisé en dehors du SessionProvider
 */
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession doit être utilisé à l\'intérieur d\'un SessionProvider');
  }
  return context;
};

/**
 * Hook pour accéder uniquement à l'état de la session (sans les actions)
 * Utile pour les composants qui n'ont besoin que de lire l'état
 */
export const useSessionState = (): SessionState => {
  const context = useSession();
  return {
    appState: context.appState,
    isLoading: context.isLoading,
    error: context.error,
    user: context.user,
    userName: context.userName,
    selectedPackage: context.selectedPackage,
    coachingStyle: context.coachingStyle,
    userProfile: context.userProfile,
    consentData: context.consentData,
    answers: context.answers,
    questions: context.questions,
    messages: context.messages,
    currentPhase: context.currentPhase,
    progress: context.progress,
    timeSpent: context.timeSpent,
    startDate: context.startDate,
    lastAiMessage: context.lastAiMessage,
    summary: context.summary,
  };
};

/**
 * Hook pour accéder uniquement aux actions de la session
 * Utile pour les composants qui n'ont besoin que de modifier l'état
 */
export const useSessionActions = (): SessionActions => {
  const context = useSession();
  return {
    setAppState: context.setAppState,
    goToPackageSelection: context.goToPackageSelection,
    goToPreliminary: context.goToPreliminary,
    goToPersonalization: context.goToPersonalization,
    goToQuestionnaire: context.goToQuestionnaire,
    goToCompletion: context.goToCompletion,
    selectPackage: context.selectPackage,
    setCoachingStyle: context.setCoachingStyle,
    setUserProfile: context.setUserProfile,
    setConsentData: context.setConsentData,
    addAnswer: context.addAnswer,
    addQuestion: context.addQuestion,
    addMessage: context.addMessage,
    setMessages: context.setMessages,
    updateProgress: context.updateProgress,
    setLastAiMessage: context.setLastAiMessage,
    completeBilan: context.completeBilan,
    startNewBilan: context.startNewBilan,
    saveCurrentSession: context.saveCurrentSession,
    clearError: context.clearError,
  };
};

export default SessionContext;
