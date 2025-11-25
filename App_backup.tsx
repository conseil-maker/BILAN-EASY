import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { ConsultantDashboard } from './components/ConsultantDashboard';
import WelcomeScreen from './components/WelcomeScreen';
import PackageSelector from './components/PackageSelector';
import PhasePreliminaire from './components/PhasePreliminaire';
import PersonalizationStep from './components/PersonalizationStep';
import Questionnaire from './components/Questionnaire';
import SummaryDashboard from './components/SummaryDashboard';
import HistoryScreen from './components/HistoryScreen';
import { PACKAGES } from './constants';
import { Package, Answer, Summary, HistoryItem, UserProfile, CoachingStyle } from './types';
import { authService } from './services/authService';
import { assessmentService } from './services/assessmentService';
import { Profile } from './lib/supabaseClient';

type AppState = 'login' | 'welcome' | 'admin-dashboard' | 'consultant-dashboard' | 'package-selection' | 'preliminary-phase' | 'personalization-step' | 'questionnaire' | 'summary' | 'history' | 'view-history-record';

const App: React.FC = () => {
    const [appState, setAppState] = useState<AppState>('login');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState<Profile | null>(null);
    const [currentAssessmentId, setCurrentAssessmentId] = useState<string | null>(null);
    
    const [userName, setUserName] = useState('');
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('collaborative');
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
    const [currentSummary, setCurrentSummary] = useState<Summary | null>(null);
    const [viewingRecord, setViewingRecord] = useState<HistoryItem | null>(null);

    // Vérifier l'authentification au chargement
    useEffect(() => {
        checkAuth();
        
        // Écouter les changements d'authentification
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                await loadUserProfile();
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setAppState('login');
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const checkAuth = async () => {
        try {
            const user = await authService.getCurrentUser();
            if (user) {
                await loadUserProfile();
            } else {
                setAppState('login');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de l\'authentification:', error);
            setAppState('login');
        }
    };

    const loadUserProfile = async () => {
        try {
            const profile = await authService.getUserProfile();
            if (profile) {
                setCurrentUser(profile);
                setUserName(profile.full_name || profile.email);
                setIsAuthenticated(true);
                
                // Rediriger vers le dashboard approprié selon le rôle
                if (profile.role === 'admin') {
                    setAppState('admin-dashboard');
                } else if (profile.role === 'consultant') {
                    setAppState('consultant-dashboard');
                } else {
                    setAppState('welcome');
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement du profil:', error);
        }
    };

    const handleLoginSuccess = async () => {
        await loadUserProfile();
    };

    const handleStart = async (name: string) => {
        setUserName(name);
        setAppState('package-selection');
    };

    const handlePackageSelect = async (pkg: Package) => {
        setSelectedPackage(pkg);
        
        // Créer un nouveau bilan dans Supabase
        try {
            const assessment = await assessmentService.createAssessment(
                `Bilan ${pkg.name}`,
                coachingStyle
            );
            setCurrentAssessmentId(assessment.id);
            setAppState('preliminary-phase');
        } catch (error) {
            console.error('Erreur lors de la création du bilan:', error);
            alert('Erreur lors de la création du bilan. Veuillez réessayer.');
        }
    };

    const handlePreliminaryConfirm = () => {
        setAppState('personalization-step');
    };

    const handlePersonalizationComplete = async (profile: UserProfile | null) => {
        setUserProfile(profile);
        
        // Sauvegarder l'analyse du CV dans Supabase
        if (currentAssessmentId && profile) {
            try {
                await assessmentService.saveCVAnalysis(currentAssessmentId, profile);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de l\'analyse CV:', error);
            }
        }
        
        setAppState('questionnaire');
    };
    
    const handleBackToPackages = () => {
        setSelectedPackage(null);
        setAppState('package-selection');
    };

    const handleQuestionnaireComplete = async (answers: Answer[], summary: Summary) => {
        setCurrentAnswers(answers);
        setCurrentSummary(summary);
        
        // Sauvegarder dans Supabase
        if (currentAssessmentId) {
            try {
                await assessmentService.saveQuestionnaireData(currentAssessmentId, {
                    answers,
                    userProfile
                });
                
                await assessmentService.saveSummary(currentAssessmentId, summary);
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du bilan:', error);
            }
        }

        setAppState('summary');
    };

    const handleRestart = () => {
        setUserName(currentUser?.full_name || currentUser?.email || '');
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

    const handleLogout = async () => {
        try {
            await authService.signOut();
            handleRestart();
            setAppState('login');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };
    
    const renderContent = () => {
        if (!isAuthenticated) {
            return <Login onLoginSuccess={handleLoginSuccess} />;
        }

        switch (appState) {
            case 'admin-dashboard':
                return <AdminDashboard onBack={() => setAppState('welcome')} />;
            case 'consultant-dashboard':
                return <ConsultantDashboard onBack={() => setAppState('welcome')} onViewAssessment={(assessment) => {
                    // TODO: Afficher le détail du bilan
                    console.log('View assessment:', assessment);
                }} />;
            case 'welcome':
                return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} userName={userName} onLogout={handleLogout} />;
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
                return <WelcomeScreen onStart={handleStart} onShowHistory={handleShowHistory} userName={userName} onLogout={handleLogout} />;
        }
    };

    return (
        <div className="App">
            {renderContent()}
        </div>
    );
};

export default App;
