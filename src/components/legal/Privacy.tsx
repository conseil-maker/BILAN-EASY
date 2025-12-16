import React from 'react';
import { Shield } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Shield className="text-indigo-600 mr-3" size={32} />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Politique de Confidentialité
          </h1>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>

        <div className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Introduction</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Bilan-Easy accorde une grande importance à la protection de vos données personnelles. La présente politique 
              de confidentialité vous informe sur la manière dont nous collectons, utilisons, stockons et protégeons vos 
              données conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Responsable du traitement</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Bilan-Easy</strong><br />
                Adresse : [À compléter]<br />
                SIRET : [À compléter]<br />
                Email : <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a><br />
                Délégué à la Protection des Données (DPO) : [À compléter]
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Données collectées</h2>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">3.1 Données d'identification</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Nom, prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse postale</li>
              <li>Date de naissance</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.2 Données professionnelles</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Parcours professionnel</li>
              <li>Formations et diplômes</li>
              <li>Compétences et expériences</li>
              <li>Situation professionnelle actuelle</li>
              <li>Projet professionnel</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.3 Données du bilan</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Réponses aux questionnaires</li>
              <li>Résultats des évaluations</li>
              <li>Échanges avec le consultant</li>
              <li>Documents produits (synthèse, plan d'action)</li>
              <li>Historique de progression</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.4 Données de connexion</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Adresse IP</li>
              <li>Logs de connexion</li>
              <li>Type de navigateur</li>
              <li>Pages visitées</li>
              <li>Durée des sessions</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">3.5 Données de paiement</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Informations de facturation</li>
              <li>Mode de financement (CPF, OPCO, etc.)</li>
              <li>Historique des paiements</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Note : Les données bancaires ne sont jamais stockées par Bilan-Easy. Elles sont traitées directement par nos 
              prestataires de paiement certifiés PCI-DSS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Finalités du traitement</h2>
            <p className="text-gray-700 dark:text-gray-300">Vos données sont collectées pour les finalités suivantes :</p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">4.1 Exécution du contrat</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Réalisation du bilan de compétences</li>
              <li>Accompagnement personnalisé</li>
              <li>Génération des documents officiels</li>
              <li>Suivi de progression</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">4.2 Obligations légales</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Respect du cadre réglementaire Qualiopi</li>
              <li>Conservation des preuves de réalisation</li>
              <li>Facturation et comptabilité</li>
              <li>Réponse aux demandes des autorités</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">4.3 Amélioration du service</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Analyse de satisfaction</li>
              <li>Optimisation de la plateforme</li>
              <li>Formation des consultants</li>
              <li>Statistiques anonymisées</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">4.4 Communication</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Notifications liées au bilan</li>
              <li>Support technique</li>
              <li>Newsletter (avec consentement)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Base légale du traitement</h2>
            <p className="text-gray-700 dark:text-gray-300">Le traitement de vos données repose sur :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2 mt-2">
              <li><strong>L'exécution du contrat</strong> : Réalisation du bilan de compétences</li>
              <li><strong>L'obligation légale</strong> : Conformité Qualiopi, obligations comptables</li>
              <li><strong>Le consentement</strong> : Newsletter, cookies non essentiels</li>
              <li><strong>L'intérêt légitime</strong> : Amélioration du service, sécurité de la plateforme</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Destinataires des données</h2>
            <p className="text-gray-700 dark:text-gray-300">Vos données peuvent être communiquées à :</p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">6.1 Personnel autorisé</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Votre consultant attitré</li>
              <li>L'équipe administrative (dans la limite du nécessaire)</li>
              <li>Le support technique (en cas de besoin)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">6.2 Prestataires techniques</h3>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
              <li>Hébergeur : Supabase (stockage sécurisé des données)</li>
              <li>Hébergement web : Vercel (hébergement de la plateforme)</li>
              <li>Service d'IA : Google (génération de questions via Gemini API)</li>
              <li>Service de paiement : [À compléter]</li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Tous nos prestataires sont soumis à des obligations de confidentialité et de sécurité strictes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">6.3 Organismes de financement</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Avec votre consentement explicite, certaines données peuvent être transmises aux organismes financeurs 
              (CPF, OPCO) pour justifier la réalisation du bilan.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">6.4 Autorités</h3>
            <p className="text-gray-700 dark:text-gray-300">
              En cas d'obligation légale, vos données peuvent être communiquées aux autorités compétentes 
              (administration fiscale, organismes de certification, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Transferts hors UE</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Certains de nos prestataires (notamment Google pour l'API Gemini) peuvent être situés hors de l'Union Européenne. 
              Dans ce cas, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, 
              Privacy Shield, etc.) pour protéger vos données.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Durée de conservation</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 dark:border-gray-600 mt-2">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Type de données</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-gray-900 dark:text-white">Durée</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 dark:text-gray-300">
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Données du bilan</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">2 ans après la fin du bilan (accès utilisateur)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Documents officiels</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">10 ans (obligation Qualiopi)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Données comptables</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">10 ans (obligation légale)</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Logs de connexion</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">1 an</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">Données de prospection</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-2">3 ans sans contact</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              À l'issue de ces délais, vos données sont supprimées ou anonymisées.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Sécurité des données</h2>
            <p className="text-gray-700 dark:text-gray-300">Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données :</p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mt-2">
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Chiffrement des données au repos</li>
              <li>Authentification sécurisée (Supabase Auth)</li>
              <li>Contrôle d'accès strict (Row Level Security)</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et détection des incidents</li>
              <li>Formation du personnel à la sécurité</li>
              <li>Audits de sécurité réguliers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Vos droits</h2>
            <p className="text-gray-700 dark:text-gray-300">Conformément au RGPD, vous disposez des droits suivants :</p>
            
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.1 Droit d'accès</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez obtenir une copie de toutes les données vous concernant.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.2 Droit de rectification</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez corriger ou compléter vos données inexactes ou incomplètes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.3 Droit à l'effacement</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez demander la suppression de vos données, sauf obligation légale de conservation.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.4 Droit à la limitation</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez demander la limitation du traitement de vos données dans certains cas.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.5 Droit à la portabilité</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez récupérer vos données dans un format structuré et couramment utilisé (JSON, CSV).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.6 Droit d'opposition</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez vous opposer au traitement de vos données à des fins de prospection.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.7 Retrait du consentement</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Lorsque le traitement repose sur votre consentement, vous pouvez le retirer à tout moment.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 mt-4">10.8 Droit de réclamation</h3>
            <p className="text-gray-700 dark:text-gray-300">
              Vous pouvez introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) 
              si vous estimez que vos droits ne sont pas respectés.
            </p>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 mt-4">
              <p className="text-indigo-900 dark:text-indigo-300 font-semibold mb-2">Comment exercer vos droits ?</p>
              <p className="text-indigo-800 dark:text-indigo-300 text-sm">
                Pour exercer vos droits, contactez-nous à <a href="mailto:dpo@bilan-easy.fr" className="underline">dpo@bilan-easy.fr</a> 
                en précisant votre demande et en joignant une copie de votre pièce d'identité. 
                Nous vous répondrons dans un délai maximum d'un mois.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Cookies</h2>
            <p className="text-gray-700 dark:text-gray-300">
              La plateforme utilise des cookies pour améliorer votre expérience. Vous pouvez gérer vos préférences via 
              le bandeau de consentement ou les paramètres de votre navigateur.
            </p>
            <p className="text-gray-700 dark:text-gray-300 mt-2">
              Pour plus d'informations, consultez notre <a href="/legal/cookies" className="text-indigo-600 hover:underline">Politique de Cookies</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">12. Modifications</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Nous nous réservons le droit de modifier la présente politique de confidentialité à tout moment. 
              Toute modification sera communiquée par email et/ou notification sur la plateforme. 
              La date de dernière mise à jour est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">13. Contact</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                Pour toute question relative à la protection de vos données personnelles :<br /><br />
                <strong>Délégué à la Protection des Données (DPO)</strong><br />
                Email : <a href="mailto:dpo@bilan-easy.fr" className="text-indigo-600 hover:underline">dpo@bilan-easy.fr</a><br />
                Courrier : Bilan-Easy - DPO, [Adresse à compléter]
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-900 dark:text-green-300">
            <strong>🔒 Engagement de confidentialité :</strong> Conformément à l'article L.6313-10-1 du Code du travail, 
            les résultats de votre bilan de compétences sont strictement confidentiels. Ils ne peuvent être communiqués 
            à un tiers qu'avec votre consentement écrit explicite.
          </p>
        </div>
      </div>
    </div>
  );
};
