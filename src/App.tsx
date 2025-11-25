import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';

function App() {
  const [status, setStatus] = useState('Initialisation...');
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setStatus('Connexion à Supabase...');
        
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Erreur session: ${sessionError.message}`);
        }

        setStatus(`✅ Connexion Supabase réussie !
        
User: ${data.session?.user?.email || 'Non connecté'}
Session: ${data.session ? 'Active' : 'Aucune'}`);
        
        setUser(data.session?.user);
      } catch (err: any) {
        setError(err.message);
        setStatus('❌ Erreur de connexion Supabase');
      }
    };

    checkAuth();
  }, []);

  return (
    <div style={{ padding: '50px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Test Supabase Auth</h1>
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
