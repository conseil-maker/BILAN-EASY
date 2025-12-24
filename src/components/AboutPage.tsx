import React, { useState } from 'react';
import { organizationConfig } from '../config/organization';

// Types
interface TeamMember {
  name: string;
  role: string;
  description: string;
  expertise: string[];
  photo?: string;
}

interface MethodStep {
  phase: string;
  title: string;
  duration: string;
  description: string;
  activities: string[];
}

// Données de l'équipe
const teamMembers: TeamMember[] = [
  {
    name: 'Mikail LEKESIZ',
    role: 'Président - Consultant en Bilan de Compétences',
    description: 'Fort de plusieurs années d\'expérience dans l\'accompagnement professionnel, Mikail accompagne les bénéficiaires dans leur réflexion de carrière avec une approche personnalisée et bienveillante.',
    expertise: [
      'Bilan de compétences',
      'Accompagnement au changement',
      'Reconversion professionnelle',
      'Développement personnel',
    ],
  },
  {
    name: 'Bahtisen AKINET',
    role: 'Assistante Administrative et Formatrice',
    description: 'Bahtisen assure le suivi administratif des dossiers et contribue à la qualité de l\'accueil des bénéficiaires. Elle intervient également en tant que formatrice sur les modules bureautiques.',
    expertise: [
      'Gestion administrative',
      'Accueil et orientation',
      'Formation bureautique',
      'Suivi des dossiers CPF/OPCO',
    ],
  },
];

