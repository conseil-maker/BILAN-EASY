import React, { useState, useEffect } from 'react';
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
import DraftRecovery from './DraftRecovery';
import { PACKAGES } from '../constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from '../types-ai-studio';
import { saveAssessmentToHistory } from '../services/historyService';
import { useToast } from './ToastProvider';
import { NotificationManager } from './NotificationManager';

type AppState = 'welcome' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'completion' | 'summary' | 'history' | 'view-history-record';

interface ClientAppProps {
  user: User;
}

// Clé pour la persistance de session
const SESSION_STORAGE_KEY = 'bilan_easy_session';

interface SessionData {
  appState: AppState;
  userName: string;
  selectedPackageId: string | null;
  coachingStyle: CoachingStyle;
  currentAnswers: Answer[];
  startDate: string;
  timeSpent: number;
  lastUpdated: string;
}

const ClientApp: React.FC<ClientAppProps> = ({ user }) => {
  // Charger la session depuis localStorage au démarrage
  const loadSession = (): Partial<SessionData> | null => {
    try {
      const saved = localStorage.getItem(`${SESSION_STORAGE_KEY}_${user.id}`);
      if (saved) {
        const session = JSON.parse(saved) as SessionData;
        // Vérifier si la session n'est pas trop ancienne (24h)
        const lastUpdated = new Date(session.lastUpdated);
        const now = new Date();
        const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        if (hoursDiff < 24) {
          return session;
        }
      }
    } catch (error) {
      console.error('[Session] Erreur lors du chargement de la session:', error);
    }
    return null;
  };

  const savedSession = loadSession();
  const savedPackage = savedSession?.selectedPackageId 
    ? PACKAGES.find(p => p.id === savedSession.selectedPackageId) 
    : null;

  const [appState, setAppState] = useState<AppState>(savedSession?.appState || 'welcome');
  const [userName, setUserName] = useState(savedSession?.userName || user.email?.split('@')[0] || 'Utilisateur');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(savedPackage);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>(savedSession?.coachingStyle || 'collaborative');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>(savedSession?.currentAnswers || []);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [viewingRecord, setViewingRecord] = useState<HistoryItem | null>(null);
  const [startDate, setStartDate] = useState<string>(savedSession?.startDate || '');
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(savedSession?.timeSpent || 0);
  const [showDraftRecovery, setShowDraftRecovery] = useState(!savedSession);
  const { showSuccess, showInfo } = useToast();

  // Sauvegarder la session à chaque changement d'état important
  useEffect(() => {
    // Ne pas sauvegarder si on est sur les écrans de fin ou d'historique
    if (['completion', 'summary', 'history', 'view-history-record'].includes(appState)) {
      return;
    }
    
    // Ne sauvegarder que si on a commencé le bilan
    if (appState === 'welcome') {
      return;
    }

    const sessionData: SessionData = {
      appState,
      userName,
      selectedPackageId: selectedPackage?.id || null,
      coachingStyle,
      currentAnswers,
      startDate,
      timeSpent,
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`${SESSION_STORAGE_KEY}_${user.id}`, JSON.stringify(sessionData));
      console.log('[Session] Session sauvegardée:', appState, currentAnswers.length, 'réponses');
    } catch (error) {
      console.error('[Session] Erreur lors de la sauvegarde de la session:', error);
    }
  }, [appState, userName, selectedPackage, coachingStyle, currentAnswers, startDate, timeSpent, user.id]);

  // Nettoyer la session quand le bilan est terminé
  const clearSession = () => {
    try {
      localStorage.removeItem(`${SESSION_STORAGE_KEY}_${user.id}`);
      console.log('[Session] Session supprimée');
    } catch (error) {
      console.error('[Session] Erreur lors de la suppression de la session:', error);
    }
  };

  // Timer pour suivre le temps passé
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === 'questionnaire') {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000); // Incrémenter chaque minute
    }
    return () => clearInterval(interval);
  }, [appState]);

  // Calculer la progression globale
  useEffect(() => {
    const stateProgress: Record<AppState, number> = {
      'welcome': 0,
      'package-selection': 10,
      'preliminary-phase': 20,
      'personalization-step': 30,
      'questionnaire': 50,
      'completion': 90,
      'summary': 100,
      'history': 0,
      'view-history-record': 0,
    };
    setProgress(stateProgress[appState] || 0);
  }, [appState]);

  const handleStart = (name: string) => {
    setUserName(name);
    setAppState('package-selection');
  };

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setStartDate(new Date().toLocaleDateString('fr-FR'));
    setAppState('preliminary-phase');
  };

  const handlePreliminaryConfirm = (consent: ConsentData) => {
    setConsentData(consent);
    setAppState('personalization-step');
  };

  const handlePersonalizationComplete = (profile: UserProfile | null) => {
    setUserProfile(profile);
    setAppState('questionnaire');
  };

  const handleBackToPackages = () => {
    setSelectedPackage(null);
    setAppState('package-selection');
  };

  const handleQuestionnaireComplete = (answers: Answer[], summary: Summary) => {
    setCurrentAnswers(answers);
    setCurrentSummary(summary);

    const historyItem: HistoryItem = {
      id: new Date().toISOString(),
      date: new Date().toISOString(),
      userName: userName,
      packageName: selectedPackage!.name,
      summary: summary,
      answers: answers,
    };
    saveAssessmentToHistory(historyItem, user.id);

    // Nettoyer la session car le bilan est terminé
    clearSession();

    // Aller vers le parcours de fin au lieu du summary direct
    setAppState('completion');
  };

  const handleCompletionFinish = () => {
    setAppState('summary');
  };

  const handleRestart = () => {
    // Nettoyer la session
    clearSession();
    
    setSelectedPackage(null);
    setCurrentAnswers([]);
    setCurrentSummary(null);
    setViewingRecord(null);
    setUserProfile(null);
    setCoachingStyle('collaborative');
    setTimeSpent(0);
    setAppState('welcome');
  };

  const handleShowHistory = () => {
    setAppState('history');
  };

  const handleDashboard = () => {
    // Sauvegarder la progression avant de quitter
    saveSession();
    // Retourner à l'écran d'accueil (qui affiche le dashboard)
    setAppState('welcome');
  };

  const handleViewRecord = (record: HistoryItem) => {
    setViewingRecord(record);
    setAppState('view-history-record');
  };

  const handleBackToHistory = () => {
    setViewingRecord(null);
    setAppState('history');
  };

  // Mapper AppState vers BilanPhase pour la navigation
  const mapStateToBilanPhase = (state: AppState): BilanPhase => {
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
    return mapping[state];
  };

  const renderContent = () => {
    switch (appState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} />;
      
      case 'package-selection':
        return <PackageSelector packages={PACKAGES} onSelect={handlePackageSelect} />;
      
      case 'preliminary-phase':
        if (!selectedPackage || !userName) {
          handleRestart();
          return null;
        }
        return (
          <PhasePreliminaireQualiopi
            pkg={selectedPackage}
            userName={userName}
            onConfirm={handlePreliminaryConfirm}
            onGoBack={handleBackToPackages}
            coachingStyle={coachingStyle}
            setCoachingStyle={setCoachingStyle}
          />
        );
      
      case 'personalization-step':
        if (!selectedPackage || !userName) {
          handleRestart();
          return null;
        }
        return <PersonalizationStep onComplete={handlePersonalizationComplete} />;
      
      case 'questionnaire':
        if (!selectedPackage || !userName) {
          handleRestart();
          return null;
        }
        return (
          <Questionnaire
            pkg={selectedPackage}
            userName={userName}
            userProfile={userProfile}
            coachingStyle={coachingStyle}
            onComplete={handleQuestionnaireComplete}
            onDashboard={handleDashboard}
          />
        );
      
      case 'completion':
        if (!currentSummary || !selectedPackage) {
          handleRestart();
          return null;
        }
        return (
          <BilanCompletion
            userId={user.id}
            userName={userName}
            userEmail={user.email || ''}
            packageName={selectedPackage.name}
            packageDuration={selectedPackage.duration / 60}
            packagePrice={selectedPackage.price || 0}
            summary={currentSummary}
            answers={currentAnswers}
            startDate={startDate}
            onRestart={handleRestart}
            onViewHistory={handleShowHistory}
          />
        );
      
      case 'summary':
        if (!currentSummary || !selectedPackage) {
          handleRestart();
          return null;
        }
        return (
          <SummaryDashboard
            summary={currentSummary}
            answers={currentAnswers}
            userName={userName}
            packageName={selectedPackage.name}
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

  // Fonction pour reprendre un brouillon
  const handleResumeDraft = (draft: any) => {
    // Trouver le package correspondant
    const pkg = PACKAGES.find(p => p.name === draft.package_name);
    if (pkg) {
      setSelectedPackage(pkg);
      setCurrentAnswers(draft.answers || []);
      setStartDate(draft.created_at ? new Date(draft.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR'));
      setAppState('questionnaire');
      showSuccess(`Brouillon repris avec ${draft.answers?.length || 0} réponses`);
    } else {
      // Si le package n'est pas trouvé, aller à la sélection
      setAppState('package-selection');
      showInfo('Package non trouvé, veuillez en sélectionner un nouveau');
    }
    setShowDraftRecovery(false);
  };

  const handleDiscardDraft = () => {
    setShowDraftRecovery(false);
    showInfo('Nouveau bilan démarré');
  };

  return (
    <div className="App min-h-screen flex flex-col">
      {/* Gestionnaire de notifications push */}
      <NotificationManager 
        userName={userName}
        onPermissionChange={(permission) => {
          if (permission === 'granted') {
            console.log('[Notifications] Permission accordée');
          }
        }}
      />

      {/* Modal de récupération de brouillon */}
      {showDraftRecovery && appState === 'welcome' && (
        <DraftRecovery
          userId={user.id}
          onResume={handleResumeDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      {/* Navigation améliorée avec fil d'Ariane */}
      <EnhancedNavigation
        currentPhase={mapStateToBilanPhase(appState)}
        userName={userName}
        packageName={selectedPackage?.name}
        progress={progress}
        timeSpent={timeSpent}
        totalTime={selectedPackage ? selectedPackage.timeBudget.total : 120}
        onNavigate={(phase) => {
          // Permettre de revenir aux étapes précédentes
          if (phase === 'welcome') {
            handleDashboard();
          } else {
            setAppState(phase);
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

export default ClientApp;
