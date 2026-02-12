import React from 'react';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const PrivacyContentFR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Bilan-Easy accorde une grande importance à la protection de vos données personnelles. La présente politique 
        vous informe sur la manière dont nous collectons, utilisons et protégeons vos données conformément au RGPD.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Responsable du traitement</h2>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Bilan-Easy</strong><br />
          Email : <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a>
        </p>
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Données collectées</h2>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Données d'identification</h3>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
        <li>Nom, prénom, email, téléphone</li>
      </ul>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Données professionnelles</h3>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
        <li>Parcours professionnel, formations, compétences</li>
      </ul>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.3 Données du bilan</h3>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
        <li>Réponses aux questionnaires, résultats, documents produits</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Durée de conservation</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 mt-2">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Type de données</th>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Durée</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300">
            <tr><td className="border px-4 py-2">Données du bilan</td><td className="border px-4 py-2">2 ans après la fin du bilan</td></tr>
            <tr><td className="border px-4 py-2">Documents officiels</td><td className="border px-4 py-2">10 ans (obligation Qualiopi)</td></tr>
            <tr><td className="border px-4 py-2">Données comptables</td><td className="border px-4 py-2">10 ans (obligation légale)</td></tr>
            <tr><td className="border px-4 py-2">Logs de connexion</td><td className="border px-4 py-2">1 an</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Vos droits</h2>
      <p className="text-gray-700 dark:text-gray-300">Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de limitation, de portabilité et d'opposition.</p>
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-4">
        <p className="text-indigo-900 dark:text-indigo-300 font-semibold mb-2">Comment exercer vos droits ?</p>
        <p className="text-indigo-800 dark:text-indigo-300 text-sm">
          Contactez-nous à <a href="mailto:dpo@bilan-easy.fr" className="underline">dpo@bilan-easy.fr</a>. Nous vous répondrons sous un mois.
        </p>
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Sécurité</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
        <li>Chiffrement des données en transit (HTTPS/TLS) et au repos</li>
        <li>Authentification sécurisée (Supabase Auth)</li>
        <li>Contrôle d'accès strict (Row Level Security)</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Contact</h2>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>DPO</strong> : <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a>
        </p>
      </div>
    </section>
  </div>
);

const PrivacyContentTR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Giriş</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Bilan-Easy, kişisel verilerinizin korunmasına büyük önem vermektedir. Bu politika, KVKK ve GDPR uyarınca 
        verilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu açıklar.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Veri sorumlusu</h2>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>Bilan-Easy</strong><br />
          E-posta: <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a>
        </p>
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Toplanan veriler</h2>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Kimlik verileri</h3>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
        <li>Ad, soyad, e-posta, telefon</li>
      </ul>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Mesleki veriler</h3>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
        <li>Mesleki geçmiş, eğitimler, yetkinlikler</li>
      </ul>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.3 Değerlendirme verileri</h3>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
        <li>Anket yanıtları, sonuçlar, üretilen belgeler</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Saklama süresi</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 dark:border-gray-600 mt-2">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Veri türü</th>
              <th className="border px-4 py-2 text-left text-gray-900 dark:text-white">Süre</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 dark:text-gray-300">
            <tr><td className="border px-4 py-2">Değerlendirme verileri</td><td className="border px-4 py-2">Değerlendirme bitiminden 2 yıl sonra</td></tr>
            <tr><td className="border px-4 py-2">Resmi belgeler</td><td className="border px-4 py-2">10 yıl (Qualiopi yükümlülüğü)</td></tr>
            <tr><td className="border px-4 py-2">Muhasebe verileri</td><td className="border px-4 py-2">10 yıl (yasal yükümlülük)</td></tr>
            <tr><td className="border px-4 py-2">Bağlantı günlükleri</td><td className="border px-4 py-2">1 yıl</td></tr>
          </tbody>
        </table>
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Haklarınız</h2>
      <p className="text-gray-700 dark:text-gray-300">KVKK ve GDPR uyarınca erişim, düzeltme, silme, kısıtlama, taşınabilirlik ve itiraz haklarına sahipsiniz.</p>
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-4">
        <p className="text-indigo-900 dark:text-indigo-300 font-semibold mb-2">Haklarınızı nasıl kullanabilirsiniz?</p>
        <p className="text-indigo-800 dark:text-indigo-300 text-sm">
          Bize <a href="mailto:dpo@bilan-easy.fr" className="underline">dpo@bilan-easy.fr</a> adresinden ulaşın. Bir ay içinde yanıt vereceğiz.
        </p>
      </div>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Güvenlik</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
        <li>Aktarım sırasında (HTTPS/TLS) ve depolamada veri şifreleme</li>
        <li>Güvenli kimlik doğrulama (Supabase Auth)</li>
        <li>Sıkı erişim kontrolü (Row Level Security)</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. İletişim</h2>
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">
          <strong>DPO</strong>: <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a>
        </p>
      </div>
    </section>
  </div>
);

export const Privacy: React.FC = () => {
  const { t, i18n } = useTranslation('legal');
  const isTR = i18n.language === 'tr';
  const dateLocale = isTR ? 'tr-TR' : 'fr-FR';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Shield className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('privacy.title')}
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('privacy.lastUpdate')} {new Date().toLocaleDateString(dateLocale)}
        </p>

        {isTR ? <PrivacyContentTR /> : <PrivacyContentFR />}

        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-300">
            <strong>🔒</strong> {t('privacy.confidentiality')}
          </p>
        </div>
      </div>
    </div>
  );
};
