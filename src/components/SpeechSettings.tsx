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

  const handleToggleEnabled = () => {
    onSettingsChange({ enabled: !settings.enabled });
  };

  // Identifier les voix Google pour les mettre en avant
  const sortedVoices = [...voices].sort((a, b) => {
    const aIsGoogle = a.name.toLowerCase().includes('google');
    const bIsGoogle = b.name.toLowerCase().includes('google');
    if (aIsGoogle && !bIsGoogle) return -1;
    if (!aIsGoogle && bIsGoogle) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Paramètres de la Voix</h4>
        
        {/* Toggle Activer/Désactiver */}
        <button
          onClick={handleToggleEnabled}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            settings.enabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'
          }`}
          role="switch"
          aria-checked={settings.enabled}
          aria-label="Activer la lecture vocale"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              settings.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Message d'état */}
      <div className={`mb-4 p-2 rounded-lg text-sm ${
        settings.enabled 
          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
      }`}>
        {settings.enabled 
          ? '🔊 Lecture vocale activée - Les questions seront lues automatiquement'
          : '🔇 Lecture vocale désactivée - Cliquez sur le toggle pour activer'
        }
      </div>

      {/* Paramètres détaillés (affichés uniquement si activé) */}
      {settings.enabled && (
        <div className="space-y-4">
          <div>
            <label htmlFor="voice" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
              Voix {settings.voice?.name.toLowerCase().includes('google') && (
                <span className="ml-1 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded">
                  Google
                </span>
              )}
            </label>
            <select
              id="voice"
              name="voice"
              value={settings.voice?.name || ''}
              onChange={handleVoiceChange}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              {sortedVoices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name.toLowerCase().includes('google') ? '⭐ ' : ''}{voice.name} ({voice.lang})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Les voix Google (⭐) offrent généralement une meilleure qualité
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Vitesse: {settings.rate.toFixed(1)}
              </label>
              <input
                type="range"
                id="rate"
                name="rate"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.rate}
                onChange={handleRangeChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
            <div>
              <label htmlFor="pitch" className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Hauteur: {settings.pitch.toFixed(1)}
              </label>
              <input
                type="range"
                id="pitch"
                name="pitch"
                min="0"
                max="2"
                step="0.1"
                value={settings.pitch}
                onChange={handleRangeChange}
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeechSettingsComponent;
