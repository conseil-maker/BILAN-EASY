import React, { useState, useEffect } from 'react';
import { DashboardData } from '../types';
import WordCloud from './WordCloud';
import { RadarChart, HorizontalBarChart } from './CompetenceCharts';

interface EnhancedDashboardProps {
  data: DashboardData | null;
  isLoading: boolean;
  userName?: string;
  currentPhase?: string;
  questionsAnswered?: number;
  totalQuestions?: number;
  timeSpent?: number;
  lastQuestion?: string; // Pour le GIF contextuel
}

type ViewMode = 'themes' | 'skills';

// Mots-clés pour les GIFs contextuels
const GIF_KEYWORDS: Record<string, string[]> = {
  carrière: ['career', 'success', 'professional'],
  compétences: ['skills', 'learning', 'growth'],
  motivation: ['motivation', 'energy', 'passion'],
  projet: ['project', 'planning', 'future'],
  réussite: ['achievement', 'celebration', 'win'],
  défi: ['challenge', 'determination', 'strength'],
  équipe: ['team', 'collaboration', 'teamwork'],
  créativité: ['creative', 'innovation', 'ideas'],
  leadership: ['leader', 'boss', 'management'],
  communication: ['communication', 'talking', 'conversation'],
  valeurs: ['values', 'heart', 'meaningful'],
  objectifs: ['goals', 'target', 'aim'],
  changement: ['change', 'transformation', 'new beginning'],
  stress: ['relax', 'calm', 'peace'],
  formation: ['learning', 'study', 'education'],
  default: ['thinking', 'working', 'professional']
};

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  data,
  isLoading,
  lastQuestion,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('themes');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Convertir les données pour les graphiques
  const radarData = data?.skills?.map(skill => ({
    label: skill.name.length > 12 ? skill.name.substring(0, 12) + '...' : skill.name,
    value: skill.score,
    maxValue: 10,
  })) || [];

  const barData = data?.skills?.map((skill, index) => ({
    label: skill.name,
    value: skill.score,
    color: `hsl(${240 - index * 20}, 70%, 60%)`,
  })) || [];

  // Charger un GIF contextuel basé sur la dernière question
  useEffect(() => {
    const fetchGif = async () => {
      if (!lastQuestion) {
        setGifUrl(null);
        return;
      }

      // Trouver le mot-clé correspondant dans la question
      const questionLower = lastQuestion.toLowerCase();
      let searchTerm = 'professional';
      
      for (const [keyword, terms] of Object.entries(GIF_KEYWORDS)) {
        if (keyword !== 'default' && questionLower.includes(keyword)) {
          searchTerm = terms[Math.floor(Math.random() * terms.length)];
          break;
        }
      }

      // Si aucun mot-clé trouvé, utiliser les thèmes émergents
      if (searchTerm === 'professional' && data?.themes && data.themes.length > 0) {
        const topTheme = data.themes[0].text.toLowerCase();
        for (const [keyword, terms] of Object.entries(GIF_KEYWORDS)) {
          if (keyword !== 'default' && topTheme.includes(keyword)) {
            searchTerm = terms[Math.floor(Math.random() * terms.length)];
            break;
          }
        }
      }

      try {
        // Utiliser l'API GIPHY avec la clé publique officielle pour les développeurs
        // Clé publique de démo GIPHY: https://developers.giphy.com/docs/api#quick-start-guide
        const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Clé publique GIPHY
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=10&rating=g&lang=fr`
        );
        
        if (!response.ok) {
          throw new Error('Erreur API GIPHY');
        }
        
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(result.data.length, 5));
          setGifUrl(result.data[randomIndex].images.fixed_height_small.url);
        } else {
          // Fallback: utiliser un GIF par défaut
          setGifUrl(null);
        }
      } catch (error) {
        console.error('Erreur chargement GIF:', error);
        // Pas de GIF en cas d'erreur
        setGifUrl(null);
      }
    };

    fetchGif();
  }, [lastQuestion, data?.themes]);

  if (isCollapsed) {
    return (
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg transition-all"
          title="Afficher le panneau"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* Bouton pour replier le panneau */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute -left-3 top-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1.5 rounded-full shadow transition-all z-10"
        title="Masquer le panneau"
      >
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>

      {/* GIF contextuel */}
      {gifUrl && (
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
          <img 
            src={gifUrl} 
            alt="GIF contextuel" 
            className="w-full h-32 object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Onglets de navigation simplifiés */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {[
          { id: 'themes', label: 'Thèmes', icon: '🏷️' },
          { id: 'skills', label: 'Compétences', icon: '📊' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setViewMode(tab.id as ViewMode)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              viewMode === tab.id
                ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <span className="mr-1">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Contenu selon l'onglet */}
      <div className="min-h-[200px]">
        {viewMode === 'themes' && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🏷️</span> Thèmes Émergents
            </h3>
            {isLoading && !data ? (
              <LoadingState message="Analyse des thèmes..." />
            ) : data?.themes && data.themes.length > 0 ? (
              <WordCloud data={data.themes} />
            ) : (
              <EmptyState
                icon="🏷️"
                title="Thèmes en construction"
                description="Répondez à quelques questions pour voir apparaître les thèmes clés."
              />
            )}
          </div>
        )}

        {viewMode === 'skills' && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📊</span> Compétences
            </h3>
            {isLoading && !data ? (
              <LoadingState message="Analyse des compétences..." />
            ) : data?.skills && data.skills.length > 0 ? (
              <div className="space-y-4">
                {/* Radar Chart compact */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  <RadarChart
                    data={radarData}
                    size={180}
                    showLabels={true}
                    showValues={false}
                  />
                </div>
                
                {/* Barres horizontales compactes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                  <HorizontalBarChart
                    data={barData.slice(0, 5)} // Limiter à 5 compétences
                    maxValue={10}
                    height={20}
                    showValues={true}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                icon="📊"
                title="Analyse en préparation"
                description="Votre radar de compétences apparaîtra progressivement."
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Composants utilitaires
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mx-auto mb-2" />
    <p className="text-xs text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

const EmptyState: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
    <span className="text-3xl mb-2 block">{icon}</span>
    <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">{title}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
  </div>
);

export default EnhancedDashboard;
