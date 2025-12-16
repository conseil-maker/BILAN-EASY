import React from 'react';
import { Cookie } from 'lucide-react';

export const CookiesPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Cookie className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Politique de Cookies
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Qu'est-ce qu'un cookie ?</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, smartphone) 
              lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite, 
              comme vos préférences de langue ou vos identifiants de connexion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Types de cookies utilisés</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2.1 Cookies strictement nécessaires</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Ces cookies sont indispensables au fonctionnement de la plateforme. Ils ne peuvent pas être désactivés.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Nom</th>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Finalité</th>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="border px-4 py-2">sb-*-auth-token</td>
                    <td className="border px-4 py-2">Authentification Supabase</td>
                    <td className="border px-4 py-2">Session</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">theme</td>
                    <td className="border px-4 py-2">Préférence mode sombre/clair</td>
                    <td className="border px-4 py-2">1 an</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">cookie_consent</td>
                    <td className="border px-4 py-2">Mémorisation du choix cookies</td>
                    <td className="border px-4 py-2">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-6">2.2 Cookies de performance</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Ces cookies nous permettent d'analyser l'utilisation de la plateforme pour l'améliorer.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Nom</th>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Finalité</th>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="border px-4 py-2">_ga</td>
                    <td className="border px-4 py-2">Google Analytics - Identification</td>
                    <td className="border px-4 py-2">2 ans</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">_gid</td>
                    <td className="border px-4 py-2">Google Analytics - Session</td>
                    <td className="border px-4 py-2">24h</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-6">2.3 Cookies fonctionnels</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Ces cookies permettent d'améliorer votre expérience utilisateur.
            </p>
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full border border-gray-300 dark:border-gray-600">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Nom</th>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Finalité</th>
                    <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="border px-4 py-2">assessment_progress</td>
                    <td className="border px-4 py-2">Sauvegarde progression bilan</td>
                    <td className="border px-4 py-2">30 jours</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2">user_preferences</td>
                    <td className="border px-4 py-2">Préférences utilisateur</td>
                    <td className="border px-4 py-2">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Gestion des cookies</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Via notre bandeau</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Lors de votre première visite, un bandeau vous permet de choisir les cookies que vous acceptez. 
              Vous pouvez modifier vos choix à tout moment en cliquant sur "Gérer les cookies" en bas de page.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Via votre navigateur</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez également configurer votre navigateur pour accepter ou refuser les cookies :
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/fr/kb/activer-desactiver-cookies" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Safari</a></li>
              <li><a href="https://support.microsoft.com/fr-fr/microsoft-edge/supprimer-les-cookies-dans-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Microsoft Edge</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Conséquences du refus</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Le refus des cookies strictement nécessaires peut empêcher l'accès à certaines fonctionnalités 
              de la plateforme (connexion, sauvegarde de progression). Le refus des autres cookies n'affecte 
              pas le fonctionnement de base de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Contact</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Pour toute question concernant notre utilisation des cookies, contactez-nous à 
              <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline ml-1">dpo@bilan-easy.fr</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
