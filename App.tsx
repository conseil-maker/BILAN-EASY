import React, { useState } from 'react';
// Clerk kaldırıldı - Artık authentication gerekmiyor
import WelcomeScreen from './components/WelcomeScreen';
import PackageSelector from './components/PackageSelector';
import PhasePreliminaire from './components/PhasePreliminaire';
import PersonalizationStep from './components/PersonalizationStep';
import Questionnaire from './components/Questionnaire';
import SummaryDashboard from './components/SummaryDashboard';
import HistoryScreen from './components/HistoryScreen';
import ThemeToggle from './components/ThemeToggle';
import { PACKAGES } from './constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from './types';
import { saveAssessmentToHistory } from './services/historyService';
import { useApi } from './services/apiClient';
import { useToast } from './components/Toast';
import type { Assessment } from './services/apiClient';

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
    const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
    const [isCreatingAssessment, setIsCreatingAssessment] = useState(false);
    
    const api = useApi();
    const { showToast } = useToast();

    const handleStart = (name: string) => {
        setUserName(name);
        setAppState('package-selection');
    };

    const handlePackageSelect = async (pkg: Package) => {
        console.log('📦 Package selected:', pkg);
        console.log('👤 User name:', userName);
        
        if (!userName || userName.trim() === '') {
            console.error('❌ User name is empty!');
            showToast('Erreur: Nom d\'utilisateur manquant', 'error', 3000);
            return;
        }
        
        setSelectedPackage(pkg);
        setIsCreatingAssessment(true);
        
        try {
            console.log('🚀 Creating assessment...');
            // Backend'e assessment oluştur
            const assessment = await api.createAssessment({
                userName: userName,
                packageId: pkg.id as 'decouverte' | 'approfondi' | 'strategique',
                packageName: pkg.name,
                coachingStyle: coachingStyle,
                totalQuestions: pkg.totalQuestionnaires,
            });
            
            console.log('✅ Assessment created:', assessment);
            setCurrentAssessmentId(assessment.id);
            showToast('Bilan créé avec succès', 'success', 3000);
            setAppState('preliminary-phase');
        } catch (error) {
            console.error('❌ Failed to create assessment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            console.error('Error details:', errorMessage);
            showToast(
                `Impossible de créer le bilan. Continuons quand même. (${errorMessage})`,
                'warning',
                5000
            );
            // Hata durumunda da devam et (fallback)
            setAppState('preliminary-phase');
        } finally {
            setIsCreatingAssessment(false);
        }
    };
    
    // Package selection'da loading göster
    if (appState === 'package-selection' && isCreatingAssessment) {
        // Loading state PackageSelector'da gösterilecek
    }

    const handlePreliminaryConfirm = () => {
        console.log('✅ Preliminary phase confirmed');
        console.log('📦 Current assessment ID:', currentAssessmentId);
        console.log('👤 User name:', userName);
        console.log('📋 Selected package:', selectedPackage?.id);
        
        // Assessment ID yoksa uyarı ver ama devam et
        if (!currentAssessmentId) {
            console.warn('⚠️ Assessment ID yok, ama devam ediyoruz');
            showToast('Bilan ID bulunamadı, ama devam ediyoruz', 'warning', 3000);
        }
        
        setAppState('personalization-step');
    };

    const handlePersonalizationComplete = async (profile: UserProfile | null) => {
        setUserProfile(profile);
        
        // Eğer assessment varsa ve userProfile varsa, assessment'ı güncelle
        if (currentAssessmentId && profile) {
            try {
                await api.updateAssessment(currentAssessmentId, {
                    userProfile: {
                        fullName: profile.fullName,
                        currentRole: profile.currentRole,
                        keySkills: profile.keySkills,
                        pastExperiences: profile.pastExperiences,
                    }
                });
                showToast('Profil mis à jour', 'success', 2000);
            } catch (error) {
                console.error('Failed to update assessment with user profile:', error);
                showToast('Impossible de sauvegarder le profil, mais nous continuons', 'warning', 3000);
                // Hata durumunda da devam et
            }
        }
        
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
        setCurrentAssessmentId(null);
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
                return <PackageSelector packages={PACKAGES} onSelect={handlePackageSelect} isLoading={isCreatingAssessment} />;
            case 'preliminary-phase':
                if (!selectedPackage || !userName) { handleRestart(); return null; }
                return <PhasePreliminaire pkg={selectedPackage} userName={userName} onConfirm={handlePreliminaryConfirm} onGoBack={handleBackToPackages} coachingStyle={coachingStyle} setCoachingStyle={setCoachingStyle} />;
            case 'personalization-step':
                 if (!selectedPackage || !userName) { handleRestart(); return null; }
                return <PersonalizationStep onComplete={handlePersonalizationComplete} />;
            case 'questionnaire':
                if (!selectedPackage || !userName) { handleRestart(); return null; }
                return <Questionnaire pkg={selectedPackage} userName={userName} userProfile={userProfile} coachingStyle={coachingStyle} assessmentId={currentAssessmentId} onComplete={handleQuestionnaireComplete} />;
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

    // Geçici olarak Clerk authentication'ı bypass ediyoruz (test için)
    // Production'da AuthGuard'ı geri açın
    return (
        <div className="App bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-200">
            <ThemeToggle />
            {renderContent()}
        </div>
    );
    
    // Production versiyonu (Clerk ile):
    // return (
    //     <AuthGuard>
    //         <div className="App">
    //             <div className="fixed top-4 right-4 z-50">
    //                 <UserButton afterSignOutUrl="/" />
    //             </div>
    //             {renderContent()}
    //         </div>
    //     </AuthGuard>
    // );
};

export default App;
