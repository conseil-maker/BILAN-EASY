import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SupabaseTest() {
  const [results, setResults] = useState({
    healthCheck: '⏳ Testing...',
    anonymousSignin: '⏳ Testing...',
    signInTest: '⏳ Testing...',
    logs: [] as string[]
  });

  const addLog = (msg: string) => {
    console.log(msg);
    setResults(prev => ({ ...prev, logs: [...prev.logs, `${new Date().toISOString()} - ${msg}`] }));
  };

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // TEST 1: Health check basique
    addLog('🔍 TEST 1: Health check Supabase...');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      addLog(`✅ Supabase Auth accessible ! Session: ${data.session ? 'Existe' : 'Aucune'}`);
      setResults(prev => ({ ...prev, healthCheck: '✅ OK' }));
    } catch (err: any) {
      addLog(`❌ Erreur health check: ${err.message}`);
      setResults(prev => ({ ...prev, healthCheck: `❌ ${err.message}` }));
    }

    // TEST 2: Connexion anonyme (rapide)
    addLog('🔍 TEST 2: Connexion anonyme...');
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      addLog(`✅ Connexion anonyme réussie ! User ID: ${data.user?.id}`);
      setResults(prev => ({ ...prev, anonymousSignin: '✅ OK' }));
      
      // Déconnexion immédiate
      await supabase.auth.signOut();
      addLog('✅ Déconnexion anonyme réussie');
    } catch (err: any) {
      addLog(`❌ Erreur connexion anonyme: ${err.message}`);
      setResults(prev => ({ ...prev, anonymousSignin: `❌ ${err.message}` }));
    }

    // TEST 3: Connexion avec email/password (avec timeout)
    addLog('🔍 TEST 3: Connexion email/password avec timeout 30s...');
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout 30s dépassé')), 30000)
      );

      const signInPromise = supabase.auth.signInWithPassword({
        email: 'marie.lambert.test2026@example.com',
        password: 'BilanTest2026!'
      });

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;
      
      if (error) throw error;
      addLog(`✅ Connexion email réussie ! User: ${data.user?.email}`);
      setResults(prev => ({ ...prev, signInTest: '✅ OK' }));
    } catch (err: any) {
      addLog(`❌ Erreur connexion email: ${err.message}`);
      setResults(prev => ({ ...prev, signInTest: `❌ ${err.message}` }));
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#00ff00', minHeight: '100vh' }}>
      <h1>🔍 Supabase Connection Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>📊 Résultats</h2>
        <div>Health Check: {results.healthCheck}</div>
        <div>Anonymous Sign-in: {results.anonymousSignin}</div>
        <div>Email Sign-in: {results.signInTest}</div>
      </div>

      <div>
        <h2>📝 Logs en temps réel</h2>
        <pre style={{ backgroundColor: '#000', padding: '10px', maxHeight: '400px', overflow: 'auto' }}>
          {results.logs.map((log, i) => (
            <div key={i}>{log}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}
