# Rate-Limit Aware Client Implementation

## Overview
Comprehensive rate-limit handling system for Gemini API calls with automatic retry, fallback, and user-friendly error handling.

## Features Implemented

### 1. Rate-Limit Aware Client (`services/rateLimitClient.ts`)
- ✅ Detects 429 errors from Gemini API
- ✅ Respects `Retry-After` header from API responses
- ✅ Exponential backoff with full jitter: base=500ms, factor=2, maxDelay=10s, maxRetries=3
- ✅ Returns structured errors: `{ code, retried, nextRetryAt, retryAfter, message }`
- ✅ Metrics tracking: error count, last Retry-After, errors by path
- ✅ Console logging: Model status with next retry ETA

### 2. Request Queue (`services/requestQueue.ts`)
- ✅ Concurrency limiting: max 2 in-flight requests
- ✅ Request deduplication: same request within 5s returns cached promise
- ✅ Queue management with automatic processing

### 3. Throttle Hook (`hooks/useThrottle.ts`)
- ✅ 1.5s throttle for answer submission
- ✅ Prevents duplicate calls on re-render
- ✅ Debounced execution

### 4. UI Improvements (`components/Questionnaire.tsx`)
- ✅ Single toast for 429 errors (no repeated bubbles)
- ✅ Button disabled while request is pending (`isRequestPending`)
- ✅ Retry ETA display when `Retry-After` is available
- ✅ CTA message when all retries fail: "Try again in X seconds"
- ✅ Improved error detection: checks `error.code === 429` first

### 5. Backend Client (`backend/src/utils/geminiClient.ts`)
- ✅ Rate limit handling with exponential backoff
- ✅ Request coalescing (5s window)
- ✅ Per-user request deduplication
- ✅ Metrics and logging
- ✅ Ready for future backend Gemini calls

### 6. Error Structure Preservation
- ✅ Gemini API errors converted to structured format
- ✅ Error structure preserved through `aiService` fallback chain
- ✅ Rate limit errors maintain `code`, `retryAfter`, `nextRetryAt` fields
- ✅ Fallback model error handling preserves structure

### 7. Environment Variables
- ✅ `GEMINI_MAX_CONCURRENCY=2` (default)
- ✅ `GEMINI_FALLBACK_MODEL=gemini-1.5-flash` (optional)
- ✅ Docker and Vite configurations updated
- ✅ `.env.example` includes all new variables

### 8. All Gemini Calls Updated
- ✅ `generateQuestion` - uses queue + rate limit client + fallback
- ✅ `generateSynthesis` - uses queue + rate limit client
- ✅ `generateSummary` - uses queue + rate limit client
- ✅ `analyzeThemesAndSkills` - uses queue + rate limit client
- ✅ `analyzeUserProfile` - uses queue + rate limit client
- ✅ `suggestOptionalModule` - uses queue + rate limit client
- ✅ `findResourceLeads` - uses queue + rate limit client

## Error Flow

```
Gemini API Error (429)
  ↓
rateLimitClient.executeWithBackoff()
  ↓ (retries with backoff)
  ↓ (if all retries fail)
Structured Error: { code: 429, retryAfter, nextRetryAt, retried }
  ↓
geminiProvider (converts if needed)
  ↓
aiService.executeWithFallback()
  ↓ (preserves structure)
  ↓
Questionnaire component
  ↓
Single toast + UI handling
```

## Console Logging

When a 429 error occurs, the console shows:
```
📊 Model Status: Current model: gemini-2.5-flash | Next retry: 14:30:45 | Retry-After: 28s | Rate limit errors: 3
```

Metrics are logged every minute:
```
📈 Rate Limit Metrics (last minute): Count: 5 | Last Retry-After: 28s | Errors by path: {"generateQuestion":3,"generateSynthesis":2}
```

## Testing

### Manual Test (429 Simulation)
1. Set `GEMINI_API_KEY` to an invalid/expired key
2. Submit an answer
3. Observe:
   - Single toast appears: "Model rate limit reached. We'll retry automatically."
   - Button is disabled during retry
   - Console shows model status
   - After retries, fallback model is tried (if configured)
   - If all fail, CTA appears: "Try again in X seconds"

### Docker Test
```bash
docker-compose up --build
```

## Configuration

### `.env.local`
```env
VITE_GEMINI_API_KEY=your_key
VITE_GEMINI_MAX_CONCURRENCY=2
VITE_GEMINI_FALLBACK_MODEL=gemini-1.5-flash  # Optional
```

### Docker
All environment variables are passed through `docker-compose.yml` and `Dockerfile`.

## Files Modified

### Frontend
- `services/rateLimitClient.ts` - NEW
- `services/requestQueue.ts` - NEW
- `hooks/useThrottle.ts` - NEW
- `services/providers/geminiProvider.ts` - Updated all methods
- `services/aiService.ts` - Error structure preservation
- `components/Questionnaire.tsx` - UI handling, throttle, button states
- `vite.config.ts` - Environment variables
- `Dockerfile` - Build args
- `docker-compose.yml` - Environment variables

### Backend
- `backend/src/utils/geminiClient.ts` - NEW (ready for future use)
- `backend/tsconfig.json` - Exclude test files from build

### Documentation
- `.env.example` - Updated with new variables
- `RATE_LIMIT_IMPLEMENTATION.md` - This file

## Next Steps

1. Test in Docker environment
2. Monitor console for rate limit metrics
3. Verify fallback model works when configured
4. Check that multi-provider fallback (OpenAI/Claude) engages correctly

