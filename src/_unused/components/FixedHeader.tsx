import React from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import organizationConfig from '../config/organization';

interface FixedHeaderProps {
  userName?: string;
  showDashboardLink?: boolean;
}

export const FixedHeader: React.FC<FixedHeaderProps> = ({ 
  userName,
  showDashboardLink = true 
}) => {
  const { t } = useTranslation('common');
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = '/';
    window.location.reload();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo et nom */}
          <a href="#/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BC</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-gray-900">
                {t('appName', 'Bilan de Compétences')}
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                {organizationConfig.name}
              </p>
            </div>
          </a>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Nom utilisateur (desktop) */}
            {userName && (
              <span className="hidden md:block text-sm text-gray-600">
                👋 {userName}
              </span>
            )}

            {/* Lien Accueil */}
            {showDashboardLink && (
              <a
                href="#/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="hidden sm:inline">{t('nav.dashboard', 'Dashboard')}</span>
              </a>
            )}

            {/* Bouton Déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={t('nav.logout', 'Se déconnecter')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{t('nav.logout', 'Déconnexion')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default FixedHeader;
