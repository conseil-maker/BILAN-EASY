import React, { useState } from 'react';
import { DashboardData } from '../types';
import WordCloud from './WordCloud';
import SkillsRadar from './SkillsRadar';
import { RadarChart, HorizontalBarChart, CompetenceScoreCard } from './CompetenceCharts';

interface EnhancedDashboardProps {
  data: DashboardData | null;
  isLoading: boolean;
  userName?: string;
  currentPhase?: string;
  questionsAnswered?: number;
  totalQuestions?: number;
  timeSpent?: number;
}

type ViewMode = 'themes' | 'skills' | 'progress';

const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  data,
  isLoading,
  userName,
  currentPhase,
  questionsAnswered = 0,
  totalQuestions = 0,
  timeSpent = 0,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('themes');

  // Convertir les données pour les graphiques
  const competenceData = data?.skills?.map((skill, index) => ({
    category: skill.name,
    score: skill.score,
    maxScore: 10,
    color: `hsl(${240 - index * 30}, 70%, 60%)`,
  })) || [];

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

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-indigo-100">Bonjour {userName || 'Utilisateur'}</p>
            <p className="font-semibold">{currentPhase || 'Phase d\'investigation'}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{questionsAnswered}</p>
            <p className="text-xs text-indigo-100">questions</p>
          </div>
        </div>
        
        {/* Barre de progression */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-indigo-100">
            <span>Progression</span>
            <span>{totalQuestions > 0 ? Math.round((questionsAnswered / totalQuestions) * 100) : 0}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${totalQuestions > 0 ? (questionsAnswered / totalQuestions) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Temps passé */}
        <div className="mt-3 flex items-center gap-2 text-sm text-indigo-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{timeSpent} min passées</span>
        </div>
      </div>

      {/* Onglets de navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
        {[
          { id: 'themes', label: 'Thèmes', icon: '🏷️' },
          { id: 'skills', label: 'Compétences', icon: '📊' },
          { id: 'progress', label: 'Détails', icon: '📈' },
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
      <div className="min-h-[300px]">
        {viewMode === 'themes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🏷️</span> Thèmes Émergents
            </h3>
            {isLoading && !data ? (
              <LoadingState message="Analyse des thèmes en cours..." />
            ) : data?.themes && data.themes.length > 0 ? (
              <WordCloud data={data.themes} />
            ) : (
              <EmptyState
                icon="🏷️"
                title="Thèmes en construction"
                description="Répondez à quelques questions pour voir apparaître les thèmes clés de votre profil."
              />
            )}
          </div>
        )}

        {viewMode === 'skills' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📊</span> Analyse des Compétences
            </h3>
            {isLoading && !data ? (
              <LoadingState message="Analyse des compétences en cours..." />
            ) : data?.skills && data.skills.length > 0 ? (
              <div className="space-y-6">
                {/* Radar Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <RadarChart
                    data={radarData}
                    size={250}
                    showLabels={true}
                    showValues={false}
                  />
                </div>
                
                {/* Barres horizontales */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <HorizontalBarChart
                    data={barData}
                    maxValue={10}
                    height={24}
                    showValues={true}
                  />
                </div>
              </div>
            ) : (
              <EmptyState
                icon="📊"
                title="Analyse en préparation"
                description="Votre radar de compétences se construira progressivement au fil de vos réponses."
              />
            )}
          </div>
        )}

        {viewMode === 'progress' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>📈</span> Détails du parcours
            </h3>
            
            {/* Statistiques détaillées */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Questions"
                value={questionsAnswered}
                total={totalQuestions}
                icon="❓"
                color="blue"
              />
              <StatCard
                label="Temps"
                value={timeSpent}
                unit="min"
                icon="⏱️"
                color="green"
              />
              <StatCard
                label="Thèmes"
                value={data?.themes?.length || 0}
                icon="🏷️"
                color="purple"
              />
              <StatCard
                label="Compétences"
                value={data?.skills?.length || 0}
                icon="💪"
                color="orange"
              />
            </div>

            {/* Score global si disponible */}
            {data?.skills && data.skills.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Score global de compétences
                  </span>
                  <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(
                      (data.skills.reduce((sum, s) => sum + s.score, 0) / (data.skills.length * 10)) * 100
                    )}%
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                    style={{
                      width: `${
                        (data.skills.reduce((sum, s) => sum + s.score, 0) / (data.skills.length * 10)) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Conseils */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">Conseil</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Prenez le temps de répondre de manière détaillée. Plus vos réponses sont complètes, 
                    plus l'analyse sera précise et personnalisée.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Composants utilitaires
const LoadingState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-3" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

const EmptyState: React.FC<{ icon: string; title: string; description: string }> = ({
  icon,
  title,
  description,
}) => (
  <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
    <span className="text-4xl mb-3 block">{icon}</span>
    <p className="font-medium text-gray-700 dark:text-gray-300">{title}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: number;
  total?: number;
  unit?: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}> = ({ label, value, total, unit, icon, color }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {value}
            {total && <span className="text-sm font-normal text-gray-400">/{total}</span>}
            {unit && <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
