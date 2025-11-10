import { Context } from 'hono';

// Helper pour réponses success
export const success = <T>(c: Context, data: T, status = 200) => {
  return c.json(data, status);
};

// Helper pour réponses error
export const error = (c: Context, message: string, status = 400, details?: any) => {
  return c.json({
    error: message,
    ...(details && { details }),
  }, status);
};

// Helper pour réponses paginées
export const paginated = <T>(
  c: Context,
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
