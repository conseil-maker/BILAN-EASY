import React from 'react';
import { DashboardData } from '../types';
import WordCloud from './WordCloud';
import SkillsRadar from './SkillsRadar';

interface DashboardProps {
  data: DashboardData | null;
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ data, isLoading }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold font-display text-primary-800 mb-4">Thèmes Émergents</h2>
        {isLoading && !data ? (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-500">Analyse en cours...</p>
          </div>
        ) : data ? (
          <WordCloud data={data.themes} />
        ) : (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-500">Les thèmes apparaîtront ici au fil de vos réponses.</p>
          </div>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold font-display text-primary-800 mb-4">Analyse des Compétences</h2>
         {isLoading && !data ? (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
             <p className="text-sm text-slate-500">Analyse en cours...</p>
          </div>
        ) : data ? (
          <SkillsRadar data={data.skills} />
        ) : (
          <div className="text-center p-4 bg-slate-100 rounded-lg">
            <p className="text-sm text-slate-500">Votre profil de compétences se dessinera ici.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
