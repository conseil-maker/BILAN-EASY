/**
 * ClientAppRefactored - Version refactorisée de ClientApp utilisant SessionContext
 * 
 * Ce composant remplace la gestion d'état locale par le contexte centralisé SessionContext.
 * Il est plus maintenable et facilite le partage d'état entre les composants.
 * 
 * @author Manus AI
 * @date 27 janvier 2026
 */

import React, { useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import WelcomeScreen from './WelcomeScreen';
import PackageSelector from './PackageSelector';
import PhasePreliminaireQualiopi, { ConsentData } from './PhasePreliminaireQualiopi';
import PersonalizationStep from './PersonalizationStep';
import Questionnaire from './Questionnaire';
import SummaryDashboard from './SummaryDashboard';
import HistoryScreen from './HistoryScreen';
import { BilanCompletion } from './BilanCompletion';
import { EnhancedNavigation, BilanPhase } from './EnhancedNavigation';
import { PACKAGES } from '../constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from '../types-ai-studio';
import { saveAssessmentToHistory, getLatestCompletedAssessment } from '../services/historyService';
import { clearSession } from '../services/sessionService';
import { calculateProgression } from '../services/progressionService';
import { useToast } from './ToastProvider';
import { useSession, useSessionState, useSessionActions } from '../contexts/SessionContext';

// Types d'état de l'application (compatibles avec l'ancien ClientApp)
type AppState = 'welcome' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'completion' | 'summary' | 'history' | 'view-history-record';

interface ClientAppRefactoredProps {
  user: User;
}

/**
 * Composant principal refactorisé utilisant SessionContext
 */
const ClientAppRefactored: React.FC<ClientAppRefactoredProps> = ({ user }) => {
  // Utiliser le contexte de session
  const session = useSession();
  const state = useSessionState();
  const actions = useSessionActions();
  
  const { showSuccess, showInfo, showError } = useToast();
  
  // États locaux pour les fonctionnalités non gérées par le contexte
  const [viewingRecord, setViewingRecord] = React.useState<HistoryItem | null>(null);
  const [showWelcomeBack, setShowWelcomeBack] = React.useState(false);
  const [resumeInfo, setResumeInfo] = React.useState<{ answersCount: number; lastUpdate: string } | null>(null);
  const [localAppState, setLocalAppState] = React.useState<AppState>('package-selection');
  
  // Synchroniser l'état local avec le contexte
  useEffect(() => {
    if (!state.isLoading) {
      // Mapper les états du contexte vers les états locaux
      const stateMapping: Record<string, AppState> = {
        'loading': 'package-selection',
        'package-selection': 'package-selection',
        'preliminary': 'preliminary-phase',
        'personalization': 'personalization-step',
        'questionnaire': 'questionnaire',
        'completion': 'completion',
        'satisfaction': 'summary',
      };
      setLocalAppState(stateMapping[state.appState] || 'package-selection');
      
      // Afficher le message de bienvenue si reprise de session
      if (state.answers.length > 0 && state.appState === 'questionnaire') {
        setResumeInfo({
          answersCount: state.answers.length,
          lastUpdate: new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
        setShowWelcomeBack(true);
      }
    }
  }, [state.isLoading, state.appState, state.answers.length]);

  // Calculer la progression
  const progress = React.useMemo(() => {
    if (localAppState === 'questionnaire' && state.selectedPackage) {
      const progressionInfo = calculateProgression(
        state.answers,
        state.selectedPackage.id,
        state.userProfile
      );
      return progressionInfo.globalProgress;
    }
    
    const stateProgress: Record<AppState, number> = {
      'welcome': 0,
      'package-selection': 5,
      'preliminary-phase': 10,
      'personalization-step': 15,
      'questionnaire': 20,
      'completion': 95,
      'summary': 100,
      'history': 0,
      'view-history-record': 0,
    };
    return stateProgress[localAppState] || 0;
  }, [localAppState, state.answers, state.selectedPackage, state.userProfile]);

  // Handlers
  const handleStart = useCallback((name: string) => {
    setLocalAppState('package-selection');
  }, []);

  const handlePackageSelect = useCallback((pkg: Package) => {
    actions.selectPackage(pkg);
    setLocalAppState('preliminary-phase');
  }, [actions]);

  const handlePreliminaryConfirm = useCallback((consent: ConsentData) => {
    actions.setConsentData(consent);
    actions.goToPersonalization();
    setLocalAppState('personalization-step');
  }, [actions]);

  const handlePersonalizationComplete = useCallback((profile: UserProfile | null) => {
    actions.setUserProfile(profile);
    actions.goToQuestionnaire();
    setLocalAppState('questionnaire');
  }, [actions]);

  const handleBackToPackages = useCallback(() => {
    actions.goToPackageSelection();
    setLocalAppState('package-selection');
  }, [actions]);

  const handleQuestionnaireComplete = useCallback(async (answers: Answer[], summary: Summary) => {
    const historyItem: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : new Date().toISOString(),
      date: new Date().toISOString(),
      userName: state.userName,
      packageName: state.selectedPackage!.name,
      summary: summary,
      answers: answers,
    };
    
    try {
      await saveAssessmentToHistory(historyItem, user.id);
      actions.completeBilan(summary);
      showSuccess('Bilan sauvegardé avec succès !');
      setLocalAppState('completion');
    } catch (error) {
      console.error('[ClientAppRefactored] Erreur sauvegarde bilan:', error);
      showError('Erreur lors de la sauvegarde du bilan');
    }
  }, [state.userName, state.selectedPackage, user.id, actions, showSuccess, showError]);

  const handleCompletionFinish = useCallback(async () => {
    await clearSession(user.id);
    setLocalAppState('summary');
  }, [user.id]);

  const handleRestart = useCallback(async () => {
    await actions.startNewBilan();
    setViewingRecord(null);
    window.location.hash = '#/dashboard';
  }, [actions]);

  const handleShowHistory = useCallback(() => {
    setLocalAppState('history');
  }, []);

  const handleDashboard = useCallback(() => {
    window.location.hash = '#/dashboard';
  }, []);

  const handleViewRecord = useCallback((record: HistoryItem) => {
    setViewingRecord(record);
    setLocalAppState('view-history-record');
  }, []);

  const handleBackToHistory = useCallback(() => {
    setViewingRecord(null);
    setLocalAppState('history');
  }, []);

  const mapStateToBilanPhase = (appState: AppState): BilanPhase => {
    const mapping: Record<AppState, BilanPhase> = {
      'welcome': 'welcome',
      'package-selection': 'package-selection',
      'preliminary-phase': 'preliminary-phase',
      'personalization-step': 'personalization-step',
      'questionnaire': 'questionnaire',
      'completion': 'completion',
      'summary': 'completion',
      'history': 'history',
      'view-history-record': 'history',
    };
    return mapping[appState];
  };

  // Afficher un loader pendant le chargement
  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (localAppState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} />;
      
      case 'package-selection':
        return <PackageSelector packages={PACKAGES} onSelect={handlePackageSelect} />;
      
      case 'preliminary-phase':
        if (!state.selectedPackage || !state.userName) {
          handleRestart();
          return null;
        }
        return (
          <PhasePreliminaireQualiopi
            pkg={state.selectedPackage}
            userName={state.userName}
            onConfirm={handlePreliminaryConfirm}
            onGoBack={handleBackToPackages}
            coachingStyle={state.coachingStyle}
            setCoachingStyle={actions.setCoachingStyle}
          />
        );
      
      case 'personalization-step':
        if (!state.selectedPackage || !state.userName) {
          handleRestart();
          return null;
        }
        return <PersonalizationStep onComplete={handlePersonalizationComplete} />;
      
      case 'questionnaire':
        if (!state.selectedPackage || !state.userName) {
          handleRestart();
          return null;
        }
        return (
          <Questionnaire
            pkg={state.selectedPackage}
            userName={state.userName}
            userProfile={state.userProfile}
            coachingStyle={state.coachingStyle}
            onComplete={handleQuestionnaireComplete}
            onDashboard={handleDashboard}
            onAnswersUpdate={(answers) => {
              // Synchroniser avec le contexte
              answers.forEach(answer => {
                if (!state.answers.find(a => a.question === answer.question)) {
                  actions.addAnswer(answer);
                }
              });
            }}
            onLastAiMessageUpdate={actions.setLastAiMessage}
            initialAnswers={state.answers.length > 0 ? state.answers : undefined}
            initialLastAiMessage={state.lastAiMessage || undefined}
          />
        );
      
      case 'completion':
        if (!state.summary || !state.selectedPackage) {
          handleRestart();
          return null;
        }
        return (
          <BilanCompletion
            userId={user.id}
            userName={state.userName}
            userEmail={user.email || ''}
            packageName={state.selectedPackage.name}
            packageDuration={state.selectedPackage.totalHours}
            packagePrice={state.selectedPackage.price || 0}
            summary={state.summary}
            answers={state.answers}
            startDate={state.startDate}
            onRestart={handleRestart}
            onViewHistory={handleShowHistory}
          />
        );
      
      case 'summary':
        if (!state.summary || !state.selectedPackage) {
          handleRestart();
          return null;
        }
        return (
          <SummaryDashboard
            summary={state.summary}
            answers={state.answers}
            userName={state.userName}
            packageName={state.selectedPackage.name}
            onRestart={handleRestart}
            onViewHistory={handleShowHistory}
          />
        );
      
      case 'history':
        return <HistoryScreen onViewRecord={handleViewRecord} onBack={handleRestart} />;
      
      case 'view-history-record':
        if (!viewingRecord) {
          handleBackToHistory();
          return null;
        }
        return (
          <SummaryDashboard
            summary={viewingRecord.summary}
            answers={viewingRecord.answers}
            userName={viewingRecord.userName}
            packageName={viewingRecord.packageName}
            onRestart={handleRestart}
            onViewHistory={handleBackToHistory}
            isHistoryView={true}
          />
        );
      
      default:
        return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} />;
    }
  };

  return (
    <div className="App min-h-screen flex flex-col">
      {/* Modal de bienvenue personnalisé pour la reprise de session */}
      {showWelcomeBack && resumeInfo && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-800 mb-3">
              Ravi de vous revoir, {state.userName} !
            </h2>
            <p className="text-slate-600 mb-4">
              On peut reprendre dès que vous serez disponible.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500 mb-2">
                Dernière session : {resumeInfo.lastUpdate}
              </p>
              <p className="text-lg font-semibold text-primary-700">
                {resumeInfo.answersCount} question{resumeInfo.answersCount > 1 ? 's' : ''} déjà complétée{resumeInfo.answersCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWelcomeBack(false)}
                className="flex-1 bg-primary-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-primary-700 transition-colors"
              >
                Reprendre mon bilan
              </button>
              <button
                onClick={() => {
                  setShowWelcomeBack(false);
                  handleDashboard();
                }}
                className="px-6 bg-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-300 transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Navigation améliorée avec fil d'Ariane */}
      <EnhancedNavigation
        currentPhase={mapStateToBilanPhase(localAppState)}
        userName={state.userName}
        packageName={state.selectedPackage?.name}
        progress={progress}
        timeSpent={state.timeSpent}
        totalTime={state.selectedPackage ? state.selectedPackage.timeBudget.total : 120}
        onNavigate={(phase) => {
          if (phase === 'welcome') {
            handleDashboard();
          } else {
            setLocalAppState(phase as AppState);
          }
        }}
      />
      
      {/* Contenu principal */}
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};

export default ClientAppRefactored;
