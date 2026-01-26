/**
 * QuestionnaireHeader - En-tête du questionnaire
 * 
 * Affiche le titre, la progression, et les boutons d'action (paramètres, déconnexion).
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React from 'react';
import { Package, CurrentPhaseInfo } from '../../types';
import { ProgressionInfo } from '../../services/progressionService';

// Icônes
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const HelpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface QuestionnaireHeaderProps {
  pkg: Package;
  userName: string;
  currentPhaseInfo: CurrentPhaseInfo | null;
  progressionInfo: ProgressionInfo | null;
  onSettingsClick: () => void;
  onDashboardClick: () => void;
  onHelpClick: () => void;
  onLogoutClick: () => void;
  lastSaveTime: Date | null;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const QuestionnaireHeader: React.FC<QuestionnaireHeaderProps> = ({
  pkg,
  userName,
  currentPhaseInfo,
  progressionInfo,
  onSettingsClick,
  onDashboardClick,
  onHelpClick,
  onLogoutClick,
  lastSaveTime,
  isDarkMode = false,
  onToggleDarkMode,
}) => {
  const progressPercent = progressionInfo?.progressPercent || 0;
  
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Titre et info utilisateur */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-bold text-primary-800 font-display">
              {pkg.name}
            </h1>
            <p className="text-sm text-slate-500">
              Bonjour {userName}
            </p>
          </div>
          
          {/* Phase actuelle */}
          {currentPhaseInfo && (
            <div className="hidden md:block px-3 py-1 bg-primary-50 rounded-full">
              <span className="text-sm font-medium text-primary-700">
                {currentPhaseInfo.name}
              </span>
            </div>
          )}
        </div>
        
        {/* Barre de progression */}
        <div className="flex-1 max-w-xs mx-4 hidden sm:block">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-secondary transition-all duration-500"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
              {progressPercent}%
            </span>
          </div>
          
          {/* Indicateur de sauvegarde */}
          {lastSaveTime && (
            <p className="text-xs text-slate-400 text-right mt-1">
              ✓ Sauvegardé
            </p>
          )}
        </div>
        
        {/* Boutons d'action */}
        <div className="flex items-center gap-2">
          <button
            onClick={onHelpClick}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Aide"
          >
            <HelpIcon />
          </button>
          
          <button
            onClick={onDashboardClick}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Tableau de bord"
          >
            <DashboardIcon />
          </button>
          
          <button
            onClick={onSettingsClick}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Paramètres"
          >
            <SettingsIcon />
          </button>
          
          {onToggleDarkMode && (
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          )}
          
          <button
            onClick={onLogoutClick}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Se déconnecter"
          >
            <LogoutIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default QuestionnaireHeader;
