import React from 'react';
import { SpeechSettings } from '../hooks/useSpeechSynthesis';

interface SpeechSettingsProps {
  voices: SpeechSynthesisVoice[];
  settings: SpeechSettings;
  onSettingsChange: (newSettings: Partial<SpeechSettings>) => void;
}

const SpeechSettingsComponent: React.FC<SpeechSettingsProps> = ({ voices, settings, onSettingsChange }) => {

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVoice = voices.find(v => v.name === e.target.value) || null;
    onSettingsChange({ voice: selectedVoice });
  };
  
  const handleRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ [e.target.name]: parseFloat(e.target.value) });
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
      <h4 className="text-sm font-bold text-slate-700 mb-3">Paramètres de la Voix</h4>
      <div className="space-y-4">
        <div>
          <label htmlFor="voice" className="block text-sm font-medium text-slate-600 mb-1">Voix</label>
          <select
            id="voice"
            name="voice"
            value={settings.voice?.name || ''}
            onChange={handleVoiceChange}
            className="w-full p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            {voices.map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="rate" className="block text-sm font-medium text-slate-600">Vitesse: {settings.rate.toFixed(1)}</label>
                <input
                    type="range"
                    id="rate"
                    name="rate"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.rate}
                    onChange={handleRangeChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
            <div>
                <label htmlFor="pitch" className="block text-sm font-medium text-slate-600">Hauteur: {settings.pitch.toFixed(1)}</label>
                <input
                    type="range"
                    id="pitch"
                    name="pitch"
                    min="0"
                    max="2"
                    step="0.1"
                    value={settings.pitch}
                    onChange={handleRangeChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
            </div>
        </div>

      </div>
    </div>
  );
};

export default SpeechSettingsComponent;
