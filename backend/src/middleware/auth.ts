import { Context, Next } from 'hono';
import { verifyToken } from '@clerk/backend';

// Middleware pour vérifier l'authentification Clerk
export const requireAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized - Missing token' }, 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token with Clerk
    const sessionClaims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (!sessionClaims || !sessionClaims.sub) {
      return c.json({ error: 'Unauthorized - Invalid token' }, 401);
    }

    // Add userId to context for use in routes
    c.set('userId', sessionClaims.sub);

    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Unauthorized - Token verification failed' }, 401);
  }
};

// Middleware optionnel pour récupérer les infos user sans bloquer
export const optionalAuth = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const sessionClaims = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY!,
      });

      if (sessionClaims && sessionClaims.sub) {
        c.set('userId', sessionClaims.sub);
      }
    }

    await next();
  } catch (error) {
    // Continue sans auth
    await next();
  }
};
