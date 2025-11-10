import { describe, it, expect, vi } from 'vitest';
import { Context } from 'hono';
import { ZodError } from 'zod';
import { errorHandler } from '../../middleware/error.js';
import type { Env } from '../../types/env.js';

describe('Error Middleware', () => {
  let mockContext: Context<Env>;

  beforeEach(() => {
    mockContext = {
      json: vi.fn().mockReturnValue({}),
    } as any;
  });

  it('should handle Zod validation errors', () => {
    const zodError = new ZodError([
      {
        path: ['userName'],
        message: 'Required',
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
      },
    ]);

    errorHandler(zodError, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Validation error',
        details: expect.any(Array),
      }),
      400
    );
  });

  it('should handle duplicate key errors', () => {
    const error = new Error('duplicate key value violates unique constraint');
    errorHandler(error, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Resource already exists' },
      409
    );
  });

  it('should handle foreign key errors', () => {
    const error = new Error('foreign key constraint');
    errorHandler(error, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Referenced resource not found' },
      404
    );
  });

  it('should handle generic errors', () => {
    const error = new Error('Generic error');
    process.env.NODE_ENV = 'production';
    
    errorHandler(error, mockContext);

    expect(mockContext.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Internal server error',
      }),
      500
    );
  });
});

