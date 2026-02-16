import React from 'react';
import { WordCloudItem } from '../types';

interface WordCloudProps {
  data: WordCloudItem[];
}

// Function to shuffle array for better visual distribution
const shuffleArray = (array: WordCloudItem[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j]!, newArray[i]!];
  }
  return newArray;
};


const WordCloud: React.FC<WordCloudProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    const minWeight = Math.min(...data.map(d => d.weight));
    const maxWeight = Math.max(...data.map(d => d.weight));

    const getFontSize = (weight: number) => {
        if (maxWeight === minWeight) return '1rem'; // 16px
        // Normalize weight to a 0-1 scale, then map to font size
        const normalized = (weight - minWeight) / (maxWeight - minWeight);
        // From 12px to 28px
        const fontSize = 12 + normalized * 16;
        return `${fontSize}px`;
    }
    
    // Shuffle to prevent large words from clumping
    const shuffledData = shuffleArray(data);

    return (
        <div className="bg-slate-50 p-4 rounded-lg flex flex-wrap justify-center items-center gap-x-3 gap-y-2">
            {shuffledData.map((item) => (
                <span 
                    key={item.text} 
                    className="font-semibold text-primary-700 transition-all duration-300"
                    style={{ fontSize: getFontSize(item.weight), opacity: 0.6 + ((item.weight - minWeight) / (maxWeight-minWeight)) * 0.4 }}
                >
                    {item.text}
                </span>
            ))}
        </div>
    );
};

export default WordCloud;
