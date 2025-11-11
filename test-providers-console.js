/**
 * Browser Console Test Script
 * 
 * Copy and paste this into your browser console (F12) at http://localhost:3000
 * to test if AI providers are correctly configured.
 */

(async function testAIProviders() {
  console.log('🧪 Testing AI Providers...\n');
  
  try {
    // Import the AI service
    const { getAIService } = await import('./services/aiService.js');
    
    const service = getAIService();
    
    console.log('✅ AI Service initialized successfully!\n');
    console.log('📊 Available providers:', service.getAvailableProviders());
    console.log('🔧 Current provider:', service.getCurrentProvider());
    
    // Check environment variables
    console.log('\n📋 Environment Variables Check:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('VITE_OPENAI_API_KEY:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('VITE_CLAUDE_API_KEY:', import.meta.env.VITE_CLAUDE_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Test a simple operation
    console.log('🧪 Testing generateQuestion...');
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
      console.log('🎯 Provider used:', service.getCurrentProvider());
      console.log('\n✅ All tests passed! Providers are working correctly.');
    } catch (error) {
      console.error('❌ Error generating test question:', error.message);
      console.error('   This might be due to:');
      console.error('   - API rate limits');
      console.error('   - Network issues');
      console.error('   - Invalid API keys');
      console.error('\n💡 Check the error details above.');
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize AI Service:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. At least one API key is configured in .env.local');
    console.error('   2. You\'ve restarted the dev server after adding keys');
    console.error('   3. Keys are prefixed with VITE_ for Vite to expose them');
  }
})();

