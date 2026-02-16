import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabaseClient';
import LanguageSelector from './LanguageSelector';
import i18n from '../i18n';

interface SignupProps {
  onToggle: () => void;
}

export default function Signup({ onToggle }: SignupProps) {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Créer une promise avec timeout de 30 secondes
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(t('errors.signupTimeout'))), 30000)
      );

      const { data, error: signUpError } = await Promise.race([
        signupPromise,
        timeoutPromise
      ]) as any;

      if (signUpError) throw signUpError;

      // Le profil est créé automatiquement par un trigger Postgres
      // après l'inscription dans auth.users
      
      // Sauvegarder la langue préférée dans le profil
      const currentLang = i18n.language?.substring(0, 2) || 'fr';
      if (data?.user?.id) {
        // Attendre un court instant pour que le trigger crée le profil
        setTimeout(async () => {
          try {
            await supabase
              .from('profiles')
              .update({ preferred_language: currentLang })
              .eq('id', data.user.id);
            console.log('[Signup] Langue préférée sauvegardée:', currentLang);
          } catch (err) {
            console.warn('[Signup] Impossible de sauvegarder la langue:', err);
          }
        }, 1500);
      }
      
      // Si la confirmation d'email est activée, data.session sera null
      // Sinon, l'utilisateur est automatiquement connecté
      console.log('Signup response:', { session: data?.session, user: data?.user });
      
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || t('errors.genericSignup'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t('signup.successTitle')}
            </h2>
            <p className="text-gray-600 mb-6">
              {t('signup.successMessage')}
            </p>
            <button
              onClick={onToggle}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              {t('signup.login')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Sélecteur de langue */}
        <div className="flex justify-end">
          <LanguageSelector variant="inline" />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('signup.title')}
          </h1>
          <p className="text-gray-600">
            {t('signup.subtitle')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.fullName')}
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder={t('signup.fullNamePlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.email')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder={t('signup.emailPlaceholder')}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('signup.password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder={t('signup.passwordPlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('signup.passwordHint')}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('signup.loading') : t('signup.submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('signup.hasAccount')}{' '}
              <button
                onClick={onToggle}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {t('signup.login')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
