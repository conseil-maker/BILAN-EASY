import React from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardData } from '../types';
import WordCloud from './WordCloud';
import SkillsRadar from './SkillsRadar';

interface DashboardProps {
  data: DashboardData | null;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isLoading }) => {
  const { t } = useTranslation('questionnaire');
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-display text-primary-800 mb-4">{t('enhanced.emergingThemes')}</h2>
        {isLoading && !data ? (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-500">{t('enhanced.analyzingThemes')}</p>
          </div>
        ) : data ? (
          <WordCloud data={data.themes} />
        ) : (
          <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <p className="text-sm text-slate-600 font-medium">{t('enhanced.themesBuilding')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('enhanced.themesBuildingDesc')}</p>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold font-display text-primary-800 mb-4">{t('enhanced.note', 'Analyse des Compétences')}</h2>
         {isLoading && !data ? (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
             <p className="text-sm text-slate-500">{t('enhanced.analyzingThemes')}</p>
          </div>
        ) : data ? (
          <SkillsRadar data={data.skills} />
        ) : (
          <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-slate-600 font-medium">{t('enhanced.noteText', 'Analyse en préparation')}</p>
            <p className="text-xs text-slate-500 mt-1">{t('enhanced.themesBuildingDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
