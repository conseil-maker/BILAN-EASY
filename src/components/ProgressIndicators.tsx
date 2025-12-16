import React from 'react';
import { Clock, Target, TrendingUp, Award, CheckCircle, AlertCircle } from 'lucide-react';

interface ProgressCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color: 'indigo' | 'green' | 'orange' | 'purple' | 'blue';
  progress?: number;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  icon,
  label,
  value,
  subtext,
  color,
  progress
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
  };

  const progressColors = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    blue: 'bg-blue-500'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        {progress !== undefined && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {progress}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {subtext && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>
        )}
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full ${progressColors[color]} transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

interface ProgressDashboardProps {
  timeSpent: number; // en minutes
  timeTotal: number; // en minutes
  questionsAnswered: number;
  categoriesCompleted: number;
  categoriesTotal: number;
  currentPhase: number;
  phaseProgress: number;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  timeSpent,
  timeTotal,
  questionsAnswered,
  categoriesCompleted,
  categoriesTotal,
  currentPhase,
  phaseProgress
}) => {
  const timeProgress = Math.min(100, Math.round((timeSpent / timeTotal) * 100));
  const categoryProgress = Math.round((categoriesCompleted / categoriesTotal) * 100);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      <ProgressCard
        icon={<Clock size={20} />}
        label="Temps passé"
        value={formatTime(timeSpent)}
        subtext={`sur ${formatTime(timeTotal)}`}
        color="indigo"
        progress={timeProgress}
      />
      <ProgressCard
        icon={<Target size={20} />}
        label="Questions"
        value={questionsAnswered}
        subtext="réponses enregistrées"
        color="green"
      />
      <ProgressCard
        icon={<TrendingUp size={20} />}
        label="Catégories"
        value={`${categoriesCompleted}/${categoriesTotal}`}
        subtext="explorées"
        color="purple"
        progress={categoryProgress}
      />
      <ProgressCard
        icon={<Award size={20} />}
        label="Phase"
        value={`${currentPhase}/3`}
        subtext={currentPhase === 1 ? 'Préliminaire' : currentPhase === 2 ? 'Investigation' : 'Conclusion'}
        color="orange"
        progress={phaseProgress}
      />
    </div>
  );
};

// Indicateur circulaire de progression
export const CircularProgress: React.FC<{
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  showPercentage?: boolean;
}> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#6366f1',
  label,
  showPercentage = true
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-500 dark:text-gray-400 text-center px-2">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};

// Barre de progression avec étapes
export const SteppedProgress: React.FC<{
  steps: { label: string; completed: boolean }[];
  currentStep: number;
}> = ({ steps, currentStep }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step.completed
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200 dark:ring-indigo-900'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {step.completed ? (
                  <CheckCircle size={20} />
                ) : (
                  <span className="font-semibold">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  index === currentStep
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Indicateur de temps restant
export const TimeRemaining: React.FC<{
  minutesRemaining: number;
  totalMinutes: number;
}> = ({ minutesRemaining, totalMinutes }) => {
  const percentage = Math.round((minutesRemaining / totalMinutes) * 100);
  const isLow = percentage < 20;
  const isMedium = percentage >= 20 && percentage < 50;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
      isLow 
        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        : isMedium
        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    }`}>
      {isLow ? (
        <AlertCircle size={18} />
      ) : (
        <Clock size={18} />
      )}
      <span className="font-medium">
        {minutesRemaining > 60 
          ? `${Math.floor(minutesRemaining / 60)}h ${minutesRemaining % 60}min restantes`
          : `${minutesRemaining}min restantes`
        }
      </span>
    </div>
  );
};

// Badge de complétion
export const CompletionBadge: React.FC<{
  completed: number;
  total: number;
  label: string;
}> = ({ completed, total, label }) => {
  const percentage = Math.round((completed / total) * 100);
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
      <div className="relative w-6 h-6">
        <svg className="w-6 h-6 transform -rotate-90">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-300 dark:text-gray-600"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${percentage * 0.628} 62.8`}
            className="text-indigo-600 dark:text-indigo-400"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {completed}/{total} {label}
      </span>
    </div>
  );
};
