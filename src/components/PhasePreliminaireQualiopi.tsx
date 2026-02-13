import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, CoachingStyle } from '../types-ai-studio';
import { QUESTION_CATEGORIES } from '../constants';
import { CheckCircle, AlertCircle, FileText, Clock, Target, Shield, ChevronRight, ChevronDown } from 'lucide-react';
import LegalModal, { LegalDocumentType } from './LegalModal';

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
  const { t, i18n } = useTranslation('preliminary');
  const [currentStep, setCurrentStep] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('objectives');
  const [legalModalType, setLegalModalType] = useState<LegalDocumentType>(null);
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
                {t('step0.title', { name: userName })}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('step0.subtitle')}
              </p>
            </div>

            {/* Objectifs du bilan */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-6">
              <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center">
                <Target className="mr-2" size={24} />
                {t('step0.objectivesTitle')}
              </h3>
              <p className="text-indigo-800 dark:text-indigo-300 mb-4">
                {t('step0.objectivesIntro')}
              </p>
              <ul className="space-y-2 text-indigo-800 dark:text-indigo-300">
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  {t('step0.objective1')}
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  {t('step0.objective2')}
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  {t('step0.objective3')}
                </li>
                <li className="flex items-start">
                  <CheckCircle className="mr-2 flex-shrink-0 mt-0.5 text-green-600" size={18} />
                  {t('step0.objective4')}
                </li>
              </ul>
            </div>

            {/* Votre parcours */}
            <InfoCard icon={<Clock size={24} />} title={t('step0.pathTitle', { package: pkg.name })}>
              <p className="mb-2" dangerouslySetInnerHTML={{ __html: t('step0.pathDuration', { hours: pkg.totalHours }) }} />
              <p>{t('step0.pathDescription')}</p>
            </InfoCard>

            <ConsentCheckbox
              checked={consent.objectivesUnderstood}
              onChange={(checked) => updateConsent('objectivesUnderstood', checked)}
              label={t('step0.consentObjectives')}
              description={t('step0.consentObjectivesDesc')}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('step1.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('step1.subtitle')}
              </p>
            </div>

            {/* Les 3 phases */}
            <div className="space-y-4">
              {(['phase1', 'phase2', 'phase3'] as const).map((phase, idx) => (
                <div 
                  key={phase}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => setExpandedSection(expandedSection === phase ? null : phase)}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-orange-600' : 'bg-green-600'} text-white rounded-full flex items-center justify-center font-bold mr-4`}>{idx + 1}</div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{t(`step1.${phase}.title`)}</h3>
                        <p className="text-sm text-gray-500">{t(`step1.${phase}.time`)}</p>
                      </div>
                    </div>
                    {expandedSection === phase ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  {expandedSection === phase && (
                    <div className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="mb-2"><strong>{t(`step1.${phase}.objectiveTitle`)}</strong> {t(`step1.${phase}.objective`)}</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {(t(`step1.${phase}.items`, { returnObjects: true }) as string[]).map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Style de coaching */}
            <div className="mt-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('step1.coachingTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'collaborative', title: t('step1.styles.collaborative.title'), desc: t('step1.styles.collaborative.desc') },
                  { id: 'analytic', title: t('step1.styles.analytic.title'), desc: t('step1.styles.analytic.desc') },
                  { id: 'creative', title: t('step1.styles.creative.title'), desc: t('step1.styles.creative.desc') }
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
              label={t('step1.consentMethodology')}
              description={t('step1.consentMethodologyDesc')}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('step2.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('step2.subtitle')}
              </p>
            </div>

            {/* Informations légales */}
            <InfoCard icon={<Shield size={24} />} title={t('step2.confidentialityTitle')}>
              <p dangerouslySetInnerHTML={{ __html: t('step2.confidentialityText') }} />
            </InfoCard>

            <InfoCard icon={<FileText size={24} />} title={t('step2.rightsTitle')}>
              <ul className="space-y-1">
                {(t('step2.rights', { returnObjects: true }) as string[]).map((right, i) => (
                  <li key={i}>• {right}</li>
                ))}
              </ul>
            </InfoCard>

            <div className="space-y-3">
              <ConsentCheckbox
                checked={consent.informedConsent}
                onChange={(checked) => updateConsent('informedConsent', checked)}
                label={t('step2.consentInformed')}
                description={t('step2.consentInformedDesc')}
              />

              <ConsentCheckbox
                checked={consent.voluntaryParticipation}
                onChange={(checked) => updateConsent('voluntaryParticipation', checked)}
                label={t('step2.consentVoluntary')}
                description={t('step2.consentVoluntaryDesc')}
              />

              <ConsentCheckbox
                checked={consent.confidentialityAcknowledged}
                onChange={(checked) => updateConsent('confidentialityAcknowledged', checked)}
                label={t('step2.consentConfidentiality')}
                description={t('step2.consentConfidentialityDesc')}
              />

              <ConsentCheckbox
                checked={consent.dataProcessingConsent}
                onChange={(checked) => updateConsent('dataProcessingConsent', checked)}
                label={t('step2.consentData')}
                description={t('step2.consentDataDesc')}
              />
            </div>

            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="text-yellow-600 dark:text-yellow-400 mr-3 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  {t('step2.warningText')}{' '}
                  <button onClick={() => setLegalModalType('cgu')} className="underline hover:text-yellow-600 cursor-pointer font-medium">{t('step2.cgu')}</button>,{' '}
                  <button onClick={() => setLegalModalType('cgv')} className="underline hover:text-yellow-600 cursor-pointer font-medium">{t('step2.cgv')}</button> {t('step2.and')}{' '}
                  <button onClick={() => setLegalModalType('privacy')} className="underline hover:text-yellow-600 cursor-pointer font-medium">{t('step2.privacy')}</button>.
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
                {t('step3.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {t('step3.subtitle')}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">{t('step3.bilanTitle')}</h3>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('step3.beneficiary')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{userName}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('step3.path')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{pkg.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('step3.duration')}</p>
                  <p className="font-medium text-gray-900 dark:text-white">{t('step3.hours', { hours: pkg.totalHours })}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">{t('step3.coachingStyle')}</p>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{coachingStyle}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-4 flex items-center">
                <CheckCircle className="mr-2" size={24} />
                {t('step3.consentsTitle')}
              </h3>
              <ul className="space-y-2 text-green-800 dark:text-green-300 text-sm">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="mr-2 flex-shrink-0" size={16} />
                    {t(`step3.consent${i}`)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t('step3.signatureDate')} {new Date().toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'fr-FR', { 
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
              {currentStep === 0 ? t('nav.changePackage') : t('nav.previous')}
            </button>

            {currentStep < totalSteps - 1 ? (
              <button
                onClick={(e) => {
                  const isCurrentStepValid = 
                    (currentStep === 0 && isStep1Valid) ||
                    (currentStep === 1 && isStep2Valid) ||
                    (currentStep === 2 && isStep3Valid);
                  
                  if (!isCurrentStepValid) {
                    e.preventDefault();
                    return;
                  }
                  handleNext();
                }}
                disabled={
                  (currentStep === 0 && !isStep1Valid) ||
                  (currentStep === 1 && !isStep2Valid) ||
                  (currentStep === 2 && !isStep3Valid)
                }
                className={`px-6 py-3 rounded-lg transition-colors flex items-center ${
                  (currentStep === 0 && !isStep1Valid) ||
                  (currentStep === 1 && !isStep2Valid) ||
                  (currentStep === 2 && !isStep3Valid)
                    ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {t('nav.next')}
                <ChevronRight size={20} className="ml-2" />
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={!isAllValid}
                className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
              >
                {t('nav.start')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour les documents légaux */}
      <LegalModal 
        documentType={legalModalType} 
        onClose={() => setLegalModalType(null)} 
      />
    </div>
  );
};

export default PhasePreliminaireQualiopi;
