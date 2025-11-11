// Sentry Client Configuration (Frontend)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || process.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE || 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  // Session Replay
  replaysSessionSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  // Release tracking
  release: import.meta.env.VITE_APP_VERSION || undefined,
  // Filter out localhost errors in production
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly enabled
    if (import.meta.env.MODE === 'development' && !import.meta.env.VITE_SENTRY_ENABLE_DEV) {
      return null;
    }
    
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore network errors that are expected (CORS, etc.)
        if (error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') ||
            error.message.includes('CORS')) {
          return null;
        }
      }
    }
    
    return event;
  },
});

