import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { organizationConfig } from '../config/organization';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation('about');
  const [activeTab, setActiveTab] = useState<'equipe' | 'methode' | 'valeurs' | 'qualiopi'>('equipe');

  // Données de l'équipe depuis les traductions
  const teamMembers = [
    {
      name: 'Mikail LEKESIZ',
      role: t('team.members.mikail.role'),
      description: t('team.members.mikail.description'),
      expertise: t('team.members.mikail.expertise', { returnObjects: true }) as string[],
    },
    {
      name: 'Bahtisen AKINET',
      role: t('team.members.bahtisen.role'),
      description: t('team.members.bahtisen.description'),
      expertise: t('team.members.bahtisen.expertise', { returnObjects: true }) as string[],
    },
  ];

  // Méthodologie depuis les traductions
  const methodologySteps = ['phase1', 'phase2', 'phase3'].map(key => ({
    phase: t(`method.steps.${key}.phase`),
    title: t(`method.steps.${key}.title`),
    duration: t(`method.steps.${key}.duration`),
    description: t(`method.steps.${key}.description`),
    activities: t(`method.steps.${key}.activities`, { returnObjects: true }) as string[],
  }));

  // Valeurs depuis les traductions
  const values = t('values.items', { returnObjects: true }) as Array<{ icon: string; title: string; description: string }>;

  // Engagements depuis les traductions
  const commitments = t('values.commitments.items', { returnObjects: true }) as string[];

  // Garanties Qualiopi depuis les traductions
  const guarantees = t('qualiopi.guarantees.items', { returnObjects: true }) as Array<{ icon: string; title: string; description: string }>;

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
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">{t('hero.certification')}</span>
                <p className="font-bold">Qualiopi</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">{t('hero.qualiopiNumber')}</span>
                <p className="font-bold">{organizationConfig.qualiopi}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm opacity-80">{t('hero.validity')}</span>
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
              { id: 'equipe', label: t('tabs.team'), icon: '👥' },
              { id: 'methode', label: t('tabs.method'), icon: '📋' },
              { id: 'valeurs', label: t('tabs.values'), icon: '💎' },
              { id: 'qualiopi', label: t('tabs.qualiopi'), icon: '🏆' },
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
              {t('team.title')}
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
                      {Array.isArray(member.expertise) && member.expertise.map((skill, i) => (
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
              <h3 className="text-2xl font-bold mb-4">{t('team.contact')}</h3>
              <div className="flex flex-wrap justify-center gap-8">
                <div>
                  <p className="opacity-80 text-sm">{t('team.phone')}</p>
                  <p className="text-xl font-bold">{organizationConfig.phone}</p>
                </div>
                <div>
                  <p className="opacity-80 text-sm">{t('team.email')}</p>
                  <p className="text-xl font-bold">{organizationConfig.email}</p>
                </div>
                <div>
                  <p className="opacity-80 text-sm">{t('team.address')}</p>
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
              {t('method.title')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-12 max-w-2xl mx-auto">
              {t('method.subtitle')}
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
                        {Array.isArray(step.activities) && step.activities.map((activity, i) => (
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
              <p className="text-gray-600 dark:text-gray-300">{t('method.totalDuration')}</p>
              <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                {t('method.totalHours')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {t('method.totalSpread')}
              </p>
            </div>
          </div>
        )}

        {/* Valeurs */}
        {activeTab === 'valeurs' && (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
              {t('values.title')}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.isArray(values) && values.map((value, index) => (
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
                {t('values.commitments.title')}
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {Array.isArray(commitments) && commitments.map((engagement, i) => (
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
                {t('qualiopi.badge')}
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                {t('qualiopi.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                {t('qualiopi.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Informations certification */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {t('qualiopi.info.title')}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('qualiopi.info.number')}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.qualiopi}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('qualiopi.info.certifier')}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.certificateur}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('qualiopi.info.validity')}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.qualiopiValidity}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">{t('qualiopi.info.nda')}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.nda}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-400">{t('qualiopi.info.siret')}</span>
                    <span className="font-bold text-gray-800 dark:text-white">{organizationConfig.siret}</span>
                  </div>
                </div>
              </div>

              {/* Catégories d'actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  {t('qualiopi.categories.title')}
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
                {t('qualiopi.guarantees.title')}
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {Array.isArray(guarantees) && guarantees.map((item, i) => (
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
