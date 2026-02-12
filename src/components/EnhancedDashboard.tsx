import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardData } from '../types';
import WordCloud from './WordCloud';

interface EnhancedDashboardProps {
  data: DashboardData | null;
  isLoading: boolean;
  userName?: string;
  currentPhase?: string;
  questionsAnswered?: number;
  totalQuestions?: number;
  timeSpent?: number;
  lastQuestion?: string;
  onCollapse?: () => void;
}

// Citations inspirantes pour le développement professionnel
const INSPIRATIONAL_QUOTES = [
  {
    text: "Le succès n'est pas la clé du bonheur. Le bonheur est la clé du succès.",
    author: "Albert Schweitzer",
    theme: "motivation"
  },
  {
    text: "Choisissez un travail que vous aimez et vous n'aurez pas à travailler un seul jour de votre vie.",
    author: "Confucius",
    theme: "carrière"
  },
  {
    text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.",
    author: "Steve Jobs",
    theme: "passion"
  },
  {
    text: "Votre temps est limité, ne le gâchez pas en vivant la vie de quelqu'un d'autre.",
    author: "Steve Jobs",
    theme: "authenticité"
  },
  {
    text: "Le talent gagne des matchs, mais le travail d'équipe gagne des championnats.",
    author: "Michael Jordan",
    theme: "équipe"
  },
  {
    text: "La créativité, c'est l'intelligence qui s'amuse.",
    author: "Albert Einstein",
    theme: "créativité"
  },
  {
    text: "N'ayez pas peur de renoncer au bon pour aller vers le meilleur.",
    author: "John D. Rockefeller",
    theme: "changement"
  },
  {
    text: "Le leadership, c'est l'art de donner aux gens une plateforme pour répandre des idées qui fonctionnent.",
    author: "Seth Godin",
    theme: "leadership"
  },
  {
    text: "La connaissance s'acquiert par l'expérience, tout le reste n'est que de l'information.",
    author: "Albert Einstein",
    theme: "expérience"
  },
  {
    text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.",
    author: "Sénèque",
    theme: "courage"
  },
  {
    text: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.",
    author: "Proverbe chinois",
    theme: "action"
  },
  {
    text: "Vos compétences vous ouvrent des portes, mais c'est votre caractère qui vous y maintient.",
    author: "Anonyme",
    theme: "compétences"
  },
  {
    text: "L'échec est simplement l'opportunité de recommencer, cette fois plus intelligemment.",
    author: "Henry Ford",
    theme: "résilience"
  },
  {
    text: "La communication est une compétence que vous pouvez apprendre. C'est comme faire du vélo.",
    author: "Brian Tracy",
    theme: "communication"
  },
  {
    text: "Les grandes choses ne sont jamais faites par une seule personne. Elles sont faites par une équipe.",
    author: "Steve Jobs",
    theme: "collaboration"
  }
];

// Conseils contextuels basés sur les mots-clés
const CONTEXTUAL_TIPS: Record<string, { icon: string; tip: string }> = {
  compétences: {
    icon: "💡",
    tip: "Pensez à des situations concrètes où vous avez utilisé cette compétence avec succès."
  },
  valeurs: {
    icon: "❤️",
    tip: "Vos valeurs sont le socle de votre épanouissement professionnel. Prenez le temps d'y réfléchir."
  },
  motivation: {
    icon: "🔥",
    tip: "Ce qui vous motive révèle souvent vos talents naturels et vos aspirations profondes."
  },
  projet: {
    icon: "🎯",
    tip: "Un projet professionnel réussi aligne vos compétences, vos valeurs et vos aspirations."
  },
  parcours: {
    icon: "🛤️",
    tip: "Chaque expérience de votre parcours vous a apporté des compétences uniques."
  },
  changement: {
    icon: "🌱",
    tip: "Le changement est une opportunité de croissance. Accueillez-le avec curiosité."
  },
  équipe: {
    icon: "🤝",
    tip: "Réfléchissez à votre rôle naturel dans une équipe : leader, médiateur, créatif, organisateur ?"
  },
  formation: {
    icon: "📚",
    tip: "L'apprentissage continu est la clé de l'adaptabilité professionnelle."
  },
  stress: {
    icon: "🧘",
    tip: "Identifier vos sources de stress permet de mieux les gérer et de préserver votre énergie."
  },
  default: {
    icon: "💭",
    tip: "Prenez le temps de réfléchir. Il n'y a pas de mauvaise réponse, seulement votre vérité."
  }
};

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  data,
  isLoading,
  lastQuestion,
  onCollapse,
}) => {
  const { t } = useTranslation('questionnaire');
  const [currentQuote, setCurrentQuote] = useState(INSPIRATIONAL_QUOTES[0]);
  const [contextualTip, setContextualTip] = useState(CONTEXTUAL_TIPS.default);

  // Changer la citation et le conseil en fonction de la question
  useEffect(() => {
    if (lastQuestion) {
      const questionLower = lastQuestion.toLowerCase();
      
      // Trouver une citation pertinente
      const relevantQuotes = INSPIRATIONAL_QUOTES.filter(q => 
        questionLower.includes(q.theme) || 
        q.text.toLowerCase().includes(questionLower.split(' ').find(w => w.length > 5) || '')
      );
      
      if (relevantQuotes.length > 0) {
        setCurrentQuote(relevantQuotes[Math.floor(Math.random() * relevantQuotes.length)]);
      } else {
        // Citation aléatoire si aucune correspondance
        setCurrentQuote(INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)]);
      }

      // Trouver un conseil contextuel
      let foundTip = false;
      for (const [keyword, tip] of Object.entries(CONTEXTUAL_TIPS)) {
        if (keyword !== 'default' && questionLower.includes(keyword)) {
          setContextualTip(tip);
          foundTip = true;
          break;
        }
      }
      if (!foundTip) {
        setContextualTip(CONTEXTUAL_TIPS.default);
      }
    }
  }, [lastQuestion]);

  return (
    <div className="space-y-4 relative h-full flex flex-col">
      {/* Bouton pour replier le panneau */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          className="absolute -left-3 top-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-1.5 rounded-full shadow transition-all z-10"
          title={t('enhanced.hidePanel')}
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Citation inspirante */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800 shadow-sm flex-shrink-0">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💬</span>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-200 italic leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 font-medium">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </div>

      {/* Conseil contextuel */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-100 dark:border-amber-800 flex-shrink-0">
        <div className="flex items-start gap-2">
          <span className="text-xl flex-shrink-0">{contextualTip.icon}</span>
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
            <strong>{t('enhanced.advice')}:</strong> {contextualTip.tip}
          </p>
        </div>
      </div>

      {/* Titre du panneau - Thèmes Émergents */}
      <div className="flex items-center justify-center p-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-lg flex-shrink-0">
        <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <span>🏷️</span> {t('enhanced.emergingThemes')}
        </span>
      </div>

      {/* Contenu - Thèmes émergents */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="space-y-3">
          {isLoading && !data ? (
            <LoadingState message={t('enhanced.analyzingThemes')} />
          ) : data?.themes && data.themes.length > 0 ? (
            <WordCloud data={data.themes} />
          ) : (
            <EmptyState
              icon="🏷️"
              title={t('enhanced.themesBuilding')}
              description={t('enhanced.themesBuildingDesc')}
            />
          )}
          
          {/* Note informative */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>{t('enhanced.note')}:</strong> {t('enhanced.noteText')}
            </p>
          </div>
        </div>
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
