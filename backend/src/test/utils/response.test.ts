import { describe, it, expect, vi } from 'vitest';
import { Context } from 'hono';
import { success, error, paginated } from '../../utils/response.js';
import type { Env } from '../../types/env.js';

describe('Response Utils', () => {
  let mockContext: Context<Env>;

  beforeEach(() => {
    mockContext = {
      json: vi.fn().mockReturnValue({}),
    } as any;
  });

  it('should return success response', () => {
    const data = { id: 'test-id', name: 'Test' };
    success(mockContext, data, 200);

    expect(mockContext.json).toHaveBeenCalledWith(data, 200);
  });

  it('should return error response', () => {
    error(mockContext, 'Test error', 400);

    expect(mockContext.json).toHaveBeenCalledWith(
      { error: 'Test error' },
      400
    );
  });

  it('should return paginated response', () => {
    const data = [{ id: '1' }, { id: '2' }];
    paginated(mockContext, data, 10, 2, 0);

    expect(mockContext.json).toHaveBeenCalledWith({
      data,
      pagination: {
        total: 10,
        limit: 2,
        offset: 0,
        hasMore: true,
      },
    });
  });
});

