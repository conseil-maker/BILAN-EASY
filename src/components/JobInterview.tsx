import React, { useState, useEffect, useRef } from 'react';
import {
  User, Briefcase, Clock, Building2, MessageCircle, Send,
  Loader2, X, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown,
  Lightbulb, AlertCircle, CheckCircle, Star, ArrowRight
} from 'lucide-react';
import { 
  simulateJobInterview, 
  generateInterviewFollowUp,
  JobInterviewResult 
} from '../services/geminiService';
import { Answer } from '../types';

interface JobInterviewProps {
  answers: Answer[];
  targetJobTitle: string;
  userName: string;
  onClose: () => void;
  onInterviewComplete: (result: JobInterviewResult, conversationHistory: ConversationMessage[]) => void;
}

interface ConversationMessage {
  role: 'professional' | 'beneficiary';
  content: string;
  timestamp: Date;
}

export const JobInterview: React.FC<JobInterviewProps> = ({
  answers,
  targetJobTitle,
  userName,
  onClose,
  onInterviewComplete
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [interviewData, setInterviewData] = useState<JobInterviewResult | null>(null);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('daily');
  const [showInsights, setShowInsights] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadInterviewData();
  }, [targetJobTitle]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const loadInterviewData = async () => {
    setIsLoading(true);
    try {
      const data = await simulateJobInterview(answers, targetJobTitle, userName);
      setInterviewData(data);
      
      // Message d'introduction du professionnel
      const introMessage: ConversationMessage = {
        role: 'professional',
        content: `Bonjour ${userName} ! Je suis ${data.professionalPersona.name}, ${data.professionalPersona.currentRole} depuis ${data.professionalPersona.yearsExperience} ans. ${data.professionalPersona.background}\n\nJe suis ravi(e) de pouvoir échanger avec vous sur ce métier. N'hésitez pas à me poser toutes vos questions, et je vous poserai aussi quelques questions pour vous aider à voir si ce métier vous correspond vraiment.`,
        timestamp: new Date()
      };
      setConversation([introMessage]);
      
      // Poser la première question après un délai
      setTimeout(() => {
        if (data.interactiveQuestions.length > 0) {
          addProfessionalMessage(data.interactiveQuestions[0].question);
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error loading interview data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProfessionalMessage = (content: string) => {
    setConversation(prev => [...prev, {
      role: 'professional',
      content,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !interviewData) return;

    const userMessage: ConversationMessage = {
      role: 'beneficiary',
      content: userInput,
      timestamp: new Date()
    };
    
    setConversation(prev => [...prev, userMessage]);
    setUserInput('');
    setIsTyping(true);

    try {
      // Générer une réponse de suivi
      const previousQuestion = interviewData.interactiveQuestions[currentQuestionIndex]?.question || '';
      const followUp = await generateInterviewFollowUp(
        interviewData.professionalPersona.name,
        targetJobTitle,
        previousQuestion,
        userInput,
        `Enquête métier pour ${targetJobTitle}`
      );

      setTimeout(() => {
        addProfessionalMessage(followUp);
        setIsTyping(false);
        
        // Passer à la question suivante si disponible
        if (currentQuestionIndex < interviewData.interactiveQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
          setTimeout(() => {
            addProfessionalMessage(interviewData.interactiveQuestions[currentQuestionIndex + 1].question);
          }, 3000);
        } else if (currentQuestionIndex === interviewData.interactiveQuestions.length - 1) {
          // Fin de l'entretien
          setTimeout(() => {
            addProfessionalMessage(`Merci beaucoup pour cet échange, ${userName} ! J'espère que mes réponses vous ont aidé à y voir plus clair. N'hésitez pas à consulter les insights que j'ai partagés sur le métier. Bonne continuation dans votre projet professionnel ! 🙌`);
            setShowInsights(true);
          }, 2000);
        }
      }, 1500);
    } catch (error) {
      console.error('Error generating follow-up:', error);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const handleFinishInterview = () => {
    if (interviewData) {
      onInterviewComplete(interviewData, conversation);
    }
    onClose();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-800">Préparation de l'entretien...</h3>
            <p className="text-gray-600 text-center">
              Notre IA prépare un professionnel virtuel expérimenté en <strong>{targetJobTitle}</strong> 
              pour répondre à vos questions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!interviewData) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                Enquête Métier : {targetJobTitle}
              </h2>
              <p className="text-green-100 text-sm">
                Avec {interviewData.professionalPersona.name} • {interviewData.professionalPersona.yearsExperience} ans d'expérience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Zone de chat */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'beneficiary' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'beneficiary'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm border'
                    }`}
                  >
                    {msg.role === 'professional' && (
                      <div className="flex items-center space-x-2 mb-1 text-green-600 text-sm font-medium">
                        <User className="w-4 h-4" />
                        <span>{interviewData.professionalPersona.name}</span>
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-500 p-3 rounded-2xl rounded-bl-md shadow-sm border">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-sm">{interviewData.professionalPersona.name} écrit...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex space-x-2">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Posez votre question ou répondez..."
                  className="flex-1 p-3 border rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="px-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Panel latéral - Insights */}
          {showInsights && (
            <div className="w-80 border-l bg-white overflow-y-auto">
              <div className="p-4 border-b bg-gradient-to-r from-green-50 to-teal-50">
                <h3 className="font-semibold text-gray-800 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Insights de {interviewData.professionalPersona.name}
                </h3>
              </div>

              <div className="p-4 space-y-4">
                {/* Journée type */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('daily')}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100"
                  >
                    <span className="font-medium text-sm">Journée type</span>
                    {expandedSection === 'daily' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSection === 'daily' && (
                    <div className="p-3 text-sm text-gray-600">
                      <p>{interviewData.dailyReality.typicalDay}</p>
                    </div>
                  )}
                </div>

                {/* Avantages */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('pros')}
                    className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100"
                  >
                    <span className="font-medium text-sm text-green-700 flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-2" />
                      Avantages
                    </span>
                    {expandedSection === 'pros' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSection === 'pros' && (
                    <div className="p-3">
                      <ul className="space-y-1">
                        {interviewData.honestOpinion.prosOfJob.map((pro, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Inconvénients */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('cons')}
                    className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100"
                  >
                    <span className="font-medium text-sm text-red-700 flex items-center">
                      <ThumbsDown className="w-4 h-4 mr-2" />
                      Inconvénients
                    </span>
                    {expandedSection === 'cons' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSection === 'cons' && (
                    <div className="p-3">
                      <ul className="space-y-1">
                        {interviewData.honestOpinion.consOfJob.map((con, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Conseils */}
                <div className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('tips')}
                    className="w-full flex items-center justify-between p-3 bg-indigo-50 hover:bg-indigo-100"
                  >
                    <span className="font-medium text-sm text-indigo-700 flex items-center">
                      <Star className="w-4 h-4 mr-2" />
                      Conseils pour réussir
                    </span>
                    {expandedSection === 'tips' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedSection === 'tips' && (
                    <div className="p-3 space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">{interviewData.careerAdvice.entryTips}</p>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">Compétences clés</h5>
                        <div className="flex flex-wrap gap-1">
                          {interviewData.careerAdvice.mustHaveSkills.map((skill, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profil idéal */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-purple-700 mb-2">Profil idéal</h4>
                  <p className="text-sm text-gray-600">{interviewData.honestOpinion.whoShouldApply}</p>
                </div>

                {/* Perspectives */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3">
                  <h4 className="font-medium text-sm text-blue-700 mb-2">Perspectives d'avenir</h4>
                  <p className="text-sm text-gray-600">{interviewData.honestOpinion.futureOutlook}</p>
                </div>
              </div>

              {/* Bouton terminer */}
              <div className="p-4 border-t">
                <button
                  onClick={handleFinishInterview}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>Terminer l'enquête</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInterview;
