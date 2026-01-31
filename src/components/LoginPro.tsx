import React, { useState } from 'react';
import { supabase, clearInvalidTokens } from '../lib/supabaseClient';
import organizationConfig from '../config/organization';

const ORGANIZATION = organizationConfig;

interface LoginProProps {
  onToggle: () => void;
}

export default function LoginPro({ onToggle }: LoginProProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Nettoyer les anciens tokens avant la connexion pour éviter les conflits
      console.log('[LoginPro] Nettoyage des tokens invalides...');
      clearInvalidTokens();
      
      // Supprimer aussi tous les tokens Supabase potentiellement corrompus
      Object.keys(localStorage).forEach(key => {
        if (key.includes('supabase') && key.includes('auth')) {
          console.log('[LoginPro] Suppression du token:', key);
          localStorage.removeItem(key);
        }
      });
      
      // Se déconnecter d'abord pour nettoyer l'état
      await supabase.auth.signOut();
      
      // Attendre un court instant pour que le signOut soit traité
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Ajouter un timeout de 10 secondes pour éviter l'attente infinie
      const TIMEOUT_MS = 10000;
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      );
      
      const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

      if (error) throw error;
      
      // Connexion réussie - l'événement SIGNED_IN sera automatiquement capté par AuthWrapper
      // via onAuthStateChange, pas besoin de reload
      if (data.session) {
        console.log('[LoginPro] Connexion réussie, session établie');
        // Ne rien faire de plus - AuthWrapper va détecter le changement via onAuthStateChange
      }
    } catch (error: any) {
      // Messages d'erreur plus informatifs
      if (error.message === 'timeout') {
        setError('La connexion a pris trop de temps. Vérifiez votre connexion internet et réessayez.');
      } else if (error.message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Veuillez confirmer votre email avant de vous connecter.');
      } else {
        setError(error.message || 'Erreur lors de la connexion');
      }
    } finally {
      // Toujours réinitialiser le loading, même en cas de succès
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre adresse email');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setResetEmailSent(true);
    } catch (error: any) {
      setError(error.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Panneau gauche - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">BC</span>
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">Bilan de Compétences</h1>
              <p className="text-indigo-200 text-sm">Propulsé par l'IA</p>
            </div>
          </div>
          
          <div className="mt-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Découvrez votre potentiel professionnel
            </h2>
            <p className="text-indigo-200 text-lg mb-8">
              Un accompagnement personnalisé pour définir votre projet professionnel 
              et construire votre avenir.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white">Certification Qualiopi</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="text-white">Confidentialité garantie</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-white">Intelligence Artificielle avancée</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-white">Accompagnement personnalisé</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-6">
          <p className="text-indigo-200 text-sm">
            {ORGANIZATION.name}
          </p>
          <p className="text-indigo-300 text-xs mt-1">
            {ORGANIZATION.address.street}, {ORGANIZATION.address.postalCode} {ORGANIZATION.address.city}
          </p>
          <div className="flex items-center gap-4 mt-3">
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs font-medium">
              Qualiopi {ORGANIZATION.qualiopi.number}
            </span>
            <span className="text-indigo-300 text-xs">
              NDA: {ORGANIZATION.nda}
            </span>
          </div>
        </div>
      </div>

      {/* Panneau droit - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">BC</span>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">Bilan de Compétences</h1>
                <p className="text-indigo-600 text-sm">Propulsé par l'IA</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {showForgotPassword ? 'Mot de passe oublié' : 'Connexion'}
              </h2>
              <p className="text-gray-600 mt-2">
                {showForgotPassword 
                  ? 'Entrez votre email pour réinitialiser votre mot de passe'
                  : 'Accédez à votre espace personnel'}
              </p>
            </div>

            {resetEmailSent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email envoyé !</h3>
                <p className="text-gray-600 mb-6">
                  Vérifiez votre boîte mail pour réinitialiser votre mot de passe.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetEmailSent(false);
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Retour à la connexion
                </button>
              </div>
            ) : (
              <form onSubmit={showForgotPassword ? handleForgotPassword : handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    placeholder="votre@email.com"
                  />
                </div>

                {!showForgotPassword && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Mot de passe
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="••••••••"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Connexion en cours...</span>
                    </div>
                  ) : showForgotPassword ? (
                    'Envoyer le lien de réinitialisation'
                  ) : (
                    'Se connecter'
                  )}
                </button>

                {showForgotPassword && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-gray-600 hover:text-gray-800 py-2 font-medium"
                  >
                    Retour à la connexion
                  </button>
                )}
              </form>
            )}

            {!showForgotPassword && !resetEmailSent && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <button
                    onClick={onToggle}
                    className="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Créer un compte
                  </button>
                </p>
              </div>
            )}
          </div>

          {/* Informations légales */}
          <div className="mt-8 text-center text-xs text-gray-500">
            <p>En vous connectant, vous acceptez nos</p>
            <p className="mt-1">
              <a href="#/legal/cgu" className="text-indigo-600 hover:underline">CGU</a>
              {' • '}
              <a href="#/legal/privacy" className="text-indigo-600 hover:underline">Politique de confidentialité</a>
            </p>
          </div>

          {/* Contact */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Besoin d'aide ? Contactez-nous</p>
            <p className="mt-1">
              <a href={`mailto:${ORGANIZATION.email}`} className="text-indigo-600 hover:underline">
                {ORGANIZATION.email}
              </a>
              {' • '}
              <a href={`tel:${ORGANIZATION.phone}`} className="text-indigo-600 hover:underline">
                {ORGANIZATION.phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
