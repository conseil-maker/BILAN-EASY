import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PackageSelector from './components/PackageSelector';
import PhasePreliminaire from './components/PhasePreliminaire';
import PersonalizationStep from './components/PersonalizationStep';
import Questionnaire from './components/Questionnaire';
import SummaryDashboard from './components/SummaryDashboard';
import HistoryScreen from './components/HistoryScreen';
import { PACKAGES } from './constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from './types';
import { saveAssessmentToHistory } from './services/historyService';

type AppState = 'welcome' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'summary' | 'history' | 'view-history-record';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('welcome');
    const [userName, setUserName] = useState('');
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('collaborative');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
    const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
    const [viewingRecord, setViewingRecord] = useState<HistoryItem | null>(null);

    const handleStart = (name: string) => {
        setUserName(name);
        setAppState('package-selection');
    };

    const handlePackageSelect = (pkg: Package) => {
        setSelectedPackage(pkg);
        setAppState('preliminary-phase');
    };

    const handlePreliminaryConfirm = () => {
        setAppState('personalization-step');
    };

    const handlePersonalizationComplete = (profile: UserProfile | null) => {
        setUserProfile(profile);
        setAppState('questionnaire');
    }
    
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

        setAppState('summary');
    };

    const handleRestart = () => {
        setUserName('');
        setSelectedPackage(null);
        setCurrentAnswers([]);
        setCurrentSummary(null);
        setViewingRecord(null);
        setUserProfile(null);
        setCoachingStyle('collaborative');
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
    
    const renderContent = () => {
        switch (appState) {
            case 'welcome':
                return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} />;
            case 'package-selection':
                return <PackageSelector packages={PACKAGES} onSelect={handlePackageSelect} />;
            case 'preliminary-phase':
                if (!selectedPackage || !userName) { handleRestart(); return null; }
                return <PhasePreliminaire pkg={selectedPackage} userName={userName} onConfirm={handlePreliminaryConfirm} onGoBack={handleBackToPackages} coachingStyle={coachingStyle} setCoachingStyle={setCoachingStyle} />;
            case 'personalization-step':
                 if (!selectedPackage || !userName) { handleRestart(); return null; }
                return <PersonalizationStep onComplete={handlePersonalizationComplete} />;
            case 'questionnaire':
                if (!selectedPackage || !userName) { handleRestart(); return null; }
                return <Questionnaire pkg={selectedPackage} userName={userName} userProfile={userProfile} coachingStyle={coachingStyle} onComplete={handleQuestionnaireComplete} />;
            case 'summary':
                if (!currentSummary || !selectedPackage) { handleRestart(); return null; }
                return <SummaryDashboard summary={currentSummary} answers={currentAnswers} userName={userName} packageName={selectedPackage.name} onRestart={handleRestart} onViewHistory={handleShowHistory} />;
            case 'history':
                return <HistoryScreen onViewRecord={handleViewRecord} onBack={handleRestart} />;
            case 'view-history-record':
                 if (!viewingRecord) { handleBackToHistory(); return null; }
                 return <SummaryDashboard summary={viewingRecord.summary} answers={viewingRecord.answers} userName={viewingRecord.userName} packageName={viewingRecord.packageName} onRestart={handleRestart} onViewHistory={handleBackToHistory} isHistoryView={true} />;
            default:
                return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} />;
        }
    };

    return (
        <div className="App">
            {renderContent()}
        </div>
    );
};

export default App;
