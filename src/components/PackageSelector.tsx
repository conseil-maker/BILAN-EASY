import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package } from '../types';

interface PackageSelectorProps {
  packages: Package[];
  onSelect: (pkg: Package) => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-secondary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);


const PackageSelector: React.FC<PackageSelectorProps> = ({ packages, onSelect }) => {
  const { t } = useTranslation('packages');
  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-800 mb-3">{t('title')}</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col p-8 transform hover:-translate-y-2">
              <h2 className="text-2xl font-bold font-display text-primary-700">{pkg.name}</h2>
              <p className="text-slate-500 mt-2 mb-6 flex-grow">{pkg.description}</p>
              
              <div className="mb-8">
                <p className="text-4xl font-bold text-slate-800">{pkg.totalHours} <span className="text-xl font-medium text-slate-500">{t('hours')}</span></p>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map(feature => (
                    <li key={feature} className="flex items-center text-slate-600">
                        <CheckIcon />
                        <span>{feature}</span>
                    </li>
                ))}
              </ul>
              
              <button
                onClick={() => onSelect(pkg)}
                className="mt-auto w-full bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors duration-300"
              >
                {t('select')}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackageSelector;