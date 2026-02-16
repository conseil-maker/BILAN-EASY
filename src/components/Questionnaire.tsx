import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Answer, Question, QuestionType, Message, CurrentPhaseInfo, Summary, UserProfile, DashboardData, CoachingStyle } from '../types';
import { generateQuestion, generateSummary, generateSynthesis, analyzeThemesAndSkills, suggestOptionalModule, detectCareerExplorationNeed, CareerPath, ExplorationNeedResult, analyzeResponseScope, ResponseAnalysisResult, exploreJobMarket, MarketExplorationResult, JobInterviewResult } from '../services/geminiService';
import { CareerExploration } from './CareerExploration';
import { MarketExploration } from './MarketExploration';
import { JobInterview } from './JobInterview';
import { QUESTION_CATEGORIES, getTimeBudget, getCurrentPhase, isJourneyComplete, determineQuestionComplexity, shouldDeepenCategory, QUESTION_COMPLEXITY_TIME } from '../constants';
import { calculateProgression, ProgressionInfo } from '../services/progressionService';
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
import { getTranslatedPackageName, translatePhaseNameFromFrench } from '../utils/packageTranslations';
import { 
  sendLocalNotification, 
  notifications, 
  getPermissionStatus,
  scheduleNotification 
} from '../services/pushNotificationService';

// Import des sous-composants du questionnaire
import { BadgeNotification, SatisfactionModal, ModuleModal, ChatMessage, ChatInput, ThemesPanel } from './questionnaire';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4M5 8v4a7 7 0 0014 0V8M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" /></svg>;
const SpeakerIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 17.142a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M12 12h.01" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
// DownloadIcon supprimé - Déplacé vers ClientDashboard
const JokerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5 5a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zm2-3a1 1 0 00-1.414 1.414L8.586 18l-1.293 1.293a1 1 0 101.414 1.414L10 19.414l1.293 1.293a1 1 0 001.414-1.414L11.414 18l1.293-1.293a1 1 0 00-1.414-1.414L10 16.586 8.707 15.293zM5 11a1 1 0 100 2h.01a1 1 0 100-2H5zm14-1a1 1 0 11-2 0v-2a1 1 0 112 0v2zM15 9a1 1 0 100-2h-.01a1 1 0 100 2H15z" clipRule="evenodd" /></svg>;

// BadgeNotification, SatisfactionModal et ModuleModal sont maintenant importés depuis ./questionnaire/

