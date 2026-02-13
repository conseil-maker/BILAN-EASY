import React from 'react';
import { Cookie } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CookiesContentFR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Qu'est-ce qu'un cookie ?</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site web. 
        Il permet au site de mémoriser des informations sur votre visite.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Types de cookies utilisés</h2>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2.1 Cookies strictement nécessaires</h3>
      <p className="text-gray-700 dark:text-gray-300">Ces cookies sont indispensables au fonctionnement de la plateforme.</p>
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
            <tr><td className="border px-4 py-2">sb-*-auth-token</td><td className="border px-4 py-2">Authentification Supabase</td><td className="border px-4 py-2">Session</td></tr>
            <tr><td className="border px-4 py-2">theme</td><td className="border px-4 py-2">Préférence mode sombre/clair</td><td className="border px-4 py-2">1 an</td></tr>
            <tr><td className="border px-4 py-2">cookie_consent</td><td className="border px-4 py-2">Mémorisation du choix cookies</td><td className="border px-4 py-2">1 an</td></tr>
          </tbody>
        </table>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-6">2.2 Cookies de performance</h3>
      <p className="text-gray-700 dark:text-gray-300">Ces cookies nous permettent d'analyser l'utilisation de la plateforme.</p>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-6">2.3 Cookies fonctionnels</h3>
      <p className="text-gray-700 dark:text-gray-300">Ces cookies permettent d'améliorer votre expérience utilisateur.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Gestion des cookies</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Vous pouvez gérer vos cookies via notre bandeau ou les paramètres de votre navigateur.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Contact</h2>
      <p className="text-gray-700 dark:text-gray-300">
        <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a>
      </p>
    </section>
  </div>
);

const CookiesContentTR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Çerez nedir?</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Çerez, bir web sitesini ziyaret ettiğinizde cihazınıza yerleştirilen küçük bir metin dosyasıdır. 
        Sitenin ziyaretinizle ilgili bilgileri hatırlamasını sağlar.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Kullanılan çerez türleri</h2>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2.1 Zorunlu çerezler</h3>
      <p className="text-gray-700 dark:text-gray-300">Bu çerezler platformun çalışması için vazgeçilmezdir.</p>
      <div className="overflow-x-auto mt-2">
        <table className="min-w-full border border-gray-300 dark:border-gray-600">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Ad</th>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Amaç</th>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Süre</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300">
            <tr><td className="border px-4 py-2">sb-*-auth-token</td><td className="border px-4 py-2">Supabase kimlik doğrulama</td><td className="border px-4 py-2">Oturum</td></tr>
            <tr><td className="border px-4 py-2">theme</td><td className="border px-4 py-2">Koyu/açık mod tercihi</td><td className="border px-4 py-2">1 yıl</td></tr>
            <tr><td className="border px-4 py-2">cookie_consent</td><td className="border px-4 py-2">Çerez seçiminin hatırlanması</td><td className="border px-4 py-2">1 yıl</td></tr>
          </tbody>
        </table>
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-6">2.2 Performans çerezleri</h3>
      <p className="text-gray-700 dark:text-gray-300">Bu çerezler platform kullanımını analiz etmemizi sağlar.</p>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-6">2.3 İşlevsel çerezler</h3>
      <p className="text-gray-700 dark:text-gray-300">Bu çerezler kullanıcı deneyiminizi iyileştirmeyi sağlar.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Çerez yönetimi</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Çerezlerinizi bannerimiz veya tarayıcı ayarlarınız aracılığıyla yönetebilirsiniz.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. İletişim</h2>
      <p className="text-gray-700 dark:text-gray-300">
        <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a>
      </p>
    </section>
  </div>
);

export const CookiesPolicy: React.FC = () => {
  const { t, i18n } = useTranslation('legal');
  const isTR = i18n.language === 'tr';
  const dateLocale = isTR ? 'tr-TR' : 'fr-FR';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Cookie className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('cookiesPolicy.title')}
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('cookiesPolicy.lastUpdate')} {new Date().toLocaleDateString(dateLocale)}
        </p>

        {isTR ? <CookiesContentTR /> : <CookiesContentFR />}
      </div>
    </div>
  );
};
