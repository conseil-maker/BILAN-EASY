// Sentry Server Configuration (Backend)
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Profiling
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  // Release tracking
  release: process.env.APP_VERSION || undefined,
  // Filter out known non-critical errors
  beforeSend(event, hint) {
    // Don't send errors in development unless explicitly enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_DEV) {
      return null;
    }
    
    // Filter out expected errors
    if (event.exception) {
      const error = hint.originalException;
      if (error instanceof Error) {
        // Ignore validation errors (expected)
        if (error.message.includes('validation') || 
            error.message.includes('ValidationError')) {
          return null;
        }
      }
    }
    
    return event;
  },
});