interface QuestionnaireProps {
  pkg: Package;
  userName: string;
  userProfile: UserProfile | null;
  coachingStyle: CoachingStyle;
  onComplete: (answers: Answer[], summary: Summary) => void;
  onDashboard: () => void;
  onAnswersUpdate?: (answers: Answer[]) => void;
  onLastAiMessageUpdate?: (message: string) => void; // Pour sauvegarder la dernière question IA
  initialAnswers?: Answer[]; // Pour restaurer une session en cours
  initialLastAiMessage?: string; // Dernière question IA pour reprise exacte
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ pkg, userName, userProfile, coachingStyle, onComplete, onDashboard, onAnswersUpdate, onLastAiMessageUpdate, initialAnswers, initialLastAiMessage }) => {
    const { t, i18n } = useTranslation('questionnaire');
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
    const [showSidePanel, setShowSidePanel] = useState(true);
    const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
    const [categoryProgress, setCategoryProgress] = useState<Map<string, number>>(new Map());
    const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null);
    const [bilanStartTime] = useState<number>(Date.now());
    
    // États pour l'exploration de métiers
    const [showCareerExploration, setShowCareerExploration] = useState(false);
    const [careerExplorationOffered, setCareerExplorationOffered] = useState(false);
    const [showCareerExplorationProposal, setShowCareerExplorationProposal] = useState(false);
    const [explorationNeedResult, setExplorationNeedResult] = useState<ExplorationNeedResult | null>(null);
    const [validatedCareerPaths, setValidatedCareerPaths] = useState<CareerPath[]>([]);
    
    // États pour la transition de fin du bilan (amélioration UX)
    const [showEndWarning, setShowEndWarning] = useState(false); // Avertissement à 80%
    const [endWarningShown, setEndWarningShown] = useState(false); // Pour ne pas réafficher
    const [showEndConfirmation, setShowEndConfirmation] = useState(false); // Confirmation avant synthèse
    const [userWantsToDeepen, setUserWantsToDeepen] = useState(false); // Si l'utilisateur veut approfondir
    
    // États pour la détection des réponses hors-cadre
    const [showOutOfScopeModal, setShowOutOfScopeModal] = useState(false);
    const [outOfScopeAnalysis, setOutOfScopeAnalysis] = useState<ResponseAnalysisResult | null>(null);
    const [outOfScopeWarningCount, setOutOfScopeWarningCount] = useState(0); // Compteur d'avertissements
    
    // États pour l'exploration du marché et les enquêtes métiers
    const [showMarketExploration, setShowMarketExploration] = useState(false);
    const [showJobInterview, setShowJobInterview] = useState(false);
    const [selectedJobForInterview, setSelectedJobForInterview] = useState<string>('');
    const [marketExplorationData, setMarketExplorationData] = useState<MarketExplorationResult | null>(null);
    const [jobInterviewData, setJobInterviewData] = useState<JobInterviewResult | null>(null);
    const [marketExplorationOffered, setMarketExplorationOffered] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);
    const SESSION_STORAGE_KEY = `autosave-${userName}-${pkg.id}`;
    const { isSpeaking, isSupported: speechSynthSupported, voices, settings, speak, cancel, onSettingsChange } = useSpeechSynthesis();
    const { isListening, isSupported: speechRecSupported, interimTranscript, finalTranscript, startListening, stopListening, clearTranscript } = useSpeechRecognition({ lang: i18n.language === 'tr' ? 'tr-TR' : 'fr-FR' });
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

    // Synchroniser la dictée vocale avec le champ de saisie
    // Ne pas écraser si les deux sont vides (pour éviter de réinjecter après envoi)
    useEffect(() => {
      if (interimTranscript || finalTranscript) {
        setTextInput(interimTranscript || finalTranscript);
      }
    }, [interimTranscript, finalTranscript]);
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
                // Toujours passer le userProfile pour personnaliser les questions avec le contexte du CV
                question = await generateQuestion(phaseKey, categoryIndex, answersToUse, userName, coachingStyle, userProfile, genOptions);
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
            const aiMessageText = `${cleanTitle}${cleanDescription ? `\n\n${cleanDescription}` : ''}`;
            const aiMessage: Message = { sender: 'ai', text: aiMessageText, question }; 
            // Supprimer le message de chargement et ajouter la vraie question
            // Vérifier qu'on n'ajoute pas un doublon (même texte déjà présent)
            setMessages(prev => {
                const filtered = prev.filter(m => !m.isLoading);
                // Vérifier si le message existe déjà pour éviter les doublons
                const isDuplicate = filtered.some(m => 
                    m.sender === 'ai' && 
                    m.text === aiMessageText
                );
                if (isDuplicate) {
                    console.warn('[fetchNextQuestion] Message AI en doublon détecté, ignoré:', aiMessageText.substring(0, 50));
                    return filtered;
                }
                return [...filtered, aiMessage];
            });
            
            // Sauvegarder la dernière question IA pour la reprise de session
            if (onLastAiMessageUpdate) {
                onLastAiMessageUpdate(aiMessageText);
            }
            
            // La voix est maintenant contrôlée par settings.enabled dans le hook
            if (speechSynthSupported && settings.enabled) speak(aiMessageText);
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
        
        // Calculer la progression pour l'avertissement de fin
        // IMPORTANT: Utiliser calculateProgression (basé sur le nombre de questions)
        // et NON getTimeBudget (basé sur le temps écoulé) pour éviter les incohérences
        const progressionForWarning = calculateProgression(currentAnswers, pkg.id, userProfile);
        const progressPercentage = progressionForWarning.globalProgress;
        
        // Avertissement à 80% du parcours (une seule fois)
        if (progressPercentage >= 80 && progressPercentage < 95 && !endWarningShown) {
            setEndWarningShown(true);
            setShowEndWarning(true);
            // L'avertissement est juste informatif, on continue après
        }
        
        // Vérifier si le parcours est terminé basé sur le budget temps
        const journeyComplete = isJourneyComplete(pkg.id, currentAnswers);
        // console.log('[runNextStep] Journey complete?', journeyComplete);
        
        if (journeyComplete) {
            // Si l'utilisateur a demandé à approfondir, on lui pose encore quelques questions
            if (userWantsToDeepen) {
                setUserWantsToDeepen(false); // Reset pour la prochaine fois
                // Continuer avec quelques questions supplémentaires
                await fetchNextQuestion({}, 0, currentAnswers);
                return;
            }
            
            // Afficher la confirmation avant de générer la synthèse
            if (!showEndConfirmation) {
                setShowEndConfirmation(true);
                return; // Attendre la réponse de l'utilisateur
            }
            
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
                setUnlockedBadge(`Phase ${prevInfo.phase} : ${translatePhaseNameFromFrench(prevInfo.name)}`);
                
                // === MESSAGE DE TRANSITION DE PHASE ===
                // Ajouter un message explicite pour annoncer le passage à la nouvelle phase
                const isTurkish = i18n.language === 'tr';
                const transitionMessages: Record<string, { recap: string; intro: string }> = isTurkish ? {
                    '1_to_2': {
                        recap: `${userName}, **Ön Aşama**'yı tamamladık. Artık mevcut durumunuz, bu değerlendirme için motivasyonlarınız ve beklentileriniz hakkında iyi bir anlayışa sahibim.`,
                        intro: `Şimdi **Araştırma Aşaması**'na geçiyoruz — değerlendirmenin kalbi. Yetkinliklerinizi, mesleki değerlerinizi, motivasyonlarınızı ve gelişim olanaklarınızı derinlemesine keşfedeceğiz. Bu aşama daha kapsamlıdır, her soru üzerinde düşünmek için zaman ayırın.`
                    },
                    '2_to_3': {
                        recap: `${userName}, **Araştırma Aşaması** tamamlandı. Temel yetkinliklerinizi, değerlerinizi, motivasyonlarınızı belirledik ve çeşitli kariyer yollarını keşfettik.`,
                        intro: `Şimdi **Sonuç Aşaması**'na giriyoruz. Hedeflerinizi gerçeklikle yüzleştirmenin, kariyer projenizi doğrulamanın ve somut bir eylem planı oluşturmanın zamanı geldi.`
                    }
                } : {
                    '1_to_2': {
                        recap: `${userName}, nous avons terminé la **Phase Préliminaire**. J'ai maintenant une bonne compréhension de votre situation actuelle, de vos motivations pour ce bilan et de vos attentes.`,
                        intro: `Nous passons maintenant à la **Phase d'Investigation** — le cœur du bilan. Nous allons explorer en profondeur vos compétences, vos valeurs professionnelles, vos motivations et les possibilités d'évolution. Cette phase est plus approfondie, prenez le temps de réfléchir à chaque question.`
                    },
                    '2_to_3': {
                        recap: `${userName}, la **Phase d'Investigation** est terminée. Nous avons identifié vos compétences clés, vos valeurs, vos motivations et exploré plusieurs pistes professionnelles.`,
                        intro: `Nous entrons maintenant dans la **Phase de Conclusion**. C'est le moment de confronter vos aspirations avec la réalité, de valider votre projet professionnel et de construire un plan d'action concret.`
                    }
                };
                
                const transitionKey = `${prevInfo.phase}_to_${info.phase}`;
                const transition = transitionMessages[transitionKey];
                
                if (transition) {
                    // Ajouter le message de récapitulatif
                    setMessages(prev => [...prev, {
                        sender: 'ai',
                        text: transition.recap
                    }]);
                    
                    // Ajouter le message d'introduction de la nouvelle phase après un court délai
                    setTimeout(() => {
                        setMessages(prev => [...prev, {
                            sender: 'ai',
                            text: transition.intro
                        }]);
                    }, 1500);
                }
                
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
            
            // Vérifier si on doit proposer l'exploration de métiers (après 10 réponses)
            // Déclenché après suffisamment de réponses pour avoir un profil clair
            if (currentAnswers.length >= 10 && !careerExplorationOffered) {
                try {
                    const explorationNeed = await detectCareerExplorationNeed(currentAnswers);
                    if (explorationNeed.needsExploration && explorationNeed.confidence >= 60) {
                        setExplorationNeedResult(explorationNeed);
                        setShowCareerExplorationProposal(true);
                        setCareerExplorationOffered(true);
                        return; // Attendre la réponse de l'utilisateur
                    } else {
                        setCareerExplorationOffered(true); // Ne pas reproposer
                    }
                } catch (error) {
                    console.error('[runNextStep] Erreur lors de la détection d\'exploration:', error);
                    setCareerExplorationOffered(true); // Ne pas bloquer le bilan
                }
            }
        }

        // R6 : Mini-synthèses conversationnelles toutes les 6 questions
        // Ces synthèses ne comptent PAS dans le quota de questions
        if (currentAnswers.length > 0 && currentAnswers.length % 6 === 0) {
            console.log(`[runNextStep] Mini-synthèse intermédiaire après ${currentAnswers.length} questions`);
            // Ajouter un message de synthèse conversationnelle dans le chat
            const recentAnswers = currentAnswers.slice(-6);
            const themes = recentAnswers
                .map(a => a.categoryId || a.questionTitle?.split(' ').slice(0, 3).join(' '))
                .filter(Boolean);
            const uniqueThemes = [...new Set(themes)];
            
            const synthMessage: Message = {
                sender: 'ai',
                text: `${t('miniSynthesis.title', { count: currentAnswers.length })} ${t('miniSynthesis.intro')}${uniqueThemes.map(th => `• ${th}`).join('\n')}${t('miniSynthesis.footer')}`,
                isSynthesis: true
            };
            setMessages(prev => [...prev, synthMessage]);
            // Petit délai pour que l'utilisateur voie la synthèse avant la question suivante
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // Générer la prochaine question avec les réponses à jour
        await fetchNextQuestion({}, 0, currentAnswers);
    }, [pkg, userName, coachingStyle, onComplete, SESSION_STORAGE_KEY, getPhaseInfo, updateDashboard, fetchNextQuestion, handleGenerateSynthesis, satisfactionSubmittedPhases, careerExplorationOffered, endWarningShown, showEndConfirmation, userWantsToDeepen, answers, userProfile]);

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
                
                // Si on a la dernière question IA sauvegardée, la restaurer au lieu de regénérer
                if (initialLastAiMessage) {
                    restoredMessages.push({
                        sender: 'ai',
                        text: initialLastAiMessage
                    });
                    setMessages(restoredMessages);
                    setIsLoading(false);
                    // Créer une question factice pour permettre de répondre
                    const info = getPhaseInfo(initialAnswers);
                    setCurrentPhaseInfo(info);
                    setCurrentQuestion({
                        id: `restored-${Date.now()}`,
                        text: initialLastAiMessage,
                        type: 'text' as QuestionType,
                        category: 'general',
                        phase: info.phase
                    });
                } else {
                    setMessages(restoredMessages);
                    // Pas de dernière question sauvegardée, générer une nouvelle
                    await fetchNextQuestion({}, 0, initialAnswers);
                }
                
                // Mettre à jour le dashboard avec les réponses restaurées
                updateDashboard(initialAnswers);
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

    const handleAnswerSubmit = async (value: string) => {
        if (isLoading || !currentQuestion || isAwaitingSynthesisConfirmation) return;
        cancel();
        
        // Désactiver le micro automatiquement après l'envoi du message
        if (isListening) {
            stopListening();
        }
        
        // Ajouter le message utilisateur immédiatement (une seule fois)
        setMessages(prev => [...prev, { sender: 'user', text: value }]);
        
        // === DÉTECTION DES RÉPONSES HORS-CADRE ===
        // Analyser la réponse pour détecter les situations problématiques
        // (mineur, hors contexte, non-sens, etc.)
        // Activer uniquement pour les premières réponses ou si déjà averti
        if (answers.length < 5 || outOfScopeWarningCount > 0) {
            try {
                const scopeAnalysis = await analyzeResponseScope(
                    value,
                    answers,
                    currentQuestion.title || currentQuestion.text || '',
                    userName
                );
                
                // Si la réponse est hors-cadre avec une sévérité moyenne ou plus
                if (!scopeAnalysis.isInScope && ['medium', 'high', 'critical'].includes(scopeAnalysis.severity)) {
                    setOutOfScopeAnalysis(scopeAnalysis);
                    setOutOfScopeWarningCount(prev => prev + 1);
                    
                    // Afficher le message de recadrage de l'IA
                    setMessages(prev => [...prev, { 
                        sender: 'ai', 
                        text: scopeAnalysis.message,
                        isRedirect: true
                    }]);
                    
                    // Si arrêt recommandé (cas critique), afficher le modal
                    if (scopeAnalysis.suggestedAction === 'stop' || scopeAnalysis.severity === 'critical') {
                        setShowOutOfScopeModal(true);
                        return;
                    }
                    
                    // Sinon, continuer mais ne pas enregistrer cette réponse
                    // et reposer une question pour recentrer
                    setTextInput('');
                    clearTranscript();
                    await fetchNextQuestion({}, 0, answers);
                    return;
                }
            } catch (error) {
                console.error('[handleAnswerSubmit] Erreur analyse hors-cadre:', error);
                // En cas d'erreur, continuer normalement
            }
        }
        
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
        // Message déjà ajouté au début de la fonction
        setAnswers(newAnswers);
        onAnswersUpdate?.(newAnswers); // Synchroniser avec ClientApp pour sauvegarde Supabase
        setTextInput('');
        clearTranscript(); // Réinitialiser la dictée vocale pour éviter la réinjection
        
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
        setMessages(prev => [...prev, { sender: 'user', text: confirmed ? t('synthesis.confirmYesText') : t('synthesis.confirmNoText') }]);
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
    // Traçabilité des demandes d'aide pour Qualiopi
    const [helpRequests, setHelpRequests] = useState<Array<{ timestamp: Date; questionId: string; questionTitle: string }>>([]);
    
    const handleJoker = () => { 
        if (!isLoading) { 
            // Tracer la demande d'aide pour Qualiopi
            const helpRequest = {
                timestamp: new Date(),
                questionId: currentQuestion?.id || 'unknown',
                questionTitle: currentQuestion?.title || 'Question en cours'
            };
            setHelpRequests(prev => [...prev, helpRequest]);
            console.log('[Qualiopi] Demande d\'aide tracée:', helpRequest);
            
            fetchNextQuestion({ useJoker: true }, 0, answers); 
        } 
    };
    
    // Handlers pour l'exploration de métiers
    const handleCareerExplorationAccept = () => {
        setShowCareerExplorationProposal(false);
        setShowCareerExploration(true);
    };
    
    const handleCareerExplorationDecline = () => {
        setShowCareerExplorationProposal(false);
        fetchNextQuestion({}, 0, answers);
    };
    
    const handleCareerExplorationClose = () => {
        setShowCareerExploration(false);
        // Ajouter un message récapitulatif si des pistes ont été validées
        if (validatedCareerPaths.length > 0) {
            const pathNames = validatedCareerPaths.map(p => p.title).join(', ');
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: t('careerExploration.closeMessage', { count: validatedCareerPaths.length, paths: pathNames })
            }]);
        }
        fetchNextQuestion({}, 0, answers);
    };
    
    const handleCareerPathSelect = (path: CareerPath, reaction: 'interested' | 'not_interested' | 'need_more_info') => {
        if (reaction === 'interested') {
            setValidatedCareerPaths(prev => [...prev.filter(p => p.title !== path.title), path]);
        } else if (reaction === 'not_interested') {
            setValidatedCareerPaths(prev => prev.filter(p => p.title !== path.title));
        }
    };
    
    const handleCareerFollowUpAnswer = (question: string, answer: string) => {
        // Ajouter la réponse aux answers pour enrichir le profil
        const newAnswer: Answer = {
            questionId: `career_exploration_${Date.now()}`,
            questionTitle: question,
            value: answer,
            categoryId: 'exploration_possibilites',
            timestamp: Date.now()
        };
        const newAnswers = [...answers, newAnswer];
        setAnswers(newAnswers);
        if (onAnswersUpdate) onAnswersUpdate(newAnswers);
    };
    
    // Handlers pour l'exploration du marché
    const handleMarketExplorationOpen = (jobTitle: string) => {
        setSelectedJobForInterview(jobTitle);
        setShowMarketExploration(true);
    };
    
    const handleMarketExplorationClose = (result?: MarketExplorationResult) => {
        setShowMarketExploration(false);
        if (result) {
            setMarketExplorationData(result);
            // Ajouter un message récapitulatif
            setMessages(prev => [...prev, {
                sender: 'ai',
                text: t('marketExploration.closeMessage', { job: selectedJobForInterview, score: result.feasibilityAnalysis.overallScore, comment: result.feasibilityAnalysis.feasibilityComment.substring(0, 150) })
            }]);
        }
        fetchNextQuestion({}, 0, answers);
    };
    
    const handleStartJobInterview = (jobTitle: string) => {
        setSelectedJobForInterview(jobTitle);
        setShowMarketExploration(false);
        setShowJobInterview(true);
    };
    
    const handleJobInterviewClose = () => {
        setShowJobInterview(false);
        fetchNextQuestion({}, 0, answers);
    };
    
    const handleJobInterviewComplete = (result: JobInterviewResult, conversationHistory: any[]) => {
        setJobInterviewData(result);
        setShowJobInterview(false);
        // Ajouter un message récapitulatif
        setMessages(prev => [...prev, {
            sender: 'ai',
            text: t('marketExploration.interviewCloseMessage', { name: result.professionalPersona.name, job: selectedJobForInterview })
        }]);
        fetchNextQuestion({}, 0, answers);
    };
    
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
                    {t('summarizing.title')}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-6">
                    {t('summarizing.description')}
                </p>
                <div className="bg-white dark:bg-slate-700 rounded-xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">{t('summarizing.analyzing')}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('summarizing.timeEstimate')}<br/>
                        {t('summarizing.patience')}
                    </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-6">
                    {t('summarizing.autoSave')}
                </p>
            </div>
        </div>
    );

    return (
        <>
            {unlockedBadge && <BadgeNotification phaseName={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
            {showSatisfactionModal && satisfactionPhaseInfo && <SatisfactionModal phaseName={satisfactionPhaseInfo.name} onSubmit={handleSatisfactionSubmit} />}
            {suggestedModule && <ModuleModal reason={suggestedModule.reason} onAccept={handleModuleAccept} onDecline={handleModuleDecline} />}
            
            {/* Modal d'avertissement de fin de bilan (à 80%) */}
            {showEndWarning && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🎯</span>
                            </div>
                            <h2 className="text-2xl font-bold font-display text-amber-800 dark:text-amber-200 mb-2">
                                {t('endWarning.title')}
                            </h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4 text-center" dangerouslySetInnerHTML={{ __html: t('endWarning.description', { percent: calculateProgression(answers, pkg.id, userProfile).globalProgress }) }} />
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800" dangerouslySetInnerHTML={{ __html: t('endWarning.hint') }} />
                        <button 
                            onClick={() => setShowEndWarning(false)} 
                            className="w-full bg-amber-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            {t('endWarning.continue')}
                        </button>
                    </div>
                </div>
            )}
            
            {/* Modal de confirmation avant génération de synthèse */}
            {showEndConfirmation && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h2 className="text-2xl font-bold font-display text-green-800 dark:text-green-200 mb-2">
                                {t('endConfirmation.title')}
                            </h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4 text-center" dangerouslySetInnerHTML={{ __html: t('endConfirmation.description', { count: answers.length }) }} />
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                <strong>{t('endConfirmation.beforeContinue')}</strong>
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {t('endConfirmation.deepenQuestion')}
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => {
                                    setShowEndConfirmation(false);
                                    // Continuer vers la synthèse
                                    runNextStep(answers);
                                }} 
                                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {t('endConfirmation.generateSynthesis')}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowEndConfirmation(false);
                                    setUserWantsToDeepen(true);
                                    // Continuer avec quelques questions supplémentaires
                                    fetchNextQuestion({}, 0, answers);
                                }} 
                                className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                {t('endConfirmation.deepen')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de proposition d'exploration de métiers */}
            {showCareerExplorationProposal && explorationNeedResult && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold font-display text-primary-800 dark:text-white mb-2">
                                {t('careerExploration.title')}
                            </h2>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 mb-4">
                            {explorationNeedResult.reason}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                            {t('careerExploration.hint')}
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={handleCareerExplorationAccept} 
                                className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                {t('careerExploration.accept')}
                            </button>
                            <button 
                                onClick={handleCareerExplorationDecline} 
                                className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 px-6 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                            >
                                {t('careerExploration.decline')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Composant d'exploration de métiers */}
            {showCareerExploration && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl my-8">
                        <CareerExploration
                            answers={answers}
                            userName={userName}
                            onClose={handleCareerExplorationClose}
                            onSelectPath={handleCareerPathSelect}
                            onFollowUpAnswer={handleCareerFollowUpAnswer}
                        />
                    </div>
                </div>
            )}
            
            {/* Composant d'exploration du marché de l'emploi */}
            {showMarketExploration && selectedJobForInterview && (
                <MarketExploration
                    answers={answers}
                    targetJobTitle={selectedJobForInterview}
                    userName={userName}
                    onClose={() => handleMarketExplorationClose()}
                    onExplorationComplete={handleMarketExplorationClose}
                    onStartJobInterview={handleStartJobInterview}
                />
            )}
            
            {/* Composant d'enquête métier simulée */}
            {showJobInterview && selectedJobForInterview && (
                <JobInterview
                    answers={answers}
                    targetJobTitle={selectedJobForInterview}
                    userName={userName}
                    onClose={handleJobInterviewClose}
                    onInterviewComplete={handleJobInterviewComplete}
                />
            )}
            
            {/* Modal pour les situations hors-cadre critiques */}
            {showOutOfScopeModal && outOfScopeAnalysis && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t('outOfScope.title')}</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6 text-left">
                                {outOfScopeAnalysis.message}
                            </p>
                            
                            {/* Ressources alternatives dynamiques */}
                            {outOfScopeAnalysis.alternativeResources && outOfScopeAnalysis.alternativeResources.length > 0 && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-left">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{t('outOfScope.resources')}</h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        {outOfScopeAnalysis.alternativeResources.map((resource, idx) => (
                                            <li key={idx}>• {resource}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            {/* Ressources par défaut pour les mineurs si pas de ressources dynamiques */}
                            {outOfScopeAnalysis.issueType === 'age_inappropriate' && (!outOfScopeAnalysis.alternativeResources || outOfScopeAnalysis.alternativeResources.length === 0) && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 text-left">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">{t('outOfScope.resources')}</h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                                        <li>• {t('outOfScope.defaultResources.cio')}</li>
                                        <li>• {t('outOfScope.defaultResources.counselor')}</li>
                                        <li>• {t('outOfScope.defaultResources.parcoursup')}</li>
                                        <li>• {t('outOfScope.defaultResources.onisep')}</li>
                                    </ul>
                                </div>
                            )}
                            
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowOutOfScopeModal(false);
                                        setTextInput(''); // Vider la barre de saisie
                                        clearTranscript(); // Vider aussi la transcription vocale
                                        // Rediriger vers le tableau de bord
                                        window.location.hash = '#/dashboard';
                                    }}
                                    className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {t('outOfScope.backToDashboard')}
                                </button>
                                {outOfScopeAnalysis.severity !== 'critical' && (
                                    <button
                                        onClick={() => {
                                            setShowOutOfScopeModal(false);
                                            setTextInput(''); // Vider la barre de saisie
                                            clearTranscript(); // Vider aussi la transcription vocale
                                            fetchNextQuestion({}, 0, answers);
                                        }}
                                        className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                                    >
                                        {t('outOfScope.continueAnyway')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowLogoutModal(false)}>
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">{t('logoutModal.title')}</h3>
                            <p className="text-slate-600 mb-6">{t('logoutModal.description')}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                                >
                                    {t('logoutModal.cancel')}
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                                >
                                    {t('logoutModal.confirm')}
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
                                <h3 className="text-2xl font-bold text-slate-800">{t('helpModal.title')}</h3>
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
                                    {t('helpModal.journey.title')}
                                </h4>
                                <p className="text-slate-600 mb-3">{t('helpModal.journey.description')}</p>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.journey.phase1Title')}</strong> {t('helpModal.journey.phase1Desc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.journey.phase2Title')}</strong> {t('helpModal.journey.phase2Desc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.journey.phase3Title')}</strong> {t('helpModal.journey.phase3Desc')}</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Section 2: Conseils */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    {t('helpModal.tips.title')}
                                </h4>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>{t('helpModal.tips.tip1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>{t('helpModal.tips.tip2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>{t('helpModal.tips.tip3')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-600 font-bold mt-0.5">✓</span>
                                        <span>{t('helpModal.tips.tip4')}</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Section 3: Fonctionnalités */}
                            <div className="border-t pt-6">
                                <h4 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                    {t('helpModal.features.title')}
                                </h4>
                                <ul className="space-y-2 text-slate-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.features.speechTitle')}</strong> {t('helpModal.features.speechDesc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.features.themesTitle')}</strong> {t('helpModal.features.themesDesc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.features.skillsTitle')}</strong> {t('helpModal.features.skillsDesc')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-primary-600 font-bold mt-0.5">•</span>
                                        <span><strong>{t('helpModal.features.autoSaveTitle')}</strong> {t('helpModal.features.autoSaveDesc')}</span>
                                    </li>
                                </ul>
                            </div>
                            
                            {/* Section 4: Contact */}
                            <div className="border-t pt-6 bg-slate-50 -mx-8 -mb-8 px-8 py-6 rounded-b-2xl">
                                <h4 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    {t('helpModal.contact.title')}
                                </h4>
                                <p className="text-slate-600">{t('helpModal.contact.description')} <a href="mailto:support@bilancompetences.com" className="text-primary-600 hover:text-primary-700 font-medium">support@bilancompetences.com</a></p>
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
                        <span>{t('saveIndicator.saved')}</span>
                    </div>
                ) : lastSaveTime && (
                    <div className="bg-slate-700 text-white px-3 py-1.5 rounded-full text-xs shadow-md flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity">
                        <svg className="w-3.5 h-3.5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                        <span>
                            {t('saveIndicator.savedAgo', { minutes: Math.floor((new Date().getTime() - lastSaveTime.getTime()) / 1000 / 60) || '< 1' })}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
                <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 shadow-sm transition-colors duration-300">
                    {/* Barre de progression unique et cohérente - basée sur le nombre de questions */}
                    {currentPhaseInfo && (() => {
                        const progressionInfo = calculateProgression(answers, pkg.id, userProfile);
                        return (
                            <div className="h-1 bg-slate-200 dark:bg-slate-700">
                                <div 
                                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500"
                                    style={{ width: `${Math.max(2, progressionInfo.globalProgress)}%` }}
                                />
                            </div>
                        );
                    })()}
                    
                    <div className="p-4 flex justify-between items-center">
                        <div>
                            <h1 className="font-bold text-lg text-primary-800 dark:text-primary-300 font-display transition-colors duration-300">{getTranslatedPackageName(pkg.id, pkg.name)}</h1>
                            <p className="text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">{currentPhaseInfo ? translatePhaseNameFromFrench(currentPhaseInfo.name) : ''}</p>
                        </div>
                        {currentPhaseInfo && (() => {
                            const progressionInfo = calculateProgression(answers, pkg.id, userProfile);
                            const timeBudget = getTimeBudget(pkg.id, answers, bilanStartTime);
                            return (
                                <div className="text-center px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {progressionInfo.globalProgress}%
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('progress.questions', { count: progressionInfo.questionsAnswered, target: progressionInfo.questionsTarget })}
                                    </div>
                                </div>
                            );
                        })()}
                        <div className="flex items-center gap-4">
                            {/* Bouton Dashboard */}
                            <button 
                                onClick={onDashboard} 
                            className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800/50 transition-colors text-sm font-medium"
                            title={t('header.dashboardTooltip')}
                            aria-label={t('header.dashboardAriaLabel')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            {t('header.dashboard')}
                        </button>
                        {speechSynthSupported && (
                            <div className="relative group">
                                <button 
                                    onClick={() => {
                                        if (isSpeaking) {
                                            cancel();
                                        } else {
                                            // Activer automatiquement la lecture si désactivée
                                            if (!settings.enabled) {
                                                onSettingsChange({ enabled: true });
                                            }
                                            const lastMessage = messages[messages.length - 1]?.text;
                                            if (lastMessage) speak(lastMessage as string);
                                        }
                                    }} 
                                    className={`relative p-1.5 rounded-lg transition-all duration-200 ${
                                        settings.enabled 
                                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30' 
                                            : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400'
                                    } ${isSpeaking ? 'animate-pulse' : ''}`}
                                    title={settings.enabled ? (isSpeaking ? t('header.speakerStop') : t('header.speakerRead')) : t('header.speakerEnable')}
                                    aria-label={settings.enabled ? (isSpeaking ? t('header.speakerStopAriaLabel') : t('header.speakerReadAriaLabel')) : t('header.speakerEnableAriaLabel')}
                                >
                                    <SpeakerIcon active={isSpeaking} />
                                    {/* Indicateur d'état */}
                                    {settings.enabled && (
                                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white dark:border-slate-800"></span>
                                    )}
                                </button>
                                {/* Tooltip au survol */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                    {settings.enabled ? (isSpeaking ? t('header.speakerTooltipStop') : t('header.speakerTooltipRead')) : t('header.speakerTooltipEnable')}
                                </div>
                            </div>
                        )}
                        <button onClick={toggleDarkMode} className="text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300" title={isDarkMode ? t('header.lightMode') : t('header.darkMode')} aria-label={isDarkMode ? t('header.lightModeAriaLabel') : t('header.darkModeAriaLabel')}>
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
                            title={t('header.help')}
                            aria-label={t('header.helpAriaLabel')}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                        {/* Bouton paramètres vocaux avancés - affiché uniquement si la lecture est activée */}
                        {speechSynthSupported && settings.enabled && (
                            <button 
                                onClick={() => setShowSettings(!showSettings)} 
                                className={`text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg p-1 ${showSettings ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : ''}`}
                                title={t('header.settings')}
                                aria-label={t('header.settingsAriaLabel')}
                            >
                                <SettingsIcon />
                            </button>
                        )}
                        <button 
                            onClick={handleLogout} 
                            className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none rounded-lg p-1" 
                            title={t('header.logout')}
                            aria-label={t('header.logoutAriaLabel')}
                        >
                            <LogoutIcon />
                            </button>
                        </div>
                    </div>
                </header>
                
                {/* Panneau des paramètres voix - positionné en absolu pour ne pas décaler le contenu */}
                {showSettings && speechSynthSupported && (
                    <div className="absolute top-[60px] right-4 z-40 w-80 shadow-xl rounded-xl overflow-hidden animate-fade-in-down">
                        <div className="relative">
                            <button 
                                onClick={() => setShowSettings(false)}
                                className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 z-10"
                                aria-label={t('header.closeSettings')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <SpeechSettings voices={voices} settings={settings} onSettingsChange={onSettingsChange} />
                        </div>
                    </div>
                )}

                <main className="flex-1 min-h-0 flex gap-6 p-6">
                    {/* Zone de conversation - prend tout l'espace disponible */}
                    <div className="flex-1 min-w-0 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 transition-colors duration-300">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`} style={{animationDelay: `${index * 0.05}s`}}>
                                    {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0 animate-scale-in mt-1">IA</div>}
                                    <div className={`max-w-[85%] p-4 rounded-2xl transition-all duration-300 hover:shadow-lg break-words ${msg.sender === 'user' ? 'bg-primary-600 dark:bg-primary-500 text-white rounded-br-none' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                        {msg.isSynthesis && (
                                            <div className="mt-4 flex gap-2" role="group" aria-label={t('synthesis.groupAriaLabel')}>
                                                <button 
                                                    onClick={() => handleSynthesisConfirmation(true)} 
                                                    className="bg-white/20 px-3 py-1 rounded-full text-xs hover:bg-white/30 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                                                    aria-label={t('synthesis.confirmYesAriaLabel')}
                                                >
                                                    {t('synthesis.confirmYes')}
                                                </button>
                                                <button 
                                                    onClick={() => handleSynthesisConfirmation(false)} 
                                                    className="bg-white/20 px-3 py-1 rounded-full text-xs hover:bg-white/30 focus:ring-2 focus:ring-white focus:outline-none transition-all"
                                                    aria-label={t('synthesis.confirmNoAriaLabel')}
                                                >
                                                    {t('synthesis.confirmNo')}
                                                </button>
                                            </div>
                                        )}
                                        {msg.question?.type === QuestionType.MULTIPLE_CHOICE && msg.question.choices && (
                                            <div className="mt-4 space-y-2" role="radiogroup" aria-label={t('chat.choicesAriaLabel')}>
                                                {msg.question.choices.map((choice, choiceIndex) => (
                                                    <button 
                                                        key={choice} 
                                                        onClick={() => handleAnswerSubmit(choice)} 
                                                        className="w-full text-left bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 p-3 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-all focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                                        role="radio"
                                                        aria-checked="false"
                                                        aria-label={t('chat.choiceAriaLabel', { index: choiceIndex + 1, choice })}
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
                                <form onSubmit={e => { e.preventDefault(); handleAnswerSubmit(textInput); }} className="flex items-end gap-2" role="form" aria-label={t('chat.formAriaLabel')}>
                                    <label htmlFor="answer-input" className="sr-only">{t('chat.inputLabel')}</label>
                                    <textarea 
                                        id="answer-input"
                                        value={textInput} 
                                        onChange={e => {
                                            setTextInput(e.target.value);
                                            // Auto-resize textarea
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                        }}
                                        onKeyDown={e => {
                                            // Envoyer avec Enter (sans Shift)
                                            // Note: Le form onSubmit gère déjà l'envoi, pas besoin de doublon ici
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                // Le form onSubmit sera déclenché automatiquement
                                            }
                                        }}
                                        placeholder={t('chat.inputPlaceholder')} 
                                        className="flex-1 w-full px-4 py-3 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-colors duration-300 resize-none min-h-[48px] max-h-[200px] overflow-y-auto" 
                                        disabled={isLoading || isAwaitingSynthesisConfirmation}
                                        aria-label={t('chat.inputAriaLabel')}
                                        aria-required="true"
                                        rows={1}
                                    />
                                    {speechRecSupported && (
                                        <button 
                                            type="button" 
                                            onClick={() => isListening ? stopListening() : startListening()} 
                                            className="p-3 text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg transition-colors"
                                            aria-label={isListening ? t('chat.micStop') : t('chat.micStart')}
                                            aria-pressed={isListening}
                                        >
                                            <MicIcon active={isListening} />
                                        </button>
                                    )}
                                    <button 
                                        type="submit" 
                                        className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 disabled:bg-slate-400 focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all" 
                                        disabled={isLoading || !textInput.trim() || isAwaitingSynthesisConfirmation}
                                        aria-label={t('chat.sendAriaLabel')}
                                    >
                                        <SendIcon />
                                    </button>
                                </form>
                            )}
                             <button 
                                onClick={handleJoker} 
                                className="mt-2 text-xs text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 flex items-center justify-center w-full disabled:opacity-50 focus:ring-2 focus:ring-primary-500 focus:outline-none rounded-lg p-2 transition-colors" 
                                disabled={isLoading || isAwaitingSynthesisConfirmation}
                                aria-label={t('joker.ariaLabel')}
                                title={t('joker.tooltip')}
                            >
                                <JokerIcon/> {t('joker.label')}
                            </button>
                            {/* Cadrage IA pour Qualiopi */}
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1 italic">
                                {t('joker.disclaimer')}
                            </p>
                        </div>
                    </div>
                    {/* Panneau latéral - masquable complètement */}
                    {showSidePanel ? (
                        <aside 
                            className="hidden lg:flex flex-col flex-shrink-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-slate-900/50 p-4 transition-all duration-300 overflow-hidden"
                            role="complementary"
                            aria-label={t('sidePanel.ariaLabel')}
                        >
                            <EnhancedDashboard 
                                data={dashboardData} 
                                isLoading={isDashboardLoading}
                                lastQuestion={currentQuestion?.title || currentQuestion?.text || ''}
                                onCollapse={() => setShowSidePanel(false)}
                            />
                        </aside>
                    ) : (
                        <div className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-40">
                            <button
                                onClick={() => setShowSidePanel(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all"
                                title={t('header.showPanel')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default Questionnaire;