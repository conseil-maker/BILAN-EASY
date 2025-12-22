import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Answer, Question, QuestionType, Message, CurrentPhaseInfo, Summary, UserProfile, DashboardData, CoachingStyle } from '../types';
import { generateQuestion, generateSummary, generateSynthesis, analyzeThemesAndSkills, suggestOptionalModule } from '../services/geminiService';
import { QUESTION_CATEGORIES, getTimeBudget, getCurrentPhase, isJourneyComplete, determineQuestionComplexity, shouldDeepenCategory, QUESTION_COMPLEXITY_TIME } from '../constants';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useDarkMode } from '../hooks/useDarkMode';
import SpeechSettings from './SpeechSettings';
import Dashboard from './Dashboard';
import EnhancedDashboard from './EnhancedDashboard';
import JourneyProgress from './JourneyProgress';
import Confetti from './Confetti';
import { supabase } from '../lib/supabaseClient';
// import { downloadPDF } from '../utils/pdfGenerator'; // Déplacé vers ClientDashboard
import { saveAssessmentToHistory } from '../services/historyService';
// useAutoSave supprimé - session gérée par Supabase dans ClientApp
import { useToast } from './ToastProvider';
import { 
  sendLocalNotification, 
  notifications, 
  getPermissionStatus,
  scheduleNotification 
} from '../services/pushNotificationService';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4M5 8v4a7 7 0 0014 0V8M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" /></svg>;
const SpeakerIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 17.142a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M12 12h.01" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
// DownloadIcon supprimé - Déplacé vers ClientDashboard
const JokerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5 5a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zm2-3a1 1 0 00-1.414 1.414L8.586 18l-1.293 1.293a1 1 0 101.414 1.414L10 19.414l1.293 1.293a1 1 0 001.414-1.414L11.414 18l1.293-1.293a1 1 0 00-1.414-1.414L10 16.586 8.707 15.293zM5 11a1 1 0 100 2h.01a1 1 0 100-2H5zm14-1a1 1 0 11-2 0v-2a1 1 0 112 0v2zM15 9a1 1 0 100-2h-.01a1 1 0 100 2H15z" clipRule="evenodd" /></svg>;

const BadgeNotification: React.FC<{ phaseName: string; onClose: () => void }> = ({ phaseName, onClose }) => {
    const [showConfetti, setShowConfetti] = useState(true);
    
    useEffect(() => {
        const confettiTimer = setTimeout(() => setShowConfetti(false), 3000);
        const badgeTimer = setTimeout(onClose, 4000);
        return () => {
            clearTimeout(confettiTimer);
            clearTimeout(badgeTimer);
        };
    }, [onClose]);

    return (
        <>
            {showConfetti && <Confetti duration={3000} />}
            <div className="fixed top-5 right-5 bg-gradient-to-r from-secondary to-primary-600 text-white p-6 rounded-xl shadow-2xl animate-fade-in-down z-50 border-2 border-white/30">
                <p className="font-bold text-xl mb-1">🎉 Badge débloqué !</p>
                <p className="text-white/90">Vous avez terminé : {phaseName}</p>
            </div>
        </>
    );
};

const SatisfactionModal: React.FC<{ phaseName: string; onSubmit: (rating: number, comment: string) => void; }> = ({ phaseName, onSubmit }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onSubmit(rating || 3, comment);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [rating, comment, onSubmit]);
    
    const handleStarClick = (star: number) => {
        // console.log('Rating set to:', star);
        setRating(star);
    };
    
    const handleSubmit = () => {
        // console.log('Submitting rating:', rating, 'comment:', comment);
        onSubmit(rating, comment);
    };
    
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onSubmit(rating || 3, comment);
        }
    };
    
    return (
        <div onClick={handleBackdropClick} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
                <button onClick={() => onSubmit(rating || 3, comment)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-2xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold font-display text-primary-800 mb-2">Votre avis sur la phase terminée</h2>
                <p className="text-slate-600 mb-4">"{phaseName}"</p>
                <div className="mb-4">
                    <p className="mb-2 text-slate-700">Cette phase vous a-t-elle semblé pertinente ?</p>
                    <div className="flex justify-center text-3xl gap-2">{[1, 2, 3, 4, 5].map(star => <span key={star} onClick={() => handleStarClick(star)} className={`cursor-pointer transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-300'}`}>★</span>)}</div>
                </div>
                <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Un commentaire ? (optionnel)" rows={3} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
                <div className="flex gap-3 mt-4">
                    <button onClick={handleSubmit} disabled={rating === 0} className="flex-1 bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors">Valider</button>
                    <button onClick={() => onSubmit(3, comment)} className="px-6 bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors">Passer</button>
                </div>
            </div>
        </div>
    );
};

