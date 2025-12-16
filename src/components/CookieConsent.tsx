import React, { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';

interface CookiePreferences {
  necessary: boolean;
  performance: boolean;
  functional: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    performance: false,
    functional: false
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setShowBanner(false);
    
    // Activer/désactiver les scripts selon les préférences
    if (prefs.performance) {
      // Activer Google Analytics si accepté
      // window.gtag && window.gtag('consent', 'update', { analytics_storage: 'granted' });
    }
  };

  const acceptAll = () => {
    const allAccepted = { necessary: true, performance: true, functional: true };
    setPreferences(allAccepted);
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly = { necessary: true, performance: false, functional: false };
    setPreferences(necessaryOnly);
    savePreferences(necessaryOnly);
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Banner */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Cookie className="text-indigo-600 mr-3" size={28} />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Gestion des cookies
              </h2>
            </div>
            <button
              onClick={acceptNecessary}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Nous utilisons des cookies pour améliorer votre expérience sur Bilan-Easy. 
            Certains cookies sont nécessaires au fonctionnement de la plateforme, 
            d'autres nous aident à l'améliorer.
          </p>

          {showDetails ? (
            <div className="space-y-4 mb-6">
              {/* Cookies nécessaires */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Cookies nécessaires
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Indispensables au fonctionnement (authentification, préférences)
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Toujours actif</span>
                    <div className="w-12 h-6 bg-indigo-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies de performance */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Cookies de performance
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Analyse de l'utilisation pour améliorer la plateforme
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, performance: !p.performance }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.performance 
                        ? 'bg-indigo-600 justify-end' 
                        : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>

              {/* Cookies fonctionnels */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Cookies fonctionnels
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Amélioration de l'expérience utilisateur
                    </p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, functional: !p.functional }))}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.functional 
                        ? 'bg-indigo-600 justify-end' 
                        : 'bg-gray-300 dark:bg-gray-600 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>

              <a 
                href="/legal/cookies" 
                className="text-sm text-indigo-600 hover:underline inline-block mt-2"
              >
                En savoir plus sur notre politique de cookies
              </a>
            </div>
          ) : (
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center text-indigo-600 hover:text-indigo-700 mb-6"
            >
              <Settings size={18} className="mr-2" />
              Personnaliser mes choix
            </button>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={acceptNecessary}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Refuser les optionnels
            </button>
            
            {showDetails ? (
              <button
                onClick={saveCustom}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Check size={18} className="mr-2" />
                Enregistrer mes choix
              </button>
            ) : (
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
              >
                <Check size={18} className="mr-2" />
                Tout accepter
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Conformément au RGPD et à la directive ePrivacy. 
            <a href="/legal/privacy" className="text-indigo-600 hover:underline ml-1">
              Politique de confidentialité
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Hook pour vérifier le consentement
export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent');
    if (stored) {
      try {
        setConsent(JSON.parse(stored));
      } catch {
        setConsent(null);
      }
    }
  }, []);

  return consent;
};
