import React, { useState, useEffect, useRef } from 'react';
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
  onCollapse?: () => void; // Callback pour masquer le panneau depuis le parent
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
  parcours: ['journey', 'path', 'road'],
  expérience: ['experience', 'work', 'professional'],
  émotion: ['emotion', 'feeling', 'heart'],
  fierté: ['proud', 'achievement', 'success'],
  startup: ['startup', 'entrepreneur', 'business'],
  default: ['thinking', 'working', 'professional']
};

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  data,
  isLoading,
  lastQuestion,
  onCollapse,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('themes');
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifLoading, setGifLoading] = useState(false);
  const lastQuestionRef = useRef<string | null>(null);

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
      // Ne pas recharger si la question n'a pas changé
      if (!lastQuestion || lastQuestion === lastQuestionRef.current) {
        return;
      }
      
      lastQuestionRef.current = lastQuestion;
      setGifLoading(true);

      // Trouver le mot-clé correspondant dans la question
      const questionLower = lastQuestion.toLowerCase();
      let searchTerm = 'professional';
      let foundKeyword = false;
      
      for (const [keyword, terms] of Object.entries(GIF_KEYWORDS)) {
        if (keyword !== 'default' && questionLower.includes(keyword)) {
          searchTerm = terms[Math.floor(Math.random() * terms.length)];
          foundKeyword = true;
          break;
        }
      }

      // Si aucun mot-clé trouvé, utiliser les thèmes émergents ou un terme par défaut
      if (!foundKeyword) {
        if (data?.themes && data.themes.length > 0) {
          const topTheme = data.themes[0].text.toLowerCase();
          for (const [keyword, terms] of Object.entries(GIF_KEYWORDS)) {
            if (keyword !== 'default' && topTheme.includes(keyword)) {
              searchTerm = terms[Math.floor(Math.random() * terms.length)];
              break;
            }
          }
        } else {
          // Utiliser un terme par défaut aléatoire
          const defaultTerms = GIF_KEYWORDS.default;
          searchTerm = defaultTerms[Math.floor(Math.random() * defaultTerms.length)];
        }
      }

      try {
        // Utiliser l'API GIPHY avec la clé publique officielle pour les développeurs
        const GIPHY_API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65';
        const response = await fetch(
          `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(searchTerm)}&limit=10&rating=g&lang=fr`
        );
        
        if (!response.ok) {
          throw new Error('Erreur API GIPHY');
        }
        
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          const randomIndex = Math.floor(Math.random() * Math.min(result.data.length, 5));
          // Utiliser fixed_height au lieu de fixed_height_small pour une meilleure qualité
          setGifUrl(result.data[randomIndex].images.fixed_height.url);
        } else {
          // Fallback: garder le GIF précédent
          console.log('Aucun GIF trouvé pour:', searchTerm);
        }
      } catch (error) {
        console.error('Erreur chargement GIF:', error);
        // Garder le GIF précédent en cas d'erreur
      } finally {
        setGifLoading(false);
      }
    };

    fetchGif();
  }, [lastQuestion, data?.themes]);

  // Le masquage complet est géré par le parent via onCollapse

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      {/* Bouton pour replier le panneau - masque TOUT le volet */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className="absolute -left-3 top-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1.5 rounded-full shadow transition-all z-10"
          title="Masquer le panneau"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* GIF contextuel - hauteur fixe et bien visible */}
      <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm flex-shrink-0">
        {gifLoading ? (
          <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
          </div>
        ) : gifUrl ? (
          <img 
            src={gifUrl} 
            alt="GIF contextuel" 
            className="w-full h-40 object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
            <span className="text-4xl">🎯</span>
          </div>
        )}
      </div>

      {/* Onglets de navigation simplifiés */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg flex-shrink-0">
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

      {/* Contenu selon l'onglet - avec overflow pour éviter le glissement */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {viewMode === 'themes' && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-900 py-1 z-10">
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
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 sticky top-0 bg-white dark:bg-gray-900 py-1 z-10">
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