const ModuleModal: React.FC<{ reason: string; onAccept: () => void; onDecline: () => void; }> = ({ reason, onAccept, onDecline }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold font-display text-primary-800 mb-2">Approfondissement proposé</h2>
            <p className="text-slate-600 mb-4">{reason}</p>
            <p className="text-sm text-slate-500 mb-6">Souhaitez-vous explorer ce sujet avec quelques questions supplémentaires ? C'est entièrement optionnel.</p>
            <div className="flex gap-4">
                <button onClick={onAccept} className="w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700">Oui, je suis intéressé(e)</button>
                <button onClick={onDecline} className="w-full bg-slate-200 text-slate-700 font-bold py-3 px-6 rounded-lg hover:bg-slate-300">Non, merci</button>
            </div>
        </div>
    </div>
);

interface QuestionnaireProps {
  pkg: Package;
  userName: string;
  userProfile: UserProfile | null;
  coachingStyle: CoachingStyle;
  onComplete: (answers: Answer[], summary: Summary) => void;
  onDashboard: () => void;
  onAnswersUpdate?: (answers: Answer[]) => void;
  initialAnswers?: Answer[]; // Pour restaurer une session en cours
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ pkg, userName, userProfile, coachingStyle, onComplete, onDashboard, onAnswersUpdate, initialAnswers }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [answers, setAnswers] = useState<Answer[]>(initialAnswers || []);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [currentPhaseInfo, setCurrentPhaseInfo] = useState<CurrentPhaseInfo | null>(null);
    const [textInput, setTextInput] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [showSaveNotification, setShowSaveNotification] = useState(false);
    const [showSatisfactionModal, setShowSatisfactionModal] = useState(false);
    const [satisfactionPhaseInfo, setSatisfactionPhaseInfo] = useState<CurrentPhaseInfo | null>(null);
    const [isAwaitingSynthesisConfirmation, setIsAwaitingSynthesisConfirmation] = useState(false);
    const [synthesisConfirmed, setSynthesisConfirmed] = useState<boolean | null>(null);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isDashboardLoading, setIsDashboardLoading] = useState(false);
    const [unlockedBadge, setUnlockedBadge] = useState<string | null>(null);
    const [suggestedModule, setSuggestedModule] = useState<{ id: string, reason: string } | null>(null);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [moduleQuestionCount, setModuleQuestionCount] = useState(0);
    const [declinedModules, setDeclinedModules] = useState<Set<string>>(new Set()); // Track des modules refusés
    const [satisfactionSubmittedPhases, setSatisfactionSubmittedPhases] = useState<Set<number>>(new Set());
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [categoryProgress, setCategoryProgress] = useState<Map<string, number>>(new Map());
    const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
    const [bilanStartTime] = useState<number>(Date.now());

    const chatEndRef = useRef<HTMLDivElement>(null);
    const SESSION_STORAGE_KEY = `autosave-${userName}-${pkg.id}`;
    const { isSpeaking, isSupported: speechSynthSupported, voices, settings, speak, cancel, onSettingsChange } = useSpeechSynthesis();
    const { isListening, isSupported: speechRecSupported, interimTranscript, finalTranscript, startListening, stopListening } = useSpeechRecognition({ lang: 'fr-FR' });
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { showSuccess, showError, showInfo } = useToast();
    const [userId, setUserId] = useState<string | undefined>(undefined);

    // Récupérer l'ID utilisateur pour l'auto-save
    useEffect(() => {
        const getUserId = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUserId(user.id);
        };
        getUserId();
    }, []);

    // Auto-save géré par Supabase dans ClientApp

    useEffect(() => { setTextInput(interimTranscript || finalTranscript); }, [interimTranscript, finalTranscript]);
    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(scrollToBottom, [messages]);

    // Planifier un rappel de notification si l'utilisateur quitte sans terminer
    useEffect(() => {
        const totalQuestions = pkg.phases.phase1.questionnaires + pkg.phases.phase2.questionnaires + pkg.phases.phase3.questionnaires;
        const questionsRestantes = totalQuestions - answers.length;
        
        // Planifier un rappel dans 24h si le bilan n'est pas terminé
        let reminderTimeout: NodeJS.Timeout | null = null;
        
        if (answers.length > 0 && questionsRestantes > 0 && getPermissionStatus() === 'granted') {
            // Rappel après 24h d'inactivité
            reminderTimeout = scheduleNotification(
                notifications.continuerBilan(questionsRestantes),
                24 * 60 * 60 * 1000 // 24 heures
            );
        }
        
        return () => {
            if (reminderTimeout) clearTimeout(reminderTimeout);
        };
    }, [answers.length, pkg]);

    const getPhaseInfo = useCallback((currentAnswers: Answer[]): CurrentPhaseInfo => {
        const currentPhase = getCurrentPhase(pkg.id, currentAnswers);
        const phaseKey = currentPhase.phase; // 'phase1' | 'phase2' | 'phase3'
        const phaseCategories = QUESTION_CATEGORIES[phaseKey];
        
        // Extraire le numéro de phase (1, 2, 3) depuis la clé ('phase1', 'phase2', 'phase3')
        const phaseNumber = parseInt(phaseKey.replace('phase', ''));
        
        return { 
            phase: phaseNumber, 
            name: currentPhase.name, 
            positionInPhase: currentPhase.questionnaire, 
            totalInPhase: pkg.phases[phaseKey].questionnaires, 
            satisfactionActive: phaseCategories.satisfactionActive 
        };
    }, [pkg]);
    
    const updateDashboard = useCallback(async (currentAnswers: Answer[]) => {
        // Analyser dès la première réponse pour montrer les thèmes progressivement
        if (currentAnswers.length < 1) return;
        setIsDashboardLoading(true);
        try {
            const data = await analyzeThemesAndSkills(currentAnswers);
            setDashboardData(data);
        } catch (error) { console.error("Error updating dashboard:", error); } 
        finally { setIsDashboardLoading(false); }
    }, []);

    const MAX_RETRIES = 3;

    const fetchNextQuestion = useCallback(async (options: { useJoker?: boolean } = {}, currentRetry = 0, currentAnswers?: Answer[]) => {
        // Utiliser les réponses passées en paramètre ou celles du state
        const answersToUse = currentAnswers || answers;
        // console.log(`[fetchNextQuestion] Using ${answersToUse.length} answers (param: ${currentAnswers?.length || 'none'}, state: ${answers.length})`);
        
        setIsLoading(true);
        setCurrentQuestion(null);
        // console.log(`[fetchNextQuestion] Attempt ${currentRetry + 1}/${MAX_RETRIES}`);
        
        // Ajouter un message de chargement visible
        if (currentRetry === 0) {
            const loadingMessage: Message = { sender: 'ai', text: '🤔 L\'IA réfléchit à votre prochaine question...', isLoading: true };
            setMessages(prev => [...prev, loadingMessage]);
        }
        try {
            let question;
            if (activeModule) {
                question = await generateQuestion('phase2', 0, answersToUse, userName, coachingStyle, null, { isModuleQuestion: { moduleId: activeModule, questionNum: moduleQuestionCount + 1 } });
            } else {
                const info = getPhaseInfo(answersToUse);
                // console.log('[fetchNextQuestion] Phase info:', info);
                setCurrentPhaseInfo(info);
                const phaseKey = `phase${info.phase}` as 'phase1' | 'phase2' | 'phase3';
                const phaseCategories = QUESTION_CATEGORIES[phaseKey].categories;
                // console.log('[fetchNextQuestion] Phase categories:', phaseCategories.length);
                
                // Trouver la prochaine catégorie à explorer
                let selectedCategory = null;
                let categoryIndex = 0;
                
                for (let i = 0; i < phaseCategories.length; i++) {
                    const cat = phaseCategories[i];
                    const questionsAsked = categoryProgress.get(cat.id) || 0;
                    
                    // Si la catégorie n'a pas atteint son minimum, la sélectionner
                    if (questionsAsked < cat.minQuestions) {
                        selectedCategory = cat;
                        categoryIndex = i;
                        break;
                    }
                    
                    // Sinon, vérifier si on doit l'approfondir
                    const timeBudget = getTimeBudget(pkg.id, answersToUse);
                    const phaseTimeRemaining = timeBudget[`phase${info.phase}Remaining` as 'phase1Remaining' | 'phase2Remaining' | 'phase3Remaining'];
                    
                    if (shouldDeepenCategory(cat.id, phaseKey, questionsAsked, phaseTimeRemaining)) {
                        selectedCategory = cat;
                        categoryIndex = i;
                        break;
                    }
                }
                
                // Si aucune catégorie trouvée, prendre la première non-maximale
                if (!selectedCategory) {
                    for (let i = 0; i < phaseCategories.length; i++) {
                        const cat = phaseCategories[i];
                        const questionsAsked = categoryProgress.get(cat.id) || 0;
                        if (questionsAsked < cat.maxQuestions) {
                            selectedCategory = cat;
                            categoryIndex = i;
                            break;
                        }
                    }
                }
                
                // Si toujours rien, prendre la première
                if (!selectedCategory) {
                    selectedCategory = phaseCategories[0];
                    categoryIndex = 0;
                }
                
                // console.log('[fetchNextQuestion] Selected category:', selectedCategory.id, 'at index:', categoryIndex);
                setCurrentCategoryId(selectedCategory.id);
                
                // Déterminer la complexité optimale
                const timeBudget = getTimeBudget(pkg.id, answersToUse);
                // console.log('[fetchNextQuestion] Time budget:', timeBudget);
                const phaseTimeRemaining = timeBudget[`phase${info.phase}Remaining` as 'phase1Remaining' | 'phase2Remaining' | 'phase3Remaining'];
                const questionsAskedInCategory = categoryProgress.get(selectedCategory.id) || 0;
                const complexity = determineQuestionComplexity(selectedCategory.id, phaseKey, phaseTimeRemaining, questionsAskedInCategory);
                // console.log('[fetchNextQuestion] Complexity:', complexity, 'for category:', selectedCategory.id);
                
                let genOptions: any = { useJoker: options.useJoker, targetComplexity: complexity, categoryId: selectedCategory.id };
                if (info.phase === 2 && answersToUse.length > 0 && answersToUse[answersToUse.length - 1].value.length > 3) {
                    genOptions.useGoogleSearch = true; genOptions.searchTopic = answersToUse[answersToUse.length - 1].value;
                }
                // console.log('[fetchNextQuestion] Calling generateQuestion with:', { phaseKey, categoryIndex, answersCount: answersToUse.length, userName, coachingStyle, hasProfile: !!userProfile, genOptions });
                question = await generateQuestion(phaseKey, categoryIndex, answersToUse, userName, coachingStyle, answersToUse.length === 0 ? userProfile : null, genOptions);
                // console.log('[fetchNextQuestion] Question generated:', { id: question.id, title: question.title?.substring(0, 50) });
            }
            setCurrentQuestion(question);
            // Fonction pour nettoyer les phrases techniques générées par l'IA
            const cleanTechnicalPhrases = (text: string): string => {
                const patterns = [
                    /\s*Question générée en fonction de votre réponse précédente\.?\s*/gi,
                    /\s*Question basée sur votre réponse précédente\.?\s*/gi,
                    /\s*Cette question est générée[^.]*\.?\s*/gi,
                    /\s*Généré automatiquement[^.]*\.?\s*/gi
                ];
                let cleaned = text;
                for (const pattern of patterns) {
                    cleaned = cleaned.replace(pattern, ' ');
                }
                return cleaned.trim().replace(/\s+/g, ' ');
            };
            // Créer le message AI avant de l'ajouter aux messages (avec nettoyage)
            const cleanTitle = cleanTechnicalPhrases(question.title || '');
            const cleanDescription = question.description ? cleanTechnicalPhrases(question.description) : '';
            const aiMessage: Message = { sender: 'ai', text: `${cleanTitle}${cleanDescription ? `\n\n${cleanDescription}` : ''}`, question }; 
            // Supprimer le message de chargement et ajouter la vraie question
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                return [...filtered, aiMessage];
            });
            if (speechSynthSupported && settings.voice) speak(aiMessage.text as string);
        } catch (error) {
            console.error(`[fetchNextQuestion] Error on attempt ${currentRetry + 1}:`, error);
            
            if (currentRetry < MAX_RETRIES - 1) {
                // Réessayer après un délai
                const delay = (currentRetry + 1) * 2000; // 2s, 4s, 6s
                // console.log(`[fetchNextQuestion] Retrying in ${delay}ms...`);
                setTimeout(() => fetchNextQuestion(options, currentRetry + 1, currentAnswers), delay);
                return; // Ne pas exécuter le finally pour garder isLoading à true
            } else {
                // Toutes les tentatives ont échoué, afficher un message d'erreur avec bouton
                console.error('[fetchNextQuestion] All retries failed');
                setMessages(prev => {
                    const filtered = prev.filter(m => !m.isLoading);
                    const errorMessage: Message = { 
                        sender: 'ai', 
                        text: `❌ Désolé, la génération de la question a échoué après ${MAX_RETRIES} tentatives.\n\nErreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\n💡 Vous pouvez réessayer ou passer à la synthèse.`,
                        isError: true
                    };
                    return [...filtered, errorMessage];
                });
                // Afficher une alerte pour proposer de réessayer
                const retry = window.confirm(
                    `❌ Une erreur est survenue lors de la génération de la question.\n\n` +
                    `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\n` +
                    `Voulez-vous réessayer ?`
                );
                if (retry) {
                    fetchNextQuestion(options, 0, currentAnswers); // Réessayer depuis le début
                }
            }
        } finally {
            setIsLoading(false);
        }
    }, [answers, userName, coachingStyle, getPhaseInfo, speak, speechSynthSupported, userProfile, activeModule, moduleQuestionCount, settings.voice, pkg.id]);

    const handleGenerateSynthesis = useCallback(async (currentAnswers: Answer[]) => {
        setIsLoading(true);
        try {
            const { synthesis, confirmationRequest } = await generateSynthesis(currentAnswers.slice(-3), userName, coachingStyle);
            const synthesisMessage: Message = { sender: 'ai', text: (<>{synthesis}<br/><br/>{confirmationRequest}</>), isSynthesis: true };
            setMessages(prev => [...prev, synthesisMessage]);
            setIsAwaitingSynthesisConfirmation(true);
        } catch (error) {
            console.error("Error generating synthesis:", error);
            await fetchNextQuestion({}, 0, currentAnswers);
        } finally {
            setIsLoading(false);
        }
    }, [userName, coachingStyle, fetchNextQuestion]);

    const runNextStep = useCallback(async (currentAnswers: Answer[]) => {
        // console.log('[runNextStep] Called with', currentAnswers.length, 'answers');
        // Vérifier si le parcours est terminé basé sur le budget temps
        const journeyComplete = isJourneyComplete(pkg.id, currentAnswers);
        // console.log('[runNextStep] Journey complete?', journeyComplete);
        if (journeyComplete) {
            setIsSummarizing(true);
            try {
                const finalSummary = await generateSummary(currentAnswers, pkg, userName, coachingStyle);
                // Session nettoyée par Supabase dans ClientApp
                
                // Envoyer une notification de bilan terminé
                if (getPermissionStatus() === 'granted') {
                    sendLocalNotification(notifications.bilanTermine());
                }
                
                onComplete(currentAnswers, finalSummary);
            } catch (error) {
                console.error('[runNextStep] Erreur lors de la génération de la synthèse:', error);
                setIsSummarizing(false);
                const retry = window.confirm(
                    `❌ Une erreur est survenue lors de la génération de votre synthèse.\n\n` +
                    `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\n` +
                    `Voulez-vous réessayer ?`
                );
                if (retry) {
                    // Réessayer
                    runNextStep(currentAnswers);
                } else {
                    // Retourner au questionnaire
                    showInfo('💾 Votre progression a été sauvegardée. Vous pouvez réessayer plus tard.');
                }
            }
            return;
        }

        // Notification de sauvegarde (gérée par Supabase dans ClientApp)
        if (currentAnswers.length > 0 && currentAnswers.length % 5 === 0) {
            setLastSaveTime(new Date());
            setShowSaveNotification(true); setTimeout(() => setShowSaveNotification(false), 3000);
        }
        
        // Mise à jour du dashboard tous les 3 réponses (plus fréquent)
        if (currentAnswers.length > 0 && currentAnswers.length % 3 === 0) {
            updateDashboard(currentAnswers);
        }

        if (currentAnswers.length > 0) {
            const info = getPhaseInfo(currentAnswers);
            const prevAnswers = currentAnswers.slice(0, -1);
            const prevInfo = prevAnswers.length > 0 ? getPhaseInfo(prevAnswers) : { phase: 1, name: '', satisfactionActive: false };
            
            // Vérifier si on change de phase
            if (info.phase !== prevInfo.phase) {
                // console.log(`[runNextStep] Transition de phase: ${prevInfo.phase} -> ${info.phase}`);
                setUnlockedBadge(`Phase ${prevInfo.phase} : ${prevInfo.name}`);
                
                // Vérifier si un module optionnel est suggéré (seulement si pas déjà refusé)
                try {
                    const moduleSuggestion = await suggestOptionalModule(currentAnswers);
                    if (moduleSuggestion.isNeeded && moduleSuggestion.moduleId && moduleSuggestion.reason) {
                        // Ne pas reproposer un module déjà refusé
                        if (!declinedModules.has(moduleSuggestion.moduleId)) {
                            setSuggestedModule({ id: moduleSuggestion.moduleId, reason: moduleSuggestion.reason });
                            return; // Attendre que l'utilisateur réponde au module
                        }
                    }
                } catch (error) {
                    console.error('[runNextStep] Erreur lors de la suggestion de module:', error);
                    // Continuer même si la suggestion échoue
                }
                
                // Vérifier si la satisfaction est active pour cette phase
                if (prevInfo.satisfactionActive && !satisfactionSubmittedPhases.has(prevInfo.phase)) {
                    setSatisfactionPhaseInfo(prevInfo);
                    setShowSatisfactionModal(true);
                    return; // Attendre que l'utilisateur soumette la satisfaction
                }
                
                // IMPORTANT: Après le changement de phase, continuer vers la prochaine question
                // console.log('[runNextStep] Transition de phase terminée, passage à la prochaine question');
            }
        }

        // DÉSACTIVÉ : La synthèse intermédiaire génère des questions de validation interdites
        // Le système génère maintenant des questions personnalisées en continu sans interruption
        // if (currentAnswers.length > 0 && currentAnswers.length % 3 === 0 && currentAnswers.length % 5 !== 0) {
        //     await handleGenerateSynthesis(currentAnswers);
        //     return;
        // }
        
        // Générer la prochaine question avec les réponses à jour
        // console.log('[runNextStep] Appel de fetchNextQuestion avec', currentAnswers.length, 'réponses');
        await fetchNextQuestion({}, 0, currentAnswers);
    }, [pkg, userName, coachingStyle, onComplete, SESSION_STORAGE_KEY, getPhaseInfo, updateDashboard, fetchNextQuestion, handleGenerateSynthesis, satisfactionSubmittedPhases]);

    useEffect(() => {
        // La session est gérée par Supabase dans ClientApp
        const startQuestionnaire = async () => {
            // Si on a des réponses initiales (reprise de session), les afficher comme messages
            if (initialAnswers && initialAnswers.length > 0) {
                const restoredMessages: Message[] = [];
                initialAnswers.forEach((answer) => {
                    // Ajouter la question (si on a le titre)
                    if (answer.questionTitle) {
                        restoredMessages.push({
                            sender: 'ai',
                            text: answer.questionTitle
                        });
                    }
                    // Ajouter la réponse
                    restoredMessages.push({
                        sender: 'user',
                        text: answer.value
                    });
                });
                setMessages(restoredMessages);
                // Mettre à jour le dashboard avec les réponses restaurées
                updateDashboard(initialAnswers);
                // Continuer avec la prochaine question
                await fetchNextQuestion({}, 0, initialAnswers);
            } else {
                // Démarrer normalement avec la première question
                await fetchNextQuestion({}, 0, []);
            }
        };
        startQuestionnaire();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (synthesisConfirmed !== null) {
            runNextStep(answers);
            setSynthesisConfirmed(null);
        }
    }, [synthesisConfirmed, answers, runNextStep]);

    const handleAnswerSubmit = (value: string) => {
        if (isLoading || !currentQuestion || isAwaitingSynthesisConfirmation) return;
        cancel();
        
        // Déterminer la complexité de la question (estimée par la longueur de la réponse et le contexte)
        let estimatedComplexity: 'simple' | 'moyenne' | 'complexe' | 'reflexion' = 'moyenne';
        if (value.length < 50) estimatedComplexity = 'simple';
        else if (value.length > 200) estimatedComplexity = 'complexe';
        else if (value.length > 400) estimatedComplexity = 'reflexion';
        
        const newAnswer: Answer = { 
            questionId: currentQuestion.id,
            questionTitle: currentQuestion.title, // Sauvegarder le titre pour éviter les répétitions
            value,
            complexity: estimatedComplexity,
            categoryId: currentCategoryId || undefined,
            timestamp: Date.now()
        };
        const newAnswers = [...answers, newAnswer];
        setMessages(prev => [...prev, { sender: 'user', text: value }]);
        setAnswers(newAnswers);
        onAnswersUpdate?.(newAnswers); // Synchroniser avec ClientApp pour sauvegarde Supabase
        setTextInput('');
        
        // Mettre à jour le progrès de la catégorie
        if (currentCategoryId) {
            setCategoryProgress(prev => {
                const newMap = new Map(prev);
                newMap.set(currentCategoryId, (newMap.get(currentCategoryId) || 0) + 1);
                return newMap;
            });
        }

        if (activeModule) {
            if (moduleQuestionCount + 1 >= 3) {
                setActiveModule(null); setModuleQuestionCount(0);
                runNextStep(newAnswers);
            } else {
                setModuleQuestionCount(prev => prev + 1);
                fetchNextQuestion({}, 0, newAnswers);
            }
        } else {
            runNextStep(newAnswers);
        }
    };
    
    const handleSynthesisConfirmation = (confirmed: boolean) => {
        setIsAwaitingSynthesisConfirmation(false);
        setMessages(prev => [...prev, { sender: 'user', text: confirmed ? "Oui, c'est exact." : "Non, pas tout à fait." }]);
        setSynthesisConfirmed(confirmed);
    };
    
    const handleSatisfactionSubmit = (rating: number, comment: string) => {
        // console.log({ phase: satisfactionPhaseInfo?.name, rating, comment });
        if (satisfactionPhaseInfo) {
            setSatisfactionSubmittedPhases(prev => new Set(prev).add(satisfactionPhaseInfo.phase));
        }
        setShowSatisfactionModal(false);
        setSatisfactionPhaseInfo(null);
        // Appeler directement fetchNextQuestion au lieu de runNextStep pour éviter la boucle
        fetchNextQuestion({}, 0, answers);
    };

    const handleModuleAccept = () => { setActiveModule(suggestedModule!.id); setSuggestedModule(null); fetchNextQuestion({}, 0, answers); };
    const handleModuleDecline = () => { 
        // Tracker le module refusé pour ne pas le reproposer
        if (suggestedModule) {
            setDeclinedModules(prev => new Set(prev).add(suggestedModule.id));
        }
        setSuggestedModule(null); 
        fetchNextQuestion({}, 0, answers); // Utiliser fetchNextQuestion au lieu de runNextStep pour éviter la boucle
    };
    const handleJoker = () => { if (!isLoading) { fetchNextQuestion({ useJoker: true }, 0, answers); } };
    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        // Sauvegarder les réponses en cours avant déconnexion
        if (answers.length > 0) {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await saveAssessmentToHistory({
                        id: `draft_${Date.now()}`,
                        date: new Date().toISOString(),
                        userName: userName,
                        packageName: pkg.name,
                        status: 'in_progress',
                        answers: answers,
                        summary: null,
                    }, user.id);
                    // console.log('Brouillon sauvegardé avant déconnexion');
                }
            } catch (error) {
                console.error('Erreur lors de la sauvegarde du brouillon:', error);
            }
        }
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    // Note: Le téléchargement PDF a été déplacé vers le Dashboard client
    // La synthèse est générée automatiquement à la fin du bilan

    if (isSummarizing) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
            <div className="text-center max-w-md mx-4">
                <div className="mb-8">
                    <svg className="w-24 h-24 mx-auto text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                    🧠 Génération de votre synthèse...
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Notre IA analyse vos réponses pour créer un rapport personnalisé.
                </p>
                <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">Analyse en cours...</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        ⏱️ Cela peut prendre jusqu'à 60 secondes.<br/>
                        Merci de votre patience !
                    </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
                    💾 Votre progression est automatiquement sauvegardée
                </p>
            </div>
        </div>
    );

    return (
        <>
            {unlockedBadge && <BadgeNotification phaseName={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
            {showSatisfactionModal && satisfactionPhaseInfo && <SatisfactionModal phaseName={satisfactionPhaseInfo.name} onSubmit={handleSatisfactionSubmit} />}
            {suggestedModule && <ModuleModal reason={suggestedModule.reason} onAccept={handleModuleAccept} onDecline={handleModuleDecline} />}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLogoutModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Êtes-vous sûr ?</h3>
                            <p className="text-slate-600 mb-6">Votre progression sera sauvegardée automatiquement. Vous pourrez reprendre là où vous vous êtes arrêté lors de votre prochaine connexion.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showHelpModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowHelpModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800">Aide & Conseils</h3>
                            </div>
                            <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            {/* Section 1: Parcours */}
                            <div>
                                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    Votre Parcours
                                </h4>
                                <p className="text-slate-600 mb-3">Votre bilan de compétences se déroule en 3 phases :</p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Phase 1 - Investigation :</strong> Découverte de vos motivations et passions</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Phase 2 - Analyse :</strong> Identification de vos compétences et expériences</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Phase 3 - Conclusion :</strong> Synthèse et plan d'action personnalisé</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Section 2: Conseils */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    Conseils pour Répondre
                                </h4>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>Prenez votre temps, il n'y a pas de mauvaise réponse</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>Soyez authentique et honnête dans vos réponses</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>Donnez des exemples concrets de votre expérience</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>Votre progression est sauvegardée automatiquement</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Section 3: Fonctionnalités */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    Fonctionnalités Disponibles
                                </h4>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Lecture vocale :</strong> Écoutez les questions lues à haute voix</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Thèmes émergents :</strong> Visualisez les thèmes identifiés au fil du parcours</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Analyse des compétences :</strong> Consultez votre radar de compétences</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>Sauvegarde automatique :</strong> Reprenez là où vous vous êtes arrêté</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Section 4: Contact */}
                            <div className="border-t pt-6 bg-slate-50 -mx-8 -mb-8 px-8 py-6 rounded-b-2xl">
                                <h4 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Besoin d'Aide ?
                                </h4>
                                <p className="text-slate-600">Notre équipe est là pour vous accompagner. Contactez-nous à <a href="mailto:support@bilancompetences.com" className="text-primary-600 hover:text-primary-700 font-medium">support@bilancompetences.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Indicateur de sauvegarde permanent */}
            <div className="fixed bottom-5 right-5 z-40">
                {showSaveNotification ? (
                    <div className="bg-green-600 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 animate-scale-in">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Sauvegardé !</span>
                    </div>
                ) : lastSaveTime && (
                    <div className="bg-slate-700 text-white px-3 py-1.5 rounded-full text-xs shadow-md flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
                        <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>
                            Sauvegardé il y a {Math.floor((new Date().getTime() - lastSaveTime.getTime()) / 1000 / 60) || '< 1'} min
                        </span>
                    </div>
                )}
            </div>
            
            <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
                <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center shadow-sm transition-colors duration-300">
                    <div>
                        <h1 className="font-bold text-lg text-primary-800 dark:text-primary-300 font-display transition-colors duration-300">{pkg.name}</h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{currentPhaseInfo?.name}</p>
                    </div>
                    {currentPhaseInfo && (() => {
                        const timeBudget = getTimeBudget(pkg.id, answers, bilanStartTime);
                        return (
                            <div className="text-center">
                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    {Math.floor(timeBudget.spent)} / {timeBudget.total} min
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    {answers.length} questions | {timeBudget.percentage.toFixed(0)}% complété
                                </div>
                            </div>
                        );
                    })()}
                    <div className="flex items-center gap-4">
                        {/* Bouton Dashboard */}
                        <button 
                            onClick={onDashboard} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors text-sm font-medium"
                            title="Retour au Dashboard"
                            aria-label="Retourner au tableau de bord"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </button>
                        {speechSynthSupported && <button onClick={() => isSpeaking ? cancel() : speak(messages[messages.length - 1]?.text as string)} className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Lecture vocale"><SpeakerIcon active={isSpeaking} /></button>}
                        <button onClick={toggleDarkMode} className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300" title={isDarkMode ? 'Mode clair' : 'Mode sombre'} aria-label={isDarkMode ? 'Activer le mode clair' : 'Activer le mode sombre'}>
                            {isDarkMode ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>
                        {/* Bouton PDF supprimé - La synthèse est disponible dans le Dashboard après le bilan */}
                        <button 
                            onClick={() => setShowHelpModal(true)} 
                            className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg p-1" 
                            title="Aide"
                            aria-label="Ouvrir l'aide et les conseils"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => setShowSettings(!showSettings)} 
                            className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg p-1" 
                            title="Paramètres"
                            aria-label="Ouvrir les paramètres de lecture vocale"
                        >
                            <SettingsIcon />
                        </button>
                        <button 
                            onClick={handleLogout} 
                            className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none rounded-lg p-1" 
                            title="Déconnexion"
                            aria-label="Se déconnecter de l'application"
                        >
                            <LogoutIcon />
                        </button>
                    </div>
                </header>
                
                {showSettings && speechSynthSupported && <div className="border-b"><SpeechSettings voices={voices} settings={settings} onSettingsChange={onSettingsChange} /></div>}

                <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2 flex flex-col h-full bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 transition-colors duration-300">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{animationDelay: `${index * 0.05}s`}}>
                                    {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 animate-scale-in">IA</div>}
                                    <div className={`max-w-xl p-4 rounded-2xl transition-all duration-300 hover:shadow-lg ${msg.sender === 'user' ? 'bg-primary-600 dark:bg-primary-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                        {msg.isSynthesis && (
                                            <div className="mt-4 flex gap-2" role="group" aria-label="Confirmation de la synthèse">
                                                <button 
                                                    onClick={() => handleSynthesisConfirmation(true)} 
                                                    className="bg-white/20 px-3 py-1 rounded-full text-xs hover:bg-white/30 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                                                    aria-label="Confirmer que la synthèse est exacte"
                                                >
                                                    Oui, c'est exact
                                                </button>
                                                <button 
                                                    onClick={() => handleSynthesisConfirmation(false)} 
                                                    className="bg-white/20 px-3 py-1 rounded-full text-xs hover:bg-white/30 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                                                    aria-label="Indiquer que la synthèse n'est pas tout à fait exacte"
                                                >
                                                    Non, pas tout à fait
                                                </button>
                                            </div>
                                        )}
                                        {msg.question?.type === QuestionType.MULTIPLE_CHOICE && msg.question.choices && (
                                            <div className="mt-4 space-y-2" role="radiogroup" aria-label="Choix de réponse">
                                                {msg.question.choices.map((choice, choiceIndex) => (
                                                    <button 
                                                        key={choice} 
                                                        onClick={() => handleAnswerSubmit(choice)} 
                                                        className="w-full text-left bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                                        role="radio"
                                                        aria-checked="false"
                                                        aria-label={`Choix ${choiceIndex + 1}: ${choice}`}
                                                    >
                                                        {choice}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && <div className="flex justify-start"><div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0">IA</div><div className="ml-3 p-4 bg-slate-200 rounded-2xl rounded-bl-none">...</div></div>}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 border-t bg-white dark:bg-slate-800 rounded-b-xl transition-colors duration-300">
                            {currentQuestion && currentQuestion.type !== QuestionType.MULTIPLE_CHOICE && (
                                <form onSubmit={e => { e.preventDefault(); handleAnswerSubmit(textInput); }} className="flex items-center gap-2" role="form" aria-label="Formulaire de réponse">
                                    <label htmlFor="answer-input" className="sr-only">Écrivez votre réponse</label>
                                    <input 
                                        id="answer-input"
                                        type="text" 
                                        value={textInput} 
                                        onChange={e => setTextInput(e.target.value)} 
                                        placeholder="Écrivez votre réponse..." 
                                        className="flex-1 w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300" 
                                        disabled={isLoading || isAwaitingSynthesisConfirmation}
                                        aria-label="Champ de saisie de votre réponse"
                                        aria-required="true"
                                    />
                                    {speechRecSupported && (
                                        <button 
                                            type="button" 
                                            onClick={() => isListening ? stopListening() : startListening()} 
                                            className="p-3 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg transition-colors"
                                            aria-label={isListening ? 'Arrêter l\'enregistrement vocal' : 'Démarrer l\'enregistrement vocal'}
                                            aria-pressed={isListening}
                                        >
                                            <MicIcon active={isListening} />
                                        </button>
                                    )}
                                    <button 
                                        type="submit" 
                                        className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 disabled:bg-slate-400 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" 
                                        disabled={isLoading || !textInput.trim() || isAwaitingSynthesisConfirmation}
                                        aria-label="Envoyer la réponse"
                                    >
                                        <SendIcon />
                                    </button>
                                </form>
                            )}
                             <button 
                                onClick={handleJoker} 
                                className="mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center w-full disabled:opacity-50 focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg p-2 transition-colors" 
                                disabled={isLoading || isAwaitingSynthesisConfirmation}
                                aria-label="Demander de l'aide pour répondre à la question"
                            >
                                <JokerIcon/> J'ai besoin d'aide pour répondre
                            </button>
                        </div>
                    </div>
                    <aside 
                        className="hidden lg:block h-full overflow-y-auto bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-6 transition-colors duration-300"
                        role="complementary"
                        aria-label="Tableau de bord avec thèmes émergents et analyse des compétences"
                    >
                        <EnhancedDashboard 
                            data={dashboardData} 
                            isLoading={isDashboardLoading}
                            userName={userName}
                            currentPhase={currentPhaseInfo?.name}
                            questionsAnswered={answers.length}
                            totalQuestions={pkg.questions}
                            timeSpent={Math.floor((Date.now() - bilanStartTime) / 60000)}
                        />
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Questionnaire;