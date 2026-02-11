import React, { useState, useEffect, useCallback } from 'react';
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
import { saveSession, loadSession, clearSession } from '../services/sessionService';
import { calculateProgression, ProgressionInfo } from '../services/progressionService';
import { useToast } from './ToastProvider';
import { supabase } from '../lib/supabaseClient';

type AppState = 'welcome' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'completion' | 'summary' | 'history' | 'view-history-record';

interface ClientAppProps {
  user: User;
}

const ClientApp: React.FC<ClientAppProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionRestored, setSessionRestored] = useState(false);
  // Démarrer directement sur la sélection de forfait (on arrive depuis le Dashboard)
  const [appState, setAppState] = useState<AppState>('package-selection');
  const [userName, setUserName] = useState(user.email?.split('@')[0] || 'Utilisateur');

  // Récupérer le nom complet depuis la table profiles
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      } catch (error) {
        console.warn('[ClientApp] Impossible de récupérer le nom complet:', error);
      }
    };
    fetchUserName();
  }, [user.id]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('collaborative');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [consentData, setConsentData] = useState<ConsentData | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
  const [viewingRecord, setViewingRecord] = useState<HistoryItem | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [resumeInfo, setResumeInfo] = useState<{ answersCount: number; lastUpdate: string } | null>(null);
  const [lastAiMessage, setLastAiMessage] = useState<string | undefined>(undefined);
  const [assessmentId, setAssessmentId] = useState<string>('');
  const { showSuccess, showInfo, showError } = useToast();

  // Charger la session depuis Supabase au démarrage
  useEffect(() => {
    // Timeout de sécurité : forcer le déchargement après 5 secondes
    const safetyTimeout = setTimeout(() => {
      console.warn('[ClientApp] Timeout de chargement de session, déchargement forcé');
      setIsLoading(false);
      setSessionRestored(true); // Permettre la sauvegarde après timeout
      setAppState('package-selection');
    }, 5000);

    const initSession = async () => {
      try {
        // Vérifier si on demande un nouveau bilan via le paramètre ?new=true
        const hashParts = window.location.hash.split('?');
        const urlParams = new URLSearchParams(hashParts[1] || '');
        const forceNewBilan = urlParams.get('new') === 'true';
        
        if (forceNewBilan) {
          console.log('[ClientApp] Nouveau bilan demandé, effacement de la session...');
          // Effacer la session existante et démarrer un nouveau bilan
          try {
            await clearSession(user.id);
          } catch (e) {
            console.warn('[ClientApp] Erreur lors de l\'effacement de la session:', e);
          }
          // Réinitialiser tous les états
          setSelectedPackage(null);
          setCurrentAnswers([]);
          setCurrentSummary(null);
          setConsentData(null);
          setUserProfile(null);
          setStartDate('');
          setTimeSpent(0);
          setProgress(0);
          setLastAiMessage(undefined);
          setAppState('package-selection');
          setIsLoading(false);
          setSessionRestored(true); // Nouveau bilan = pas de restauration à protéger
          // Nettoyer l'URL sans déclencher de rechargement
          window.history.replaceState(null, '', '#/bilan');
          return;
        }
        
        const session = await loadSession(user.id);
        if (session) {
          const pkg = session.selected_package_id 
            ? PACKAGES.find(p => p.id === session.selected_package_id) 
            : null;
          
          console.log('[ClientApp] Session trouvée:', {
            app_state: session.app_state,
            selected_package_id: session.selected_package_id,
            answers_count: session.current_answers?.length || 0,
            has_consent: !!session.consent_data,
            has_profile: !!session.user_profile,
            has_last_ai_message: !!session.last_ai_message,
            pkg_found: !!pkg
          });
          
          setUserName(session.user_name || user.email?.split('@')[0] || 'Utilisateur');
          setSelectedPackage(pkg || null);
          setCoachingStyle(session.coaching_style || 'collaborative');
          setCurrentAnswers(session.current_answers || []);
          setStartDate(session.start_date || '');
          setTimeSpent(session.time_spent || 0);
          setLastAiMessage(session.last_ai_message || undefined);
          setConsentData(session.consent_data || null);
          setUserProfile(session.user_profile || null);
          
          // Si en état completion, récupérer le dernier bilan pour avoir le summary
          if (session.app_state === 'completion') {
            const latestBilan = await getLatestCompletedAssessment(user.id);
            if (latestBilan && latestBilan.summary) {
              setCurrentSummary(latestBilan.summary);
              setCurrentAnswers(latestBilan.answers || session.current_answers || []);
              setAppState('completion');
              showInfo('Reprise de votre bilan terminé');
            } else {
              // Pas de bilan trouvé, revenir à l'accueil
              setAppState('welcome');
            }
          } else {
            // Si la session est en welcome, aller directement à package-selection
            const targetState = session.app_state === 'welcome' ? 'package-selection' : session.app_state;
            setAppState(targetState as AppState || 'package-selection');
            
            // Afficher le message de bienvenue personnalisé si l'utilisateur a un bilan en cours
            if (session.current_answers?.length > 0 && session.app_state === 'questionnaire') {
              const lastUpdate = session.updated_at ? new Date(session.updated_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              }) : '';
              setResumeInfo({
                answersCount: session.current_answers.length,
                lastUpdate
              });
              setShowWelcomeBack(true);
            }
          }
        } else {
          // Pas de session existante, démarrer sur package-selection
          setAppState('package-selection');
        }
      } catch (error) {
        console.error('[ClientApp] Erreur chargement session:', error);
        setAppState('package-selection');
      } finally {
        clearTimeout(safetyTimeout);
        setIsLoading(false);
        // Marquer la session comme restaurée APRÈS que tous les états soient mis à jour
        setTimeout(() => setSessionRestored(true), 500);
      }
    };
    
    initSession();

    return () => clearTimeout(safetyTimeout);
  }, [user.id]);

  // Sauvegarder la session dans Supabase à chaque changement important
  const saveCurrentSession = useCallback(async () => {
    if (['summary', 'history', 'view-history-record', 'welcome'].includes(appState)) {
      return;
    }

    try {
      await saveSession(user.id, {
        app_state: appState,
        user_name: userName,
        selected_package_id: selectedPackage?.id || null,
        coaching_style: coachingStyle,
        current_answers: currentAnswers,
        current_questions: [], // Les questions seront ajoutées si nécessaire
        last_ai_message: lastAiMessage, // Dernière question IA pour reprise exacte
        current_phase: appState === 'questionnaire' ? 'investigation' : 'preliminary',
        progress: progress,
        start_date: startDate,
        time_spent: timeSpent,
        consent_data: consentData,
        user_profile: userProfile
      });
      console.log('[ClientApp] Session sauvegardée:', currentAnswers.length, 'réponses');
    } catch (error) {
      console.error('[ClientApp] Erreur sauvegarde session:', error);
    }
  }, [appState, userName, selectedPackage, coachingStyle, currentAnswers, startDate, timeSpent, user.id, progress, consentData, userProfile, lastAiMessage]);

  // Sauvegarder immédiatement après chaque nouvelle réponse
  useEffect(() => {
    if (sessionRestored && appState === 'questionnaire' && currentAnswers.length > 0) {
      // Sauvegarde immédiate à chaque nouvelle réponse
      saveCurrentSession();
    }
  }, [currentAnswers.length, sessionRestored]); // Déclenché uniquement quand le nombre de réponses change

  // Sauvegarder immédiatement quand la dernière question IA change
  useEffect(() => {
    if (sessionRestored && appState === 'questionnaire' && lastAiMessage) {
      // Sauvegarde immédiate de la dernière question IA
      saveCurrentSession();
    }
  }, [lastAiMessage, sessionRestored]); // Déclenché uniquement quand la dernière question change

  // Sauvegarde périodique toutes les 60 secondes comme backup
  useEffect(() => {
    if (sessionRestored && appState === 'questionnaire' && currentAnswers.length > 0) {
      const interval = setInterval(saveCurrentSession, 60000);
      return () => clearInterval(interval);
    }
  }, [appState, saveCurrentSession, sessionRestored]);

  // Sauvegarder à chaque changement d'état (seulement après restauration complète)
  useEffect(() => {
    if (!isLoading && sessionRestored) {
      saveCurrentSession();
    }
  }, [appState, currentAnswers, isLoading, sessionRestored, saveCurrentSession]);

  // Timer pour suivre le temps passé
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === 'questionnaire') {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [appState]);

  // Calculer la progression globale basée sur le nombre de questions
  useEffect(() => {
    if (appState === 'questionnaire' && selectedPackage) {
      // Utiliser le nouveau service de progression
      const progressionInfo = calculateProgression(
        currentAnswers,
        selectedPackage.id,
        userProfile
      );
      setProgress(progressionInfo.globalProgress);
    } else {
      // Pour les étapes hors questionnaire, utiliser une progression fixe
      const stateProgress: Record<AppState, number> = {
        'welcome': 0,
        'package-selection': 5,
        'preliminary-phase': 10,
        'personalization-step': 15,
        'questionnaire': 20, // Sera remplacé par le calcul dynamique
        'completion': 95,
        'summary': 100,
        'history': 0,
        'view-history-record': 0,
      };
      setProgress(stateProgress[appState] || 0);
    }
  }, [appState, currentAnswers.length, selectedPackage, userProfile]);

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

  const handleQuestionnaireComplete = async (answers: Answer[], summary: Summary) => {
    setCurrentAnswers(answers);
    setCurrentSummary(summary);

    // Générer un seul ID pour l'assessment et le stocker
    const newAssessmentId = crypto.randomUUID ? crypto.randomUUID() : new Date().toISOString();
    setAssessmentId(newAssessmentId);

    const historyItem: HistoryItem = {
      id: newAssessmentId,
      date: new Date().toISOString(),
      userName: userName,
      packageName: selectedPackage!.name,
      summary: summary,
      answers: answers,
    };
    
    try {
      await saveAssessmentToHistory(historyItem, user.id);
      // Ne pas effacer la session ici - elle sera effacée quand l'utilisateur clique sur "Terminer"
      // Sauvegarder l'état 'completion' dans la session pour permettre la reprise
      await saveSession(user.id, {
        app_state: 'completion',
        user_name: userName,
        selected_package_id: selectedPackage!.id,
        coaching_style: coachingStyle,
        current_answers: answers,
        start_date: startDate,
        time_spent: timeSpent
      });
      showSuccess('Bilan sauvegardé avec succès !');
    } catch (error) {
      console.error('[ClientApp] Erreur sauvegarde bilan:', error);
      showError('Erreur lors de la sauvegarde du bilan');
    }

    setAppState('completion');
  };

  const handleCompletionFinish = async () => {
    // Effacer la session car le bilan est terminé
    await clearSession(user.id);
    setAppState('summary');
  };

  const handleRestart = async () => {
    await clearSession(user.id);
    
    setSelectedPackage(null);
    setCurrentAnswers([]);
    setCurrentSummary(null);
    setViewingRecord(null);
    setUserProfile(null);
    setCoachingStyle('collaborative');
    setTimeSpent(0);
    // Rediriger vers le dashboard
    window.location.hash = '#/dashboard';
  };

  const handleShowHistory = () => {
    setAppState('history');
  };

  const handleDashboard = () => {
    // Rediriger vers le dashboard
    window.location.hash = '#/dashboard';
  };

  const handleViewRecord = (record: HistoryItem) => {
    setViewingRecord(record);
    setAppState('view-history-record');
  };

  const handleBackToHistory = () => {
    setViewingRecord(null);
    setAppState('history');
  };

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

  // Afficher un loader pendant le chargement de la session
  if (isLoading) {
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
    switch (appState) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} />;
      
      case 'package-selection':
        return <PackageSelector packages={PACKAGES} onSelect={handlePackageSelect} />;
      
      case 'preliminary-phase':
        if (!selectedPackage || !userName) {
          console.warn('[ClientApp] selectedPackage ou userName manquant pour preliminary-phase, retour à package-selection');
          setAppState('package-selection');
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
          console.warn('[ClientApp] selectedPackage ou userName manquant pour personalization-step, retour à package-selection');
          setAppState('package-selection');
          return null;
        }
        return <PersonalizationStep onComplete={handlePersonalizationComplete} />;
      
      case 'questionnaire':
        if (!selectedPackage || !userName) {
          console.warn('[ClientApp] selectedPackage ou userName manquant pour questionnaire, retour à package-selection');
          setAppState('package-selection');
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
            onAnswersUpdate={setCurrentAnswers}
            onLastAiMessageUpdate={setLastAiMessage}
            initialAnswers={currentAnswers.length > 0 ? currentAnswers : undefined}
            initialLastAiMessage={lastAiMessage}
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
            packageDuration={selectedPackage.totalHours}
            packagePrice={selectedPackage.price || 0}
            summary={currentSummary}
            answers={currentAnswers}
            startDate={startDate}
            existingAssessmentId={assessmentId}
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
              Ravi de vous revoir, {userName} !
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
                onClick={() => {
                  setShowWelcomeBack(false);
                  // Rester sur le questionnaire pour reprendre
                }}
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
        currentPhase={mapStateToBilanPhase(appState)}
        userName={userName}
        packageName={selectedPackage?.name}
        progress={progress}
        timeSpent={timeSpent}
        totalTime={selectedPackage ? selectedPackage.timeBudget.total : 120}
        onNavigate={(phase) => {
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
