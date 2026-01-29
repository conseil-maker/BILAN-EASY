import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, MapPin, Building2, GraduationCap,
  Target, AlertTriangle, CheckCircle, Loader2, X, ChevronDown, ChevronUp,
  Briefcase, DollarSign, BarChart3, Lightbulb, ArrowRight
} from 'lucide-react';
import { 
  exploreJobMarket, 
  MarketExplorationResult 
} from '../services/geminiService';
import { Answer } from '../types';

interface MarketExplorationProps {
  answers: Answer[];
  targetJobTitle: string;
  userName: string;
  onClose: () => void;
  onExplorationComplete: (result: MarketExplorationResult) => void;
  onStartJobInterview: (jobTitle: string) => void;
}

export const MarketExploration: React.FC<MarketExplorationProps> = ({
  answers,
  targetJobTitle,
  userName,
  onClose,
  onExplorationComplete,
  onStartJobInterview
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<MarketExplorationResult | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('market');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarketData();
  }, [targetJobTitle]);

  const loadMarketData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await exploreJobMarket(answers, targetJobTitle, userName);
      setResult(data);
      onExplorationComplete(data);
    } catch (err) {
      console.error('Error loading market data:', err);
      setError('Une erreur est survenue lors de l\'analyse du marché. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDemandIcon = (level: string) => {
    switch (level) {
      case 'très_forte':
      case 'forte':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'moyenne':
        return <Minus className="w-5 h-5 text-yellow-500" />;
      case 'faible':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'très_forte': return 'bg-green-100 text-green-800 border-green-200';
      case 'forte': return 'bg-green-50 text-green-700 border-green-100';
      case 'moyenne': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
      case 'faible': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Bon';
    if (score >= 4) return 'Modéré';
    return 'Difficile';
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
            <h3 className="text-xl font-semibold text-gray-800">Analyse du marché en cours...</h3>
            <p className="text-gray-600 text-center">
              Notre IA analyse le marché de l'emploi pour le métier de <strong>{targetJobTitle}</strong> 
              et évalue la faisabilité de votre projet.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <BarChart3 className="w-4 h-4" />
              <span>Collecte des données du marché...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <h3 className="text-xl font-semibold text-gray-800">Erreur</h3>
            <p className="text-gray-600">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={loadMarketData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Réessayer
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                📊 Exploration du Marché
              </h2>
              <p className="text-indigo-100">
                Analyse complète pour : <strong>{result.targetJob.title}</strong>
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score de faisabilité */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Score de Faisabilité</h3>
                <p className="text-gray-600 text-sm">Basé sur votre profil et le marché actuel</p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getScoreColor(result.feasibilityAnalysis.overallScore)}`}>
                  {result.feasibilityAnalysis.overallScore}/10
                </div>
                <div className={`text-sm font-medium ${getScoreColor(result.feasibilityAnalysis.overallScore)}`}>
                  {getScoreLabel(result.feasibilityAnalysis.overallScore)}
                </div>
              </div>
            </div>
            <p className="mt-4 text-gray-700">{result.feasibilityAnalysis.feasibilityComment}</p>
          </div>

          {/* Section Marché */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('market')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-gray-800">Analyse du Marché</span>
              </div>
              {expandedSection === 'market' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSection === 'market' && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      {getDemandIcon(result.marketAnalysis.demandLevel)}
                      <span className="text-sm text-gray-500">Demande</span>
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${getDemandColor(result.marketAnalysis.demandLevel)}`}>
                      {result.marketAnalysis.demandLevel.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <TrendingUp className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-500">Tendance</span>
                    </div>
                    <div className="font-medium text-gray-800 capitalize">
                      {result.marketAnalysis.demandTrend}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-500">Salaire</span>
                    </div>
                    <div className="font-medium text-gray-800">
                      {result.marketAnalysis.salaryRange}
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <span className="text-sm text-gray-500">Régions</span>
                    </div>
                    <div className="text-sm text-gray-800">
                      {result.marketAnalysis.geographicOpportunities.slice(0, 2).join(', ')}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Building2 className="w-4 h-4 mr-2" />
                    Secteurs qui recrutent
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.marketAnalysis.sectors.map((sector, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {result.marketAnalysis.marketInsights}
                </p>
              </div>
            )}
          </div>

          {/* Section Compétences */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-800">Analyse de vos Compétences</span>
              </div>
              {expandedSection === 'skills' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSection === 'skills' && (
              <div className="p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Compétences correspondantes
                    </h4>
                    <ul className="space-y-1">
                      {result.feasibilityAnalysis.matchingSkills.map((skill, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-orange-700 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Compétences à développer
                    </h4>
                    <ul className="space-y-1">
                      {result.feasibilityAnalysis.skillGaps.map((gap, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-700">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-indigo-700 mb-2">Vos atouts pour ce métier</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.feasibilityAnalysis.strengthsForRole.map((strength, idx) => (
                      <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm">
                        {strength}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Formations */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('training')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-800">Formations Recommandées</span>
              </div>
              {expandedSection === 'training' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSection === 'training' && (
              <div className="p-4 space-y-3">
                {result.trainingRecommendations.map((training, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border ${
                      training.priority === 'essentielle' 
                        ? 'border-red-200 bg-red-50' 
                        : training.priority === 'recommandée'
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-gray-800">{training.title}</h5>
                        <p className="text-sm text-gray-600">{training.type} • {training.duration}</p>
                        {training.description && (
                          <p className="text-sm text-gray-500 mt-1">{training.description}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        training.priority === 'essentielle' 
                          ? 'bg-red-100 text-red-700' 
                          : training.priority === 'recommandée'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {training.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section Alternatives */}
          <div className="border rounded-xl overflow-hidden">
            <button
              onClick={() => toggleSection('alternatives')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-gray-800">Métiers Alternatifs</span>
              </div>
              {expandedSection === 'alternatives' ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSection === 'alternatives' && (
              <div className="p-4 space-y-3">
                {result.alternativePaths.map((alt, idx) => (
                  <div key={idx} className="p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium text-gray-800">{alt.jobTitle}</h5>
                        <p className="text-sm text-gray-600">{alt.relevance}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        alt.transitionEase === 'facile' 
                          ? 'bg-green-100 text-green-700' 
                          : alt.transitionEase === 'modérée'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        Transition {alt.transitionEase}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <button
              onClick={() => onStartJobInterview(result.targetJob.title)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              <span>Simuler une enquête métier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketExploration;
