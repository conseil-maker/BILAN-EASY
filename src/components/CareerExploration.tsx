import React, { useState, useEffect } from 'react';
import { 
  Compass, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, HelpCircle, Briefcase, GraduationCap, 
  Target, Sparkles, ArrowRight, Loader2, X
} from 'lucide-react';
import { 
  CareerPath, 
  CareerExplorationResult, 
  exploreCareerPaths, 
  generateCareerFollowUpQuestion 
} from '../services/geminiService';
import { Answer } from '../types';

interface CareerExplorationProps {
  answers: Answer[];
  userName: string;
  onClose: () => void;
  onSelectPath: (path: CareerPath, reaction: 'interested' | 'not_interested' | 'need_more_info') => void;
  onFollowUpAnswer: (question: string, answer: string) => void;
}

type UserReaction = 'interested' | 'not_interested' | 'need_more_info';

interface PathReaction {
  pathTitle: string;
  reaction: UserReaction;
  followUpQuestion?: string;
  followUpAnswer?: string;
}

export const CareerExploration: React.FC<CareerExplorationProps> = ({
  answers,
  userName,
  onClose,
  onSelectPath,
  onFollowUpAnswer
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [explorationResult, setExplorationResult] = useState<CareerExplorationResult | null>(null);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const [pathReactions, setPathReactions] = useState<PathReaction[]>([]);
  const [currentFollowUp, setCurrentFollowUp] = useState<{
    path: CareerPath;
    question: string;
  } | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);

  useEffect(() => {
    loadCareerPaths();
  }, []);

  const loadCareerPaths = async () => {
    setIsLoading(true);
    try {
      const result = await exploreCareerPaths(answers, userName);
      setExplorationResult(result);
      // Expand first path by default
      if (result.careerPaths.length > 0) {
        setExpandedPath(result.careerPaths[0].title);
      }
    } catch (error) {
      console.error('Error loading career paths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (path: CareerPath, reaction: UserReaction) => {
    setIsGeneratingFollowUp(true);
    
    // Save reaction
    onSelectPath(path, reaction);
    
    // Generate follow-up question
    try {
      const question = await generateCareerFollowUpQuestion(path, reaction, answers);
      setCurrentFollowUp({ path, question });
      setPathReactions(prev => [
        ...prev.filter(r => r.pathTitle !== path.title),
        { pathTitle: path.title, reaction, followUpQuestion: question }
      ]);
    } catch (error) {
      console.error('Error generating follow-up:', error);
    } finally {
      setIsGeneratingFollowUp(false);
    }
  };

  const handleFollowUpSubmit = () => {
    if (!currentFollowUp || !followUpAnswer.trim()) return;
    
    // Save follow-up answer
    onFollowUpAnswer(currentFollowUp.question, followUpAnswer);
    
    // Update reactions
    setPathReactions(prev => 
      prev.map(r => 
        r.pathTitle === currentFollowUp.path.title 
          ? { ...r, followUpAnswer: followUpAnswer }
          : r
      )
    );
    
    // Clear current follow-up
    setCurrentFollowUp(null);
    setFollowUpAnswer('');
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'en_croissance':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'en_declin':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case 'en_croissance':
        return 'En croissance';
      case 'en_declin':
        return 'En déclin';
      default:
        return 'Stable';
    }
  };

  const getReactionForPath = (pathTitle: string) => {
    return pathReactions.find(r => r.pathTitle === pathTitle);
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="relative">
            <Compass className="w-16 h-16 text-indigo-500 animate-pulse" />
            <Sparkles className="w-6 h-6 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6">
            Analyse de votre profil en cours...
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-center max-w-md">
            L'IA explore les pistes professionnelles qui correspondent à vos compétences, 
            motivations et aspirations.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span className="text-sm text-indigo-600 dark:text-indigo-400">
              Recherche en cours...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!explorationResult || explorationResult.careerPaths.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
        <div className="text-center py-8">
          <Compass className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Aucune piste trouvée
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Nous n'avons pas pu générer de pistes pour le moment. 
            Continuez le bilan pour enrichir votre profil.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Continuer le bilan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8" />
            <div>
              <h2 className="text-xl font-bold">Exploration de pistes professionnelles</h2>
              <p className="text-indigo-100 text-sm mt-1">
                Basée sur votre profil et le marché actuel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
          Votre profil en bref
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {explorationResult.profileSummary}
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          {explorationResult.keyStrengths.map((strength, i) => (
            <span 
              key={i}
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm rounded-full"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>

      {/* Career Paths */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
          {explorationResult.careerPaths.length} pistes identifiées pour vous
        </h3>
        
        <div className="space-y-4">
          {explorationResult.careerPaths.map((path, index) => {
            const isExpanded = expandedPath === path.title;
            const reaction = getReactionForPath(path.title);
            
            return (
              <div 
                key={index}
                className={`border rounded-xl overflow-hidden transition-all ${
                  reaction?.reaction === 'interested' 
                    ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' 
                    : reaction?.reaction === 'not_interested'
                    ? 'border-gray-200 dark:border-gray-700 opacity-60'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Path Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => setExpandedPath(isExpanded ? null : path.title)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30">
                          <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white">
                            {path.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                              {path.matchScore}% de correspondance
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              {getTrendIcon(path.marketTrend)}
                              {getTrendLabel(path.marketTrend)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reaction && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reaction.reaction === 'interested' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : reaction.reaction === 'not_interested'
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {reaction.reaction === 'interested' ? 'Intéressé' : 
                           reaction.reaction === 'not_interested' ? 'Pas pour moi' : 'À explorer'}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-3 ml-13">
                    {path.description}
                  </p>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    {/* Match Reasons */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4 text-indigo-500" />
                        Pourquoi cette piste vous correspond
                      </h5>
                      <ul className="space-y-1">
                        {path.matchReasons.map((reason, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-indigo-500 mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Skills */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Compétences requises
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {path.requiredSkills.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          À développer
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {path.skillsToAcquire.map((skill, i) => (
                            <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Salary & Training */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          💰 Salaire indicatif
                        </h5>
                        <p className="text-gray-800 dark:text-white font-semibold">
                          {path.salaryRange}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                          <GraduationCap className="w-4 h-4" />
                          Formations recommandées
                        </h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400">
                          {path.trainingPath.slice(0, 2).map((training, i) => (
                            <li key={i}>• {training}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Next Steps */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-green-500" />
                        Prochaines étapes
                      </h5>
                      <ul className="space-y-1">
                        {path.nextSteps.map((step, i) => (
                          <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <span className="text-green-500 font-bold">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reaction Buttons */}
                    {!reaction && (
                      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Que pensez-vous de cette piste ?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleReaction(path, 'interested')}
                            disabled={isGeneratingFollowUp}
                            className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Ça m'intéresse
                          </button>
                          <button
                            onClick={() => handleReaction(path, 'need_more_info')}
                            disabled={isGeneratingFollowUp}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                          >
                            <HelpCircle className="w-4 h-4" />
                            J'ai des questions
                          </button>
                          <button
                            onClick={() => handleReaction(path, 'not_interested')}
                            disabled={isGeneratingFollowUp}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Pas pour moi
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Follow-up Question */}
                    {reaction?.followUpQuestion && !reaction.followUpAnswer && currentFollowUp?.path.title === path.title && (
                      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 mb-3">
                          {currentFollowUp.question}
                        </p>
                        <textarea
                          value={followUpAnswer}
                          onChange={(e) => setFollowUpAnswer(e.target.value)}
                          placeholder="Votre réponse..."
                          className="w-full p-3 border border-indigo-200 dark:border-indigo-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          rows={3}
                        />
                        <button
                          onClick={handleFollowUpSubmit}
                          disabled={!followUpAnswer.trim()}
                          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          Envoyer
                        </button>
                      </div>
                    )}

                    {/* Answered Follow-up */}
                    {reaction?.followUpAnswer && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                          "{reaction.followUpAnswer}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exploration Questions */}
      {explorationResult.explorationQuestions.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h3 className="font-semibold text-gray-800 dark:text-white mb-3">
            Questions pour approfondir votre réflexion
          </h3>
          <ul className="space-y-2">
            {explorationResult.explorationQuestions.map((question, i) => (
              <li key={i} className="text-gray-600 dark:text-gray-400 text-sm flex items-start gap-2">
                <span className="text-indigo-500">💡</span>
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ces pistes sont des suggestions basées sur votre profil. 
          Elles seront intégrées à votre document de synthèse.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Continuer le bilan
        </button>
      </div>
    </div>
  );
};

export default CareerExploration;
