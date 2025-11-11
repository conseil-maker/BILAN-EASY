#!/bin/bash

# Verify .env.local integration and Docker build

set -e

echo "🔍 Verifying .env.local integration..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "📝 Create .env.local with:"
    echo "   VITE_GEMINI_API_KEY=your_key"
    exit 1
fi

echo "✅ .env.local file exists"
echo ""

# Check API keys in .env.local
echo "📋 API Keys in .env.local:"
grep -E "^VITE_(GEMINI|OPENAI|CLAUDE)_API_KEY" .env.local | sed 's/=.*/=***/' || echo "   ⚠️  No VITE_*_API_KEY found"

echo ""
echo "🔍 Checking docker-compose.yml build args..."
if grep -q "VITE_GEMINI_API_KEY.*\${VITE_GEMINI_API_KEY}" docker-compose.yml; then
    echo "✅ docker-compose.yml correctly references VITE_GEMINI_API_KEY"
else
    echo "❌ docker-compose.yml might not be reading .env.local correctly"
fi

echo ""
echo "🧪 Testing Vite config..."
if npm run build 2>&1 | grep -q "Vite Config"; then
    echo "✅ Vite config loads environment variables"
else
    echo "⚠️  Vite config might not be loading env vars (check build output)"
fi

echo ""
echo "📝 Next steps:"
echo "1. Ensure .env.local has VITE_GEMINI_API_KEY=your_key"
echo "2. Rebuild: docker-compose build frontend"
echo "3. Check browser console for '🔍 AI Provider Environment Check' log"
echo "4. Verify providers are initialized: '✅ Gemini provider initialized'"

