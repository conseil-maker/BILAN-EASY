import React, { useMemo } from 'react';

interface RadarChartProps {
  data: { label: string; value: number; maxValue?: number }[];
  size?: number;
  color?: string;
  showLabels?: boolean;
  showValues?: boolean;
  title?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({
  data,
  size = 300,
  color = '#6366f1',
  showLabels = true,
  showValues = false,
  title
}) => {
  const center = size / 2;
  const radius = (size - 80) / 2;
  const levels = 5;

  const points = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    return data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const maxVal = item.maxValue || 10;
      const normalizedValue = Math.min(item.value / maxVal, 1);
      const x = center + radius * normalizedValue * Math.cos(angle);
      const y = center + radius * normalizedValue * Math.sin(angle);
      const labelX = center + (radius + 30) * Math.cos(angle);
      const labelY = center + (radius + 30) * Math.sin(angle);
      return { ...item, x, y, labelX, labelY, angle };
    });
  }, [data, center, radius]);

  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <svg width={size} height={size} className="overflow-visible">
        {/* Grille de fond */}
        {Array.from({ length: levels }).map((_, levelIndex) => {
          const levelRadius = (radius * (levelIndex + 1)) / levels;
          const levelPoints = data.map((_, index) => {
            const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
            return {
              x: center + levelRadius * Math.cos(angle),
              y: center + levelRadius * Math.sin(angle)
            };
          });
          const levelPath = levelPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';
          return (
            <path
              key={levelIndex}
              d={levelPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-200 dark:text-gray-700"
            />
          );
        })}

        {/* Lignes des axes */}
        {points.map((point, index) => (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(point.angle)}
            y2={center + radius * Math.sin(point.angle)}
            stroke="currentColor"
            strokeWidth="1"
            className="text-gray-200 dark:text-gray-700"
          />
        ))}

        {/* Zone remplie */}
        <path
          d={pathData}
          fill={color}
          fillOpacity="0.2"
          stroke={color}
          strokeWidth="2"
        />

        {/* Points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="5"
            fill={color}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Labels */}
        {showLabels && points.map((point, index) => (
          <text
            key={index}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-600 dark:fill-gray-400"
          >
            {point.label}
            {showValues && ` (${point.value})`}
          </text>
        ))}
      </svg>
    </div>
  );
};

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
  height?: number;
  title?: string;
  showValues?: boolean;
}

export const HorizontalBarChart: React.FC<BarChartProps> = ({
  data,
  maxValue = 10,
  height = 30,
  title,
  showValues = true
}) => {
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {sortedData.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const color = item.color || `hsl(${240 - index * 20}, 70%, 60%)`;
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                {showValues && (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.value}/{maxValue}
                  </span>
                )}
              </div>
              <div 
                className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                style={{ height: `${height}px` }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CompetenceScoreProps {
  competences: {
    category: string;
    score: number;
    maxScore: number;
    color?: string;
  }[];
  title?: string;
}

export const CompetenceScoreCard: React.FC<CompetenceScoreProps> = ({
  competences,
  title = 'Profil de compétences'
}) => {
  const radarData = competences.map(c => ({
    label: c.category,
    value: c.score,
    maxValue: c.maxScore
  }));

  const totalScore = competences.reduce((sum, c) => sum + c.score, 0);
  const maxTotal = competences.reduce((sum, c) => sum + c.maxScore, 0);
  const globalPercentage = Math.round((totalScore / maxTotal) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Radar Chart */}
        <div className="flex-shrink-0">
          <RadarChart 
            data={radarData} 
            size={280} 
            showLabels={true}
            title={title}
          />
        </div>
        
        {/* Détails */}
        <div className="flex-1 w-full">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Score global</span>
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {globalPercentage}%
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${globalPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {competences.map((comp, index) => {
              const percentage = Math.round((comp.score / comp.maxScore) * 100);
              const color = comp.color || `hsl(${240 - index * 30}, 70%, 60%)`;
              
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{comp.category}</span>
                    <span className="font-medium" style={{ color }}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// Graphique de comparaison avant/après
export const ComparisonChart: React.FC<{
  before: { label: string; value: number }[];
  after: { label: string; value: number }[];
  maxValue?: number;
  title?: string;
}> = ({ before, after, maxValue = 10, title }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{title}</h3>
      )}
      
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Avant</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-500 rounded" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Après</span>
        </div>
      </div>

      <div className="space-y-4">
        {before.map((item, index) => {
          const afterItem = after[index];
          const beforePercentage = (item.value / maxValue) * 100;
          const afterPercentage = afterItem ? (afterItem.value / maxValue) * 100 : 0;
          const improvement = afterItem ? afterItem.value - item.value : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                {improvement !== 0 && (
                  <span className={`font-medium ${improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {improvement > 0 ? '+' : ''}{improvement}
                  </span>
                )}
              </div>
              <div className="relative h-6 bg-gray-100 dark:bg-gray-700 rounded">
                <div
                  className="absolute top-0 left-0 h-full bg-gray-400 rounded opacity-50"
                  style={{ width: `${beforePercentage}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-indigo-500 rounded"
                  style={{ width: `${afterPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
