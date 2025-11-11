#!/bin/bash

# Check environment variables and AI provider configuration

echo "🔍 Checking environment variables..."
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✅ .env.local file exists"
    echo ""
    echo "📋 API Keys found in .env.local:"
    grep -E "GEMINI|OPENAI|CLAUDE" .env.local | sed 's/=.*/=***/' || echo "   No API keys found"
else
    echo "⚠️  .env.local file NOT found"
    echo ""
    echo "📝 Create .env.local with at least one API key:"
    echo "   VITE_GEMINI_API_KEY=your_key_here"
    echo "   VITE_OPENAI_API_KEY=your_key_here  (optional)"
    echo "   VITE_CLAUDE_API_KEY=your_key_here  (optional)"
fi

echo ""
echo "🔍 Checking Docker environment..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker is running"
    echo ""
    echo "📋 Checking frontend container environment..."
    docker-compose exec frontend printenv | grep -E "VITE_|GEMINI|OPENAI|CLAUDE" 2>/dev/null || echo "   Frontend container not running"
else
    echo "⚠️  Docker is not running"
fi

echo ""
echo "🧪 Testing AI Service initialization..."
echo "   (This will show if providers can be initialized)"
node -e "
try {
  const { getAIService } = require('./services/aiService.ts');
  const service = getAIService();
  console.log('✅ AI Service initialized');
  console.log('📊 Providers:', service.getAvailableProviders());
} catch (error) {
  console.error('❌ Error:', error.message);
}
" 2>&1 || echo "   (Node test requires TypeScript compilation)"

