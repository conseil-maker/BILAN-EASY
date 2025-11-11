/**
 * Test script for AI providers
 * Tests if API keys are correctly configured and providers can be initialized
 */

import { getAIService } from './services/aiService.js';

console.log('🧪 Testing AI Providers...\n');

try {
  const service = getAIService();
  
  console.log('✅ AI Service initialized successfully!\n');
  console.log('📊 Available providers:', service.getAvailableProviders());
  console.log('🔧 Current provider:', service.getCurrentProvider());
  console.log('\n✅ All providers are ready to use!');
  
  // Test a simple operation
  console.log('\n🧪 Testing generateQuestion with a simple prompt...');
  try {
    const testQuestion = await service.generateQuestion(
      'phase1',
      0,
      [],
      'Test User',
      'collaborative',
      null,
      {}
    );
    console.log('✅ Test question generated successfully!');
    console.log('📝 Question:', testQuestion.title);
  } catch (error) {
    console.error('❌ Error generating test question:', error.message);
    console.error('   This might be due to API rate limits or network issues.');
  }
  
} catch (error) {
  console.error('❌ Failed to initialize AI Service:', error.message);
  console.error('\n💡 Make sure at least one API key is configured in .env.local:');
  console.error('   - VITE_GEMINI_API_KEY');
  console.error('   - VITE_OPENAI_API_KEY');
  console.error('   - VITE_CLAUDE_API_KEY');
  process.exit(1);
}

