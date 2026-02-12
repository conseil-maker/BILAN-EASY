/**
 * ErrorBoundary - Composant React pour capturer les erreurs de rendu
 * 
 * Ce composant capture les erreurs JavaScript dans l'arbre de composants enfants,
 * les log, et affiche une interface de secours au lieu de faire planter l'application.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError } from '../services/errorService';
import i18n from '../i18n';

const tErr = (key: string, fallbackFR: string, fallbackTR: string): string => {
  const lang = i18n.language || 'fr';
  return lang === 'tr' ? fallbackTR : fallbackFR;
};

// ============================================
// TYPES
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// COMPOSANT
// ============================================

/**
 * Error Boundary React
 * Capture les erreurs de rendu et affiche une interface de secours
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Méthode statique appelée lorsqu'une erreur est lancée
   * Met à jour l'état pour afficher l'interface de secours
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  /**
   * Méthode appelée après qu'une erreur a été capturée
   * Utilisée pour le logging et les effets secondaires
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Logger l'erreur via errorService
    handleError(error, 'ErrorBoundary.componentDidCatch', {
      severity: 'critical',
      showToast: false, // Pas de toast car on affiche déjà une UI d'erreur
    });

    // Mettre à jour l'état avec les infos d'erreur
    this.setState({ errorInfo });

    // Appeler le callback optionnel
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log supplémentaire pour le débogage
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  /**
   * Réinitialise l'état d'erreur pour permettre une nouvelle tentative
   */
  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  /**
   * Recharge la page
   */
  handleReload = (): void => {
    window.location.reload();
  };

  /**
   * Retourne à l'accueil
   */
  handleGoHome = (): void => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // Si un fallback personnalisé est fourni, l'utiliser
      if (fallback) {
        return fallback;
      }

      // Interface de secours par défaut
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Icône d'erreur */}
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            {/* Titre */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {tErr('errorTitle', 'Oops ! Une erreur est survenue', 'Oops! Bir hata oluştu')}
            </h1>

            {/* Message */}
            <p className="text-gray-600 mb-6">
              {tErr('errorMessage', "L'application a rencontr\u00e9 un probl\u00e8me inattendu. Nous nous excusons pour la g\u00eane occasionn\u00e9e.", 'Uygulama beklenmeyen bir sorunla kar\u015fila\u015ft\u0131. Verdi\u011fimiz rahats\u0131zl\u0131k i\u00e7in \u00f6z\u00fcr dileriz.')}
            </p>

            {/* Détails de l'erreur (en mode développement) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left overflow-auto max-h-40">
                <p className="text-sm font-mono text-red-600 mb-2">
                  {error.message}
                </p>
                {errorInfo && (
                  <pre className="text-xs text-gray-500 whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {tErr('retry', '🔄 R\u00e9essayer', '🔄 Tekrar dene')}
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                {tErr('goHome', "🏠 Retour \u00e0 l'accueil", '🏠 Ana sayfa')}
              </button>
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                {tErr('reload', '↻ Recharger', '↻ Yenile')}
              </button>
            </div>

            {/* Lien support */}
            <p className="mt-6 text-sm text-gray-500">
              {tErr('supportMessage', 'Si le probl\u00e8me persiste, contactez le support.', 'Sorun devam ederse destek ile ileti\u015fime ge\u00e7in.')}
            </p>
          </div>
        </div>
      );
    }

    // Pas d'erreur, rendre les enfants normalement
    return children;
  }
}

// ============================================
// COMPOSANTS SPÉCIALISÉS
// ============================================

/**
 * Error Boundary pour le questionnaire
 * Affiche un message spécifique et propose de reprendre le bilan
 */
export const QuestionnaireErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Questionnaire error:', error, errorInfo);
  };

  const fallback = (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">🤔</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {tErr('questionnaireError', 'Probl\u00e8me avec le questionnaire', 'Anket sorunu')}
        </h1>
        <p className="text-gray-600 mb-6">
          {tErr('questionnaireErrorMessage', "Une erreur s'est produite pendant le questionnaire. Vos r\u00e9ponses ont \u00e9t\u00e9 sauvegard\u00e9es automatiquement.", 'Anket s\u0131ras\u0131nda bir hata olu\u015ftu. Yan\u0131tlar\u0131n\u0131z otomatik olarak kaydedildi.')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            {tErr('resume', '🔄 Reprendre', '🔄 Devam et')}
          </button>
          <button
            onClick={() => {
              window.location.hash = '#/dashboard';
              window.location.reload();
            }}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            {tErr('dashboard', '📊 Tableau de bord', '📊 Kontrol paneli')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * Error Boundary pour le dashboard
 */
export const DashboardErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const fallback = (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-4xl">📊</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {tErr('displayError', "Probl\u00e8me d'affichage", 'G\u00f6r\u00fcnt\u00fcleme sorunu')}
        </h1>
        <p className="text-gray-600 mb-6">
          {tErr('dashboardErrorMessage', "Nous n'avons pas pu charger votre tableau de bord. Veuillez r\u00e9essayer.", 'Kontrol paneliniz y\u00fcklenemedi. L\u00fctfen tekrar deneyin.')}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          {tErr('reload', '🔄 Recharger', '🔄 Yenile')}
        </button>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
};

export { ErrorBoundary };
export default ErrorBoundary;
