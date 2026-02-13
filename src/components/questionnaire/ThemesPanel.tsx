/**
 * ThemesPanel - Panneau latéral des thèmes émergents
 * 
 * Affiche les thèmes et compétences détectés pendant le questionnaire.
 * Mis à jour en temps réel au fur et à mesure des réponses.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardData } from '../../types';

interface ThemesPanelProps {
  dashboardData: DashboardData | null;
  isLoading?: boolean;
  isVisible?: boolean;
  onToggle?: () => void;
}

const ThemesPanel: React.FC<ThemesPanelProps> = ({
  dashboardData,
  isLoading = false,
  isVisible = true,
  onToggle,
}) => {
  const { t } = useTranslation('questionnaire');

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-2 py-4 rounded-l-lg shadow-lg hover:bg-primary-700 transition-colors z-40"
        title={t('themes.showThemes')}
      >
        <span className="writing-mode-vertical">📊 {t('themes.title')}</span>
      </button>
    );
  }
  
  return (
    <aside className="w-72 bg-white border-l border-slate-200 p-4 overflow-y-auto flex-shrink-0">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-primary-800 font-display">
          📊 {t('themes.title')}
        </h2>
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
            title={t('themes.hide')}
          >
            ✕
          </button>
        )}
      </div>
      
      {/* État de chargement */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      )}
      
      {/* Pas de données */}
      {!isLoading && !dashboardData && (
        <div className="text-center py-8 text-slate-500">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-sm">
            {t('themes.noThemesYet')}
          </p>
        </div>
      )}
      
      {/* Thèmes */}
      {!isLoading && dashboardData && (
        <>
          {/* Nuage de thèmes */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
              {t('themes.detectedThemes')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {dashboardData.themes.length > 0 ? (
                dashboardData.themes.slice(0, 10).map((theme, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium transition-all"
                    style={{
                      backgroundColor: `rgba(79, 70, 229, ${0.1 + theme.weight * 0.2})`,
                      color: theme.weight > 0.5 ? '#312e81' : '#4f46e5',
                      fontSize: `${0.75 + theme.weight * 0.25}rem`,
                    }}
                  >
                    {theme.text}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  {t('themes.noThemesDetected')}
                </p>
              )}
            </div>
          </div>
          
          {/* Compétences */}
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-3">
              {t('themes.identifiedSkills')}
            </h3>
            <div className="space-y-2">
              {dashboardData.skills.length > 0 ? (
                dashboardData.skills.slice(0, 6).map((skill, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-700 font-medium truncate">
                          {skill.label}
                        </span>
                        <span className="text-slate-500">
                          {Math.round(skill.score * 100)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary to-primary-500 transition-all duration-500"
                          style={{ width: `${skill.score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  {t('themes.skillsAnalyzing')}
                </p>
              )}
            </div>
          </div>
          
          {/* Note explicative */}
          <div className="mt-6 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500">
              💡 {t('themes.note')}
            </p>
          </div>
        </>
      )}
    </aside>
  );
};

export default ThemesPanel;
