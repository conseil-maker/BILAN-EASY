import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface LoginProps {
  onToggle: () => void;
}

export default function Login({ onToggle }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Créer une promesse de timeout de 15 secondes
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('TIMEOUT'));
        }, 15000);
      });

      // Créer la promesse de connexion
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Course entre le login et le timeout
      const { error: authError } = await Promise.race([
        loginPromise,
        timeoutPromise
      ]);

      if (authError) throw authError;
      
      // Succès - l'utilisateur sera redirigé par AuthWrapper
      console.log('Connexion réussie');
      
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      if (error.message === 'TIMEOUT') {
        setError(
          'La connexion prend trop de temps. Vérifiez votre connexion internet et réessayez. ' +
          'Si le problème persiste, contactez le support.'
        );
      } else if (error.message?.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect. Veuillez réessayer.');
      } else if (error.message?.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.');
      } else {
        setError(
          error.message || 
          'Erreur lors de la connexion. Veuillez réessayer dans quelques instants.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bilan de Compétences IA
          </h1>
          <p className="text-gray-600">
            Connectez-vous pour accéder à votre espace
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Pas encore de compte ?{' '}
              <button
                onClick={onToggle}
                disabled={loading}
                className="text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Nouveau sur la plateforme ?</p>
          <p className="mt-1 text-primary-600 font-medium">Créez votre compte gratuitement !</p>
        </div>
      </div>
    </div>
  );
}
