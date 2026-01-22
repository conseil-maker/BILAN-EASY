import React, { useState } from 'react';
import { Package, CoachingStyle } from '../types-ai-studio';
import { QUESTION_CATEGORIES } from '../constants';
import { CheckCircle, AlertCircle, FileText, Clock, Target, Shield, ChevronRight, ChevronDown } from 'lucide-react';

interface PhasePreliminaireQualiopiProps {
  pkg: Package;
  userName: string;
  onConfirm: (consentData: ConsentData) => void;
  onGoBack: () => void;
  coachingStyle: CoachingStyle;
  setCoachingStyle: (style: CoachingStyle) => void;
}

export interface ConsentData {
  informedConsent: boolean;
  voluntaryParticipation: boolean;
  confidentialityAcknowledged: boolean;
  dataProcessingConsent: boolean;
  objectivesUnderstood: boolean;
  methodologyAccepted: boolean;
  signatureDate: string;
}

const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center mb-8">
    {Array.from({ length: totalSteps }).map((_, index) => (
      <React.Fragment key={index}>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
            index < currentStep
              ? 'bg-green-500 text-white'
              : index === currentStep
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
          }`}
        >
          {index < currentStep ? <CheckCircle size={20} /> : index + 1}
        </div>
        {index < totalSteps - 1 && (
          <div
            className={`w-16 h-1 mx-2 ${
              index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

const InfoCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 mb-4">
    <div className="flex items-start">
      <div className="flex-shrink-0 text-indigo-600 dark:text-indigo-400 mr-4">{icon}</div>
      <div>
        <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
        <div className="text-gray-600 dark:text-gray-400 text-sm">{children}</div>
      </div>
    </div>
  </div>
);

const ConsentCheckbox: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  required?: boolean;
}> = ({ checked, onChange, label, description, required = true }) => (
  <label className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
    />
    <div className="ml-3">
      <span className="font-medium text-gray-900 dark:text-white">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      )}
    </div>
  </label>
);

