import { useState, useEffect, useCallback } from 'react';

export interface SpeechSettings {
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  enabled: boolean; // Nouveau: contrôle si la voix est activée
}

export const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>({
    voice: null,
    rate: 1,
    pitch: 1,
    volume: 1,
    enabled: false, // Désactivé par défaut
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      const synth = window.speechSynthesis;

      const updateVoices = () => {
        const availableVoices = synth.getVoices().filter(v => v.lang.startsWith('fr'));
        setVoices(availableVoices);
        
        // Sélectionner la meilleure voix française par défaut
        if (!settings.voice && availableVoices.length > 0) {
          // Priorité: Google français > Microsoft français > Autre français
          const googleFrench = availableVoices.find(v => 
            v.name.toLowerCase().includes('google') && v.lang === 'fr-FR'
          );
          const microsoftFrench = availableVoices.find(v => 
            v.name.toLowerCase().includes('microsoft') && v.lang === 'fr-FR'
          );
          const anyFrench = availableVoices.find(v => v.lang === 'fr-FR');
          
          const bestVoice = googleFrench || microsoftFrench || anyFrench || availableVoices[0];
          setSettings(prev => ({ ...prev, voice: bestVoice }));
        }
      };

      updateVoices();
      // Voices are loaded asynchronously
      synth.onvoiceschanged = updateVoices;

      return () => {
        synth.onvoiceschanged = null;
        synth.cancel(); // Clean up any ongoing speech
      };
    }
  }, [settings.voice]);

  const speak = useCallback((text: string) => {
    // Ne pas parler si désactivé ou pas de texte
    if (!isSupported || !text || !settings.enabled) return;
    
    const synth = window.speechSynthesis;
    
    // Cancel any current speech before starting a new one
    if (synth.speaking) {
      synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (settings.voice) {
      utterance.voice = settings.voice;
    }
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;
    utterance.lang = 'fr-FR'; // Forcer le français
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("Speech synthesis error:", e);
        setIsSpeaking(false);
    };

    synth.speak(utterance);
  }, [isSupported, settings]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  const onSettingsChange = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const toggleEnabled = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  }, []);

  return { isSpeaking, isSupported, voices, settings, speak, cancel, onSettingsChange, toggleEnabled };
};
