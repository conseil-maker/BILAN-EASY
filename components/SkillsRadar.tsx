import React from 'react';
import { RadarSkill } from '../types';

interface SkillsRadarProps {
  data: RadarSkill[];
  comparisonData?: RadarSkill[]; // Optional data for benchmark
}

const SkillsRadar: React.FC<SkillsRadarProps> = ({ data, comparisonData }) => {
  const size = 200;
  const center = size / 2;
  const maxScore = 5;

  if (!data || data.length === 0) return null;

  const numAxes = data.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  const calculatePoints = (dataset: RadarSkill[]) => dataset.map((skill, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const radius = (skill.score / maxScore) * (center * 0.8);
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return `${x},${y}`;
  }).join(' ');

  const userPoints = calculatePoints(data);
  const comparisonPoints = comparisonData ? calculatePoints(comparisonData) : '';
  
  const axes = data.map((skill, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const labelRadius = center * 1.05;
    const labelX = center + labelRadius * Math.cos(angle);
    const labelY = center + labelRadius * Math.sin(angle);
    return { label: { x: labelX, y: labelY, text: skill.label } };
  });

  return (
    <div className="flex justify-center items-center">
      <svg width={size * 1.2} height={size * 1.2} viewBox={`-15 -15 ${size + 30} ${size + 30}`}>
        {/* Grid lines and axes */}
        <g>
            {Array.from({ length: 4 }).map((_, levelIndex) => (
                <polygon key={levelIndex} points={data.map((_, i) => {
                    const angle = angleSlice * i - Math.PI / 2;
                    const radius = ((levelIndex + 1) / 4) * (center * 0.8);
                    const x = center + radius * Math.cos(angle);
                    const y = center + radius * Math.sin(angle);
                    return `${x},${y}`;
                }).join(' ')} className="fill-transparent stroke-slate-200" strokeWidth="1" />
            ))}
            {data.map((_, i) => {
                 const angle = angleSlice * i - Math.PI / 2;
                 const x2 = center + (center * 0.8) * Math.cos(angle);
                 const y2 = center + (center * 0.8) * Math.sin(angle);
                 return <line key={i} x1={center} y1={center} x2={x2} y2={y2} className="stroke-slate-200" strokeWidth="1" />
            })}
        </g>
        
        {/* Labels */}
        {axes.map((axis, i) => (
            <text key={i} x={axis.label.x} y={axis.label.y} className="text-[9px] fill-slate-500 font-medium" textAnchor={axis.label.x > center + 1 ? 'start' : axis.label.x < center - 1 ? 'end' : 'middle'} dominantBaseline="middle">
              {axis.label.text}
            </text>
        ))}

        {/* Comparison Data polygon (rendered first, in the back) */}
        {comparisonPoints && (
            <polygon points={comparisonPoints} className="fill-slate-300/30 stroke-slate-400" strokeWidth="1.5" strokeDasharray="3 3" />
        )}

        {/* User Data polygon */}
        <polygon points={userPoints} className="fill-secondary/50 stroke-secondary" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default SkillsRadar;
