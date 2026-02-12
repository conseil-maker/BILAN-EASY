import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CGVContentFR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Champ d'application</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les prestations de bilan de compétences 
        proposées par Bilan-Easy, que ce soit dans le cadre d'un financement CPF, OPCO, employeur ou personnel.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Prestations proposées</h2>
      <p className="text-gray-700 dark:text-gray-300">Bilan-Easy propose 4 parcours de bilan de compétences :</p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
        <li><strong>Test (2 heures)</strong> : Découverte du processus et première exploration</li>
        <li><strong>Essentiel (12 heures)</strong> : Bilan ciblé pour un projet précis</li>
        <li><strong>Approfondi (18 heures)</strong> : Exploration complète et approfondie</li>
        <li><strong>Stratégique (24 heures)</strong> : Accompagnement premium avec suivi renforcé</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Tarifs</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
        <li>Test : 200€ TTC</li>
        <li>Essentiel : 1 200€ TTC</li>
        <li>Approfondi : 1 800€ TTC</li>
        <li>Stratégique : 2 400€ TTC</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Modalités de paiement</h2>
      <p className="text-gray-700 dark:text-gray-300">Le bilan peut être financé par CPF, OPCO, employeur ou financement personnel.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Délai de rétractation</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Conformément à l'article L.221-18 du Code de la consommation, le bénéficiaire dispose d'un délai de 14 jours pour exercer son droit de rétractation.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Obligations</h2>
      <p className="text-gray-700 dark:text-gray-300">Bilan-Easy s'engage à respecter le cadre réglementaire et à fournir un accompagnement de qualité. Le bénéficiaire s'engage à participer activement.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Droit applicable</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Les présentes CGV sont régies par le droit français. En cas de litige, les tribunaux français seront compétents.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Contact</h2>
      <p className="text-gray-700 dark:text-gray-300">
        <a href="mailto:contact@bilan-easy.fr" className="text-indigo-600 hover:underline">contact@bilan-easy.fr</a>
      </p>
    </section>
  </div>
);

const CGVContentTR: React.FC = () => (
  <div className="prose dark:prose-invert max-w-none space-y-6">
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Uygulama alanı</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Bu Genel Satış Koşulları, CPF, OPCO, işveren veya kişisel finansman kapsamında Bilan-Easy tarafından sunulan tüm yetkinlik değerlendirmesi hizmetlerine uygulanır.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Sunulan hizmetler</h2>
      <p className="text-gray-700 dark:text-gray-300">Bilan-Easy 4 yetkinlik değerlendirmesi paketi sunar:</p>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
        <li><strong>Test (2 saat)</strong>: Sürecin keşfi ve ilk araştırma</li>
        <li><strong>Temel (12 saat)</strong>: Belirli bir proje için hedefli değerlendirme</li>
        <li><strong>Kapsamlı (18 saat)</strong>: Tam ve derinlemesine araştırma</li>
        <li><strong>Stratejik (24 saat)</strong>: Güçlendirilmiş takip ile premium eşlik</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Fiyatlar</h2>
      <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
        <li>Test: 200€ KDV dahil</li>
        <li>Temel: 1.200€ KDV dahil</li>
        <li>Kapsamlı: 1.800€ KDV dahil</li>
        <li>Stratejik: 2.400€ KDV dahil</li>
      </ul>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Ödeme koşulları</h2>
      <p className="text-gray-700 dark:text-gray-300">Değerlendirme CPF, OPCO, işveren veya kişisel finansman ile finanse edilebilir.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Cayma süresi</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Tüketici Kanunu'nun L.221-18 maddesi uyarınca, yararlanıcı cayma hakkını kullanmak için 14 günlük bir süreye sahiptir.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Yükümlülükler</h2>
      <p className="text-gray-700 dark:text-gray-300">Bilan-Easy düzenleyici çerçeveye uymayı ve kaliteli eşlik sağlamayı taahhüt eder. Yararlanıcı aktif olarak katılmayı taahhüt eder.</p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Uygulanacak hukuk</h2>
      <p className="text-gray-700 dark:text-gray-300">
        Bu Satış Koşulları Fransız hukukuna tabidir. Uyuşmazlık durumunda Fransız mahkemeleri yetkilidir.
      </p>
    </section>
    <section>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. İletişim</h2>
      <p className="text-gray-700 dark:text-gray-300">
        <a href="mailto:contact@bilan-easy.fr" className="text-indigo-600 hover:underline">contact@bilan-easy.fr</a>
      </p>
    </section>
  </div>
);

export const CGV: React.FC = () => {
  const { t, i18n } = useTranslation('legal');
  const isTR = i18n.language === 'tr';
  const dateLocale = isTR ? 'tr-TR' : 'fr-FR';

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <ShoppingCart className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('cgv.title')}
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          {t('cgv.lastUpdate')} {new Date().toLocaleDateString(dateLocale)}
        </p>

        {isTR ? <CGVContentTR /> : <CGVContentFR />}

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm text-indigo-900 dark:text-indigo-300">
            <strong>Qualiopi :</strong> {t('cgv.qualiopi')}
          </p>
        </div>
      </div>
    </div>
  );
};
