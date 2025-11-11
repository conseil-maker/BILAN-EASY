/**
 * Rate-Limit Aware Client for Gemini API
 * 
 * Handles 429 errors with exponential backoff and Retry-After header support
 */

export interface RateLimitError {
  code: number;
  retried: boolean;
  nextRetryAt?: Date;
  retryAfter?: number;
  message: string;
}

export interface RateLimitConfig {
  baseDelay?: number; // Base delay in ms (default: 500)
  maxDelay?: number; // Max delay in ms (default: 10000)
  maxRetries?: number; // Max retry attempts (default: 3)
  factor?: number; // Exponential factor (default: 2)
}

class RateLimitClient {
  private config: Required<RateLimitConfig>;
  private metrics: {
    count: number;
    lastRetryAfter?: number;
    lastErrorAt?: Date;
    errorsByPath: Map<string, number>;
  } = {
    count: 0,
    errorsByPath: new Map(),
  };

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      baseDelay: config.baseDelay ?? 500,
      maxDelay: config.maxDelay ?? 10000,
      maxRetries: config.maxRetries ?? 3,
      factor: config.factor ?? 2,
    };
  }

  /**
   * Extract Retry-After from error response
   */
  private extractRetryAfter(error: any): number | null {
    // Check error details for RetryInfo
    const retryInfo = error?.error?.details?.find(
      (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    );
    if (retryInfo?.retryDelay) {
      const delayStr = retryInfo.retryDelay.replace('s', '');
      return parseInt(delayStr) * 1000; // Convert to ms
    }

    // Check for Retry-After header in response
    if (error?.response?.headers?.get) {
      const retryAfter = error.response.headers.get('Retry-After');
      if (retryAfter) {
        return parseInt(retryAfter) * 1000;
      }
    }

    return null;
  }

  /**
   * Calculate delay with exponential backoff and full jitter
   */
  private calculateDelay(attempt: number, retryAfter?: number | null): number {
    if (retryAfter) {
      // Use Retry-After if provided, add small jitter
      const jitter = Math.random() * 1000; // 0-1s jitter
      return Math.min(retryAfter + jitter, this.config.maxDelay);
    }

    // Exponential backoff with full jitter
    const exponentialDelay = this.config.baseDelay * Math.pow(this.config.factor, attempt);
    const jitteredDelay = Math.random() * exponentialDelay;
    return Math.min(jitteredDelay, this.config.maxDelay);
  }

  /**
   * Check if error is a rate limit error (429)
   */
  private isRateLimitError(error: any): boolean {
    const code = error?.error?.code || error?.code;
    const status = error?.error?.status || error?.status;
    return code === 429 || status === 'RESOURCE_EXHAUSTED' || status === 'RATE_LIMIT_EXCEEDED';
  }

  /**
   * Execute function with rate limit handling
   */
  async executeWithBackoff<T>(
    fn: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: any = null;
    let retried = false;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await fn();
        
        // Reset metrics on success
        if (attempt > 0) {
          console.log(`✅ ${operationName} succeeded after ${attempt} retry(ies)`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;

        // Check if it's a rate limit error (from Gemini API or already structured)
        const isRateLimit = this.isRateLimitError(error) || 
                           error?.code === 429 ||
                           error?.error?.code === 429;
        
        if (isRateLimit && attempt < this.config.maxRetries) {
          retried = true;
          this.metrics.count++;
          this.metrics.errorsByPath.set(
            operationName,
            (this.metrics.errorsByPath.get(operationName) || 0) + 1
          );
          this.metrics.lastErrorAt = new Date();

          const retryAfter = this.extractRetryAfter(error);
          this.metrics.lastRetryAfter = retryAfter || undefined;

          const delay = this.calculateDelay(attempt, retryAfter);
          const nextRetryAt = new Date(Date.now() + delay);

          console.warn(
            `⚠️ Rate limit (429) for ${operationName}, attempt ${attempt + 1}/${this.config.maxRetries + 1}. ` +
            `Retrying in ${Math.round(delay / 1000)}s...`
          );

          // Log to console for debugging
          if (typeof window !== 'undefined') {
            const metrics = this.getMetrics();
            console.log(
              `📊 Model Status: Current model: gemini-2.5-flash | ` +
              `Next retry: ${nextRetryAt.toLocaleTimeString()} | ` +
              `Retry-After: ${retryAfter ? Math.round(retryAfter / 1000) + 's' : 'calculated'} | ` +
              `Rate limit errors: ${metrics.count}`
            );
          }
          
          // Log metrics every minute
          this.logMetrics();

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // Not a rate limit error or max retries reached
        throw error;
      }
    }

    // All retries exhausted
    const retryAfter = this.extractRetryAfter(lastError);
    const error: RateLimitError = {
      code: 429,
      retried,
      message: lastError?.error?.message || lastError?.message || 'Rate limit exceeded',
      retryAfter: retryAfter || undefined,
      nextRetryAt: retryAfter ? new Date(Date.now() + retryAfter) : undefined,
    };

    throw error;
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      errorsByPath: Object.fromEntries(this.metrics.errorsByPath),
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      count: 0,
      errorsByPath: new Map(),
    };
  }

  /**
   * Log metrics (called periodically)
   */
  private logMetrics() {
    const now = Date.now();
    const lastMinute = this.metrics.lastErrorAt 
      ? Math.floor((now - this.metrics.lastErrorAt.getTime()) / 60000)
      : null;
    
    if (lastMinute !== null && lastMinute < 1 && this.metrics.count > 0) {
      console.log(
        `📈 Rate Limit Metrics (last minute): ` +
        `Count: ${this.metrics.count} | ` +
        `Last Retry-After: ${this.metrics.lastRetryAfter ? Math.round(this.metrics.lastRetryAfter / 1000) + 's' : 'N/A'} | ` +
        `Errors by path: ${JSON.stringify(Object.fromEntries(this.metrics.errorsByPath))}`
      );
    }
  }
}

// Singleton instance
let rateLimitClientInstance: RateLimitClient | null = null;

export const getRateLimitClient = (config?: RateLimitConfig): RateLimitClient => {
  if (!rateLimitClientInstance) {
    rateLimitClientInstance = new RateLimitClient(config);
  }
  return rateLimitClientInstance;
};

