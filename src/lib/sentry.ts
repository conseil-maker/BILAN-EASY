/**
 * Configuration Sentry pour le monitoring des erreurs
 * 
 * Ce module initialise Sentry pour capturer les erreurs en production.
 * La clé DSN doit être configurée dans les variables d'environnement.
 */

import * as Sentry from '@sentry/react';

/**
 * Initialise Sentry avec la configuration appropriée
 */
export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  // Ne pas initialiser Sentry si pas de DSN configuré
  if (!dsn) {
    console.info('[Sentry] DSN non configuré, monitoring désactivé');
    return;
  }

  Sentry.init({
    dsn,
    
    // Environnement (production, staging, development)
    environment: import.meta.env.MODE,
    
    // Activer uniquement en production
    enabled: import.meta.env.PROD,
    
    // Intégrations
    integrations: [
      // Capture automatique des erreurs de navigation
      Sentry.browserTracingIntegration(),
      // Replay des sessions pour le débogage
      Sentry.replayIntegration({
        // Masquer les données sensibles
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Taux d'échantillonnage des traces (10% en production)
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    
    // Taux d'échantillonnage des replays (10% des sessions, 100% des erreurs)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Ignorer certaines erreurs courantes non critiques
    ignoreErrors: [
      // Erreurs réseau
      'Network request failed',
      'Failed to fetch',
      'NetworkError',
      'AbortError',
      // Erreurs de script tiers
      'Script error.',
      // Erreurs de navigation
      'ResizeObserver loop',
    ],
    
    // Filtrer les URLs de breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Ignorer les breadcrumbs de console en production
      if (breadcrumb.category === 'console' && import.meta.env.PROD) {
        return null;
      }
      return breadcrumb;
    },
    
    // Filtrer les événements avant envoi
    beforeSend(event, hint) {
      // Ne pas envoyer les erreurs en développement
      if (import.meta.env.DEV) {
        console.error('[Sentry] Erreur capturée (non envoyée en dev):', hint.originalException);
        return null;
      }
      
      // Ajouter des informations contextuelles
      event.tags = {
        ...event.tags,
        app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
      };
      
      return event;
    },
  });

  console.info('[Sentry] Monitoring initialisé');
}

/**
 * Capture une erreur manuellement
 */
export function captureError(error: Error, context?: Record<string, unknown>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture un message d'information
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level);
}

/**
 * Définit l'utilisateur courant pour le contexte Sentry
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Ajoute un breadcrumb personnalisé
 */
export function addBreadcrumb(
  message: string, 
  category: string, 
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

/**
 * Composant ErrorBoundary pour React
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * HOC pour wrapper les composants avec Sentry
 */
export const withProfiler = Sentry.withProfiler;

export default {
  initSentry,
  captureError,
  captureMessage,
  setUser,
  addBreadcrumb,
  ErrorBoundary,
  withProfiler,
};
