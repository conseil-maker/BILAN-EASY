// Simple test to check environment variables
// Run this in browser console or Node.js

console.log('🧪 Testing AI Provider Configuration...\n');

// Check environment variables (for Vite)
const checkEnv = () => {
  const checks = {
    gemini: {
      keys: ['VITE_GEMINI_API_KEY', 'GEMINI_API_KEY', 'process.env.GEMINI_API_KEY'],
      found: false,
      value: null
    },
    openai: {
      keys: ['VITE_OPENAI_API_KEY', 'process.env.OPENAI_API_KEY'],
      found: false,
      value: null
    },
    claude: {
      keys: ['VITE_CLAUDE_API_KEY', 'process.env.CLAUDE_API_KEY'],
      found: false,
      value: null
    }
  };

  // Try to access env vars (works in Vite)
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    console.log('📋 Checking import.meta.env...');
    checks.gemini.found = !!(import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY);
    checks.openai.found = !!import.meta.env.VITE_OPENAI_API_KEY;
    checks.claude.found = !!import.meta.env.VITE_CLAUDE_API_KEY;
  }

  // Try process.env (works in Node.js or Vite define)
  if (typeof process !== 'undefined' && process.env) {
    console.log('📋 Checking process.env...');
    checks.gemini.found = checks.gemini.found || !!(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY);
    checks.openai.found = checks.openai.found || !!process.env.OPENAI_API_KEY;
    checks.claude.found = checks.claude.found || !!process.env.CLAUDE_API_KEY;
  }

  return checks;
};

const results = checkEnv();

console.log('\n📊 Results:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`Gemini:  ${results.gemini.found ? '✅ Configured' : '❌ Not configured'}`);
console.log(`OpenAI:  ${results.openai.found ? '✅ Configured' : '❌ Not configured'}`);
console.log(`Claude:  ${results.claude.found ? '✅ Configured' : '❌ Not configured'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const totalConfigured = Object.values(results).filter(r => r.found).length;

if (totalConfigured === 0) {
  console.error('❌ No AI providers configured!');
  console.error('\n💡 Add at least one API key to .env.local:');
  console.error('   VITE_GEMINI_API_KEY=your_key_here');
  console.error('   VITE_OPENAI_API_KEY=your_key_here');
  console.error('   VITE_CLAUDE_API_KEY=your_key_here');
} else {
  console.log(`✅ ${totalConfigured} provider(s) configured`);
  console.log('✅ Ready to use multi-provider AI system!');
}

