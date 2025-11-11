import { serve } from '@hono/node-server';
// Sentry is disabled for now - enable it later by adding SENTRY_DSN to .env
// import * as Sentry from '@sentry/node';
// import { nodeProfilingIntegration } from '@sentry/profiling-node';
import app from './app.js';
import 'dotenv/config';

// Sentry is disabled for now - enable it later by adding SENTRY_DSN to .env
// if (process.env.SENTRY_DSN) {
//   Sentry.init({
//     dsn: process.env.SENTRY_DSN,
//     environment: process.env.NODE_ENV || 'development',
//     integrations: [
//       nodeProfilingIntegration(),
//     ],
//     tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//     profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
//     release: process.env.APP_VERSION || undefined,
//     beforeSend(event, hint) {
//       // Don't send errors in development unless explicitly enabled
//       if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_ENABLE_DEV) {
//         return null;
//       }
//       
//       // Filter out expected errors
//       if (event.exception) {
//         const error = hint.originalException;
//         if (error instanceof Error) {
//           // Ignore validation errors (expected)
//           if (error.message.includes('validation') || 
//               error.message.includes('ValidationError')) {
//             return null;
//           }
//         }
//       }
//       
//       return event;
//     },
//   });
// }

const port = parseInt(process.env.PORT || '3001');

console.log('🚀 Starting BILAN-EASY Backend API...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Port: ${port}`);
console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

// Vérifier les variables d'environnement critiques
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL is not set');
  process.exit(1);
}

if (!process.env.CLERK_SECRET_KEY) {
  console.warn('⚠️  WARNING: CLERK_SECRET_KEY is not set - Running in TEST MODE (auth bypassed)');
}

console.log(`\n✅ Server is running on http://localhost:${port}`);
console.log(`📋 Health check: http://localhost:${port}/health`);
console.log(`📡 API base: http://localhost:${port}/api\n`);

serve({
  fetch: app.fetch,
  port,
});
