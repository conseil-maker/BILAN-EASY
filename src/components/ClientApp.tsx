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
import { PACKAGES } from '../constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from '../types-ai-studio';
import { saveAssessmentToHistory } from '../services/historyService';

type AppState = 'welcome' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'completion' | 'summary' | 'history' | 'view-history-record';

interface ClientAppProps {
  user: User;
}

const ClientApp: React.FC<ClientAppProps> = ({ user }) => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [userName, setUserName] = useState(user.email?.split('@')[0] || 'Utilisateur');
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
    saveAssessmentToHistory(historyItem);

    // Aller vers le parcours de fin au lieu du summary direct
    setAppState('completion');
  };

  const handleCompletionFinish = () => {
    setAppState('summary');
  };

  const handleRestart = () => {
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

  return (
    <div className="App min-h-screen flex flex-col">
      {/* Navigation améliorée avec fil d'Ariane */}
      <EnhancedNavigation
        currentPhase={mapStateToBilanPhase(appState)}
        userName={userName}
        packageName={selectedPackage?.name}
        progress={progress}
        timeSpent={timeSpent}
        totalTime={selectedPackage ? selectedPackage.timeBudget.total : 120}
      />
      
      {/* Contenu principal */}
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};

export default ClientApp;
