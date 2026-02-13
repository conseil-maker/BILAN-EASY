import React from 'react';
import { FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CGUContentFR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Objet</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme Bilan-Easy, 
        destinée à la réalisation de bilans de compétences conformes aux articles L.6313-1 et suivants du Code du travail.
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Définitions</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong>Plateforme</strong> : Le site web Bilan-Easy accessible à l'adresse bilan-easy.vercel.app</li>
        <li><strong>Utilisateur</strong> : Toute personne accédant à la plateforme</li>
        <li><strong>Bénéficiaire</strong> : Personne réalisant un bilan de compétences</li>
        <li><strong>Consultant</strong> : Professionnel certifié accompagnant le bénéficiaire</li>
        <li><strong>Prestataire</strong> : L'organisme Bilan-Easy fournissant le service</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Accès à la plateforme</h2>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Inscription</h3>
      <p className="text-gray-700 dark:text-gray-300">
        L'accès aux services de la plateforme nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir 
        des informations exactes et à les maintenir à jour.
      </p>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Identifiants</h3>
      <p className="text-gray-700 dark:text-gray-300">
        L'utilisateur est responsable de la confidentialité de ses identifiants de connexion. Toute utilisation de son compte 
        est présumée être effectuée par lui-même.
      </p>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.3 Disponibilité</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Le prestataire s'efforce d'assurer une disponibilité maximale de la plateforme, mais ne peut garantir un accès 
        ininterrompu. Des maintenances peuvent être effectuées avec ou sans préavis.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Services proposés</h2>
      <p className="text-gray-700 dark:text-gray-300">
        La plateforme permet la réalisation de bilans de compétences comprenant trois phases obligatoires :
      </p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
        <li>Phase préliminaire : analyse du besoin et définition des objectifs</li>
        <li>Phase d'investigation : élaboration du projet professionnel</li>
        <li>Phase de conclusion : restitution et plan d'action</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Obligations de l'utilisateur</h2>
      <p className="text-gray-700 dark:text-gray-300">L'utilisateur s'engage à :</p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
        <li>Utiliser la plateforme conformément à sa destination</li>
        <li>Ne pas porter atteinte aux droits de propriété intellectuelle</li>
        <li>Ne pas tenter d'accéder aux données d'autres utilisateurs</li>
        <li>Respecter les lois et règlements en vigueur</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Propriété intellectuelle</h2>
      <p className="text-gray-700 dark:text-gray-300">
        L'ensemble des éléments de la plateforme sont protégés par le droit d'auteur. Les résultats du bilan de compétences sont la propriété exclusive du bénéficiaire.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Données personnelles</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Le traitement des données personnelles est effectué conformément au RGPD et à la loi Informatique et Libertés. 
        Consultez notre <a href="/legal/privacy" className="text-indigo-600 hover:underline">Politique de Confidentialité</a>.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Confidentialité</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Conformément à l'article L.6313-10-1 du Code du travail, les résultats du bilan de compétences sont confidentiels.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Droit applicable</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Les présentes CGU sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Contact</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Pour toute question : <a href="mailto:contact@bilan-easy.fr" className="text-indigo-600 hover:underline">contact@bilan-easy.fr</a>
      </p>
    </section>
  </div>
);

const CGUContentTR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Amaç</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Bu Kullanım Koşulları, İş Kanunu'nun L.6313-1 ve devamı maddeleri uyarınca yetkinlik değerlendirmesi yapılmasına yönelik 
        Bilan-Easy platformuna erişimi ve kullanımını düzenler.
      </p>
      <p className="text-gray-700 dark:text-gray-300">
        Platformun kullanılması, bu Kullanım Koşullarının tam ve eksiksiz kabulünü gerektirir.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Tanımlar</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
        <li><strong>Platform</strong>: bilan-easy.vercel.app adresinden erişilebilen Bilan-Easy web sitesi</li>
        <li><strong>Kullanıcı</strong>: Platforma erişen herhangi bir kişi</li>
        <li><strong>Yararlanıcı</strong>: Yetkinlik değerlendirmesi yapan kişi</li>
        <li><strong>Danışman</strong>: Yararlanıcıya eşlik eden sertifikalı profesyonel</li>
        <li><strong>Hizmet sağlayıcı</strong>: Hizmeti sunan Bilan-Easy kuruluşu</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Platforma erişim</h2>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Kayıt</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Platform hizmetlerine erişim, bir kullanıcı hesabı oluşturmayı gerektirir. Kullanıcı doğru bilgi vermeyi ve bunları güncel tutmayı taahhüt eder.
      </p>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Kimlik bilgileri</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Kullanıcı, oturum açma kimlik bilgilerinin gizliliğinden sorumludur.
      </p>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.3 Erişilebilirlik</h3>
      <p className="text-gray-700 dark:text-gray-300">
        Hizmet sağlayıcı, platformun maksimum erişilebilirliğini sağlamaya çalışır ancak kesintisiz erişimi garanti edemez.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Sunulan hizmetler</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Platform, üç zorunlu aşamadan oluşan yetkinlik değerlendirmelerinin gerçekleştirilmesini sağlar:
      </p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
        <li>Ön aşama: ihtiyaç analizi ve hedeflerin belirlenmesi</li>
        <li>Araştırma aşaması: mesleki projenin geliştirilmesi</li>
        <li>Sonuç aşaması: sunum ve eylem planı</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Kullanıcı yükümlülükleri</h2>
      <p className="text-gray-700 dark:text-gray-300">Kullanıcı şunları taahhüt eder:</p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
        <li>Platformu amacına uygun kullanmak</li>
        <li>Fikri mülkiyet haklarını ihlal etmemek</li>
        <li>Diğer kullanıcıların verilerine erişmeye çalışmamak</li>
        <li>Yürürlükteki yasa ve yönetmeliklere uymak</li>
      </ul>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Fikri mülkiyet</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Platformun tüm unsurları telif hakkıyla korunmaktadır. Yetkinlik değerlendirmesinin sonuçları yalnızca yararlanıcının mülkiyetindedir.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Kişisel veriler</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Kişisel verilerin işlenmesi KVKK ve GDPR uyarınca gerçekleştirilir. 
        <a href="/legal/privacy" className="text-indigo-600 hover:underline ml-1">Gizlilik Politikamızı</a> inceleyin.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Gizlilik</h2>
      <p className="text-gray-700 dark:text-gray-300">
        İş Kanunu'nun L.6313-10-1 maddesi uyarınca, yetkinlik değerlendirmesinin sonuçları gizlidir.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Uygulanacak hukuk</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Bu Kullanım Koşulları Fransız hukukuna tabidir. Uyuşmazlık durumunda Fransız mahkemeleri yetkilidir.
      </p>
    </section>

    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. İletişim</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Sorularınız için: <a href="mailto:contact@bilan-easy.fr" className="text-indigo-600 hover:underline">contact@bilan-easy.fr</a>
      </p>
    </section>
  </div>
);

export const CGU: React.FC = () => {
  const { t, i18n } = useTranslation('legal');
  const isTR = i18n.language === 'tr';
  const dateLocale = isTR ? 'tr-TR' : 'fr-FR';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <FileText className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('cgu.title')}
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('cgu.lastUpdate')} {new Date().toLocaleDateString(dateLocale)}
        </p>

        {isTR ? <CGUContentTR /> : <CGUContentFR />}

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm text-indigo-900 dark:text-indigo-300">
            {t('cgu.acceptance')}
          </p>
        </div>
      </div>
    </div>
  );
};
