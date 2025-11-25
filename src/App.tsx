import React, { useState, useEffect } from 'react';

function App() {
  const [status, setStatus] = useState('Initialisation...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEnv = () => {
      try {
        setStatus('Vérification des variables d\'environnement...');
        
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!supabaseUrl) {
          throw new Error('VITE_SUPABASE_URL manquante');
        }
        if (!supabaseKey) {
          throw new Error('VITE_SUPABASE_ANON_KEY manquante');
        }
        if (!geminiKey) {
          throw new Error('VITE_GEMINI_API_KEY manquante');
        }

        setStatus(`✅ Toutes les variables sont configurées !
        
Supabase URL: ${supabaseUrl.substring(0, 30)}...
Supabase Key: ${supabaseKey.substring(0, 20)}...
Gemini Key: ${geminiKey.substring(0, 20)}...`);
      } catch (err: any) {
        setError(err.message);
        setStatus('❌ Erreur de configuration');
      }
    };

    checkEnv();
  }, []);

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Diagnostic Bilan Easy</h1>
      <div style={{ 
        padding: '20px', 
        background: error ? '#fee' : '#efe', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
          {status}
        </pre>
        {error && (
          <div style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
            Erreur: {error}
          </div>
        )}
      </div>
      <p style={{ marginTop: '20px', color: '#666' }}>
        Timestamp: {new Date().toISOString()}
      </p>
    </div>
  );
}

export default App;
