import { Context } from 'hono';
import { ZodError } from 'zod';
// Sentry is disabled for now - enable it later by adding SENTRY_DSN to .env
// import * as Sentry from '@sentry/node';
import type { Env } from '../types/env.js';

// Global error handler
export const errorHandler = (err: Error, c: Context<Env>) => {
  console.error('Error:', err);
  
  // Sentry is disabled for now - enable it later by adding SENTRY_DSN to .env
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(err, {
  //     tags: {
  //       path: c.req.path,
  //       method: c.req.method,
  //     },
  //     extra: {
  //       userId: c.get('userId'),
  //       headers: Object.fromEntries(c.req.raw.headers.entries()),
  //     },
  //   });
  // }

  // Zod validation errors
  if (err instanceof ZodError) {
    return c.json({
      error: 'Validation error',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    }, 400 as any);
  }

  // PostgreSQL errors
  if (err.message.includes('duplicate key')) {
    return c.json({
      error: 'Resource already exists',
    }, 409 as any);
  }

  if (err.message.includes('foreign key')) {
    return c.json({
      error: 'Referenced resource not found',
    }, 404 as any);
  }

  // Default error
  return c.json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500 as any);
};
