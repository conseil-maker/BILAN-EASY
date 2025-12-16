import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Types
interface Competence {
  label: string;
  score: number; // 1-5
  category: string;
  description?: string;
}

interface Theme {
  text: string;
  weight: number; // 1-10
}

interface ChartData {
  competences: Competence[];
  themes: Theme[];
  profileType?: string;
  maturityLevel?: string;
}

interface AdvancedCompetenceChartsProps {
  data: ChartData;
  userName: string;
  showExport?: boolean;
}

// Couleurs par catégorie
const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  'Soft Skills': { bg: 'rgba(99, 102, 241, 0.2)', border: '#6366f1', text: '#4f46e5' },
  'Hard Skills': { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#059669' },
  'Management': { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', text: '#d97706' },
  'Communication': { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', text: '#db2777' },
  'Technique': { bg: 'rgba(59, 130, 246, 0.2)', border: '#3b82f6', text: '#2563eb' },
};

// Composant Radar Chart SVG
const RadarChart: React.FC<{ competences: Competence[]; size?: number }> = ({ 
  competences, 
  size = 300 
}) => {
  const center = size / 2;
  const radius = size * 0.4;
  const levels = 5;
  const angleStep = (2 * Math.PI) / competences.length;

  // Générer les points du polygone
  const getPoint = (index: number, value: number) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 5) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Points du polygone des valeurs
  const dataPoints = competences.map((c, i) => getPoint(i, c.score));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Grille de fond */}
      {[1, 2, 3, 4, 5].map((level) => {
        const points = competences.map((_, i) => {
          const p = getPoint(i, level);
          return `${p.x},${p.y}`;
        }).join(' ');
        return (
          <polygon
            key={level}
            points={points}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Lignes des axes */}
      {competences.map((_, i) => {
        const p = getPoint(i, 5);
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={p.x}
            y2={p.y}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Polygone des données */}
      <path
        d={dataPath}
        fill="rgba(99, 102, 241, 0.3)"
        stroke="#6366f1"
        strokeWidth="2"
      />

      {/* Points des données */}
      {dataPoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="6"
          fill="#6366f1"
          stroke="white"
          strokeWidth="2"
        />
      ))}

      {/* Labels */}
      {competences.map((c, i) => {
        const labelPoint = getPoint(i, 6);
        const textAnchor = labelPoint.x < center - 10 ? 'end' : labelPoint.x > center + 10 ? 'start' : 'middle';
        return (
          <text
            key={i}
            x={labelPoint.x}
            y={labelPoint.y}
            textAnchor={textAnchor}
            dominantBaseline="middle"
            className="text-xs font-medium fill-gray-700"
          >
            {c.label}
          </text>
        );
      })}
    </svg>
  );
};

// Composant Barre de progression animée
const AnimatedProgressBar: React.FC<{ 
  label: string; 
  value: number; 
  maxValue: number;
  color: string;
  showPercentage?: boolean;
}> = ({ label, value, maxValue, color, showPercentage = true }) => {
  const percentage = (value / maxValue) * 100;
  
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {showPercentage && (
          <span className="text-sm font-bold" style={{ color }}>{value}/{maxValue}</span>
        )}
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color,
            boxShadow: `0 0 10px ${color}40`
          }}
        />
      </div>
    </div>
  );
};

// Composant Jauge circulaire
const CircularGauge: React.FC<{ 
  value: number; 
  maxValue: number; 
  label: string;
  size?: number;
  color?: string;
}> = ({ value, maxValue, label, size = 120, color = '#6366f1' }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / maxValue) * circumference;
  const percentage = Math.round((value / maxValue) * 100);

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Cercle de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Cercle de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold" style={{ color }}>{percentage}%</span>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400 text-center">{label}</span>
    </div>
  );
};

// Composant principal
export const AdvancedCompetenceCharts: React.FC<AdvancedCompetenceChartsProps> = ({
  data,
  userName,
  showExport = true
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'radar' | 'bars' | 'themes'>('radar');
  const [isExporting, setIsExporting] = useState(false);

  // Calcul du score global
  const globalScore = data.competences.length > 0
    ? data.competences.reduce((sum, c) => sum + c.score, 0) / data.competences.length
    : 0;

  // Export en image
  const exportAsImage = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `competences-${userName}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Erreur export image:', error);
    }
    
    setIsExporting(false);
  };

  // Export en PDF
  const exportAsPDF = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.setFontSize(18);
      pdf.text(`Profil de compétences - ${userName}`, 20, 20);
      pdf.setFontSize(10);
      pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 20, 28);
      
      pdf.addImage(imgData, 'PNG', 10, 35, pdfWidth - 20, pdfHeight - 20);
      pdf.save(`competences-${userName}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Erreur export PDF:', error);
    }
    
    setIsExporting(false);
  };

  // Grouper les compétences par catégorie
  const competencesByCategory = data.competences.reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {} as Record<string, Competence[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">📊 Profil de compétences</h2>
            <p className="opacity-80">{userName}</p>
            {data.profileType && (
              <p className="mt-2 text-lg font-semibold">{data.profileType}</p>
            )}
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{globalScore.toFixed(1)}/5</div>
            <p className="text-sm opacity-80">Score global</p>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex border-b dark:border-gray-700">
        {[
          { id: 'radar', label: 'Radar', icon: '🎯' },
          { id: 'bars', label: 'Détails', icon: '📊' },
          { id: 'themes', label: 'Thèmes', icon: '💡' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-3 px-4 font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      <div ref={chartRef} className="p-6">
        {activeTab === 'radar' && (
          <div className="flex flex-col items-center">
            <RadarChart competences={data.competences} size={350} />
            
            {/* Légende */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-lg">
              {data.competences.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: '#6366f1' }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {c.label}: <strong>{c.score}/5</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bars' && (
          <div className="space-y-6">
            {Object.entries(competencesByCategory).map(([category, competences]) => {
              const colors = categoryColors[category] || categoryColors['Soft Skills'];
              return (
                <div key={category}>
                  <h3 className="font-semibold mb-3" style={{ color: colors.text }}>
                    {category}
                  </h3>
                  {competences.map((c, i) => (
                    <AnimatedProgressBar
                      key={i}
                      label={c.label}
                      value={c.score}
                      maxValue={5}
                      color={colors.border}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'themes' && (
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
              Thèmes prioritaires identifiés
            </h3>
            <div className="space-y-3">
              {data.themes
                .sort((a, b) => b.weight - a.weight)
                .map((theme, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-indigo-600 w-8">
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-800 dark:text-white">
                          {theme.text}
                        </span>
                        <span className="text-sm text-gray-500">
                          Importance: {theme.weight}/10
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${theme.weight * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {data.maturityLevel && (
              <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                  Niveau de maturité du projet
                </h4>
                <p className="text-gray-700 dark:text-gray-300">{data.maturityLevel}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Boutons d'export */}
      {showExport && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={exportAsImage}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <span>🖼️</span>
            Exporter en image
          </button>
          <button
            onClick={exportAsPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <span>📄</span>
            Exporter en PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default AdvancedCompetenceCharts;
