/**
 * Gemini API Client with Rate Limit Handling
 * 
 * Handles 429 errors with exponential backoff and Retry-After header support
 * Includes request coalescing for duplicate requests
 */

interface RateLimitConfig {
  baseDelay?: number;
  maxDelay?: number;
  maxRetries?: number;
  factor?: number;
}

interface QueuedRequest {
  id: string;
  fn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

interface CoalesceCache {
  [key: string]: {
    promise: Promise<any>;
    timestamp: number;
  };
}

class GeminiClient {
  private config: Required<RateLimitConfig>;
  private requestQueue: QueuedRequest[] = [];
  private inFlight: Set<string> = new Set();
  private maxConcurrency: number;
  private coalesceCache: CoalesceCache = {};
  private coalesceWindow: number = 5000; // 5 seconds
  private metrics: {
    count: number;
    lastRetryAfter?: number;
    lastErrorAt?: Date;
    errorsByPath: Map<string, number>;
  } = {
    count: 0,
    errorsByPath: new Map(),
  };

  constructor(config: RateLimitConfig = {}, maxConcurrency: number = 2) {
    this.config = {
      baseDelay: config.baseDelay ?? 500,
      maxDelay: config.maxDelay ?? 10000,
      maxRetries: config.maxRetries ?? 3,
      factor: config.factor ?? 2,
    };
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * Extract Retry-After from error response
   */
  private extractRetryAfter(error: any): number | null {
    const retryInfo = error?.error?.details?.find(
      (d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
    );
    if (retryInfo?.retryDelay) {
      const delayStr = retryInfo.retryDelay.replace('s', '');
      return parseInt(delayStr) * 1000;
    }
    return null;
  }

  /**
   * Calculate delay with exponential backoff and full jitter
   */
  private calculateDelay(attempt: number, retryAfter?: number | null): number {
    if (retryAfter) {
      const jitter = Math.random() * 1000;
      return Math.min(retryAfter + jitter, this.config.maxDelay);
    }
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
  private async executeWithBackoff<T>(
    fn: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: any = null;
    let retried = false;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await fn();
        if (attempt > 0) {
          console.log(`✅ ${operationName} succeeded after ${attempt} retry(ies)`);
        }
        return result;
      } catch (error: any) {
        lastError = error;

        if (this.isRateLimitError(error) && attempt < this.config.maxRetries) {
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

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        throw error;
      }
    }

    const retryAfter = this.extractRetryAfter(lastError);
    const error: any = new Error(lastError?.error?.message || lastError?.message || 'Rate limit exceeded');
    error.code = 429;
    error.retried = retried;
    error.retryAfter = retryAfter || undefined;
    error.nextRetryAt = retryAfter ? new Date(Date.now() + retryAfter) : undefined;
    throw error;
  }

  /**
   * Request coalescing - same prompt within window returns cached promise
   */
  private getCoalesceKey(prompt: string, model: string): string {
    return `${model}_${prompt.substring(0, 100)}`;
  }

  /**
   * Execute with coalescing
   */
  async executeWithCoalescing<T>(
    fn: () => Promise<T>,
    prompt: string,
    model: string,
    operationName: string
  ): Promise<T> {
    const key = this.getCoalesceKey(prompt, model);
    const now = Date.now();

    // Check if there's a recent request for the same prompt
    if (this.coalesceCache[key] && now - this.coalesceCache[key].timestamp < this.coalesceWindow) {
      console.log(`🔄 Request coalescing: reusing cached promise for ${operationName}`);
      return this.coalesceCache[key].promise;
    }

    // Create new request
    const promise = this.executeWithBackoff(fn, operationName);
    this.coalesceCache[key] = {
      promise,
      timestamp: now,
    };

    // Clean up old cache entries
    Object.keys(this.coalesceCache).forEach((k) => {
      if (now - this.coalesceCache[k].timestamp > this.coalesceWindow * 2) {
        delete this.coalesceCache[k];
      }
    });

    return promise;
  }

  /**
   * Queue management
   */
  private async processQueue() {
    while (this.requestQueue.length > 0 && this.inFlight.size < this.maxConcurrency) {
      const request = this.requestQueue.shift();
      if (!request) break;

      this.inFlight.add(request.id);

      request
        .fn()
        .then((result) => {
          this.inFlight.delete(request.id);
          request.resolve(result);
          this.processQueue();
        })
        .catch((error) => {
          this.inFlight.delete(request.id);
          request.reject(error);
          this.processQueue();
        });
    }
  }

  /**
   * Enqueue request
   */
  async enqueue<T>(fn: () => Promise<T>, requestId?: string): Promise<T> {
    const id = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        id,
        fn,
        resolve,
        reject,
        timestamp: Date.now(),
      });
      this.processQueue();
    });
  }

  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      errorsByPath: Object.fromEntries(this.metrics.errorsByPath),
      queueLength: this.requestQueue.length,
      inFlight: this.inFlight.size,
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
}

// Singleton instance
let geminiClientInstance: GeminiClient | null = null;

export const getGeminiClient = (): GeminiClient => {
  if (!geminiClientInstance) {
    const maxConcurrency = parseInt(process.env.GEMINI_MAX_CONCURRENCY || '2');
    geminiClientInstance = new GeminiClient({}, maxConcurrency);
  }
  return geminiClientInstance;
};

/**
 * Wrapper for Gemini API calls with rate limit handling
 */
export async function callGeminiWithBackoff<T>(
  fn: () => Promise<T>,
  prompt: string,
  model: string = 'gemini-2.5-flash',
  operationName: string = 'gemini-call'
): Promise<T> {
  const client = getGeminiClient();
  return client.enqueue(async () => {
    return client.executeWithCoalescing(fn, prompt, model, operationName);
  }, `${operationName}_${Date.now()}`);
}

