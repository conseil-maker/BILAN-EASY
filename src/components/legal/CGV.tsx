import React from 'react';
import { ShoppingCart } from 'lucide-react';

export const CGV: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <ShoppingCart className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Conditions Générales de Vente
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Champ d'application</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les prestations de bilan de compétences 
              proposées par Bilan-Easy, que ce soit dans le cadre d'un financement CPF, OPCO, employeur ou personnel.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Toute commande implique l'acceptation sans réserve des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Prestations proposées</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2.1 Parcours disponibles</h3>
            <p className="text-gray-700 dark:text-gray-300">Bilan-Easy propose 4 parcours de bilan de compétences :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
              <li><strong>Test (2 heures)</strong> : Découverte du processus et première exploration</li>
              <li><strong>Essentiel (12 heures)</strong> : Bilan ciblé pour un projet précis</li>
              <li><strong>Approfondi (18 heures)</strong> : Exploration complète et approfondie</li>
              <li><strong>Stratégique (24 heures)</strong> : Accompagnement premium avec suivi renforcé</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">2.2 Contenu de la prestation</h3>
            <p className="text-gray-700 dark:text-gray-300">Chaque parcours comprend :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Les trois phases réglementaires (préliminaire, investigation, conclusion)</li>
              <li>Un accompagnement par un consultant certifié</li>
              <li>L'accès à la plateforme numérique sécurisée</li>
              <li>Des outils d'évaluation et d'analyse</li>
              <li>Un document de synthèse personnalisé</li>
              <li>Un plan d'action détaillé</li>
              <li>Une attestation de présence</li>
              <li>L'accès à l'historique complet pendant 2 ans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Tarifs</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Prix</h3>
            <p className="text-gray-700 dark:text-gray-300">Les tarifs sont indiqués en euros TTC et comprennent :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Test : 200€ TTC</li>
              <li>Essentiel : 1 200€ TTC</li>
              <li>Approfondi : 1 800€ TTC</li>
              <li>Stratégique : 2 400€ TTC</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Révision des prix</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Les prix sont garantis pour la durée du bilan une fois la convention signée. Bilan-Easy se réserve le droit 
              de modifier ses tarifs à tout moment pour les nouvelles commandes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Commande et convention</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">4.1 Processus de commande</h3>
            <p className="text-gray-700 dark:text-gray-300">La commande d'un bilan de compétences s'effectue en plusieurs étapes :</p>
            <ol className="list-decimal pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Sélection du parcours souhaité</li>
              <li>Création d'un compte utilisateur</li>
              <li>Signature de la convention de prestation</li>
              <li>Validation du financement</li>
              <li>Début du bilan</li>
            </ol>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">4.2 Convention de prestation</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Conformément à l'article R.6313-4 du Code du travail, une convention tripartite est établie entre le bénéficiaire, 
              l'organisme prestataire et le financeur le cas échéant. Cette convention précise les objectifs, la durée, 
              les moyens mis en œuvre et le prix.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Modalités de paiement</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">5.1 Modes de financement</h3>
            <p className="text-gray-700 dark:text-gray-300">Le bilan de compétences peut être financé par :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li><strong>CPF (Compte Personnel de Formation)</strong> : Paiement direct via Mon Compte Formation</li>
              <li><strong>OPCO</strong> : Prise en charge par l'opérateur de compétences</li>
              <li><strong>Employeur</strong> : Dans le cadre du plan de développement des compétences</li>
              <li><strong>Financement personnel</strong> : Paiement par carte bancaire ou virement</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">5.2 Échéancier</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Pour les financements personnels, un paiement en plusieurs fois peut être proposé selon les conditions suivantes :
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>30% à la signature de la convention</li>
              <li>40% à mi-parcours (fin de la phase d'investigation)</li>
              <li>30% à la fin du bilan</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">5.3 Défaut de paiement</h3>
            <p className="text-gray-700 dark:text-gray-300">
              En cas de défaut de paiement, des pénalités de retard au taux légal en vigueur seront appliquées, 
              ainsi qu'une indemnité forfaitaire de 40€ pour frais de recouvrement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Délai de rétractation</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Conformément à l'article L.221-18 du Code de la consommation, le bénéficiaire dispose d'un délai de 14 jours 
              à compter de la signature de la convention pour exercer son droit de rétractation, sauf s'il a expressément 
              demandé à commencer le bilan avant la fin de ce délai.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              La rétractation doit être notifiée par écrit (email ou courrier recommandé). En cas de rétractation après 
              le début du bilan, seules les heures effectivement réalisées seront facturées au prorata.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Annulation et interruption</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">7.1 Par le bénéficiaire</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Le bénéficiaire peut interrompre le bilan à tout moment conformément à l'article R.6313-8 du Code du travail. 
              Dans ce cas :
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Seules les heures effectivement réalisées seront facturées</li>
              <li>Les documents déjà produits seront remis au bénéficiaire</li>
              <li>Aucune pénalité ne sera appliquée</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">7.2 Par le prestataire</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Le prestataire peut mettre fin au bilan en cas de :
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Absence non justifiée à deux rendez-vous consécutifs</li>
              <li>Non-respect des engagements du bénéficiaire</li>
              <li>Comportement inapproprié</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Obligations du prestataire</h2>
            <p className="text-gray-700 dark:text-gray-300">Bilan-Easy s'engage à :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Respecter le cadre réglementaire du bilan de compétences</li>
              <li>Fournir un accompagnement par des consultants qualifiés</li>
              <li>Garantir la confidentialité des résultats</li>
              <li>Remettre les documents prévus (synthèse, attestation)</li>
              <li>Maintenir la certification Qualiopi</li>
              <li>Assurer la sécurité des données personnelles</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Obligations du bénéficiaire</h2>
            <p className="text-gray-700 dark:text-gray-300">Le bénéficiaire s'engage à :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Participer activement aux différentes phases du bilan</li>
              <li>Respecter les rendez-vous fixés avec le consultant</li>
              <li>Fournir des informations sincères et exactes</li>
              <li>Effectuer les travaux personnels demandés</li>
              <li>Respecter les règles d'utilisation de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Réclamations et médiation</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">10.1 Service client</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Pour toute réclamation, le bénéficiaire peut contacter le service client via la plateforme ou à l'adresse 
              <a href="mailto:contact@bilan-easy.fr" className="text-indigo-600 hover:underline ml-1">contact@bilan-easy.fr</a>.
              Une réponse sera apportée sous 7 jours ouvrés.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.2 Médiation</h3>
            <p className="text-gray-700 dark:text-gray-300">
              En cas de litige non résolu à l'amiable, le bénéficiaire peut saisir le médiateur de la consommation compétent. 
              Les coordonnées du médiateur sont disponibles sur demande.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Force majeure</h2>
            <p className="text-gray-700 dark:text-gray-300">
              L'exécution des obligations peut être suspendue en cas de force majeure (événements imprévisibles et irrésistibles). 
              Si la force majeure dure plus de 30 jours, le contrat pourra être résilié de plein droit sans indemnité.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Données personnelles</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Le traitement des données personnelles est effectué conformément au RGPD. Pour plus d'informations, 
              consultez notre <a href="/legal/privacy" className="text-indigo-600 hover:underline">Politique de Confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Droit applicable</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Les présentes CGV sont régies par le droit français. En cas de litige, et à défaut de solution amiable, 
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">14. Acceptation des CGV</h2>
            <p className="text-gray-700 dark:text-gray-300">
              La signature de la convention de prestation vaut acceptation des présentes Conditions Générales de Vente.
            </p>
          </section>
        </div>

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <p className="text-sm text-indigo-900 dark:text-indigo-300">
            <strong>Certification Qualiopi :</strong> Bilan-Easy est certifié Qualiopi pour les actions de bilan de compétences, 
            garantissant la qualité de nos prestations et leur éligibilité aux financements publics et mutualisés.
          </p>
        </div>
      </div>
    </div>
  );
};
