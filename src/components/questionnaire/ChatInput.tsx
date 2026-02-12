/**
 * ChatInput - Composant de saisie des réponses
 * 
 * Zone de texte avec boutons d'envoi, micro (dictée vocale) et joker.
 * Gère la saisie clavier et vocale.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Icônes
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const MicIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${active ? 'text-red-500 animate-pulse' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4M5 8v4a7 7 0 0014 0V8M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
  </svg>
);

const JokerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-5 5a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1zm2-3a1 1 0 00-1.414 1.414L8.586 18l-1.293 1.293a1 1 0 101.414 1.414L10 19.414l1.293 1.293a1 1 0 001.414-1.414L11.414 18l1.293-1.293a1 1 0 00-1.414-1.414L10 16.586 8.707 15.293zM5 11a1 1 0 100 2h.01a1 1 0 100-2H5zm14-1a1 1 0 11-2 0v-2a1 1 0 112 0v2zM15 9a1 1 0 100-2h-.01a1 1 0 100 2H15z" clipRule="evenodd" />
  </svg>
);

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onJoker?: () => void;
  isLoading?: boolean;
  isListening?: boolean;
  onMicClick?: () => void;
  speechRecSupported?: boolean;
  placeholder?: string;
  jokersRemaining?: number;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  onJoker,
  isLoading = false,
  isListening = false,
  onMicClick,
  speechRecSupported = false,
  placeholder,
  jokersRemaining = 0,
  disabled = false,
}) => {
  const { t } = useTranslation('questionnaire');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [value]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };
  
  const handleSubmit = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSubmit();
    }
  };
  
  return (
    <div className="bg-white border-t border-slate-200 p-4">
      {/* Zone de saisie principale */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('chatInput.placeholder')}
            disabled={isLoading || disabled}
            rows={1}
            className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-slate-100 disabled:cursor-not-allowed"
          />
          
          {/* Bouton micro */}
          {speechRecSupported && onMicClick && (
            <button
              onClick={onMicClick}
              disabled={isLoading || disabled}
              className={`absolute right-3 bottom-3 p-1 rounded-full transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-500' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title={isListening ? t('chatInput.stopDictation') : t('chatInput.startDictation')}
            >
              <MicIcon active={isListening} />
            </button>
          )}
        </div>
        
        {/* Bouton d'envoi */}
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || isLoading || disabled}
          className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          title={t('chatInput.send')}
        >
          <SendIcon />
        </button>
      </div>
      
      {/* Bouton Joker */}
      {onJoker && jokersRemaining > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            onClick={onJoker}
            disabled={isLoading || disabled}
            className="flex items-center px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <JokerIcon />
            {jokersRemaining > 1 
              ? t('chatInput.skipQuestionPlural', { count: jokersRemaining })
              : t('chatInput.skipQuestion', { count: jokersRemaining })
            }
          </button>
        </div>
      )}
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="mt-2 text-center text-sm text-slate-500">
          {t('chatInput.aiPreparing')}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
