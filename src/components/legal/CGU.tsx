import React from 'react';
import { FileText } from 'lucide-react';

export const CGU: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <FileText className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Conditions Générales d'Utilisation
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

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
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">4.1 Bilan de compétences</h3>
            <p className="text-gray-700 dark:text-gray-300">
              La plateforme permet la réalisation de bilans de compétences comprenant trois phases obligatoires :
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Phase préliminaire : analyse du besoin et définition des objectifs</li>
              <li>Phase d'investigation : élaboration du projet professionnel</li>
              <li>Phase de conclusion : restitution et plan d'action</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">4.2 Outils et fonctionnalités</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Questionnaires adaptatifs générés par intelligence artificielle</li>
              <li>Suivi personnalisé avec un consultant certifié</li>
              <li>Accès à une base de données métiers et formations</li>
              <li>Génération de documents officiels (convention, attestation, synthèse)</li>
              <li>Historique et suivi de progression</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Obligations de l'utilisateur</h2>
            <p className="text-gray-700 dark:text-gray-300">L'utilisateur s'engage à :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
              <li>Utiliser la plateforme conformément à sa destination</li>
              <li>Ne pas porter atteinte aux droits de propriété intellectuelle</li>
              <li>Ne pas tenter d'accéder aux données d'autres utilisateurs</li>
              <li>Ne pas perturber le fonctionnement de la plateforme</li>
              <li>Respecter les lois et règlements en vigueur</li>
              <li>Fournir des informations exactes et sincères</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Propriété intellectuelle</h2>
            <p className="text-gray-700 dark:text-gray-300">
              L'ensemble des éléments de la plateforme (textes, graphismes, logiciels, bases de données, etc.) sont protégés par 
              le droit d'auteur et le droit des bases de données. Toute reproduction, représentation, modification ou exploitation 
              non autorisée est interdite.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Les résultats du bilan de compétences sont la propriété exclusive du bénéficiaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Données personnelles</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Le traitement des données personnelles est effectué conformément au Règlement Général sur la Protection des Données (RGPD) 
              et à la loi Informatique et Libertés. Pour plus d'informations, consultez notre 
              <a href="/legal/privacy" className="text-indigo-600 hover:underline ml-1">Politique de Confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Confidentialité</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Conformément à l'article L.6313-10-1 du Code du travail, les résultats du bilan de compétences sont confidentiels. 
              Ils ne peuvent être communiqués à un tiers (employeur, financeur, etc.) qu'avec le consentement écrit du bénéficiaire.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Responsabilité</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">9.1 Responsabilité du prestataire</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Le prestataire s'engage à fournir un service conforme aux standards professionnels et au référentiel Qualiopi. 
              Sa responsabilité ne peut être engagée qu'en cas de faute prouvée.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">9.2 Limitation de responsabilité</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Le prestataire ne peut être tenu responsable :
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Des interruptions de service indépendantes de sa volonté</li>
              <li>De l'utilisation frauduleuse des identifiants de l'utilisateur</li>
              <li>Des décisions prises par le bénéficiaire suite au bilan</li>
              <li>Des contenus générés par l'intelligence artificielle (questions adaptatives)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Résiliation</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Le bénéficiaire peut interrompre son bilan à tout moment conformément à l'article R.6313-8 du Code du travail.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Le prestataire se réserve le droit de suspendre ou résilier l'accès d'un utilisateur en cas de manquement aux présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Modification des CGU</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Le prestataire se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés 
              des modifications par email ou notification sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Droit applicable et juridiction</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Les présentes CGU sont régies par le droit français. En cas de litige, et à défaut de solution amiable, 
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Pour toute question relative aux présentes CGU, vous pouvez nous contacter via la plateforme ou à l'adresse : 
              <a href="mailto:contact@bilan-easy.fr" className="text-indigo-600 hover:underline ml-1">contact@bilan-easy.fr</a>
            </p>
          </section>
        </div>

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm text-indigo-900 dark:text-indigo-300">
            En utilisant la plateforme Bilan-Easy, vous reconnaissez avoir lu, compris et accepté les présentes 
            Conditions Générales d'Utilisation.
          </p>
        </div>
      </div>
    </div>
  );
};
