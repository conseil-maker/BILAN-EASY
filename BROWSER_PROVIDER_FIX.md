# Browser Provider Fix

## Problem
OpenAI and Claude providers were failing to initialize in the browser with error:
```
It looks like you're running in a browser-like environment.
This is disabled by default, as it risks exposing your secret API credentials to attackers.
```

## Root Cause
Both OpenAI and Anthropic SDKs block browser usage by default for security reasons. Since we're using Vite which embeds API keys in the build anyway, we need to explicitly allow browser usage.

## Solution

### 1. OpenAI Provider (`services/providers/openaiProvider.ts`)
Added `dangerouslyAllowBrowser: true` to OpenAI client initialization:
```typescript
this.client = new OpenAI({ 
  apiKey,
  dangerouslyAllowBrowser: true 
});
```

### 2. Claude Provider (`services/providers/claudeProvider.ts`)
Added `dangerouslyAllowBrowser: true` to Anthropic client initialization:
```typescript
this.client = new Anthropic({ 
  apiKey,
  dangerouslyAllowBrowser: true 
});
```

## Security Note
⚠️ **Important**: API keys are already exposed in the Vite build bundle. This is a known limitation of frontend-only AI integrations. For production, consider:
- Using a backend proxy for API calls
- Implementing API key rotation
- Using domain restrictions on API keys
- Rate limiting on the backend

## Expected Behavior After Fix

### Before:
```
❌ Failed to initialize OpenAI provider: dangerouslyAllowBrowser required
❌ Failed to initialize Claude provider: dangerouslyAllowBrowser required
✅ Multi-Provider AI Service initialized with 1 provider(s)  // Only Gemini
```

### After:
```
✅ Gemini provider initialized
✅ OpenAI provider initialized
✅ Claude provider initialized
✅ Multi-Provider AI Service initialized with 3 provider(s)
```

## Fallback Behavior

When Gemini hits 429 (quota exceeded):
1. System automatically switches to OpenAI
2. If OpenAI also fails, switches to Claude
3. If all fail, shows error with retry option

## Testing

After rebuild, check browser console:
1. All three providers should initialize successfully
2. When Gemini 429 occurs, fallback should work automatically
3. No more "dangerouslyAllowBrowser" errors

