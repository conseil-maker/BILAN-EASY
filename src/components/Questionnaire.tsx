import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Package, Answer, Question, QuestionType, Message, CurrentPhaseInfo, Summary, UserProfile, DashboardData, CoachingStyle } from '../types';
import { generateQuestion, generateSummary, generateSynthesis, analyzeThemesAndSkills, suggestOptionalModule } from '../services/geminiService';
import { QUESTION_CATEGORIES } from '../constants';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import SpeechSettings from './SpeechSettings';
import Dashboard from './Dashboard';
import JourneyProgress from './JourneyProgress';
import { supabase } from '../lib/supabaseClient';

const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const MicIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4M5 8v4a7 7 0 0014 0V8M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" /></svg>;
const SpeakerIcon = ({ active }: { active: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-blue-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.858 17.142a5 5 0 010-7.072m2.828 9.9a9 9 0 010-12.728M12 12h.01" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const JokerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5 5a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zm2-3a1 1 0 00-1.414 1.414L8.586 18l-1.293 1.293a1 1 0 101.414 1.414L10 19.414l1.293 1.293a1 1 0 001.414-1.414L11.414 18l1.293-1.293a1 1 0 00-1.414-1.414L10 16.586 8.707 15.293zM5 11a1 1 0 100 2h.01a1 1 0 100-2H5zm14-1a1 1 0 11-2 0v-2a1 1 0 112 0v2zM15 9a1 1 0 100-2h-.01a1 1 0 100 2H15z" clipRule="evenodd" /></svg>;

const BadgeNotification: React.FC<{ phaseName: string; onClose: () => void }> = ({ phaseName, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 bg-secondary text-white p-4 rounded-lg shadow-lg animate-fade-in-down z-50">
            <p className="font-bold">🎉 Badge débloqué !</p>
            <p>Vous avez terminé : {phaseName}</p>
        </div>
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
        console.log('Rating set to:', star);
        setRating(star);
    };
    
    const handleSubmit = () => {
        console.log('Submitting rating:', rating, 'comment:', comment);
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
}

const Questionnaire: React.FC<QuestionnaireProps> = ({ pkg, userName, userProfile, coachingStyle, onComplete }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
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
    const [satisfactionSubmittedPhases, setSatisfactionSubmittedPhases] = useState<Set<number>>(new Set());

    const chatEndRef = useRef<HTMLDivElement>(null);
    const SESSION_STORAGE_KEY = `autosave-${userName}-${pkg.id}`;
    const { isSpeaking, isSupported: speechSynthSupported, voices, settings, speak, cancel, onSettingsChange } = useSpeechSynthesis();
    const { isListening, isSupported: speechRecSupported, interimTranscript, finalTranscript, startListening, stopListening } = useSpeechRecognition({ lang: 'fr-FR' });

    useEffect(() => { setTextInput(interimTranscript || finalTranscript); }, [interimTranscript, finalTranscript]);
    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(scrollToBottom, [messages]);

    const getPhaseInfo = useCallback((questionCount: number): CurrentPhaseInfo => {
        const { phase1, phase2 } = pkg.phases;
        const qInPhase1 = phase1.questionnaires;
        const qInPhase2 = phase2.questionnaires;

        if (questionCount < qInPhase1) return { phase: 1, name: QUESTION_CATEGORIES.phase1.name, positionInPhase: questionCount + 1, totalInPhase: qInPhase1, satisfactionActive: QUESTION_CATEGORIES.phase1.satisfactionActive };
        if (questionCount < qInPhase1 + qInPhase2) return { phase: 2, name: QUESTION_CATEGORIES.phase2.name, positionInPhase: questionCount - qInPhase1 + 1, totalInPhase: qInPhase2, satisfactionActive: QUESTION_CATEGORIES.phase2.satisfactionActive };
        return { phase: 3, name: QUESTION_CATEGORIES.phase3.name, positionInPhase: questionCount - qInPhase1 - qInPhase2 + 1, totalInPhase: pkg.phases.phase3.questionnaires, satisfactionActive: QUESTION_CATEGORIES.phase3.satisfactionActive };
    }, [pkg]);
    
    const updateDashboard = useCallback(async (currentAnswers: Answer[]) => {
        if (currentAnswers.length < 2) return;
        setIsDashboardLoading(true);
        try {
            const data = await analyzeThemesAndSkills(currentAnswers);
            setDashboardData(data);
        } catch (error) { console.error("Error updating dashboard:", error); } 
        finally { setIsDashboardLoading(false); }
    }, []);

    const fetchNextQuestion = useCallback(async (options: { useJoker?: boolean } = {}) => {
        setIsLoading(true);
        setCurrentQuestion(null);
        try {
            let question;
            if (activeModule) {
                question = await generateQuestion('phase2', 0, answers, userName, coachingStyle, null, { isModuleQuestion: { moduleId: activeModule, questionNum: moduleQuestionCount + 1 } });
            } else {
                const info = getPhaseInfo(answers.length);
                setCurrentPhaseInfo(info);
                const phaseKey = `phase${info.phase}` as 'phase1' | 'phase2' | 'phase3';
                const phaseCategories = QUESTION_CATEGORIES[phaseKey].categories;
                const categoryIndex = (info.positionInPhase - 1) % phaseCategories.length;
                
                let genOptions: any = { useJoker: options.useJoker };
                if (info.phase === 2 && info.positionInPhase === 2 && answers.length > 0 && answers[answers.length - 1].value.length > 3) {
                    genOptions.useGoogleSearch = true; genOptions.searchTopic = answers[answers.length - 1].value;
                }
                question = await generateQuestion(phaseKey, categoryIndex, answers, userName, coachingStyle, answers.length === 0 ? userProfile : null, genOptions);
            }
            setCurrentQuestion(question);
            const aiMessage: Message = { sender: 'ai', text: `${question.title}${question.description ? `\n\n${question.description}` : ''}`, question };
            setMessages(prev => [...prev, aiMessage]);
            if (speechSynthSupported && settings.voice) speak(aiMessage.text as string);
        } catch (error) {
            console.error("Error generating question:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Désolé, une erreur est survenue. Laissez-moi un instant..." }]);
            setTimeout(() => fetchNextQuestion(), 3000);
        } finally {
            setIsLoading(false);
        }
    }, [answers, userName, coachingStyle, getPhaseInfo, speak, speechSynthSupported, userProfile, activeModule, moduleQuestionCount, settings.voice]);

    const handleGenerateSynthesis = useCallback(async (currentAnswers: Answer[]) => {
        setIsLoading(true);
        try {
            const { synthesis, confirmationRequest } = await generateSynthesis(currentAnswers.slice(-3), userName, coachingStyle);
            const synthesisMessage: Message = { sender: 'ai', text: (<>{synthesis}<br/><br/>{confirmationRequest}</>), isSynthesis: true };
            setMessages(prev => [...prev, synthesisMessage]);
            setIsAwaitingSynthesisConfirmation(true);
        } catch (error) {
            console.error("Error generating synthesis:", error);
            await fetchNextQuestion();
        } finally {
            setIsLoading(false);
        }
    }, [userName, coachingStyle, fetchNextQuestion]);

    const runNextStep = useCallback(async (currentAnswers: Answer[]) => {
        if (currentAnswers.length >= pkg.totalQuestionnaires) {
            setIsSummarizing(true);
            const finalSummary = await generateSummary(currentAnswers, pkg, userName, coachingStyle);
            localStorage.removeItem(SESSION_STORAGE_KEY);
            onComplete(currentAnswers, finalSummary);
            return;
        }

        if (currentAnswers.length > 0 && currentAnswers.length % 5 === 0) {
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentAnswers));
            setShowSaveNotification(true); setTimeout(() => setShowSaveNotification(false), 3000);
            updateDashboard(currentAnswers);
        }

        if (currentAnswers.length > 0) {
            const info = getPhaseInfo(currentAnswers.length);
            const prevInfo = getPhaseInfo(currentAnswers.length - 1);
            if (info.phase !== prevInfo.phase) {
                setUnlockedBadge(`Phase ${prevInfo.phase} : ${prevInfo.name}`);
                const moduleSuggestion = await suggestOptionalModule(currentAnswers);
                if (moduleSuggestion.isNeeded && moduleSuggestion.moduleId && moduleSuggestion.reason) {
                    setSuggestedModule({ id: moduleSuggestion.moduleId, reason: moduleSuggestion.reason });
                    return;
                }
                if (prevInfo.satisfactionActive && !satisfactionSubmittedPhases.has(prevInfo.phase)) {
                    setSatisfactionPhaseInfo(prevInfo);
                    setShowSatisfactionModal(true);
                    return;
                }
            }
        }

        if (currentAnswers.length > 0 && currentAnswers.length % 3 === 0 && currentAnswers.length % 5 !== 0) {
            await handleGenerateSynthesis(currentAnswers);
            return;
        }
        
        await fetchNextQuestion();
    }, [pkg, userName, coachingStyle, onComplete, SESSION_STORAGE_KEY, getPhaseInfo, updateDashboard, fetchNextQuestion, handleGenerateSynthesis, satisfactionSubmittedPhases]);

    useEffect(() => {
        const loadSession = async () => {
            const savedAnswersJSON = localStorage.getItem(SESSION_STORAGE_KEY);
            if (savedAnswersJSON) {
                const savedAnswers: Answer[] = JSON.parse(savedAnswersJSON);
                if (window.confirm("Une session inachevée a été trouvée. Voulez-vous la reprendre ?")) {
                    setAnswers(savedAnswers);
                    setMessages([{ sender: 'ai', text: `Bonjour ${userName}, reprenons où nous nous étions arrêtés.` }]);
                    await runNextStep(savedAnswers);
                    return;
                } else {
                    localStorage.removeItem(SESSION_STORAGE_KEY);
                }
            }
            await fetchNextQuestion();
        };
        loadSession();
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
        const newAnswer: Answer = { questionId: currentQuestion.id, value };
        const newAnswers = [...answers, newAnswer];
        setMessages(prev => [...prev, { sender: 'user', text: value }]);
        setAnswers(newAnswers);
        setTextInput('');

        if (activeModule) {
            if (moduleQuestionCount + 1 >= 3) {
                setActiveModule(null); setModuleQuestionCount(0);
                runNextStep(newAnswers);
            } else {
                setModuleQuestionCount(prev => prev + 1);
                fetchNextQuestion();
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
        console.log({ phase: satisfactionPhaseInfo?.name, rating, comment });
        if (satisfactionPhaseInfo) {
            setSatisfactionSubmittedPhases(prev => new Set(prev).add(satisfactionPhaseInfo.phase));
        }
        setShowSatisfactionModal(false);
        setSatisfactionPhaseInfo(null);
        runNextStep(answers);
    };

    const handleModuleAccept = () => { setActiveModule(suggestedModule!.id); setSuggestedModule(null); fetchNextQuestion(); };
    const handleModuleDecline = () => { setSuggestedModule(null); runNextStep(answers); };
    const handleJoker = () => { if (!isLoading) { fetchNextQuestion({ useJoker: true }); } };
    const handleLogout = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ? Votre progression sera sauvegardée.")) {
            await supabase.auth.signOut();
            window.location.href = '/login';
        }
    };

    if (isSummarizing) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-2xl font-bold">Génération de votre synthèse...</div><p>Veuillez patienter.</p></div></div>;

    return (
        <>
            {unlockedBadge && <BadgeNotification phaseName={unlockedBadge} onClose={() => setUnlockedBadge(null)} />}
            {showSatisfactionModal && satisfactionPhaseInfo && <SatisfactionModal phaseName={satisfactionPhaseInfo.name} onSubmit={handleSatisfactionSubmit} />}
            {suggestedModule && <ModuleModal reason={suggestedModule.reason} onAccept={handleModuleAccept} onDecline={handleModuleDecline} />}
            {showSaveNotification && <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm shadow-lg z-50">Progrès sauvegardé !</div>}
            
            <div className="h-screen w-screen flex flex-col bg-slate-100">
                <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 p-4 flex justify-between items-center shadow-sm">
                    <div>
                        <h1 className="font-bold text-lg text-primary-800 font-display">{pkg.name}</h1>
                        <p className="text-sm text-slate-600">{currentPhaseInfo?.name}</p>
                    </div>
                    {currentPhaseInfo && <JourneyProgress current={answers.length} total={pkg.totalQuestionnaires} phases={[pkg.phases.phase1.questionnaires, pkg.phases.phase2.questionnaires, pkg.phases.phase3.questionnaires]} />}
                    <div className="flex items-center gap-4">
                        {speechSynthSupported && <button onClick={() => isSpeaking ? cancel() : speak(messages[messages.length - 1]?.text as string)} className="text-slate-500 hover:text-primary-600" title="Lecture vocale"><SpeakerIcon active={isSpeaking} /></button>}
                        <button onClick={() => setShowSettings(!showSettings)} className="text-slate-500 hover:text-primary-600" title="Paramètres"><SettingsIcon /></button>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-600 transition-colors" title="Déconnexion"><LogoutIcon /></button>
                    </div>
                </header>
                
                {showSettings && speechSynthSupported && <div className="border-b"><SpeechSettings voices={voices} settings={settings} onSettingsChange={onSettingsChange} /></div>}

                <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
                    <div className="lg:col-span-2 flex flex-col h-full bg-white rounded-xl shadow">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center flex-shrink-0">IA</div>}
                                    <div className={`max-w-xl p-4 rounded-2xl ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-slate-200 text-slate-800 rounded-bl-none'}`}>
                                        <p>{msg.text}</p>
                                        {msg.isSynthesis && (
                                            <div className="mt-4 flex gap-2">
                                                <button onClick={() => handleSynthesisConfirmation(true)} className="bg-white/20 px-3 py-1 rounded-full text-xs">Oui, c'est exact</button>
                                                <button onClick={() => handleSynthesisConfirmation(false)} className="bg-white/20 px-3 py-1 rounded-full text-xs">Non, pas tout à fait</button>
                                            </div>
                                        )}
                                        {msg.question?.type === QuestionType.MULTIPLE_CHOICE && msg.question.choices && (
                                            <div className="mt-4 space-y-2">
                                                {msg.question.choices.map(choice => (
                                                    <button key={choice} onClick={() => handleAnswerSubmit(choice)} className="w-full text-left bg-primary-50 text-primary-800 p-3 rounded-lg hover:bg-primary-100 transition">
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

                        <div className="p-4 border-t bg-white rounded-b-xl">
                            {currentQuestion?.type === QuestionType.PARAGRAPH && (
                                <form onSubmit={e => { e.preventDefault(); handleAnswerSubmit(textInput); }} className="flex items-center gap-2">
                                    <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Écrivez votre réponse..." className="flex-1 w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" disabled={isLoading || isAwaitingSynthesisConfirmation} />
                                    {speechRecSupported && <button type="button" onClick={() => isListening ? stopListening() : startListening()} className="p-3 text-slate-500 hover:text-primary-600"><MicIcon active={isListening} /></button>}
                                    <button type="submit" className="bg-primary-600 text-white p-3 rounded-lg hover:bg-primary-700 disabled:bg-slate-400" disabled={isLoading || !textInput.trim() || isAwaitingSynthesisConfirmation}><SendIcon /></button>
                                </form>
                            )}
                             <button onClick={handleJoker} className="mt-2 text-xs text-slate-500 hover:text-primary-600 flex items-center justify-center w-full disabled:opacity-50" disabled={isLoading || isAwaitingSynthesisConfirmation}>
                                <JokerIcon/> J'ai besoin d'aide pour répondre
                            </button>
                        </div>
                    </div>
                    <aside className="hidden lg:block h-full overflow-y-auto bg-white rounded-xl shadow p-6">
                        <Dashboard data={dashboardData} isLoading={isDashboardLoading} />
                    </aside>
                </main>
            </div>
        </>
    );
};

export default Questionnaire;