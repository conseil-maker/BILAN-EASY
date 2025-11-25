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

  return (
    <div className="w-48 flex items-center">
      <div className="relative w-full flex justify-between items-center">
        {/* Background line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-300 transform -translate-y-1/2">
            <div className="h-full bg-primary-600" style={{width: `${(current / (total-1)) * 100}%`}}></div>
        </div>
        
        {Array.from({ length: total }).map((_, i) => {
          const status = getStepStatus(i);
          const isPhaseEnd = phaseBoundaries.includes(i + 1);

          return (
            <div 
              key={i} 
              className={`relative w-2 h-2 rounded-full border-2 transition-all duration-300 ${statusStyles[status]} ${isPhaseEnd ? 'w-3 h-3' : ''}`}
              title={`Question ${i+1}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default JourneyProgress;