// Méthodologie du bilan
const methodologySteps: MethodStep[] = [
  {
    phase: 'Phase 1',
    title: 'Phase préliminaire',
    duration: '2-3 heures',
    description: 'Cette phase permet de définir vos besoins, de vous informer sur le déroulement du bilan et de confirmer votre engagement.',
    activities: [
      'Entretien de découverte',
      'Présentation de la méthodologie',
      'Définition des objectifs personnalisés',
      'Signature de la convention',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Phase d\'investigation',
    duration: '12-16 heures',
    description: 'C\'est le cœur du bilan. Nous explorons ensemble votre parcours, vos compétences, vos motivations et vos aspirations.',
    activities: [
      'Analyse du parcours professionnel',
      'Identification des compétences',
      'Exploration des motivations et valeurs',
      'Tests et questionnaires',
      'Recherche documentaire sur les métiers',
      'Entretiens de validation',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Phase de conclusion',
    duration: '4-6 heures',
    description: 'Nous construisons ensemble votre projet professionnel et définissons un plan d\'action concret.',
    activities: [
      'Synthèse des résultats',
      'Élaboration du projet professionnel',
      'Construction du plan d\'action',
      'Remise du document de synthèse',
      'Entretien de clôture',
    ],
  },
];

// Valeurs de l'organisme
const values = [
  {
    icon: '🎯',
    title: 'Personnalisation',
    description: 'Chaque bilan est unique, adapté à votre parcours et vos objectifs.',
  },
  {
    icon: '🤝',
    title: 'Bienveillance',
    description: 'Un accompagnement dans le respect et l\'écoute active.',
  },
  {
    icon: '🔒',
    title: 'Confidentialité',
    description: 'Vos informations sont strictement confidentielles.',
  },
  {
    icon: '✨',
    title: 'Excellence',
    description: 'Une démarche qualité certifiée Qualiopi.',
  },
];

export const AboutPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'equipe' | 'methode' | 'valeurs' | 'qualiopi'>('equipe');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {organizationConfig.name}
            </h1>
            <p className="text-xl opacity-90 mb-6">
              Votre partenaire pour réussir votre transition professionnelle
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Certification</span>
                <p className="font-bold">Qualiopi</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">N° Qualiopi</span>
                <p className="font-bold">{organizationConfig.qualiopi}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">Validité</span>
                <p className="font-bold">{organizationConfig.qualiopiValidity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 shadow-md z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {[
              { id: 'equipe', label: 'Notre équipe', icon: '👥' },
              { id: 'methode', label: 'Notre méthode', icon: '📋' },
              { id: 'valeurs', label: 'Nos valeurs', icon: '💎' },
              { id: 'qualiopi', label: 'Certification Qualiopi', icon: '🏆' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-indigo-600'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Équipe */}
        {activeTab === 'equipe' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
              Notre équipe à votre service
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-24" />
                  <div className="px-6 pb-6 -mt-12">
                    <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-3xl shadow-lg mb-4">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {member.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill, i) => (
                        <span 
                          key={i}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Contactez-nous</h3>
              <div className="flex flex-wrap justify-center gap-8">
                <div>
                  <p className="opacity-80 text-sm">Téléphone</p>
                  <p className="text-xl font-bold">{organizationConfig.phone}</p>
                </div>
                <div>
                  <p className="opacity-80 text-sm">Email</p>
                  <p className="text-xl font-bold">{organizationConfig.email}</p>
                </div>
                <div>
                  <p className="opacity-80 text-sm">Adresse</p>
                  <p className="text-xl font-bold">{organizationConfig.address.city}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Méthode */}
        {activeTab === 'methode' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
              Notre méthodologie
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              Un accompagnement structuré en 3 phases, conforme au Code du travail (art. L.6313-4), 
              pour vous aider à construire un projet professionnel réaliste et réalisable.
            </p>

            <div className="relative">
              {/* Ligne de connexion */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 transform -translate-x-1/2" />

              {methodologySteps.map((step, index) => (
                <div 
                  key={index}
                  className={`relative flex items-center mb-12 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Point sur la ligne */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white dark:bg-gray-800 border-4 border-indigo-500 rounded-full items-center justify-center z-10">
                    <span className="text-indigo-600 font-bold">{index + 1}</span>
                  </div>

                  {/* Carte */}
                  <div className={`w-full md:w-5/12 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="md:hidden w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                            {step.phase}
                          </span>
                          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                            {step.title}
                          </h3>
                        </div>
                        <span className="ml-auto px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">
                          {step.duration}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {step.description}
                      </p>
                      <ul className="space-y-2">
                        {step.activities.map((activity, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="text-green-500">✓</span>
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Espace vide */}
                  <div className="hidden md:block w-5/12" />
                </div>
              ))}
            </div>

            {/* Durée totale */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">Durée totale du bilan</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                18 à 24 heures
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Réparties sur 2 à 3 mois selon votre rythme
              </p>
            </div>
          </div>
        )}

        {/* Valeurs */}
        {activeTab === 'valeurs' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
              Nos valeurs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl mb-4">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Engagements */}
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Nos engagements qualité
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  'Réponse sous 48h à toute demande',
                  'Entretien de découverte gratuit et sans engagement',
                  'Accompagnement personnalisé tout au long du bilan',
                  'Documents de synthèse remis dans les délais',
                  'Suivi à 6 mois post-bilan',
                  'Amélioration continue basée sur vos retours',
                ].map((engagement, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600">
                      ✓
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{engagement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Qualiopi */}
        {activeTab === 'qualiopi' && (
          <div>
            <div className="text-center mb-12">
              <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-4">
                Organisme certifié
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Certification Qualiopi
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                La certification Qualiopi atteste de la qualité du processus mis en œuvre 
                par notre organisme pour le développement des compétences.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Informations certification */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  📋 Informations de certification
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">N° Qualiopi</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.qualiopi}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Organisme certificateur</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.certificateur}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Validité</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.qualiopiValidity}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">NDA</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.nda}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">SIRET</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.siret}</span>
                  </div>
                </div>
              </div>

              {/* Catégories d'actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  🎯 Catégories d'actions certifiées
                </h3>
                <div className="space-y-4">
                  {organizationConfig.qualiopiCategories.map((category, i) => (
                    <div 
                      key={i}
                      className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                    >
                      <span className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                        ✓
                      </span>
                      <span className="font-medium text-gray-800 dark:text-white">{category}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ce que garantit Qualiopi */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Ce que garantit la certification Qualiopi
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Éligibilité aux financements',
                    description: 'Votre bilan peut être financé par le CPF, les OPCO, Pôle Emploi...',
                    icon: '💰',
                  },
                  {
                    title: 'Qualité des prestations',
                    description: 'Nos processus sont audités et conformes au référentiel national.',
                    icon: '⭐',
                  },
                  {
                    title: 'Amélioration continue',
                    description: 'Nous analysons vos retours pour améliorer constamment nos services.',
                    icon: '📈',
                  },
                ].map((item, i) => (
                  <div key={i} className="text-center">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <h4 className="font-bold text-gray-800 dark:text-white mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
