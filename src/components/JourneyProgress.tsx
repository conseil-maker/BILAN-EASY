import React from 'react';

interface JourneyProgressProps {
  current: number;
  total: number;
  phases: number[]; // Number of questions in each phase
}

const JourneyProgress: React.FC<JourneyProgressProps> = ({ current, total, phases }) => {
  const phaseBoundaries = phases.reduce((acc, val, i) => {
    acc.push((acc[i-1] || 0) + val);
    return acc;
  }, [] as number[]);

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < current) return 'completed';
    if (stepIndex === current) return 'current';
    return 'upcoming';
  };

  const statusStyles = {
    completed: 'bg-primary-600 border-primary-700',
    current: 'bg-white border-primary-600 animate-pulse',
    upcoming: 'bg-slate-300 border-slate-400',
  };

  const lineStyles = {
    completed: 'bg-primary-600',
    upcoming: 'bg-slate-300',
  }

  // Calculer le pourcentage de progression
  const progressPercentage = Math.round((current / total) * 100);
  
  // Calculer le nombre de questions restantes
  const questionsRemaining = total - current;
  
  // Estimer le temps restant (2 minutes par question en moyenne)
  const estimatedMinutes = questionsRemaining * 2;
  const estimatedTime = estimatedMinutes < 60 
    ? `${estimatedMinutes} min` 
    : `${Math.round(estimatedMinutes / 60)}h ${estimatedMinutes % 60}min`;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Barre de progression avec pourcentage */}
      <div className="flex items-center gap-3 w-64">
        <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-slate-700 min-w-[45px]">
          {progressPercentage}%
        </span>
      </div>
      
      {/* Informations détaillées */}
      <div className="flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">{current}/{total} questions</span>
        </div>
        
        {questionsRemaining > 0 && (
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>≈ {estimatedTime}</span>
          </div>
        )}
      </div>
      
      {/* Jalons des phases (optionnel, version compacte) */}
      <div className="w-64 relative flex justify-between items-center mt-1">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 transform -translate-y-1/2">
          <div 
            className="h-full bg-primary-600 transition-all duration-500" 
            style={{width: `${(current / (total-1)) * 100}%`}}
          />
        </div>
        
        {Array.from({ length: total }).map((_, i) => {
          const status = getStepStatus(i);
          const isPhaseEnd = phaseBoundaries.includes(i + 1);

          return (
            <div 
              key={i} 
              className={`relative w-1.5 h-1.5 rounded-full border-2 transition-all duration-300 ${statusStyles[status]} ${isPhaseEnd ? 'w-2.5 h-2.5 shadow-md' : ''}`}
              title={`Question ${i+1}${isPhaseEnd ? ' - Fin de phase' : ''}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default JourneyProgress;
