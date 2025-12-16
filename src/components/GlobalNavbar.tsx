import React from 'react';
import { User } from '@supabase/supabase-js';
import { UserMenu } from './UserMenu';
import organizationConfig from '../config/organization';

interface GlobalNavbarProps {
  user: User;
  userRole: string;
  showBackButton?: boolean;
  title?: string;
}

export const GlobalNavbar: React.FC<GlobalNavbarProps> = ({ 
  user, 
  userRole, 
  showBackButton = false,
  title
}) => {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <a
                href="#/"
                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Retour à l'accueil"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </a>
            )}
            
            <a href="#/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">BC</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title || 'Bilan de Compétences'}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {organizationConfig.name}
                </p>
              </div>
            </a>
          </div>

          {/* Navigation centrale (desktop) */}
          <div className="hidden lg:flex items-center gap-1">
            <a
              href="#/"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Accueil
            </a>
            <a
              href="#/mes-documents"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Documents
            </a>
            <a
              href="#/metiers"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Métiers
            </a>
            <a
              href="#/rendez-vous"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Rendez-vous
            </a>
            <a
              href="#/about"
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              À propos
            </a>
          </div>

          {/* Menu utilisateur */}
          <div className="flex items-center gap-3">
            {/* Badge Qualiopi (desktop) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-full">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-green-700 dark:text-green-400">Qualiopi</span>
            </div>

            {/* Menu utilisateur */}
            <UserMenu user={user} userRole={userRole} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default GlobalNavbar;
