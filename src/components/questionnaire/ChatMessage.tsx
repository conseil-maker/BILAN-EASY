/**
 * ChatMessage - Composant d'affichage d'un message dans le chat
 * 
 * Affiche un message de l'utilisateur ou de l'IA avec le style approprié.
 * Gère les états de chargement et d'erreur.
 * 
 * @author Manus AI
 * @date 22 janvier 2026
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  userName?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, userName }) => {
  const { t } = useTranslation('questionnaire');
  const isUser = message.sender === 'user';
  const isLoading = message.isLoading;
  const isError = message.isError;
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-primary-600 text-white rounded-br-sm' 
            : isError
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
              : isLoading
                ? 'bg-slate-100 text-slate-500 rounded-bl-sm animate-pulse'
                : 'bg-white shadow-md text-slate-800 rounded-bl-sm'
        }`}
      >
        {/* Nom de l'expéditeur */}
        <p className={`text-xs font-medium mb-1 ${
          isUser ? 'text-primary-200' : isError ? 'text-red-500' : 'text-primary-600'
        }`}>
          {isUser ? (userName || t('chatMessage.you')) : `🤖 ${t('chatMessage.aiAssistant')}`}
        </p>
        
        {/* Contenu du message */}
        <div className="whitespace-pre-wrap break-words">
          {typeof message.text === 'string' ? (
            <p>{message.text}</p>
          ) : (
            message.text
          )}
        </div>
        
        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