const PhasePreliminaireQualiopi: React.FC<PhasePreliminaireQualiopiProps> = ({
  pkg,
  userName,
  onConfirm,
  onGoBack,
  coachingStyle,
  setCoachingStyle
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('objectives');
  const [consent, setConsent] = useState<ConsentData>({
    informedConsent: false,
    voluntaryParticipation: false,
    confidentialityAcknowledged: false,
    dataProcessingConsent: false,
    objectivesUnderstood: false,
    methodologyAccepted: false,
    signatureDate: ''
  });

  const totalSteps = 4;

  const updateConsent = (key: keyof ConsentData, value: boolean | string) => {
    setConsent(prev => ({ ...prev, [key]: value }));
  };

  const isStep1Valid = consent.objectivesUnderstood;
  const isStep2Valid = consent.methodologyAccepted;
  const isStep3Valid = consent.informedConsent && consent.voluntaryParticipation && 
                       consent.confidentialityAcknowledged && consent.dataProcessingConsent;
  const isAllValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirm = () => {
    if (isAllValid) {
      onConfirm({
        ...consent,
        signatureDate: new Date().toISOString()
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Bienvenue {userName} !
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Avant de commencer votre bilan de compétences, prenons le temps de bien comprendre vos objectifs.
              </p>
            </div>

            {/* Objectifs du bilan */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
                <Target className="mr-2" size={24} />
                Objectifs du bilan de compétences
              </h3>
              <p className="text-indigo-800 dark:text-indigo-300 mb-4">
                Conformément à l'article L.6313-4 du Code du travail, le bilan de compétences a pour objectif de vous permettre :
              </p>
              <ul className="space-y-2 text-indigo-800 dark:text-indigo-300">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  D'analyser vos compétences professionnelles et personnelles
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  D'identifier vos aptitudes et motivations
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  De définir un projet professionnel ou de formation
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  D'élaborer un plan d'action concret
                </li>
              </ul>
            </div>

            {/* Votre parcours */}
            <InfoCard icon={<Clock size={24} />} title={`Votre parcours : ${pkg.name}`}>
              <p className="mb-2">Durée totale : <strong>{pkg.totalHours} heures</strong></p>
              <p>Ce parcours comprend les trois phases réglementaires du bilan de compétences.</p>
            </InfoCard>

            <ConsentCheckbox
              checked={consent.objectivesUnderstood}
              onChange={(checked) => updateConsent('objectivesUnderstood', checked)}
              label="J'ai compris les objectifs du bilan de compétences"
              description="Je comprends que ce bilan vise à m'aider à définir mon projet professionnel."
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Déroulement du bilan
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Votre bilan se déroule en trois phases obligatoires
              </p>
            </div>

            {/* Les 3 phases */}
            <div className="space-y-4">
              <div 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'phase1' ? null : 'phase1')}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold mr-4">1</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Phase préliminaire</h3>
                      <p className="text-sm text-gray-500">~17% du temps total</p>
                    </div>
                  </div>
                  {expandedSection === 'phase1' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSection === 'phase1' && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="mb-2"><strong>Objectif :</strong> Analyser votre demande et définir vos besoins</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Analyse de votre situation actuelle</li>
                      <li>Définition de vos attentes et objectifs</li>
                      <li>Présentation de la méthodologie</li>
                      <li>Validation du consentement éclairé</li>
                    </ul>
                  </div>
                )}
              </div>

              <div 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'phase2' ? null : 'phase2')}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-4">2</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Phase d'investigation</h3>
                      <p className="text-sm text-gray-500">~50% du temps total</p>
                    </div>
                  </div>
                  {expandedSection === 'phase2' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSection === 'phase2' && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="mb-2"><strong>Objectif :</strong> Explorer et construire votre projet</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Analyse de votre parcours professionnel</li>
                      <li>Identification de vos compétences</li>
                      <li>Exploration de vos valeurs et motivations</li>
                      <li>Recherche de pistes professionnelles</li>
                      <li>Confrontation au marché de l'emploi</li>
                    </ul>
                  </div>
                )}
              </div>

              <div 
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === 'phase3' ? null : 'phase3')}
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold mr-4">3</div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">Phase de conclusion</h3>
                      <p className="text-sm text-gray-500">~17% du temps total</p>
                    </div>
                  </div>
                  {expandedSection === 'phase3' ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                {expandedSection === 'phase3' && (
                  <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                    <p className="mb-2"><strong>Objectif :</strong> Finaliser et planifier</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Synthèse des résultats</li>
                      <li>Validation du projet professionnel</li>
                      <li>Élaboration du plan d'action</li>
                      <li>Remise du document de synthèse</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Style de coaching */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Choisissez votre style d'accompagnement</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'collaborative', title: 'Collaboratif', desc: 'Approche bienveillante centrée sur vos forces' },
                  { id: 'analytic', title: 'Analytique', desc: 'Approche structurée et méthodique' },
                  { id: 'creative', title: 'Créatif', desc: 'Approche inspirante et exploratoire' }
                ].map(style => (
                  <button
                    key={style.id}
                    onClick={() => setCoachingStyle(style.id as CoachingStyle)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      coachingStyle === style.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    <h4 className={`font-bold ${coachingStyle === style.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-white'}`}>
                      {style.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{style.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <ConsentCheckbox
              checked={consent.methodologyAccepted}
              onChange={(checked) => updateConsent('methodologyAccepted', checked)}
              label="J'accepte la méthodologie proposée"
              description="Je comprends le déroulement des trois phases du bilan."
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Consentement éclairé
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Conformément au Code du travail et au RGPD
              </p>
            </div>

            {/* Informations légales */}
            <InfoCard icon={<Shield size={24} />} title="Confidentialité garantie">
              <p>
                Conformément à l'article L.6313-10-1 du Code du travail, les résultats de votre bilan sont 
                <strong> strictement confidentiels</strong>. Ils ne peuvent être communiqués à un tiers 
                (employeur, financeur, etc.) qu'avec votre accord écrit explicite.
              </p>
            </InfoCard>

            <InfoCard icon={<FileText size={24} />} title="Vos droits">
              <ul className="space-y-1">
                <li>• Vous pouvez interrompre le bilan à tout moment</li>
                <li>• Vous êtes propriétaire des résultats</li>
                <li>• Vous avez accès à vos données (RGPD)</li>
                <li>• Vous pouvez demander la suppression de vos données</li>
              </ul>
            </InfoCard>

            <div className="space-y-3">
              <ConsentCheckbox
                checked={consent.informedConsent}
                onChange={(checked) => updateConsent('informedConsent', checked)}
                label="Je donne mon consentement éclairé"
                description="J'ai reçu toutes les informations nécessaires sur le bilan de compétences."
              />

              <ConsentCheckbox
                checked={consent.voluntaryParticipation}
                onChange={(checked) => updateConsent('voluntaryParticipation', checked)}
                label="Je participe volontairement"
                description="Ma participation est libre et volontaire, sans aucune contrainte."
              />

              <ConsentCheckbox
                checked={consent.confidentialityAcknowledged}
                onChange={(checked) => updateConsent('confidentialityAcknowledged', checked)}
                label="J'ai compris les règles de confidentialité"
                description="Je comprends que les résultats m'appartiennent et ne seront pas communiqués sans mon accord."
              />

              <ConsentCheckbox
                checked={consent.dataProcessingConsent}
                onChange={(checked) => updateConsent('dataProcessingConsent', checked)}
                label="J'accepte le traitement de mes données"
                description="Conformément au RGPD, j'autorise le traitement de mes données pour la réalisation du bilan."
              />
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  En validant ces conditions, vous confirmez avoir lu et compris les informations ci-dessus. 
                  Vous pouvez consulter nos <button type="button" onClick={() => window.open(window.location.origin + '/#/legal/cgu', '_blank')} className="underline hover:text-yellow-600 cursor-pointer">CGU</button>, 
                  <button type="button" onClick={() => window.open(window.location.origin + '/#/legal/cgv', '_blank')} className="underline ml-1 hover:text-yellow-600 cursor-pointer">CGV</button> et 
                  <button type="button" onClick={() => window.open(window.location.origin + '/#/legal/privacy', '_blank')} className="underline ml-1 hover:text-yellow-600 cursor-pointer">Politique de confidentialité</button>.
                </p>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Récapitulatif
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Vérifiez les informations avant de commencer
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Votre bilan de compétences</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Bénéficiaire</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userName}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Parcours</p>
                  <p className="font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Durée</p>
                  <p className="font-medium text-gray-900 dark:text-white">{pkg.totalHours} heures</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Style d'accompagnement</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{coachingStyle}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-4 flex items-center">
                <CheckCircle className="mr-2" size={24} />
                Consentements validés
              </h3>
              <ul className="space-y-2 text-green-800 dark:text-green-300 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                  Objectifs du bilan compris
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                  Méthodologie acceptée
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                  Consentement éclairé donné
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                  Participation volontaire confirmée
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                  Confidentialité comprise
                </li>
                <li className="flex items-center">
                  <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                  Traitement des données accepté
                </li>
              </ul>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Date de signature : {new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-900 dark:to-indigo-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          
          {renderStep()}

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={currentStep === 0 ? onGoBack : handlePrevious}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {currentStep === 0 ? 'Changer de forfait' : 'Précédent'}
            </button>

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={handleNext}
                disabled={
                  (currentStep === 0 && !isStep1Valid) ||
                  (currentStep === 1 && !isStep2Valid) ||
                  (currentStep === 2 && !isStep3Valid)
                }
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                Suivant
                <ChevronRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!isAllValid}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
              >
                Commencer mon bilan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhasePreliminaireQualiopi;
