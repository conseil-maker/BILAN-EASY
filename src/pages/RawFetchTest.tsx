import { useEffect, useState } from 'react';

export default function RawFetchTest() {
  const [results, setResults] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setResults(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);
  };

  const runRawTests = async () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    addLog(`🔍 Starting RAW fetch tests (no Supabase client)`);
    addLog(`URL: ${supabaseUrl}`);
    addLog(`Key exists: ${!!supabaseKey}`);
    
    // TEST 1: Simple fetch vers REST API
    addLog('');
    addLog('TEST 1: REST API health check');
    const restStart = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const duration = Date.now() - restStart;
      
      addLog(`✅ TEST 1: REST API health check (${duration}ms)`);
      addLog(`Status: ${response.status}`);
      addLog(`Headers: ${JSON.stringify(Object.fromEntries(response.headers))}`);
    } catch (error: any) {
      const duration = Date.now() - restStart;
      addLog(`❌ TEST 1: FAILED after ${duration}ms`);
      addLog(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    runRawTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 Raw Fetch Test (No Supabase Client)</h1>
      <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
        {results.map((r, i) => (
          <div key={i}>{r}</div>
        ))}
      </div>
    </div>
  );
}
