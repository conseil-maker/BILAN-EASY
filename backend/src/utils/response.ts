import { Context } from 'hono';
import type { Env } from '../types/env.js';

// Helper pour réponses success
export const success = <T>(c: Context<Env>, data: T, status: number = 200) => {
  return c.json(data, status as any);
};

// Helper pour réponses error
export const error = (c: Context<Env>, message: string, status: number = 400, details?: any) => {
  return c.json({
    error: message,
    ...(details && { details }),
  }, status as any);
};

// Helper pour réponses paginées
export const paginated = <T>(
  c: Context<Env>,
  data: T[],
  total: number,
  limit: number,
  offset: number
) => {
  return c.json({
    data,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + data.length < total,
    },
  });
};
