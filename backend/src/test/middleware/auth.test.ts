import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Context } from 'hono';
import { requireAuth, optionalAuth } from '../../middleware/auth.js';
import type { Env } from '../../types/env.js';

describe('Auth Middleware', () => {
  let mockContext: Context<Env>;
  let mockNext: any;

  beforeEach(() => {
    mockNext = vi.fn().mockResolvedValue(undefined);
    mockContext = {
      req: {
        header: vi.fn(),
      },
      set: vi.fn(),
      json: vi.fn(),
    } as any;
  });

  it('should set userId from X-Test-User-Id header in test mode', async () => {
    (mockContext.req.header as any).mockImplementation((name: string) => {
      if (name === 'X-Test-User-Id') return 'test-user-123';
      if (name === 'X-Session-Id') return 'session-123';
      return null;
    });

    await requireAuth(mockContext, mockNext);

    expect(mockContext.set).toHaveBeenCalledWith('userId', 'test-user-123');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should use default user ID if header not provided', async () => {
    (mockContext.req.header as any).mockImplementation(() => null);

    await requireAuth(mockContext, mockNext);

    expect(mockContext.set).toHaveBeenCalledWith('userId', expect.any(String));
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle optionalAuth without blocking', async () => {
    (mockContext.req.header as any).mockImplementation(() => null);

    await optionalAuth(mockContext, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});

