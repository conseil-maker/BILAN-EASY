import { serve } from '@hono/node-server';
import app from './app.js';
import 'dotenv/config';

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
