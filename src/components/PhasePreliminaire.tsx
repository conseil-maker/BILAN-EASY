import React from 'react';
import { useTranslation } from 'react-i18next';
import { Package, CoachingStyle } from '../types';
import { QUESTION_CATEGORIES } from '../constants';

interface PhasePreliminaireProps {
  pkg: Package;
  userName: string;
  onConfirm: () => void;
  onGoBack: () => void;
  coachingStyle: CoachingStyle;
  setCoachingStyle: (style: CoachingStyle) => void;
}

const PhaseCard: React.FC<{ number: number; name: string; objective: string; duration: number }> = ({ number, name, objective, duration }) => (
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-lg border border-slate-200">
        <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">{number}</div>
            <div>
                <h3 className="font-bold text-lg text-primary-900">{name}</h3>
                <p className="text-sm text-slate-500">{duration} {t('phase.estimatedMin')}</p>
            </div>
        </div>
        <p className="text-slate-700 text-sm">{objective}</p>
    </div>
);

const CoachingStyleCard: React.FC<{title: string, description: string, isSelected: boolean, onClick: () => void}> = ({ title, description, isSelected, onClick }) => (
    <div onClick={onClick} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-primary-600 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-300'}`}>
        <h4 className={`font-bold ${isSelected ? 'text-primary-700' : 'text-slate-800'}`}>{title}</h4>
        <p className="text-sm text-slate-600">{description}</p>
    </div>
);


const PhasePreliminaire: React.FC<PhasePreliminaireProps> = ({ pkg, userName, onConfirm, onGoBack, coachingStyle, setCoachingStyle }) => {
  const { t } = useTranslation('questionnaire');
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-primary-800 mb-2">{t('phase.readyTitle', { name: userName })}</h1>
          <p className="text-slate-600 text-lg">
            {t('phase.readySubtitle', { packageName: pkg.name })}
          </p>
        </header>

        <div className="space-y-4 mb-8">
            <PhaseCard number={1} name={QUESTION_CATEGORIES.phase1.name} objective={QUESTION_CATEGORIES.phase1.objective} duration={pkg.phases.phase1.duration_min} />
            <PhaseCard number={2} name={QUESTION_CATEGORIES.phase2.name} objective={QUESTION_CATEGORIES.phase2.objective} duration={pkg.phases.phase2.duration_min} />
            <PhaseCard number={3} name={QUESTION_CATEGORIES.phase3.name} objective={QUESTION_CATEGORIES.phase3.objective} duration={pkg.phases.phase3.duration_min} />
        </div>
        
        <div className="mb-8">
            <h3 className="font-bold text-lg text-primary-900 text-center mb-4">{t('phase.chooseCoaching')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CoachingStyleCard title={t('phase.collaborative')} description={t('phase.collaborativeDesc')} isSelected={coachingStyle === 'collaborative'} onClick={() => setCoachingStyle('collaborative')} />
                <CoachingStyleCard title={t('phase.analytic')} description={t('phase.analyticDesc')} isSelected={coachingStyle === 'analytic'} onClick={() => setCoachingStyle('analytic')} />
                <CoachingStyleCard title={t('phase.creative')} description={t('phase.creativeDesc')} isSelected={coachingStyle === 'creative'} onClick={() => setCoachingStyle('creative')} />
            </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={onConfirm} className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary-700 transition-transform transform hover:scale-105 duration-300">{t('phase.startBilan')}</button>
            <button onClick={onGoBack} className="text-sm text-slate-500 hover:text-primary-600">{t('phase.changePackage')}</button>
        </div>
      </div>
    </div>
  );
};

export default PhasePreliminaire;
